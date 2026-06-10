'use strict';

const express = require('express');
const router = express.Router();

// In-memory hotel manager registrations
const registeredHotels = new Map();

// Mock analytics per hotel
function getMockDashboard(hotelId) {
  return {
    hotelId,
    period: 'Ce mois',
    views: 4820,
    clicks: 312,
    ctr: parseFloat((312 / 4820 * 100).toFixed(1)),
    conversions: 47,
    conversionRate: parseFloat((47 / 312 * 100).toFixed(1)),
    spend: 374.4,
    currentBid: registeredHotels.get(hotelId)?.cpcBid || 1.2,
    estimatedPosition: 1,
    weeklyTrend: [
      { day: 'Lun', views: 620, clicks: 41 },
      { day: 'Mar', views: 580, clicks: 38 },
      { day: 'Mer', views: 710, clicks: 52 },
      { day: 'Jeu', views: 690, clicks: 45 },
      { day: 'Ven', views: 820, clicks: 63 },
      { day: 'Sam', views: 930, clicks: 72 },
      { day: 'Dim', views: 470, clicks: 31 },
    ],
  };
}

function getEstimatedPosition(bid) {
  if (bid >= 1.20) return 1;
  if (bid >= 0.95) return 2;
  if (bid >= 0.85) return 3;
  if (bid >= 0.75) return 4;
  return 5;
}

/**
 * POST /api/hotel-manager/register
 * Register a hotel as an advertiser
 */
router.post('/register', (req, res) => {
  try {
    const { hotelId, hotelName, contactEmail, initialBid = 0.5 } = req.body;
    if (!hotelId || !hotelName) {
      return res.status(400).json({ error: 'hotelId and hotelName are required', code: 'MISSING_PARAMS' });
    }

    const registration = {
      hotelId,
      hotelName,
      contactEmail,
      cpcBid: parseFloat(initialBid),
      sponsoredActive: false,
      sponsoredBudget: 0,
      registeredAt: new Date().toISOString(),
    };

    registeredHotels.set(hotelId, registration);

    return res.json({
      success: true,
      message: 'Hôtel enregistré comme annonceur avec succès',
      data: registration,
    });
  } catch (err) {
    console.error('[HotelManager] register error:', err);
    return res.status(500).json({ error: 'Internal error', code: 'INTERNAL_ERROR' });
  }
});

/**
 * GET /api/hotel-manager/dashboard
 * Stats for hotel manager: views, clicks, CTR, spend
 */
router.get('/dashboard', (req, res) => {
  try {
    const { hotelId } = req.query;
    if (!hotelId) {
      return res.status(400).json({ error: 'hotelId is required', code: 'MISSING_PARAMS' });
    }
    const dashboard = getMockDashboard(hotelId);
    return res.json({ success: true, data: dashboard });
  } catch (err) {
    console.error('[HotelManager] dashboard error:', err);
    return res.status(500).json({ error: 'Internal error', code: 'INTERNAL_ERROR' });
  }
});

/**
 * PUT /api/hotel-manager/bid
 * Update CPC bid for a hotel
 */
router.put('/bid', (req, res) => {
  try {
    const { hotelId, bid } = req.body;
    if (!hotelId || bid === undefined) {
      return res.status(400).json({ error: 'hotelId and bid are required', code: 'MISSING_PARAMS' });
    }

    const bidValue = parseFloat(bid);
    if (bidValue < 0.1 || bidValue > 10) {
      return res.status(400).json({ error: 'Bid must be between 0.1 and 10 TND', code: 'INVALID_BID' });
    }

    const existing = registeredHotels.get(hotelId) || { hotelId };
    existing.cpcBid = bidValue;
    registeredHotels.set(hotelId, existing);

    const estimatedPosition = getEstimatedPosition(bidValue);

    return res.json({
      success: true,
      message: 'Enchère mise à jour',
      data: {
        hotelId,
        newBid: bidValue,
        estimatedPosition,
        estimatedPositionLabel: estimatedPosition === 1 ? '1er' : `${estimatedPosition}ème`,
      },
    });
  } catch (err) {
    console.error('[HotelManager] bid error:', err);
    return res.status(500).json({ error: 'Internal error', code: 'INTERNAL_ERROR' });
  }
});

/**
 * POST /api/hotel-manager/sponsor
 * Create a sponsored listing for a hotel
 */
router.post('/sponsor', (req, res) => {
  try {
    const { hotelId, budget, durationDays = 30, position = 1 } = req.body;
    if (!hotelId || !budget) {
      return res.status(400).json({ error: 'hotelId and budget are required', code: 'MISSING_PARAMS' });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const sponsored = {
      id: `spo-${hotelId}-${Date.now()}`,
      hotelId,
      position,
      budget: parseFloat(budget),
      dailyBudget: parseFloat((budget / durationDays).toFixed(2)),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      badgeLabel: position === 1 ? 'Sponsorisé #1' : 'Sponsorisé',
      estimatedImpressions: Math.round(budget * 100),
      createdAt: new Date().toISOString(),
    };

    const existing = registeredHotels.get(hotelId) || { hotelId };
    existing.sponsoredActive = true;
    existing.sponsoredBudget = parseFloat(budget);
    registeredHotels.set(hotelId, existing);

    return res.json({
      success: true,
      message: 'Listing sponsorisé créé',
      data: sponsored,
    });
  } catch (err) {
    console.error('[HotelManager] sponsor error:', err);
    return res.status(500).json({ error: 'Internal error', code: 'INTERNAL_ERROR' });
  }
});

/**
 * GET /api/hotel-manager/analytics
 * Detailed analytics for a hotel
 */
router.get('/analytics', (req, res) => {
  try {
    const { hotelId, period = '7d' } = req.query;
    if (!hotelId) {
      return res.status(400).json({ error: 'hotelId is required', code: 'MISSING_PARAMS' });
    }

    const days = period === '30d' ? 30 : period === '90d' ? 90 : 7;
    const dailyStats = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseViews = 150 + Math.round(Math.random() * 80) + (isWeekend ? 60 : 0);
      const clicks = Math.round(baseViews * 0.065);
      const conversions = Math.round(clicks * 0.15);

      dailyStats.push({
        date: d.toISOString().split('T')[0],
        views: baseViews,
        clicks,
        conversions,
        spend: parseFloat((clicks * 1.2).toFixed(2)),
        ctr: parseFloat((clicks / baseViews * 100).toFixed(1)),
      });
    }

    const totals = dailyStats.reduce((acc, d) => ({
      views: acc.views + d.views,
      clicks: acc.clicks + d.clicks,
      conversions: acc.conversions + d.conversions,
      spend: acc.spend + d.spend,
    }), { views: 0, clicks: 0, conversions: 0, spend: 0 });

    return res.json({
      success: true,
      data: {
        hotelId,
        period,
        totals: {
          ...totals,
          spend: parseFloat(totals.spend.toFixed(2)),
          ctr: parseFloat((totals.clicks / totals.views * 100).toFixed(1)),
          conversionRate: parseFloat((totals.conversions / totals.clicks * 100).toFixed(1)),
        },
        dailyStats,
        topSources: [
          { source: 'Recherche directe', percentage: 42 },
          { source: 'Liste résultats', percentage: 31 },
          { source: 'Comparaison prix', percentage: 17 },
          { source: 'Favoris', percentage: 10 },
        ],
      },
    });
  } catch (err) {
    console.error('[HotelManager] analytics error:', err);
    return res.status(500).json({ error: 'Internal error', code: 'INTERNAL_ERROR' });
  }
});

module.exports = router;
