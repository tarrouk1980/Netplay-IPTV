'use strict';
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// GET /api/wallet — combined balance + transactions
router.get('/', authenticate, async (req, res) => {
  try {
    const [user, txs] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.user.id }, select: { walletBalance: true } }),
      prisma.walletTransaction.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 50 }),
    ]);
    res.json({
      balance: user?.walletBalance || 0,
      transactions: txs.map((t) => ({
        id: t.id,
        type: t.type === 'CREDIT' || t.type === 'RECHARGE' ? 'CREDIT' : 'DEBIT',
        label: t.description || t.type,
        amount: t.type === 'CREDIT' || t.type === 'RECHARGE' ? t.amount : -t.amount,
        date: t.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
  if (!(Number(amount) > 0)) {
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

// POST /api/wallet/transfer — send wallet balance to another user by phone
router.post('/transfer', authenticate, async (req, res) => {
  const { phone, amount, note } = req.body;
  const numAmount = Number(amount);
  if (!phone) return res.status(400).json({ error: 'Numéro de téléphone requis' });
  if (!(numAmount >= 1)) return res.status(400).json({ error: 'Montant invalide (minimum 1 TND)' });

  try {
    const recipient = await prisma.user.findUnique({ where: { phone } });
    if (!recipient) return res.status(404).json({ error: 'Aucun utilisateur trouvé avec ce numéro.' });
    if (recipient.id === req.user.id) return res.status(400).json({ error: 'Vous ne pouvez pas vous envoyer de l\'argent à vous-même.' });

    const result = await prisma.$transaction(async (tx) => {
      const sender = await tx.user.findUnique({ where: { id: req.user.id }, select: { walletBalance: true } });
      if ((sender?.walletBalance || 0) < numAmount) {
        throw new Error('INSUFFICIENT_BALANCE');
      }
      await tx.user.update({ where: { id: req.user.id }, data: { walletBalance: { decrement: numAmount } } });
      await tx.user.update({ where: { id: recipient.id }, data: { walletBalance: { increment: numAmount } } });
      await tx.walletTransaction.create({
        data: { userId: req.user.id, amount: numAmount, type: 'DEBIT', description: `Virement à ${recipient.name}${note ? ` — ${note}` : ''}` },
      });
      await tx.walletTransaction.create({
        data: { userId: recipient.id, amount: numAmount, type: 'CREDIT', description: `Virement de ${req.user.name}${note ? ` — ${note}` : ''}` },
      });
      return true;
    });

    const refId = 'TRF-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    res.json({ success: true, refId, recipient: { name: recipient.name, phone: recipient.phone } });
  } catch (err) {
    if (err.message === 'INSUFFICIENT_BALANCE') {
      return res.status(400).json({ error: 'Solde insuffisant.' });
    }
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
      await prisma.user.update({
        where: { id: req.user.id },
        data: { walletBalance: { increment: parseFloat(amount) } },
      });
      await prisma.walletTransaction.create({
        data: { userId: req.user.id, type: 'CREDIT', amount: parseFloat(amount), description: `Rechargement D17 - ${amount} TND` },
      });
    }
    return res.json({ success: true, code, method, amount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
