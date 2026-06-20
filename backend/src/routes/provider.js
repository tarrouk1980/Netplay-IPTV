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
        finalPrice: true,
        price: true,
        completedAt: true,
      },
      orderBy: { completedAt: 'asc' },
    });

    const orderAmount = (o) => Number(o.finalPrice ?? o.price ?? 0);
    const totalTND = orders.reduce((s, o) => s + orderAmount(o), 0);
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
      if (dailyMap[key] !== undefined) dailyMap[key] += orderAmount(o);
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
      select: { price: true, finalPrice: true, createdAt: true, serviceType: true },
    });

    const orderAmount = (o) => Number(o.finalPrice ?? o.price ?? 0);
    const totalGross = orders.reduce((s, o) => s + orderAmount(o), 0);
    const ordersCount = orders.length;
    const avgPerOrder = ordersCount > 0 ? totalGross / ordersCount : 0;

    // Work days (distinct dates)
    const workDays = new Set(orders.map(o => o.createdAt.toISOString().split('T')[0])).size;

    // Best day
    const byDate = {};
    orders.forEach(o => {
      const d = o.createdAt.toISOString().split('T')[0];
      byDate[d] = (byDate[d] || 0) + orderAmount(o);
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
      byWeek[wi].amount += orderAmount(o);
    });

    // By service
    const serviceMap = {};
    orders.forEach(o => {
      serviceMap[o.serviceType] = serviceMap[o.serviceType] || { service: o.serviceType, count: 0, amount: 0 };
      serviceMap[o.serviceType].count++;
      serviceMap[o.serviceType].amount += orderAmount(o);
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

// In-memory availability store (no ProviderAvailability model in schema)
const availabilityStore = new Map(); // providerId -> { schedule, onlineNow }

router.get('/availability', authenticate, async (req, res) => {
  try {
    const rec = availabilityStore.get(req.user.id);
    res.json({
      schedule: rec?.schedule ?? null,
      onlineNow: rec?.onlineNow ?? (req.user.isOnline || false),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/availability', authenticate, async (req, res) => {
  try {
    const { schedule, onlineNow } = req.body;
    availabilityStore.set(req.user.id, { schedule, onlineNow: onlineNow ?? availabilityStore.get(req.user.id)?.onlineNow ?? false });
    if (onlineNow !== undefined) {
      await prisma.user.update({ where: { id: req.user.id }, data: { isOnline: onlineNow } });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// In-memory provider document store (no ProviderDocument model in schema)
const documentStore = new Map(); // providerId -> { [type]: { type, status, uploadedAt, expiresAt, note } }

router.get('/documents', authenticate, async (req, res) => {
  try {
    const map = documentStore.get(req.user.id) || {};
    res.json({ documents: map });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/documents', authenticate, async (req, res) => {
  try {
    const { type } = req.body;
    if (!type) return res.status(400).json({ error: 'type is required' });
    const map = documentStore.get(req.user.id) || {};
    map[type] = { type, status: 'PENDING', uploadedAt: new Date().toISOString(), expiresAt: null, note: 'Vérification en cours…' };
    documentStore.set(req.user.id, map);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// In-memory earnings-goal store (no EarningsGoal model in schema)
const earningsGoalStore = new Map(); // userId -> { daily, weekly, monthly }

router.get('/earnings-goal', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOf28Days = new Date(now - 28 * 86400000);

    const orderAmount = (o) => Number(o.finalPrice ?? o.price ?? 0);
    const [daily, weekly, monthly, history28] = await Promise.all([
      prisma.order.findMany({ where: { providerId: req.user.id, status: 'COMPLETED', completedAt: { gte: startOfDay } }, select: { finalPrice: true, price: true } }),
      prisma.order.findMany({ where: { providerId: req.user.id, status: 'COMPLETED', completedAt: { gte: startOfWeek } }, select: { finalPrice: true, price: true } }),
      prisma.order.findMany({ where: { providerId: req.user.id, status: 'COMPLETED', completedAt: { gte: startOfMonth } }, select: { finalPrice: true, price: true } }),
      prisma.order.findMany({ where: { providerId: req.user.id, status: 'COMPLETED', completedAt: { gte: startOf28Days } }, select: { completedAt: true, finalPrice: true, price: true } }),
    ]);

    const dayMap = {};
    history28.forEach(o => {
      if (!o.completedAt) return;
      const key = new Date(o.completedAt).toISOString().slice(0, 10);
      dayMap[key] = (dayMap[key] || 0) + orderAmount(o);
    });

    const savedGoals = earningsGoalStore.get(req.user.id);

    res.json({
      earnings: {
        daily: daily.reduce((s, o) => s + orderAmount(o), 0),
        weekly: weekly.reduce((s, o) => s + orderAmount(o), 0),
        monthly: monthly.reduce((s, o) => s + orderAmount(o), 0),
      },
      streakData: Object.fromEntries(Object.entries(dayMap).map(([k, v]) => [k, v > 0])),
      streak: 0,
      goals: savedGoals || { daily: 100, weekly: 500, monthly: 2000 },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/earnings-goal', authenticate, async (req, res) => {
  const { goals } = req.body;
  if (goals && typeof goals === 'object') {
    earningsGoalStore.set(req.user.id, goals);
  }
  res.json({ ok: true });
});

// Known Tunisian neighborhoods used to label geo-clusters of real order pickups
const KNOWN_AREAS = [
  { name: 'Tunis Centre', lat: 36.8065, lng: 10.1815 },
  { name: 'Lac 1 & 2', lat: 36.8433, lng: 10.2467 },
  { name: 'Aéroport Tunis-Carthage', lat: 36.8510, lng: 10.2272 },
  { name: 'Ennasr', lat: 36.8770, lng: 10.1660 },
  { name: 'La Marsa', lat: 36.8771, lng: 10.3243 },
  { name: 'Ariana', lat: 36.8625, lng: 10.1956 },
  { name: 'Sousse', lat: 35.8254, lng: 10.6369 },
  { name: 'Sfax', lat: 34.7398, lng: 10.7600 },
];

function nearestArea(lat, lng) {
  let best = KNOWN_AREAS[0];
  let bestDist = Infinity;
  for (const area of KNOWN_AREAS) {
    const dist = Math.hypot(area.lat - lat, area.lng - lng);
    if (dist < bestDist) { bestDist = dist; best = area; }
  }
  return best;
}

function demandLabel(count, max) {
  const ratio = max > 0 ? count / max : 0;
  if (ratio >= 0.75) return { demand: 'Très élevée', icon: '🔴' };
  if (ratio >= 0.5) return { demand: 'Élevée', icon: '🟡' };
  if (ratio >= 0.25) return { demand: 'Moyenne', icon: '🟢' };
  return { demand: 'Faible', icon: '🟢' };
}

router.get('/demand-heatmap', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const fourWeeksAgo = new Date(now - 28 * 24 * 3600 * 1000);
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: fourWeeksAgo }, status: { in: ['COMPLETED', 'IN_PROGRESS'] } },
      select: { createdAt: true, originLat: true, originLng: true },
    });

    // Day-of-week × hour demand matrix, indexed Lun=0 ... Dim=6 (matches mobile UI)
    const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const demand = Array.from({ length: 7 }, () => Array(24).fill(0));
    orders.forEach(o => {
      const d = new Date(o.createdAt);
      const jsDay = d.getDay(); // 0=Dim
      const dayIndex = (jsDay + 6) % 7; // shift so 0=Lun
      demand[dayIndex][d.getHours()]++;
    });

    // Real geo-clustering: bucket each order's pickup point to its nearest known area
    const zoneCounts = new Map();
    orders.forEach(o => {
      if (o.originLat == null || o.originLng == null) return;
      const area = nearestArea(o.originLat, o.originLng);
      zoneCounts.set(area.name, (zoneCounts.get(area.name) || 0) + 1);
    });

    const maxCount = Math.max(1, ...zoneCounts.values());
    let hotZones = Array.from(zoneCounts.entries())
      .map(([name, count]) => {
        const area = KNOWN_AREAS.find(a => a.name === name);
        const { demand: demandLevel, icon } = demandLabel(count, maxCount);
        return {
          name,
          lat: area.lat,
          lng: area.lng,
          demand: demandLevel,
          icon,
          orderCount: count,
          tip: `${count} course${count > 1 ? 's' : ''} sur les 4 dernières semaines dans cette zone`,
        };
      })
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);

    // No real order history yet (new market / new account) → fall back to known areas with zero data
    if (hotZones.length === 0) {
      hotZones = KNOWN_AREAS.slice(0, 5).map(a => ({
        ...a, demand: 'Faible', icon: '🟢', orderCount: 0, tip: 'Pas encore de données de demande dans cette zone',
      }));
    }

    res.json({ demand, days: DAYS, hotZones });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/provider/earnings-summary?period=today|week|month|year
router.get('/earnings-summary', authenticate, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const now = new Date();
    let from;
    if (period === 'today') { from = new Date(); from.setHours(0,0,0,0); }
    else if (period === 'week') { from = new Date(); from.setDate(now.getDate()-6); from.setHours(0,0,0,0); }
    else if (period === 'month') { from = new Date(now.getFullYear(), now.getMonth(), 1); }
    else { from = new Date(now.getFullYear(), 0, 1); }

    const orders = await prisma.order.findMany({
      where: { providerId: req.user.id, status: 'COMPLETED', createdAt: { gte: from } },
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const orderAmount = (o) => Number(o.finalPrice ?? o.price ?? 0);
    const totalRevenue = orders.reduce((s, o) => s + orderAmount(o), 0);
    const totalTips = 0; // Tips are tracked in the separate Tip model, not aggregated here yet.
    const avgPerOrder = orders.length ? totalRevenue / orders.length : 0;

    const dayLabels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    const weeklyChart = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(now.getDate() - (6 - i)); d.setHours(0,0,0,0);
      const v = orders.filter((o) => new Date(o.createdAt).toDateString() === d.toDateString())
        .reduce((s, o) => s + orderAmount(o), 0);
      return { label: dayLabels[d.getDay()], value: v };
    });

    const savedGoals = earningsGoalStore.get(req.user.id);

    return res.json({
      totalRevenue,
      totalOrders: orders.length,
      totalTips,
      avgPerOrder,
      hoursOnline: 0,
      conversionRate: 85,
      goalAmount: savedGoals?.[period] ?? savedGoals?.monthly ?? 100,
      weeklyChart,
      topHours: [],
      recentOrders: orders.slice(0, 10),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/provider/status
router.get('/status', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, role: true, isOnline: true },
    });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const orders = await prisma.order.findMany({
      where: { providerId: req.user.id, status: 'COMPLETED', createdAt: { gte: today } },
    });
    const revenue = orders.reduce((s, o) => s + Number(o.price || 0), 0);
    const reviews = await prisma.review.aggregate({
      where: { targetId: req.user.id },
      _avg: { rating: true },
    });

    return res.json({
      isOnline: user?.isOnline ?? false,
      profile: user,
      todayStats: {
        orders: orders.length,
        revenue,
        rating: reviews._avg.rating ?? 5.0,
        hoursOnline: 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/provider/work-schedule
// PUT /api/provider/work-schedule
const workSchedules = new Map();

router.get('/work-schedule', authenticate, async (req, res) => {
  try {
    const saved = workSchedules.get(req.user.id) || [];
    return res.json({ schedule: saved });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/work-schedule', authenticate, async (req, res) => {
  try {
    const { schedule } = req.body;
    workSchedules.set(req.user.id, schedule);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
