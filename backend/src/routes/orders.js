'use strict';
const express = require('express');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { getPosition } = require('../services/geolocation');

const router = express.Router();

// GET /api/orders/:id/tracking — generic live tracking info
router.get('/:id/tracking', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        provider: { select: { id: true, name: true, avgRating: true } },
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const position = order.providerId
      ? await getPosition(order.providerId, order.serviceType).catch(() => null)
      : null;
    res.json({
      order: { id: order.id, status: order.status },
      provider: order.provider ? {
        name: order.provider.name,
        rating: order.provider.avgRating,
        lat: position?.lat ?? null,
        lng: position?.lng ?? null,
      } : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// GET /api/orders/:id/invoice — derive an invoice view from a real order
router.get('/:id/invoice', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        provider: { select: { id: true, name: true, phone: true } },
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.clientId !== req.user.id && order.providerId !== req.user.id) {
      return res.status(403).json({ error: 'Not your order' });
    }

    const total = Number(order.finalPrice ?? order.price ?? 0);
    res.json({
      invoiceId: `INV-${order.id.slice(-8).toUpperCase()}`,
      date: order.completedAt || order.createdAt,
      status: order.status === 'COMPLETED' ? 'paid' : order.status.toLowerCase(),
      client: { name: order.client?.name, phone: order.client?.phone },
      service: order.serviceType,
      items: [{ label: order.serviceType, amount: total }],
      subtotal: total,
      discount: 0,
      total,
      paymentMethod: order.metadata?.paymentMethod || 'N/A',
      driver: order.provider ? { name: order.provider.name, vehicle: order.metadata?.vehicle || '' } : null,
    });
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

// POST /api/orders/:id/cancel
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.clientId !== req.user.id && order.providerId !== req.user.id) {
      return res.status(403).json({ error: 'Not your order' });
    }
    if (['COMPLETED', 'CANCELLED'].includes(order.status)) {
      return res.status(400).json({ error: `Order already ${order.status.toLowerCase()}` });
    }
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CANCELLED',
        metadata: { ...(order.metadata || {}), cancelReason: reason || null, cancelledBy: req.user.id },
      },
    });
    res.json({ order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders/:id/dispute
router.post('/:id/dispute', authenticate, async (req, res) => {
  try {
    const { disputeType, urgency, description } = req.body;
    if (!description || description.trim().length < 10) {
      return res.status(400).json({ error: 'Description must be at least 10 characters' });
    }
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const dispute = await prisma.dispute.create({
      data: {
        orderId: order.id,
        reporterId: req.user.id,
        reason: `[${disputeType || 'other'}/${urgency || 'low'}] ${description.trim()}`,
      },
    });
    res.status(201).json({ ticketId: dispute.id, dispute });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
