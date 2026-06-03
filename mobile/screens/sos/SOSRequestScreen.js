import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F', orange: '#E67E22',
};

const SOS_TYPES = [
  { key: 'flat_tire',    label: 'Crevaison',        emoji: '🔧', price: 30 },
  { key: 'battery',      label: 'Batterie déchargée', emoji: '🔋', price: 25 },
  { key: 'engine',       label: 'Panne moteur',      emoji: '⚙️', price: 60 },
  { key: 'fuel',         label: 'Panne de carburant', emoji: '⛽', price: 20 },
  { key: 'towing',       label: 'Remorquage',        emoji: '🚛', price: 90 },
  { key: 'lockout',      label: 'Clés enfermées',    emoji: '🔑', price: 35 },
  { key: 'accident',     label: 'Accident léger',    emoji: '🚨', price: 50 },
  { key: 'other',        label: 'Autre panne',       emoji: '❓', price: 40 },
];

export default function SOSRequestScreen({ navigation }) {
  const [sosType, setSosType] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [locating, setLocating] = useState(true);
  const [coords, setCoords] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
          const [geo] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          if (geo) setAddress(`${geo.street || ''} ${geo.name || ''}, ${geo.city || ''}`.trim());
        }
      } catch {}
      setLocating(false);
    })();
  }, []);

  const selectedType = SOS_TYPES.find((t) => t.key === sosType);

  const handleSubmit = async () => {
    if (!sosType) { Alert.alert('Erreur', 'Choisissez le type de panne'); return; }
    if (!address.trim()) { Alert.alert('Erreur', 'Renseignez votre position'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/api/sos/request', {
        type: sosType, address: address.trim(), notes, coords,
        estimatedPrice: selectedType?.price,
      });
      navigation.replace('SOSTracking', { requestId: res.data?.requestId || `SOS-${Date.now()}`, sosType, address });
    } catch {
      Alert.alert('Erreur', 'Impossible d\'envoyer la demande. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🛻 Demande SOS</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Position */}
        <View style={styles.locationCard}>
          <Text style={styles.locLabel}>📍 Votre position</Text>
          {locating ? (
            <View style={styles.locRow}>
              <ActivityIndicator color={COLORS.accent} size="small" />
              <Text style={styles.locText}>Localisation en cours…</Text>
            </View>
          ) : (
            <TextInput
              style={styles.locInput}
              value={address}
              onChangeText={setAddress}
              placeholder="Entrez votre adresse manuellement"
              placeholderTextColor={COLORS.muted}
            />
          )}
        </View>

        {/* Type */}
        <Text style={styles.sectionLabel}>Type de panne</Text>
        <View style={styles.typeGrid}>
          {SOS_TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.typeCard, sosType === t.key && styles.typeCardActive]}
              onPress={() => setSosType(t.key)}
            >
              <Text style={{ fontSize: 28 }}>{t.emoji}</Text>
              <Text style={[styles.typeLabel, sosType === t.key && { color: COLORS.red }]}>{t.label}</Text>
              <Text style={styles.typePrice}>≈ {t.price} TND</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes */}
        <Text style={styles.sectionLabel}>Détails supplémentaires (optionnel)</Text>
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          value={notes} onChangeText={setNotes}
          placeholder="Ex : véhicule gris, immatriculation 123 TU..."
          placeholderTextColor={COLORS.muted}
          multiline maxLength={200} textAlignVertical="top"
        />

        {selectedType && (
          <View style={styles.estimateBox}>
            <Text style={styles.estimateLabel}>Estimation tarifaire</Text>
            <Text style={styles.estimateValue}>≈ {selectedType.price} TND</Text>
            <Text style={styles.estimateNote}>Le prix final peut varier selon la distance et la complexité de l'intervention.</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, (!sosType || !address.trim() || submitting) && { opacity: 0.4 }]}
          onPress={handleSubmit}
          disabled={!sosType || !address.trim() || submitting}
        >
          {submitting
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.submitBtnText}>🚨 Appeler un dépanneur</Text>}
        </TouchableOpacity>

        <Text style={styles.footer}>Les dépanneurs EASYWAY arrivent en moyenne en 18 minutes.</Text>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  scroll: { padding: 16 },
  locationCard: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 16,
  },
  locLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locText: { color: COLORS.muted, fontSize: 14 },
  locInput: { color: COLORS.white, fontSize: 14, paddingVertical: 4 },
  sectionLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  typeCard: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 1.5, borderColor: COLORS.border,
    padding: 14, alignItems: 'center', gap: 6,
  },
  typeCardActive: { borderColor: COLORS.red, backgroundColor: '#1A0000' },
  typeLabel: { color: COLORS.white, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  typePrice: { color: COLORS.muted, fontSize: 11 },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
  },
  estimateBox: {
    backgroundColor: '#1A0A00', borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.orange,
    padding: 14, alignItems: 'center', marginVertical: 14,
  },
  estimateLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  estimateValue: { color: COLORS.orange, fontSize: 32, fontWeight: '900', marginVertical: 6 },
  estimateNote: { color: COLORS.muted, fontSize: 11, textAlign: 'center', lineHeight: 16 },
  submitBtn: {
    backgroundColor: COLORS.red, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  submitBtnText: { color: COLORS.white, fontWeight: '900', fontSize: 16 },
  footer: { color: COLORS.muted, fontSize: 12, textAlign: 'center', marginTop: 14, lineHeight: 18 },
});
