'use strict';

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { kycGuard } = require('../middleware/kycGuard');
const { sendNotification, NOTIFICATION_TYPES } = require('../services/fcm');
const { findNearby } = require('../services/geolocation');

const router = express.Router();

function getIo(req) {
  return req.app.get('io');
}

async function logEvent(orderId, eventType, payload = {}) {
  await prisma.orderEvent.create({ data: { orderId, eventType, payload } });
}

function determineSosType(vehicleState) {
  const { battery, fuel, keysLocked, accident } = vehicleState || {};
  if (accident) return 'ACCIDENT';
  if (battery) return 'PANNE';
  if (fuel) return 'PANNE';
  if (keysLocked) return 'PANNE';
  return 'REMORQUAGE';
}

// ─────────────────────────────────────────────
// POST /api/sos/request — CLIENT submits SOS request
// ─────────────────────────────────────────────
router.post(
  '/request',
  authenticate,
  requireRole('CLIENT'),
  [
    body('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid lat'),
    body('lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid lng'),
    body('mode').isIn(['INSURANCE', 'INDEPENDENT']).withMessage('mode must be INSURANCE or INDEPENDENT'),
    body('vehicleState').isObject().withMessage('vehicleState must be an object'),
    body('vehicleInfo').isObject().withMessage('vehicleInfo must be an object'),
    body('insuranceContractId').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { lat, lng, mode, vehicleState, vehicleInfo, insuranceContractId } = req.body;
    const sosType = determineSosType(vehicleState);

    try {
      // Insurance validation
      if (mode === 'INSURANCE') {
        const contract = await prisma.insuranceContract.findUnique({
          where: { userId: req.user.id },
        });

        if (!contract) {
          return res.status(400).json({ error: 'No insurance contract found', code: 'NO_CONTRACT' });
        }
        if (new Date(contract.expiresAt) < new Date()) {
          return res.status(400).json({ error: 'Insurance contract has expired', code: 'CONTRACT_EXPIRED' });
        }
        const coverageMap = { ACCIDENT: 'ACCIDENT', PANNE: 'PANNE', REMORQUAGE: 'REMORQUAGE' };
        if (!contract.coverageTypes.includes(coverageMap[sosType])) {
          return res.status(400).json({
            error: `Your insurance does not cover ${sosType}`,
            code: 'COVERAGE_NOT_INCLUDED',
          });
        }
      }

      const order = await prisma.order.create({
        data: {
          clientId: req.user.id,
          serviceType: 'SOS',
          status: 'PENDING',
          originLat: lat,
          originLng: lng,
          metadata: {
            vehicleState,
            vehicleInfo,
            mode,
            sosType,
            insuranceContractId: insuranceContractId || null,
            quotes: [],
            notifiedDepanneurs: [],
            confirmations: {},
          },
        },
      });

      await logEvent(order.id, 'ORDER_CREATED', { mode, sosType, clientId: req.user.id });

      // Find up to 5 nearby DEPANNEUR providers via Redis GEO
      let top5 = [];
      try {
        const nearby = await findNearby(lat, lng, 20, 'SOS');
        top5 = nearby.slice(0, 5);
      } catch (geoErr) {
        console.warn('[SOS] findNearby failed (Redis unavailable?):', geoErr.message);
      }

      const depanneurIds = top5.map((d) => d.userId);

      // Fetch FCM tokens for depanneurs
      let depanneurs = [];
      if (depanneurIds.length > 0) {
        depanneurs = await prisma.user.findMany({
          where: {
            id: { in: depanneurIds },
            role: 'DEPANNEUR',
            kycStatus: 'APPROVED',
            isOnline: true,
          },
          select: { id: true, fcmToken: true, name: true },
        });

        const tokens = depanneurs.map((d) => d.fcmToken).filter(Boolean);
        if (tokens.length > 0) {
          await sendNotification(
            tokens,
            NOTIFICATION_TYPES.ORDER_NEW,
            'Nouvelle demande SOS',
            `Intervention ${sosType} - ${vehicleInfo.brand || ''} ${vehicleInfo.model || ''}`.trim(),
            { orderId: order.id, sosType, lat: String(lat), lng: String(lng) }
          );
        }

        // Store notified depanneurs in metadata
        await prisma.order.update({
          where: { id: order.id },
          data: {
            metadata: {
              ...order.metadata,
              notifiedDepanneurs: depanneurs.map((d) => d.id),
            },
          },
        });
      }

      const io = getIo(req);
      if (io) {
        depanneurs.forEach((d) => {
          io.to(`user:${d.id}`).emit('sos:new_request', {
            orderId: order.id,
            lat,
            lng,
            sosType,
            vehicleState,
            vehicleInfo,
            mode,
          });
        });
      }

      return res.status(201).json({ order, depanneursFound: depanneurs.length });
    } catch (err) {
      console.error('[SOS] request error:', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// ─────────────────────────────────────────────
// POST /api/sos/:id/quote — DEPANNEUR submits a quote
// ─────────────────────────────────────────────
router.post(
  '/:id/quote',
  authenticate,
  requireRole('DEPANNEUR'),
  kycGuard,
  [
    body('price').isFloat({ min: 0 }).withMessage('price must be a positive number'),
    body('estimatedArrivalMin').isInt({ min: 1 }).withMessage('estimatedArrivalMin must be a positive integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { id } = req.params;
    const { price, estimatedArrivalMin } = req.body;

    try {
      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
      if (order.serviceType !== 'SOS') return res.status(400).json({ error: 'Not an SOS order', code: 'WRONG_SERVICE' });
      if (order.status !== 'PENDING') return res.status(409).json({ error: `Order is ${order.status}`, code: 'INVALID_STATE' });

      const meta = order.metadata || {};
      const notified = meta.notifiedDepanneurs || [];
      if (!notified.includes(req.user.id)) {
        return res.status(403).json({ error: 'You were not notified for this order', code: 'FORBIDDEN' });
      }

      const quotes = meta.quotes || [];
      if (quotes.find((q) => q.depanneurId === req.user.id)) {
        return res.status(409).json({ error: 'You already submitted a quote', code: 'ALREADY_QUOTED' });
      }

      const quote = {
        depanneurId: req.user.id,
        price: parseFloat(price),
        estimatedArrivalMin: parseInt(estimatedArrivalMin),
        submittedAt: new Date().toISOString(),
      };

      quotes.push(quote);

      const updated = await prisma.order.update({
        where: { id },
        data: { metadata: { ...meta, quotes } },
        include: { client: { select: { fcmToken: true } } },
      });

      await logEvent(id, 'QUOTE_SUBMITTED', { depanneurId: req.user.id, price, estimatedArrivalMin });

      const clientToken = updated.client?.fcmToken;
      if (clientToken) {
        await sendNotification(
          [clientToken],
          NOTIFICATION_TYPES.ORDER_NEW,
          'Devis reçu !',
          `Un dépanneur propose ${parseFloat(price).toFixed(3)} TND — arrivée en ${estimatedArrivalMin} min`,
          { orderId: id }
        );
      }

      const io = getIo(req);
      if (io) {
        io.to(`user:${order.clientId}`).emit('sos:quote_received', { orderId: id, quote });
      }

      return res.json({ order: updated, quote });
    } catch (err) {
      console.error('[SOS] quote error:', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// ─────────────────────────────────────────────
// POST /api/sos/:id/accept-quote — CLIENT accepts a quote
// ─────────────────────────────────────────────
router.post(
  '/:id/accept-quote',
  authenticate,
  requireRole('CLIENT'),
  [
    body('depanneurId').notEmpty().withMessage('depanneurId is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { id } = req.params;
    const { depanneurId } = req.body;

    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { client: { select: { id: true } } },
      });
      if (!order) return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
      if (order.clientId !== req.user.id) return res.status(403).json({ error: 'Not your order', code: 'FORBIDDEN' });
      if (order.status !== 'PENDING') return res.status(409).json({ error: `Order is ${order.status}`, code: 'INVALID_STATE' });

      const meta = order.metadata || {};
      const quotes = meta.quotes || [];
      const acceptedQuote = quotes.find((q) => q.depanneurId === depanneurId);
      if (!acceptedQuote) {
        return res.status(404).json({ error: 'Quote not found for this depanneur', code: 'QUOTE_NOT_FOUND' });
      }

      let updated;
      if (meta.mode === 'INDEPENDENT') {
        updated = await prisma.$transaction(async (tx) => {
          const subs = await tx.$queryRaw`
            SELECT * FROM "Subscription"
            WHERE "providerId" = ${depanneurId}
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
            where: { id },
            data: {
              status: 'ACCEPTED',
              providerId: depanneurId,
              price: acceptedQuote.price.toString(),
              metadata: { ...meta, acceptedQuote },
            },
            include: {
              provider: { select: { id: true, fcmToken: true, name: true } },
            },
          });
        });
      } else {
        updated = await prisma.order.update({
          where: { id },
          data: {
            status: 'ACCEPTED',
            providerId: depanneurId,
            price: acceptedQuote.price.toString(),
            metadata: { ...meta, acceptedQuote },
          },
          include: {
            provider: { select: { id: true, fcmToken: true, name: true } },
          },
        });
      }

      await logEvent(id, 'QUOTE_ACCEPTED', { depanneurId, price: acceptedQuote.price });

      // Notify accepted depanneur
      const acceptedToken = updated.provider?.fcmToken;
      if (acceptedToken) {
        await sendNotification(
          [acceptedToken],
          NOTIFICATION_TYPES.ORDER_ACCEPTED,
          'Votre devis a été accepté !',
          'Rendez-vous sur place pour intervenir.',
          { orderId: id }
        );
      }

      // Notify rejected depanneurs
      const rejectedIds = quotes.filter((q) => q.depanneurId !== depanneurId).map((q) => q.depanneurId);
      if (rejectedIds.length > 0) {
        const rejected = await prisma.user.findMany({
          where: { id: { in: rejectedIds } },
          select: { fcmToken: true },
        });
        const rejectedTokens = rejected.map((u) => u.fcmToken).filter(Boolean);
        if (rejectedTokens.length > 0) {
          await sendNotification(rejectedTokens, NOTIFICATION_TYPES.ORDER_CANCELLED, 'Devis non retenu', 'Le client a choisi un autre dépanneur.', { orderId: id });
        }
      }

      const io = getIo(req);
      if (io) {
        io.to(`user:${depanneurId}`).emit('sos:quote_accepted', { orderId: id });
        rejectedIds.forEach((rid) => io.to(`user:${rid}`).emit('sos:quote_rejected', { orderId: id }));
      }

      return res.json({ order: updated });
    } catch (err) {
      console.error('[SOS] accept-quote error:', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// ─────────────────────────────────────────────
// POST /api/sos/:id/start — DEPANNEUR marks arrival on site
// ─────────────────────────────────────────────
router.post(
  '/:id/start',
  authenticate,
  requireRole('DEPANNEUR'),
  async (req, res) => {
    const { id } = req.params;

    try {
      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
      if (order.providerId !== req.user.id) return res.status(403).json({ error: 'Not your order', code: 'FORBIDDEN' });
      if (order.status !== 'ACCEPTED') return res.status(409).json({ error: `Order must be ACCEPTED (current: ${order.status})`, code: 'INVALID_STATE' });

      const updated = await prisma.order.update({
        where: { id },
        data: { status: 'IN_PROGRESS' },
        include: { client: { select: { fcmToken: true } } },
      });

      await logEvent(id, 'DEPANNEUR_ARRIVED', { depanneurId: req.user.id });

      const clientToken = updated.client?.fcmToken;
      if (clientToken) {
        await sendNotification([clientToken], NOTIFICATION_TYPES.ORDER_IN_PROGRESS, 'Dépanneur arrivé !', 'Votre dépanneur est sur place.', { orderId: id });
      }

      const io = getIo(req);
      if (io) {
        io.to(`user:${order.clientId}`).emit('sos:depanneur_arrived', { orderId: id });
      }

      return res.json({ order: updated });
    } catch (err) {
      console.error('[SOS] start error:', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// ─────────────────────────────────────────────
// POST /api/sos/:id/complete — double confirmation
// ─────────────────────────────────────────────
router.post(
  '/:id/complete',
  authenticate,
  requireRole('CLIENT', 'DEPANNEUR'),
  async (req, res) => {
    const { id } = req.params;

    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          client: { select: { fcmToken: true } },
          provider: { select: { fcmToken: true } },
        },
      });
      if (!order) return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
      if (order.status !== 'IN_PROGRESS') return res.status(409).json({ error: `Order must be IN_PROGRESS (current: ${order.status})`, code: 'INVALID_STATE' });

      const isClient = order.clientId === req.user.id;
      const isProvider = order.providerId === req.user.id;
      if (!isClient && !isProvider) return res.status(403).json({ error: 'Not a party of this order', code: 'FORBIDDEN' });

      const meta = order.metadata || {};
      const confirmations = meta.confirmations || {};

      if (isClient && confirmations.client) return res.status(409).json({ error: 'Already confirmed', code: 'ALREADY_CONFIRMED' });
      if (isProvider && confirmations.provider) return res.status(409).json({ error: 'Already confirmed', code: 'ALREADY_CONFIRMED' });

      if (isClient) confirmations.client = new Date().toISOString();
      if (isProvider) confirmations.provider = new Date().toISOString();

      const bothConfirmed = confirmations.client && confirmations.provider;

      let updateData = { metadata: { ...meta, confirmations } };
      if (bothConfirmed) {
        updateData.status = 'COMPLETED';
        updateData.completedAt = new Date();

        if (meta.mode === 'INSURANCE') {
          updateData.metadata.insuranceBillingEvent = {
            orderId: id,
            insuranceContractId: meta.insuranceContractId,
            amount: order.price,
            completedAt: new Date().toISOString(),
          };
        }
      }

      const updated = await prisma.order.update({ where: { id }, data: updateData });

      await logEvent(id, isClient ? 'CLIENT_CONFIRMED' : 'DEPANNEUR_CONFIRMED', { by: req.user.id });

      if (bothConfirmed) {
        await logEvent(id, 'COMPLETED', { completedAt: new Date().toISOString() });

        // Award EasyPoints to client
        try {
          const SOS_POINTS = 15;
          await prisma.$transaction([
            prisma.user.update({
              where: { id: order.clientId },
              data: { loyaltyPoints: { increment: SOS_POINTS } },
            }),
            prisma.loyaltyTransaction.create({
              data: {
                userId: order.clientId,
                points: SOS_POINTS,
                description: 'Intervention SOS complétée — EasySOS',
                type: 'EARN',
              },
            }),
          ]);
        } catch {} // Non-blocking

        const tokens = [order.client?.fcmToken, order.provider?.fcmToken].filter(Boolean);
        if (tokens.length > 0) {
          await sendNotification(tokens, NOTIFICATION_TYPES.ORDER_COMPLETED, 'Intervention terminée', 'Merci d\'avoir utilisé EASYWAY SOS !', { orderId: id });
        }

        const io = getIo(req);
        if (io) {
          io.to(`user:${order.clientId}`).emit('sos:completed', { orderId: id });
          io.to(`user:${order.providerId}`).emit('sos:completed', { orderId: id });
        }
      }

      return res.json({ order: updated, bothConfirmed: !!bothConfirmed, waitingForOtherParty: !bothConfirmed });
    } catch (err) {
      console.error('[SOS] complete error:', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// ─────────────────────────────────────────────
// POST /api/sos/:id/cancel — CLIENT or DEPANNEUR cancels
// ─────────────────────────────────────────────
router.post(
  '/:id/cancel',
  authenticate,
  [
    body('reason').notEmpty().withMessage('reason is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { id } = req.params;
    const { reason } = req.body;

    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          client: { select: { fcmToken: true } },
          provider: { select: { fcmToken: true } },
        },
      });
      if (!order) return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });

      const isClient = order.clientId === req.user.id;
      const isProvider = order.providerId === req.user.id;
      const isAdmin = req.user.role === 'ADMIN';
      if (!isClient && !isProvider && !isAdmin) return res.status(403).json({ error: 'Not a party of this order', code: 'FORBIDDEN' });

      if (!['PENDING', 'ACCEPTED'].includes(order.status)) {
        return res.status(409).json({ error: 'Can only cancel when PENDING or ACCEPTED', code: 'INVALID_STATE' });
      }

      const updated = await prisma.order.update({ where: { id }, data: { status: 'CANCELLED' } });
      await logEvent(id, 'CANCELLED', { cancelledBy: req.user.id, role: req.user.role, reason });

      // If provider cancels after acceptance: re-notify remaining depanneurs
      if (isProvider && order.status === 'ACCEPTED') {
        const meta = order.metadata || {};
        const notifiedIds = meta.notifiedDepanneurs || [];
        const pendingIds = notifiedIds.filter((did) => did !== req.user.id);

        if (pendingIds.length > 0) {
          const remaining = await prisma.user.findMany({
            where: { id: { in: pendingIds }, kycStatus: 'APPROVED', isOnline: true },
            select: { id: true, fcmToken: true },
          });
          const tokens = remaining.map((u) => u.fcmToken).filter(Boolean);
          if (tokens.length > 0) {
            await sendNotification(tokens, NOTIFICATION_TYPES.ORDER_NEW, 'Demande SOS disponible', 'Un dépanneur s\'est désisté. La demande est à nouveau disponible.', { orderId: id });
          }
          const io = getIo(req);
          if (io) {
            remaining.forEach((d) => io.to(`user:${d.id}`).emit('sos:new_request', { orderId: id, reassigned: true }));
          }
        }
      }

      const tokens = [order.client?.fcmToken, order.provider?.fcmToken].filter(Boolean);
      if (tokens.length > 0) {
        await sendNotification(tokens, NOTIFICATION_TYPES.ORDER_CANCELLED, 'Demande SOS annulée', reason, { orderId: id });
      }

      const io = getIo(req);
      if (io) {
        if (order.clientId) io.to(`user:${order.clientId}`).emit('sos:cancelled', { orderId: id, reason });
        if (order.providerId) io.to(`user:${order.providerId}`).emit('sos:cancelled', { orderId: id, reason });
      }

      return res.json({ order: updated });
    } catch (err) {
      console.error('[SOS] cancel error:', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// ─────────────────────────────────────────────
// POST /api/sos/:id/counter-offer — CLIENT proposes counter price (±20%)
// ─────────────────────────────────────────────
router.post(
  '/:id/counter-offer',
  authenticate,
  requireRole('CLIENT'),
  [
    body('counterPrice').isFloat({ min: 0 }).withMessage('counterPrice must be a positive number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { id } = req.params;
    const { counterPrice } = req.body;

    try {
      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
      if (order.clientId !== req.user.id) return res.status(403).json({ error: 'Not your order', code: 'FORBIDDEN' });
      if (!['PENDING', 'QUOTED'].includes(order.status) && order.status !== 'PENDING') {
        return res.status(409).json({ error: `Order status is ${order.status}`, code: 'INVALID_STATE' });
      }

      const meta = order.metadata || {};
      const quotes = meta.quotes || [];
      if (quotes.length === 0) {
        return res.status(400).json({ error: 'No quotes available to counter', code: 'NO_QUOTES' });
      }

      // Use the best (lowest) quote as the original quote
      const originalQuote = quotes.reduce((min, q) => q.price < min.price ? q : min, quotes[0]);
      const originalPrice = parseFloat(originalQuote.price);
      const minAllowed = originalPrice * 0.8;
      const maxAllowed = originalPrice * 1.2;
      const cp = parseFloat(counterPrice);

      if (cp < minAllowed || cp > maxAllowed) {
        return res.status(422).json({
          error: `Le contre-prix doit être entre ${minAllowed.toFixed(3)} TND et ${maxAllowed.toFixed(3)} TND (±20% de ${originalPrice.toFixed(3)} TND)`,
          code: 'COUNTER_PRICE_OUT_OF_RANGE',
          minAllowed,
          maxAllowed,
        });
      }

      const updated = await prisma.order.update({
        where: { id },
        data: { counterPrice: cp },
      });

      await logEvent(id, 'COUNTER_OFFER', { clientId: req.user.id, counterPrice: cp, originalPrice });

      const io = getIo(req);
      if (io && order.providerId) {
        io.to(`user:${order.providerId}`).emit('sos:counter-offer', { orderId: id, counterPrice: cp, originalPrice });
      }
      // Notify all depanneurs who submitted quotes
      if (io && quotes.length > 0) {
        quotes.forEach((q) => {
          io.to(`user:${q.depanneurId}`).emit('sos:counter-offer', { orderId: id, counterPrice: cp, originalPrice });
        });
      }

      return res.json({ order: updated, counterPrice: cp });
    } catch (err) {
      console.error('[SOS] counter-offer error:', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// ─────────────────────────────────────────────
// POST /api/sos/:id/accept-counter — DEPANNEUR accepts the counter offer
// ─────────────────────────────────────────────
router.post(
  '/:id/accept-counter',
  authenticate,
  requireRole('DEPANNEUR'),
  async (req, res) => {
    const { id } = req.params;

    try {
      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });

      const meta = order.metadata || {};
      const quotes = meta.quotes || [];
      const myQuote = quotes.find((q) => q.depanneurId === req.user.id);
      if (!myQuote) return res.status(403).json({ error: 'You did not submit a quote for this order', code: 'FORBIDDEN' });

      if (!order.counterPrice) {
        return res.status(400).json({ error: 'No counter offer to accept', code: 'NO_COUNTER_OFFER' });
      }

      const finalPrice = order.counterPrice;

      const updated = await prisma.order.update({
        where: { id },
        data: {
          finalPrice,
          status: 'ACCEPTED',
          providerId: req.user.id,
          price: finalPrice.toString(),
          metadata: {
            ...meta,
            acceptedQuote: { ...myQuote, price: finalPrice },
          },
        },
        include: {
          client: { select: { fcmToken: true, id: true } },
        },
      });

      await logEvent(id, 'COUNTER_ACCEPTED', { depanneurId: req.user.id, finalPrice });

      const io = getIo(req);
      if (io) {
        io.to(`user:${order.clientId}`).emit('sos:quote_accepted', { orderId: id, finalPrice });
      }

      if (updated.client?.fcmToken) {
        await sendNotification(
          [updated.client.fcmToken],
          NOTIFICATION_TYPES.ORDER_ACCEPTED,
          'Prix négocié accepté !',
          `Le dépanneur a accepté votre contre-offre : ${parseFloat(finalPrice).toFixed(3)} TND`,
          { orderId: id }
        );
      }

      return res.json({ order: updated, finalPrice });
    } catch (err) {
      console.error('[SOS] accept-counter error:', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// ─────────────────────────────────────────────
// GET /api/sos/depanneur/requests — DEPANNEUR sees nearby PENDING requests
// ─────────────────────────────────────────────
router.get(
  '/depanneur/requests',
  authenticate,
  requireRole('DEPANNEUR'),
  async (req, res) => {
    try {
      const orders = await prisma.order.findMany({
        where: { serviceType: 'SOS', status: 'PENDING' },
        include: { client: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      return res.json({ orders, count: orders.length });
    } catch (err) {
      console.error('[SOS] depanneur/requests error:', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// ─────────────────────────────────────────────
// GET /api/sos/history — CLIENT order history
// ─────────────────────────────────────────────
router.get(
  '/history',
  authenticate,
  requireRole('CLIENT'),
  async (req, res) => {
    try {
      const orders = await prisma.order.findMany({
        where: { clientId: req.user.id, serviceType: 'SOS' },
        include: {
          provider: { select: { id: true, name: true, phone: true } },
          events: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ orders, count: orders.length });
    } catch (err) {
      console.error('[SOS] history error:', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// ─────────────────────────────────────────────
// GET /api/sos/:id — order details
// ─────────────────────────────────────────────
router.get(
  '/:id',
  authenticate,
  async (req, res) => {
    const { id } = req.params;

    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          client: { select: { id: true, name: true, phone: true } },
          provider: { select: { id: true, name: true, phone: true } },
          events: { orderBy: { createdAt: 'asc' } },
        },
      });
      if (!order) return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });

      const isParty = order.clientId === req.user.id || order.providerId === req.user.id;
      const isAdmin = req.user.role === 'ADMIN';
      if (!isParty && !isAdmin) return res.status(403).json({ error: 'Access denied', code: 'FORBIDDEN' });

      return res.json({ order });
    } catch (err) {
      console.error('[SOS] get error:', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// ─────────────────────────────────────────────
// POST /api/sos/:id/constat — save digital accident report
// ─────────────────────────────────────────────
router.post(
  '/:id/constat',
  authenticate,
  async (req, res) => {
    const { id } = req.params;

    try {
      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });

      const isParty = order.clientId === req.user.id || order.providerId === req.user.id;
      const isAdmin = req.user.role === 'ADMIN';
      if (!isParty && !isAdmin) return res.status(403).json({ error: 'Access denied', code: 'FORBIDDEN' });

      const meta = order.metadata || {};
      const constat = {
        ...req.body,
        submittedBy: req.user.id,
        submittedAt: new Date().toISOString(),
      };

      const updated = await prisma.order.update({
        where: { id },
        data: { metadata: { ...meta, constat } },
      });

      await logEvent(id, 'CONSTAT_SUBMITTED', { submittedBy: req.user.id });

      const io = getIo(req);
      if (io) {
        io.to(`user:${order.clientId}`).emit('sos:constat-submitted', { orderId: id });
        if (order.providerId) io.to(`user:${order.providerId}`).emit('sos:constat-submitted', { orderId: id });
      }

      return res.json({ success: true, message: 'Constat enregistré' });
    } catch (err) {
      console.error('[SOS] constat error:', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// PATCH /api/sos/orders/:id/status
router.patch('/orders/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status, ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}) },
    });
    return res.json({ order });
  } catch (err) {
    console.error('[sos/orders/status]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/sos/orders/:id/complete
router.patch('/orders/:id/complete', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
    return res.json({ order });
  } catch (err) {
    console.error('[sos/orders/complete]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────
// GET /api/sos/depanneur/dashboard
// ─────────────────────────────────────────────
router.get('/depanneur/dashboard', authenticate, requireRole('DEPANNEUR'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [user, activeOrders, historyOrders, reviews] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.user.id }, select: { isOnline: true } }),
      prisma.order.findMany({
        where: { providerId: req.user.id, status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] } },
        include: { client: { select: { name: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
        take: 1,
      }),
      prisma.order.findMany({
        where: { providerId: req.user.id, status: { in: ['COMPLETED', 'CANCELLED'] } },
        include: { client: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.review.aggregate({
        where: { targetId: req.user.id },
        _avg: { rating: true },
      }),
    ]);

    const todayOrders = historyOrders.filter((o) => new Date(o.createdAt) >= today);
    const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.price || 0), 0);

    return res.json({
      isOnline: user?.isOnline ?? false,
      activeIntervention: activeOrders[0] || null,
      history: historyOrders,
      stats: {
        interventions: todayOrders.filter((o) => o.status === 'COMPLETED').length,
        revenue: todayRevenue,
        rating: reviews._avg.rating ?? 5.0,
        streak: 0,
      },
    });
  } catch (err) {
    console.error('[sos/depanneur/dashboard]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/sos/depanneur/toggle
// ─────────────────────────────────────────────
router.patch('/depanneur/toggle', authenticate, requireRole('DEPANNEUR'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { isOnline: true } });
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { isOnline: !user?.isOnline },
    });
    return res.json({ isOnline: updated.isOnline });
  } catch (err) {
    console.error('[sos/depanneur/toggle]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
