'use strict';

const { v4: uuidv4 } = require('uuid');
const AFFILIATE_CONFIG = require('../config/affiliates');

// ─── Mock Advertisers ────────────────────────────────────────────────────────
const ADVERTISERS = [
  {
    id: 'adv-001',
    name: 'Booking.com',
    type: 'OTA',
    logoUrl: null,
    cpcBid: 1.20,
    color: '#003580',
    affiliateBase: 'https://www.booking.com/hotel/',
    totalClicks: 15420,
    totalSpent: 18504,
    dailyBudget: 500,
    status: 'ACTIVE',
  },
  {
    id: 'adv-002',
    name: 'Expedia',
    type: 'OTA',
    logoUrl: null,
    cpcBid: 0.95,
    color: '#FFC72C',
    affiliateBase: 'https://www.expedia.com/hotels/',
    totalClicks: 8930,
    totalSpent: 8483.5,
    dailyBudget: 300,
    status: 'ACTIVE',
  },
  {
    id: 'adv-003',
    name: 'Hotels.com',
    type: 'OTA',
    logoUrl: null,
    cpcBid: 0.85,
    color: '#CC0000',
    affiliateBase: 'https://fr.hotels.com/',
    totalClicks: 6210,
    totalSpent: 5278.5,
    dailyBudget: 250,
    status: 'ACTIVE',
  },
  {
    id: 'adv-004',
    name: 'Airbnb',
    type: 'OTA',
    logoUrl: null,
    cpcBid: 0.75,
    color: '#FF5A5F',
    affiliateBase: 'https://www.airbnb.fr/rooms/',
    totalClicks: 4105,
    totalSpent: 3078.75,
    dailyBudget: 200,
    status: 'ACTIVE',
  },
  {
    id: 'adv-005',
    name: 'Réservation Directe',
    type: 'HOTEL_DIRECT',
    logoUrl: null,
    cpcBid: 0.50,
    color: '#28A745',
    affiliateBase: null,
    totalClicks: 2890,
    totalSpent: 1445,
    dailyBudget: 150,
    status: 'ACTIVE',
  },
];

// In-memory click log
const clickLog = [];
let totalRevenue = ADVERTISERS.reduce((sum, a) => sum + a.totalSpent, 0);

// ─── Provider → Advertiser mapping ──────────────────────────────────────────
const PROVIDER_MAP = {
  BOOKING: 'adv-001',
  EXPEDIA: 'adv-002',
  HOTELS_COM: 'adv-003',
  AIRBNB: 'adv-004',
  DIRECT: 'adv-005',
};

/**
 * Track a click and return the redirect URL + click ID.
 */
function trackClick({ hotelId, provider, sessionId, deviceType = 'mobile', hotelSlug = '', checkIn = '', checkOut = '', guests = 2 }) {
  const advertiserId = PROVIDER_MAP[provider] || null;
  const advertiser = ADVERTISERS.find(a => a.id === advertiserId);
  const cpcAmount = advertiser ? advertiser.cpcBid : 0;
  const clickId = uuidv4();

  const destinationUrl = buildAffiliateUrl(provider, hotelSlug, checkIn, checkOut, guests);

  const record = {
    id: clickId,
    hotelId,
    advertiserId,
    provider,
    sessionId,
    deviceType,
    cpcAmount,
    destinationUrl,
    converted: false,
    createdAt: new Date().toISOString(),
  };

  clickLog.push(record);
  totalRevenue += cpcAmount;

  if (advertiser) {
    advertiser.totalClicks += 1;
    advertiser.totalSpent += cpcAmount;
  }

  return { clickId, redirectUrl: destinationUrl, cpcAmount };
}

/**
 * Build an affiliate/tracking URL for a given provider.
 * Uses AFFILIATE_CONFIG for proper affiliate URL formats when available.
 */
function buildAffiliateUrl(provider, hotelSlug, checkIn, checkOut, guests, affiliateId) {
  const slug = hotelSlug || 'hotel';
  const ci = checkIn || new Date().toISOString().split('T')[0];
  const co = checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const g = guests || 2;

  // Use affiliate config urlBuilder when available
  const config = AFFILIATE_CONFIG[provider];
  if (config && config.urlBuilder) {
    return config.urlBuilder(slug, ci, co, g, affiliateId || null);
  }

  // Fallback for DIRECT and unknown providers
  switch (provider) {
    case 'DIRECT':
      return `https://easyhotels.tn/book/${encodeURIComponent(slug)}?checkin=${ci}&checkout=${co}&guests=${g}`;
    default:
      return `https://easyhotels.tn/search?provider=${provider}&hotel=${encodeURIComponent(slug)}`;
  }
}

/**
 * Get overall revenue stats.
 */
function getRevenueStats() {
  const byProvider = {};
  for (const click of clickLog) {
    if (!byProvider[click.provider]) byProvider[click.provider] = { clicks: 0, revenue: 0 };
    byProvider[click.provider].clicks += 1;
    byProvider[click.provider].revenue += click.cpcAmount;
  }

  // Merge with mock totals from ADVERTISERS
  const providerKeys = Object.keys(PROVIDER_MAP);
  for (const key of providerKeys) {
    const adv = ADVERTISERS.find(a => a.id === PROVIDER_MAP[key]);
    if (!byProvider[key]) byProvider[key] = { clicks: 0, revenue: 0 };
    byProvider[key].clicks += adv ? adv.totalClicks : 0;
    byProvider[key].revenue += adv ? adv.totalSpent : 0;
  }

  const totalClicks = ADVERTISERS.reduce((s, a) => s + a.totalClicks, 0) + clickLog.length;
  const avgCpc = totalClicks > 0 ? parseFloat((totalRevenue / totalClicks).toFixed(2)) : 0;
  const ctr = 4.7; // mock CTR %

  return {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalClicks,
    avgCpc,
    ctr,
    byProvider,
    trend: getDailyRevenueTrend(),
  };
}

/**
 * Get per-advertiser breakdown.
 */
function getAdvertiserStats() {
  return ADVERTISERS.map(a => ({
    id: a.id,
    name: a.name,
    type: a.type,
    color: a.color,
    cpcBid: a.cpcBid,
    totalClicks: a.totalClicks,
    totalSpent: parseFloat(a.totalSpent.toFixed(2)),
    dailyBudget: a.dailyBudget,
    status: a.status,
    avgCpc: a.totalClicks > 0 ? parseFloat((a.totalSpent / a.totalClicks).toFixed(3)) : a.cpcBid,
  }));
}

/**
 * Top earning hotels (mock data).
 */
function getTopEarningHotels(limit = 10) {
  const mockHotels = [
    { hotelId: 'h-001', name: 'El Mouradi Palace Hammamet', city: 'Hammamet', clicks: 3240, revenue: 3888 },
    { hotelId: 'h-002', name: 'Diar Lemdina', city: 'Hammamet', clicks: 2810, revenue: 3372 },
    { hotelId: 'h-003', name: 'Four Seasons Tunis', city: 'Tunis', clicks: 2560, revenue: 3072 },
    { hotelId: 'h-004', name: 'Radisson Blu Djerba', city: 'Djerba', clicks: 2120, revenue: 2544 },
    { hotelId: 'h-005', name: 'Mövenpick Sousse', city: 'Sousse', clicks: 1980, revenue: 2376 },
    { hotelId: 'h-006', name: 'Magic Life Skanes', city: 'Monastir', clicks: 1740, revenue: 2088 },
    { hotelId: 'h-007', name: 'Vincci Nozha Beach', city: 'Hammamet', clicks: 1560, revenue: 1872 },
    { hotelId: 'h-008', name: 'Hasdrubal Prestige Djerba', city: 'Djerba', clicks: 1390, revenue: 1668 },
    { hotelId: 'h-009', name: 'Iberostar Selection Diar El Andalous', city: 'Port El Kantaoui', clicks: 1200, revenue: 1440 },
    { hotelId: 'h-010', name: 'Club Med Djerba la Douce', city: 'Djerba', clicks: 1050, revenue: 1260 },
  ];
  return mockHotels.slice(0, limit);
}

/**
 * Generate 30-day daily revenue trend.
 */
function getDailyRevenueTrend() {
  const trend = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Simulate realistic hotel booking pattern (higher on weekends, gradual growth)
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const base = 280 + (29 - i) * 4; // slight upward trend
    const variance = (Math.sin(i * 0.7) * 50) + (isWeekend ? 80 : 0);
    const revenue = Math.max(150, Math.round(base + variance));
    const clicks = Math.round(revenue / 1.15);

    trend.push({ date: dateStr, revenue, clicks });
  }

  return trend;
}

module.exports = {
  trackClick,
  getRevenueStats,
  getAdvertiserStats,
  getTopEarningHotels,
  getDailyRevenueTrend,
  buildAffiliateUrl,
  ADVERTISERS,
};
