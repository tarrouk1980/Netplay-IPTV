'use strict';
const express = require('express');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const PROVIDER_ROLES = ['CHAUFFEUR', 'LIVREUR', 'DEPANNEUR'];

function requireProvider(req, res, next) {
  if (!PROVIDER_ROLES.includes(req.user?.role)) {
    return res.status(403).json({ error: 'Provider role required', code: 'FORBIDDEN' });
  }
  next();
}

// GET /api/provider/earnings
router.get('/earnings', authenticate, requireProvider, async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days) || 14, 1), 90);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const orders = await prisma.order.findMany({
      where: {
        providerId: req.user.id,
        status: 'COMPLETED',
        completedAt: { gte: since },
      },
      select: {
        id: true,
        totalAmount: true,
        completedAt: true,
      },
      orderBy: { completedAt: 'asc' },
    });

    const totalTND = orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);
    const ordersCompleted = orders.length;
    const avgPerOrder = ordersCompleted > 0 ? totalTND / ordersCompleted : 0;

    // Build daily chart data
    const dailyMap = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - (days - 1 - i) * 86400000);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = 0;
    }
    orders.forEach(o => {
      const key = new Date(o.completedAt).toISOString().slice(0, 10);
      if (dailyMap[key] !== undefined) dailyMap[key] += Number(o.totalAmount || 0);
    });

    const labels = Object.keys(dailyMap);
    const data = labels.map(k => Math.round(dailyMap[k] * 100) / 100);

    // Top day
    let topDay = { date: labels[0] || '', amount: 0 };
    labels.forEach((date, i) => {
      if (data[i] > topDay.amount) topDay = { date, amount: data[i] };
    });

    // By hour (0-23)
    const byHour = Array(24).fill(0);
    orders.forEach(o => {
      const h = new Date(o.completedAt).getHours();
      byHour[h]++;
    });

    return res.json({
      totalTND: Math.round(totalTND * 100) / 100,
      ordersCompleted,
      avgPerOrder: Math.round(avgPerOrder * 100) / 100,
      topDay,
      chart: { labels, data },
      byHour,
    });
  } catch (err) {
    console.error('[provider/earnings]', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

module.exports = router;
