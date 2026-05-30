import { create } from 'zustand';
import api from '../services/api';

const useReferralStore = create((set) => ({
  code: null,
  stats: null,
  isLoading: false,
  error: null,

  fetchMyCode: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/referral/my-code');
      set({ code: response.data.code, isLoading: false });
      return response.data.code;
    } catch (error) {
      const message = error.response?.data?.error || 'Impossible de récupérer le code';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  applyCode: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/api/referral/apply', { code });
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.error || 'Code invalide';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/referral/my-stats');
      set({ stats: response.data, code: response.data.code, isLoading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Impossible de récupérer les statistiques';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useReferralStore;
