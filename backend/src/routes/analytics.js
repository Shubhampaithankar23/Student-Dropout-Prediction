const express = require('express');
const router = express.Router();
const { Op, fn, col, literal } = require('sequelize');
const { Student, Prediction } = require('../models');
const { sequelize } = require('../database/connection');
const { authenticate } = require('../middleware/auth');

router.get('/overview', authenticate, async (req, res) => {
  const where = {};
  if (req.user.role === 'teacher') where.addedBy = req.user.id;

  const [riskDist, genderDist, financialDist, deptDist] = await Promise.all([
    Student.findAll({
      attributes: ['riskLevel', [fn('COUNT', col('id')), 'count']],
      where: { ...where, isActive: true },
      group: ['riskLevel'],
    }),
    Student.findAll({
      attributes: ['gender', [fn('COUNT', col('id')), 'count']],
      where: { ...where, isActive: true },
      group: ['gender'],
    }),
    Student.findAll({
      attributes: ['financialStatus', [fn('COUNT', col('id')), 'count']],
      where: { ...where, isActive: true },
      group: ['financialStatus'],
    }),
    Student.findAll({
      attributes: ['department', [fn('COUNT', col('id')), 'count']],
      where: { ...where, isActive: true, department: { [Op.ne]: null } },
      group: ['department'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 10,
    }),
  ]);

  res.json({
    riskDistribution: riskDist.map(r => ({ name: r.riskLevel, value: parseInt(r.dataValues.count) })),
    genderDistribution: genderDist.map(r => ({ name: r.gender, value: parseInt(r.dataValues.count) })),
    financialDistribution: financialDist.map(r => ({ name: r.financialStatus, value: parseInt(r.dataValues.count) })),
    departmentDistribution: deptDist.map(r => ({ name: r.department, value: parseInt(r.dataValues.count) })),
  });
});

router.get('/trends', authenticate, async (req, res) => {
  const { months = 6 } = req.query;
  const where = {};
  if (req.user.role === 'teacher') where.addedBy = req.user.id;

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - parseInt(months));

  // SQLite-compatible monthly aggregation
  const students = await Student.findAll({
    where: { ...where, isActive: true, createdAt: { [Op.gte]: startDate } },
    attributes: ['createdAt', 'riskLevel', 'cgpa', 'attendancePercentage'],
    order: [['createdAt', 'ASC']],
  });

  // Group by month in JS
  const monthMap = {};
  students.forEach(s => {
    const d = new Date(s.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthMap[key]) monthMap[key] = { month: key, total: 0, high_risk: 0, medium_risk: 0, low_risk: 0, cgpaSum: 0, attSum: 0 };
    monthMap[key].total++;
    if (s.riskLevel === 'High') monthMap[key].high_risk++;
    else if (s.riskLevel === 'Medium') monthMap[key].medium_risk++;
    else monthMap[key].low_risk++;
    monthMap[key].cgpaSum += parseFloat(s.cgpa || 0);
    monthMap[key].attSum += parseFloat(s.attendancePercentage || 0);
  });

  const trends = Object.values(monthMap).map(m => ({
    month: m.month,
    total: m.total,
    high_risk: m.high_risk,
    medium_risk: m.medium_risk,
    low_risk: m.low_risk,
    avg_cgpa: m.total ? (m.cgpaSum / m.total).toFixed(2) : 0,
    avg_attendance: m.total ? (m.attSum / m.total).toFixed(2) : 0,
  }));

  res.json({ trends });
});

router.get('/performance', authenticate, async (req, res) => {
  const where = {};
  if (req.user.role === 'teacher') where.addedBy = req.user.id;

  const stats = await Student.findOne({
    attributes: [
      [fn('AVG', col('cgpa')), 'avgCgpa'],
      [fn('AVG', col('attendancePercentage')), 'avgAttendance'],
      [fn('AVG', col('assignmentSubmissionRate')), 'avgAssignment'],
      [fn('AVG', col('lmsActivityScore')), 'avgLms'],
      [fn('AVG', col('internalMarks')), 'avgInternalMarks'],
      [fn('MIN', col('cgpa')), 'minCgpa'],
      [fn('MAX', col('cgpa')), 'maxCgpa'],
    ],
    where: { ...where, isActive: true },
  });

  res.json({ performance: stats });
});

module.exports = router;
