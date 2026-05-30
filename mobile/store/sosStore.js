import { create } from 'zustand';
import api from '../services/api';

const useSosStore = create((set, get) => ({
  currentSOSOrder: null,
  nearbyRequests: [],
  quotes: [],
  isSearching: false,
  myContract: null,

  // ─────────────────────────────────────────────
  // CLIENT: submit SOS request
  // ─────────────────────────────────────────────
  requestSOS: async (data) => {
    set({ isSearching: true });
    try {
      const response = await api.post('/sos/request', data);
      const { order } = response.data;
      set({ currentSOSOrder: order, quotes: [] });
      return response.data;
    } finally {
      set({ isSearching: false });
    }
  },

  // ─────────────────────────────────────────────
  // DEPANNEUR: submit a quote
  // ─────────────────────────────────────────────
  submitQuote: async (orderId, price, eta) => {
    const response = await api.post(`/sos/${orderId}/quote`, {
      price,
      estimatedArrivalMin: eta,
    });
    return response.data;
  },

  // ─────────────────────────────────────────────
  // CLIENT: accept a quote
  // ─────────────────────────────────────────────
  acceptQuote: async (orderId, depanneurId) => {
    const response = await api.post(`/sos/${orderId}/accept-quote`, { depanneurId });
    const { order } = response.data;
    set({ currentSOSOrder: order });
    return order;
  },

  // ─────────────────────────────────────────────
  // DEPANNEUR: confirm arrival
  // ─────────────────────────────────────────────
  confirmArrival: async (orderId) => {
    const response = await api.post(`/sos/${orderId}/start`);
    const { order } = response.data;
    set({ currentSOSOrder: order });
    return order;
  },

  // ─────────────────────────────────────────────
  // CLIENT or DEPANNEUR: complete (double confirmation)
  // ─────────────────────────────────────────────
  completeRide: async (orderId) => {
    const response = await api.post(`/sos/${orderId}/complete`);
    const { order, bothConfirmed } = response.data;
    if (order) set({ currentSOSOrder: order });
    return { order, bothConfirmed };
  },

  // ─────────────────────────────────────────────
  // CLIENT or DEPANNEUR: cancel
  // ─────────────────────────────────────────────
  cancelSOS: async (orderId, reason) => {
    const response = await api.post(`/sos/${orderId}/cancel`, { reason });
    const { order } = response.data;
    set({ currentSOSOrder: order });
    return order;
  },

  // ─────────────────────────────────────────────
  // DEPANNEUR: fetch nearby pending SOS requests
  // ─────────────────────────────────────────────
  fetchNearbyRequests: async () => {
    const response = await api.get('/sos/depanneur/requests');
    const orders = response.data.orders || [];
    set({ nearbyRequests: orders });
    return orders;
  },

  // ─────────────────────────────────────────────
  // SHARED: fetch SOS order details
  // ─────────────────────────────────────────────
  fetchOrder: async (orderId) => {
    const response = await api.get(`/sos/${orderId}`);
    const { order } = response.data;
    set({ currentSOSOrder: order, quotes: order.metadata?.quotes || [] });
    return order;
  },

  // ─────────────────────────────────────────────
  // CLIENT: fetch insurance contract
  // ─────────────────────────────────────────────
  fetchMyContract: async () => {
    try {
      const response = await api.get('/insurance/contracts/me');
      set({ myContract: response.data.contract });
      return response.data.contract;
    } catch {
      set({ myContract: null });
      return null;
    }
  },

  // ─────────────────────────────────────────────
  // CLIENT: submit counter offer (±20%)
  // ─────────────────────────────────────────────
  submitCounterOffer: async (orderId, counterPrice) => {
    const response = await api.post(`/sos/${orderId}/counter-offer`, { counterPrice });
    const { order } = response.data;
    if (order) set({ currentSOSOrder: order });
    return response.data;
  },

  // ─────────────────────────────────────────────
  // DEPANNEUR: accept counter offer
  // ─────────────────────────────────────────────
  acceptCounterOffer: async (orderId) => {
    const response = await api.post(`/sos/${orderId}/accept-counter`);
    const { order } = response.data;
    if (order) set({ currentSOSOrder: order });
    return response.data;
  },

  // ─────────────────────────────────────────────
  // LOCAL: handle incoming quote from socket
  // ─────────────────────────────────────────────
  addQuote: (quote) => {
    set((state) => ({
      quotes: [...state.quotes.filter((q) => q.depanneurId !== quote.depanneurId), quote],
    }));
  },

  // ─────────────────────────────────────────────
  // LOCAL: update current order from socket events
  // ─────────────────────────────────────────────
  updateOrderStatus: (orderId, updates) => {
    const { currentSOSOrder } = get();
    if (currentSOSOrder?.id === orderId) {
      set({ currentSOSOrder: { ...currentSOSOrder, ...updates } });
    }
  },

  reset: () => set({ currentSOSOrder: null, nearbyRequests: [], quotes: [], isSearching: false }),
}));

export default useSosStore;
