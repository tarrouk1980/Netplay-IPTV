import { create } from 'zustand';
import api from '../services/api';

const useDeliveryStore = create((set, get) => ({
  merchants: [],
  currentMerchant: null,
  cart: {},
  currentOrder: null,
  livreurAssignments: [],
  isLoading: false,

  fetchMerchants: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const response = await api.get('/merchants', { params: filters });
      const merchants = response.data.merchants || [];
      set({ merchants });
      return merchants;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMerchant: async (id) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/merchants/${id}`);
      const { merchant } = response.data;
      set({ currentMerchant: merchant });
      return merchant;
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: (merchantId, product, quantity) => {
    const { cart } = get();
    const key = `${merchantId}:${product.id}`;
    const existing = cart[key];
    if (quantity <= 0) {
      const next = { ...cart };
      delete next[key];
      set({ cart: next });
    } else {
      set({
        cart: {
          ...cart,
          [key]: { merchantId, productId: product.id, product, quantity },
        },
      });
    }
  },

  clearCart: () => set({ cart: {} }),

  getCartItems: (merchantId) => {
    const { cart } = get();
    return Object.values(cart).filter((item) => item.merchantId === merchantId);
  },

  getCartTotal: (merchantId) => {
    const { cart } = get();
    return Object.values(cart)
      .filter((item) => item.merchantId === merchantId)
      .reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);
  },

  requestDelivery: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/api/delivery/request', data);
      const { order, priceBreakdown } = response.data;
      set({ currentOrder: order, cart: {} });
      return { order, priceBreakdown };
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOrder: async (orderId) => {
    const response = await api.get(`/api/delivery/${orderId}`);
    const { order } = response.data;
    set({ currentOrder: order });
    return order;
  },

  confirmReceipt: async (orderId) => {
    const response = await api.post(`/api/delivery/${orderId}/confirm-receipt`);
    const { order } = response.data;
    set({ currentOrder: order });
    return order;
  },

  cancelDelivery: async (orderId) => {
    const response = await api.post(`/api/delivery/${orderId}/cancel`);
    const { order } = response.data;
    set({ currentOrder: order });
    return order;
  },

  fetchHistory: async () => {
    const response = await api.get('/api/delivery/history');
    return response.data.orders || [];
  },

  // MARCHAND actions
  fetchMerchantOrders: async () => {
    const response = await api.get('/api/delivery/merchant/orders');
    return response.data.orders || [];
  },

  acceptOrder: async (orderId) => {
    const response = await api.post(`/api/delivery/${orderId}/accept`);
    return response.data;
  },

  markReady: async (orderId) => {
    const response = await api.post(`/api/delivery/${orderId}/ready`);
    return response.data;
  },

  // LIVREUR actions
  fetchAssignments: async () => {
    const response = await api.get('/api/delivery/livreur/assignments');
    const orders = response.data.orders || [];
    set({ livreurAssignments: orders });
    return orders;
  },

  pickupOrder: async (orderId) => {
    const response = await api.post(`/api/delivery/${orderId}/pickup`);
    const { order } = response.data;
    set({ currentOrder: order });
    return order;
  },

  completeDelivery: async (orderId) => {
    const response = await api.post(`/api/delivery/${orderId}/complete`);
    const { order } = response.data;
    set({ currentOrder: order });
    return order;
  },

  updateOrderFromSocket: (orderId, updates) => {
    const { currentOrder } = get();
    if (currentOrder?.id === orderId) {
      set({ currentOrder: { ...currentOrder, ...updates } });
    }
  },

  reset: () => set({ currentOrder: null, cart: {}, livreurAssignments: [], currentMerchant: null }),
}));

export default useDeliveryStore;
