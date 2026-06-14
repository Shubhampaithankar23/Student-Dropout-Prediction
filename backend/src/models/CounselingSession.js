const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const CounselingSession = sequelize.define('CounselingSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  counselorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  sessionDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  sessionType: {
    type: DataTypes.ENUM('Academic', 'Personal', 'Financial', 'Career', 'Mental Health'),
    defaultValue: 'Academic',
  },
  status: {
    type: DataTypes.ENUM('Scheduled', 'Completed', 'Cancelled', 'Pending'),
    defaultValue: 'Scheduled',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  followUpDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  outcome: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    defaultValue: 'Medium',
  },
}, {
  tableName: 'counseling_sessions',
  timestamps: true,
});

module.exports = CounselingSession;
