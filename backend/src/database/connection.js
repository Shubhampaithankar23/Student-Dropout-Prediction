const { Sequelize } = require('sequelize');
const path = require('path');
const logger = require('../utils/logger');

let sequelize;

const dialect = process.env.DB_DIALECT || 'sqlite';

if (dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || path.join(__dirname, '../../eduguard.db'),
    logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  });
} else {
  sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://localhost:5432/eduguard_db', {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false,
    },
  });
}

module.exports = { sequelize };
