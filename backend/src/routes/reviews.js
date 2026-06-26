'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/reviews/:targetId — list reviews received by a user
router.get('/:targetId', authenticate, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { targetId: req.params.targetId },
      orderBy: { createdAt: 'desc' },
      include: { reviewer: { select: { name: true } } },
    });

    return res.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        author: r.reviewer?.name || 'Utilisateur',
        date: r.createdAt.toLocaleDateString('fr-TN'),
        rating: r.rating,
        comment: r.comment || '',
      })),
      count: reviews.length,
    });
  } catch (err) {
    console.error('[Reviews/List]', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/reviews — submit a review for a user (optionally tied to an order)
router.post(
  '/',
  authenticate,
  [
    body('targetId').notEmpty().withMessage('targetId is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be between 1 and 5'),
    body('comment').optional().isString(),
    body('orderId').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { targetId, rating, comment, orderId } = req.body;
    if (targetId === req.user.id) {
      return res.status(400).json({ error: 'Cannot review yourself', code: 'INVALID_TARGET' });
    }

    try {
      if (orderId) {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
          return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
        }
        const isParty = order.clientId === req.user.id || order.providerId === req.user.id;
        if (!isParty) {
          return res.status(403).json({ error: 'Not your order', code: 'FORBIDDEN' });
        }
        const targetIsOtherParty = order.clientId === targetId || order.providerId === targetId;
        if (!targetIsOtherParty) {
          return res.status(400).json({ error: 'targetId must be the other party on this order', code: 'INVALID_TARGET' });
        }
      }

      const review = await prisma.review.create({
        data: { targetId, reviewerId: req.user.id, rating, comment: comment || null, orderId: orderId || null },
      });

      const agg = await prisma.review.aggregate({
        where: { targetId },
        _avg: { rating: true },
      });
      await prisma.user.update({
        where: { id: targetId },
        data: { avgRating: agg._avg.rating || 0 },
      });

      return res.status(201).json({ review });
    } catch (err) {
      console.error('[Reviews/Create]', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

module.exports = router;
