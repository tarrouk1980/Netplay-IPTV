'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { initiatePayment, PLANS } = require('../services/payment');

const router = express.Router();

// GET /api/subscriptions/my
router.get('/my', authenticate, requireRole('CHAUFFEUR', 'LIVREUR', 'DEPANNEUR'), async (req, res) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        providerId: req.user.id,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ subscription: subscription || null });
  } catch (err) {
    console.error('[Subscriptions/My]', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/subscriptions/purchase
router.post(
  '/purchase',
  authenticate,
  requireRole('CHAUFFEUR', 'LIVREUR', 'DEPANNEUR'),
  [
    body('planType')
      .isIn(['DECOUVERTE', 'SEMAINE', 'MENSUEL', 'PRO'])
      .withMessage('Invalid planType'),
    body('paymentProvider')
      .optional()
      .isIn(['STRIPE', 'ORANGE_MONEY'])
      .withMessage('Invalid paymentProvider'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { planType, paymentProvider = 'STRIPE' } = req.body;
    const plan = PLANS[planType];

    try {
      // Initiate payment (stub)
      const reference = `sub_${req.user.id}_${Date.now()}`;
      const payment = await initiatePayment(paymentProvider, plan.priceMillimes, reference);

      const now = new Date();
      const expiresAt = new Date(now.getTime() + plan.days * 24 * 60 * 60 * 1000);
      const ridesTotal = plan.rides === Infinity ? 9999 : plan.rides;

      const subscription = await prisma.subscription.create({
        data: {
          providerId: req.user.id,
          planType,
          ridesTotal,
          ridesRemaining: ridesTotal,
          ridesConsumed: 0,
          expiresAt,
          status: 'ACTIVE',
          autoRenew: planType === 'SEMAINE',
        },
      });

      return res.status(201).json({ subscription, payment });
    } catch (err) {
      console.error('[Subscriptions/Purchase]', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// POST /api/subscriptions/consume — CRITICAL ATOMIC OPERATION
router.post(
  '/consume',
  authenticate,
  requireRole('CHAUFFEUR', 'LIVREUR', 'DEPANNEUR'),
  [
    body('orderId').trim().notEmpty().withMessage('orderId is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { orderId } = req.body;

    try {
      const result = await prisma.$transaction(async (tx) => {
        // SELECT FOR UPDATE via raw SQL to prevent race conditions
        const subs = await tx.$queryRaw`
          SELECT * FROM "Subscription"
          WHERE "providerId" = ${req.user.id}
            AND "status" = 'ACTIVE'
            AND "expiresAt" > NOW()
          ORDER BY "createdAt" DESC
          LIMIT 1
          FOR UPDATE
        `;

        const sub = subs[0];
        if (!sub) throw new Error('NO_ACTIVE_SUBSCRIPTION');

        // PRO plan: unlimited, skip decrement check
        if (sub.planType !== 'PRO') {
          if (sub.ridesRemaining <= 0) throw new Error('NO_RIDES_REMAINING');

          await tx.subscription.update({
            where: { id: sub.id },
            data: {
              ridesConsumed: { increment: 1 },
              ridesRemaining: { decrement: 1 },
            },
          });

          // Mark EXHAUSTED if now 0
          if (sub.ridesRemaining - 1 === 0) {
            await tx.subscription.update({
              where: { id: sub.id },
              data: { status: 'EXHAUSTED' },
            });
          }
        }

        // Mark order as pass consumed
        await tx.order.update({
          where: { id: orderId },
          data: { passConsumed: true },
        });

        return sub;
      });

      return res.json({ success: true, subscription: result });
    } catch (err) {
      if (err.message === 'NO_ACTIVE_SUBSCRIPTION') {
        console.error(`[Subscriptions/Consume] Admin Alert: User ${req.user.id} has no active subscription for order ${orderId}`);
        return res.status(402).json({ error: 'No active subscription', code: 'NO_ACTIVE_SUBSCRIPTION' });
      }
      if (err.message === 'NO_RIDES_REMAINING') {
        console.error(`[Subscriptions/Consume] Admin Alert: User ${req.user.id} has no rides remaining for order ${orderId}`);
        return res.status(402).json({ error: 'No rides remaining', code: 'NO_RIDES_REMAINING' });
      }
      console.error('[Subscriptions/Consume]', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

module.exports = router;
