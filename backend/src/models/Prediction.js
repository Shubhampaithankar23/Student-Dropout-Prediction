const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Prediction = sequelize.define('Prediction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  predictedBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  riskLevel: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    allowNull: false,
  },
  riskScore: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: false,
  },
  confidence: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: false,
  },
  factors: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  recommendations: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  modelVersion: {
    type: DataTypes.STRING(20),
    defaultValue: '1.0.0',
  },
  inputData: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'predictions',
  timestamps: true,
});

module.exports = Prediction;
