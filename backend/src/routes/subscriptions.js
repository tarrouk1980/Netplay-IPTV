'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

// Catalogue des passes — source unique de vérité
const PASS_CATALOG = {
  DAILY:    { label: 'Pass Journalier', priceTND: 1,  days: 1,   bonusDays: 0,  totalDays: 1  },
  SEMAINE:  { label: 'Pass Semaine',    priceTND: 6,  days: 7,   bonusDays: 1,  totalDays: 8  },
  MENSUEL:  { label: 'Pass Mensuel',    priceTND: 30, days: 30,  bonusDays: 5,  totalDays: 35 },
  PRO:      { label: 'Pass Pro',        priceTND: 75, days: 90,  bonusDays: 15, totalDays: 105 },
};

// GET /api/subscriptions/my
router.get('/my', authenticate, requireRole('CHAUFFEUR', 'LIVREUR', 'DEPANNEUR', 'MARCHAND'), async (req, res) => {
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

// GET /api/subscriptions/status
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
      return res.json({ hasActivePass: false, daysLeft: 0 });
    }

    const msLeft = new Date(subscription.expiresAt).getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

    return res.json({
      hasActivePass: true,
      daysLeft,
      planType: subscription.planType,
    });
  } catch (err) {
    console.error('[Subscriptions/Status]', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/subscriptions/buy
router.post(
  '/buy',
  authenticate,
  requireRole('CHAUFFEUR', 'LIVREUR', 'DEPANNEUR', 'MARCHAND'),
  [
    body('planType').isIn(['DAILY', 'SEMAINE', 'MENSUEL', 'PRO']).withMessage('planType invalide'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array()[0].msg, code: 'VALIDATION_ERROR' });
    }

    const { planType } = req.body;
    const plan = PASS_CATALOG[planType];

    if (!plan) {
      return res.status(400).json({ error: 'Plan inconnu', code: 'INVALID_PLAN' });
    }

    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + plan.totalDays * 24 * 60 * 60 * 1000);

      const subscription = await prisma.subscription.create({
        data: {
          providerId: req.user.id,
          planType,
          ridesTotal: 9999,
          ridesRemaining: 9999,
          ridesConsumed: 0,
          startDate: now,
          endDate: expiresAt,
          expiresAt,
          amount: plan.priceTND,
          status: 'ACTIVE',
          autoRenew: planType === 'DAILY',
        },
      });

      return res.status(201).json({
        success: true,
        subscription,
        message: `${plan.label} activé !${plan.bonusDays > 0 ? ` (+${plan.bonusDays} jours offerts)` : ''}`,
      });
    } catch (err) {
      console.error('[Subscriptions/Buy] Prisma error:', err.message, err.code);
      return res.status(500).json({ error: err.message || 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// POST /api/subscriptions/claim-trial — 1 jour offert, nouveaux comptes uniquement
router.post('/claim-trial', authenticate, requireRole('CHAUFFEUR', 'LIVREUR', 'DEPANNEUR', 'MARCHAND'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { createdAt: true },
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (new Date(user.createdAt) < sevenDaysAgo) {
      return res.status(403).json({ error: 'Essai gratuit expiré (compte créé il y a plus de 7 jours).', code: 'TRIAL_EXPIRED' });
    }

    const existingSub = await prisma.subscription.findFirst({ where: { providerId: req.user.id } });
    if (existingSub) {
      return res.status(409).json({ error: 'Essai déjà utilisé.', code: 'TRIAL_ALREADY_USED' });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const subscription = await prisma.subscription.create({
      data: {
        providerId: req.user.id,
        planType: 'DAILY',
        ridesTotal: 9999,
        ridesRemaining: 9999,
        ridesConsumed: 0,
        startDate: now,
        endDate: expiresAt,
        expiresAt,
        amount: 0,
        status: 'ACTIVE',
      },
    });

    return res.status(201).json({ success: true, message: 'Essai gratuit activé ! Valable 24h.', subscription });
  } catch (err) {
    console.error('[Subscriptions/ClaimTrial]', err.message);
    return res.status(500).json({ error: err.message || 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/subscriptions/consume — décrémenter un pass (pour prestataires par course)
router.post(
  '/consume',
  authenticate,
  requireRole('CHAUFFEUR', 'LIVREUR', 'DEPANNEUR'),
  [body('orderId').trim().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'orderId requis', code: 'VALIDATION_ERROR' });
    }

    const { orderId } = req.body;

    try {
      await prisma.$transaction(async (tx) => {
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

        await tx.order.update({ where: { id: orderId }, data: { passConsumed: true } });
      });

      return res.json({ success: true });
    } catch (err) {
      if (err.message === 'NO_ACTIVE_SUBSCRIPTION') {
        return res.status(402).json({ error: 'Pas de pass actif', code: 'NO_ACTIVE_SUBSCRIPTION' });
      }
      console.error('[Subscriptions/Consume]', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

module.exports = router;
