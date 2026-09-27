import { PrismaClient } from '@prisma/client';
import { ENV } from './env.js';

export const prisma = new PrismaClient({
  log: ENV.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✔ Connected successfully to PostgreSQL database via Prisma');
  } catch (error) {
    console.error('✖ Failed to connect to PostgreSQL database:', error.message);
    process.exit(1);
  }
}
