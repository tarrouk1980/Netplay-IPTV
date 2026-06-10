'use strict';

const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');

// GET /api/price-alerts — get user alerts (+ mock data)
router.get('/', (req, res) => {
  const userId = req.query.userId || 'demo-user';
  const userAlerts = notificationService.getAlerts(userId);
  const mockAlerts = notificationService.getMockAlerts();
  // Merge real alerts with mock alerts for demo
  const all = [...userAlerts, ...mockAlerts];
  res.json({ alerts: all, total: all.length });
});

// GET /api/price-alerts/stats — stats
router.get('/stats', (req, res) => {
  res.json(notificationService.getStats());
});

// POST /api/price-alerts/test-trigger — manually trigger check (for testing)
router.post('/test-trigger', async (req, res) => {
  const { currentPrices = [] } = req.body;
  const triggered = await notificationService.checkAlerts(currentPrices);
  res.json({ triggered, count: triggered.length });
});

// POST /api/price-alerts — create new alert
router.post('/', (req, res) => {
  const userId = req.body.userId || 'demo-user';
  const { hotelId, hotelName, maxPrice, checkIn, checkOut, guests, email } = req.body;

  if (!hotelId || !maxPrice) {
    return res.status(400).json({ error: 'hotelId and maxPrice are required', code: 'MISSING_FIELDS' });
  }

  const alert = notificationService.addAlert(userId, { hotelId, hotelName, maxPrice, checkIn, checkOut, guests, email });
  res.status(201).json({ alert });
});

// DELETE /api/price-alerts/:id — remove alert
router.delete('/:id', (req, res) => {
  const userId = req.query.userId || 'demo-user';
  notificationService.removeAlert(userId, req.params.id);
  res.json({ success: true });
});

module.exports = router;
