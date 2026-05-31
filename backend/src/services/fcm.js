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
