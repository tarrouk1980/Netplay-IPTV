'use strict';

const { v4: uuidv4 } = require('uuid');

const PLANS = {
  DECOUVERTE: { rides: 1, days: 7, priceMillimes: 9900 },
  SEMAINE: { rides: 7, days: 14, priceMillimes: 59000 },
  MENSUEL: { rides: 30, days: 45, priceMillimes: 199000 },
  PRO: { rides: Infinity, days: 30, priceMillimes: 499000 },
};

/**
 * Initiate a payment (stub — logs and returns mock success).
 * @param {string} provider - 'STRIPE' | 'ORANGE_MONEY'
 * @param {number} amountMillimes - amount in millimes (1 TND = 1000 millimes)
 * @param {string} reference - unique payment reference
 * @returns {Promise<{status, txId, provider, amount}>}
 */
async function initiatePayment(provider, amountMillimes, reference) {
  console.log(`[Payment Stub] ${provider} payment of ${amountMillimes / 1000} TND ref:${reference}`);
  return {
    status: 'PENDING',
    txId: uuidv4(),
    provider,
    amount: amountMillimes,
    reference,
  };
}

module.exports = { initiatePayment, PLANS };
