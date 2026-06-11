import axios from 'axios';
import Constants from 'expo-constants';
import {
  offlineFlightSearch, offlineAirports, offlineCalendar, offlineInspire,
  offlineTrend, offlineFerrySearch, offlinePorts, offlineFerryRoutes,
} from './offlineApi';

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
  timeout: 6000,
  headers: { 'Content-Type': 'application/json' },
});

// Tente l'API réseau ; si elle est injoignable, bascule sur les données
// locales embarquées. L'app fonctionne ainsi avec ou sans backend.
async function withFallback(networkCall, offlineFn) {
  try {
    return await networkCall();
  } catch (_) {
    return { data: offlineFn() };
  }
}

export const flightAPI = {
  search:   (params) => withFallback(
    () => api.get('/api/flights/search', { params }),
    () => offlineFlightSearch(params),
  ),
  airports: (q) => withFallback(
    () => api.get('/api/flights/airports', { params: { q } }),
    () => offlineAirports(q),
  ),
  calendar: (params) => withFallback(
    () => api.get('/api/flights/calendar', { params }),
    () => offlineCalendar(params),
  ),
  inspire:  (params) => withFallback(
    () => api.get('/api/flights/inspire', { params }),
    () => offlineInspire(params),
  ),
  trend:    (params) => withFallback(
    () => api.get('/api/flights/trend', { params }),
    () => offlineTrend(params),
  ),
};

export const ferryAPI = {
  search:  (params) => withFallback(
    () => api.get('/api/ferries/search', { params }),
    () => offlineFerrySearch(params),
  ),
  ports:   (q) => withFallback(
    () => api.get('/api/ferries/ports', { params: { q } }),
    () => offlinePorts(q),
  ),
  routes:  () => withFallback(
    () => api.get('/api/ferries/routes'),
    () => offlineFerryRoutes(),
  ),
};

export default api;
