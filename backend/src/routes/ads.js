'use strict';

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

const BOOST_PRICES = {
  SPONSORED_CARD: 5,
  BANNER_TOP: 15,
};

function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    return false;
  }
  return true;
}

function nowBetween() {
  const now = new Date();
  return { startDate: { lte: now }, endDate: { gte: now } };
}

// ─────────────────────────────────────────────
// PUBLIC: GET /ads?placement=HOME&limit=3
// ─────────────────────────────────────────────
router.get(
  '/',
  [
    query('placement').optional().isIn(['HOME', 'DELIVERY', 'GROCERY', 'TAXI', 'ALL']),
    query('limit').optional().isInt({ min: 1, max: 20 }),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    const placement = req.query.placement;
    const limit = parseInt(req.query.limit || '5', 10);
    const now = new Date();

    const where = {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
      ...(placement ? { OR: [{ placement }, { placement: 'ALL' }] } : {}),
    };

    const ads = await prisma.advertisement.findMany({
      where,
      include: { merchant: { select: { id: true, name: true, isBoosted: true } } },
      orderBy: [{ merchant: { isBoosted: 'desc' } }, { createdAt: 'desc' }],
      take: limit * 3,
    });

    const shuffled = ads.sort((a, b) => {
      const aBoost = a.merchant?.isBoosted ? 1 : 0;
      const bBoost = b.merchant?.isBoosted ? 1 : 0;
      if (aBoost !== bBoost) return bBoost - aBoost;
      return Math.random() - 0.5;
    });

    return res.json({ ads: shuffled.slice(0, limit), count: shuffled.slice(0, limit).length });
  }
);

// ─────────────────────────────────────────────
// PUBLIC: POST /ads/:id/impression
// ─────────────────────────────────────────────
router.post('/:id/impression', async (req, res) => {
  try {
    await prisma.advertisement.update({
      where: { id: req.params.id },
      data: { impressions: { increment: 1 } },
    });
    return res.json({ success: true });
  } catch {
    return res.status(404).json({ error: 'Ad not found', code: 'NOT_FOUND' });
  }
});

// ─────────────────────────────────────────────
// PUBLIC: POST /ads/:id/click
// ─────────────────────────────────────────────
router.post('/:id/click', async (req, res) => {
  try {
    await prisma.advertisement.update({
      where: { id: req.params.id },
      data: { clicks: { increment: 1 } },
    });
    return res.json({ success: true });
  } catch {
    return res.status(404).json({ error: 'Ad not found', code: 'NOT_FOUND' });
  }
});

// ─────────────────────────────────────────────
// ADMIN: POST /ads — créer une pub
// ─────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  [
    body('title').trim().notEmpty(),
    body('imageUrl').isURL(),
    body('targetUrl').optional().isURL(),
    body('type').isIn(['BANNER_TOP', 'BANNER_INLINE', 'SPONSORED_CARD', 'INTERSTITIAL']),
    body('placement').isIn(['HOME', 'DELIVERY', 'GROCERY', 'TAXI', 'ALL']),
    body('merchantId').optional().isUUID(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('budgetTND').isDecimal(),
    body('cpmRate').optional().isDecimal(),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    const { title, imageUrl, targetUrl, type, placement, merchantId, startDate, endDate, budgetTND, cpmRate } = req.body;

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ error: 'endDate must be after startDate', code: 'INVALID_DATES' });
    }

    const ad = await prisma.advertisement.create({
      data: {
        title,
        imageUrl,
        targetUrl: targetUrl || null,
        type,
        placement,
        merchantId: merchantId || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budgetTND,
        ...(cpmRate ? { cpmRate } : {}),
      },
    });

    return res.status(201).json({ ad });
  }
);

// ─────────────────────────────────────────────
// ADMIN: GET /ads/admin/all
// ─────────────────────────────────────────────
router.get('/admin/all', authenticate, requireRole('ADMIN'), async (req, res) => {
  const ads = await prisma.advertisement.findMany({
    include: { merchant: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const withStats = ads.map((ad) => ({
    ...ad,
    ctr: ad.impressions > 0 ? parseFloat(((ad.clicks / ad.impressions) * 100).toFixed(2)) : 0,
    costTND: parseFloat(((ad.impressions / 1000) * parseFloat(ad.cpmRate)).toFixed(3)),
  }));

  return res.json({ ads: withStats, count: withStats.length });
});

// ─────────────────────────────────────────────
// ADMIN: PATCH /ads/:id
// ─────────────────────────────────────────────
router.patch(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  [
    body('title').optional().trim().notEmpty(),
    body('imageUrl').optional().isURL(),
    body('targetUrl').optional().isURL(),
    body('isActive').optional().isBoolean(),
    body('budgetTND').optional().isDecimal(),
    body('cpmRate').optional().isDecimal(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    const { title, imageUrl, targetUrl, isActive, budgetTND, cpmRate, startDate, endDate } = req.body;

    try {
      const ad = await prisma.advertisement.update({
        where: { id: req.params.id },
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(imageUrl !== undefined ? { imageUrl } : {}),
          ...(targetUrl !== undefined ? { targetUrl } : {}),
          ...(isActive !== undefined ? { isActive } : {}),
          ...(budgetTND !== undefined ? { budgetTND } : {}),
          ...(cpmRate !== undefined ? { cpmRate } : {}),
          ...(startDate !== undefined ? { startDate: new Date(startDate) } : {}),
          ...(endDate !== undefined ? { endDate: new Date(endDate) } : {}),
        },
      });
      return res.json({ ad });
    } catch {
      return res.status(404).json({ error: 'Ad not found', code: 'NOT_FOUND' });
    }
  }
);

// ─────────────────────────────────────────────
// ADMIN: DELETE /ads/:id — soft delete
// ─────────────────────────────────────────────
router.delete('/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.advertisement.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    return res.json({ success: true });
  } catch {
    return res.status(404).json({ error: 'Ad not found', code: 'NOT_FOUND' });
  }
});

// ─────────────────────────────────────────────
// MARCHAND: POST /ads/boost
// ─────────────────────────────────────────────
router.post(
  '/boost',
  authenticate,
  requireRole('MARCHAND'),
  [
    body('days').isIn([1, 3, 7]),
    body('type').isIn(['SPONSORED_CARD', 'BANNER_TOP']),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    const { days, type } = req.body;

    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant profile not found', code: 'NOT_FOUND' });
    }

    const pricePerDay = BOOST_PRICES[type];
    const budgetTND = pricePerDay * days;
    const startDate = new Date();
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const [ad] = await prisma.$transaction([
      prisma.advertisement.create({
        data: {
          title: `${merchant.name} — Sponsorisé`,
          imageUrl: '',
          type,
          placement: 'ALL',
          merchantId: merchant.id,
          startDate,
          endDate,
          budgetTND: budgetTND.toString(),
          isActive: true,
        },
      }),
      prisma.merchant.update({
        where: { id: merchant.id },
        data: { isBoosted: true, boostedUntil: endDate },
      }),
    ]);

    return res.status(201).json({
      ad,
      boost: { days, type, pricePerDay, totalTND: budgetTND, boostedUntil: endDate },
      paymentStatus: 'STUB_PENDING',
    });
  }
);

// ─────────────────────────────────────────────
// MARCHAND: GET /ads/merchant/mine
// ─────────────────────────────────────────────
router.get('/merchant/mine', authenticate, requireRole('MARCHAND'), async (req, res) => {
  const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
  if (!merchant) {
    return res.status(404).json({ error: 'Merchant profile not found', code: 'NOT_FOUND' });
  }

  const ads = await prisma.advertisement.findMany({
    where: { merchantId: merchant.id },
    orderBy: { createdAt: 'desc' },
  });

  const withStats = ads.map((ad) => ({
    ...ad,
    ctr: ad.impressions > 0 ? parseFloat(((ad.clicks / ad.impressions) * 100).toFixed(2)) : 0,
    costTND: parseFloat(((ad.impressions / 1000) * parseFloat(ad.cpmRate)).toFixed(3)),
    isRunning: ad.isActive && new Date() >= ad.startDate && new Date() <= ad.endDate,
  }));

  return res.json({ ads: withStats, merchant: { isBoosted: merchant.isBoosted, boostedUntil: merchant.boostedUntil } });
});

module.exports = router;
