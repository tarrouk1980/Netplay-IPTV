'use strict';

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { sendWelcomeEmail } = require('../services/emailService');

// ---------------------------------------------------------------------------
// In-memory storage
// ---------------------------------------------------------------------------
// subscribers: Map<email, { email, lang, source, token, subscribedAt, active }>
const subscribers = new Map();

// rateLimiter: Map<ip, { count, resetAt }>
const ipRateMap = new Map();

const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = ipRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

function getIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

// ---------------------------------------------------------------------------
// POST /api/newsletter/subscribe
// Body: { email, lang?, source? }
// ---------------------------------------------------------------------------
router.post('/subscribe', async (req, res) => {
  const { email, lang = 'fr', source = 'web' } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Adresse email invalide.', code: 'INVALID_EMAIL' });
  }

  const ip = getIp(req);
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      error: 'Trop de tentatives. Réessayez dans une heure.',
      code: 'RATE_LIMIT_EXCEEDED',
    });
  }

  // Already subscribed
  if (subscribers.has(email)) {
    const sub = subscribers.get(email);
    if (sub.active) {
      return res.status(409).json({ error: 'Email déjà inscrit.', code: 'ALREADY_SUBSCRIBED' });
    }
    // Reactivate
    sub.active = true;
    sub.lang = lang;
    sub.source = source;
    sub.subscribedAt = new Date().toISOString();
    subscribers.set(email, sub);
    return res.json({ message: 'Réinscription réussie.', reactivated: true });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const subscriber = {
    email,
    lang: ['fr', 'es'].includes(lang) ? lang : 'fr',
    source,
    token,
    subscribedAt: new Date().toISOString(),
    active: true,
  };
  subscribers.set(email, subscriber);

  // Send welcome email (non-blocking — don't fail subscription on email error)
  const name = email.split('@')[0];
  sendWelcomeEmail(email, name, subscriber.lang).catch(err =>
    console.error('[Newsletter] Welcome email failed:', err.message)
  );

  return res.status(201).json({ message: 'Inscription réussie ! Vérifiez votre boîte mail.' });
});

// ---------------------------------------------------------------------------
// GET /api/newsletter/unsubscribe?token=xxx
// ---------------------------------------------------------------------------
router.get('/unsubscribe', (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: 'Token manquant.', code: 'MISSING_TOKEN' });
  }

  let found = null;
  for (const [email, sub] of subscribers.entries()) {
    if (sub.token === token) {
      found = { email, sub };
      break;
    }
  }

  if (!found) {
    return res.status(404).json({ error: 'Token invalide ou expiré.', code: 'INVALID_TOKEN' });
  }

  found.sub.active = false;
  subscribers.set(found.email, found.sub);

  return res.json({ message: 'Vous avez bien été désabonné(e). À bientôt !' });
});

// ---------------------------------------------------------------------------
// GET /api/newsletter/stats  (admin — protected by simple secret header)
// ---------------------------------------------------------------------------
router.get('/stats', (req, res) => {
  const adminSecret = process.env.ADMIN_SECRET || 'easyhotels-admin';
  const providedSecret = req.headers['x-admin-secret'];
  if (providedSecret !== adminSecret) {
    return res.status(403).json({ error: 'Accès refusé.', code: 'FORBIDDEN' });
  }

  const allSubs = Array.from(subscribers.values());
  const active = allSubs.filter(s => s.active);
  const byLang = active.reduce((acc, s) => {
    acc[s.lang] = (acc[s.lang] || 0) + 1;
    return acc;
  }, {});
  const bySource = active.reduce((acc, s) => {
    acc[s.source] = (acc[s.source] || 0) + 1;
    return acc;
  }, {});

  return res.json({
    total: allSubs.length,
    active: active.length,
    inactive: allSubs.length - active.length,
    byLang,
    bySource,
    latestSubscribers: active
      .sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt))
      .slice(0, 10)
      .map(s => ({ email: s.email, lang: s.lang, source: s.source, subscribedAt: s.subscribedAt })),
  });
});

module.exports = router;
