'use strict';

const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket');
const { redisClient } = require('./config/redis');
const { prisma } = require('./config/db');
const config = require('./config/env');

const server = http.createServer(app);
initSocket(server);

server.listen(config.port, () => {
  console.log(`EASYWAY Backend running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Server] SIGTERM received — shutting down gracefully...');
  try {
    await prisma.$disconnect();
    redisClient.disconnect();
    server.close(() => {
      console.log('[Server] HTTP server closed');
      process.exit(0);
    });
  } catch (err) {
    console.error('[Server] Error during shutdown:', err);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('[Server] SIGINT received — shutting down gracefully...');
  try {
    await prisma.$disconnect();
    redisClient.disconnect();
    server.close(() => process.exit(0));
  } catch (err) {
    process.exit(1);
  }
});

module.exports = server;
