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

// In-memory schedule store per provider (replace with DB column when schema updated)
const scheduleStore = new Map();

// GET /api/provider/schedule
router.get('/schedule', requireProvider, async (req, res) => {
  const schedule = scheduleStore.get(req.user.id) || null;
  res.json({ schedule });
});

// POST /api/provider/schedule
router.post('/schedule', requireProvider, async (req, res) => {
  const { schedule } = req.body;
  if (!schedule || typeof schedule !== 'object') {
    return res.status(400).json({ error: 'schedule object required' });
  }
  scheduleStore.set(req.user.id, schedule);
  res.json({ success: true, schedule });
});

// POST /api/provider/vehicle-checklist
router.post('/vehicle-checklist', requireProvider, async (req, res) => {
  const { checkedItems, totalItems, completedAt } = req.body;
  // Log to DB if model exists, otherwise just ack
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { updatedAt: new Date() },
    });
  } catch {}
  res.json({ success: true, checkedItems: checkedItems?.length || 0, totalItems });
});

// GET /api/provider/income?month=N&year=N
router.get('/income', requireProvider, async (req, res) => {
  try {
    const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { name: true, role: true },
    });

    const orders = await prisma.order.findMany({
      where: {
        providerId: req.user.id,
        status: 'COMPLETED',
        createdAt: { gte: startDate, lt: endDate },
      },
      select: { price: true, createdAt: true, type: true },
    });

    const totalGross = orders.reduce((s, o) => s + Number(o.price || 0), 0);
    const ordersCount = orders.length;
    const avgPerOrder = ordersCount > 0 ? totalGross / ordersCount : 0;

    // Work days (distinct dates)
    const workDays = new Set(orders.map(o => o.createdAt.toISOString().split('T')[0])).size;

    // Best day
    const byDate = {};
    orders.forEach(o => {
      const d = o.createdAt.toISOString().split('T')[0];
      byDate[d] = (byDate[d] || 0) + Number(o.price || 0);
    });
    const bestDayEntry = Object.entries(byDate).sort((a, b) => b[1] - a[1])[0];
    const bestDay = bestDayEntry ? { date: bestDayEntry[0], amount: bestDayEntry[1] } : { date: '-', amount: 0 };

    // Weekly breakdown (up to 4 weeks)
    const byWeek = [
      { week: 'S1 (1-7)', amount: 0 },
      { week: 'S2 (8-14)', amount: 0 },
      { week: 'S3 (15-21)', amount: 0 },
      { week: 'S4 (22-31)', amount: 0 },
    ];
    orders.forEach(o => {
      const day = o.createdAt.getDate();
      const wi = day <= 7 ? 0 : day <= 14 ? 1 : day <= 21 ? 2 : 3;
      byWeek[wi].amount += Number(o.price || 0);
    });

    // By service
    const serviceMap = {};
    orders.forEach(o => {
      serviceMap[o.type] = serviceMap[o.type] || { service: o.type, count: 0, amount: 0 };
      serviceMap[o.type].count++;
      serviceMap[o.type].amount += Number(o.price || 0);
    });

    res.json({
      providerName: user?.name || 'Prestataire',
      role: user?.role || req.user.role,
      totalGross,
      platformFee: 0,
      totalNet: totalGross,
      ordersCount,
      avgPerOrder,
      workDays,
      bestDay,
      byService: Object.values(serviceMap),
      byWeek,
      taxNote: 'Revenus soumis à l\'impôt sur le revenu (IR) selon le barème tunisien en vigueur.',
    });
  } catch (err) {
    console.error('[provider/income]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/provider/reviews — ratings received as provider
router.get('/reviews', authenticate, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { providerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        client: { select: { name: true } },
        order: { select: { serviceType: true } },
      },
    });
    res.json({
      reviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        serviceType: r.order?.serviceType,
        clientName: r.client?.name,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/earnings-goal', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOf28Days = new Date(now - 28 * 86400000);

    const [daily, weekly, monthly, history28] = await Promise.all([
      prisma.order.aggregate({ where: { providerId: req.user.id, status: 'COMPLETED', completedAt: { gte: startOfDay } }, _sum: { fare: true } }),
      prisma.order.aggregate({ where: { providerId: req.user.id, status: 'COMPLETED', completedAt: { gte: startOfWeek } }, _sum: { fare: true } }),
      prisma.order.aggregate({ where: { providerId: req.user.id, status: 'COMPLETED', completedAt: { gte: startOfMonth } }, _sum: { fare: true } }),
      prisma.order.findMany({ where: { providerId: req.user.id, status: 'COMPLETED', completedAt: { gte: startOf28Days } }, select: { completedAt: true, fare: true } }),
    ]);

    const dayMap = {};
    history28.forEach(o => {
      if (!o.completedAt) return;
      const key = new Date(o.completedAt).toISOString().slice(0, 10);
      dayMap[key] = (dayMap[key] || 0) + (o.fare || 0);
    });

    res.json({
      earnings: {
        daily: daily._sum.fare || 0,
        weekly: weekly._sum.fare || 0,
        monthly: monthly._sum.fare || 0,
      },
      streakData: Object.fromEntries(Object.entries(dayMap).map(([k, v]) => [k, v > 0])),
      streak: 0,
      goals: { daily: 100, weekly: 500, monthly: 2000 },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/earnings-goal', authenticate, async (req, res) => {
  res.json({ ok: true });
});

router.get('/demand-heatmap', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const fourWeeksAgo = new Date(now - 28 * 24 * 3600 * 1000);
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: fourWeeksAgo }, status: { in: ['COMPLETED', 'IN_PROGRESS'] } },
      select: { createdAt: true, pickupLat: true, pickupLng: true },
    });

    const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));
    orders.forEach(o => {
      const d = new Date(o.createdAt);
      heatmap[d.getDay()][d.getHours()]++;
    });

    const zones = [
      { name: 'Tunis Centre', lat: 36.8189, lng: 10.1658 },
      { name: 'La Marsa', lat: 36.8771, lng: 10.3243 },
      { name: 'Sfax', lat: 34.7398, lng: 10.7600 },
    ];

    res.json({ heatmap, days: DAYS, zones });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
