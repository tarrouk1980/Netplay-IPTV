'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const subscriptionsRoutes = require('./routes/subscriptions');
const notificationsRoutes = require('./routes/notifications');
const geoRoutes = require('./routes/geo');
const taxiRoutes = require('./routes/taxi');
const vehiclesRoutes = require('./routes/vehicles');
const adminRoutes = require('./routes/admin');
const sosRoutes = require('./routes/sos');
const insuranceRoutes = require('./routes/insurance');
const deliveryRoutes = require('./routes/delivery');
const merchantsRoutes = require('./routes/merchants');

const app = express();

// Security & middleware
app.use(helmet());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'easyway-backend' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/taxi', taxiRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/merchants', merchantsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found`, code: 'NOT_FOUND' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[App Error]', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'INTERNAL_ERROR';

  res.status(statusCode).json({ error: message, code });
});

module.exports = app;
