const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  resource: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  resourceId: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  details: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  ipAddress: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('success', 'failure'),
    defaultValue: 'success',
  },
}, {
  tableName: 'audit_logs',
  timestamps: true,
  updatedAt: false,
});

module.exports = AuditLog;
