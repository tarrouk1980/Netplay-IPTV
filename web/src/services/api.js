import axios from 'axios'
const BASE = import.meta.env.VITE_API_URL || 'https://easyway-api.onrender.com'
const api = axios.create({ baseURL: BASE })
export const hotelAPI = {
  search: (p) => api.get('/api/hotels/search', { params: p }),
  getFeatured: () => api.get('/api/hotels/featured'),
  getDestinations: () => api.get('/api/hotels/destinations'),
  autocomplete: (q) => api.get('/api/hotels/autocomplete', { params: { q } }),
  getById: (id, p) => api.get(`/api/hotels/${id}`, { params: p }),
  getPrices: (id, p) => api.get(`/api/hotels/${id}/prices`, { params: p }),
  getFlashDeals: () => api.get('/api/hotels/flash-deals'),
  getTrending: () => api.get('/api/hotels/trending'),
}
export default api
