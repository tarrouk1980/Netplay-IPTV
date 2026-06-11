import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'easyhotels_lang';

const LANGUAGES = [
  { code: 'auto', flag: '🌍', label: 'Auto' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
  { code: 'be', flag: '🇧🇪', label: 'BE' },
  { code: 'de', flag: '🇩🇪', label: 'DE' },
  { code: 'it', flag: '🇮🇹', label: 'IT' },
];

/**
 * LanguageSwitcherMobile
 *
 * Props:
 *   onLanguageChange(lang: string) — called with the new language code when the user taps a flag
 *   initialLang?: string — optional override (defaults to value stored in AsyncStorage or 'fr')
 */
export default function LanguageSwitcherMobile({ onLanguageChange, initialLang }) {
  const [activeLang, setActiveLang] = useState(initialLang || 'fr');

  // Hydrate from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(stored => {
        if (stored) {
          setActiveLang(stored);
          if (onLanguageChange) onLanguageChange(stored);
        }
      })
      .catch(() => {});
  }, []);

  async function handlePress(code) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, code);
    } catch {}
    setActiveLang(code);
    if (onLanguageChange) onLanguageChange(code);
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {LANGUAGES.map(lang => {
        const isActive = activeLang === lang.code;
        return (
          <TouchableOpacity
            key={lang.code}
            style={[styles.langBtn, isActive && styles.langBtnActive]}
            onPress={() => handlePress(lang.code)}
            activeOpacity={0.75}
          >
            <Text style={styles.flag}>{lang.flag}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{lang.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
  },
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  langBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#F7FAFC',
    minWidth: 52,
  },
  langBtnActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  flag: {
    fontSize: 22,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#718096',
    marginTop: 2,
  },
  labelActive: {
    color: '#FF6B35',
  },
});
