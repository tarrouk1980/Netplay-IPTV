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

module.exports = router;
