import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'hotel_language';

const LANGUAGES = [
  {
    key: 'fr',
    flag: '🇫🇷',
    label: 'Français',
    sublabel: 'Tunisie',
    currency: 'TND',
    rtl: false,
  },
  {
    key: 'ar_tn',
    flag: '🇹🇳',
    label: 'عربي تونس',
    sublabel: 'تونس',
    currency: 'TND',
    rtl: true,
  },
  {
    key: 'ar_ma',
    flag: '🇲🇦',
    label: 'عربي المغرب',
    sublabel: 'المغرب',
    currency: 'MAD',
    rtl: true,
  },
  {
    key: 'ar_dz',
    flag: '🇩🇿',
    label: 'عربي الجزائر',
    sublabel: 'الجزائر',
    currency: 'DZD',
    rtl: true,
  },
];

/**
 * LanguageSelector
 *
 * Displays a globe icon button. On press, opens a modal with 4 language/country options.
 * Persists selection to AsyncStorage under 'hotel_language'.
 *
 * Props:
 *   onSelect(lang) — called when the user picks a language. lang = one of LANGUAGES items.
 *   currentKey     — currently selected language key (optional, defaults to 'fr')
 */
export default function LanguageSelector({ onSelect, currentKey = 'fr' }) {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(currentKey);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val) setSelected(val);
    });
  }, []);

  async function handleSelect(lang) {
    setSelected(lang.key);
    await AsyncStorage.setItem(STORAGE_KEY, lang.key);
    setVisible(false);
    if (onSelect) onSelect(lang);
  }

  const current = LANGUAGES.find(l => l.key === selected) || LANGUAGES[0];

  return (
    <>
      {/* Globe trigger button */}
      <TouchableOpacity onPress={() => setVisible(true)} style={styles.trigger} accessibilityLabel="Sélectionner la langue">
        <Ionicons name="globe-outline" size={22} color="#fff" />
        <Text style={styles.triggerFlag}>{current.flag}</Text>
      </TouchableOpacity>

      {/* Language selection modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="globe-outline" size={22} color="#004E89" />
              <Text style={styles.headerTitle}>Langue / اللغة</Text>
              <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#718096" />
              </TouchableOpacity>
            </View>

            {/* Options */}
            {LANGUAGES.map(lang => {
              const isActive = lang.key === selected;
              return (
                <TouchableOpacity
                  key={lang.key}
                  style={[styles.option, isActive && styles.optionActive]}
                  onPress={() => handleSelect(lang)}
                  activeOpacity={0.75}
                >
                  <View style={styles.optionLeft}>
                    <Text style={styles.optionFlag}>{lang.flag}</Text>
                    <View style={styles.optionTexts}>
                      <Text style={[styles.optionLabel, isActive && styles.optionLabelActive, lang.rtl && styles.rtlText]}>
                        {lang.label}
                      </Text>
                      <Text style={[styles.optionSub, lang.rtl && styles.rtlText]}>
                        {lang.sublabel} · {lang.currency}
                      </Text>
                    </View>
                  </View>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={20} color="#FF6B35" />
                  )}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

/**
 * Helper hook: load the persisted language on mount.
 * Returns { lang, setLang }
 */
export function useHotelLanguage() {
  const [lang, setLangState] = useState(LANGUAGES[0]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val) {
        const found = LANGUAGES.find(l => l.key === val);
        if (found) setLangState(found);
      }
    });
  }, []);

  async function setLang(langObj) {
    await AsyncStorage.setItem(STORAGE_KEY, langObj.key);
    setLangState(langObj);
  }

  return { lang, setLang };
}

export { LANGUAGES, STORAGE_KEY };

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  triggerFlag: {
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#1A202C',
  },
  closeBtn: {
    padding: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F7F7',
  },
  optionActive: {
    backgroundColor: '#FFF5F0',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  optionFlag: {
    fontSize: 28,
  },
  optionTexts: {
    gap: 2,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
  },
  optionLabelActive: {
    color: '#FF6B35',
  },
  optionSub: {
    fontSize: 12,
    color: '#718096',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
