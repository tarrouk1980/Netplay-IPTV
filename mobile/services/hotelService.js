import api from './api';

const hotelAPI = {
  search: (params) => api.get('/hotels/search', { params }),
  getFeatured: () => api.get('/hotels/featured'),
  getDestinations: () => api.get('/hotels/destinations'),
  autocomplete: (q) => api.get('/hotels/autocomplete', { params: { q } }),
  getById: (id, params) => api.get(`/hotels/${id}`, { params }),
  getPrices: (id, params) => api.get(`/hotels/${id}/prices`, { params }),
  getReviews: (id) => api.get(`/hotels/${id}/reviews`),
};

export default hotelAPI;
