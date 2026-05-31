'use strict';

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { kycGuard } = require('../middleware/kycGuard');
const { estimateFare, modeB } = require('../services/taximetre');
const { sendNotification, NOTIFICATION_TYPES } = require('../services/fcm');
const { findNearby } = require('../services/geolocation');

const router = express.Router();

// Shared io instance — injected via app.set('io', io) in server.js
function getIo(req) {
  return req.app.get('io');
}

// Helper: log order event
async function logEvent(orderId, eventType, payload = {}) {
  await prisma.orderEvent.create({
    data: { orderId, eventType, payload },
  });
}

// ─────────────────────────────────────────────
// POST /api/taxi/estimate — Mode A fare estimate
// ─────────────────────────────────────────────
router.post(
  '/estimate',
  authenticate,
  [
    body('originLat').isFloat({ min: -90, max: 90 }).withMessage('Invalid originLat'),
    body('originLng').isFloat({ min: -180, max: 180 }).withMessage('Invalid originLng'),
    body('destLat').isFloat({ min: -90, max: 90 }).withMessage('Invalid destLat'),
    body('destLng').isFloat({ min: -180, max: 180 }).withMessage('Invalid destLng'),
    body('datetime').optional().isISO8601().withMessage('datetime must be ISO8601'),
    body('mode').optional().isIn(['A', 'B']).withMessage('mode must be A or B'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const {
      originLat, originLng, destLat, destLng,
      datetime, mode = 'A',
    } = req.body;

    if (mode === 'B') {
      const result = await modeB(originLat, originLng, destLat, destLng);
      return res.json({ mode: 'B', ...result });
    }

    const dt = datetime ? new Date(datetime) : new Date();
    const result = await estimateFare(originLat, originLng, destLat, destLng, dt);
    return res.json({ mode: 'A', ...result });
  }
);

// ─────────────────────────────────────────────
// POST /api/taxi/request — CLIENT creates a TAXI order
// ─────────────────────────────────────────────
router.post(
  '/request',
  authenticate,
  requireRole('CLIENT'),
  [
    body('originLat').isFloat({ min: -90, max: 90 }).withMessage('Invalid originLat'),
    body('originLng').isFloat({ min: -180, max: 180 }).withMessage('Invalid originLng'),
    body('destLat').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid destLat'),
    body('destLng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid destLng'),
    body('originAddress').optional().trim(),
    body('destinationAddress').optional().trim(),
    body('mode').isIn(['A', 'B']).withMessage('mode must be A or B'),
    body('taxiType').isIn(['NORMAL', 'EASYLADY', 'EASYACCESS']).withMessage('Invalid taxiType'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const {
      originLat, originLng, destLat, destLng,
      originAddress, destinationAddress, mode, taxiType,
    } = req.body;

    let price = null;
    let fareBreakdown = null;

    if (mode === 'A' && destLat != null && destLng != null) {
      const fareResult = await estimateFare(originLat, originLng, destLat, destLng, new Date());
      price = fareResult.estimatedFare;
      fareBreakdown = fareResult.breakdown;
    }

    const order = await prisma.order.create({
      data: {
        clientId: req.user.id,
        serviceType: 'TAXI',
        status: 'PENDING',
        originLat,
        originLng,
        originAddress: originAddress || null,
        destinationLat: destLat || null,
        destinationLng: destLng || null,
        destinationAddress: destinationAddress || null,
        price: price != null ? price.toString() : null,
      },
    });

    await logEvent(order.id, 'ORDER_CREATED', {
      mode, taxiType, fareBreakdown,
      clientId: req.user.id,
    });

    // Broadcast to nearby CHAUFFEUR drivers via Socket.io
    const io = getIo(req);
    if (io) {
      io.to('service:TAXI').emit('taxi:new_request', {
        orderId: order.id,
        taxiType,
        mode,
        originLat,
        originLng,
        originAddress,
        estimatedFare: price,
        fareBreakdown,
      });
    }

    return res.status(201).json({ order, fareBreakdown });
  }
);

// ─────────────────────────────────────────────
// GET /api/taxi/nearby — nearby available TAXI drivers (Redis GEO)
// ─────────────────────────────────────────────
router.get(
  '/nearby',
  authenticate,
  async (req, res) => {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius || '5');

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(422).json({ error: 'lat and lng are required', code: 'VALIDATION_ERROR' });
    }

    const providers = await findNearby(lat, lng, radius, 'TAXI');
    return res.json({ providers, count: providers.length });
  }
);

// ─────────────────────────────────────────────
// GET /api/taxi/:orderId — order details
// ─────────────────────────────────────────────
router.get(
  '/:orderId',
  authenticate,
  async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: { select: { id: true, name: true, phone: true, fcmToken: true } },
        provider: { select: { id: true, name: true, phone: true, fcmToken: true } },
        events: { orderBy: { createdAt: 'asc' } },
        reviews: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
    }

    // Only the client or provider can view the order details
    const isParty = order.clientId === req.user.id || order.providerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    if (!isParty && !isAdmin) {
      return res.status(403).json({ error: 'Access denied', code: 'FORBIDDEN' });
    }

    return res.json({ order });
  }
);

// ─────────────────────────────────────────────
// POST /api/taxi/:orderId/accept — CHAUFFEUR accepts order
// ─────────────────────────────────────────────
router.post(
  '/:orderId/accept',
  authenticate,
  requireRole('CHAUFFEUR'),
  kycGuard,
  async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
    }
    if (order.status !== 'PENDING') {
      return res.status(409).json({ error: `Order is already ${order.status}`, code: 'INVALID_STATE' });
    }
    if (order.serviceType !== 'TAXI') {
      return res.status(400).json({ error: 'Not a TAXI order', code: 'WRONG_SERVICE' });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'ACCEPTED', providerId: req.user.id },
      include: {
        client: { select: { fcmToken: true, name: true } },
        provider: { select: { id: true, name: true, phone: true } },
      },
    });

    await logEvent(orderId, 'ORDER_ACCEPTED', { chauffeurId: req.user.id });

    // FCM notify client
    const clientToken = updated.client?.fcmToken;
    if (clientToken) {
      await sendNotification(
        [clientToken],
        NOTIFICATION_TYPES.ORDER_ACCEPTED,
        'Taxi trouvé !',
        `${updated.provider.name} est en route vers vous.`,
        { orderId, chauffeurName: updated.provider.name }
      );
    }

    // Socket.io notify client's room
    const io = getIo(req);
    if (io) {
      io.to(`user:${order.clientId}`).emit('taxi:accepted', {
        orderId,
        driver: updated.provider,
      });
    }

    return res.json({ order: updated });
  }
);

// ─────────────────────────────────────────────
// POST /api/taxi/:orderId/start — CHAUFFEUR starts the ride
// ─────────────────────────────────────────────
router.post(
  '/:orderId/start',
  authenticate,
  requireRole('CHAUFFEUR'),
  kycGuard,
  async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
    }
    if (order.providerId !== req.user.id) {
      return res.status(403).json({ error: 'Not your order', code: 'FORBIDDEN' });
    }
    if (order.status !== 'ACCEPTED') {
      return res.status(409).json({ error: `Order must be ACCEPTED to start (current: ${order.status})`, code: 'INVALID_STATE' });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'IN_PROGRESS' },
      include: {
        client: { select: { fcmToken: true } },
      },
    });

    await logEvent(orderId, 'ORDER_STARTED', { chauffeurId: req.user.id });

    const io = getIo(req);
    if (io) {
      io.to(`user:${order.clientId}`).emit('taxi:started', { orderId });
    }

    const clientToken = updated.client?.fcmToken;
    if (clientToken) {
      await sendNotification(
        [clientToken],
        NOTIFICATION_TYPES.ORDER_IN_PROGRESS,
        'La course a démarré',
        'Votre taxi est en route. Bon trajet !',
        { orderId }
      );
    }

    return res.json({ order: updated });
  }
);

// ─────────────────────────────────────────────
// POST /api/taxi/:orderId/complete — double confirmation, then consume pass
// ─────────────────────────────────────────────
router.post(
  '/:orderId/complete',
  authenticate,
  requireRole('CLIENT', 'CHAUFFEUR'),
  async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: { select: { fcmToken: true } },
        provider: { select: { fcmToken: true } },
      },
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
    }
    if (order.status !== 'IN_PROGRESS') {
      return res.status(409).json({ error: `Order must be IN_PROGRESS to complete (current: ${order.status})`, code: 'INVALID_STATE' });
    }

    const isClient = order.clientId === req.user.id;
    const isDriver = order.providerId === req.user.id;
    if (!isClient && !isDriver) {
      return res.status(403).json({ error: 'Not a party of this order', code: 'FORBIDDEN' });
    }

    const now = new Date();
    const updateData = {};

    if (isClient && !order.clientConfirmedAt) {
      updateData.clientConfirmedAt = now;
    } else if (isDriver && !order.providerConfirmedAt) {
      updateData.providerConfirmedAt = now;
    } else {
      return res.status(409).json({ error: 'Already confirmed by this party', code: 'ALREADY_CONFIRMED' });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    await logEvent(orderId, isClient ? 'CLIENT_CONFIRMED' : 'DRIVER_CONFIRMED', { by: req.user.id });

    // Both sides confirmed → atomically complete the order and consume pass
    const bothConfirmed =
      (isClient ? now : updated.clientConfirmedAt) &&
      (isDriver ? now : updated.providerConfirmedAt);

    if (bothConfirmed) {
      const completed = await prisma.$transaction(async (tx) => {
        // Atomically consume driver's subscription pass
        const subs = await tx.$queryRaw`
          SELECT * FROM "Subscription"
          WHERE "providerId" = ${order.providerId}
            AND "status" = 'ACTIVE'
            AND "expiresAt" > NOW()
          ORDER BY "createdAt" DESC
          LIMIT 1
          FOR UPDATE
        `;

        const sub = subs[0];
        if (sub && sub.planType !== 'PRO') {
          if (sub.ridesRemaining > 0) {
            await tx.subscription.update({
              where: { id: sub.id },
              data: {
                ridesConsumed: { increment: 1 },
                ridesRemaining: { decrement: 1 },
                ...(sub.ridesRemaining - 1 === 0 ? { status: 'EXHAUSTED' } : {}),
              },
            });
          }
        }

        return tx.order.update({
          where: { id: orderId },
          data: {
            status: 'COMPLETED',
            completedAt: now,
            passConsumed: !!sub,
          },
        });
      });

      await logEvent(orderId, 'ORDER_COMPLETED', { completedAt: now.toISOString() });

      // Award EasyPoints to client
      try {
        const TAXI_POINTS = 10;
        await prisma.$transaction([
          prisma.user.update({
            where: { id: order.clientId },
            data: { loyaltyPoints: { increment: TAXI_POINTS } },
          }),
          prisma.loyaltyTransaction.create({
            data: {
              userId: order.clientId,
              points: TAXI_POINTS,
              description: 'Course taxi complétée — EasyTaxy',
              type: 'EARN',
            },
          }),
        ]);
      } catch {} // Non-blocking

      const io = getIo(req);
      if (io) {
        io.to(`user:${order.clientId}`).emit('taxi:completed', { orderId });
        io.to(`user:${order.providerId}`).emit('taxi:completed', { orderId });
      }

      // FCM both parties
      const tokens = [order.client?.fcmToken, order.provider?.fcmToken].filter(Boolean);
      if (tokens.length > 0) {
        await sendNotification(tokens, NOTIFICATION_TYPES.ORDER_COMPLETED, 'Course terminée', 'Merci d\'avoir utilisé EASYWAY Taxi !', { orderId });
      }

      return res.json({ order: completed, bothConfirmed: true });
    }

    return res.json({ order: updated, bothConfirmed: false, waitingForOtherParty: true });
  }
);

// ─────────────────────────────────────────────
// POST /api/taxi/:orderId/cancel — cancel before start
// ─────────────────────────────────────────────
router.post(
  '/:orderId/cancel',
  authenticate,
  [
    body('reason').optional().trim(),
  ],
  async (req, res) => {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: { select: { fcmToken: true } },
        provider: { select: { fcmToken: true } },
      },
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
    }

    const isClient = order.clientId === req.user.id;
    const isDriver = order.providerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    if (!isClient && !isDriver && !isAdmin) {
      return res.status(403).json({ error: 'Not a party of this order', code: 'FORBIDDEN' });
    }

    if (!['PENDING', 'ACCEPTED'].includes(order.status)) {
      return res.status(409).json({
        error: 'Order can only be cancelled when PENDING or ACCEPTED',
        code: 'INVALID_STATE',
      });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    await logEvent(orderId, 'ORDER_CANCELLED', {
      cancelledBy: req.user.id,
      cancelledByRole: req.user.role,
      reason: reason || null,
    });

    // No pass consumed on cancellation before start

    const io = getIo(req);
    if (io) {
      if (order.clientId) io.to(`user:${order.clientId}`).emit('taxi:cancelled', { orderId, reason });
      if (order.providerId) io.to(`user:${order.providerId}`).emit('taxi:cancelled', { orderId, reason });
    }

    const tokens = [order.client?.fcmToken, order.provider?.fcmToken].filter(Boolean);
    if (tokens.length > 0) {
      await sendNotification(tokens, NOTIFICATION_TYPES.ORDER_CANCELLED, 'Course annulée', reason || 'La course a été annulée.', { orderId });
    }

    return res.json({ order: updated });
  }
);

// ─────────────────────────────────────────────
// GET /api/taxi/backhome — chercher chauffeurs disponibles
// ─────────────────────────────────────────────
router.get('/backhome', authenticate, async (req, res) => {
  const { destLat, destLng } = req.query;
  try {
    const rides = await prisma.backHomeRide.findMany({
      where: { active: true, seatsLeft: { gt: 0 } },
      include: { driver: { select: { id: true, name: true, avgRating: true } } },
      take: 10,
    });
    res.json(rides);
  } catch {
    res.json([]); // table peut ne pas exister encore
  }
});

// POST /api/taxi/backhome — chauffeur propose trajet retour
router.post('/backhome', authenticate, async (req, res) => {
  const { destLat, destLng, destAddress, seats, price } = req.body;
  try {
    const ride = await prisma.backHomeRide.create({
      data: {
        driverId: req.user.id,
        destLat: parseFloat(destLat),
        destLng: parseFloat(destLng),
        destAddress: destAddress || '',
        seatsTotal: Number(seats) || 1,
        seatsLeft: Number(seats) || 1,
        price: parseFloat(price) || 0,
        active: true,
      }
    });
    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/taxi/backhome/:id/join — client rejoint un Back Home Ride
router.post('/backhome/:id/join', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const ride = await prisma.backHomeRide.findUnique({ where: { id } });
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    if (!ride.active || ride.seatsLeft <= 0) {
      return res.status(409).json({ error: 'No seats available' });
    }
    const updated = await prisma.backHomeRide.update({
      where: { id },
      data: { seatsLeft: { decrement: 1 } },
    });
    res.json({ success: true, ride: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/taxi/heatmap — demand zones by time of day
// ─────────────────────────────────────────────
router.get('/heatmap', authenticate, async (req, res) => {
  const { lat, lng } = req.query;

  // Try Redis for cached zone data
  try {
    const cached = await require('../config/redis').redisClient.get('heatmap:zones');
    if (cached) {
      return res.json(JSON.parse(cached));
    }
  } catch (_) {}

  const hour = new Date().getHours();
  const zones = [];
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20)) {
    zones.push({ label: 'Centre-ville', level: 'HAUTE', color: '#E53935' });
    zones.push({ label: 'Gare / Aéroport', level: 'HAUTE', color: '#E53935' });
    zones.push({ label: 'Zone résidentielle', level: 'MOYENNE', color: '#F5A623' });
  } else if (hour >= 10 && hour <= 16) {
    zones.push({ label: 'Centre commercial', level: 'MOYENNE', color: '#F5A623' });
    zones.push({ label: 'Université / Hôpitaux', level: 'MOYENNE', color: '#F5A623' });
    zones.push({ label: 'Banlieue', level: 'FAIBLE', color: '#43A047' });
  } else {
    zones.push({ label: 'Centre-ville', level: 'FAIBLE', color: '#43A047' });
    zones.push({ label: 'Zone de loisirs', level: 'MOYENNE', color: '#F5A623' });
    zones.push({ label: 'Aéroport', level: 'FAIBLE', color: '#43A047' });
  }

  const result = { zones, updatedAt: new Date().toISOString() };
  return res.json(result);
});

// ─────────────────────────────────────────────
// POST /api/taxi/:orderId/rate — 1-5 stars review
// ─────────────────────────────────────────────
router.post(
  '/:orderId/rate',
  authenticate,
  requireRole('CLIENT', 'CHAUFFEUR'),
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim().isLength({ max: 500 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { orderId } = req.params;
    const { rating, comment } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
    }
    if (order.status !== 'COMPLETED') {
      return res.status(409).json({ error: 'Can only rate completed orders', code: 'INVALID_STATE' });
    }

    const isClient = order.clientId === req.user.id;
    const isDriver = order.providerId === req.user.id;
    if (!isClient && !isDriver) {
      return res.status(403).json({ error: 'Not a party of this order', code: 'FORBIDDEN' });
    }

    // Target: if client rates, rates driver; if driver rates, rates client
    const targetId = isClient ? order.providerId : order.clientId;
    if (!targetId) {
      return res.status(400).json({ error: 'No target to rate', code: 'NO_TARGET' });
    }

    // Prevent duplicate review from same reviewer
    const existing = await prisma.review.findFirst({
      where: { orderId, reviewerId: req.user.id },
    });
    if (existing) {
      return res.status(409).json({ error: 'Already reviewed this order', code: 'ALREADY_REVIEWED' });
    }

    const { tags, tip } = req.body;

    const review = await prisma.review.create({
      data: {
        orderId,
        reviewerId: req.user.id,
        targetId,
        rating,
        comment: comment || null,
        // tags stored as JSON string if column exists, else ignored gracefully
        ...(tags ? { tags: JSON.stringify(tags) } : {}),
      },
    }).catch(async () => {
      // Fallback if tags column doesn't exist yet
      return prisma.review.create({
        data: { orderId, reviewerId: req.user.id, targetId, rating, comment: comment || null },
      });
    });

    // Apply tip to driver wallet if provided
    if (tip && parseFloat(tip) > 0 && order.driverId) {
      await prisma.user.update({
        where: { id: order.driverId },
        data: { walletBalance: { increment: parseFloat(tip) } },
      }).catch(() => {});
    }

    await logEvent(orderId, 'ORDER_RATED', { reviewerId: req.user.id, rating, targetId, tags, tip });

    return res.status(201).json({ review });
  }
);

// POST /api/taxi/split-fare
router.post('/split-fare', authenticate, async (req, res) => {
  const { orderId, totalAmount, persons } = req.body;
  const shareToken = Math.random().toString(36).slice(2, 10).toUpperCase();
  const shareUrl = `https://easyway.tn/split/${shareToken}`;
  res.json({
    shareToken,
    shareUrl,
    totalAmount,
    persons,
    perPerson: (parseFloat(totalAmount) / parseInt(persons)).toFixed(3),
  });
});

module.exports = router;
