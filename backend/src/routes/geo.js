'use strict';

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { updatePosition, findNearby } = require('../services/geolocation');
const { redisClient } = require('../config/redis');

const router = express.Router();

// POST /api/geo/update — CHAUFFEUR, LIVREUR, DEPANNEUR
router.post(
  '/update',
  authenticate,
  requireRole('CHAUFFEUR', 'LIVREUR', 'DEPANNEUR'),
  [
    body('lat').isFloat({ min: -90, max: 90 }).withMessage('lat must be a valid latitude'),
    body('lng').isFloat({ min: -180, max: 180 }).withMessage('lng must be a valid longitude'),
    body('serviceType')
      .isIn(['TAXI', 'SOS', 'DELIVERY', 'GROCERY'])
      .withMessage('Invalid serviceType'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { lat, lng, serviceType } = req.body;

    try {
      await updatePosition(req.user.id, lat, lng, serviceType);

      // Publish to Redis channel for Socket.io broadcast
      await redisClient.publish(
        'geo:updates',
        JSON.stringify({ userId: req.user.id, lat, lng, serviceType })
      );

      return res.json({ ok: true, userId: req.user.id, lat, lng, serviceType });
    } catch (err) {
      console.error('[Geo/Update]', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// GET /api/geo/nearby
router.get(
  '/nearby',
  authenticate,
  [
    query('lat').isFloat({ min: -90, max: 90 }).withMessage('lat is required and must be valid'),
    query('lng').isFloat({ min: -180, max: 180 }).withMessage('lng is required and must be valid'),
    query('radius').optional().isFloat({ min: 0.1, max: 100 }),
    query('serviceType')
      .isIn(['TAXI', 'SOS', 'DELIVERY', 'GROCERY'])
      .withMessage('serviceType is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius || '5');
    const { serviceType } = req.query;

    try {
      const providers = await findNearby(lat, lng, radius, serviceType);
      return res.json({ providers, count: providers.length });
    } catch (err) {
      console.error('[Geo/Nearby]', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

module.exports = router;
