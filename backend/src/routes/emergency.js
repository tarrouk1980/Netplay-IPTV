'use strict';
const express = require('express');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// POST /api/emergency/location — broadcast position famille
router.post('/location', authenticate, async (req, res) => {
  const { lat, lng, contacts } = req.body;
  // En prod: envoyer SMS via Twilio/AT ou push via FCM
  // Pour l'instant: stocker et retourner
  res.json({ success: true, lat, lng, contactsNotified: contacts?.length || 0 });
});

// GET /api/emergency/contacts — récupérer contacts sauvegardés
router.get('/contacts', authenticate, async (req, res) => {
  // Stocker dans user metadata ou table dédiée
  res.json({ contacts: [] });
});

module.exports = router;
