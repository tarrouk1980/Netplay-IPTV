'use strict';

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { searchFlights, getAirports } = require('../services/flightSearch');

const router = express.Router();

// GET /api/flights/airports?q=tunis
router.get('/airports', async (req, res) => {
  const { q = '' } = req.query;
  const results = getAirports(q);
  res.json({ airports: results });
});

// GET /api/flights/search
router.get(
  '/search',
  [
    query('origin').isLength({ min: 3, max: 3 }).withMessage('origin must be 3-letter IATA code'),
    query('dest').isLength({ min: 3, max: 3 }).withMessage('dest must be 3-letter IATA code'),
    query('date').isISO8601().withMessage('date must be YYYY-MM-DD'),
    query('returnDate').optional().isISO8601().withMessage('returnDate must be YYYY-MM-DD'),
    query('passengers').optional().isInt({ min: 1, max: 9 }).withMessage('passengers 1-9'),
    query('tripType').optional().isIn(['ONE_WAY', 'ROUND_TRIP']).withMessage('tripType: ONE_WAY or ROUND_TRIP'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', details: errors.array() });
    }

    const { origin, dest, date, returnDate, passengers = 1, tripType = 'ONE_WAY' } = req.query;

    if (origin.toUpperCase() === dest.toUpperCase()) {
      return res.status(422).json({ error: 'origin and dest must be different' });
    }

    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      return res.status(422).json({ error: 'date must be today or in the future' });
    }

    const result = searchFlights({
      origin: origin.toUpperCase(),
      dest: dest.toUpperCase(),
      date,
      returnDate,
      passengers: parseInt(passengers, 10),
      tripType,
    });

    res.json({
      search: { origin, dest, date, returnDate, passengers: parseInt(passengers, 10), tripType },
      ...result,
    });
  },
);

// POST /api/flights/bookings — create a booking (authenticated)
router.post(
  '/bookings',
  authenticate,
  [
    body('flightId').notEmpty().withMessage('flightId required'),
    body('flightNumber').notEmpty().withMessage('flightNumber required'),
    body('origin').isLength({ min: 3, max: 3 }),
    body('dest').isLength({ min: 3, max: 3 }),
    body('departureDate').isISO8601(),
    body('departureTime').notEmpty(),
    body('arrivalTime').notEmpty(),
    body('airline').notEmpty(),
    body('pricePerPax').isFloat({ min: 0 }),
    body('totalPrice').isFloat({ min: 0 }),
    body('passengers').isArray({ min: 1, max: 9 }),
    body('passengers.*.firstName').notEmpty().withMessage('passenger firstName required'),
    body('passengers.*.lastName').notEmpty().withMessage('passenger lastName required'),
    body('passengers.*.passport').optional().isString(),
    body('passengers.*.nationality').optional().isString(),
    body('passengers.*.birthDate').optional().isISO8601(),
    body('contactEmail').isEmail().withMessage('valid contactEmail required'),
    body('contactPhone').notEmpty().withMessage('contactPhone required'),
    body('tripType').isIn(['ONE_WAY', 'ROUND_TRIP']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', details: errors.array() });
    }

    const userId = req.user.id;
    const {
      flightId, flightNumber, origin, dest, departureDate, departureTime,
      arrivalTime, airline, pricePerPax, totalPrice, passengers,
      contactEmail, contactPhone, tripType,
    } = req.body;

    const bookingRef = `EF${Date.now().toString(36).toUpperCase()}`;

    const booking = await prisma.flightBooking.create({
      data: {
        userId,
        bookingRef,
        flightId,
        flightNumber,
        origin,
        dest,
        departureDate: new Date(departureDate),
        departureTime,
        arrivalTime,
        airline,
        pricePerPax,
        totalPrice,
        passengers: JSON.stringify(passengers),
        contactEmail,
        contactPhone,
        tripType,
        status: 'CONFIRMED',
      },
    });

    res.status(201).json({
      booking: {
        ...booking,
        passengers: JSON.parse(booking.passengers),
      },
    });
  },
);

// GET /api/flights/bookings — list user's bookings
router.get('/bookings', authenticate, async (req, res) => {
  const bookings = await prisma.flightBooking.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    bookings: bookings.map((b) => ({
      ...b,
      passengers: JSON.parse(b.passengers),
    })),
  });
});

// GET /api/flights/bookings/:ref — get one booking
router.get('/bookings/:ref', authenticate, async (req, res) => {
  const booking = await prisma.flightBooking.findFirst({
    where: { bookingRef: req.params.ref, userId: req.user.id },
  });

  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  res.json({ booking: { ...booking, passengers: JSON.parse(booking.passengers) } });
});

// DELETE /api/flights/bookings/:ref — cancel booking
router.delete('/bookings/:ref', authenticate, async (req, res) => {
  const booking = await prisma.flightBooking.findFirst({
    where: { bookingRef: req.params.ref, userId: req.user.id },
  });

  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.status === 'CANCELLED') {
    return res.status(400).json({ error: 'Already cancelled' });
  }

  const updated = await prisma.flightBooking.update({
    where: { id: booking.id },
    data: { status: 'CANCELLED' },
  });

  res.json({ booking: { ...updated, passengers: JSON.parse(updated.passengers) } });
});

module.exports = router;
