'use strict';
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');

const flightsRouter = require('./src/routes/flights');
const ferriesRouter = require('./src/routes/ferries');

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Rate limit: 200 req/15min per IP
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.use('/api/flights', flightsRouter);
app.use('/api/ferries', ferriesRouter);

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'EasyTravel API', version: '1.0.0' }));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => console.log(`✈  EasyTravel API → http://localhost:${PORT}`));
