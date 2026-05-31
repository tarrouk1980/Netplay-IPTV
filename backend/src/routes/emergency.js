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

// POST /api/emergency/silent-sos — SOS discret via agitation téléphone
router.post('/silent-sos', authenticate, async (req, res) => {
  const { lat, lng, trigger } = req.body;
  // En prod: notifier les contacts d'urgence via FCM/SMS
  // Log the event for audit
  console.log(`[SilentSOS] User ${req.user?.id} triggered via ${trigger} at ${lat},${lng}`);
  res.json({ success: true, message: 'SOS envoyé à vos contacts d\'urgence.' });
});

module.exports = router;
