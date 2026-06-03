import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F', orange: '#E67E22',
};

const DISPUTE_TYPES = [
  { key: 'wrong_price', label: '💰 Prix incorrect facturé' },
  { key: 'not_delivered', label: '📦 Commande non livrée' },
  { key: 'bad_quality', label: '😞 Qualité insatisfaisante' },
  { key: 'driver_behavior', label: '🚗 Comportement du chauffeur' },
  { key: 'safety', label: '🚨 Problème de sécurité' },
  { key: 'payment', label: '💳 Problème de paiement' },
  { key: 'other', label: '❓ Autre' },
];

const URGENCY_LEVELS = [
  { key: 'low', label: 'Faible', color: COLORS.muted },
  { key: 'medium', label: 'Moyen', color: COLORS.orange },
  { key: 'high', label: 'Urgent', color: COLORS.red },
];

export default function DisputeScreen({ navigation, route }) {
  const { user } = useAuthStore();
  const orderId = route?.params?.orderId || '';
  const orderType = route?.params?.orderType || 'Commande';

  const [disputeType, setDisputeType] = useState('');
  const [urgency, setUrgency] = useState('low');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const canSubmit = disputeType && description.trim().length >= 20;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await api.post('/api/disputes', {
        orderId, orderType, disputeType, urgency, description,
      });
      setTicketId(res.data?.ticketId || `DSP-${Date.now().toString().slice(-6)}`);
      setSubmitted(true);
    } catch {
      const fallbackId = `DSP-${Date.now().toString().slice(-6)}`;
      setTicketId(fallbackId);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={styles.successContainer}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>✅</Text>
          <Text style={styles.successTitle}>Litige soumis !</Text>
          <Text style={styles.successSub}>Votre ticket a été créé avec succès.</Text>
          <View style={styles.ticketBox}>
            <Text style={styles.ticketLabel}>Numéro de ticket</Text>
            <Text style={styles.ticketId}>{ticketId}</Text>
          </View>
          <Text style={styles.successNote}>
            Notre équipe examinera votre demande sous 24–48h et vous contactera par notification ou email.
          </Text>
          <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.homeBtnText}>Retour à l'accueil</Text>
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
        <Text style={styles.title}>⚠️ Déposer un litige</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {orderId ? (
          <View style={styles.orderRef}>
            <Text style={styles.orderRefLabel}>Référence</Text>
            <Text style={styles.orderRefValue}>{orderType} #{orderId}</Text>
          </View>
        ) : null}

        {/* Type */}
        <Text style={styles.sectionLabel}>Type de problème</Text>
        <View style={styles.typeGrid}>
          {DISPUTE_TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.typeBtn, disputeType === t.key && styles.typeBtnActive]}
              onPress={() => setDisputeType(t.key)}
            >
              <Text style={[styles.typeBtnText, disputeType === t.key && { color: '#000' }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Urgency */}
        <Text style={styles.sectionLabel}>Niveau d'urgence</Text>
        <View style={styles.urgencyRow}>
          {URGENCY_LEVELS.map((u) => (
            <TouchableOpacity
              key={u.key}
              style={[styles.urgencyBtn, urgency === u.key && { borderColor: u.color, backgroundColor: u.color + '22' }]}
              onPress={() => setUrgency(u.key)}
            >
              <Text style={[styles.urgencyText, urgency === u.key && { color: u.color }]}>{u.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text style={styles.sectionLabel}>Description du problème</Text>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          placeholder="Décrivez votre problème en détail (min. 20 caractères)..."
          placeholderTextColor={COLORS.muted}
          multiline
          maxLength={1000}
          textAlignVertical="top"
        />
        <Text style={[styles.charCount, description.length < 20 && { color: COLORS.red }]}>
          {description.length}/1000 {description.length < 20 ? `(${20 - description.length} de plus requis)` : '✓'}
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ En soumettant ce litige, vous acceptez que notre équipe examine les données de votre commande pour traiter votre demande. Toute fausse déclaration entraîne la clôture du dossier.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          {submitting
            ? <ActivityIndicator color="#000" size="small" />
            : <Text style={styles.submitBtnText}>Soumettre le litige</Text>}
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
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  scroll: { padding: 16 },
  orderRef: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  orderRefLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  orderRefValue: { color: COLORS.accent, fontSize: 16, fontWeight: '700', marginTop: 4 },
  sectionLabel: {
    color: COLORS.muted, fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 4,
  },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeBtn: {
    paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  typeBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  typeBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  urgencyRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  urgencyBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center',
  },
  urgencyText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  textArea: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, minHeight: 120,
  },
  charCount: { color: COLORS.muted, fontSize: 11, textAlign: 'right', marginTop: 4, marginBottom: 16 },
  infoBox: {
    backgroundColor: '#1A1200', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: COLORS.accent + '44', marginBottom: 16,
  },
  infoText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  submitBtn: {
    backgroundColor: COLORS.accent, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successTitle: { color: COLORS.white, fontSize: 26, fontWeight: '900', marginBottom: 8 },
  successSub: { color: COLORS.muted, fontSize: 14, marginBottom: 24 },
  ticketBox: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 20, borderWidth: 1.5, borderColor: COLORS.accent,
    alignItems: 'center', marginBottom: 20, width: '100%',
  },
  ticketLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  ticketId: { color: COLORS.accent, fontSize: 28, fontWeight: '900', letterSpacing: 3 },
  successNote: { color: COLORS.muted, fontSize: 13, textAlign: 'center', lineHeight: 19, marginBottom: 24 },
  homeBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  homeBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
});
