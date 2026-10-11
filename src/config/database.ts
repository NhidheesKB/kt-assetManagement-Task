import { Sequelize } from 'sequelize';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.DB_DATABASE!;
const dbUser = process.env.DB_USER!;
const dbPassword = process.env.DB_PASSWORD!;
const dbHost = process.env.DB_HOST!;
const dbPort = Number(process.env.DB_PORT!);
const caCert = process.env.ca?.replace(/\\n/g, '\n')!;

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  dialectModule: pg,
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
      ...(caCert ? { ca: caCert } : {}),
    },
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    // await sequelize.sync({ alter: true })
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Unable to connect database:', error);
    throw error;
  }
};
