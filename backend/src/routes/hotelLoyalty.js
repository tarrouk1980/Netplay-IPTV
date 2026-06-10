const express = require('express');
const router = express.Router();

// In-memory mock store (replace with DB in production)
const pointsStore = {};
const historyStore = {};
const referralCodes = {};

function getUserData(userId) {
  if (!pointsStore[userId]) {
    pointsStore[userId] = { points: 2450, level: 'Or', totalEarned: 2450, totalRedeemed: 0 };
  }
  if (!historyStore[userId]) {
    historyStore[userId] = [
      { id: '1', action: 'Clic offre', description: 'Clic sur Djerba Beach Resort', points: 10, type: 'earn', date: new Date().toISOString() },
      { id: '2', action: 'Avis publié', description: 'Avis sur Hammamet Palace', points: 50, type: 'earn', date: new Date(Date.now() - 86400000).toISOString() },
      { id: '3', action: 'Parrainage', description: 'Parrainage validé', points: 200, type: 'earn', date: new Date(Date.now() - 86400000 * 3).toISOString() },
      { id: '4', action: 'Alerte prix', description: 'Activation alerte prix', points: 20, type: 'earn', date: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: '5', action: 'Anniversaire', description: 'Bonus anniversaire', points: 100, type: 'earn', date: new Date(Date.now() - 86400000 * 7).toISOString() },
    ];
  }
  return { points: pointsStore[userId], history: historyStore[userId] };
}

function computeLevel(pts) {
  if (pts >= 7000) return 'Diamant';
  if (pts >= 3000) return 'Or';
  if (pts >= 1000) return 'Argent';
  return 'Bronze';
}

function generateReferralCode(userId) {
  const suffix = userId.toString().slice(-4).toUpperCase();
  return `EASY-${suffix}${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

/**
 * GET /api/hotel-loyalty/points/:userId
 * Returns mock points data for the user
 */
router.get('/points/:userId', (req, res) => {
  const { userId } = req.params;
  const { points } = getUserData(userId);
  res.json({
    success: true,
    data: {
      userId,
      points: points.points,
      level: computeLevel(points.points),
      totalEarned: points.totalEarned,
      totalRedeemed: points.totalRedeemed,
      nextLevelPts: points.points >= 7000 ? null : points.points >= 3000 ? 7000 : points.points >= 1000 ? 3000 : 1000,
    },
  });
});

/**
 * POST /api/hotel-loyalty/earn
 * Body: { userId, action, description, points }
 * Add points to user account
 */
router.post('/earn', (req, res) => {
  const { userId, action, description, points: earnPts } = req.body;
  if (!userId || !action || !earnPts) {
    return res.status(400).json({ success: false, error: 'userId, action and points are required' });
  }
  const pts = parseInt(earnPts, 10);
  if (isNaN(pts) || pts <= 0) return res.status(400).json({ success: false, error: 'Invalid points value' });

  const data = getUserData(userId);
  data.points.points += pts;
  data.points.totalEarned += pts;
  data.points.level = computeLevel(data.points.points);

  const entry = { id: String(Date.now()), action, description: description || action, points: pts, type: 'earn', date: new Date().toISOString() };
  data.history.unshift(entry);
  pointsStore[userId] = data.points;
  historyStore[userId] = data.history;

  res.json({
    success: true,
    data: { newBalance: data.points.points, level: data.points.level, transaction: entry },
  });
});

/**
 * POST /api/hotel-loyalty/redeem
 * Body: { userId, action, description, points }
 * Redeem points from user account
 */
router.post('/redeem', (req, res) => {
  const { userId, action, description, points: redeemPts } = req.body;
  if (!userId || !action || !redeemPts) {
    return res.status(400).json({ success: false, error: 'userId, action and points are required' });
  }
  const pts = parseInt(redeemPts, 10);
  if (isNaN(pts) || pts <= 0) return res.status(400).json({ success: false, error: 'Invalid points value' });

  const data = getUserData(userId);
  if (data.points.points < pts) {
    return res.status(400).json({ success: false, error: 'Insufficient points' });
  }

  data.points.points -= pts;
  data.points.totalRedeemed += pts;
  data.points.level = computeLevel(data.points.points);

  const entry = { id: String(Date.now()), action, description: description || action, points: -pts, type: 'redeem', date: new Date().toISOString() };
  data.history.unshift(entry);
  pointsStore[userId] = data.points;
  historyStore[userId] = data.history;

  res.json({
    success: true,
    data: { newBalance: data.points.points, level: data.points.level, transaction: entry },
  });
});

/**
 * GET /api/hotel-loyalty/history/:userId
 * Returns transaction history
 */
router.get('/history/:userId', (req, res) => {
  const { userId } = req.params;
  const { history } = getUserData(userId);
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '20', 10);
  const start = (page - 1) * limit;
  const paginated = history.slice(start, start + limit);
  res.json({
    success: true,
    data: { history: paginated, total: history.length, page, limit },
  });
});

/**
 * GET /api/hotel-loyalty/referral-code/:userId
 * Get or generate a referral code for the user
 */
router.get('/referral-code/:userId', (req, res) => {
  const { userId } = req.params;
  if (!referralCodes[userId]) {
    referralCodes[userId] = {
      code: generateReferralCode(userId),
      uses: 0,
      rewards: 0,
      referrals: [],
    };
  }
  res.json({
    success: true,
    data: referralCodes[userId],
  });
});

/**
 * POST /api/hotel-loyalty/referral-use
 * Body: { code, newUserId }
 * Apply a referral code — rewards both parties
 */
router.post('/referral-use', (req, res) => {
  const { code, newUserId } = req.body;
  if (!code || !newUserId) return res.status(400).json({ success: false, error: 'code and newUserId are required' });

  // Find owner of this code
  const ownerEntry = Object.entries(referralCodes).find(([, v]) => v.code === code.toUpperCase());
  if (!ownerEntry) return res.status(404).json({ success: false, error: 'Code parrainage invalide' });

  const [ownerId, ownerData] = ownerEntry;
  if (ownerData.referrals.includes(newUserId)) {
    return res.status(400).json({ success: false, error: 'Ce code a déjà été utilisé par cet utilisateur' });
  }

  // Reward owner: +200 pts
  const ownerUserData = getUserData(ownerId);
  ownerUserData.points.points += 200;
  ownerUserData.points.totalEarned += 200;
  ownerUserData.history.unshift({ id: String(Date.now()), action: 'Parrainage', description: `Parrainage validé (${newUserId})`, points: 200, type: 'earn', date: new Date().toISOString() });
  pointsStore[ownerId] = ownerUserData.points;
  historyStore[ownerId] = ownerUserData.history;

  // Reward new user: +100 pts
  const newUserData = getUserData(newUserId);
  newUserData.points.points += 100;
  newUserData.points.totalEarned += 100;
  newUserData.history.unshift({ id: String(Date.now() + 1), action: 'Code parrainage', description: `Code ${code} utilisé — bonus bienvenue`, points: 100, type: 'earn', date: new Date().toISOString() });
  pointsStore[newUserId] = newUserData.points;
  historyStore[newUserId] = newUserData.history;

  // Update referral record
  ownerData.uses += 1;
  ownerData.rewards += 20; // TND reward
  ownerData.referrals.push(newUserId);
  referralCodes[ownerId] = ownerData;

  res.json({
    success: true,
    data: {
      message: 'Code appliqué avec succès',
      ownerReward: { points: 200, tnd: 20 },
      newUserReward: { points: 100, tnd: 10 },
    },
  });
});

module.exports = router;
