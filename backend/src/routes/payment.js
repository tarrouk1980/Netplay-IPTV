'use strict';
const express = require('express');
const axios = require('axios');
const { authenticate } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// ─── Flouci ─────────────────────────────────────────────────────
// Flouci API docs: https://developers.flouci.com
const FLOUCI_APP_TOKEN = process.env.FLOUCI_APP_TOKEN || '';
const FLOUCI_APP_SECRET = process.env.FLOUCI_APP_SECRET || '';
const FLOUCI_BASE = 'https://developers.flouci.com/api';

// POST /api/payment/flouci — génère une session de paiement Flouci
router.post('/flouci', authenticate, async (req, res) => {
  const { orderId, amount } = req.body;
  if (!orderId || !amount) return res.status(400).json({ error: 'orderId et amount requis' });

  // Mode simulation si pas de clés API
  if (!FLOUCI_APP_TOKEN) {
    await new Promise(r => setTimeout(r, 800));
    return res.json({
      success: true,
      transactionId: `FLC_SIM_${Date.now()}`,
      paymentUrl: null, // En prod: URL de redirection Flouci
      amount,
      orderId,
      mode: 'simulation',
    });
  }

  try {
    const { data } = await axios.post(`${FLOUCI_BASE}/generate_payment`, {
      app_token: FLOUCI_APP_TOKEN,
      app_secret: FLOUCI_APP_SECRET,
      amount: Math.round(amount * 1000), // Flouci utilise millimes
      accept_card: true,
      session_timeout_secs: 1200,
      success_link: `${process.env.BASE_URL}/api/payment/flouci/success?orderId=${orderId}`,
      fail_link: `${process.env.BASE_URL}/api/payment/flouci/fail?orderId=${orderId}`,
      developer_tracking_id: orderId,
    }, { timeout: 10000 });

    res.json({
      success: true,
      paymentId: data.result?.payment_id,
      paymentUrl: data.result?.link,
      amount,
      orderId,
    });
  } catch (err) {
    res.status(502).json({ error: 'Flouci indisponible', detail: err.message });
  }
});

// GET /api/payment/flouci/success — webhook Flouci succès
router.get('/flouci/success', async (req, res) => {
  const { orderId, payment_id } = req.query;
  try {
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID', paymentMethod: 'FLOUCI', paymentRef: payment_id },
      }).catch(() => {});
    }
    res.redirect(`${process.env.MOBILE_DEEP_LINK || 'easyway://'}payment/success?orderId=${orderId}`);
  } catch {
    res.send('Paiement confirmé');
  }
});

// GET /api/payment/flouci/fail — webhook Flouci échec
router.get('/flouci/fail', async (req, res) => {
  const { orderId } = req.query;
  res.redirect(`${process.env.MOBILE_DEEP_LINK || 'easyway://'}payment/fail?orderId=${orderId}`);
});

// POST /api/payment/flouci/verify — vérifier statut paiement
router.post('/flouci/verify', authenticate, async (req, res) => {
  const { paymentId } = req.body;
  if (!FLOUCI_APP_TOKEN || !paymentId) {
    return res.json({ status: 'UNKNOWN', mode: 'simulation' });
  }
  try {
    const { data } = await axios.get(`${FLOUCI_BASE}/verify_payment/${paymentId}`, {
      params: { app_token: FLOUCI_APP_TOKEN },
      timeout: 8000,
    });
    res.json({ status: data.result?.status, paymentId, raw: data.result });
  } catch (err) {
    res.status(502).json({ error: 'Vérification Flouci échouée', detail: err.message });
  }
});

// ─── D17 ─────────────────────────────────────────────────────────
// D17 API (Poste Tunisienne): documentation interne
const D17_MERCHANT_ID = process.env.D17_MERCHANT_ID || '';
const D17_SECRET = process.env.D17_SECRET || '';
const D17_BASE = 'https://gateway.d17.tn/api/v1';

// POST /api/payment/d17 — initier paiement D17
router.post('/d17', authenticate, async (req, res) => {
  const { orderId, amount, phone } = req.body;
  if (!orderId || !amount) return res.status(400).json({ error: 'orderId et amount requis' });

  if (!D17_MERCHANT_ID) {
    await new Promise(r => setTimeout(r, 800));
    return res.json({
      success: true,
      transactionId: `D17_SIM_${Date.now()}`,
      paymentUrl: null,
      amount,
      orderId,
      mode: 'simulation',
    });
  }

  try {
    const { data } = await axios.post(`${D17_BASE}/payment/init`, {
      merchant_id: D17_MERCHANT_ID,
      secret: D17_SECRET,
      amount: parseFloat(amount),
      currency: 'TND',
      order_id: orderId,
      customer_phone: phone,
      callback_url: `${process.env.BASE_URL}/api/payment/d17/callback`,
      return_url: `${process.env.MOBILE_DEEP_LINK || 'easyway://'}payment/success`,
    }, { timeout: 10000 });

    res.json({
      success: true,
      transactionId: data.transaction_id,
      paymentUrl: data.payment_url,
      amount,
      orderId,
    });
  } catch (err) {
    res.status(502).json({ error: 'D17 indisponible', detail: err.message });
  }
});

// POST /api/payment/d17/callback — webhook D17
router.post('/d17/callback', async (req, res) => {
  const { order_id, transaction_id, status } = req.body;
  try {
    if (order_id && status === 'SUCCESS') {
      await prisma.order.update({
        where: { id: order_id },
        data: { paymentStatus: 'PAID', paymentMethod: 'D17', paymentRef: transaction_id },
      }).catch(() => {});
    }
    res.json({ received: true });
  } catch {
    res.json({ received: true });
  }
});

// ─── Cash ─────────────────────────────────────────────────────────
router.post('/cash', authenticate, async (req, res) => {
  const { orderId, amount } = req.body;
  try {
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentMethod: 'CASH', paymentStatus: 'PENDING' },
      }).catch(() => {});
    }
    res.json({ success: true, method: 'CASH', orderId, amount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
