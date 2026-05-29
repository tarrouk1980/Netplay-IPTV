import { create } from 'zustand';
import api from '../services/api';

const usePassStore = create((set, get) => ({
  subscription: null,
  isLoading: false,
  error: null,

  fetchSubscription: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/subscriptions/my');
      set({ subscription: response.data.subscription, isLoading: false });
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch subscription';
      set({ error: message, isLoading: false });
    }
  },

  purchasePass: async (planType, paymentProvider = 'STRIPE') => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/api/subscriptions/purchase', {
        planType,
        paymentProvider,
      });
      set({ subscription: response.data.subscription, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Purchase failed';
      const code = error.response?.data?.code || 'PURCHASE_FAILED';
      set({ error: message, isLoading: false });
      return { success: false, error: message, code };
    }
  },

  clearError: () => set({ error: null }),
}));

export default usePassStore;
