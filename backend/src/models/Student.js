const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { isEmail: true },
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 15, max: 60 },
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 1, max: 12 },
  },
  attendancePercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: { min: 0, max: 100 },
  },
  cgpa: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false,
    validate: { min: 0, max: 10 },
  },
  assignmentSubmissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: { min: 0, max: 100 },
  },
  lmsActivityScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: { min: 0, max: 100 },
  },
  internalMarks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: { min: 0, max: 100 },
  },
  backlogs: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 },
  },
  participationScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: { min: 0, max: 100 },
  },
  financialStatus: {
    type: DataTypes.ENUM('Good', 'Average', 'Poor'),
    defaultValue: 'Average',
  },
  dropoutStatus: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  riskLevel: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    defaultValue: 'Low',
  },
  riskScore: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
  },
  predictionConfidence: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
  },
  addedBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'students',
  timestamps: true,
});

module.exports = Student;
