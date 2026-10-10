import dotenv from 'dotenv';
dotenv.config();

// Ensure high-entropy JWT secret in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'bizfinance_jwt_default_secret_key_2026') {
    throw new Error('FATAL SECURITY CONFIGURATION: JWT_SECRET must be explicitly set with a high-entropy secret key in production.');
  }
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'bizfinance_jwt_default_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '12h',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
