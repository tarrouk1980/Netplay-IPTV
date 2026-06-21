import { create } from 'zustand';
import { getCurrentLocationWithAddress } from '../utils/locationUtils';

const useLocationStore = create((set, get) => ({
  nearbyProviders: {}, // keyed by userId
  myLocation: null,
  myAddress: null,
  fetchingMyLocation: false,

  // Triggers the OS location permission prompt and a first GPS fix right
  // after login, like other apps do, instead of waiting until the client
  // opens a specific service screen.
  prefetchMyLocation: async () => {
    if (get().fetchingMyLocation) return;
    set({ fetchingMyLocation: true });
    const result = await getCurrentLocationWithAddress();
    if (result) {
      set({ myLocation: result.coords, myAddress: result.address, fetchingMyLocation: false });
    } else {
      set({ fetchingMyLocation: false });
    }
  },

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
