import http from 'http';
import { createApp } from './app';
import { config } from './config/env';
import { connectDatabase, closeDatabase } from './config/db';
import { seedAdminUsers } from './modules/auth/auth.seeder';

const startServer = async () => {
  const app = createApp();
  const server = http.createServer(app);

  // Attempt database connection & seed admin
  await connectDatabase();
  await seedAdminUsers().catch(() => {});

  server.listen(config.port, '0.0.0.0', () => {
    console.log(`
=====================================================
🚀 MealFit Backend API Started Successfully!
=====================================================
📍 Port:        ${config.port}
🌍 Environment: ${config.nodeEnv}
🩺 Health Check: http://localhost:${config.port}/api/health
🔍 Deep Status:  http://localhost:${config.port}/api/health/details
📖 API Docs:     http://localhost:${config.port}/
=====================================================
    `);
  });

  // Graceful Shutdown Handlers
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      console.log('🔒 HTTP server closed');
      await closeDatabase();
      console.log('👋 Process terminated safely');
      process.exit(0);
    });

    // Force shutdown if taking longer than 10 seconds
    setTimeout(() => {
      console.error('⚠️ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer().catch((err) => {
  console.error('❌ Fatal server startup error:', err);
  process.exit(1);
});
