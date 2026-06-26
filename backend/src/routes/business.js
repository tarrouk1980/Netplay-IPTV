const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate: auth } = require('../middleware/auth');
// EasyBusiness (fleet management) is reachable by any authenticated user from ProfileScreen;
// authorization is ownership-based (businessId: req.user.id) on every query below, not role-based.

// POST /api/business/register — submit company registration request
router.post('/register', auth, async (req, res) => {
  try {
    const { companyName, taxId, phone, email, plan } = req.body;
    if (!companyName || !email) {
      return res.status(400).json({ error: 'companyName et email requis' });
    }

    // Store as a notification/request for admin review.
    // No dedicated business-registration fields exist on the schema yet,
    // so there is nothing to persist on the User record here.
    // TODO: send email to admin
    res.json({ success: true, message: 'Demande reçue. Notre équipe vous contactera sous 24h.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/business/stats — company KPIs computed from linked drivers' real orders
router.get('/stats', auth, async (req, res) => {
  try {
    const links = await prisma.businessDriver.findMany({ where: { businessId: req.user.id } });
    const driverIds = links.map((l) => l.driverId);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let ridesThisMonth = 0;
    let totalSpent = 0;
    if (driverIds.length) {
      const orders = await prisma.order.findMany({
        where: {
          providerId: { in: driverIds },
          status: 'COMPLETED',
          createdAt: { gte: monthStart },
        },
        select: { price: true, finalPrice: true },
      });
      ridesThisMonth = orders.length;
      totalSpent = orders.reduce((s, o) => s + Number(o.finalPrice ?? o.price ?? 0), 0);
    }

    res.json({
      planName: 'Business',
      driversCount: driverIds.length,
      ridesThisMonth,
      totalSpent,
      nextBilling: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 10),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/business/drivers — list company drivers
router.get('/drivers', auth, async (req, res) => {
  try {
    const links = await prisma.businessDriver.findMany({
      where: { businessId: req.user.id },
      include: { driver: { select: { id: true, name: true, phone: true } } },
    });
    res.json(links.map((l) => ({ id: l.driver.id, name: l.driver.name, phone: l.driver.phone })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/business/drivers — add driver by phone
router.post('/drivers', auth, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Numéro de téléphone requis' });

    const driver = await prisma.user.findFirst({ where: { phone } });
    if (!driver) {
      return res.status(404).json({ error: 'Aucun conducteur trouvé avec ce numéro.' });
    }
    if (driver.id === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas vous ajouter vous-même.' });
    }

    await prisma.businessDriver.upsert({
      where: { businessId_driverId: { businessId: req.user.id, driverId: driver.id } },
      update: {},
      create: { businessId: req.user.id, driverId: driver.id },
    });

    res.json({ success: true, driver: { id: driver.id, name: driver.name, phone: driver.phone } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/business/drivers/:driverId — remove driver
router.delete('/drivers/:driverId', auth, async (req, res) => {
  try {
    await prisma.businessDriver.deleteMany({
      where: { businessId: req.user.id, driverId: req.params.driverId },
    });
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
