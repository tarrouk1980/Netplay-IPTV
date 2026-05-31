'use strict';
const express = require('express');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// POST /api/payment/flouci — simulation paiement Flouci
router.post('/flouci', authenticate, async (req, res) => {
  const { orderId, amount, phone } = req.body;
  // Simulation: en prod, appeler l'API Flouci réelle
  // https://developers.flouci.com
  try {
    // Simuler délai traitement
    await new Promise(r => setTimeout(r, 1500));
    res.json({
      success: true,
      transactionId: `FLC_${Date.now()}`,
      amount,
      orderId,
      message: 'Paiement Flouci simulé avec succès'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payment/d17
router.post('/d17', authenticate, async (req, res) => {
  const { orderId, amount, phone } = req.body;
  try {
    await new Promise(r => setTimeout(r, 1500));
    res.json({
      success: true,
      transactionId: `D17_${Date.now()}`,
      amount,
      orderId,
      message: 'Paiement D17 simulé avec succès'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payment/cash
router.post('/cash', authenticate, async (req, res) => {
  const { orderId, amount } = req.body;
  res.json({ success: true, method: 'CASH', orderId, amount });
});

module.exports = router;
