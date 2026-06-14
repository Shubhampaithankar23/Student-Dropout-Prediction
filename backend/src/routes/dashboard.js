const express = require('express');
const router = express.Router();
const { Op, fn, col, literal } = require('sequelize');
const { User, Student, Prediction, CounselingSession, Notification } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/stats', authenticate, async (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  if (req.user.role === 'admin') {
    const [totalStudents, totalTeachers, totalCounselors, highRiskStudents, recentStudents, riskDistribution] = await Promise.all([
      Student.count({ where: { isActive: true } }),
      User.count({ where: { role: 'teacher', isActive: true } }),
      User.count({ where: { role: 'counselor', isActive: true } }),
      Student.count({ where: { riskLevel: 'High', isActive: true } }),
      Student.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo }, isActive: true } }),
      Student.findAll({
        attributes: ['riskLevel', [fn('COUNT', col('id')), 'count']],
        where: { isActive: true },
        group: ['riskLevel'],
      }),
    ]);

    return res.json({
      totalStudents,
      totalTeachers,
      totalCounselors,
      highRiskStudents,
      recentStudents,
      riskDistribution: riskDistribution.map(r => ({ level: r.riskLevel, count: parseInt(r.dataValues.count) })),
    });
  }

  if (req.user.role === 'teacher') {
    const where = { addedBy: req.user.id, isActive: true };
    const [totalStudents, highRiskStudents, mediumRiskStudents, recentStudents] = await Promise.all([
      Student.count({ where }),
      Student.count({ where: { ...where, riskLevel: 'High' } }),
      Student.count({ where: { ...where, riskLevel: 'Medium' } }),
      Student.count({ where: { ...where, createdAt: { [Op.gte]: thirtyDaysAgo } } }),
    ]);
    return res.json({ totalStudents, highRiskStudents, mediumRiskStudents, recentStudents });
  }

  if (req.user.role === 'counselor') {
    const [totalSessions, pendingSessions, highRiskStudents, completedSessions] = await Promise.all([
      CounselingSession.count({ where: { counselorId: req.user.id } }),
      CounselingSession.count({ where: { counselorId: req.user.id, status: 'Scheduled' } }),
      Student.count({ where: { riskLevel: 'High', isActive: true } }),
      CounselingSession.count({ where: { counselorId: req.user.id, status: 'Completed' } }),
    ]);
    return res.json({ totalSessions, pendingSessions, highRiskStudents, completedSessions });
  }
});

router.get('/recent-activity', authenticate, async (req, res) => {
  const recentStudents = await Student.findAll({
    order: [['createdAt', 'DESC']],
    limit: 5,
    where: req.user.role === 'teacher' ? { addedBy: req.user.id } : {},
  });

  const recentPredictions = await Prediction.findAll({
    order: [['createdAt', 'DESC']],
    limit: 5,
    include: [{ model: Student, as: 'student', attributes: ['name', 'studentId'] }],
  });

  res.json({ recentStudents, recentPredictions });
});

module.exports = router;
