'use strict';

const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { haversineKm } = require('../services/deliveryPricing');

const router = express.Router();

function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    return false;
  }
  return true;
}

// POST /api/merchants/register — MARCHAND registers
router.post(
  '/register',
  authenticate,
  requireRole('MARCHAND'),
  [
    body('name').trim().notEmpty(),
    body('category').isIn(['RESTAURANT', 'PHARMACY', 'SUPERMARKET', 'BEAUTY', 'PETS', 'HIGHTECH', 'ELECTRO', 'OTHER']),
    body('address').trim().notEmpty(),
    body('lat').isFloat({ min: -90, max: 90 }),
    body('lng').isFloat({ min: -180, max: 180 }),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;
    const { name, category, address, lat, lng } = req.body;

    const merchant = await prisma.merchant.upsert({
      where: { userId: req.user.id },
      update: { name, category, address, lat, lng },
      create: { userId: req.user.id, name, category, address, lat, lng },
    });

    return res.status(201).json({ merchant });
  }
);

// GET /api/merchants/me
router.get('/me', authenticate, requireRole('MARCHAND'), async (req, res) => {
  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user.id },
    include: { products: { orderBy: { category: 'asc' } } },
  });

  if (!merchant) {
    return res.status(404).json({ error: 'Merchant profile not found', code: 'NOT_FOUND' });
  }

  return res.json({ merchant });
});

// PATCH /api/merchants/me
router.patch(
  '/me',
  authenticate,
  requireRole('MARCHAND'),
  [
    body('name').optional().trim().notEmpty(),
    body('address').optional().trim().notEmpty(),
    body('lat').optional().isFloat({ min: -90, max: 90 }),
    body('lng').optional().isFloat({ min: -180, max: 180 }),
    body('isOpen').optional().isBoolean(),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant profile not found', code: 'NOT_FOUND' });
    }

    const { name, address, lat, lng, isOpen } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (address !== undefined) data.address = address;
    if (lat !== undefined) data.lat = lat;
    if (lng !== undefined) data.lng = lng;
    if (isOpen !== undefined) data.isOpen = isOpen;

    const updated = await prisma.merchant.update({ where: { id: merchant.id }, data });
    return res.json({ merchant: updated });
  }
);

// PATCH /api/merchants/me/toggle — open/close boutique
router.patch('/me/toggle', authenticate, requireRole('MARCHAND'), async (req, res) => {
  const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
  if (!merchant) {
    return res.status(404).json({ error: 'Merchant profile not found', code: 'NOT_FOUND' });
  }

  const updated = await prisma.merchant.update({
    where: { id: merchant.id },
    data: { isOpen: !merchant.isOpen },
  });

  return res.json({ merchant: updated, isOpen: updated.isOpen });
});

// GET /api/merchants/me/products
router.get('/me/products', authenticate, requireRole('MARCHAND'), async (req, res) => {
  const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
  if (!merchant) {
    return res.status(404).json({ error: 'Merchant profile not found', code: 'NOT_FOUND' });
  }

  const products = await prisma.product.findMany({
    where: { merchantId: merchant.id },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  return res.json({ products });
});

// POST /api/merchants/me/products
router.post(
  '/me/products',
  authenticate,
  requireRole('MARCHAND'),
  [
    body('name').trim().notEmpty(),
    body('description').optional().trim(),
    body('price').isFloat({ min: 0 }),
    body('category').trim().notEmpty(),
    body('imageUrl').optional().isURL(),
    body('promoPrice').optional().isFloat({ min: 0 }),
    body('promoLabel').optional().trim(),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant profile not found', code: 'NOT_FOUND' });
    }

    const { name, description, price, category, imageUrl, promoPrice, promoLabel } = req.body;

    const product = await prisma.product.create({
      data: {
        merchantId: merchant.id,
        name,
        description: description || null,
        price: price.toString(),
        category,
        imageUrl: imageUrl || null,
        metadata: promoPrice ? { promoPrice: promoPrice.toString(), promoLabel: promoLabel || null } : undefined,
      },
    });

    return res.status(201).json({ product });
  }
);

// PATCH /api/merchants/me/products/:productId
router.patch(
  '/me/products/:productId',
  authenticate,
  requireRole('MARCHAND'),
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('price').optional().isFloat({ min: 0 }),
    body('category').optional().trim().notEmpty(),
    body('imageUrl').optional().isURL(),
    body('available').optional().isBoolean(),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant profile not found', code: 'NOT_FOUND' });
    }

    const product = await prisma.product.findFirst({
      where: { id: req.params.productId, merchantId: merchant.id },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found', code: 'NOT_FOUND' });
    }

    const { name, description, price, category, imageUrl, available } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = price.toString();
    if (category !== undefined) data.category = category;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (available !== undefined) data.available = available;

    const updated = await prisma.product.update({ where: { id: product.id }, data });
    return res.json({ product: updated });
  }
);

// DELETE /api/merchants/me/products/:productId
router.delete(
  '/me/products/:productId',
  authenticate,
  requireRole('MARCHAND'),
  async (req, res) => {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant profile not found', code: 'NOT_FOUND' });
    }

    const product = await prisma.product.findFirst({
      where: { id: req.params.productId, merchantId: merchant.id },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found', code: 'NOT_FOUND' });
    }

    await prisma.product.delete({ where: { id: product.id } });
    return res.json({ success: true });
  }
);

// GET /api/merchants/stats
router.get('/stats', authenticate, requireRole('MARCHAND'), async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const merchant = await prisma.merchant.findUnique({
      where: { userId: req.user.id },
    });

    const [todayOrders, monthOrders, pendingOrders] = await Promise.all([
      prisma.order.findMany({
        where: { merchantId: merchant?.id, status: 'COMPLETED', completedAt: { gte: startOfDay } },
        select: { totalAmount: true },
      }),
      prisma.order.findMany({
        where: { merchantId: merchant?.id, status: 'COMPLETED', completedAt: { gte: startOfMonth } },
        select: { totalAmount: true },
      }),
      prisma.order.count({
        where: { merchantId: merchant?.id, status: 'PENDING' },
      }),
    ]);

    const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);
    const monthRevenue = monthOrders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);

    return res.json({
      todayOrders: todayOrders.length,
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      monthOrders: monthOrders.length,
      monthRevenue: Math.round(monthRevenue * 100) / 100,
      pendingOrders,
      rating: 4.7, // TODO: compute from ratings table when available
    });
  } catch (err) {
    console.error('[merchants/stats]', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// GET /api/merchants — public list (filterable)
router.get(
  '/',
  [
    query('category').optional().isIn(['RESTAURANT', 'PHARMACY', 'SUPERMARKET', 'BEAUTY', 'PETS', 'HIGHTECH', 'ELECTRO', 'OTHER']),
    query('promoOnly').optional().isBoolean(),
    query('lat').optional().isFloat({ min: -90, max: 90 }),
    query('lng').optional().isFloat({ min: -180, max: 180 }),
    query('radius').optional().isFloat({ min: 0.1, max: 100 }),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    const { category, lat, lng, radius, promoOnly } = req.query;
    const where = {};
    if (category) where.category = category;
    if (promoOnly === 'true') where.hasPromo = true;

    const merchants = await prisma.merchant.findMany({
      where,
      include: {
        products: {
          where: { available: true },
          select: { id: true, name: true, price: true, category: true, metadata: true },
        },
      },
      orderBy: [{ isOpen: 'desc' }, { name: 'asc' }],
    });

    let result = merchants;

    if (lat && lng && radius) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radiusKm = parseFloat(radius);

      result = merchants
        .map((m) => ({
          ...m,
          distanceKm: haversineKm(userLat, userLng, m.lat, m.lng),
        }))
        .filter((m) => m.distanceKm <= radiusKm)
        .sort((a, b) => {
          if (a.isOpen !== b.isOpen) return b.isOpen - a.isOpen;
          return a.distanceKm - b.distanceKm;
        });
    }

    return res.json({ merchants: result, count: result.length });
  }
);

// GET /api/merchants/:id — merchant details + products
router.get('/:id', async (req, res) => {
  const merchant = await prisma.merchant.findUnique({
    where: { id: req.params.id },
    include: {
      products: {
        where: { available: true },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      },
    },
  });

  if (!merchant) {
    return res.status(404).json({ error: 'Merchant not found', code: 'NOT_FOUND' });
  }

  return res.json({ merchant });
});

module.exports = router;
