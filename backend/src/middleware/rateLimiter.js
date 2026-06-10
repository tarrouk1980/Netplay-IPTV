'use strict';

// In-memory rate limiter (use redis-based in production)
const requests = new Map();

module.exports = function rateLimiter(maxRequests = 100, windowMs = 60000) {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    const userRequests = (requests.get(key) || []).filter(t => t > windowStart);
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({ success: false, message: 'Trop de requêtes. Réessayez dans 1 minute.' });
    }
    userRequests.push(now);
    requests.set(key, userRequests);
    next();
  };
};
