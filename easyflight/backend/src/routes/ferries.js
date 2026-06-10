'use strict';
const express = require('express');
const { searchFerries, getPorts, getPopularFerryRoutes } = require('../services/ferrySearch');

const router = express.Router();

// GET /api/ferries/ports?q=alge
router.get('/ports', (req, res) => {
  const ports = getPorts(req.query.q);
  res.json({ ports });
});

// GET /api/ferries/routes
router.get('/routes', (_, res) => {
  res.json({ routes: getPopularFerryRoutes() });
});

// GET /api/ferries/search?originPort=ALG_ES&destPort=TNG_PORT&date=2026-08-15&passengers=2
router.get('/search', (req, res) => {
  const { originPort, destPort, date, passengers = 1 } = req.query;
  if (!originPort || !destPort || !date) {
    return res.status(400).json({ error: 'originPort, destPort and date are required' });
  }
  const ferries = searchFerries({ originPort, destPort, date, passengers: Number(passengers) });
  res.json({ ferries, count: ferries.length });
});

module.exports = router;
