'use strict';
const express = require('express');
const {
  searchFlights, getAirports, getAirportsByCountry, getCountries, AIRPORTS,
} = require('../services/flightSearch');

const router = express.Router();

// GET /api/flights/airports?q=mad
router.get('/airports', (req, res) => {
  const airports = getAirports(req.query.q);
  res.json({ airports });
});

// GET /api/flights/countries
router.get('/countries', (_, res) => {
  res.json({ countries: getCountries() });
});

// GET /api/flights/search?origin=MAD&dest=CMN&date=2026-08-15&passengers=2&tripType=ONE_WAY
router.get('/search', (req, res) => {
  const { origin, dest, date, returnDate, passengers = 1, tripType = 'ONE_WAY', currency } = req.query;
  if (!origin || !dest || !date) {
    return res.status(400).json({ error: 'origin, dest and date are required' });
  }
  const result = searchFlights({
    origin, dest, date, returnDate, passengers: Number(passengers), tripType, currency,
  });
  res.json(result);
});

// GET /api/flights/calendar?origin=MAD&dest=CMN&month=2026-08&passengers=1
router.get('/calendar', (req, res) => {
  const { origin, dest, month, passengers = 1 } = req.query;
  if (!origin || !dest || !month) {
    return res.status(400).json({ error: 'origin, dest and month are required' });
  }
  const [year, m] = month.split('-').map(Number);
  const daysInMonth = new Date(year, m, 0).getDate();
  const days = {};

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${month}-${String(d).padStart(2, '0')}`;
    const result = searchFlights({ origin, dest, date: dateStr, passengers: Number(passengers) });
    if (result.outbound.length > 0) {
      const cheapest = result.outbound[0];
      days[dateStr] = {
        price:    cheapest.price.total,
        currency: cheapest.price.currency,
        count:    result.outbound.length,
      };
    }
  }

  const prices = Object.values(days).map((d) => d.price);
  const sorted = [...prices].sort((a, b) => a - b);
  const p33 = sorted[Math.floor(sorted.length * 0.33)] || 0;
  const p66 = sorted[Math.floor(sorted.length * 0.66)] || 0;

  Object.keys(days).forEach((k) => {
    const p = days[k].price;
    days[k].level = p <= p33 ? 'LOW' : p <= p66 ? 'MED' : 'HIGH';
  });

  res.json({ month, origin, dest, days });
});

// GET /api/flights/inspire?origin=MAD&date=2026-08-15&budget=80
router.get('/inspire', (req, res) => {
  const { origin, date, budget } = req.query;
  if (!origin || !date) {
    return res.status(400).json({ error: 'origin and date are required' });
  }
  const destinations = [];
  const allAirports = Object.values(AIRPORTS);

  for (const airport of allAirports) {
    if (airport.code === origin) continue;
    const result = searchFlights({ origin, dest: airport.code, date, passengers: 1 });
    if (result.outbound.length > 0) {
      const cheapest = result.outbound[0];
      if (!budget || cheapest.price.total <= Number(budget)) {
        destinations.push({
          code:     airport.code,
          city:     airport.city,
          country:  airport.country,
          price:    cheapest.price.total,
          currency: cheapest.price.currency,
          duration: cheapest.duration,
          airline:  cheapest.airline,
        });
      }
    }
  }

  destinations.sort((a, b) => a.price - b.price);
  res.json({ origin, date, destinations: destinations.slice(0, 20) });
});

// GET /api/flights/trend?origin=MAD&dest=CMN
router.get('/trend', (req, res) => {
  const { origin, dest } = req.query;
  if (!origin || !dest) return res.status(400).json({ error: 'origin and dest are required' });

  const prices = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i + 1);
    const dateStr = d.toISOString().slice(0, 10);
    const result = searchFlights({ origin, dest, date: dateStr, passengers: 1 });
    if (result.outbound.length > 0) {
      prices.push({ date: dateStr, price: result.outbound[0].price.total, currency: result.outbound[0].price.currency });
    }
  }

  const vals = prices.map((p) => p.price);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const trend = vals.length > 5 && vals[vals.length - 1] > vals[0] ? 'UP' : 'DOWN';

  res.json({ origin, dest, prices, stats: { min, max, avg: Math.round(avg), trend } });
});

module.exports = router;
