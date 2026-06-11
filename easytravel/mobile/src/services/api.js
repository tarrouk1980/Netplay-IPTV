import axios from 'axios';
import Constants from 'expo-constants';

// In dev, reuse the Metro host (the PC's LAN IP) so a physical phone
// can reach the backend running on the same machine.
function getDevBaseUrl() {
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return host ? `http://${host}:4000` : 'http://localhost:4000';
}

const BASE_URL = __DEV__
  ? getDevBaseUrl()
  : 'https://api.easytravel.app';

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
