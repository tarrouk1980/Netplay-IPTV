import { create } from 'zustand';

const useLocationStore = create((set, get) => ({
  nearbyProviders: {}, // keyed by userId
  myLocation: null,

  updateFromSocket: (data) => {
    // data: { userId, lat, lng, serviceType }
    set((state) => ({
      nearbyProviders: {
        ...state.nearbyProviders,
        [data.userId]: {
          userId: data.userId,
          lat: data.lat,
          lng: data.lng,
          serviceType: data.serviceType,
          lastUpdated: Date.now(),
        },
      },
    }));
  },

  setMyLocation: (coords) => {
    // coords: { latitude, longitude, accuracy?, heading?, speed? }
    set({ myLocation: coords });
  },

  clearProviders: () => set({ nearbyProviders: {} }),

  // Remove stale providers (not updated in last N seconds)
  pruneStaleProviders: (maxAgeMs = 30000) => {
    const now = Date.now();
    set((state) => {
      const fresh = {};
      Object.entries(state.nearbyProviders).forEach(([userId, provider]) => {
        if (now - provider.lastUpdated < maxAgeMs) {
          fresh[userId] = provider;
        }
      });
      return { nearbyProviders: fresh };
    });
  },
}));

export default useLocationStore;
