'use strict';

const Redis = require('ioredis');
const config = require('./env');

function createRedisClient(name) {
  const client = new Redis(config.redisUrl, {
    lazyConnect: false,
    retryStrategy: (times) => {
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  });

  client.on('connect', () => console.log(`[Redis:${name}] Connected`));
  client.on('ready', () => console.log(`[Redis:${name}] Ready`));
  client.on('error', (err) => console.error(`[Redis:${name}] Error:`, err.message));
  client.on('close', () => console.warn(`[Redis:${name}] Connection closed`));
  client.on('reconnecting', () => console.log(`[Redis:${name}] Reconnecting...`));

  return client;
}

const redisClient = createRedisClient('main');
const redisSub = createRedisClient('sub');

module.exports = { redisClient, redisSub };
