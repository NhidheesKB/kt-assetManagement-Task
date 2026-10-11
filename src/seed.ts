import { sequelize, connectDB } from './config/database.js';

async function seed() {
  await connectDB();
  await sequelize.query(`CREATE SEQUENCE IF NOT EXISTS asset_code_seq START WITH 1 INCREMENT BY 1;`);
  await sequelize.query(`CREATE SEQUENCE IF NOT EXISTS employee_code_seq START WITH 1 INCREMENT BY 1;`);
  await sequelize.sync({ alter: true });
  await sequelize.close();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
