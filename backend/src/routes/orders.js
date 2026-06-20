'use strict';
const express = require('express');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders/:id/rate — rate any order type
router.post('/:id/rate', authenticate, async (req, res) => {
  try {
    const { rating, tags, comment, tip, serviceType } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      select: { id: true, clientId: true, providerId: true, status: true },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'COMPLETED') return res.status(400).json({ error: 'Order not completed' });

    // Create review
    const review = await prisma.review.create({
      data: {
        orderId: order.id,
        reviewerId: req.user.id,
        targetId: order.providerId,
        rating: parseInt(rating),
        comment: comment || null,
      },
    });

    // Update provider average rating
    if (order.providerId) {
      const avg = await prisma.review.aggregate({
        where: { targetId: order.providerId },
        _avg: { rating: true },
      });
      await prisma.user.update({
        where: { id: order.providerId },
        data: { avgRating: avg._avg.rating || rating },
      });
    }

    // Apply tip to provider wallet
    if (tip && parseFloat(tip) > 0 && order.providerId) {
      const tipAmt = parseFloat(tip);
      await prisma.$transaction([
        prisma.user.update({ where: { id: req.user.id }, data: { walletBalance: { decrement: tipAmt } } }),
        prisma.user.update({ where: { id: order.providerId }, data: { walletBalance: { increment: tipAmt } } }),
        prisma.tip.create({
          data: { orderId: order.id, amount: tipAmt, fromUserId: req.user.id, toUserId: order.providerId },
        }),
      ]);
    }

    res.status(201).json({ review });
  } catch (err) {
    console.error('[orders/rate]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id — generic order fetch
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        provider: { select: { id: true, name: true, phone: true, avgRating: true } },
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/active', authenticate, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        clientId: req.user.id,
        status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] },
      },
      include: {
        provider: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
