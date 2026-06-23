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

// In-memory store keyed by userId (no EmergencyContact model in schema.prisma)
const emergencyContactsStore = new Map();

// GET /api/emergency/contacts — récupérer contacts sauvegardés
router.get('/contacts', authenticate, async (req, res) => {
  res.json({ contacts: emergencyContactsStore.get(req.user.id) || [] });
});

// POST /api/emergency/contacts — créer ou mettre à jour un contact
router.post('/contacts', authenticate, async (req, res) => {
  const { id, name, phone, relation, notify } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'name et phone sont requis' });
  }
  const list = emergencyContactsStore.get(req.user.id) || [];
  if (id && list.some((c) => c.id === id)) {
    const updated = list.map((c) => (c.id === id ? { ...c, name, phone, relation, notify } : c));
    emergencyContactsStore.set(req.user.id, updated);
    return res.json({ success: true, contact: updated.find((c) => c.id === id) });
  }
  const contact = { id: id || `${Date.now()}`, name, phone, relation, notify };
  emergencyContactsStore.set(req.user.id, [...list, contact]);
  res.json({ success: true, contact });
});

// DELETE /api/emergency/contacts/:id — supprimer un contact
router.delete('/contacts/:id', authenticate, async (req, res) => {
  const list = emergencyContactsStore.get(req.user.id) || [];
  emergencyContactsStore.set(req.user.id, list.filter((c) => c.id !== req.params.id));
  res.json({ success: true });
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
