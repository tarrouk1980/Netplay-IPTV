import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { setLanguage, getCurrentLang } from '../../i18n/index';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  accent: '#D32F2F',
  accentLight: '#FF5252',
  white: '#FFFFFF',
  muted: '#8A8A9A',
  border: '#2A2A3A',
};

const LANGUAGES = [
  {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
    desc: 'Langue par défaut de l\'application',
  },
  {
    code: 'ar',
    name: 'Arabe',
    nativeName: 'العربية',
    flag: '🇹🇳',
    desc: 'اللغة العربية — دعم كامل',
  },
  {
    code: 'en',
    name: 'Anglais',
    nativeName: 'English',
    flag: '🇬🇧',
    desc: 'Full English support',
  },
];

export default function LanguageScreen({ navigation }) {
  const [selected, setSelected] = useState(getCurrentLang());
  const [saving, setSaving] = useState(false);

  const handleSelect = async (code) => {
    if (code === selected) return;
    setSaving(true);
    try {
      await setLanguage(code);
      setSelected(code);
      Alert.alert(
        '✅ Langue modifiée',
        code === 'fr'
          ? 'L\'application est maintenant en français. Redémarrez l\'app pour appliquer tous les changements.'
          : code === 'ar'
          ? 'تم تغيير اللغة إلى العربية. أعد تشغيل التطبيق لتطبيق جميع التغييرات.'
          : 'Language changed to English. Restart the app to apply all changes.',
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌐 Langue de l'application</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Choisissez la langue d'affichage de l'application EASYWAY
        </Text>

        {LANGUAGES.map((lang) => {
          const isSelected = selected === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[styles.langCard, isSelected && styles.langCardActive]}
              onPress={() => handleSelect(lang.code)}
              activeOpacity={0.8}
              disabled={saving}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <View style={styles.langInfo}>
                <Text style={[styles.langName, isSelected && styles.langNameActive]}>
                  {lang.nativeName}
                </Text>
                <Text style={styles.langNameSub}>{lang.name}</Text>
                <Text style={styles.langDesc}>{lang.desc}</Text>
              </View>
              <View style={[styles.radio, isSelected && styles.radioActive]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ Note</Text>
          <Text style={styles.infoText}>
            Certains contenus (noms de lieux, notifications) restent dans la langue d'origine. Un redémarrage de l'application est recommandé après le changement de langue.
          </Text>
        </View>

        <View style={styles.rtlNote}>
          <Text style={styles.rtlNoteText}>
            🔄 Le mode RTL (droite à gauche) pour l'arabe sera activé dans une prochaine version.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 30, color: COLORS.white, lineHeight: 30 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.white },
  content: { flex: 1, padding: 20 },
  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 24,
    lineHeight: 18,
    textAlign: 'center',
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 12,
    gap: 14,
  },
  langCardActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '11',
  },
  flag: { fontSize: 36 },
  langInfo: { flex: 1 },
  langName: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  langNameActive: { color: COLORS.accentLight },
  langNameSub: { color: COLORS.muted, fontSize: 12, marginTop: 1 },
  langDesc: { color: COLORS.muted, fontSize: 11, marginTop: 4, lineHeight: 15 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: COLORS.accent },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
  },
  infoBox: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  infoTitle: { color: COLORS.accentLight, fontSize: 13, fontWeight: '700', marginBottom: 6 },
  infoText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  rtlNote: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rtlNoteText: { color: COLORS.muted, fontSize: 11, lineHeight: 16, textAlign: 'center' },
});
