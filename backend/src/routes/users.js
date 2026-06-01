'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

// GET /api/users/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, phone: true, email: true,
        role: true, kycStatus: true, fcmToken: true,
        createdAt: true, updatedAt: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    return res.json(user);
  } catch (err) {
    console.error('[Users/Me]', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// PATCH /api/users/me
router.patch(
  '/me',
  authenticate,
  [
    body('name').optional().trim().notEmpty(),
    body('email').optional().isEmail(),
    body('fcmToken').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { name, email, fcmToken } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (fcmToken !== undefined) data.fcmToken = fcmToken;

    try {
      const user = await prisma.user.update({
        where: { id: req.user.id },
        data,
        select: { id: true, name: true, phone: true, email: true, role: true, kycStatus: true, fcmToken: true },
      });
      return res.json(user);
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
      console.error('[Users/PATCH/Me]', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// POST /api/users/me/kyc — CHAUFFEUR and DEPANNEUR only
router.post(
  '/me/kyc',
  authenticate,
  requireRole('CHAUFFEUR', 'DEPANNEUR'),
  [
    body('documentType').trim().notEmpty().withMessage('documentType is required'),
    body('documentUrl').trim().notEmpty().withMessage('documentUrl is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { documentType, documentUrl } = req.body;

    try {
      // Update user KYC status to PENDING
      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { kycStatus: 'PENDING' },
        select: { id: true, name: true, role: true, kycStatus: true },
      });

      // Log KYC submission event (using OrderEvent concept as a general event log)
      // Since OrderEvent requires orderId, we store this in Redis or a separate mechanism
      // For now, log to console and notify admin via console
      console.log(`[KYC Submission] User ${req.user.id} (${user.role}) submitted KYC: ${documentType} - ${documentUrl}`);
      console.log(`[KYC Admin Alert] New KYC pending review for user ${req.user.id}`);

      return res.json({
        message: 'KYC documents submitted successfully. Under review.',
        kycStatus: user.kycStatus,
      });
    } catch (err) {
      console.error('[Users/KYC]', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// POST /api/users/me/fcm-token — register FCM token
router.post('/me/fcm-token', authenticate, async (req, res) => {
  const { fcmToken } = req.body;
  if (!fcmToken) {
    return res.status(400).json({ error: 'fcmToken is required', code: 'MISSING_FIELD' });
  }
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { fcmToken },
    });
    return res.json({ success: true });
  } catch (err) {
    console.error('[Users/FCM-Token]', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// GET /api/users/me/orders — paginated order history
router.get('/me/orders', authenticate, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { clientId: req.user.id },
          { providerId: req.user.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        serviceType: true,
        status: true,
        price: true,
        finalPrice: true,
        originAddress: true,
        destinationAddress: true,
        createdAt: true,
        completedAt: true,
        clientId: true,
        providerId: true,
      },
    });
    return res.json({ orders, count: orders.length });
  } catch (err) {
    console.error('[Users/Orders]', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// GET /api/users/provider/:userId/profile — public provider profile
router.get('/provider/:userId/profile', authenticate, async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
        rating: true,
        totalRides: true,
        vehicle: {
          select: { vehicleType: true, make: true, model: true },
          take: 1,
        },
      },
    });
    if (!user) {
      return res.status(404).json({ error: 'Provider not found', code: 'NOT_FOUND' });
    }
    // Return public info only
    return res.json({
      id: user.id,
      name: user.name,
      role: user.role,
      rating: user.rating || 0,
      totalRides: user.totalRides || 0,
      vehicleType: user.vehicle?.[0]?.vehicleType || null,
      vehicleMake: user.vehicle?.[0]?.make || null,
      vehicleModel: user.vehicle?.[0]?.model || null,
    });
  } catch (err) {
    console.error('[Users/Provider/Profile]', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// GET /api/users/provider/:userId/reviews
router.get('/provider/:userId/reviews', authenticate, async (req, res) => {
  try {
    const ratings = await prisma.rating.findMany({
      where: { providerId: req.params.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        client: { select: { name: true } },
      },
    });
    const formatted = ratings.map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      clientName: r.client?.name || 'Client anonyme',
      createdAt: r.createdAt,
    }));
    return res.json(formatted);
  } catch (err) {
    console.error('[users/provider/reviews]', err);
    return res.json([]);
  }
});

// GET /api/users/me/activity — 5 dernières commandes du CLIENT tous services confondus
router.get('/me/activity', authenticate, async (req, res) => {
  const SERVICE_META = {
    TAXI: { label: 'EasyTaxy', emoji: '🚕' },
    SOS: { label: 'SOS Remorquage', emoji: '🚛' },
    DELIVERY: { label: 'Livraison', emoji: '🛵' },
    GROCERY: { label: 'Courses', emoji: '🛒' },
  };

  try {
    const orders = await prisma.order.findMany({
      where: { clientId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, serviceType: true, status: true, price: true, finalPrice: true, createdAt: true },
    });

    const activity = orders.map((o) => {
      const meta = SERVICE_META[o.serviceType] || { label: o.serviceType, emoji: '📦' };
      return {
        id: o.id,
        type: o.serviceType,
        label: meta.label,
        emoji: meta.emoji,
        status: o.status,
        price: o.finalPrice ?? o.price,
        createdAt: o.createdAt,
      };
    });

    return res.json({ activity });
  } catch (err) {
    console.error('[Users/Activity]', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/users/provider-onboarding — soumettre dossier prestataire
router.post('/provider-onboarding', authenticate, async (req, res) => {
  try {
    const { role, name, phone, cin, city, vehicle, hasDocuments } = req.body;
    if (!role || !name || !cin) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    // Update user role to pending review state
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name.trim(),
        // Store pending role application in metadata or a dedicated field
        // For now: mark KYC as PENDING and store vehicle info
        kycStatus: 'PENDING',
      },
    }).catch(() => {});

    // TODO: store vehicle info, cin, documents in dedicated tables
    // For now: log for admin review
    console.log(`[ProviderOnboarding] User ${req.user.id} applied for role ${role}`, { cin, city, vehicle });

    res.json({
      success: true,
      message: 'Votre candidature a été reçue. Vérification sous 24-48h.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Address book (in-memory until schema supports it) ─────────────────────
const addressStore = new Map(); // userId → [{id, label, type, address, lat, lng}]

router.get('/addresses', authenticate, (req, res) => {
  res.json({ addresses: addressStore.get(req.user.id) || [] });
});

router.post('/addresses', authenticate, (req, res) => {
  const { label, type, address, lat, lng } = req.body;
  if (!label?.trim() || !address?.trim()) {
    return res.status(400).json({ error: 'label and address required' });
  }
  const list = addressStore.get(req.user.id) || [];
  const entry = { id: `addr_${Date.now()}`, label: label.trim(), type: type || 'CUSTOM', address: address.trim(), lat: lat || null, lng: lng || null };
  addressStore.set(req.user.id, [...list, entry]);
  res.status(201).json({ address: entry });
});

router.put('/addresses/:id', authenticate, (req, res) => {
  const list = addressStore.get(req.user.id) || [];
  const idx = list.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Address not found' });
  const updated = { ...list[idx], ...req.body, id: list[idx].id };
  list[idx] = updated;
  addressStore.set(req.user.id, list);
  res.json({ address: updated });
});

router.delete('/addresses/:id', authenticate, (req, res) => {
  const list = addressStore.get(req.user.id) || [];
  addressStore.set(req.user.id, list.filter(a => a.id !== req.params.id));
  res.json({ success: true });
});

// GET /api/users/nearby-providers?lat=&lng=
router.get('/nearby-providers', authenticate, async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 36.8065;
    const lng = parseFloat(req.query.lng) || 10.1815;
    const radius = parseFloat(req.query.radius) || 10; // km

    const providers = await prisma.user.findMany({
      where: {
        role: { in: ['CHAUFFEUR', 'LIVREUR', 'DEPANNEUR'] },
        isOnline: true,
        lastLat: { not: null },
        lastLng: { not: null },
      },
      select: {
        id: true, name: true, role: true, rating: true,
        lastLat: true, lastLng: true, vehicleInfo: true,
      },
    });

    const toRad = d => (d * Math.PI) / 180;
    const haversine = (la1, lo1, la2, lo2) => {
      const R = 6371;
      const dLat = toRad(la2 - la1);
      const dLon = toRad(lo2 - lo1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(la1)) * Math.cos(toRad(la2)) * Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const nearby = providers
      .map(p => ({ ...p, distance: Math.round(haversine(lat, lng, p.lastLat, p.lastLng) * 10) / 10 }))
      .filter(p => p.distance <= radius);

    const roleMap = { CHAUFFEUR: 'TAXI', LIVREUR: 'DELIVERY', DEPANNEUR: 'SOS' };
    const result = { TAXI: [], SOS: [], DELIVERY: [] };
    nearby.forEach(p => {
      const key = roleMap[p.role];
      if (key) result[key].push({ id: p.id, name: p.name, lat: p.lastLat, lng: p.lastLng, rating: p.rating || 4.5, distance: p.distance });
    });

    res.json({ providers: result });
  } catch (err) {
    console.error('[NearbyProviders]', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/clients/favorites — list favorite providers
// ─────────────────────────────────────────────
router.get('/clients/favorites', authenticate, async (req, res) => {
  try {
    const favs = await prisma.favoriteProvider.findMany({
      where: { clientId: req.user.id },
      include: {
        provider: {
          select: { id: true, name: true, phone: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []);

    const providerIds = favs.map((f) => f.providerId);
    const reviews = providerIds.length
      ? await prisma.review.groupBy({
          by: ['targetId'],
          where: { targetId: { in: providerIds } },
          _avg: { rating: true },
          _count: { _all: true },
        }).catch(() => [])
      : [];

    const ratingMap = Object.fromEntries(reviews.map((r) => [r.targetId, { rating: r._avg.rating, totalOrders: r._count._all }]));

    const favorites = favs.map((f) => ({
      ...f.provider,
      ...ratingMap[f.providerId],
    }));

    return res.json({ favorites });
  } catch (err) {
    console.error('[clients/favorites]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/clients/favorites/:providerId
// ─────────────────────────────────────────────
router.delete('/clients/favorites/:providerId', authenticate, async (req, res) => {
  try {
    await prisma.favoriteProvider.deleteMany({
      where: { clientId: req.user.id, providerId: req.params.providerId },
    }).catch(() => {});
    return res.json({ success: true });
  } catch (err) {
    console.error('[clients/favorites/delete]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────
// POST /api/clients/favorites/:providerId
// ─────────────────────────────────────────────
router.post('/clients/favorites/:providerId', authenticate, async (req, res) => {
  try {
    await prisma.favoriteProvider.upsert({
      where: { clientId_providerId: { clientId: req.user.id, providerId: req.params.providerId } },
      update: {},
      create: { clientId: req.user.id, providerId: req.params.providerId },
    }).catch(() => {});
    return res.json({ success: true });
  } catch (err) {
    console.error('[clients/favorites/add]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
