'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { sendNotification, NOTIFICATION_TYPES } = require('../services/fcm');
const { findNearby } = require('../services/geolocation');
const { haversineKm } = require('../services/deliveryPricing');

const router = express.Router();

const GROCERY_BASE_FEE = 4.0;
const GROCERY_RATE_PER_KM = 3.0;
const MAX_SCHEDULED_HOURS = 2;

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

function calcGroceryFee(distanceKm) {
  const fee = Math.max(GROCERY_BASE_FEE, distanceKm * GROCERY_RATE_PER_KM);
  return parseFloat(fee.toFixed(3));
}

// ─────────────────────────────────────────────
// CLIENT: POST /grocery/request
// ─────────────────────────────────────────────
router.post(
  '/request',
  authenticate,
  requireRole('CLIENT'),
  [
    body('items').isArray({ min: 1 }),
    body('deliveryLat').isFloat({ min: -90, max: 90 }),
    body('deliveryLng').isFloat({ min: -180, max: 180 }),
    body('deliveryAddress').trim().notEmpty(),
    body('merchantIds').optional().isArray(),
    body('scheduledAt').optional().isISO8601(),
    body('note').optional().trim(),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    const { items, merchantIds, deliveryLat, deliveryLng, deliveryAddress, scheduledAt, note } = req.body;

    if (scheduledAt) {
      const scheduled = new Date(scheduledAt);
      const now = new Date();
      const diffHours = (scheduled - now) / 3600000;
      if (diffHours < 0 || diffHours > MAX_SCHEDULED_HOURS) {
        return res.status(400).json({
          error: `scheduledAt must be within the next ${MAX_SCHEDULED_HOURS} hours`,
          code: 'INVALID_SCHEDULED_TIME',
        });
      }
    }

    let subtotal = 0;
    const enrichedItems = items.map((item) => {
      if (item.productId && item.price) {
        const lineTotal = parseFloat(item.price) * item.quantity;
        subtotal += lineTotal;
        return { ...item, lineTotal };
      }
      return { ...item, lineTotal: 0 };
    });

    // Use a central origin if multi-merchant; otherwise 0,0 as placeholder
    const originLat = deliveryLat;
    const originLng = deliveryLng;
    const distanceKm = haversineKm(originLat, originLng, deliveryLat, deliveryLng) || 1;
    const deliveryFee = calcGroceryFee(distanceKm);
    const total = parseFloat((subtotal + deliveryFee).toFixed(3));

    const order = await prisma.order.create({
      data: {
        clientId: req.user.id,
        serviceType: 'GROCERY',
        status: 'PENDING',
        originLat,
        originLng,
        destinationLat: deliveryLat,
        destinationLng: deliveryLng,
        destinationAddress: deliveryAddress,
        price: total.toString(),
        metadata: {
          items: enrichedItems,
          merchantIds: merchantIds || [],
          deliveryAddress,
          scheduledAt: scheduledAt || null,
          note: note || null,
          subtotal: parseFloat(subtotal.toFixed(3)),
          deliveryFee,
          total,
        },
      },
    });

    await logEvent(order.id, 'ORDER_CREATED', { clientId: req.user.id });

    const nearbyLivreurs = await findNearby(deliveryLat, deliveryLng, 10, 'GROCERY');
    const top5 = nearbyLivreurs.slice(0, 5);

    if (top5.length > 0) {
      const livreurIds = top5.map((l) => l.userId);
      const livreurs = await prisma.user.findMany({
        where: { id: { in: livreurIds } },
        select: { id: true, fcmToken: true },
      });

      const tokens = livreurs.map((l) => l.fcmToken).filter(Boolean);
      if (tokens.length > 0) {
        await sendNotification(
          tokens,
          NOTIFICATION_TYPES.NEW_ORDER,
          'Nouvelle course grocery !',
          `Livraison de courses — ${total.toFixed(3)} TND`,
          { orderId: order.id, serviceType: 'GROCERY' }
        );
      }

      const io = getIo(req);
      if (io) {
        livreurIds.forEach((lid) => {
          io.to(`user:${lid}`).emit('grocery:new_order', { orderId: order.id, total, deliveryAddress });
        });
      }
    }

    return res.status(201).json({ order, priceBreakdown: { subtotal: parseFloat(subtotal.toFixed(3)), deliveryFee, total } });
  }
);

// ─────────────────────────────────────────────
// CLIENT: GET /grocery/history
// ─────────────────────────────────────────────
router.get('/history', authenticate, requireRole('CLIENT'), async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { clientId: req.user.id, serviceType: 'GROCERY' },
    orderBy: { createdAt: 'desc' },
    include: { events: { orderBy: { createdAt: 'asc' } } },
  });
  return res.json({ orders, count: orders.length });
});

// ─────────────────────────────────────────────
// LIVREUR: GET /grocery/livreur/assignments
// ─────────────────────────────────────────────
router.get('/livreur/assignments', authenticate, requireRole('LIVREUR'), async (req, res) => {
  const orders = await prisma.order.findMany({
    where: {
      serviceType: 'GROCERY',
      providerId: req.user.id,
      status: { in: ['ACCEPTED', 'IN_PROGRESS'] },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { id: true, name: true, phone: true } },
      events: { orderBy: { createdAt: 'asc' } },
    },
  });
  return res.json({ orders, count: orders.length });
});

// ─────────────────────────────────────────────
// GET /grocery/:id
// ─────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      client: { select: { id: true, name: true, phone: true } },
      provider: { select: { id: true, name: true, phone: true } },
      events: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!order || order.serviceType !== 'GROCERY') {
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
// CLIENT: POST /grocery/:id/confirm-receipt
// ─────────────────────────────────────────────
router.post('/:id/confirm-receipt', authenticate, requireRole('CLIENT'), async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order || order.serviceType !== 'GROCERY') {
    return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
  }
  if (order.clientId !== req.user.id) {
    return res.status(403).json({ error: 'Not your order', code: 'FORBIDDEN' });
  }
  if (order.status !== 'IN_PROGRESS') {
    return res.status(409).json({ error: `Cannot confirm receipt when status is ${order.status}`, code: 'INVALID_STATE' });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: 'COMPLETED' },
  });

  await logEvent(order.id, 'ORDER_COMPLETED', { confirmedBy: req.user.id });

  // Award EasyPoints to client
  try {
    const GROCERY_POINTS = 5;
    await prisma.$transaction([
      prisma.user.update({
        where: { id: order.clientId },
        data: { loyaltyPoints: { increment: GROCERY_POINTS } },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          userId: order.clientId,
          points: GROCERY_POINTS,
          description: 'Courses livrées — EasyCourses',
          type: 'EARN',
        },
      }),
    ]);
  } catch {}

  const io = getIo(req);
  if (io) {
    io.to(`user:${order.providerId}`).emit('grocery:completed', { orderId: order.id });
  }

  return res.json({ order: updated });
});

// ─────────────────────────────────────────────
// CLIENT: POST /grocery/:id/cancel
// ─────────────────────────────────────────────
router.post('/:id/cancel', authenticate, requireRole('CLIENT'), async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order || order.serviceType !== 'GROCERY') {
    return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
  }
  if (order.clientId !== req.user.id) {
    return res.status(403).json({ error: 'Not your order', code: 'FORBIDDEN' });
  }
  if (order.status !== 'PENDING') {
    return res.status(409).json({ error: 'Can only cancel PENDING orders', code: 'INVALID_STATE' });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: 'CANCELLED' },
  });

  await logEvent(order.id, 'ORDER_CANCELLED', { cancelledBy: req.user.id });

  return res.json({ order: updated });
});

// ─────────────────────────────────────────────
// LIVREUR: POST /grocery/:id/accept
// ─────────────────────────────────────────────
router.post('/:id/accept', authenticate, requireRole('LIVREUR'), async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { client: { select: { fcmToken: true } } },
  });
  if (!order || order.serviceType !== 'GROCERY') {
    return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
  }
  if (order.status !== 'PENDING') {
    return res.status(409).json({ error: `Order is already ${order.status}`, code: 'INVALID_STATE' });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const subs = await tx.$queryRaw`
      SELECT * FROM "Subscription"
      WHERE "providerId" = ${req.user.id}
        AND "status" = 'ACTIVE'
        AND "expiresAt" > NOW()
      ORDER BY "createdAt" DESC
      LIMIT 1
      FOR UPDATE
    `;

    const sub = subs[0];
    if (!sub || sub.ridesRemaining <= 0) {
      const err = new Error('No active pass available');
      err.statusCode = 402;
      err.code = 'NO_PASS';
      throw err;
    }

    await tx.subscription.update({
      where: { id: sub.id },
      data: {
        ridesConsumed: { increment: 1 },
        ridesRemaining: { decrement: 1 },
        ...(sub.ridesRemaining - 1 === 0 ? { status: 'EXHAUSTED' } : {}),
      },
    });

    return tx.order.update({
      where: { id: order.id },
      data: { status: 'ACCEPTED', providerId: req.user.id, passConsumed: true },
    });
  });

  await logEvent(order.id, 'ORDER_ACCEPTED', { livreurId: req.user.id });

  const clientToken = order.client?.fcmToken;
  if (clientToken) {
    await sendNotification(
      [clientToken],
      NOTIFICATION_TYPES.ORDER_ACCEPTED,
      'Livreur trouvé !',
      'Un livreur a accepté votre commande de courses.',
      { orderId: order.id }
    );
  }

  const io = getIo(req);
  if (io) {
    io.to(`user:${order.clientId}`).emit('grocery:accepted', { orderId: order.id, livreurId: req.user.id });
  }

  return res.json({ order: updated });
});

// ─────────────────────────────────────────────
// LIVREUR: POST /grocery/:id/pickup — livreur a fait les courses, en route
// ─────────────────────────────────────────────
router.post('/:id/pickup', authenticate, requireRole('LIVREUR'), async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { client: { select: { fcmToken: true } } },
  });
  if (!order || order.serviceType !== 'GROCERY') {
    return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
  }
  if (order.providerId !== req.user.id) {
    return res.status(403).json({ error: 'Not your assignment', code: 'FORBIDDEN' });
  }
  if (order.status !== 'ACCEPTED') {
    return res.status(409).json({ error: 'Order must be ACCEPTED to pickup', code: 'INVALID_STATE' });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: 'IN_PROGRESS' },
  });

  await logEvent(order.id, 'SHOPPING_DONE', { livreurId: req.user.id });

  const clientToken = order.client?.fcmToken;
  if (clientToken) {
    await sendNotification(
      [clientToken],
      NOTIFICATION_TYPES.ORDER_IN_PROGRESS,
      'Courses terminées !',
      'Le livreur est en route vers vous avec vos courses.',
      { orderId: order.id }
    );
  }

  const io = getIo(req);
  if (io) {
    io.to(`user:${order.clientId}`).emit('grocery:in_progress', { orderId: order.id });
  }

  return res.json({ order: updated });
});

// ─────────────────────────────────────────────
// LIVREUR: POST /grocery/:id/complete
// ─────────────────────────────────────────────
router.post('/:id/complete', authenticate, requireRole('LIVREUR'), async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { client: { select: { fcmToken: true } } },
  });
  if (!order || order.serviceType !== 'GROCERY') {
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

  await logEvent(order.id, 'DELIVERED', { livreurId: req.user.id });

  // Award EasyPoints to client
  try {
    const GROCERY_POINTS = 5;
    await prisma.$transaction([
      prisma.user.update({
        where: { id: order.clientId },
        data: { loyaltyPoints: { increment: GROCERY_POINTS } },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          userId: order.clientId,
          points: GROCERY_POINTS,
          description: 'Courses livrées — EasyCourses',
          type: 'EARN',
        },
      }),
    ]);
  } catch {}

  const clientToken = order.client?.fcmToken;
  if (clientToken) {
    await sendNotification(
      [clientToken],
      NOTIFICATION_TYPES.ORDER_COMPLETED,
      'Courses livrées !',
      'Vos courses ont été livrées. Bon appétit !',
      { orderId: order.id }
    );
  }

  const io = getIo(req);
  if (io) {
    io.to(`user:${order.clientId}`).emit('grocery:delivered', { orderId: order.id });
  }

  return res.json({ order: updated });
});

module.exports = router;
