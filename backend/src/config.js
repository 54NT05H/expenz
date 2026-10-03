import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const env = process.env.NODE_ENV || 'development';

export const config = {
  env,
  isProduction: env === 'production',
  isTest: env === 'test',
  port: Number(process.env.PORT) || 5001,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  // backend/data/expenz.db unless DB_PATH says otherwise (tests use ':memory:')
  dbPath: process.env.DB_PATH || path.resolve(import.meta.dirname, '..', 'data', 'expenz.db'),
  sessionMs: 7 * 24 * 60 * 60 * 1000, // sessions last 7 days
};
