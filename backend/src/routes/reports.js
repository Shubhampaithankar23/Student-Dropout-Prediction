const express = require('express');
const router = express.Router();
const { fn, col, Op } = require('sequelize');
const { Student, Prediction, CounselingSession } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

router.get('/students/excel', authenticate, async (req, res) => {
  const where = {};
  if (req.user.role === 'teacher') where.addedBy = req.user.id;
  if (req.query.riskLevel) where.riskLevel = req.query.riskLevel;

  const students = await Student.findAll({ where, order: [['riskLevel', 'DESC'], ['riskScore', 'DESC']] });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'EduGuard AI';
  
  const sheet = workbook.addWorksheet('Students', {
    properties: { tabColor: { argb: 'FFE50914' } },
  });

  sheet.columns = [
    { header: 'Student ID', key: 'studentId', width: 15 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Age', key: 'age', width: 8 },
    { header: 'Gender', key: 'gender', width: 10 },
    { header: 'Department', key: 'department', width: 20 },
    { header: 'CGPA', key: 'cgpa', width: 8 },
    { header: 'Attendance %', key: 'attendancePercentage', width: 15 },
    { header: 'Assignment Rate', key: 'assignmentSubmissionRate', width: 16 },
    { header: 'LMS Score', key: 'lmsActivityScore', width: 12 },
    { header: 'Internal Marks', key: 'internalMarks', width: 14 },
    { header: 'Backlogs', key: 'backlogs', width: 10 },
    { header: 'Financial Status', key: 'financialStatus', width: 16 },
    { header: 'Risk Level', key: 'riskLevel', width: 12 },
    { header: 'Risk Score', key: 'riskScore', width: 12 },
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE50914' } };

  students.forEach(s => {
    const row = sheet.addRow(s.toJSON());
    if (s.riskLevel === 'High') {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE0E0' } };
    } else if (s.riskLevel === 'Medium') {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3E0' } };
    }
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=students-report.xlsx');
  await workbook.xlsx.write(res);
  res.end();
});

router.get('/students/pdf', authenticate, async (req, res) => {
  const where = {};
  if (req.user.role === 'teacher') where.addedBy = req.user.id;
  if (req.query.riskLevel) where.riskLevel = req.query.riskLevel;

  const students = await Student.findAll({ where, order: [['riskLevel', 'DESC']] });

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=students-report.pdf');
  doc.pipe(res);

  // Header
  doc.fontSize(24).fillColor('#E50914').text('EduGuard AI', { align: 'center' });
  doc.fontSize(14).fillColor('#333333').text('Student Dropout Risk Report', { align: 'center' });
  doc.fontSize(10).fillColor('#666666').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
  doc.moveDown();

  // Stats summary
  const highRisk = students.filter(s => s.riskLevel === 'High').length;
  const mediumRisk = students.filter(s => s.riskLevel === 'Medium').length;
  const lowRisk = students.filter(s => s.riskLevel === 'Low').length;

  doc.fontSize(12).fillColor('#333333').text(`Total Students: ${students.length}  |  High Risk: ${highRisk}  |  Medium Risk: ${mediumRisk}  |  Low Risk: ${lowRisk}`);
  doc.moveDown();

  // Table header
  doc.fontSize(10).fillColor('#FFFFFF')
    .rect(50, doc.y, 495, 20).fill('#E50914')
    .fillColor('#FFFFFF')
    .text('ID', 55, doc.y - 15)
    .text('Name', 110, doc.y - 15)
    .text('CGPA', 280, doc.y - 15)
    .text('Attendance', 330, doc.y - 15)
    .text('Risk', 440, doc.y - 15);
  
  doc.moveDown(0.5);

  students.slice(0, 40).forEach((s, i) => {
    const y = doc.y;
    const bgColor = s.riskLevel === 'High' ? '#FFE0E0' : s.riskLevel === 'Medium' ? '#FFF3E0' : '#F0FFF0';
    doc.rect(50, y, 495, 18).fill(bgColor);
    doc.fillColor('#333333').fontSize(9)
      .text(s.studentId, 55, y + 4)
      .text(s.name.substring(0, 25), 110, y + 4)
      .text(s.cgpa.toString(), 280, y + 4)
      .text(`${s.attendancePercentage}%`, 330, y + 4)
      .text(s.riskLevel, 440, y + 4);
    doc.moveDown(0.2);
  });

  doc.end();
});

module.exports = router;
