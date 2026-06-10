'use strict';

const express = require('express');
const router = express.Router();
const cpcService = require('../services/cpcService');

/**
 * POST /api/cpc/click
 * Track a booking redirect click. Returns { redirectUrl, clickId, cpcAmount }
 */
router.post('/click', (req, res) => {
  try {
    const {
      hotelId,
      provider,
      sessionId,
      deviceType,
      hotelSlug,
      checkIn,
      checkOut,
      guests,
    } = req.body;

    if (!hotelId || !provider || !sessionId) {
      return res.status(400).json({ error: 'hotelId, provider and sessionId are required', code: 'MISSING_PARAMS' });
    }

    const result = cpcService.trackClick({
      hotelId,
      provider,
      sessionId,
      deviceType,
      hotelSlug,
      checkIn,
      checkOut,
      guests,
    });

    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[CPC] click error:', err);
    return res.status(500).json({ error: 'Internal error', code: 'INTERNAL_ERROR' });
  }
});

/**
 * GET /api/cpc/stats
 * Overall revenue stats (admin)
 */
router.get('/stats', (req, res) => {
  try {
    const stats = cpcService.getRevenueStats();
    return res.json({ success: true, data: stats });
  } catch (err) {
    console.error('[CPC] stats error:', err);
    return res.status(500).json({ error: 'Internal error', code: 'INTERNAL_ERROR' });
  }
});

/**
 * GET /api/cpc/advertisers
 * List all advertisers with stats
 */
router.get('/advertisers', (req, res) => {
  try {
    const advertisers = cpcService.getAdvertiserStats();
    return res.json({ success: true, data: advertisers });
  } catch (err) {
    console.error('[CPC] advertisers error:', err);
    return res.status(500).json({ error: 'Internal error', code: 'INTERNAL_ERROR' });
  }
});

/**
 * GET /api/cpc/revenue-trend
 * 30-day daily revenue array
 */
router.get('/revenue-trend', (req, res) => {
  try {
    const trend = cpcService.getDailyRevenueTrend();
    return res.json({ success: true, data: trend });
  } catch (err) {
    console.error('[CPC] revenue-trend error:', err);
    return res.status(500).json({ error: 'Internal error', code: 'INTERNAL_ERROR' });
  }
});

/**
 * GET /api/cpc/top-hotels
 * Top earning hotels by CPC revenue
 */
router.get('/top-hotels', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const hotels = cpcService.getTopEarningHotels(limit);
    return res.json({ success: true, data: hotels });
  } catch (err) {
    console.error('[CPC] top-hotels error:', err);
    return res.status(500).json({ error: 'Internal error', code: 'INTERNAL_ERROR' });
  }
});

module.exports = router;
