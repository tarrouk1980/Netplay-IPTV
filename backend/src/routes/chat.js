'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const { prisma } = require('../config/db');

const router = express.Router();

// Ensure the requesting user is a party (client or provider) on the order
async function requireOrderParty(req, res, next) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      select: { clientId: true, providerId: true },
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
    }
    if (order.clientId !== req.user.id && order.providerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied', code: 'FORBIDDEN' });
    }
    next();
  } catch (err) {
    console.error('[Chat] requireOrderParty error:', err);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}

const chatStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'chat');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    cb(null, `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const chatUpload = multer({
  storage: chatStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/', 'video/', 'audio/'];
    if (allowed.some((t) => file.mimetype.startsWith(t))) cb(null, true);
    else cb(new Error('Type de fichier non autorisé'));
  },
});

// POST /api/chat/upload — upload media (photo, video, audio)
router.post('/upload', authenticate, chatUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });

  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  const url = `${baseUrl}/uploads/chat/${req.file.filename}`;

  res.json({ url, filename: req.file.filename, size: req.file.size });
});

// In-memory chat store (replace with DB when ChatMessage model added to schema)
const chatMessages = new Map(); // orderId → Message[]

// GET /api/chat/:orderId/messages — history
router.get('/:orderId/messages', authenticate, requireOrderParty, (req, res) => {
  const msgs = chatMessages.get(req.params.orderId) || [];
  res.json(msgs);
});

// POST /api/chat/:orderId/messages — send message
router.post('/:orderId/messages', authenticate, requireOrderParty, (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Message vide' });

  const msg = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    orderId: req.params.orderId,
    senderId: req.user.id,
    senderName: req.user.name,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  const msgs = chatMessages.get(req.params.orderId) || [];
  msgs.push(msg);
  // Keep last 200 messages per order
  if (msgs.length > 200) msgs.shift();
  chatMessages.set(req.params.orderId, msgs);

  // Broadcast via socket
  try {
    const { getIO } = require('../socket');
    const io = getIO();
    if (io) io.to(`order_${req.params.orderId}`).emit(`chat:${req.params.orderId}`, msg);
  } catch {}

  res.json(msg);
});

// POST /api/chat/:orderId/voice — send a voice message
router.post('/:orderId/voice', authenticate, requireOrderParty, chatUpload.single('audio'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });

  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  const url = `${baseUrl}/uploads/chat/${req.file.filename}`;

  const msg = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    orderId: req.params.orderId,
    senderId: req.user.id,
    senderName: req.user.name,
    type: 'VOICE',
    url,
    createdAt: new Date().toISOString(),
  };

  const msgs = chatMessages.get(req.params.orderId) || [];
  msgs.push(msg);
  if (msgs.length > 200) msgs.shift();
  chatMessages.set(req.params.orderId, msgs);

  try {
    const { getIO } = require('../socket');
    const io = getIO();
    if (io) io.to(`order_${req.params.orderId}`).emit(`chat:${req.params.orderId}`, msg);
  } catch {}

  res.json(msg);
});

// POST /api/chat/:orderId/image — send an image message
router.post('/:orderId/image', authenticate, requireOrderParty, chatUpload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });

  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  const url = `${baseUrl}/uploads/chat/${req.file.filename}`;

  const msg = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    orderId: req.params.orderId,
    senderId: req.user.id,
    senderName: req.user.name,
    type: 'IMAGE',
    url,
    createdAt: new Date().toISOString(),
  };

  const msgs = chatMessages.get(req.params.orderId) || [];
  msgs.push(msg);
  if (msgs.length > 200) msgs.shift();
  chatMessages.set(req.params.orderId, msgs);

  try {
    const { getIO } = require('../socket');
    const io = getIO();
    if (io) io.to(`order_${req.params.orderId}`).emit(`chat:${req.params.orderId}`, msg);
  } catch {}

  res.json(msg);
});

module.exports = router;
