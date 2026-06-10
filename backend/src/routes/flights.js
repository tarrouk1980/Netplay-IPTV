'use strict';

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { searchFlights, getAirports, getCountries, AIRPORTS, COUNTRIES } = require('../services/flightSearch');

const router = express.Router();

// GET /api/flights/countries — North Africa countries with airports
router.get('/countries', (req, res) => {
  res.json({ countries: getCountries() });
});

// GET /api/flights/airports?q=tunis
router.get('/airports', async (req, res) => {
  const { q = '' } = req.query;
  const results = getAirports(q);
  res.json({ airports: results });
});

// GET /api/flights/search
router.get(
  '/search',
  [
    query('origin').isLength({ min: 3, max: 3 }).withMessage('origin must be 3-letter IATA code'),
    query('dest').isLength({ min: 3, max: 3 }).withMessage('dest must be 3-letter IATA code'),
    query('date').isISO8601().withMessage('date must be YYYY-MM-DD'),
    query('returnDate').optional().isISO8601().withMessage('returnDate must be YYYY-MM-DD'),
    query('passengers').optional().isInt({ min: 1, max: 9 }).withMessage('passengers 1-9'),
    query('tripType').optional().isIn(['ONE_WAY', 'ROUND_TRIP']).withMessage('tripType: ONE_WAY or ROUND_TRIP'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', details: errors.array() });
    }

    const { origin, dest, date, returnDate, passengers = 1, tripType = 'ONE_WAY' } = req.query;

    if (origin.toUpperCase() === dest.toUpperCase()) {
      return res.status(422).json({ error: 'origin and dest must be different' });
    }

    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      return res.status(422).json({ error: 'date must be today or in the future' });
    }

    const result = searchFlights({
      origin: origin.toUpperCase(),
      dest: dest.toUpperCase(),
      date,
      returnDate,
      passengers: parseInt(passengers, 10),
      tripType,
    });

    res.json({
      search: { origin, dest, date, returnDate, passengers: parseInt(passengers, 10), tripType },
      ...result,
    });
  },
);

// POST /api/flights/bookings — create a booking (authenticated)
router.post(
  '/bookings',
  authenticate,
  [
    body('flightId').notEmpty().withMessage('flightId required'),
    body('flightNumber').notEmpty().withMessage('flightNumber required'),
    body('origin').isLength({ min: 3, max: 3 }),
    body('dest').isLength({ min: 3, max: 3 }),
    body('departureDate').isISO8601(),
    body('departureTime').notEmpty(),
    body('arrivalTime').notEmpty(),
    body('airline').notEmpty(),
    body('pricePerPax').isFloat({ min: 0 }),
    body('totalPrice').isFloat({ min: 0 }),
    body('passengers').isArray({ min: 1, max: 9 }),
    body('passengers.*.firstName').notEmpty().withMessage('passenger firstName required'),
    body('passengers.*.lastName').notEmpty().withMessage('passenger lastName required'),
    body('passengers.*.passport').optional().isString(),
    body('passengers.*.nationality').optional().isString(),
    body('passengers.*.birthDate').optional().isISO8601(),
    body('contactEmail').isEmail().withMessage('valid contactEmail required'),
    body('contactPhone').notEmpty().withMessage('contactPhone required'),
    body('tripType').isIn(['ONE_WAY', 'ROUND_TRIP']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', details: errors.array() });
    }

    const userId = req.user.id;
    const {
      flightId, flightNumber, origin, dest, departureDate, departureTime,
      arrivalTime, airline, pricePerPax, totalPrice, passengers,
      contactEmail, contactPhone, tripType,
    } = req.body;

    const bookingRef = `EF${Date.now().toString(36).toUpperCase()}`;

    const booking = await prisma.flightBooking.create({
      data: {
        userId,
        bookingRef,
        flightId,
        flightNumber,
        origin,
        dest,
        departureDate: new Date(departureDate),
        departureTime,
        arrivalTime,
        airline,
        pricePerPax,
        totalPrice,
        passengers: JSON.stringify(passengers),
        contactEmail,
        contactPhone,
        tripType,
        status: 'CONFIRMED',
      },
    });

    res.status(201).json({
      booking: {
        ...booking,
        passengers: JSON.parse(booking.passengers),
      },
    });
  },
);

// GET /api/flights/bookings — list user's bookings
router.get('/bookings', authenticate, async (req, res) => {
  const bookings = await prisma.flightBooking.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    bookings: bookings.map((b) => ({
      ...b,
      passengers: JSON.parse(b.passengers),
    })),
  });
});

// GET /api/flights/bookings/:ref — get one booking
router.get('/bookings/:ref', authenticate, async (req, res) => {
  const booking = await prisma.flightBooking.findFirst({
    where: { bookingRef: req.params.ref, userId: req.user.id },
  });

  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  res.json({ booking: { ...booking, passengers: JSON.parse(booking.passengers) } });
});

// DELETE /api/flights/bookings/:ref — cancel booking
router.delete('/bookings/:ref', authenticate, async (req, res) => {
  const booking = await prisma.flightBooking.findFirst({
    where: { bookingRef: req.params.ref, userId: req.user.id },
  });

  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.status === 'CANCELLED') {
    return res.status(400).json({ error: 'Already cancelled' });
  }

  const updated = await prisma.flightBooking.update({
    where: { id: booking.id },
    data: { status: 'CANCELLED' },
  });

  res.json({ booking: { ...updated, passengers: JSON.parse(updated.passengers) } });
});

// ─── PRICE CALENDAR ──────────────────────────────────────────────────────────
// GET /api/flights/calendar?origin=TUN&dest=CDG&month=2026-08&passengers=1
router.get(
  '/calendar',
  [
    query('origin').isLength({ min: 3, max: 3 }),
    query('dest').isLength({ min: 3, max: 3 }),
    query('month').matches(/^\d{4}-\d{2}$/),
    query('passengers').optional().isInt({ min: 1, max: 9 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ error: 'Validation failed', details: errors.array() });

    const { origin, dest, month, passengers = 1 } = req.query;
    const [year, mon] = month.split('-').map(Number);
    const daysInMonth = new Date(year, mon, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calendar = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(mon).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dt = new Date(dateStr + 'T00:00:00');
      if (dt < today) { calendar.push({ date: dateStr, available: false, price: null, currency: null }); continue; }

      const result = searchFlights({ origin: origin.toUpperCase(), dest: dest.toUpperCase(), date: dateStr, passengers: parseInt(passengers, 10) });
      if (!result.outbound.length) { calendar.push({ date: dateStr, available: false, price: null, currency: null }); continue; }

      const best = result.outbound[0];
      calendar.push({
        date: dateStr,
        available: true,
        price: best.price.total,
        currency: best.price.currency,
        airline: best.airline.code,
        stops: best.stops,
      });
    }

    // Compute price levels: cheapest 33% = low, top 33% = high, middle = medium
    const prices = calendar.filter((d) => d.available).map((d) => d.price);
    if (prices.length) {
      const sorted = [...prices].sort((a, b) => a - b);
      const p33 = sorted[Math.floor(sorted.length * 0.33)];
      const p66 = sorted[Math.floor(sorted.length * 0.66)];
      const minPrice = sorted[0];
      calendar.forEach((d) => {
        if (!d.available) return;
        d.level = d.price <= p33 ? 'low' : d.price >= p66 ? 'high' : 'medium';
        d.isLowest = d.price === minPrice;
      });
    }

    res.json({ origin, dest, month, passengers: parseInt(passengers, 10), calendar });
  },
);

// ─── INSPIRE ME ──────────────────────────────────────────────────────────────
// GET /api/flights/inspire?origin=TUN&date=2026-08-15&budget=500&currency=TND
router.get(
  '/inspire',
  [
    query('origin').isLength({ min: 3, max: 3 }),
    query('date').isISO8601(),
    query('budget').optional().isFloat({ min: 1 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ error: 'Validation failed', details: errors.array() });

    const { origin, date, budget } = req.query;
    const budgetNum = budget ? parseFloat(budget) : Infinity;

    // All known destinations from this origin
    const { searchFlights: sf } = require('../services/flightSearch');
    const { ROUTE_TEMPLATES } = require('../services/flightSearch');

    // Get all possible destinations
    const allDests = new Set();
    const originUpper = origin.toUpperCase();
    Object.keys(
      require('../services/flightSearch').AIRPORTS
    ).forEach((code) => {
      if (code !== originUpper) allDests.add(code);
    });

    const results = [];
    for (const dest of allDests) {
      const r = searchFlights({ origin: originUpper, dest, date, passengers: 1 });
      if (!r.outbound.length) continue;
      const best = r.outbound[0];
      if (best.price.total <= budgetNum) {
        results.push({
          destination: best.destination,
          bestPrice: best.price.total,
          currency: best.price.currency,
          airline: best.airline,
          duration: best.duration,
          stops: best.stops,
          departure: best.departure.time,
          arrival: best.arrival.time,
          flightId: best.id,
          affiliateUrl: best.affiliateUrl,
        });
      }
    }

    results.sort((a, b) => a.bestPrice - b.bestPrice);
    res.json({ origin, date, budget: budgetNum === Infinity ? null : budgetNum, destinations: results.slice(0, 30) });
  },
);

// ─── PRICE ALERTS ────────────────────────────────────────────────────────────
// POST /api/flights/alerts
router.post(
  '/alerts',
  authenticate,
  [
    body('origin').isLength({ min: 3, max: 3 }),
    body('dest').isLength({ min: 3, max: 3 }),
    body('date').isISO8601(),
    body('passengers').optional().isInt({ min: 1, max: 9 }),
    body('targetPrice').isFloat({ min: 0 }),
    body('currency').optional().isLength({ min: 3, max: 3 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ error: 'Validation failed', details: errors.array() });

    const { origin, dest, date, passengers = 1, targetPrice, currency = 'TND' } = req.body;

    // Get current price to store as lastPrice
    const r = searchFlights({ origin: origin.toUpperCase(), dest: dest.toUpperCase(), date, passengers: parseInt(passengers, 10) });
    const lastPrice = r.outbound.length ? r.outbound[0].price.total : null;

    const alert = await prisma.flightAlert.create({
      data: {
        userId: req.user.id,
        origin: origin.toUpperCase(),
        dest: dest.toUpperCase(),
        date,
        passengers: parseInt(passengers, 10),
        targetPrice,
        currency,
        lastPrice,
        active: true,
      },
    });
    res.status(201).json({ alert });
  },
);

// GET /api/flights/alerts
router.get('/alerts', authenticate, async (req, res) => {
  const alerts = await prisma.flightAlert.findMany({
    where: { userId: req.user.id, active: true },
    orderBy: { createdAt: 'desc' },
  });

  // Enrich with current best price
  const enriched = alerts.map((a) => {
    const r = searchFlights({ origin: a.origin, dest: a.dest, date: a.date, passengers: a.passengers });
    const currentPrice = r.outbound.length ? r.outbound[0].price.total : null;
    const triggered = currentPrice !== null && currentPrice <= a.targetPrice;
    return {
      ...a,
      currentPrice,
      triggered,
      originInfo: AIRPORTS[a.origin] || { code: a.origin },
      destInfo: AIRPORTS[a.dest] || { code: a.dest },
    };
  });

  res.json({ alerts: enriched });
});

// DELETE /api/flights/alerts/:id
router.delete('/alerts/:id', authenticate, async (req, res) => {
  const alert = await prisma.flightAlert.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  await prisma.flightAlert.update({ where: { id: alert.id }, data: { active: false } });
  res.json({ success: true });
});

// ─── PRICE TREND ─────────────────────────────────────────────────────────────
// GET /api/flights/trend?origin=TUN&dest=CDG — is now a good time to buy?
router.get('/trend', [query('origin').isLength({ min: 3, max: 3 }), query('dest').isLength({ min: 3, max: 3 })], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ error: 'Validation failed', details: errors.array() });

  const { origin, dest } = req.query;
  const today = new Date();

  // Sample prices over next 30 days
  const samples = [];
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const r = searchFlights({ origin: origin.toUpperCase(), dest: dest.toUpperCase(), date: dateStr, passengers: 1 });
    if (r.outbound.length) samples.push({ date: dateStr, price: r.outbound[0].price.total, currency: r.outbound[0].price.currency });
  }

  if (!samples.length) return res.json({ trend: null, message: 'Route not available' });

  const prices = samples.map((s) => s.price);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const currency = samples[0].currency;

  // Cheapest week
  const cheapestDay = samples.reduce((a, b) => a.price < b.price ? a : b);
  const mostExpensiveDay = samples.reduce((a, b) => a.price > b.price ? a : b);

  // Trend: compare first 15 vs last 15 days
  const first15avg = prices.slice(0, 15).reduce((a, b) => a + b, 0) / 15;
  const last15avg = prices.slice(15).reduce((a, b) => a + b, 0) / 15;
  const trendDir = last15avg > first15avg * 1.05 ? 'rising' : last15avg < first15avg * 0.95 ? 'falling' : 'stable';

  res.json({
    origin, dest, currency,
    stats: { avg: Math.round(avg * 10) / 10, min, max },
    trend: trendDir,
    advice: trendDir === 'rising' ? 'Achetez maintenant, les prix montent !' : trendDir === 'falling' ? 'Attendez encore, les prix baissent.' : 'Prix stables, bon moment pour réserver.',
    cheapestDay,
    mostExpensiveDay,
    samples,
  });
});

module.exports = router;
