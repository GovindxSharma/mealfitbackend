import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5050', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mealfit',
  jwtSecret: process.env.JWT_SECRET || 'mealfit_default_dev_secret_key_2026',
  corsOrigins: (process.env.CORS_ORIGIN || '*')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean),
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',
};
