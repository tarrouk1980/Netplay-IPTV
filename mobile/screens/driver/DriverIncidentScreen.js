import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F', orange: '#E67E22',
};

const INCIDENT_TYPES = [
  { key: 'passenger_aggressive', label: '😡 Passager agressif', severity: 'high' },
  { key: 'accident',             label: '🚨 Accident de la route', severity: 'high' },
  { key: 'route_issue',          label: '🗺️ Problème d\'itinéraire', severity: 'low' },
  { key: 'payment_refused',      label: '💳 Refus de paiement', severity: 'medium' },
  { key: 'vehicle_damage',       label: '🚗 Dommage véhicule', severity: 'high' },
  { key: 'wrong_address',        label: '📍 Adresse incorrecte', severity: 'low' },
  { key: 'no_show',              label: '👻 Client absent', severity: 'low' },
  { key: 'other',                label: '❓ Autre incident', severity: 'medium' },
];

const SEV_COLORS = { high: COLORS.red, medium: COLORS.orange, low: COLORS.muted };

export default function DriverIncidentScreen({ navigation, route }) {
  const rideId = route?.params?.rideId || '';
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selected = INCIDENT_TYPES.find((t) => t.key === incidentType);
  const canSubmit = incidentType && description.trim().length >= 10;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/api/driver/incidents', { rideId, type: incidentType, description });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.successContainer}>
          <Text style={{ fontSize: 56, marginBottom: 16 }}>📋</Text>
          <Text style={styles.successTitle}>Incident signalé</Text>
          <Text style={styles.successSub}>
            Notre équipe a reçu votre signalement et vous contactera si nécessaire.
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Retour au tableau de bord</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>⚠️ Signaler un incident</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {rideId ? (
          <View style={styles.rideRef}>
            <Text style={styles.rideRefLabel}>Course concernée</Text>
            <Text style={styles.rideRefValue}>#{rideId}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>Type d'incident</Text>
        {INCIDENT_TYPES.map((t) => {
          const color = SEV_COLORS[t.severity];
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.typeRow, incidentType === t.key && { borderColor: color, backgroundColor: color + '11' }]}
              onPress={() => setIncidentType(t.key)}
            >
              <View style={[styles.radioCircle, incidentType === t.key && { borderColor: color }]}>
                {incidentType === t.key && <View style={[styles.radioDot, { backgroundColor: color }]} />}
              </View>
              <Text style={[styles.typeLabel, incidentType === t.key && { color: COLORS.white }]}>{t.label}</Text>
              <View style={[styles.sevBadge, { backgroundColor: color + '22' }]}>
                <Text style={[styles.sevText, { color }]}>
                  {t.severity === 'high' ? 'Urgent' : t.severity === 'medium' ? 'Moyen' : 'Faible'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Description</Text>
        <TextInput
          style={[styles.textArea, selected && { borderColor: SEV_COLORS[selected.severity] + '66' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Décrivez l'incident en détail (min. 10 caractères)..."
          placeholderTextColor={COLORS.muted}
          multiline maxLength={500} textAlignVertical="top"
        />
        <Text style={[styles.charCount, description.length < 10 && description.length > 0 && { color: COLORS.red }]}>
          {description.length}/500
        </Text>

        {selected?.severity === 'high' && (
          <View style={styles.urgentBox}>
            <Text style={styles.urgentText}>
              🚨 Incident urgent — Si vous êtes en danger immédiat, contactez le 197 (police) ou le 190 (SAMU).
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && { opacity: 0.4 }]}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          {submitting
            ? <ActivityIndicator color={COLORS.white} size="small" />
            : <Text style={styles.submitBtnText}>Envoyer le signalement</Text>}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
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
  title: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  scroll: { padding: 16 },
  rideRef: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 16,
  },
  rideRefLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  rideRefValue: { color: COLORS.accent, fontSize: 15, fontWeight: '700', marginTop: 4 },
  sectionLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  typeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 8,
  },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.muted, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  typeLabel: { flex: 1, color: COLORS.muted, fontSize: 14 },
  sevBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  sevText: { fontSize: 11, fontWeight: '700' },
  textArea: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, minHeight: 110,
  },
  charCount: { color: COLORS.muted, fontSize: 11, textAlign: 'right', marginTop: 4, marginBottom: 12 },
  urgentBox: {
    backgroundColor: '#1A0000', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: COLORS.red + '66', marginBottom: 16,
  },
  urgentText: { color: COLORS.red, fontSize: 13, lineHeight: 19, fontWeight: '600' },
  submitBtn: {
    backgroundColor: COLORS.accent, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  submitBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successTitle: { color: COLORS.white, fontSize: 24, fontWeight: '900', marginBottom: 10 },
  successSub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  doneBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 32, paddingVertical: 13 },
  doneBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
});
