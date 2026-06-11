'use strict';

const express = require('express');
const router = express.Router();
const {
  MOCK_HOTELS, POPULAR_DESTINATIONS, MOCK_REVIEWS,
  generateMockPrices, searchHotels, getHotelById, getHotelRooms,
  getFeaturedHotels, getPopularDestinations, getHotelReviews,
  addReview, toggleFavorite, getUserFavorites,
  getFlashDeals, getPriceCalendar, getSimilarHotels, getTrendingHotels, getLastMinuteDeals,
  getHotelsByMarket,
} = require('../services/hotelService');
const cacheService = require('../services/cacheService');
const analyticsService = require('../services/analyticsService');
const rateLimiter = require('../middleware/rateLimiter');

// Soft auth middleware (doesn't block if no token)
function softAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const jwt = require('jsonwebtoken');
      const token = header.slice(7);
      req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    }
  } catch {}
  next();
}

// Auth required middleware
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentification requise' });
  next();
}

// GET /api/hotels/destinations
router.get('/destinations', (req, res) => {
  res.json({ success: true, data: POPULAR_DESTINATIONS });
});

// GET /api/hotels/featured
router.get('/featured', async (req, res) => {
  try {
    const cacheKey = 'featured:hotels';
    const cached = await cacheService.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, fromCache: true });

    const featured = MOCK_HOTELS.filter(h => h.isFeatured && h.isActive).slice(0, 6);
    const withPrices = featured.map(hotel => {
      const checkIn = new Date().toISOString().split('T')[0];
      const checkOut = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const prices = generateMockPrices(hotel, checkIn, checkOut, 2);
      return { ...hotel, bestOffer: prices[0] };
    });
    await cacheService.set(cacheKey, withPrices, 1800); // 30 min TTL
    res.json({ success: true, data: withPrices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hotels/search
router.get('/search', rateLimiter(60, 60000), async (req, res) => {
  try {
    const { destination, checkIn, checkOut, guests, minPrice, maxPrice, stars, category, amenities, sortBy, page = 1, limit = 10,
      isAlcoholFree, isBurkiniAccepted, isHalalCertified, hasRamadanServices, hasPrayerRoom,
      hasSeparatePool, isFamilyConservative, isMedicalTourism, isHoneymoonPackage, hasAirportShuttle, isBeachfront, country } = req.query;

    // Track search analytics
    analyticsService.trackSearch({ destination, checkIn, checkOut, guests, stars, category, country, userAgent: req.headers['user-agent'] });

    const searchParams = { destination, checkIn, checkOut, guests, minPrice, maxPrice, stars, category, amenities, sortBy, page, limit,
      isAlcoholFree, isBurkiniAccepted, isHalalCertified, hasRamadanServices, hasPrayerRoom,
      hasSeparatePool, isFamilyConservative, isMedicalTourism, isHoneymoonPackage, hasAirportShuttle, isBeachfront, country };
    const cacheKey = `search:${JSON.stringify(searchParams)}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return res.json({ ...cached, fromCache: true });

    const allResults = searchHotels({ destination, stars, category, minPrice, maxPrice, amenities, sortBy, guests: Number(guests) || 2, checkIn, checkOut,
      isAlcoholFree, isBurkiniAccepted, isHalalCertified, hasRamadanServices, hasPrayerRoom,
      hasSeparatePool, isFamilyConservative, isMedicalTourism, isHoneymoonPackage, hasAirportShuttle, isBeachfront, country });
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const start = (pageNum - 1) * limitNum;
    const paginated = allResults.slice(start, start + limitNum);
    const response = {
      success: true,
      data: paginated,
      meta: { total: allResults.length, page: pageNum, limit: limitNum, totalPages: Math.ceil(allResults.length / limitNum) },
    };
    await cacheService.set(cacheKey, response, 300); // 5 min TTL
    res.json(response);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hotels/autocomplete
router.get('/autocomplete', (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ success: true, data: [] });
  const query = q.toLowerCase();
  const cities = [...new Set(MOCK_HOTELS.map(h => ({ city: h.city, country: h.country })))];
  const suggestions = [];
  const seen = new Set();
  cities.forEach(({ city, country }) => {
    const key = `${city}-${country}`;
    if (!seen.has(key) && (city.toLowerCase().includes(query) || country.toLowerCase().includes(query))) {
      seen.add(key);
      suggestions.push({ type: 'city', label: city, sublabel: country, icon: 'location' });
    }
  });
  MOCK_HOTELS.forEach(h => {
    if (h.name.toLowerCase().includes(query)) {
      suggestions.push({ type: 'hotel', label: h.name, sublabel: `${h.city}, ${h.stars}★`, icon: 'hotel', hotelId: h.id });
    }
  });
  res.json({ success: true, data: suggestions.slice(0, 8) });
});

// GET /api/hotels/:id
router.get('/:id', async (req, res) => {
  const cacheKey = `hotel:${req.params.id}`;
  const cached = await cacheService.get(cacheKey);
  if (cached) return res.json({ success: true, data: cached, fromCache: true });

  const hotel = getHotelById(req.params.id);
  if (!hotel) return res.status(404).json({ success: false, message: 'Hôtel non trouvé' });
  const rooms = getHotelRooms(hotel.id);
  const checkIn = req.query.checkIn || new Date().toISOString().split('T')[0];
  const checkOut = req.query.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const guests = Number(req.query.guests) || 2;
  const prices = generateMockPrices(hotel, checkIn, checkOut, guests);
  const reviews = MOCK_REVIEWS.map((r, i) => ({ ...r, hotelId: hotel.id }));
  const data = { ...hotel, rooms, priceOffers: prices, reviews };
  await cacheService.set(cacheKey, data, 900); // 15 min TTL
  res.json({ success: true, data });
});

// GET /api/hotels/:id/prices
router.get('/:id/prices', (req, res) => {
  const hotel = getHotelById(req.params.id);
  if (!hotel) return res.status(404).json({ success: false, message: 'Hôtel non trouvé' });
  const { checkIn, checkOut, guests = 2 } = req.query;
  const prices = generateMockPrices(hotel, checkIn || new Date().toISOString().split('T')[0], checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0], Number(guests));
  res.json({ success: true, data: prices });
});

// GET /api/hotels/:id/reviews
router.get('/:id/reviews', (req, res) => {
  const hotel = getHotelById(req.params.id);
  if (!hotel) return res.status(404).json({ success: false, message: 'Hôtel non trouvé' });
  res.json({ success: true, data: MOCK_REVIEWS, meta: { total: MOCK_REVIEWS.length, avgRating: hotel.rating } });
});

// POST /api/hotels/:id/reviews
router.post('/:id/reviews', softAuth, async (req, res) => {
  const hotel = getHotelById(req.params.id);
  if (!hotel) return res.status(404).json({ success: false, message: 'Hôtel non trouvé' });
  try {
    const { authorName, rating, title, comment, travelType = 'COUPLE', pros = [], cons = [] } = req.body;
    if (!rating || !comment) return res.status(400).json({ success: false, message: 'rating et comment requis' });
    const review = await addReview(hotel.id, {
      userId: req.user?.id || null,
      authorName: authorName || req.user?.name || 'Anonyme',
      rating: parseFloat(rating),
      title, comment, travelType, pros, cons,
    });
    res.status(201).json({ success: true, data: review });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/hotels/favorites - Toggle favorite
router.post('/favorites', softAuth, requireAuth, async (req, res) => {
  const { hotelId } = req.body;
  if (!hotelId) return res.status(400).json({ success: false, message: 'hotelId requis' });
  try {
    const result = await toggleFavorite(req.user.id, hotelId);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/hotels/favorites
router.get('/favorites', softAuth, requireAuth, async (req, res) => {
  try {
    const favs = await getUserFavorites(req.user.id);
    res.json({ success: true, data: favs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/hotels/popular-destinations
router.get('/popular-destinations', async (req, res) => {
  const destinations = await getPopularDestinations();
  res.json({ success: true, data: destinations });
});

// GET /api/hotels/flash-deals
router.get('/flash-deals', (req, res) => {
  try {
    const deals = getFlashDeals();
    res.json({ success: true, data: deals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hotels/trending
router.get('/trending', (req, res) => {
  try {
    const hotels = getTrendingHotels();
    res.json({ success: true, data: hotels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hotels/last-minute
router.get('/last-minute', (req, res) => {
  try {
    const deals = getLastMinuteDeals();
    res.json({ success: true, data: deals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hotels/:id/calendar
router.get('/:id/calendar', (req, res) => {
  const hotel = getHotelById(req.params.id);
  if (!hotel) return res.status(404).json({ success: false, message: 'Hôtel non trouvé' });
  const { month, year, guests = 2 } = req.query;
  const m = parseInt(month) || (new Date().getMonth() + 1);
  const y = parseInt(year) || new Date().getFullYear();
  try {
    const cal = getPriceCalendar(hotel.id, m, y, Number(guests));
    res.json({ success: true, data: cal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hotels/:id/similar
router.get('/:id/similar', (req, res) => {
  const hotel = getHotelById(req.params.id);
  if (!hotel) return res.status(404).json({ success: false, message: 'Hôtel non trouvé' });
  const limit = parseInt(req.query.limit) || 4;
  try {
    const similar = getSimilarHotels(hotel.id, limit);
    res.json({ success: true, data: similar });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hotels/by-market/:market
// Returns hotels popular with a specific EU market (es/fr/be/it/de)
router.get('/by-market/:market', async (req, res) => {
  const { market } = req.params;
  const validMarkets = ['es', 'fr', 'be', 'it', 'de'];
  if (!validMarkets.includes(market)) {
    return res.status(400).json({ error: 'Invalid market' });
  }
  const hotels = getHotelsByMarket(market);
  res.json({ hotels, market, count: hotels.length });
});

module.exports = router;
