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
 * Send via Expo Push API (used when token starts with "ExponentPushToken").
 */
async function sendViaExpoPush(expoTokens, title, body, data = {}) {
  const https = require('https');
  const messages = expoTokens.map(to => ({
    to,
    title,
    body,
    data,
    sound: 'default',
    priority: 'high',
  }));

  return new Promise((resolve) => {
    const payload = JSON.stringify(messages);
    const req = https.request({
      hostname: 'exp.host',
      path: '/--/api/v2/push/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
    }, (res) => {
      let raw = '';
      res.on('data', d => { raw += d; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          const results = parsed.data || [];
          const successCount = results.filter(r => r.status === 'ok').length;
          console.log(`[ExpoPush] Sent ${successCount}/${expoTokens.length} notifications`);
          resolve({ successCount, failureCount: expoTokens.length - successCount });
        } catch {
          resolve({ successCount: 0, failureCount: expoTokens.length });
        }
      });
    });
    req.on('error', (e) => {
      console.warn('[ExpoPush] Request error:', e.message);
      resolve({ successCount: 0, failureCount: expoTokens.length });
    });
    req.write(payload);
    req.end();
  });
}

/**
 * Send push notifications to multiple device tokens.
 * Supports both Expo push tokens (ExponentPushToken[...]) and FCM tokens.
 * @param {string[]} tokens - device tokens
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

  // Split tokens by type
  const expoTokens = tokens.filter(t => t && t.startsWith('ExponentPushToken'));
  const fcmTokens = tokens.filter(t => t && !t.startsWith('ExponentPushToken'));

  let expoResult = { successCount: 0, failureCount: 0 };
  let fcmResult = { successCount: 0, failureCount: 0 };

  // Send Expo tokens via Expo Push API
  if (expoTokens.length > 0) {
    expoResult = await sendViaExpoPush(expoTokens, title, body, { type, ...data });
  }

  // Send FCM tokens via Firebase Admin SDK
  if (fcmTokens.length > 0 && firebaseAdmin) {
    try {
      const admin = require('firebase-admin');
      const message = {
        tokens: fcmTokens,
        notification: { title, body },
        data: { type, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) },
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } },
      };
      const response = await admin.messaging().sendEachForMulticast(message);
      fcmResult = { successCount: response.successCount, failureCount: response.failureCount };
      console.log(`[FCM] Sent ${response.successCount}/${fcmTokens.length} FCM notifications`);
    } catch (err) {
      console.error('[FCM] Send error:', err);
      fcmResult = { successCount: 0, failureCount: fcmTokens.length };
    }
  } else if (fcmTokens.length > 0) {
    // Mock FCM
    console.log(`[FCM Mock] Would send "${title}" (${type}) to ${fcmTokens.length} device(s) — Body: ${body}`);
    fcmResult = { successCount: fcmTokens.length, failureCount: 0 };
  }

  return {
    successCount: expoResult.successCount + fcmResult.successCount,
    failureCount: expoResult.failureCount + fcmResult.failureCount,
  };
}

/**
 * Send notification to a single user by userId.
 * Looks up the user's fcmToken from the database.
 */
async function sendToUser(userId, title, body, data = {}) {
  try {
    const { prisma } = require('../config/db');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });
    if (!user?.fcmToken) {
      console.log(`[FCM] No fcmToken for user ${userId}`);
      return;
    }
    return sendNotification([user.fcmToken], data.type || NOTIFICATION_TYPES.SYSTEM, title, body, data);
  } catch (err) {
    console.warn('[FCM] sendToUser error:', err.message);
  }
}

/**
 * Notify client and provider when order status changes.
 */
async function sendOrderUpdate(orderId, status) {
  try {
    const { prisma } = require('../config/db');
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: { select: { fcmToken: true } },
        provider: { select: { fcmToken: true } },
      },
    });
    if (!order) return;

    const STATUS_MESSAGES = {
      ACCEPTED: { title: 'Commande acceptée !', body: 'Un prestataire a accepté votre demande.' },
      IN_PROGRESS: { title: 'En cours', body: 'La prestation a démarré.' },
      COMPLETED: { title: 'Terminé !', body: 'Votre commande est terminée. Merci !' },
      CANCELLED: { title: 'Annulé', body: 'La commande a été annulée.' },
    };

    const msg = STATUS_MESSAGES[status] || { title: `Statut: ${status}`, body: '' };
    const notifType = NOTIFICATION_TYPES[`ORDER_${status}`] || NOTIFICATION_TYPES.SYSTEM;

    const tokens = [order.client?.fcmToken, order.provider?.fcmToken].filter(Boolean);
    if (tokens.length > 0) {
      await sendNotification(tokens, notifType, msg.title, msg.body, { orderId, status });
    }
  } catch (err) {
    console.warn('[FCM] sendOrderUpdate error:', err.message);
  }
}

module.exports = { sendNotification, sendToUser, sendOrderUpdate, NOTIFICATION_TYPES };
