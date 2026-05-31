'use strict';
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const prisma = new PrismaClient();
const router = express.Router();

// ─── In-memory promo store (replace with PromoCode Prisma model when schema updated) ───
const PROMO_CODES = [
  {
    code: 'BIENVENUE',
    type: 'PERCENT',        // 'PERCENT' | 'FIXED'
    value: 20,              // 20% off
    maxUses: 1000,
    usedCount: 0,
    services: ['TAXI', 'SOS', 'DELIVERY', 'GROCERY'],
    minAmount: 3,
    expiresAt: null,        // null = no expiry
    label: '20% de réduction sur votre première commande',
  },
  {
    code: 'TAXI10',
    type: 'PERCENT',
    value: 10,
    maxUses: 500,
    usedCount: 0,
    services: ['TAXI'],
    minAmount: 5,
    expiresAt: null,
    label: '10% sur les courses taxi',
  },
  {
    code: 'SOS5',
    type: 'FIXED',
    value: 5,
    maxUses: 200,
    usedCount: 0,
    services: ['SOS'],
    minAmount: 20,
    expiresAt: null,
    label: '5 TND de réduction sur dépannage',
  },
  {
    code: 'LIVRAISON0',
    type: 'FIXED',
    value: 2,
    maxUses: 300,
    usedCount: 0,
    services: ['DELIVERY'],
    minAmount: 0,
    expiresAt: null,
    label: 'Livraison à -2 TND',
  },
];

// Track user usage (in-memory — replace with DB column)
const userUsage = new Map(); // `${userId}:${code}` → count

function findPromo(code) {
  return PROMO_CODES.find((p) => p.code === code.toUpperCase());
}

function computeDiscount(promo, amount) {
  if (promo.type === 'PERCENT') {
    return parseFloat(((amount * promo.value) / 100).toFixed(3));
  }
  return Math.min(promo.value, amount); // fixed, capped at amount
}

// POST /api/promo/apply — validate code and return discount
router.post('/apply', authenticate, async (req, res) => {
  const { code, serviceType, amount } = req.body;
  if (!code) return res.status(400).json({ error: 'Code requis' });

  const promo = findPromo(code);
  if (!promo) return res.status(404).json({ error: 'Code invalide ou expiré.' });

  // Check expiry
  if (promo.expiresAt && new Date() > new Date(promo.expiresAt)) {
    return res.status(410).json({ error: 'Ce code a expiré.' });
  }

  // Check max uses
  if (promo.maxUses && promo.usedCount >= promo.maxUses) {
    return res.status(410).json({ error: 'Ce code n\'est plus disponible.' });
  }

  // Check service type
  if (serviceType && promo.services.length > 0 && !promo.services.includes(serviceType)) {
    return res.status(422).json({ error: `Ce code n'est valable que pour : ${promo.services.join(', ')}.` });
  }

  // Check minimum amount
  if (promo.minAmount && parseFloat(amount) < promo.minAmount) {
    return res.status(422).json({ error: `Montant minimum : ${promo.minAmount} TND.` });
  }

  // Check per-user usage (max 1 per user per code)
  const usageKey = `${req.user.id}:${promo.code}`;
  const timesUsed = userUsage.get(usageKey) || 0;
  if (timesUsed >= 1 && promo.code !== 'TAXI10' && promo.code !== 'LIVRAISON0') {
    return res.status(409).json({ error: 'Vous avez déjà utilisé ce code.' });
  }

  const discount = computeDiscount(promo, parseFloat(amount) || 0);
  const finalAmount = Math.max(0, parseFloat(amount) - discount);

  res.json({
    success: true,
    code: promo.code,
    label: promo.label,
    discount,
    finalAmount,
    type: promo.type,
    value: promo.value,
  });
});

// POST /api/promo/confirm — mark code as used after order created
router.post('/confirm', authenticate, async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code requis' });

  const promo = findPromo(code);
  if (!promo) return res.json({ success: false });

  const usageKey = `${req.user.id}:${promo.code}`;
  userUsage.set(usageKey, (userUsage.get(usageKey) || 0) + 1);
  promo.usedCount += 1;

  res.json({ success: true });
});

// GET /api/promo/list — public list of active promos (pour page promo)
router.get('/list', authenticate, (req, res) => {
  const now = new Date();
  const active = PROMO_CODES
    .filter((p) => (!p.expiresAt || new Date(p.expiresAt) > now) && p.usedCount < (p.maxUses || Infinity))
    .map(({ code, label, services, minAmount, type, value }) => ({
      code, label, services, minAmount, type, value,
    }));
  res.json(active);
});

// ─── Admin routes ────────────────────────────────────────────────

// GET /api/promo/admin — list all codes with stats
router.get('/admin', authenticate, (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  res.json(PROMO_CODES);
});

// POST /api/promo/admin/create — create a new promo code
router.post('/admin/create', authenticate, (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  const { code, type, value, maxUses, label, services } = req.body;
  if (!code || !type || !value) return res.status(400).json({ error: 'code, type and value are required' });
  const upper = code.toUpperCase();
  if (PROMO_CODES.find(p => p.code === upper)) {
    return res.status(409).json({ error: 'Code already exists' });
  }
  const newPromo = {
    code: upper,
    type,
    value: parseFloat(value),
    maxUses: parseInt(maxUses, 10) || 100,
    usedCount: 0,
    services: services || ['TAXI', 'SOS', 'DELIVERY', 'GROCERY'],
    minAmount: 0,
    expiresAt: null,
    label: label || upper,
    active: true,
  };
  PROMO_CODES.push(newPromo);
  res.status(201).json(newPromo);
});

// PATCH /api/promo/admin/:code — update active status
router.patch('/admin/:code', authenticate, (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  const promo = PROMO_CODES.find(p => p.code === req.params.code.toUpperCase());
  if (!promo) return res.status(404).json({ error: 'Code not found' });
  if (req.body.active !== undefined) promo.active = !!req.body.active;
  res.json(promo);
});

// DELETE /api/promo/admin/:code
router.delete('/admin/:code', authenticate, (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  const idx = PROMO_CODES.findIndex(p => p.code === req.params.code.toUpperCase());
  if (idx === -1) return res.status(404).json({ error: 'Code not found' });
  PROMO_CODES.splice(idx, 1);
  res.json({ success: true });
});

// GET /api/promo/my-codes — user's used promo codes (stub)
router.get('/my-codes', authenticate, async (req, res) => {
  try {
    // In production this would query a PromoCodeUsage table
    res.json({ codes: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
