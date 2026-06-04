import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const INCIDENT_TYPES = [
  { id: 'accident', icon: '🚗', label: 'Accident de la route' },
  { id: 'client',   icon: '👤', label: 'Problème client' },
  { id: 'vehicle',  icon: '🔧', label: 'Panne véhicule' },
  { id: 'payment',  icon: '💳', label: 'Problème paiement' },
  { id: 'security', icon: '🚨', label: 'Incident sécurité' },
  { id: 'other',    icon: '📝', label: 'Autre' },
];

const SEVERITY = ['Faible', 'Modéré', 'Grave'];

const MOCK_HISTORY = [
  { id: 'INC-0041', type: 'client', icon: '👤', date: '02/06/2026', status: 'resolved', summary: 'Client agressif verbalement' },
  { id: 'INC-0032', type: 'vehicle', icon: '🔧', date: '18/05/2026', status: 'closed', summary: 'Crevaison lors d\'une course' },
];

const STATUS_META = {
  resolved: { label: 'Résolu', color: COLORS.green },
  closed:   { label: 'Fermé',  color: COLORS.muted },
  pending:  { label: 'En cours', color: COLORS.orange },
};

export default function ProviderIncidentScreen({ navigation }) {
  const [tab, setTab] = useState('new');
  const [selectedType, setSelectedType] = useState(null);
  const [severity, setSeverity] = useState(0);
  const [description, setDescription] = useState('');
  const [rideRef, setRideRef] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!selectedType) { Alert.alert('Type requis', 'Choisissez un type d\'incident.'); return; }
    if (description.trim().length < 15) { Alert.alert('Description trop courte', 'Décrivez l\'incident en au moins 15 caractères.'); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={styles.successBox}>
          <Text style={{ fontSize: 72, marginBottom: 20 }}>✅</Text>
          <Text style={styles.successTitle}>Incident signalé</Text>
          <Text style={styles.successSub}>Notre équipe examinera votre signalement sous 24h. Numéro : INC-0042</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Retour</Text>
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
        <Text style={styles.headerTitle}>Signaler un incident</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {[['new', '📝 Nouveau'], ['history', '📋 Historique']].map(([val, lbl]) => (
          <TouchableOpacity
            key={val}
            style={[styles.tab, tab === val && styles.tabActive]}
            onPress={() => setTab(val)}
          >
            <Text style={[styles.tabText, tab === val && { color: '#000' }]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'history' ? (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {MOCK_HISTORY.map((inc) => {
            const meta = STATUS_META[inc.status];
            return (
              <View key={inc.id} style={styles.histCard}>
                <View style={styles.histTop}>
                  <Text style={{ fontSize: 22 }}>{inc.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.histId}>{inc.id}</Text>
                    <Text style={styles.histSummary} numberOfLines={1}>{inc.summary}</Text>
                  </View>
                  <View>
                    <Text style={[styles.histStatus, { color: meta.color }]}>{meta.label}</Text>
                    <Text style={styles.histDate}>{inc.date}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>

          {/* Type */}
          <Text style={styles.fieldLabel}>Type d'incident *</Text>
          <View style={styles.typeGrid}>
            {INCIDENT_TYPES.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.typeCard, selectedType === t.id && styles.typeCardActive]}
                onPress={() => setSelectedType(t.id)}
              >
                <Text style={{ fontSize: 24 }}>{t.icon}</Text>
                <Text style={[styles.typeLabel, selectedType === t.id && { color: COLORS.accent }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Severity */}
          <Text style={styles.fieldLabel}>Gravité</Text>
          <View style={styles.severityRow}>
            {SEVERITY.map((s, i) => (
              <TouchableOpacity
                key={s}
                style={[styles.severityChip, severity === i && {
                  backgroundColor: [COLORS.green, COLORS.orange, COLORS.red][i] + '33',
                  borderColor: [COLORS.green, COLORS.orange, COLORS.red][i],
                }]}
                onPress={() => setSeverity(i)}
              >
                <Text style={[styles.severityText, severity === i && { color: [COLORS.green, COLORS.orange, COLORS.red][i] }]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Ride ref */}
          <Text style={styles.fieldLabel}>Course / commande concernée (optionnel)</Text>
          <TextInput
            style={styles.textField}
            placeholder="Ex : TXI-7741"
            placeholderTextColor={COLORS.muted}
            value={rideRef}
            onChangeText={setRideRef}
            autoCapitalize="characters"
          />

          {/* Description */}
          <Text style={styles.fieldLabel}>Description *</Text>
          <TextInput
            style={[styles.textField, styles.textArea]}
            placeholder="Décrivez l'incident en détail..."
            placeholderTextColor={COLORS.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, description.length < 15 && { color: COLORS.red }]}>
            {description.length} / 500 caractères (min. 15)
          </Text>

          {/* Emergency note */}
          <View style={styles.emergencyBox}>
            <Text style={styles.emergencyTitle}>🆘 Urgence ?</Text>
            <Text style={styles.emergencyText}>En cas de danger immédiat, appelez le 197 (Police) ou le 198 (Secours).</Text>
          </View>

        </ScrollView>
      )}

      {tab === 'new' && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitBtn} onPress={submit}>
            <Text style={styles.submitBtnText}>📤 Soumettre le signalement</Text>
          </TouchableOpacity>
        </View>
      )}
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
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  tabRow: { flexDirection: 'row', gap: 8, padding: 12 },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  fieldLabel: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginBottom: 10, marginTop: 6 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeCard: {
    width: '30%', backgroundColor: COLORS.surface, borderRadius: 10, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, gap: 6,
  },
  typeCardActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '11' },
  typeLabel: { color: COLORS.muted, fontSize: 10, textAlign: 'center' },
  severityRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  severityChip: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  severityText: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },
  textField: {
    backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 12, color: COLORS.white, fontSize: 14, marginBottom: 8,
  },
  textArea: { minHeight: 110 },
  charCount: { color: COLORS.muted, fontSize: 11, textAlign: 'right', marginBottom: 16 },
  emergencyBox: {
    backgroundColor: '#1A0808', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.red,
  },
  emergencyTitle: { color: COLORS.red, fontSize: 13, fontWeight: '800', marginBottom: 4 },
  emergencyText: { color: COLORS.muted, fontSize: 12 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  submitBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  submitBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
  histCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  histTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  histId: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  histSummary: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  histStatus: { fontSize: 12, fontWeight: '700', textAlign: 'right' },
  histDate: { color: COLORS.muted, fontSize: 10, textAlign: 'right', marginTop: 2 },
  successBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  successTitle: { color: COLORS.white, fontSize: 22, fontWeight: '900', marginBottom: 12 },
  successSub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', marginBottom: 32 },
  doneBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingHorizontal: 40, paddingVertical: 14,
  },
  doneBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
});
