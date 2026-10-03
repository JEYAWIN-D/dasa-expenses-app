import app from './app.js';
import { ENV } from '../config/env.js';
import { connectDatabase, prisma } from '../config/prisma.js';

async function startServer() {
  await connectDatabase();

  const server = app.listen(ENV.PORT, '0.0.0.0', () => {
    console.log(`🚀 Quotation & Billing Backend API server running on port ${ENV.PORT}`);
    console.log(`📡 Environment: ${ENV.NODE_ENV}`);
    console.log(`🔗 API Base URL: http://127.0.0.1:${ENV.PORT}/api`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log('PostgreSQL Prisma connection closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((error) => {
  console.error('Fatal startup error:', error);
  process.exit(1);
});
