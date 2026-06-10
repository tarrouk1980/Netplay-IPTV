import api from './api';

const hotelAPI = {
  search: (params) => api.get('/api/hotels/search', { params }),
  getFeatured: () => api.get('/api/hotels/featured'),
  getDestinations: () => api.get('/api/hotels/destinations'),
  autocomplete: (q) => api.get('/api/hotels/autocomplete', { params: { q } }),
  getById: (id, params) => api.get(`/api/hotels/${id}`, { params }),
  getPrices: (id, params) => api.get(`/api/hotels/${id}/prices`, { params }),
  getReviews: (id) => api.get(`/api/hotels/${id}/reviews`),
  addReview: (id, data) => api.post(`/api/hotels/${id}/reviews`, data),
  toggleFavorite: (hotelId) => api.post('/api/hotels/favorites', { hotelId }),
  getFavorites: () => api.get('/api/hotels/favorites'),
  // New endpoints
  getFlashDeals: () => api.get('/api/hotels/flash-deals'),
  getTrending: () => api.get('/api/hotels/trending'),
  getLastMinute: () => api.get('/api/hotels/last-minute'),
  getPriceCalendar: (id, month, year, guests) => api.get(`/api/hotels/${id}/calendar`, { params: { month, year, guests } }),
  getSimilar: (id, limit = 4) => api.get(`/api/hotels/${id}/similar`, { params: { limit } }),
  // Maghreb & devises
  getCurrencyRates: () => api.get('/api/currency/rates'),
  convert: (from, to, amount) => api.get('/api/currency/convert', { params: { from, to, amount } }),
  getMaghrebHotels: () => api.get('/api/hotels/search?limit=50'),
  getPriceAlerts: () => api.get('/api/price-alerts'),
  addPriceAlert: (data) => api.post('/api/price-alerts', data),
  removePriceAlert: (id) => api.delete(`/api/price-alerts/${id}`),
};

export default hotelAPI;
