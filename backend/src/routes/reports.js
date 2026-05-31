'use strict';
const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// POST /api/reports — client signale un prestataire
router.post('/', authenticate, async (req, res) => {
  const { orderId, reportedUserId, reasons, details } = req.body;
  try {
    const report = await prisma.report.create({
      data: {
        reporterId: req.user.id,
        reportedId: reportedUserId,
        orderId: orderId || null,
        reasons: reasons || [],
        details: details || '',
        status: 'PENDING',
      }
    });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/admin
router.get('/admin', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { status } = req.query;
  const where = status ? { status } : {};
  try {
    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, name: true, phone: true } },
        reported: { select: { id: true, name: true, phone: true, role: true } },
      }
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/reports/admin/:id
router.patch('/admin/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { status, adminNote } = req.body;
  try {
    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: { status, adminNote, resolvedAt: new Date() }
    });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
