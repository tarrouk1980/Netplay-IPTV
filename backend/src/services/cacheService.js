'use strict';

// Redis cache with in-memory fallback
class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.redis = null;
    this.stats = { hits: 0, misses: 0, sets: 0 };
    this.tryConnectRedis();
  }

  async tryConnectRedis() {
    try {
      if (!process.env.REDIS_URL) return;
      const Redis = require('ioredis');
      this.redis = new Redis(process.env.REDIS_URL, { lazyConnect: true, connectTimeout: 3000 });
      await this.redis.connect();
      console.log('[Cache] Redis connected');
    } catch {
      console.log('[Cache] Redis unavailable, using memory cache');
      this.redis = null;
    }
  }

  async get(key) {
    try {
      if (this.redis) {
        const val = await this.redis.get(key);
        if (val) { this.stats.hits++; return JSON.parse(val); }
      } else {
        const item = this.memoryCache.get(key);
        if (item && Date.now() < item.expires) { this.stats.hits++; return item.value; }
      }
    } catch {}
    this.stats.misses++;
    return null;
  }

  async set(key, value, ttlSeconds = 900) {
    try {
      this.stats.sets++;
      if (this.redis) {
        await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
      } else {
        this.memoryCache.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
      }
    } catch {}
  }

  async del(key) {
    try {
      if (this.redis) await this.redis.del(key);
      else this.memoryCache.delete(key);
    } catch {}
  }

  async getOrFetch(key, fetchFn, ttlSeconds = 900) {
    const cached = await this.get(key);
    if (cached) return cached;
    const fresh = await fetchFn();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return { ...this.stats, hitRate: total > 0 ? `${Math.round(this.stats.hits/total*100)}%` : '0%', backend: this.redis ? 'redis' : 'memory', keys: this.memoryCache.size };
  }
}

module.exports = new CacheService();
