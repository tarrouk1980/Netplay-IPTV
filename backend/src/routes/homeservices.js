'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { sendNotification, NOTIFICATION_TYPES } = require('../services/fcm');
const { findNearby } = require('../services/geolocation');

const router = express.Router();

const CATEGORIES = [
  { key: 'PLOMBIER', label: 'Plombier', icon: '🔧', remote: false },
  { key: 'ELECTRICIEN', label: 'Électricien', icon: '💡', remote: false },
  { key: 'MEDECIN', label: 'Médecin', icon: '🩺', remote: true },
  { key: 'AVOCAT', label: 'Avocat', icon: '⚖️', remote: true },
  { key: 'PEDAGOGUE', label: 'Pédagogue / Soutien scolaire', icon: '📚', remote: true },
  { key: 'COACH_SPORTIF', label: 'Coach sportif', icon: '🏋️', remote: true },
  { key: 'AUTRE', label: 'Autre service', icon: '🧰', remote: false },
];
const CATEGORY_KEYS = CATEGORIES.map((c) => c.key);
const REMOTE_CATEGORY_KEYS = CATEGORIES.filter((c) => c.remote).map((c) => c.key);

function getIo(req) {
  return req.app.get('io');
}

async function logEvent(orderId, eventType, payload = {}) {
  await prisma.orderEvent.create({ data: { orderId, eventType, payload } });
}

function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    return false;
  }
  return true;
}

// ─────────────────────────────────────────────
// GET /api/homeservices/categories
// ─────────────────────────────────────────────
router.get('/categories', (req, res) => {
  res.json({ categories: CATEGORIES });
});

// ─────────────────────────────────────────────
// CLIENT: POST /api/homeservices/request
// ─────────────────────────────────────────────
router.post(
  '/request',
  authenticate,
  requireRole('CLIENT'),
  [
    body('category').isIn(CATEGORY_KEYS).withMessage('Invalid category'),
    body('description').trim().notEmpty(),
    body('lat').isFloat({ min: -90, max: 90 }),
    body('lng').isFloat({ min: -180, max: 180 }),
    body('address').trim().notEmpty(),
    body('scheduledAt').optional().isISO8601(),
    body('consultationMode').optional().isIn(['PRESENTIEL', 'VIDEO']),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    const { category, description, lat, lng, address, scheduledAt, consultationMode } = req.body;
    const mode = REMOTE_CATEGORY_KEYS.includes(category) && consultationMode === 'VIDEO' ? 'VIDEO' : 'PRESENTIEL';

    const order = await prisma.order.create({
      data: {
        clientId: req.user.id,
        serviceType: 'HOME_SERVICE',
        status: 'PENDING',
        originLat: lat,
        originLng: lng,
        originAddress: address,
        metadata: {
          category,
          description,
          scheduledAt: scheduledAt || null,
          consultationMode: mode,
          notifiedProviders: [],
        },
      },
    });

    await logEvent(order.id, 'ORDER_CREATED', { clientId: req.user.id, category });

    let providers = [];
    try {
      const nearby = await findNearby(lat, lng, 20, 'HOME_SERVICE');
      const ids = nearby.slice(0, 10).map((p) => p.userId);
      if (ids.length > 0) {
        providers = await prisma.user.findMany({
          where: { id: { in: ids }, role: 'PRESTATAIRE', serviceCategory: category, kycStatus: 'APPROVED' },
          select: { id: true, fcmToken: true, name: true },
        });
      }
    } catch (err) {
      console.warn('[HomeServices] findNearby failed:', err.message);
    }

    if (providers.length > 0) {
      const tokens = providers.map((p) => p.fcmToken).filter(Boolean);
      if (tokens.length > 0) {
        await sendNotification(
          tokens,
          NOTIFICATION_TYPES.NEW_ORDER,
          'Nouvelle demande de service',
          `${category} — ${description}`.slice(0, 80),
          { orderId: order.id, category }
        );
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { metadata: { ...order.metadata, notifiedProviders: providers.map((p) => p.id) } },
      });

      const io = getIo(req);
      if (io) {
        providers.forEach((p) => {
          io.to(`user:${p.id}`).emit('homeservice:new_request', { orderId: order.id, category, address });
        });
      }
    }

    return res.status(201).json({ order, providersFound: providers.length });
  }
);

// ─────────────────────────────────────────────
// CLIENT: GET /api/homeservices/history
// ─────────────────────────────────────────────
router.get('/history', authenticate, requireRole('CLIENT'), async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { clientId: req.user.id, serviceType: 'HOME_SERVICE' },
    orderBy: { createdAt: 'desc' },
    include: { events: { orderBy: { createdAt: 'asc' } } },
  });
  return res.json({ orders, count: orders.length });
});

// ─────────────────────────────────────────────
// PRESTATAIRE: GET /api/homeservices/requests — pending requests in own category
// ─────────────────────────────────────────────
router.get('/requests', authenticate, requireRole('PRESTATAIRE'), async (req, res) => {
  if (!req.user.serviceCategory) {
    return res.status(400).json({ error: 'No service category set on profile', code: 'NO_CATEGORY' });
  }

  const orders = await prisma.order.findMany({
    where: {
      serviceType: 'HOME_SERVICE',
      status: 'PENDING',
      metadata: { path: ['category'], equals: req.user.serviceCategory },
    },
    orderBy: { createdAt: 'desc' },
    include: { client: { select: { id: true, name: true } } },
    take: 30,
  });

  return res.json({ orders, count: orders.length });
});

// ─────────────────────────────────────────────
// PRESTATAIRE: GET /api/homeservices/assignments
// ─────────────────────────────────────────────
router.get('/assignments', authenticate, requireRole('PRESTATAIRE'), async (req, res) => {
  const orders = await prisma.order.findMany({
    where: {
      serviceType: 'HOME_SERVICE',
      providerId: req.user.id,
      status: { in: ['ACCEPTED', 'IN_PROGRESS'] },
    },
    orderBy: { createdAt: 'desc' },
    include: { client: { select: { id: true, name: true, phone: true } } },
  });
  return res.json({ orders, count: orders.length });
});

// ─────────────────────────────────────────────
// GET /api/homeservices/:id
// ─────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      client: { select: { id: true, name: true, phone: true } },
      provider: { select: { id: true, name: true, phone: true, avgRating: true } },
      events: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!order || order.serviceType !== 'HOME_SERVICE') {
    return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
  }

  const isParty = order.clientId === req.user.id || order.providerId === req.user.id;
  const isAdmin = req.user.role === 'ADMIN';
  if (!isParty && !isAdmin) {
    return res.status(403).json({ error: 'Access denied', code: 'FORBIDDEN' });
  }

  return res.json({ order });
});

// ─────────────────────────────────────────────
// PRESTATAIRE: POST /api/homeservices/:id/quote — propose a price
// ─────────────────────────────────────────────
router.post(
  '/:id/quote',
  authenticate,
  requireRole('PRESTATAIRE'),
  [body('price').isFloat({ min: 0 })],
  async (req, res) => {
    if (!validate(req, res)) return;

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order || order.serviceType !== 'HOME_SERVICE') {
      return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
    }
    if (order.status !== 'PENDING') {
      return res.status(409).json({ error: `Order is already ${order.status}`, code: 'INVALID_STATE' });
    }

    const quotes = [...(order.metadata?.quotes || []), {
      providerId: req.user.id,
      providerName: req.user.name,
      price: parseFloat(req.body.price),
      createdAt: new Date().toISOString(),
    }];

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { metadata: { ...order.metadata, quotes } },
    });

    await logEvent(order.id, 'QUOTE_SUBMITTED', { providerId: req.user.id, price: req.body.price });

    const io = getIo(req);
    if (io) io.to(`user:${order.clientId}`).emit('homeservice:quote', { orderId: order.id, quotes });

    return res.json({ order: updated });
  }
);

// ─────────────────────────────────────────────
// CLIENT: POST /api/homeservices/:id/accept — client accepts a provider's quote
// ─────────────────────────────────────────────
router.post('/:id/accept', authenticate, requireRole('CLIENT'), async (req, res) => {
  const { providerId } = req.body;
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order || order.serviceType !== 'HOME_SERVICE') {
    return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
  }
  if (order.clientId !== req.user.id) {
    return res.status(403).json({ error: 'Not your order', code: 'FORBIDDEN' });
  }
  if (order.status !== 'PENDING') {
    return res.status(409).json({ error: `Order is already ${order.status}`, code: 'INVALID_STATE' });
  }

  const quote = (order.metadata?.quotes || []).find((q) => q.providerId === providerId);
  if (!quote) {
    return res.status(404).json({ error: 'Quote not found', code: 'QUOTE_NOT_FOUND' });
  }

  const videoCallUrl = order.metadata?.consultationMode === 'VIDEO'
    ? `https://meet.jit.si/EasyServices-${order.id}`
    : null;

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'ACCEPTED',
      providerId,
      finalPrice: quote.price,
      metadata: { ...order.metadata, acceptedQuote: quote, videoCallUrl },
    },
  });

  await logEvent(order.id, 'ORDER_ACCEPTED', { providerId, price: quote.price });

  const provider = await prisma.user.findUnique({ where: { id: providerId }, select: { fcmToken: true } });
  if (provider?.fcmToken) {
    await sendNotification(
      [provider.fcmToken],
      NOTIFICATION_TYPES.ORDER_ACCEPTED,
      'Devis accepté !',
      'Le client a accepté votre devis.',
      { orderId: order.id }
    );
  }

  const io = getIo(req);
  if (io) io.to(`user:${providerId}`).emit('homeservice:accepted', { orderId: order.id });

  return res.json({ order: updated });
});

// ─────────────────────────────────────────────
// PRESTATAIRE: POST /api/homeservices/:id/start — provider on site
// ─────────────────────────────────────────────
router.post('/:id/start', authenticate, requireRole('PRESTATAIRE'), async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order || order.serviceType !== 'HOME_SERVICE') {
    return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
  }
  if (order.providerId !== req.user.id) {
    return res.status(403).json({ error: 'Not your assignment', code: 'FORBIDDEN' });
  }
  if (order.status !== 'ACCEPTED') {
    return res.status(409).json({ error: 'Order must be ACCEPTED to start', code: 'INVALID_STATE' });
  }

  const updated = await prisma.order.update({ where: { id: order.id }, data: { status: 'IN_PROGRESS' } });
  await logEvent(order.id, 'PROVIDER_ARRIVED', { providerId: req.user.id });

  const io = getIo(req);
  if (io) io.to(`user:${order.clientId}`).emit('homeservice:in_progress', { orderId: order.id });

  return res.json({ order: updated });
});

// ─────────────────────────────────────────────
// PRESTATAIRE: POST /api/homeservices/:id/complete
// ─────────────────────────────────────────────
router.post('/:id/complete', authenticate, requireRole('PRESTATAIRE'), async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { client: { select: { fcmToken: true } } },
  });
  if (!order || order.serviceType !== 'HOME_SERVICE') {
    return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
  }
  if (order.providerId !== req.user.id) {
    return res.status(403).json({ error: 'Not your assignment', code: 'FORBIDDEN' });
  }
  if (order.status !== 'IN_PROGRESS') {
    return res.status(409).json({ error: 'Order must be IN_PROGRESS to complete', code: 'INVALID_STATE' });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });

  await logEvent(order.id, 'SERVICE_COMPLETED', { providerId: req.user.id });

  try {
    const POINTS = 5;
    await prisma.$transaction([
      prisma.user.update({ where: { id: order.clientId }, data: { loyaltyPoints: { increment: POINTS } } }),
      prisma.loyaltyTransaction.create({
        data: { userId: order.clientId, points: POINTS, description: 'Service EasyServices complété', type: 'EARN' },
      }),
    ]);
  } catch {}

  const clientToken = order.client?.fcmToken;
  if (clientToken) {
    await sendNotification(
      [clientToken],
      NOTIFICATION_TYPES.ORDER_COMPLETED,
      'Service terminé !',
      'Votre prestataire a terminé l\'intervention.',
      { orderId: order.id }
    );
  }

  const io = getIo(req);
  if (io) io.to(`user:${order.clientId}`).emit('homeservice:completed', { orderId: order.id });

  return res.json({ order: updated });
});

// ─────────────────────────────────────────────
// CLIENT: POST /api/homeservices/:id/cancel
// ─────────────────────────────────────────────
router.post('/:id/cancel', authenticate, requireRole('CLIENT'), async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order || order.serviceType !== 'HOME_SERVICE') {
    return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
  }
  if (order.clientId !== req.user.id) {
    return res.status(403).json({ error: 'Not your order', code: 'FORBIDDEN' });
  }
  if (order.status !== 'PENDING') {
    return res.status(409).json({ error: 'Can only cancel PENDING orders', code: 'INVALID_STATE' });
  }

  const updated = await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
  await logEvent(order.id, 'ORDER_CANCELLED', { cancelledBy: req.user.id });

  return res.json({ order: updated });
});

module.exports = router;
