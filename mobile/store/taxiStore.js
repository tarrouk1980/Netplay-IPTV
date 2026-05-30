import { create } from 'zustand';
import api from '../services/api';

/**
 * taxiStore — Zustand store for Taxi EASYWAY
 *
 * State:
 *   currentOrder     – the active/latest order object
 *   nearbyDrivers    – array of nearby driver objects from Redis GEO
 *   isSearching      – true while a requestTaxi call is in flight
 *
 * Actions (CLIENT):
 *   requestTaxi(origin, dest, mode, taxiType) → order
 *   confirmArrival(orderId) → order
 *   cancelOrder(orderId) → order
 *   fetchOrder(orderId) → order
 *   fetchNearbyDrivers(lat, lng) → drivers[]
 *
 * Actions (CHAUFFEUR):
 *   acceptOrder(orderId) → order
 *   completeRide(orderId) → order
 */
const useTaxiStore = create((set, get) => ({
  currentOrder: null,
  nearbyDrivers: [],
  isSearching: false,

  // ─────────────────────────────────────────────
  // CLIENT: request a taxi
  // ─────────────────────────────────────────────
  requestTaxi: async (origin, dest, mode, taxiType) => {
    set({ isSearching: true });
    try {
      const body = {
        originLat: origin.lat,
        originLng: origin.lng,
        originAddress: origin.address || undefined,
        mode,
        taxiType,
      };

      if (dest?.lat != null && dest?.lng != null) {
        body.destLat = dest.lat;
        body.destLng = dest.lng;
      }
      if (dest?.address) {
        body.destinationAddress = dest.address;
      }

      const response = await api.post('/api/taxi/request', body);
      const { order } = response.data;
      set({ currentOrder: order });
      return order;
    } finally {
      set({ isSearching: false });
    }
  },

  // ─────────────────────────────────────────────
  // CLIENT: confirm arrival (triggers double-confirmation logic)
  // ─────────────────────────────────────────────
  confirmArrival: async (orderId) => {
    const response = await api.post(`/api/taxi/${orderId}/complete`);
    const { order } = response.data;
    set({ currentOrder: order });
    return order;
  },

  // ─────────────────────────────────────────────
  // CLIENT / CHAUFFEUR: cancel order
  // ─────────────────────────────────────────────
  cancelOrder: async (orderId, reason) => {
    const response = await api.post(`/api/taxi/${orderId}/cancel`, { reason });
    const { order } = response.data;
    set({ currentOrder: order });
    return order;
  },

  // ─────────────────────────────────────────────
  // SHARED: fetch order details
  // ─────────────────────────────────────────────
  fetchOrder: async (orderId) => {
    const response = await api.get(`/api/taxi/${orderId}`);
    const { order } = response.data;
    set({ currentOrder: order });
    return order;
  },

  // ─────────────────────────────────────────────
  // SHARED: fetch nearby drivers
  // ─────────────────────────────────────────────
  fetchNearbyDrivers: async (lat, lng, radius = 5) => {
    const response = await api.get('/api/taxi/nearby', { params: { lat, lng, radius } });
    const drivers = response.data.providers || [];
    set({ nearbyDrivers: drivers });
    return drivers;
  },

  // ─────────────────────────────────────────────
  // CHAUFFEUR: accept an order
  // ─────────────────────────────────────────────
  acceptOrder: async (orderId) => {
    const response = await api.post(`/api/taxi/${orderId}/accept`);
    const { order } = response.data;
    set({ currentOrder: order });
    return order;
  },

  // ─────────────────────────────────────────────
  // CHAUFFEUR: complete a ride (sends driver confirmation)
  // ─────────────────────────────────────────────
  completeRide: async (orderId) => {
    const response = await api.post(`/api/taxi/${orderId}/complete`);
    const { order } = response.data;
    set({ currentOrder: order });
    return order;
  },

  // ─────────────────────────────────────────────
  // LOCAL: update current order from socket events
  // ─────────────────────────────────────────────
  updateOrderStatus: (orderId, updates) => {
    const { currentOrder } = get();
    if (currentOrder?.id === orderId) {
      set({ currentOrder: { ...currentOrder, ...updates } });
    }
  },

  // ─────────────────────────────────────────────
  // LOCAL: reset store
  // ─────────────────────────────────────────────
  reset: () => set({ currentOrder: null, nearbyDrivers: [], isSearching: false }),
}));

export default useTaxiStore;
