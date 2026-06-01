import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  accent: '#F5A623',
  green: '#27AE60',
  error: '#E74C3C',
};

const MOCK_SCHEDULE = {
  date: '2026-06-05',
  heure: '08:30',
  depart: '12 Rue de Marseille, Tunis',
  arrivee: 'Aéroport Tunis-Carthage',
  vehicule: 'Confort',
  prixEstime: '18,500 TND',
};

const RECURRENCES = [
  { id: 'once', label: 'Une fois' },
  { id: 'daily', label: 'Tous les jours' },
  { id: 'weekly', label: 'Chaque semaine' },
];

export default function TaxiScheduleConfirmScreen({ route, navigation }) {
  const schedule = route?.params?.schedule ?? MOCK_SCHEDULE;
  const [recurrence, setRecurrence] = useState('once');
  const [loading, setLoading] = useState(false);

  async function confirmer() {
    setLoading(true);
    try {
      await api.post('/api/taxi/schedule', { ...schedule, recurrence });
      Alert.alert('Réservation confirmée', 'Votre course programmée a été enregistrée.', [
        { text: 'OK', onPress: () => navigation.popToTop() },
      ]);
    } catch {
      Alert.alert('Erreur', 'Impossible de confirmer la réservation. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={s.header}>
        <Text style={s.headerTitle}>Confirmer la réservation</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <Text style={s.cardTitle}>Récapitulatif</Text>
          <Row label="Date" value={schedule.date} />
          <Row label="Heure" value={schedule.heure} />
          <Row label="Départ" value={schedule.depart} />
          <Row label="Arrivée" value={schedule.arrivee} />
          <Row label="Véhicule" value={schedule.vehicule} />
          <View style={s.divider} />
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>Prix estimé</Text>
            <Text style={s.priceValue}>{schedule.prixEstime}</Text>
          </View>
        </View>

        <View style={s.infoBox}>
          <Text style={s.infoIcon}>ℹ️</Text>
          <Text style={s.infoText}>Le chauffeur sera notifié 30 min avant l'heure prévue.</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Récurrence</Text>
          <View style={s.recurrenceRow}>
            {RECURRENCES.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[s.recurrenceBtn, recurrence === r.id && s.recurrenceBtnActive]}
                onPress={() => setRecurrence(r.id)}
                activeOpacity={0.8}
              >
                <Text style={[s.recurrenceText, recurrence === r.id && s.recurrenceTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[s.btnConfirm, loading && s.btnDisabled]}
          onPress={confirmer}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={s.btnConfirmText}>Confirmer la réservation</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={s.btnModifier} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <Text style={s.btnModifierText}>Modifier</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  scroll: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel: { fontSize: 14, color: COLORS.muted },
  rowValue: { fontSize: 14, color: COLORS.text, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  priceValue: { fontSize: 18, fontWeight: '800', color: COLORS.accent },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A50',
  },
  infoIcon: { fontSize: 18, marginRight: 10 },
  infoText: { flex: 1, fontSize: 13, color: COLORS.muted, lineHeight: 18 },
  recurrenceRow: { flexDirection: 'row', gap: 10 },
  recurrenceBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
  },
  recurrenceBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  recurrenceText: { fontSize: 12, color: COLORS.muted, fontWeight: '500' },
  recurrenceTextActive: { color: '#000', fontWeight: '700' },
  btnConfirm: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnDisabled: { opacity: 0.6 },
  btnConfirmText: { fontSize: 16, fontWeight: '700', color: '#000' },
  btnModifier: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnModifierText: { fontSize: 15, fontWeight: '600', color: COLORS.muted },
});
