'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

// POST /api/insurance/contracts — CLIENT registers or updates their insurance contract
router.post(
  '/contracts',
  authenticate,
  requireRole('CLIENT'),
  [
    body('companyName').notEmpty().withMessage('companyName is required'),
    body('expiresAt').isISO8601().withMessage('expiresAt must be ISO8601'),
    body('quotaTotal').isInt({ min: 1 }).withMessage('quotaTotal must be a positive integer'),
    body('amountFixed').isFloat({ min: 0 }).withMessage('amountFixed must be a non-negative number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { companyName, expiresAt, quotaTotal, amountFixed } = req.body;

    try {
      const existing = await prisma.insuranceContract.findFirst({ where: { providerId: req.user.id } });
      const data = { companyName, expiresAt: new Date(expiresAt), quotaTotal, amountFixed };
      const contract = existing
        ? await prisma.insuranceContract.update({ where: { id: existing.id }, data })
        : await prisma.insuranceContract.create({ data: { providerId: req.user.id, ...data } });
      return res.status(201).json({ contract });
    } catch (err) {
      console.error('[Insurance] upsert error:', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// GET /api/insurance/contracts/me — CLIENT views own contract
router.get('/contracts/me', authenticate, requireRole('CLIENT'), async (req, res) => {
  try {
    const contract = await prisma.insuranceContract.findFirst({
      where: { providerId: req.user.id },
    });
    if (!contract) {
      return res.status(404).json({ error: 'No insurance contract found', code: 'NOT_FOUND' });
    }
    return res.json({ contract });
  } catch (err) {
    console.error('[Insurance] findFirst error:', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// GET /api/insurance/contracts — ADMIN lists all contracts
router.get('/contracts', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const contracts = await prisma.insuranceContract.findMany({
      include: { provider: { select: { id: true, name: true, phone: true, email: true } } },
      orderBy: { expiresAt: 'asc' },
    });
    return res.json({ contracts, count: contracts.length });
  } catch (err) {
    console.error('[Insurance] findMany error:', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

module.exports = router;
