'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    return false;
  }
  return true;
}

// EasyCar is a marketplace: rental agencies list their vehicles as Merchant
// (category=CAR_RENTAL) + Product rows (already served by GET /api/merchants),
// EasyWay takes a commission per booking.
const COMMISSION_RATE = 0.12;

// POST /api/car-rental/book — CLIENT books a vehicle from a partner agency
router.post(
  '/book',
  authenticate,
  requireRole('CLIENT'),
  [
    body('vehicleId').isString().notEmpty(),
    body('days').isInt({ min: 1, max: 60 }),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;
    const { vehicleId, days } = req.body;

    const vehicle = await prisma.product.findUnique({
      where: { id: vehicleId },
      include: { merchant: { include: { user: { select: { id: true, fcmToken: true } } } } },
    });
    if (!vehicle || vehicle.merchant.category !== 'CAR_RENTAL') {
      return res.status(404).json({ error: 'Vehicle not found', code: 'NOT_FOUND' });
    }
    if (!vehicle.active || vehicle.stock < 1) {
      return res.status(409).json({ error: 'Vehicle is not available', code: 'VEHICLE_UNAVAILABLE' });
    }

    const priceDay = parseFloat(vehicle.price);
    const total = parseFloat((priceDay * days).toFixed(3));
    const commission = parseFloat((total * COMMISSION_RATE).toFixed(3));
    const deposit = vehicle.metadata?.deposit || 0;

    const order = await prisma.order.create({
      data: {
        clientId: req.user.id,
        providerId: vehicle.merchant.userId,
        serviceType: 'CAR_RENTAL',
        status: 'PENDING',
        originLat: vehicle.merchant.lat || 0,
        originLng: vehicle.merchant.lng || 0,
        originAddress: vehicle.merchant.address,
        price: total.toString(),
        metadata: {
          vehicleId: vehicle.id,
          vehicleName: vehicle.name,
          agencyName: vehicle.merchant.name,
          days,
          priceDay,
          total,
          deposit,
          commission,
          commissionRate: COMMISSION_RATE,
        },
      },
    });

    return res.status(201).json({ order, total, deposit, commission });
  }
);

module.exports = router;
