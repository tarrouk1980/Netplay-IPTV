import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { getCurrentLocationWithAddress } from '../../utils/locationUtils';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60',
};

const FALLBACK_CATEGORIES = [
  { key: 'PLOMBIER', label: 'Plombier', icon: '🔧', remote: false },
  { key: 'ELECTRICIEN', label: 'Électricien', icon: '💡', remote: false },
  { key: 'MEDECIN', label: 'Médecin', icon: '🩺', remote: true },
  { key: 'AVOCAT', label: 'Avocat', icon: '⚖️', remote: true },
  { key: 'PEDAGOGUE', label: 'Pédagogue / Soutien scolaire', icon: '📚', remote: true },
  { key: 'COACH_SPORTIF', label: 'Coach sportif', icon: '🏋️', remote: true },
  { key: 'AUTRE', label: 'Autre service', icon: '🧰', remote: false },
];

export default function EasyServicesScreen({ navigation }) {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [selected, setSelected] = useState(null);
  const [description, setDescription] = useState('');
  const [videoMode, setVideoMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/api/homeservices/categories')
      .then((res) => { if (res.data?.categories?.length) setCategories(res.data.categories); })
      .catch(() => {});
  }, []);

  const selectedCategory = categories.find((c) => c.key === selected);
  const canGoRemote = !!selectedCategory?.remote;

  const handleSelect = (key) => {
    setSelected(key);
    const cat = categories.find((c) => c.key === key);
    if (!cat?.remote) setVideoMode(false);
  };

  const handleRequest = useCallback(async () => {
    if (!selected) {
      Alert.alert('Choisissez un service', 'Sélectionnez une catégorie de service.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Description requise', 'Décrivez votre besoin en quelques mots.');
      return;
    }
    setSubmitting(true);
    try {
      const loc = await getCurrentLocationWithAddress();
      if (!loc) {
        Alert.alert('Localisation requise', 'Activez la localisation pour envoyer la demande.');
        setSubmitting(false);
        return;
      }
      const res = await api.post('/api/homeservices/request', {
        category: selected,
        description: description.trim(),
        lat: loc.coords.lat,
        lng: loc.coords.lng,
        address: loc.address,
        consultationMode: canGoRemote && videoMode ? 'VIDEO' : 'PRESENTIEL',
      });
      Alert.alert(
        'Demande envoyée !',
        'Les prestataires disponibles ont été notifiés. Vous recevrez leurs devis.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch {
      Alert.alert('Erreur', 'Impossible d\'envoyer la demande. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  }, [selected, description, videoMode, canGoRemote, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🧰 EasyServices</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Demandez l'intervention d'un professionnel près de chez vous</Text>

        <Text style={styles.sectionTitle}>CHOISISSEZ UN SERVICE</Text>
        <View style={styles.categoryGrid}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.key}
              style={[styles.categoryCard, selected === c.key && styles.categoryCardActive]}
              onPress={() => handleSelect(c.key)}
            >
              <Text style={styles.categoryIcon}>{c.icon}</Text>
              <Text style={[styles.categoryLabel, selected === c.key && styles.categoryLabelActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>DÉCRIVEZ VOTRE BESOIN</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Ex : Fuite d'eau sous l'évier de la cuisine..."
          placeholderTextColor={COLORS.muted}
          multiline
          textAlignVertical="top"
        />

        {canGoRemote && (
          <TouchableOpacity
            style={[styles.videoToggle, videoMode && styles.videoToggleActive]}
            onPress={() => setVideoMode((v) => !v)}
          >
            <Text style={styles.videoToggleIcon}>📹</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.videoToggleTitle}>Consultation en appel vidéo</Text>
              <Text style={styles.videoToggleSub}>
                {videoMode ? 'Un lien d\'appel sera généré une fois le devis accepté' : 'Activez pour consulter à distance'}
              </Text>
            </View>
            <View style={[styles.videoCheckbox, videoMode && styles.videoCheckboxActive]}>
              {videoMode && <Text style={styles.videoCheckMark}>✓</Text>}
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.requestBtn, submitting && { opacity: 0.6 }]}
          onPress={handleRequest}
          disabled={submitting}
        >
          {submitting
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.requestBtnText}>📨 Envoyer la demande</Text>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  scroll: { padding: 16 },
  subtitle: { color: COLORS.muted, fontSize: 13, marginBottom: 20, textAlign: 'center' },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  categoryCard: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border,
  },
  categoryCardActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '10' },
  categoryIcon: { fontSize: 26, marginBottom: 6 },
  categoryLabel: { color: COLORS.text, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  categoryLabelActive: { color: COLORS.accent },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.text, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, minHeight: 90, marginBottom: 24,
  },
  requestBtn: {
    backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center',
  },
  requestBtnText: { color: '#000', fontSize: 16, fontWeight: '900' },
  videoToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 20,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  videoToggleActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '10' },
  videoToggleIcon: { fontSize: 22 },
  videoToggleTitle: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  videoToggleSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  videoCheckbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  videoCheckboxActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  videoCheckMark: { color: '#000', fontWeight: '900', fontSize: 14 },
});
