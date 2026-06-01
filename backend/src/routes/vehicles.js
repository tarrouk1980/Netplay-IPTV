'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

const VEHICLE_TYPES = ['NORMAL', 'EASYLADY', 'EASYACCESS'];

// ─────────────────────────────────────────────
// POST /api/vehicles — register a vehicle
// ─────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  requireRole('CHAUFFEUR'),
  [
    body('make').trim().notEmpty().withMessage('make is required'),
    body('model').trim().notEmpty().withMessage('model is required'),
    body('plate').trim().notEmpty().withMessage('plate is required'),
    body('licenseNumber').optional().trim(),
    body('vehicleType')
      .isIn(VEHICLE_TYPES)
      .withMessage(`vehicleType must be one of: ${VEHICLE_TYPES.join(', ')}`),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { make, model, plate, licenseNumber, vehicleType } = req.body;

    // Check for duplicate plate
    const existing = await prisma.vehicle.findUnique({ where: { plate } });
    if (existing) {
      return res.status(409).json({ error: 'A vehicle with this plate already exists', code: 'PLATE_DUPLICATE' });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        userId: req.user.id,
        make,
        model,
        plate: plate.toUpperCase().trim(),
        licenseNumber: licenseNumber || null,
        vehicleType,
        verified: false,
      },
    });

    return res.status(201).json({ vehicle });
  }
);

// ─────────────────────────────────────────────
// GET /api/vehicles/my — get own vehicle info
// ─────────────────────────────────────────────
router.get('/my', authenticate, async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    }).catch(() => null);
    return res.json({ vehicle: vehicle || null });
  } catch (err) {
    return res.json({ vehicle: null });
  }
});

// ─────────────────────────────────────────────
// POST /api/vehicles/my — upsert vehicle info
// ─────────────────────────────────────────────
router.post('/my', authenticate, async (req, res) => {
  try {
    const { vehicleType, brand, model, year, licensePlate, color, insuranceExpiry, techControlExpiry } = req.body;
    const existing = await prisma.vehicle.findFirst({ where: { userId: req.user.id } }).catch(() => null);
    let vehicle;
    if (existing) {
      vehicle = await prisma.vehicle.update({
        where: { id: existing.id },
        data: { vehicleType, brand, model, year, licensePlate, color, insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null, techControlExpiry: techControlExpiry ? new Date(techControlExpiry) : null },
      }).catch(() => existing);
    } else {
      vehicle = await prisma.vehicle.create({
        data: { userId: req.user.id, vehicleType, brand, model, year, licensePlate, color, insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null, techControlExpiry: techControlExpiry ? new Date(techControlExpiry) : null },
      }).catch(() => null);
    }
    return res.json({ success: true, vehicle });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
