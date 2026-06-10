'use strict';

const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const cacheService = require('../services/cacheService');
const scraperService = require('../services/scraperService');

// GET /api/analytics/overview — all stats combined
router.get('/overview', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const searches = analyticsService.getSearchStats(days);
    const clicks = analyticsService.getClickStats(days);
    const revenue = analyticsService.getRevenueStats(days);
    const scraper = scraperService.getStats();
    const cache = cacheService.getStats();
    res.json({
      success: true,
      data: {
        period: `${days}d`,
        searches,
        clicks,
        revenue,
        scraper,
        cache,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/analytics/searches — search stats
router.get('/searches', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    res.json({ success: true, data: analyticsService.getSearchStats(days) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/analytics/clicks — click stats
router.get('/clicks', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    res.json({ success: true, data: analyticsService.getClickStats(days) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/analytics/revenue — revenue stats
router.get('/revenue', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    res.json({ success: true, data: analyticsService.getRevenueStats(days) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/analytics/scraper — scraper status
router.get('/scraper', (req, res) => {
  try {
    res.json({ success: true, data: scraperService.getStats() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/analytics/cache — cache stats
router.get('/cache', (req, res) => {
  try {
    res.json({ success: true, data: cacheService.getStats() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
