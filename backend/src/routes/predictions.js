const express = require('express');
const router = express.Router();
const { Student, Prediction, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { predictDropoutRisk } = require('../utils/mlPredictor');
const { createAuditLog } = require('../middleware/auditLog');

router.post('/predict/:studentId', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  const student = await Student.findByPk(req.params.studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const prediction = predictDropoutRisk(student.toJSON());

  const savedPrediction = await Prediction.create({
    studentId: student.id,
    predictedBy: req.user.id,
    riskLevel: prediction.riskLevel,
    riskScore: prediction.riskScore,
    confidence: prediction.confidence,
    factors: prediction.factors,
    recommendations: prediction.recommendations,
    inputData: student.toJSON(),
  });

  await student.update({
    riskLevel: prediction.riskLevel,
    riskScore: prediction.riskScore,
    predictionConfidence: prediction.confidence,
  });

  await createAuditLog(req.user.id, 'PREDICT', 'Student', student.id, { riskLevel: prediction.riskLevel }, req);

  res.json({ prediction: savedPrediction, result: prediction });
});

router.get('/student/:studentId', authenticate, async (req, res) => {
  const predictions = await Prediction.findAll({
    where: { studentId: req.params.studentId },
    order: [['createdAt', 'DESC']],
    include: [{ model: User, as: 'predictor', attributes: ['name', 'email'] }],
  });
  res.json({ predictions });
});

router.get('/history', authenticate, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count, rows } = await Prediction.findAndCountAll({
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset,
    include: [
      { model: Student, as: 'student', attributes: ['name', 'studentId', 'department'] },
      { model: User, as: 'predictor', attributes: ['name'] },
    ],
  });

  res.json({ predictions: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) });
});

module.exports = router;
