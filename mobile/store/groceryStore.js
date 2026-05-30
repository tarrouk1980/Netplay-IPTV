import { create } from 'zustand';
import { api } from '../services/api';

export const useGroceryStore = create((set, get) => ({
  currentOrder: null,
  assignments: [],
  cart: {
    items: [],
    merchantId: null,
    mode: 'CUSTOM',
  },

  setMode: (mode) => set((state) => ({ cart: { ...state.cart, mode } })),

  addItem: (item) =>
    set((state) => ({
      cart: { ...state.cart, items: [...state.cart.items, item] },
    })),

  removeItem: (index) =>
    set((state) => ({
      cart: { ...state.cart, items: state.cart.items.filter((_, i) => i !== index) },
    })),

  updateItem: (index, updates) =>
    set((state) => ({
      cart: {
        ...state.cart,
        items: state.cart.items.map((item, i) => (i === index ? { ...item, ...updates } : item)),
      },
    })),

  clearCart: () =>
    set({ cart: { items: [], merchantId: null, mode: 'CUSTOM' } }),

  requestGrocery: async (data) => {
    const res = await api.post('/api/grocery/request', data);
    set({ currentOrder: res.data.order });
    return res.data.order;
  },

  fetchOrder: async (orderId) => {
    const res = await api.get(`/api/grocery/${orderId}`);
    set({ currentOrder: res.data.order });
    return res.data.order;
  },

  confirmReceipt: async (orderId) => {
    const res = await api.post(`/api/grocery/${orderId}/confirm-receipt`);
    set({ currentOrder: res.data.order });
    return res.data.order;
  },

  cancelGrocery: async (orderId) => {
    const res = await api.post(`/api/grocery/${orderId}/cancel`);
    set({ currentOrder: res.data.order });
    return res.data.order;
  },

  fetchHistory: async () => {
    const res = await api.get('/api/grocery/history');
    return res.data.orders;
  },

  // LIVREUR actions
  fetchAssignments: async () => {
    const res = await api.get('/api/grocery/livreur/assignments');
    set({ assignments: res.data.orders });
    return res.data.orders;
  },

  acceptGrocery: async (orderId) => {
    const res = await api.post(`/api/grocery/${orderId}/accept`);
    set((state) => ({
      assignments: state.assignments.map((o) => (o.id === orderId ? res.data.order : o)),
    }));
    return res.data.order;
  },

  pickupGrocery: async (orderId) => {
    const res = await api.post(`/api/grocery/${orderId}/pickup`);
    set((state) => ({
      assignments: state.assignments.map((o) => (o.id === orderId ? res.data.order : o)),
    }));
    return res.data.order;
  },

  completeGrocery: async (orderId) => {
    const res = await api.post(`/api/grocery/${orderId}/complete`);
    set((state) => ({
      assignments: state.assignments.filter((o) => o.id !== orderId),
    }));
    return res.data.order;
  },
}));
