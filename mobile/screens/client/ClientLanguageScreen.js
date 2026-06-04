import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60',
};

const LANGUAGES = [
  { key: 'fr', label: 'Français', native: 'Français', flag: '🇫🇷', region: 'Langue principale' },
  { key: 'ar', label: 'Arabe', native: 'العربية', flag: '🇹🇳', region: 'اللغة العربية', rtl: true },
  { key: 'en', label: 'Anglais', native: 'English', flag: '🇬🇧', region: 'English language' },
  { key: 'de', label: 'Allemand', native: 'Deutsch', flag: '🇩🇪', region: 'Deutsche Sprache' },
  { key: 'it', label: 'Italien', native: 'Italiano', flag: '🇮🇹', region: 'Lingua italiana' },
];

const REGIONS = [
  { key: 'TN', label: 'Tunisie', flag: '🇹🇳', currency: 'TND', timezone: 'UTC+1' },
  { key: 'FR', label: 'France', flag: '🇫🇷', currency: 'EUR', timezone: 'UTC+1' },
  { key: 'DZ', label: 'Algérie', flag: '🇩🇿', currency: 'DZD', timezone: 'UTC+1' },
  { key: 'MA', label: 'Maroc', flag: '🇲🇦', currency: 'MAD', timezone: 'UTC' },
];

export default function ClientLanguageScreen({ navigation }) {
  const [lang, setLang] = useState('fr');
  const [region, setRegion] = useState('TN');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet(['userLang', 'userRegion'])
      .then(([[, l], [, r]]) => {
        if (l) setLang(l);
        if (r) setRegion(r);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await AsyncStorage.multiSet([['userLang', lang], ['userRegion', region]]);
      Alert.alert('✅ Préférences enregistrées', 'La langue sera appliquée au prochain démarrage.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Erreur', 'Impossible d\'enregistrer les préférences.');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={COLORS.accent} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌐 Langue & Région</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        <Text style={styles.sectionTitle}>LANGUE DE L'APPLICATION</Text>

        {LANGUAGES.map(l => {
          const isSelected = lang === l.key;
          return (
            <TouchableOpacity
              key={l.key}
              style={[styles.optionCard, isSelected && styles.optionCardActive]}
              onPress={() => setLang(l.key)}
              activeOpacity={0.85}
            >
              <Text style={styles.optionFlag}>{l.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>{l.label}</Text>
                <Text style={[styles.optionNative, l.rtl && { textAlign: 'right' }]}>{l.native}</Text>
                <Text style={styles.optionRegion}>{l.region}</Text>
              </View>
              <View style={[styles.radio, isSelected && { borderColor: COLORS.accent }]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>RÉGION</Text>

        {REGIONS.map(r => {
          const isSelected = region === r.key;
          return (
            <TouchableOpacity
              key={r.key}
              style={[styles.optionCard, isSelected && styles.optionCardActive]}
              onPress={() => setRegion(r.key)}
              activeOpacity={0.85}
            >
              <Text style={styles.optionFlag}>{r.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>{r.label}</Text>
                <Text style={styles.optionRegion}>{r.currency} · {r.timezone}</Text>
              </View>
              <View style={[styles.radio, isSelected && { borderColor: COLORS.accent }]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Le changement de langue sera effectif après redémarrage de l'application.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.saveBtnText}>💾 Enregistrer les préférences</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  optionCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  optionCardActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '08' },
  optionFlag: { fontSize: 32 },
  optionLabel: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  optionNative: { color: COLORS.accent, fontSize: 13, fontWeight: '600', marginTop: 2 },
  optionRegion: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent },
  infoBox: { backgroundColor: COLORS.accent + '10', borderRadius: 12, padding: 14, marginTop: 8, borderWidth: 1, borderColor: COLORS.accent + '30' },
  infoText: { color: COLORS.accent, fontSize: 13, lineHeight: 18 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border },
  saveBtn: { backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: '900' },
});
