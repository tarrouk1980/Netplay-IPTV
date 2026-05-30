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

// GET /api/subscriptions/status — authenticated provider
router.get('/status', authenticate, requireRole('CHAUFFEUR', 'LIVREUR', 'DEPANNEUR', 'MARCHAND'), async (req, res) => {
  try {
    const now = new Date();
    const subscription = await prisma.subscription.findFirst({
      where: {
        providerId: req.user.id,
        status: 'ACTIVE',
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return res.json({ hasActivePass: false, daysLeft: 0, balance: 0 });
    }

    const msLeft = new Date(subscription.expiresAt).getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

    return res.json({
      hasActivePass: true,
      daysLeft,
      balance: parseFloat(subscription.amount || 0),
    });
  } catch (err) {
    console.error('[Subscriptions/Status]', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/subscriptions/claim-trial — authenticated provider
router.post('/claim-trial', authenticate, requireRole('CHAUFFEUR', 'LIVREUR', 'DEPANNEUR', 'MARCHAND'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { createdAt: true },
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (new Date(user.createdAt) < sevenDaysAgo) {
      return res.status(403).json({ error: 'Essai gratuit expiré. Votre compte a été créé il y a plus de 7 jours.', code: 'TRIAL_EXPIRED' });
    }

    // Check if user ever had a subscription
    const existingSub = await prisma.subscription.findFirst({
      where: { providerId: req.user.id },
    });

    if (existingSub) {
      return res.status(409).json({ error: 'Vous avez déjà eu un abonnement. L\'essai gratuit n\'est disponible que pour les nouveaux comptes.', code: 'TRIAL_ALREADY_USED' });
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const subscription = await prisma.subscription.create({
      data: {
        providerId: req.user.id,
        planType: 'DAILY',
        ridesTotal: 99,
        ridesRemaining: 99,
        ridesConsumed: 0,
        startDate: now,
        endDate,
        expiresAt: endDate,
        amount: 0,
        status: 'ACTIVE',
      },
    });

    return res.status(201).json({ success: true, message: 'Essai gratuit activé !', subscription });
  } catch (err) {
    console.error('[Subscriptions/ClaimTrial]', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/subscriptions/buy — buy a daily pass
router.post(
  '/buy',
  authenticate,
  requireRole('CHAUFFEUR', 'LIVREUR', 'DEPANNEUR', 'MARCHAND'),
  [
    body('planType').optional().isIn(['DAILY', 'DECOUVERTE', 'SEMAINE', 'MENSUEL', 'PRO']).withMessage('Invalid planType'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { planType = 'DAILY' } = req.body;

    try {
      const now = new Date();
      let expiresAt, amount, ridesTotal;

      if (planType === 'DAILY') {
        expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        amount = 1;
        ridesTotal = 99;
      } else {
        const plan = PLANS[planType];
        if (!plan) return res.status(400).json({ error: 'Invalid planType', code: 'INVALID_PLAN' });
        expiresAt = new Date(now.getTime() + plan.days * 24 * 60 * 60 * 1000);
        amount = plan.priceMillimes / 1000;
        ridesTotal = plan.rides === Infinity ? 9999 : plan.rides;
      }

      const subscription = await prisma.subscription.create({
        data: {
          providerId: req.user.id,
          planType,
          ridesTotal,
          ridesRemaining: ridesTotal,
          ridesConsumed: 0,
          startDate: now,
          endDate: expiresAt,
          expiresAt,
          amount,
          status: 'ACTIVE',
        },
      });

      return res.status(201).json({ success: true, subscription });
    } catch (err) {
      console.error('[Subscriptions/Buy]', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

module.exports = router;
