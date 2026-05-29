'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { sendNotification, NOTIFICATION_TYPES } = require('../services/fcm');
const { findNearby } = require('../services/geolocation');
const { calculateDeliveryFee, haversineKm } = require('../services/deliveryPricing');

const router = express.Router();

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
// CLIENT: POST /delivery/request
// ─────────────────────────────────────────────
router.post(
  '/request',
  authenticate,
  requireRole('CLIENT'),
  [
    body('merchantId').isUUID(),
    body('items').isArray({ min: 1 }),
    body('items.*.productId').isUUID(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('deliveryAddress').trim().notEmpty(),
    body('deliveryLat').isFloat({ min: -90, max: 90 }),
    body('deliveryLng').isFloat({ min: -180, max: 180 }),
    body('note').optional().trim(),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    const { merchantId, items, deliveryAddress, deliveryLat, deliveryLng, note } = req.body;

    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      include: { user: { select: { fcmToken: true } } },
    });
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found', code: 'NOT_FOUND' });
    }
    if (!merchant.isOpen) {
      return res.status(409).json({ error: 'Merchant is currently closed', code: 'MERCHANT_CLOSED' });
    }

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, merchantId, available: true },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'Some products are unavailable or not found', code: 'INVALID_PRODUCTS' });
    }

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
    let subtotal = 0;
    const enrichedItems = items.map((item) => {
      const product = productMap[item.productId];
      const lineTotal = parseFloat(product.price) * item.quantity;
      subtotal += lineTotal;
      return {
        productId: item.productId,
        name: product.name,
        price: parseFloat(product.price),
        quantity: item.quantity,
        lineTotal,
      };
    });

    const distanceKm = haversineKm(merchant.lat, merchant.lng, deliveryLat, deliveryLng);
    const feeResult = calculateDeliveryFee(distanceKm);
    const deliveryFee = feeResult.total;
    const total = parseFloat((subtotal + deliveryFee).toFixed(3));

    const order = await prisma.order.create({
      data: {
        clientId: req.user.id,
        type: 'DELIVERY',
        status: 'PENDING',
        originLat: merchant.lat,
        originLng: merchant.lng,
        destLat: deliveryLat,
        destLng: deliveryLng,
        price: total.toString(),
        metadata: {
          merchantId,
          merchantName: merchant.name,
          items: enrichedItems,
          deliveryAddress,
          note: note || null,
          subtotal: parseFloat(subtotal.toFixed(3)),
          deliveryFee,
          deliveryFeeBreakdown: feeResult.breakdown,
          total,
        },
      },
    });

    await logEvent(order.id, 'ORDER_CREATED', { clientId: req.user.id, merchantId });

    const merchantToken = merchant.user?.fcmToken;
    if (merchantToken) {
      await sendNotification(
        [merchantToken],
        NOTIFICATION_TYPES.NEW_ORDER,
        'Nouvelle commande !',
        `Commande de ${enrichedItems.length} article(s) — ${total.toFixed(3)} TND`,
        { orderId: order.id }
      );
    }

    const io = getIo(req);
    if (io) {
      io.to(`user:${merchant.userId}`).emit('delivery:new_order', {
        orderId: order.id,
        clientId: req.user.id,
        total,
        itemCount: enrichedItems.length,
      });
    }

    return res.status(201).json({
      order,
      priceBreakdown: {
        subtotal: parseFloat(subtotal.toFixed(3)),
        deliveryFee,
        deliveryFeeBreakdown: feeResult,
        total,
      },
    });
  }
);

// ─────────────────────────────────────────────
// CLIENT: GET /delivery/history
// ─────────────────────────────────────────────
router.get('/history', authenticate, requireRole('CLIENT'), async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { clientId: req.user.id, type: 'DELIVERY' },
    orderBy: { createdAt: 'desc' },
    include: { events: { orderBy: { createdAt: 'asc' } } },
  });

  return res.json({ orders, count: orders.length });
});

// ─────────────────────────────────────────────
// MARCHAND: GET /delivery/merchant/orders
// ─────────────────────────────────────────────
router.get('/merchant/orders', authenticate, requireRole('MARCHAND'), async (req, res) => {
  const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
  if (!merchant) {
    return res.status(404).json({ error: 'Merchant profile not found', code: 'NOT_FOUND' });
  }

  const orders = await prisma.order.findMany({
    where: {
      type: 'DELIVERY',
      metadata: { path: ['merchantId'], equals: merchant.id },
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
// LIVREUR: GET /delivery/livreur/assignments
// ─────────────────────────────────────────────
router.get('/livreur/assignments', authenticate, requireRole('LIVREUR'), async (req, res) => {
  const orders = await prisma.order.findMany({
    where: {
      type: 'DELIVERY',
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
// GET /delivery/:id — order details
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

  if (!order) {
    return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
  }

  const merchant = order.metadata?.merchantId
    ? await prisma.merchant.findUnique({ where: { userId: req.user.id } })
    : null;

  const isMerchantOwner = merchant && order.metadata?.merchantId === merchant.id;
  const isParty =
    order.clientId === req.user.id ||
    order.providerId === req.user.id ||
    isMerchantOwner;
  const isAdmin = req.user.role === 'ADMIN';

  if (!isParty && !isAdmin) {
    return res.status(403).json({ error: 'Access denied', code: 'FORBIDDEN' });
  }

  return res.json({ order });
});

// ─────────────────────────────────────────────
// CLIENT: POST /delivery/:id/confirm-receipt
// ─────────────────────────────────────────────
router.post('/:id/confirm-receipt', authenticate, requireRole('CLIENT'), async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order || order.type !== 'DELIVERY') {
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

  const io = getIo(req);
  if (io) {
    io.to(`user:${order.providerId}`).emit('delivery:completed', { orderId: order.id });
  }

  return res.json({ order: updated });
});

// ─────────────────────────────────────────────
// CLIENT: POST /delivery/:id/cancel
// ─────────────────────────────────────────────
router.post('/:id/cancel', authenticate, requireRole('CLIENT'), async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order || order.type !== 'DELIVERY') {
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
// MARCHAND: POST /delivery/:id/accept
// ─────────────────────────────────────────────
router.post('/:id/accept', authenticate, requireRole('MARCHAND'), async (req, res) => {
  const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
  if (!merchant) {
    return res.status(404).json({ error: 'Merchant profile not found', code: 'NOT_FOUND' });
  }

  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order || order.type !== 'DELIVERY') {
    return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
  }
  if (order.metadata?.merchantId !== merchant.id) {
    return res.status(403).json({ error: 'Not your order', code: 'FORBIDDEN' });
  }
  if (order.status !== 'PENDING') {
    return res.status(409).json({ error: `Order is already ${order.status}`, code: 'INVALID_STATE' });
  }

  // Find nearest available livreur
  const nearbyLivreurs = await findNearby(merchant.lat, merchant.lng, 10, 'DELIVERY');
  let assignedLivreurId = null;

  if (nearbyLivreurs.length > 0) {
    assignedLivreurId = nearbyLivreurs[0].userId;
  }

  const metadata = {
    ...(order.metadata || {}),
    merchantAccepted: true,
    merchantAcceptedAt: new Date().toISOString(),
  };

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'ACCEPTED',
      providerId: assignedLivreurId || undefined,
      metadata,
    },
    include: {
      client: { select: { fcmToken: true } },
    },
  });

  await logEvent(order.id, 'ORDER_ACCEPTED', { merchantId: merchant.id, assignedLivreurId });

  if (assignedLivreurId) {
    const livreur = await prisma.user.findUnique({
      where: { id: assignedLivreurId },
      select: { fcmToken: true },
    });
    if (livreur?.fcmToken) {
      await sendNotification(
        [livreur.fcmToken],
        NOTIFICATION_TYPES.NEW_ORDER,
        'Nouvelle livraison assignée !',
        `Récupérez la commande chez ${merchant.name}`,
        { orderId: order.id }
      );
    }

    const io = getIo(req);
    if (io) {
      io.to(`user:${assignedLivreurId}`).emit('delivery:assigned', {
        orderId: order.id,
        merchantName: merchant.name,
        merchantLat: merchant.lat,
        merchantLng: merchant.lng,
      });
    }
  }

  const clientToken = updated.client?.fcmToken;
  if (clientToken) {
    await sendNotification(
      [clientToken],
      NOTIFICATION_TYPES.ORDER_ACCEPTED,
      'Commande acceptée !',
      `${merchant.name} prépare votre commande.`,
      { orderId: order.id }
    );
  }

  const io = getIo(req);
  if (io) {
    io.to(`user:${order.clientId}`).emit('delivery:accepted', { orderId: order.id, merchantName: merchant.name });
  }

  return res.json({ order: updated, assignedLivreurId });
});

// ─────────────────────────────────────────────
// MARCHAND: POST /delivery/:id/ready
// ─────────────────────────────────────────────
router.post('/:id/ready', authenticate, requireRole('MARCHAND'), async (req, res) => {
  const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
  if (!merchant) {
    return res.status(404).json({ error: 'Merchant profile not found', code: 'NOT_FOUND' });
  }

  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { provider: { select: { fcmToken: true } } },
  });
  if (!order || order.type !== 'DELIVERY') {
    return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
  }
  if (order.metadata?.merchantId !== merchant.id) {
    return res.status(403).json({ error: 'Not your order', code: 'FORBIDDEN' });
  }
  if (order.status !== 'ACCEPTED') {
    return res.status(409).json({ error: 'Order must be ACCEPTED to mark as ready', code: 'INVALID_STATE' });
  }

  await logEvent(order.id, 'ORDER_READY', { merchantId: merchant.id });

  const livreurToken = order.provider?.fcmToken;
  if (livreurToken) {
    await sendNotification(
      [livreurToken],
      NOTIFICATION_TYPES.ORDER_IN_PROGRESS,
      'Commande prête !',
      `La commande chez ${merchant.name} vous attend.`,
      { orderId: order.id }
    );
  }

  const io = getIo(req);
  if (io) {
    if (order.providerId) io.to(`user:${order.providerId}`).emit('delivery:ready', { orderId: order.id });
    io.to(`user:${order.clientId}`).emit('delivery:ready', { orderId: order.id });
  }

  return res.json({ success: true, orderId: order.id, event: 'ORDER_READY' });
});

// ─────────────────────────────────────────────
// LIVREUR: POST /delivery/:id/pickup
// ─────────────────────────────────────────────
router.post('/:id/pickup', authenticate, requireRole('LIVREUR'), async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { client: { select: { fcmToken: true } } },
  });
  if (!order || order.type !== 'DELIVERY') {
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

  await logEvent(order.id, 'PICKED_UP', { livreurId: req.user.id });

  const clientToken = order.client?.fcmToken;
  if (clientToken) {
    await sendNotification(
      [clientToken],
      NOTIFICATION_TYPES.ORDER_IN_PROGRESS,
      'Commande en route !',
      'Le livreur a récupéré votre commande et est en chemin.',
      { orderId: order.id }
    );
  }

  const io = getIo(req);
  if (io) {
    io.to(`user:${order.clientId}`).emit('delivery:picked_up', { orderId: order.id });
  }

  return res.json({ order: updated });
});

// ─────────────────────────────────────────────
// LIVREUR: POST /delivery/:id/complete
// ─────────────────────────────────────────────
router.post('/:id/complete', authenticate, requireRole('LIVREUR'), async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { client: { select: { fcmToken: true } } },
  });
  if (!order || order.type !== 'DELIVERY') {
    return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
  }
  if (order.providerId !== req.user.id) {
    return res.status(403).json({ error: 'Not your assignment', code: 'FORBIDDEN' });
  }
  if (order.status !== 'IN_PROGRESS') {
    return res.status(409).json({ error: 'Order must be IN_PROGRESS to complete', code: 'INVALID_STATE' });
  }

  const now = new Date();

  // Atomically consume livreur pass and complete order
  const completed = await prisma.$transaction(async (tx) => {
    const subs = await tx.$queryRaw`
      SELECT * FROM "Subscription"
      WHERE "userId" = ${req.user.id}
        AND "isActive" = true
        AND "expiresAt" > NOW()
      ORDER BY "createdAt" DESC
      LIMIT 1
      FOR UPDATE
    `;

    const sub = subs[0];
    if (sub && sub.ridesLeft !== null && sub.ridesLeft > 0) {
      await tx.subscription.update({
        where: { id: sub.id },
        data: {
          ridesLeft: { decrement: 1 },
          ...(sub.ridesLeft - 1 === 0 ? { isActive: false } : {}),
        },
      });
    }

    return tx.order.update({
      where: { id: order.id },
      data: { status: 'COMPLETED' },
    });
  });

  await logEvent(order.id, 'DELIVERED', { livreurId: req.user.id, completedAt: now.toISOString() });

  const clientToken = order.client?.fcmToken;
  if (clientToken) {
    await sendNotification(
      [clientToken],
      NOTIFICATION_TYPES.ORDER_COMPLETED,
      'Commande livrée !',
      'Votre commande a été livrée. Bon appétit !',
      { orderId: order.id }
    );
  }

  const io = getIo(req);
  if (io) {
    io.to(`user:${order.clientId}`).emit('delivery:delivered', { orderId: order.id });
  }

  return res.json({ order: completed });
});

module.exports = router;
