const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { body, query } = require('express-validator');
const { Op } = require('sequelize');
const { sequelize } = require('../database/connection');
const { Student, Prediction, Notification, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { predictDropoutRisk } = require('../utils/mlPredictor');
const { createAuditLog } = require('../middleware/auditLog');
const { sendHighRiskAlert } = require('../utils/email');
const logger = require('../utils/logger');

const caseInsensitiveLike = sequelize.getDialect() === 'postgres' ? Op.iLike : Op.like;

const upload = multer({
  dest: path.join(__dirname, '../../uploads/csv'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// Get all students
router.get('/', authenticate, async (req, res) => {
  const { page = 1, limit = 20, search, riskLevel, gender, financialStatus, department, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
  
  const where = { isActive: true };
  if (search) {
    where[Op.or] = [
      { name: { [caseInsensitiveLike]: `%${search}%` } },
      { studentId: { [caseInsensitiveLike]: `%${search}%` } },
      { email: { [caseInsensitiveLike]: `%${search}%` } },
    ];
  }
  if (riskLevel) where.riskLevel = riskLevel;
  if (gender) where.gender = gender;
  if (financialStatus) where.financialStatus = financialStatus;
  if (department) where.department = { [caseInsensitiveLike]: `%${department}%` };

  // Teachers see only their students
  if (req.user.role === 'teacher') {
    where.addedBy = req.user.id;
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await Student.findAndCountAll({
    where,
    order: [[sortBy, sortOrder]],
    limit: parseInt(limit),
    offset,
    include: [{ model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }],
  });

  res.json({
    students: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / parseInt(limit)),
  });
});

// Get single student
router.get('/:id', authenticate, async (req, res) => {
  const student = await Student.findByPk(req.params.id, {
    include: [
      { model: Prediction, as: 'predictions', order: [['createdAt', 'DESC']], limit: 10 },
      { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] },
    ],
  });

  if (!student) return res.status(404).json({ error: 'Student not found' });
  
  res.json({ student });
});

// Create student
router.post('/', authenticate, authorize('admin', 'teacher'), [
  body('studentId').trim().notEmpty().withMessage('Student ID required'),
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('age').isInt({ min: 15, max: 60 }),
  body('gender').isIn(['Male', 'Female', 'Other']),
  body('attendancePercentage').isFloat({ min: 0, max: 100 }),
  body('cgpa').isFloat({ min: 0, max: 10 }),
  body('assignmentSubmissionRate').isFloat({ min: 0, max: 100 }),
  body('lmsActivityScore').isFloat({ min: 0, max: 100 }),
  body('internalMarks').isFloat({ min: 0, max: 100 }),
  body('backlogs').isInt({ min: 0 }),
  body('participationScore').isFloat({ min: 0, max: 100 }),
  body('financialStatus').isIn(['Good', 'Average', 'Poor']),
  validate,
], async (req, res) => {
  const existingStudent = await Student.findOne({ where: { studentId: req.body.studentId } });
  if (existingStudent) {
    return res.status(409).json({ error: 'Student ID already exists' });
  }

  // Run prediction
  const prediction = predictDropoutRisk(req.body);

  const student = await Student.create({
    ...req.body,
    addedBy: req.user.id,
    riskLevel: prediction.riskLevel,
    riskScore: prediction.riskScore,
    predictionConfidence: prediction.confidence,
  });

  // Save prediction record
  await Prediction.create({
    studentId: student.id,
    predictedBy: req.user.id,
    riskLevel: prediction.riskLevel,
    riskScore: prediction.riskScore,
    confidence: prediction.confidence,
    factors: prediction.factors,
    recommendations: prediction.recommendations,
    inputData: req.body,
  });

  // Send alert if high risk
  if (prediction.riskLevel === 'High') {
    const counselors = await User.findAll({ where: { role: 'counselor', isActive: true } });
    for (const counselor of counselors) {
      await sendHighRiskAlert(counselor, student).catch(err => logger.error('Alert email failed:', err));
      await Notification.create({
        userId: counselor.id,
        title: '⚠️ High Risk Student Alert',
        message: `${student.name} (${student.studentId}) has been identified as HIGH RISK with ${(prediction.riskScore * 100).toFixed(1)}% dropout probability.`,
        type: 'danger',
        relatedId: student.id,
        relatedType: 'student',
      });
    }
  }

  await createAuditLog(req.user.id, 'CREATE', 'Student', student.id, { studentId: student.studentId }, req);

  res.status(201).json({ message: 'Student added successfully', student, prediction });
});

// Update student
router.put('/:id', authenticate, authorize('admin', 'teacher'), [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('age').optional().isInt({ min: 15, max: 60 }),
  body('gender').optional().isIn(['Male', 'Female', 'Other']),
  body('attendancePercentage').optional().isFloat({ min: 0, max: 100 }),
  body('cgpa').optional().isFloat({ min: 0, max: 10 }),
  body('assignmentSubmissionRate').optional().isFloat({ min: 0, max: 100 }),
  body('lmsActivityScore').optional().isFloat({ min: 0, max: 100 }),
  body('internalMarks').optional().isFloat({ min: 0, max: 100 }),
  body('backlogs').optional().isInt({ min: 0 }),
  body('participationScore').optional().isFloat({ min: 0, max: 100 }),
  body('financialStatus').optional().isIn(['Good', 'Average', 'Poor']),
  body('semester').optional().isInt({ min: 1, max: 12 }),
  validate,
], async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  if (req.user.role === 'teacher' && student.addedBy !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to update this student' });
  }

  // Re-run prediction on update
  const prediction = predictDropoutRisk({ ...student.toJSON(), ...req.body });

  await student.update({
    ...req.body,
    riskLevel: prediction.riskLevel,
    riskScore: prediction.riskScore,
    predictionConfidence: prediction.confidence,
  });

  await Prediction.create({
    studentId: student.id,
    predictedBy: req.user.id,
    riskLevel: prediction.riskLevel,
    riskScore: prediction.riskScore,
    confidence: prediction.confidence,
    factors: prediction.factors,
    recommendations: prediction.recommendations,
    inputData: req.body,
  });

  await createAuditLog(req.user.id, 'UPDATE', 'Student', student.id, {}, req);

  res.json({ message: 'Student updated successfully', student, prediction });
});

// Delete student
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  
  await student.update({ isActive: false });
  await createAuditLog(req.user.id, 'DELETE', 'Student', student.id, {}, req);
  
  res.json({ message: 'Student removed successfully' });
});

// Restore soft-deleted student
router.patch('/:id/restore', authenticate, authorize('admin'), async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  if (student.isActive) return res.status(400).json({ error: 'Student is already active' });

  await student.update({ isActive: true });
  await createAuditLog(req.user.id, 'RESTORE', 'Student', student.id, { studentId: student.studentId }, req);
  res.json({ message: 'Student restored successfully', student });
});

// Get soft-deleted students (admin only)
router.get('/deleted/list', authenticate, authorize('admin'), async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await Student.findAndCountAll({
    where: { isActive: false },
    order: [['updatedAt', 'DESC']],
    limit: parseInt(limit),
    offset,
  });
  res.json({ students: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) });
});

// CSV Upload
router.post('/upload/csv', authenticate, authorize('admin', 'teacher'), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'CSV file required' });

  const results = [];
  const errors = [];
  let rowIndex = 0;

  await new Promise((resolve, reject) => {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        rowIndex++;
        results.push({ row: rowIndex, data: row });
      })
      .on('end', resolve)
      .on('error', reject);
  });

  // Clean up uploaded file
  fs.unlink(req.file.path, () => {});

  const created = [];
  const skipped = [];

  const t = await sequelize.transaction();
  try {
    for (const { row, data } of results) {
      try {
        const existing = await Student.findOne({ where: { studentId: data.studentId || data.student_id }, transaction: t });
        if (existing) { skipped.push({ row, reason: 'Student ID exists' }); continue; }

        const studentData = {
          studentId: data.studentId || data.student_id,
          name: data.name,
          email: data.email,
          age: parseInt(data.age),
          gender: data.gender,
          department: data.department,
          semester: data.semester ? parseInt(data.semester) : null,
          attendancePercentage: parseFloat(data.attendancePercentage || data.attendance_percentage || data.attendance),
          cgpa: parseFloat(data.cgpa || data.CGPA),
          assignmentSubmissionRate: parseFloat(data.assignmentSubmissionRate || data.assignment_submission_rate),
          lmsActivityScore: parseFloat(data.lmsActivityScore || data.lms_activity_score),
          internalMarks: parseFloat(data.internalMarks || data.internal_marks),
          backlogs: parseInt(data.backlogs || 0),
          participationScore: parseFloat(data.participationScore || data.participation_score),
          financialStatus: data.financialStatus || data.financial_status || 'Average',
          dropoutStatus: data.dropoutStatus === 'true' || data.dropout_status === 'true' || data.dropout_status === '1',
          addedBy: req.user.id,
        };

        const prediction = predictDropoutRisk(studentData);
        studentData.riskLevel = prediction.riskLevel;
        studentData.riskScore = prediction.riskScore;
        studentData.predictionConfidence = prediction.confidence;

        const student = await Student.create(studentData, { transaction: t });
        
        await Prediction.create({
          studentId: student.id,
          predictedBy: req.user.id,
          riskLevel: prediction.riskLevel,
          riskScore: prediction.riskScore,
          confidence: prediction.confidence,
          factors: prediction.factors,
          recommendations: prediction.recommendations,
          inputData: studentData,
        }, { transaction: t });

        created.push(student.studentId);
      } catch (err) {
        errors.push({ row, error: err.message });
      }
    }
    await t.commit();
  } catch (err) {
    await t.rollback();
    throw err;
  }

  await createAuditLog(req.user.id, 'CSV_UPLOAD', 'Student', null, { created: created.length, skipped: skipped.length, errors: errors.length }, req);

  res.json({
    message: 'CSV processed successfully',
    summary: { total: results.length, created: created.length, skipped: skipped.length, errors: errors.length },
    errors: errors.slice(0, 10),
  });
});

module.exports = router;
