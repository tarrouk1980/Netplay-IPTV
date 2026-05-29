'use strict';

const express = require('express');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { sendNotification, NOTIFICATION_TYPES } = require('../services/fcm');

const router = express.Router();

// All admin routes require ADMIN role
router.use(authenticate, requireRole('ADMIN'));

// ─────────────────────────────────────────────
// GET /api/admin/kyc/pending — list users awaiting KYC
// ─────────────────────────────────────────────
router.get('/kyc/pending', async (req, res) => {
  const users = await prisma.user.findMany({
    where: { kycStatus: 'PENDING' },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      kycStatus: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return res.json({ users, count: users.length });
});

// ─────────────────────────────────────────────
// POST /api/admin/kyc/:userId/approve
// ─────────────────────────────────────────────
router.post('/kyc/:userId/approve', async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
  }
  if (user.kycStatus === 'APPROVED') {
    return res.status(409).json({ error: 'KYC already approved', code: 'ALREADY_APPROVED' });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { kycStatus: 'APPROVED' },
    select: { id: true, name: true, phone: true, kycStatus: true, fcmToken: true },
  });

  // FCM notify the user
  if (updated.fcmToken) {
    await sendNotification(
      [updated.fcmToken],
      NOTIFICATION_TYPES.KYC_APPROVED,
      'KYC approuvé ✅',
      'Votre vérification d\'identité a été approuvée. Vous pouvez maintenant utiliser tous les services EASYWAY.',
      { userId }
    );
  }

  return res.json({ user: updated });
});

// ─────────────────────────────────────────────
// POST /api/admin/kyc/:userId/reject
// ─────────────────────────────────────────────
router.post('/kyc/:userId/reject', async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
  }
  if (user.kycStatus === 'REJECTED') {
    return res.status(409).json({ error: 'KYC already rejected', code: 'ALREADY_REJECTED' });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { kycStatus: 'REJECTED' },
    select: { id: true, name: true, phone: true, kycStatus: true, fcmToken: true },
  });

  if (updated.fcmToken) {
    await sendNotification(
      [updated.fcmToken],
      NOTIFICATION_TYPES.KYC_REJECTED,
      'KYC refusé ❌',
      reason
        ? `Votre vérification a été refusée : ${reason}`
        : 'Votre vérification d\'identité a été refusée. Veuillez contacter le support.',
      { userId, reason: reason || '' }
    );
  }

  return res.json({ user: updated, reason: reason || null });
});

module.exports = router;
