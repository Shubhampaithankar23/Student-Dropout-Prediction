const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('info', 'warning', 'danger', 'success'),
    defaultValue: 'info',
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  relatedId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  relatedType: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'notifications',
  timestamps: true,
});

module.exports = Notification;
