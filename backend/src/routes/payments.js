const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Konnect payment init
router.post('/konnect/init', authenticate, async (req, res) => {
  try {
    const { amount, description, orderId } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'amount required' });

    const KONNECT_API = process.env.KONNECT_API_KEY;
    const KONNECT_WALLET = process.env.KONNECT_WALLET_ID;

    if (!KONNECT_API || !KONNECT_WALLET) {
      // Dev mode: simulate success
      return res.json({ success: true, paymentRef: `MOCK_${Date.now()}` });
    }

    const body = {
      receiverWalletId: KONNECT_WALLET,
      token: 'TND',
      amount: Math.round(amount * 1000),
      type: 'immediate',
      description: description || 'EASYWAY Payment',
      acceptedPaymentMethods: ['wallet', 'bank_card', 'e-DINAR'],
      lifespan: 10,
      checkoutForm: true,
      addPaymentFeesToAmount: true,
      firstName: req.user.name?.split(' ')[0] || 'Client',
      lastName: req.user.name?.split(' ')[1] || 'EASYWAY',
      phoneNumber: req.user.phone || '',
      email: req.user.email || '',
      orderId: orderId || `ORD_${Date.now()}`,
      webhook: `${process.env.BASE_URL || 'https://api.easyway.tn'}/api/payments/konnect/webhook`,
      successUrl: `${process.env.BASE_URL || 'https://api.easyway.tn'}/payment_success`,
      failUrl: `${process.env.BASE_URL || 'https://api.easyway.tn'}/payment_fail`,
    };

    const response = await fetch('https://api.konnect.network/api/v2/payments/init-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': KONNECT_API,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (data?.payUrl) {
      res.json({ payUrl: data.payUrl, paymentRef: data.paymentRef });
    } else {
      res.status(400).json({ error: 'Konnect init failed', details: data });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Konnect webhook
router.post('/konnect/webhook', async (req, res) => {
  try {
    const { payment_ref, order_id, status } = req.body;
    if (status === 'completed' && order_id) {
      await prisma.order.update({ where: { id: order_id }, data: { paymentStatus: 'PAID', paymentRef: payment_ref } });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Flouci payment init
router.post('/flouci/init', authenticate, async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    const APP_TOKEN = process.env.FLOUCI_APP_TOKEN;
    const APP_SECRET = process.env.FLOUCI_APP_SECRET;

    if (!APP_TOKEN || !APP_SECRET) {
      return res.json({ success: true, paymentRef: `FLOUCI_MOCK_${Date.now()}` });
    }

    const response = await fetch('https://developers.flouci.com/api/generate_payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_token: APP_TOKEN,
        app_secret: APP_SECRET,
        amount: Math.round(amount * 1000),
        accept_card: 'true',
        session_id: orderId || `SID_${Date.now()}`,
        success_link: `${process.env.BASE_URL || 'https://api.easyway.tn'}/payment_success`,
        fail_link: `${process.env.BASE_URL || 'https://api.easyway.tn'}/payment_fail`,
        developer_tracking_id: orderId || '',
      }),
    });
    const data = await response.json();

    if (data?.result?.link) {
      res.json({ link: data.result.link, paymentId: data.result.payment_id });
    } else {
      res.status(400).json({ error: 'Flouci init failed', details: data });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Flouci verify
router.get('/flouci/verify/:paymentId', authenticate, async (req, res) => {
  try {
    const APP_TOKEN = process.env.FLOUCI_APP_TOKEN;
    const response = await fetch(`https://developers.flouci.com/api/verify_payment/${req.params.paymentId}`, {
      headers: { 'Content-Type': 'application/json', apppublic: APP_TOKEN },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Wallet pay
router.post('/wallet/pay', authenticate, async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { walletBalance: true } });
    if (!user || user.walletBalance < amount) return res.status(400).json({ error: 'Solde insuffisant' });

    await prisma.$transaction([
      prisma.user.update({ where: { id: req.user.id }, data: { walletBalance: { decrement: amount } } }),
      prisma.walletTransaction.create({ data: { userId: req.user.id, amount: -amount, type: 'PAYMENT', description: `Paiement commande ${orderId || ''}` } }),
    ]);
    res.json({ ok: true, newBalance: user.walletBalance - amount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
