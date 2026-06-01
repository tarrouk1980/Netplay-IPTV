'use strict';
const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// GET /api/wallet/balance
router.get('/balance', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { walletBalance: true, subscriptionActive: true, subscriptionExpiresAt: true }
    });
    res.json(user || { walletBalance: 0, subscriptionActive: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/wallet/transactions
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const txs = await prisma.walletTransaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/wallet/recharge — simulation (en prod: intégration paiement)
router.post('/recharge', authenticate, async (req, res) => {
  const { amount } = req.body;
  if (![7, 30, 90].includes(Number(amount))) {
    return res.status(400).json({ error: 'Montant invalide' });
  }
  try {
    const [tx, user] = await prisma.$transaction([
      prisma.walletTransaction.create({
        data: { userId: req.user.id, amount: Number(amount), type: 'RECHARGE', description: `Recharge ${amount} TND` }
      }),
      prisma.user.update({
        where: { id: req.user.id },
        data: { walletBalance: { increment: Number(amount) } }
      }),
    ]);
    res.json({ success: true, newBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/wallet/topup — cash/D17 topup request
router.post('/topup', authenticate, async (req, res) => {
  try {
    const { amount, method } = req.body;
    const code = `TOPUP-${Math.random().toString(36).toUpperCase().slice(2, 8)}`;
    if (method === 'D17') {
      // For D17, credit immediately (real integration would verify)
      await prisma.wallet.upsert({
        where: { userId: req.user.id },
        update: { balance: { increment: parseFloat(amount) } },
        create: { userId: req.user.id, balance: parseFloat(amount) },
      }).catch(() => {});
      await prisma.walletTransaction.create({
        data: { userId: req.user.id, type: 'CREDIT', amount: parseFloat(amount), note: `Rechargement D17 - ${amount} TND` },
      }).catch(() => {});
    }
    return res.json({ success: true, code, method, amount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
