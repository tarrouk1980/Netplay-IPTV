'use strict';

const express = require('express');
const router = express.Router();
const {
  MOCK_HOTELS, POPULAR_DESTINATIONS, MOCK_REVIEWS,
  generateMockPrices, searchHotels, getHotelById, getHotelRooms
} = require('../services/hotelService');

// GET /api/hotels/destinations
router.get('/destinations', (req, res) => {
  res.json({ success: true, data: POPULAR_DESTINATIONS });
});

// GET /api/hotels/featured
router.get('/featured', (req, res) => {
  const featured = MOCK_HOTELS.filter(h => h.isFeatured && h.isActive).slice(0, 6);
  const withPrices = featured.map(hotel => {
    const checkIn = new Date().toISOString().split('T')[0];
    const checkOut = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const prices = generateMockPrices(hotel, checkIn, checkOut, 2);
    return { ...hotel, bestOffer: prices[0] };
  });
  res.json({ success: true, data: withPrices });
});

// GET /api/hotels/search
router.get('/search', (req, res) => {
  try {
    const { destination, checkIn, checkOut, guests, minPrice, maxPrice, stars, category, amenities, sortBy, page = 1, limit = 10 } = req.query;
    const allResults = searchHotels({ destination, stars, category, minPrice, maxPrice, amenities, sortBy, guests: Number(guests) || 2, checkIn, checkOut });
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const start = (pageNum - 1) * limitNum;
    const paginated = allResults.slice(start, start + limitNum);
    res.json({
      success: true,
      data: paginated,
      meta: { total: allResults.length, page: pageNum, limit: limitNum, totalPages: Math.ceil(allResults.length / limitNum) }
    });
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
router.get('/:id', (req, res) => {
  const hotel = getHotelById(req.params.id);
  if (!hotel) return res.status(404).json({ success: false, message: 'Hôtel non trouvé' });
  const rooms = getHotelRooms(hotel.id);
  const checkIn = req.query.checkIn || new Date().toISOString().split('T')[0];
  const checkOut = req.query.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const guests = Number(req.query.guests) || 2;
  const prices = generateMockPrices(hotel, checkIn, checkOut, guests);
  const reviews = MOCK_REVIEWS.map((r, i) => ({ ...r, hotelId: hotel.id }));
  res.json({ success: true, data: { ...hotel, rooms, priceOffers: prices, reviews } });
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

module.exports = router;
