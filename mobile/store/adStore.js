import { create } from 'zustand';
import { api } from '../services/api';

export const useAdStore = create((set, get) => ({
  adsByPlacement: {
    HOME: [],
    DELIVERY: [],
    GROCERY: [],
    TAXI: [],
    ALL: [],
  },

  fetchAds: async (placement) => {
    try {
      const res = await api.get('/ads', { params: { placement, limit: 5 } });
      set((state) => ({
        adsByPlacement: {
          ...state.adsByPlacement,
          [placement]: res.data.ads,
        },
      }));
      return res.data.ads;
    } catch {
      return [];
    }
  },

  trackImpression: async (adId) => {
    try {
      await api.post(`/ads/${adId}/impression`);
    } catch {
      // non-blocking
    }
  },

  trackClick: async (adId) => {
    try {
      await api.post(`/ads/${adId}/click`);
    } catch {
      // non-blocking
    }
  },
}));
