'use strict';
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { prisma } = require('../config/db');
const router = express.Router();

const LEVELS = [
  { name: 'Bronze', min: 0, max: 999, color: '#CD7F32' },
  { name: 'Argent', min: 1000, max: 4999, color: '#C0C0C0' },
  { name: 'Or', min: 5000, max: 9999, color: '#FFD700' },
  { name: 'Platine', min: 10000, max: Infinity, color: '#E5E4E2' },
];

function getLevel(points) {
  return LEVELS.find((l) => points >= l.min && points <= l.max) || LEVELS[0];
}

const REWARDS = [
  { id: 'r1', label: '-10% Taxi', description: 'Réduction sur prochaine course taxi', points: 500, icon: '🚕' },
  { id: 'r2', label: 'Livraison gratuite', description: 'Frais de livraison offerts', points: 300, icon: '🛵' },
  { id: 'r3', label: '-50% SOS', description: 'Moitié prix sur intervention SOS', points: 800, icon: '🚑' },
  { id: 'r4', label: 'Course offerte', description: 'Une course taxi gratuite', points: 2000, icon: '🎁' },
];

// GET /api/loyalty/balance
router.get('/balance', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { loyaltyPoints: true },
    });
    const points = user?.loyaltyPoints || 0;
    const level = getLevel(points);
    const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
    res.json({
      points,
      level: level.name,
      levelColor: level.color,
      nextLevel: nextLevel?.name || null,
      pointsToNext: nextLevel ? nextLevel.min - points : 0,
      rewards: REWARDS,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/loyalty/history
router.get('/history', authenticate, async (req, res) => {
  try {
    const history = await prisma.loyaltyTransaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    res.json(history);
  } catch {
    res.json([]);
  }
});

// POST /api/loyalty/redeem
router.post('/redeem', authenticate, async (req, res) => {
  const { rewardId } = req.body;
  const reward = REWARDS.find((r) => r.id === rewardId);
  if (!reward) return res.status(400).json({ error: 'Récompense invalide' });
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { loyaltyPoints: true },
    });
    if ((user?.loyaltyPoints || 0) < reward.points) {
      return res.status(400).json({ error: 'Points insuffisants' });
    }
    await prisma.$transaction([
      prisma.user.update({
        where: { id: req.user.id },
        data: { loyaltyPoints: { decrement: reward.points } },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          userId: req.user.id,
          points: -reward.points,
          description: `Échange: ${reward.label}`,
          type: 'REDEEM',
        },
      }),
    ]);
    res.json({ success: true, reward });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const profile = await prisma.user.findUnique({ where: { id: req.user.id }, select: { loyaltyPoints: true } });
    const history = await prisma.loyaltyTransaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { id: true, type: true, points: true, description: true, createdAt: true },
    });
    res.json({
      points: profile?.loyaltyPoints || 0,
      history: history.map(h => ({
        id: h.id,
        type: h.type,
        points: h.points,
        desc: h.description,
        createdAt: h.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/loyalty/rewards — points + tier + history
router.get('/rewards', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { easyPoints: true },
    }).catch(() => null);
    const history = await prisma.pointsTransaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }).catch(() => []);
    return res.json({ points: user?.easyPoints || 0, history });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/loyalty/redeem
router.post('/redeem', authenticate, async (req, res) => {
  try {
    const { rewardId } = req.body;
    const REWARD_COSTS = { r1: 200, r2: 150, r3: 400, r4: 100, r5: 500, r6: 350 };
    const cost = REWARD_COSTS[rewardId];
    if (!cost) return res.status(400).json({ error: 'Récompense invalide' });
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { easyPoints: true } }).catch(() => null);
    if (!user || (user.easyPoints || 0) < cost) return res.status(400).json({ error: 'Points insuffisants' });
    await prisma.user.update({ where: { id: req.user.id }, data: { easyPoints: { decrement: cost } } }).catch(() => null);
    return res.json({ success: true, pointsSpent: cost, newBalance: (user.easyPoints || 0) - cost });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
