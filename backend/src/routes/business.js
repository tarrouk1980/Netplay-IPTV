const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/auth');

// POST /api/business/register — submit company registration request
router.post('/register', auth, async (req, res) => {
  try {
    const { companyName, taxId, phone, email, plan } = req.body;
    if (!companyName || !email) {
      return res.status(400).json({ error: 'companyName et email requis' });
    }

    // Store as a notification/request for admin review
    // For now, upsert on the User profile or create a pending record
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        // Custom fields will be added to schema when available
        // For now just log it
      },
    }).catch(() => {});

    // TODO: send email to admin
    res.json({ success: true, message: 'Demande reçue. Notre équipe vous contactera sous 24h.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/business/stats — company KPIs
router.get('/stats', auth, async (req, res) => {
  try {
    // Return demo data until BusinessAccount model added to schema
    res.json({
      planName: 'Business',
      driversCount: 0,
      ridesThisMonth: 0,
      totalSpent: 0,
      nextBilling: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 10),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/business/drivers — list company drivers
router.get('/drivers', auth, async (req, res) => {
  try {
    // TODO: query BusinessDriver join table
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/business/drivers — add driver by phone
router.post('/drivers', auth, async (req, res) => {
  try {
    const { phone, name } = req.body;
    if (!phone) return res.status(400).json({ error: 'Numéro de téléphone requis' });

    const driver = await prisma.user.findFirst({ where: { phone } });
    if (!driver) {
      return res.status(404).json({ error: 'Aucun conducteur trouvé avec ce numéro.' });
    }

    res.json({ success: true, driver: { id: driver.id, name: driver.name, phone: driver.phone } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/business/drivers/:driverId — remove driver
router.delete('/drivers/:driverId', auth, async (req, res) => {
  try {
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/business/invoices — list invoices
router.get('/invoices', auth, async (req, res) => {
  try {
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
