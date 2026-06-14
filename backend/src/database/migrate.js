require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { sequelize } = require('./connection');
require('../models');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database...');
    await sequelize.sync({ force: process.argv.includes('--force') });
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
