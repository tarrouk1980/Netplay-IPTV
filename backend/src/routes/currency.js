'use strict';

const express = require('express');
const router = express.Router();

// Taux de change mock (base TND)
const RATES = {
  TND: 1,
  MAD: 3.50,
  DZD: 40.0,
  EUR: 0.30,
  USD: 0.32,
};

const LAST_UPDATED = new Date().toISOString();

/**
 * GET /api/currency/rates
 * Retourne tous les taux de change disponibles (base TND)
 */
router.get('/rates', (req, res) => {
  const pairs = [];
  const currencies = Object.keys(RATES);
  currencies.forEach(from => {
    currencies.forEach(to => {
      if (from !== to) {
        pairs.push({
          from,
          to,
          rate: parseFloat((RATES[to] / RATES[from]).toFixed(6)),
        });
      }
    });
  });

  res.json({
    base: 'TND',
    rates: RATES,
    pairs,
    lastUpdated: LAST_UPDATED,
    examples: [
      { label: '1 nuit à Djerba', amountTND: 250, amountEUR: Math.round(250 * RATES.EUR), amountUSD: Math.round(250 * RATES.USD) },
      { label: '1 nuit à Marrakech', amountMAD: 875, amountTND: Math.round(875 / RATES.MAD), amountEUR: Math.round(875 / RATES.MAD * RATES.EUR) },
    ],
  });
});

/**
 * GET /api/currency/convert?from=TND&to=EUR&amount=100
 * Convertit un montant d'une devise à l'autre
 */
router.get('/convert', (req, res) => {
  const { from = 'TND', to = 'EUR', amount } = req.query;

  if (!amount || isNaN(Number(amount))) {
    return res.status(400).json({ error: 'Paramètre "amount" invalide ou manquant', code: 'INVALID_AMOUNT' });
  }
  if (!RATES[from]) {
    return res.status(400).json({ error: `Devise source "${from}" non supportée`, code: 'UNSUPPORTED_CURRENCY' });
  }
  if (!RATES[to]) {
    return res.status(400).json({ error: `Devise cible "${to}" non supportée`, code: 'UNSUPPORTED_CURRENCY' });
  }

  const amountNum = parseFloat(amount);
  const rate = RATES[to] / RATES[from];
  const converted = parseFloat((amountNum * rate).toFixed(2));

  res.json({
    from,
    to,
    amount: amountNum,
    converted,
    rate: parseFloat(rate.toFixed(6)),
    lastUpdated: LAST_UPDATED,
  });
});

module.exports = router;
