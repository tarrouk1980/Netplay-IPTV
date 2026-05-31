'use strict';
const express = require('express');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// In-memory ticket store (replace with DB model when schema updated)
const tickets = [];
let ticketSeq = 1;

// GET /api/support/tickets
router.get('/tickets', authenticate, async (req, res) => {
  const userTickets = tickets.filter(t => t.userId === req.user.id);
  res.json({ tickets: userTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
});

// POST /api/support/tickets
router.post('/tickets', authenticate, async (req, res) => {
  const { category, subject, message } = req.body;
  if (!subject?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'subject and message are required' });
  }
  const ticket = {
    id: `TKT-${String(ticketSeq++).padStart(4, '0')}`,
    userId: req.user.id,
    category: category || 'OTHER',
    subject: subject.trim(),
    message: message.trim(),
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    lastReply: null,
    replies: [],
  };
  tickets.push(ticket);
  res.status(201).json({ ticket });
});

// GET /api/support/tickets/:id
router.get('/tickets/:id', authenticate, async (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.id && t.userId === req.user.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});

// POST /api/support/tickets/:id/reply (admin)
router.post('/tickets/:id/reply', authenticate, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  const ticket = tickets.find(t => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const { message, status } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'message required' });
  ticket.replies.push({ author: 'ADMIN', message: message.trim(), createdAt: new Date().toISOString() });
  ticket.lastReply = message.trim();
  if (status) ticket.status = status;
  res.json(ticket);
});

// GET /api/support/admin/tickets (admin)
router.get('/admin/tickets', authenticate, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  const { status } = req.query;
  const result = status ? tickets.filter(t => t.status === status) : tickets;
  res.json({ tickets: result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
});

module.exports = router;
