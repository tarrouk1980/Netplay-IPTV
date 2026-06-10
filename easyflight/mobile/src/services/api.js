import axios from 'axios';

// Change to your server IP when testing on device
const BASE_URL = __DEV__
  ? 'http://localhost:4000'
  : 'https://api.easyflight.app';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const flightAPI = {
  search:   (params) => api.get('/api/flights/search', { params }),
  airports: (q)      => api.get('/api/flights/airports', { params: { q } }),
  calendar: (params) => api.get('/api/flights/calendar', { params }),
  inspire:  (params) => api.get('/api/flights/inspire', { params }),
  trend:    (params) => api.get('/api/flights/trend', { params }),
};

export const ferryAPI = {
  search:  (params) => api.get('/api/ferries/search', { params }),
  ports:   (q)      => api.get('/api/ferries/ports', { params: { q } }),
  routes:  ()       => api.get('/api/ferries/routes'),
};

export default api;
