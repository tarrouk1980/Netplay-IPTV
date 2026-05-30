'use strict';

const { prisma } = require('../config/db');

// Seuils de détection fraude
const THRESHOLDS = {
  cancelRate: 0.4,       // 40% d'annulations → suspect
  minOrders: 5,          // à partir de 5 commandes analysées
  recentWindow: 7,       // jours glissants
  maxCancelsPerDay: 3,   // plus de 3 annulations/jour → alerte immédiate
};

/**
 * Analyse le comportement d'un prestataire après chaque action.
 * Retourne { flagged: bool, reason: string|null, score: number }
 */
async function analyzeProvider(providerId) {
  const since = new Date(Date.now() - THRESHOLDS.recentWindow * 24 * 60 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: {
      providerId,
      createdAt: { gte: since },
    },
    select: { id: true, status: true, createdAt: true },
  });

  if (orders.length < THRESHOLDS.minOrders) {
    return { flagged: false, reason: null, score: 0 };
  }

  const cancelled = orders.filter((o) => o.status === 'CANCELLED');
  const cancelRate = cancelled.length / orders.length;

  // Annulations aujourd'hui
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCancels = cancelled.filter((o) => new Date(o.createdAt) >= today).length;

  let score = 0;
  let reasons = [];

  if (cancelRate >= THRESHOLDS.cancelRate) {
    score += 50;
    reasons.push(`Taux d'annulation élevé: ${Math.round(cancelRate * 100)}%`);
  }

  if (todayCancels >= THRESHOLDS.maxCancelsPerDay) {
    score += 40;
    reasons.push(`${todayCancels} annulations aujourd'hui`);
  }

  const flagged = score >= 50;

  if (flagged) {
    // Logguer pour l'admin
    console.warn(`[AntiFraud] Provider ${providerId} flagged. Score: ${score}. Reasons: ${reasons.join(', ')}`);

    // Incrémenter le compteur de fraude en DB (champ fraudScore si existant)
    await prisma.user.updateMany({
      where: { id: providerId },
      data: { fraudScore: { increment: score } },
    }).catch(() => {}); // silently ignore if field doesn't exist yet
  }

  return { flagged, reason: reasons.join(' | ') || null, score };
}

/**
 * Bannir un utilisateur (admin only)
 */
async function banUser(userId, reason, adminId) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isBanned: true, bannedReason: reason, bannedAt: new Date(), bannedBy: adminId },
  }).catch(async () => {
    // fallback si les champs n'existent pas encore
    return prisma.user.update({ where: { id: userId }, data: { kycStatus: 'BANNED' } });
  });

  console.warn(`[AntiFraud] User ${userId} banned by admin ${adminId}. Reason: ${reason}`);
  return user;
}

/**
 * Vérifier si un utilisateur est banni avant de servir une requête
 */
async function checkBanned(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBanned: true, kycStatus: true },
  }).catch(() => null);

  if (!user) return false;
  return user.isBanned === true || user.kycStatus === 'BANNED';
}

module.exports = { analyzeProvider, banUser, checkBanned };
