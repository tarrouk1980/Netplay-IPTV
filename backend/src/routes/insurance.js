'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

// POST /api/insurance/contracts — CLIENT registers or updates their insurance contract
router.post(
  '/contracts',
  requireRole('CLIENT'),
  [
    body('insurerId').notEmpty().withMessage('insurerId is required'),
    body('contractNumber').notEmpty().withMessage('contractNumber is required'),
    body('expiresAt').isISO8601().withMessage('expiresAt must be ISO8601'),
    body('coverageTypes').isArray({ min: 1 }).withMessage('coverageTypes must be a non-empty array'),
    body('coverageTypes.*').isIn(['REMORQUAGE', 'PANNE', 'ACCIDENT']).withMessage('Invalid coverageType'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { insurerId, contractNumber, expiresAt, coverageTypes } = req.body;

    try {
      const contract = await prisma.insuranceContract.upsert({
        where: { userId: req.user.id },
        update: { insurerId, contractNumber, expiresAt: new Date(expiresAt), coverageTypes },
        create: { userId: req.user.id, insurerId, contractNumber, expiresAt: new Date(expiresAt), coverageTypes },
      });
      return res.status(201).json({ contract });
    } catch (err) {
      console.error('[Insurance] upsert error:', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// GET /api/insurance/contracts/me — CLIENT views own contract
router.get('/contracts/me', requireRole('CLIENT'), async (req, res) => {
  try {
    const contract = await prisma.insuranceContract.findUnique({
      where: { userId: req.user.id },
    });
    if (!contract) {
      return res.status(404).json({ error: 'No insurance contract found', code: 'NOT_FOUND' });
    }
    return res.json({ contract });
  } catch (err) {
    console.error('[Insurance] findUnique error:', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// GET /api/insurance/contracts — ADMIN lists all contracts
router.get('/contracts', requireRole('ADMIN'), async (req, res) => {
  try {
    const contracts = await prisma.insuranceContract.findMany({
      include: { user: { select: { id: true, name: true, phone: true, email: true } } },
      orderBy: { expiresAt: 'asc' },
    });
    return res.json({ contracts, count: contracts.length });
  } catch (err) {
    console.error('[Insurance] findMany error:', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

module.exports = router;
