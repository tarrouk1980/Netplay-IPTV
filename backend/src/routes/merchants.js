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
    body('category').isIn(['RESTAURANT', 'PHARMACY', 'SUPERMARKET', 'BEAUTY', 'PETS', 'HIGHTECH', 'ELECTRO', 'CAR_RENTAL', 'OTHER']),
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

    const { name, address, lat, lng, isOpen, metadata } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (address !== undefined) data.address = address;
    if (lat !== undefined) data.lat = lat;
    if (lng !== undefined) data.lng = lng;
    if (isOpen !== undefined) data.isOpen = isOpen;
    if (metadata !== undefined && typeof metadata === 'object') {
      data.metadata = { ...(merchant.metadata || {}), ...metadata };
    }

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
    body('stock').optional().isInt({ min: 0 }),
    body('promoPrice').optional().isFloat({ min: 0 }),
    body('promoLabel').optional().trim(),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant profile not found', code: 'NOT_FOUND' });
    }

    const { name, description, price, category, imageUrl, stock, promoPrice, promoLabel, metadata } = req.body;

    const mergedMetadata = {
      ...(metadata && typeof metadata === 'object' ? metadata : {}),
      ...(promoPrice ? { promoPrice: promoPrice.toString(), promoLabel: promoLabel || null } : {}),
    };

    const product = await prisma.product.create({
      data: {
        merchantId: merchant.id,
        name,
        description: description || null,
        price: price.toString(),
        category,
        imageUrl: imageUrl || null,
        stock: stock !== undefined ? parseInt(stock) : 0,
        metadata: Object.keys(mergedMetadata).length ? mergedMetadata : undefined,
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
    body('stock').optional().isInt({ min: 0 }),
    body('active').optional().isBoolean(),
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

    const { name, description, price, category, imageUrl, stock, active, metadata } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = price.toString();
    if (category !== undefined) data.category = category;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (stock !== undefined) data.stock = parseInt(stock);
    if (active !== undefined) data.active = active;
    if (metadata !== undefined && typeof metadata === 'object') {
      data.metadata = { ...(product.metadata || {}), ...metadata };
    }

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

// GET /api/merchants/me/orders — orders for this merchant
router.get('/me/orders', authenticate, requireRole('MARCHAND'), async (req, res) => {
  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant profile not found', code: 'NOT_FOUND' });
    }

    const where = {
      serviceType: 'GROCERY',
      metadata: { path: ['merchantIds'], array_contains: merchant.id },
    };
    if (req.query.status) where.status = req.query.status;

    const orders = await prisma.order.findMany({
      where,
      include: { client: { select: { id: true, name: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.json({ orders });
  } catch (err) {
    console.error('[merchants/me/orders]', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// PATCH /api/merchants/me/orders/:orderId/status — update order status
router.patch(
  '/me/orders/:orderId/status',
  authenticate,
  requireRole('MARCHAND'),
  [body('status').isIn(['ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])],
  async (req, res) => {
    if (!validate(req, res)) return;
    try {
      const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
      if (!merchant) {
        return res.status(404).json({ error: 'Merchant profile not found', code: 'NOT_FOUND' });
      }

      const order = await prisma.order.findFirst({
        where: {
          id: req.params.orderId,
          serviceType: 'GROCERY',
          metadata: { path: ['merchantIds'], array_contains: merchant.id },
        },
      });
      if (!order) return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });

      const data = { status: req.body.status };
      if (req.body.status === 'COMPLETED') data.completedAt = new Date();

      const updated = await prisma.order.update({ where: { id: order.id }, data });
      return res.json({ order: updated });
    } catch (err) {
      console.error('[merchants/me/orders/status]', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
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

    // Orders reference merchants via metadata.merchantIds (grocery checkout), not a direct column.
    const merchantOrderFilter = (extra) => ({
      serviceType: 'GROCERY',
      metadata: { path: ['merchantIds'], array_contains: merchant?.id },
      ...extra,
    });

    const [todayOrders, monthOrders, pendingOrders] = await Promise.all([
      prisma.order.findMany({
        where: merchantOrderFilter({ status: 'COMPLETED', completedAt: { gte: startOfDay } }),
        select: { finalPrice: true, price: true },
      }),
      prisma.order.findMany({
        where: merchantOrderFilter({ status: 'COMPLETED', completedAt: { gte: startOfMonth } }),
        select: { finalPrice: true, price: true },
      }),
      prisma.order.count({
        where: merchantOrderFilter({ status: 'PENDING' }),
      }),
    ]);

    const orderAmount = (o) => Number(o.finalPrice ?? o.price ?? 0);
    const todayRevenue = todayOrders.reduce((s, o) => s + orderAmount(o), 0);
    const monthRevenue = monthOrders.reduce((s, o) => s + orderAmount(o), 0);

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
    query('category').optional().isIn(['RESTAURANT', 'PHARMACY', 'SUPERMARKET', 'BEAUTY', 'PETS', 'HIGHTECH', 'ELECTRO', 'CAR_RENTAL', 'OTHER']),
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

    const merchants = await prisma.merchant.findMany({
      where,
      include: {
        products: {
          where: { active: true },
          select: { id: true, name: true, price: true, category: true, metadata: true },
        },
      },
      orderBy: [{ isOpen: 'desc' }, { name: 'asc' }],
    });

    let result = promoOnly === 'true'
      ? merchants.filter((m) => m.products.some((p) => p.metadata && p.metadata.promoPrice))
      : merchants;

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
        where: { active: true },
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
