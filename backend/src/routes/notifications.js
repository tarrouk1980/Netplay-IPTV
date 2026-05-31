'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { sendNotification } = require('../services/fcm');

const router = express.Router();

// POST /api/notifications/send — Admin only
router.post(
  '/send',
  authenticate,
  requireRole('ADMIN'),
  [
    body('userIds').isArray({ min: 1 }).withMessage('userIds must be a non-empty array'),
    body('type').trim().notEmpty().withMessage('type is required'),
    body('title').trim().notEmpty().withMessage('title is required'),
    body('body').trim().notEmpty().withMessage('body is required'),
    body('data').optional().isObject(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { userIds, type, title, body: notifBody, data } = req.body;

    try {
      // Fetch FCM tokens for the specified users
      const users = await prisma.user.findMany({
        where: { id: { in: userIds }, fcmToken: { not: null } },
        select: { id: true, fcmToken: true },
      });

      const tokens = users.map((u) => u.fcmToken).filter(Boolean);

      if (tokens.length === 0) {
        return res.json({ message: 'No FCM tokens found for specified users', sent: 0, results: [] });
      }

      const results = await sendNotification(tokens, type, title, notifBody, data || {});

      return res.json({
        message: 'Notifications dispatched',
        sent: tokens.length,
        results,
      });
    } catch (err) {
      console.error('[Notifications/Send]', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// POST /api/notifications/register-token — any authenticated user
router.post(
  '/register-token',
  authenticate,
  [
    body('fcmToken').trim().notEmpty().withMessage('fcmToken is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { fcmToken } = req.body;

    try {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { fcmToken },
      });
      return res.json({ message: 'FCM token registered successfully' });
    } catch (err) {
      console.error('[Notifications/RegisterToken]', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// POST /api/notifications/weather-check — Admin: déclencher vérification météo manuellement
router.post('/weather-check', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    const { checkWeatherAndNotify } = require('../services/weatherNotifier');
    const result = await checkWeatherAndNotify(
      req.body.lat || 36.8,
      req.body.lng || 10.18
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
