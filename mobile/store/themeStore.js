import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

// Light theme
export const LIGHT = {
  background: '#F5F5F7',
  surface: '#FFFFFF',
  surfaceAlt: '#EFEFEF',
  text: '#0A0A0F',
  textMuted: '#6E6E7A',
  border: '#DCDCE4',
  accent: '#F5A623',
  danger: '#E74C3C',
  success: '#27AE60',
};

// Dark theme (app default)
export const DARK = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  accent: '#F5A623',
  danger: '#E74C3C',
  success: '#27AE60',
};

function isNightHours() {
  const h = new Date().getHours();
  return h >= 20 || h < 7; // 20h → 7h = nuit
}

const useThemeStore = create((set, get) => ({
  mode: 'dark', // 'dark' | 'light' | 'auto'
  colors: DARK,

  init: async () => {
    try {
      const saved = await AsyncStorage.getItem('themeMode');
      const mode = saved || 'dark';
      get().applyMode(mode);
    } catch {}
  },

  applyMode: (mode) => {
    let colors = DARK;
    if (mode === 'light') {
      colors = LIGHT;
    } else if (mode === 'auto') {
      // Auto: nuit = dark, jour = light
      colors = isNightHours() ? DARK : LIGHT;
    }
    set({ mode, colors });
    AsyncStorage.setItem('themeMode', mode).catch(() => {});
  },

  setMode: (mode) => get().applyMode(mode),

  // Call this when time-based refresh needed (e.g. on app foreground)
  refreshAuto: () => {
    if (get().mode === 'auto') get().applyMode('auto');
  },
}));

export default useThemeStore;
