'use strict';

const { Server } = require('socket.io');
const { redisSub, redisClient } = require('../config/redis');
const { verifyAccess } = require('../services/tokenService');

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) return next(new Error('Authentication error: no token provided'));
    try {
      const user = verifyAccess(token);
      socket.user = user;
      next();
    } catch (e) {
      next(new Error('Authentication error: ' + e.message));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.user.id} (${socket.user.role})`);

    // Join personal room
    socket.join(`user:${socket.user.id}`);

    // Join service room for targeted broadcasts
    socket.on('join:service', (serviceType) => {
      const validTypes = ['TAXI', 'SOS', 'DELIVERY', 'GROCERY'];
      if (validTypes.includes(serviceType)) {
        socket.join(`service:${serviceType}`);
        console.log(`[Socket] ${socket.user.id} joined service:${serviceType}`);
      }
    });

    socket.on('leave:service', (serviceType) => {
      socket.leave(`service:${serviceType}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.user.id}`);
    });

    socket.on('error', (err) => {
      console.error(`[Socket] Error for ${socket.user.id}:`, err);
    });
  });

  // Subscribe to Redis geo updates channel
  redisSub.subscribe('geo:updates', (err) => {
    if (err) console.error('[Socket/Redis] Failed to subscribe to geo:updates:', err);
    else console.log('[Socket/Redis] Subscribed to geo:updates channel');
  });

  redisSub.on('message', (channel, message) => {
    if (channel === 'geo:updates') {
      try {
        const data = JSON.parse(message);
        io.to(`service:${data.serviceType}`).emit('location:update', data);
      } catch (err) {
        console.error('[Socket/Redis] Failed to parse geo:updates message:', err);
      }
    }
  });

  return io;
}

module.exports = { initSocket };
