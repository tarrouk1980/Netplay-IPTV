'use strict';

/**
 * Health Check Script & Route Handler
 *
 * Returns: { status, version, services: { db, redis }, uptime, timestamp }
 *
 * Usage as script: node src/scripts/healthCheck.js
 * Usage as route:  const { healthHandler } = require('./scripts/healthCheck');
 *                  app.get('/health', healthHandler);
 */

const { Pool } = require('pg');

// ─── DB ping ────────────────────────────────────────────────────────────────
async function checkDatabase() {
  if (!process.env.DATABASE_URL) return 'unconfigured';
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 3000 });
  try {
    await pool.query('SELECT 1');
    return 'ok';
  } catch (err) {
    console.error('[healthCheck] DB error:', err.message);
    return 'error';
  } finally {
    await pool.end().catch(() => {});
  }
}

// ─── Redis ping ──────────────────────────────────────────────────────────────
async function checkRedis() {
  if (!process.env.REDIS_URL) return 'unconfigured';
  let client;
  try {
    // Try ioredis first, fall back gracefully if not installed
    const Redis = require('ioredis'); // eslint-disable-line
    client = new Redis(process.env.REDIS_URL, { lazyConnect: true, connectTimeout: 3000, maxRetriesPerRequest: 1 });
    await client.connect();
    await client.ping();
    return 'ok';
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') return 'unconfigured';
    console.error('[healthCheck] Redis error:', err.message);
    return 'error';
  } finally {
    if (client) client.disconnect();
  }
}

// ─── Main health check ───────────────────────────────────────────────────────
async function getHealthStatus() {
  const [db, redis] = await Promise.all([checkDatabase(), checkRedis()]);

  const allOk = db !== 'error' && redis !== 'error';

  return {
    status: allOk ? 'ok' : 'degraded',
    version: process.env.npm_package_version || '1.0.0',
    services: { db, redis },
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}

// ─── Express route handler ───────────────────────────────────────────────────
async function healthHandler(req, res) {
  try {
    const health = await getHealthStatus();
    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (err) {
    res.status(503).json({
      status: 'error',
      version: '1.0.0',
      services: { db: 'error', redis: 'error' },
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      error: err.message,
    });
  }
}

module.exports = { healthHandler, getHealthStatus, checkDatabase, checkRedis };

// ─── Run standalone ──────────────────────────────────────────────────────────
if (require.main === module) {
  require('dotenv').config();
  getHealthStatus().then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.status === 'ok' ? 0 : 1);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
