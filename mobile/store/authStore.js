import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setTokens, clearTokens } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),

  setTokens: (accessToken, refreshToken) => {
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  login: async (phone, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/api/auth/login', { phone, password });
      const { user, accessToken, refreshToken } = response.data;

      await setTokens(accessToken, refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      const code = error.response?.data?.code || 'LOGIN_FAILED';
      set({ error: message, isLoading: false });
      return { success: false, error: message, code };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      await api.post('/api/auth/logout', { refreshToken }).catch(() => {});
    } finally {
      await clearTokens();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  loadFromStorage: async () => {
    set({ isLoading: true });
    try {
      const [accessToken, refreshToken, userStr] = await AsyncStorage.multiGet([
        'accessToken',
        'refreshToken',
        'user',
      ]);

      const token = accessToken[1];
      const refresh = refreshToken[1];
      const user = userStr[1] ? JSON.parse(userStr[1]) : null;

      if (token && user) {
        set({
          accessToken: token,
          refreshToken: refresh,
          user,
          isAuthenticated: true,
        });
      }
    } catch (err) {
      console.error('[AuthStore] Failed to load from storage:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
