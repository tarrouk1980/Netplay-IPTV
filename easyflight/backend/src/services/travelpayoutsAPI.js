'use strict';
const axios = require('axios');

const TP_TOKEN = process.env.TRAVELPAYOUTS_TOKEN || '';
const TP_MARKER = process.env.TRAVELPAYOUTS_MARKER || 'YOUR_MARKER_ID';
const BASE = 'https://api.travelpayouts.com';

// Build Travelpayouts affiliate booking URL (real one, not placeholder)
function buildTPAffiliateUrl(origin, dest, date, passengers = 1) {
  return `https://search.jetradar.com/flights/${origin}${dest}${date.replace(/-/g, '')}1?marker=${TP_MARKER}&utm_source=easyflight&utm_medium=cpc&utm_campaign=search`;
}

async function searchRealFlights(origin, dest, date, passengers = 1) {
  if (!TP_TOKEN) return null; // no API key → use mock
  try {
    const res = await axios.get(`${BASE}/v1/prices/latest`, {
      params: {
        origin,
        destination: dest,
        period_type: 'specific_date',
        depart_date: date,
        token: TP_TOKEN,
        currency: 'EUR',
        limit: 20,
        page: 1,
      },
      timeout: 5000,
    });
    const data = res.data?.data || [];
    if (!data.length) return null;

    // Map TP response to our flight format
    return data.map((t, i) => ({
      id: `TP-${t.flight_number || i}-${date}`,
      flightNumber: t.flight_number || `XX${100 + i}`,
      airline: { code: t.airline, name: t.airline, affiliate: 'travelpayouts' },
      origin: { code: origin, city: origin, country: '' },
      destination: { code: dest, city: dest, country: '' },
      departure: {
        date,
        time: t.departure_at ? t.departure_at.slice(11, 16) : '08:00',
        datetime: t.departure_at || date,
      },
      arrival: {
        date,
        time: t.return_at ? t.return_at.slice(11, 16) : '10:30',
        datetime: t.return_at || date,
      },
      duration: t.duration
        ? `${Math.floor(t.duration / 60)}h${String(t.duration % 60).padStart(2, '0')}`
        : '2h00',
      durationMins: t.duration || 120,
      stops: t.transfers || 0,
      stopAirports: [],
      price: {
        perPax: t.price,
        total: Math.round(t.price * passengers * 10) / 10,
        currency: 'EUR',
      },
      seats: { available: 9, total: 189 },
      baggage: { cabin: '10 kg', checked: '23 kg' },
      refundable: false,
      changeable: true,
      isLowCost: false,
      affiliateUrl: buildTPAffiliateUrl(origin, dest, date, passengers),
      source: 'travelpayouts',
    }));
  } catch (e) {
    console.warn('Travelpayouts API error:', e.message);
    return null; // fallback to mock
  }
}

async function getCalendarPrices(origin, dest, month) {
  if (!TP_TOKEN) return null;
  try {
    const res = await axios.get(`${BASE}/v2/prices/month-matrix`, {
      params: {
        origin,
        destination: dest,
        month: `${month}-01`,
        token: TP_TOKEN,
        currency: 'EUR',
        show_to_affiliates: true,
      },
      timeout: 5000,
    });
    return res.data?.data || null;
  } catch {
    return null;
  }
}

module.exports = { searchRealFlights, getCalendarPrices, buildTPAffiliateUrl };
