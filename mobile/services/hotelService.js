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
};

export default hotelAPI;
