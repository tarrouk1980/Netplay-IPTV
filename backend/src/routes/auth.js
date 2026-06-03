'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { redisClient } = require('../config/redis');
const tokenService = require('../services/tokenService');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();

// ── Multer storage for KYC uploads ───────────────────────────────────────────
const kycStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'kyc', req.user?.id || 'unknown');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${file.fieldname}_${Date.now()}${ext}`);
  },
});
const kycUpload = multer({ storage: kycStorage, limits: { fileSize: 10 * 1024 * 1024 } });

// Helper: parse refresh token expiry to seconds
function refreshExpiryToSeconds(str) {
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) return 30 * 24 * 3600;
  const val = parseInt(match[1]);
  const unit = match[2];
  const map = { s: 1, m: 60, h: 3600, d: 86400 };
  return val * map[unit];
}

async function sendOtp(phone, otp) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[OTP Dev] Phone: ${phone}, OTP: ${otp}`);
  }
  // TODO: integrate Twilio in production
}

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('role')
      .optional()
      .isIn(['CLIENT', 'CHAUFFEUR', 'LIVREUR', 'DEPANNEUR', 'MARCHAND', 'ADMIN'])
      .withMessage('Invalid role'),
    body('email').optional().isEmail().withMessage('Invalid email'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { name, phone, email, role, password } = req.body;

    try {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) {
        return res.status(409).json({ error: 'Phone already registered', code: 'PHONE_EXISTS' });
      }

      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

      // En phase de test: auto-approuver les prestataires (KYC manuel activé en production)
      const kycStatus = ['CHAUFFEUR', 'LIVREUR', 'DEPANNEUR', 'MARCHAND'].includes(role) ? 'APPROVED' : 'NOT_REQUIRED';

      // Generate unique referral code at registration
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let referralCode, codeUnique = false;
      while (!codeUnique) {
        referralCode = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const existing2 = await prisma.user.findUnique({ where: { referralCode } });
        if (!existing2) codeUnique = true;
      }

      const user = await prisma.user.create({
        data: {
          name,
          phone,
          email: email || null,
          password: hashedPassword,
          role: role || 'CLIENT',
          kycStatus,
          referralCode,
        },
        select: { id: true, name: true, phone: true, email: true, role: true, kycStatus: true, referralCode: true, createdAt: true },
      });

      const tokenPayload = { id: user.id, role: user.role, kycStatus: user.kycStatus };
      const accessToken = tokenService.signAccess(tokenPayload);
      const refreshToken = tokenService.signRefresh(tokenPayload);
      const decoded = tokenService.verifyRefresh(refreshToken);
      await tokenService.storeRefreshToken(decoded.jti, user.id, refreshExpiryToSeconds(process.env.JWT_REFRESH_EXPIRES || '30d'));

      // Send OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await redisClient.setex(`otp:${phone}`, 300, otp);
      await sendOtp(phone, otp);

      return res.status(201).json({ user, accessToken, refreshToken });
    } catch (err) {
      console.error('[Auth/Register]', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const { phone, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { phone } });
      if (!user || !user.password) {
        return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
      }

      if (['CHAUFFEUR', 'DEPANNEUR'].includes(user.role) && user.kycStatus === 'REJECTED') {
        return res.status(403).json({ error: 'KYC rejected. Contact support.', code: 'KYC_REJECTED' });
      }

      const tokenPayload = { id: user.id, role: user.role, kycStatus: user.kycStatus };
      const accessToken = tokenService.signAccess(tokenPayload);
      const refreshToken = tokenService.signRefresh(tokenPayload);
      const decoded = tokenService.verifyRefresh(refreshToken);
      await tokenService.storeRefreshToken(decoded.jti, user.id, refreshExpiryToSeconds(process.env.JWT_REFRESH_EXPIRES || '30d'));

      return res.json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          kycStatus: user.kycStatus,
        },
      });
    } catch (err) {
      console.error('[Auth/Login]', err);
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
);

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'refreshToken is required', code: 'MISSING_TOKEN' });
  }

  try {
    const decoded = tokenService.verifyRefresh(refreshToken);
    const valid = await tokenService.isRefreshTokenValid(decoded.jti);
    if (!valid) {
      return res.status(401).json({ error: 'Refresh token revoked or expired', code: 'TOKEN_REVOKED' });
    }

    // Revoke old refresh token
    await tokenService.revokeRefreshToken(decoded.jti);

    // Issue new tokens
    const payload = { id: decoded.id, role: decoded.role, kycStatus: decoded.kycStatus };
    const newAccessToken = tokenService.signAccess(payload);
    const newRefreshToken = tokenService.signRefresh(payload);
    const newDecoded = tokenService.verifyRefresh(newRefreshToken);
    await tokenService.storeRefreshToken(newDecoded.jti, decoded.id, refreshExpiryToSeconds(process.env.JWT_REFRESH_EXPIRES || '30d'));

    return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid refresh token', code: 'INVALID_TOKEN' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    try {
      const decoded = tokenService.verifyRefresh(refreshToken);
      await tokenService.revokeRefreshToken(decoded.jti);
    } catch (_) {
      // ignore invalid token errors on logout
    }
  }
  return res.json({ message: 'Logged out successfully' });
});

// POST /api/auth/otp/send
router.post('/otp/send', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'phone is required', code: 'MISSING_FIELD' });
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.setex(`otp:${phone}`, 300, otp);
    await sendOtp(phone, otp);
    return res.json({ message: 'OTP sent', expiresIn: 300 });
  } catch (err) {
    console.error('[Auth/OTP/Send]', err);
    return res.status(500).json({ error: 'Failed to send OTP', code: 'OTP_SEND_FAILED' });
  }
});

// POST /api/auth/otp/verify
router.post('/otp/verify', async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: 'phone and otp are required', code: 'MISSING_FIELDS' });
  }

  try {
    const stored = await redisClient.get(`otp:${phone}`);
    if (!stored) {
      return res.status(400).json({ error: 'OTP expired or not found', code: 'OTP_EXPIRED' });
    }
    if (stored !== otp) {
      return res.status(400).json({ error: 'Invalid OTP', code: 'OTP_INVALID' });
    }

    await redisClient.del(`otp:${phone}`);

    // Mark phone as verified in user record (store a flag in Redis or update user)
    await redisClient.set(`phone_verified:${phone}`, '1');

    return res.json({ message: 'Phone verified successfully' });
  } catch (err) {
    console.error('[Auth/OTP/Verify]', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'phone is required', code: 'MISSING_FIELD' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      // Don't reveal if phone exists; still return success
      return res.json({ success: true, message: 'Code envoyé par SMS' });
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    await redisClient.setex(`forgot:${phone}`, 600, code);
    console.log(`[ForgotPassword Dev] Phone: ${phone}, Code: ${code}`);

    return res.json({ success: true, message: 'Code envoyé par SMS' });
  } catch (err) {
    console.error('[Auth/ForgotPassword]', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { phone, code, newPassword } = req.body;
  if (!phone || !code || !newPassword) {
    return res.status(400).json({ error: 'phone, code and newPassword are required', code: 'MISSING_FIELDS' });
  }

  try {
    const stored = await redisClient.get(`forgot:${phone}`);
    if (!stored) {
      return res.status(400).json({ error: 'Code expiré ou introuvable', code: 'CODE_EXPIRED' });
    }
    if (stored !== code) {
      return res.status(400).json({ error: 'Code invalide', code: 'CODE_INVALID' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { phone }, data: { password: hashedPassword } });
    await redisClient.del(`forgot:${phone}`);

    return res.json({ success: true });
  } catch (err) {
    console.error('[Auth/ResetPassword]', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/auth/kyc-upload — upload KYC photos after registration
router.post(
  '/kyc-upload',
  authenticate,
  kycUpload.fields([
    { name: 'facePhoto', maxCount: 1 },
    { name: 'truckPhoto', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const docs = {};
      if (req.files?.facePhoto?.[0]) {
        docs.facePhoto = req.files.facePhoto[0].path;
      }
      if (req.files?.truckPhoto?.[0]) {
        docs.truckPhoto = req.files.truckPhoto[0].path;
      }

      await prisma.user.update({
        where: { id: req.user.id },
        data: { kycDocuments: JSON.stringify(docs) },
      });

      console.log(`[KYC Upload] User ${req.user.id} uploaded docs:`, docs);
      return res.json({ success: true, documents: docs });
    } catch (err) {
      console.error('[Auth/KYC-Upload]', err);
      return res.status(500).json({ error: 'Failed to upload KYC documents', code: 'UPLOAD_FAILED' });
    }
  }
);

module.exports = router;
