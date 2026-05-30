'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Generate nanoid-like 6-char code without external dep
function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function ensureReferralCode(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { referralCode: true } });
  if (user?.referralCode) return user.referralCode;

  // Generate unique code
  let code;
  let unique = false;
  while (!unique) {
    code = generateReferralCode();
    const existing = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!existing) unique = true;
  }

  await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
  return code;
}

// GET /api/referral/my-code — auth — returns just { code }
router.get('/my-code', authenticate, async (req, res) => {
  try {
    const code = await ensureReferralCode(req.user.id);
    return res.json({ code });
  } catch (err) {
    console.error('[Referral] my-code error:', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// GET /api/referral/my-stats — auth — returns { code, referrals: count, totalRewardsEarned }
router.get('/my-stats', authenticate, async (req, res) => {
  try {
    const code = await ensureReferralCode(req.user.id);

    const [referralsCount, rewardsAggregate] = await Promise.all([
      prisma.user.count({ where: { referredBy: req.user.id } }),
      prisma.referralReward.aggregate({
        where: { referrerId: req.user.id },
        _sum: { rewardAmount: true },
      }),
    ]);

    return res.json({
      code,
      referrals: referralsCount,
      totalRewardsEarned: rewardsAggregate._sum.rewardAmount || 0,
    });
  } catch (err) {
    console.error('[Referral] my-stats error:', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/referral/apply — CLIENT authenticated — body: { code }
router.post(
  '/apply',
  authenticate,
  [body('code').trim().notEmpty().withMessage('code is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { code } = req.body;

    try {
      // Check if user already used a referral code
      const currentUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { referredBy: true },
      });

      if (currentUser?.referredBy) {
        return res.status(409).json({ error: 'Vous avez déjà utilisé un code de parrainage', code: 'ALREADY_REFERRED' });
      }

      // Find referrer by code
      const referrer = await prisma.user.findUnique({
        where: { referralCode: code.toUpperCase() },
        select: { id: true, referralCode: true },
      });

      if (!referrer) {
        return res.status(404).json({ error: 'Code de parrainage invalide', code: 'INVALID_CODE' });
      }

      if (referrer.id === req.user.id) {
        return res.status(400).json({ error: 'Vous ne pouvez pas utiliser votre propre code', code: 'SELF_REFERRAL' });
      }

      // Mark user as referred and create reward for referrer
      await prisma.$transaction([
        prisma.user.update({
          where: { id: req.user.id },
          data: { referredBy: referrer.id },
        }),
        prisma.referralReward.create({
          data: {
            referrerId: referrer.id,
            refereeId: req.user.id,
            rewardType: 'PASS_DAY',
            rewardAmount: 1,
          },
        }),
      ]);

      return res.json({ success: true, message: 'Code de parrainage appliqué ! Votre ami a gagné 1 jour gratuit.' });
    } catch (err) {
      console.error('[Referral] apply error:', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

module.exports = router;
