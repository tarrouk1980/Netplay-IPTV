'use strict';

const config = require('../config/env');

const NOTIFICATION_TYPES = {
  ORDER_NEW: 'ORDER_NEW',
  ORDER_ACCEPTED: 'ORDER_ACCEPTED',
  ORDER_IN_PROGRESS: 'ORDER_IN_PROGRESS',
  ORDER_COMPLETED: 'ORDER_COMPLETED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  ORDER_DISPUTED: 'ORDER_DISPUTED',
  SUBSCRIPTION_EXPIRING: 'SUBSCRIPTION_EXPIRING',
  SUBSCRIPTION_EXHAUSTED: 'SUBSCRIPTION_EXHAUSTED',
  KYC_APPROVED: 'KYC_APPROVED',
  KYC_REJECTED: 'KYC_REJECTED',
  PROMO: 'PROMO',
  SYSTEM: 'SYSTEM',
};

let firebaseAdmin = null;

// Initialize Firebase Admin SDK if env vars are present
if (config.firebaseProjectId && config.firebaseClientEmail && config.firebasePrivateKey) {
  try {
    const admin = require('firebase-admin');
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebaseProjectId,
        clientEmail: config.firebaseClientEmail,
        privateKey: config.firebasePrivateKey.replace(/\\n/g, '\n'),
      }),
    });
    console.log('[FCM] Firebase Admin SDK initialized');
  } catch (err) {
    console.warn('[FCM] Failed to initialize Firebase Admin SDK:', err.message);
    console.warn('[FCM] Push notifications will be mocked.');
    firebaseAdmin = null;
  }
} else {
  console.warn('[FCM] Firebase env vars not set — push notifications will be mocked.');
}

/**
 * Send push notifications to multiple device tokens.
 * @param {string[]} tokens - FCM device tokens
 * @param {string} type - notification type from NOTIFICATION_TYPES
 * @param {string} title - notification title
 * @param {string} body - notification body
 * @param {Object} data - extra data payload
 * @returns {Promise<Object>} send results
 */
async function sendNotification(tokens, type, title, body, data = {}) {
  if (!tokens || tokens.length === 0) {
    return { successCount: 0, failureCount: 0, responses: [] };
  }

  if (firebaseAdmin) {
    try {
      const admin = require('firebase-admin');
      const message = {
        tokens,
        notification: { title, body },
        data: { type, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) },
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } },
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`[FCM] Sent ${response.successCount}/${tokens.length} notifications`);
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      };
    } catch (err) {
      console.error('[FCM] Send error:', err);
      throw err;
    }
  }

  // Mock response
  console.log(`[FCM Mock] Would send "${title}" (${type}) to ${tokens.length} device(s)`);
  console.log(`[FCM Mock] Body: ${body}`);
  if (Object.keys(data).length > 0) console.log('[FCM Mock] Data:', data);

  return {
    successCount: tokens.length,
    failureCount: 0,
    responses: tokens.map((token) => ({ success: true, messageId: `mock_${token.slice(0, 8)}` })),
  };
}

module.exports = { sendNotification, NOTIFICATION_TYPES };
