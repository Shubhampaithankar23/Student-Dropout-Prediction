const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { Op } = require('sequelize');
const { CounselingSession, Student, User, Notification } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createAuditLog } = require('../middleware/auditLog');

router.get('/', authenticate, authorize('admin', 'counselor'), async (req, res) => {
  const { page = 1, limit = 20, status, priority } = req.query;
  const where = {};
  if (req.user.role === 'counselor') where.counselorId = req.user.id;
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await CounselingSession.findAndCountAll({
    where,
    order: [['sessionDate', 'DESC']],
    limit: parseInt(limit),
    offset,
    include: [
      { model: Student, as: 'student', attributes: ['id', 'name', 'studentId', 'riskLevel', 'riskScore'] },
      { model: User, as: 'counselor', attributes: ['id', 'name', 'email'] },
    ],
  });

  res.json({ sessions: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) });
});

router.post('/', authenticate, authorize('admin', 'counselor'), [
  body('studentId').isUUID(),
  body('sessionDate').isISO8601(),
  body('sessionType').isIn(['Academic', 'Personal', 'Financial', 'Career', 'Mental Health']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  validate,
], async (req, res) => {
  const student = await Student.findByPk(req.body.studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const session = await CounselingSession.create({
    ...req.body,
    counselorId: req.user.role === 'counselor' ? req.user.id : req.body.counselorId || req.user.id,
  });

  await createAuditLog(req.user.id, 'CREATE', 'CounselingSession', session.id, {}, req);
  res.status(201).json({ message: 'Session scheduled', session });
});

router.put('/:id', authenticate, authorize('admin', 'counselor'), async (req, res) => {
  const session = await CounselingSession.findByPk(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  await session.update(req.body);
  await createAuditLog(req.user.id, 'UPDATE', 'CounselingSession', session.id, {}, req);
  res.json({ message: 'Session updated', session });
});

router.delete('/:id', authenticate, authorize('admin', 'counselor'), async (req, res) => {
  const session = await CounselingSession.findByPk(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  await session.destroy();
  res.json({ message: 'Session deleted' });
});

router.get('/at-risk', authenticate, authorize('admin', 'counselor'), async (req, res) => {
  const highRisk = await Student.findAll({
    where: { riskLevel: 'High', isActive: true },
    order: [['riskScore', 'DESC']],
    limit: 50,
    include: [{ model: CounselingSession, as: 'counselingSessions', limit: 1, order: [['createdAt', 'DESC']] }],
  });

  res.json({ students: highRisk });
});

module.exports = router;
