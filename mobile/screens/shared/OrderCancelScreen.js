import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  green: '#27AE60',
  error: '#E74C3C',
  amber: '#F57C00',
};

const CANCEL_REASONS = [
  { key: 'WRONG_ADDRESS', label: 'Mauvaise adresse saisie', refund: true },
  { key: 'WAIT_TOO_LONG', label: 'Temps d\'attente trop long', refund: true },
  { key: 'CHANGED_MIND', label: 'J\'ai changé d\'avis', refund: false },
  { key: 'DRIVER_ISSUE', label: 'Problème avec le chauffeur', refund: true },
  { key: 'EMERGENCY', label: 'Urgence personnelle', refund: true },
  { key: 'OTHER', label: 'Autre raison', refund: false },
];

const SERVICE_ENDPOINTS = {
  TAXI: '/api/taxi',
  DELIVERY: '/api/delivery',
  SOS: '/api/sos',
  GROCERY: '/api/grocery',
};

const SERVICE_LABEL = {
  TAXI: '🚕 Course taxi',
  DELIVERY: '🛵 Livraison',
  SOS: '🚨 Assistance SOS',
  GROCERY: '🛒 Courses',
};

export default function OrderCancelScreen({ route, navigation }) {
  const { orderId, serviceType = 'TAXI', orderStatus = 'PENDING', price } = route?.params || {};
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const selectedReason = CANCEL_REASONS.find(r => r.key === reason);
  const mayGetRefund = selectedReason?.refund ?? false;
  const isStarted = ['IN_PROGRESS', 'ACCEPTED'].includes(orderStatus);

  // Penalty applies if ACCEPTED + user changes mind
  const hasPenalty = isStarted && !mayGetRefund;

  const handleCancel = async () => {
    if (!reason) {
      Alert.alert('Raison requise', 'Veuillez sélectionner une raison d\'annulation.');
      return;
    }

    const finalReason = reason === 'OTHER' ? (customReason.trim() || 'Autre') : selectedReason?.label;

    Alert.alert(
      'Confirmer l\'annulation',
      hasPenalty
        ? 'Une pénalité de 0.500 TND peut s\'appliquer car le prestataire est déjà en route.'
        : mayGetRefund
        ? 'Le montant sera remboursé sur votre wallet sous 24h.'
        : 'Cette annulation ne donnera pas lieu à un remboursement.',
      [
        { text: 'Retour', style: 'cancel' },
        {
          text: 'Annuler la commande',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              const endpoint = SERVICE_ENDPOINTS[serviceType] || '/api/taxi';
              await api.post(`${endpoint}/${orderId}/cancel`, { reason: finalReason });
              Alert.alert(
                'Commande annulée',
                mayGetRefund ? 'Remboursement en cours…' : 'Annulation confirmée.',
                [{ text: 'OK', onPress: () => navigation.popToTop() }]
              );
            } catch (err) {
              Alert.alert('Erreur', err?.response?.data?.error || 'Annulation impossible pour le moment.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Annuler la commande</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Order info */}
        <View style={styles.orderInfo}>
          <Text style={styles.orderLabel}>{SERVICE_LABEL[serviceType] || '📦 Commande'}</Text>
          <Text style={styles.orderId}>#{orderId?.slice(-8) || '--------'}</Text>
          {price && <Text style={styles.orderPrice}>{Number(price).toFixed(3)} TND</Text>}
        </View>

        {/* Warning if started */}
        {isStarted && (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⚠️ Commande en cours</Text>
            <Text style={styles.warningText}>
              Le prestataire a déjà accepté votre commande. Une annulation à ce stade peut entraîner des frais d'annulation.
            </Text>
          </View>
        )}

        {/* Refund policy */}
        <View style={styles.policyBox}>
          <Text style={styles.policyTitle}>📋 Politique d'annulation</Text>
          <View style={styles.policyRow}>
            <Text style={styles.policyDot}>✅</Text>
            <Text style={styles.policyText}>Avant acceptation du prestataire : <Text style={styles.policyGreen}>remboursement intégral</Text></Text>
          </View>
          <View style={styles.policyRow}>
            <Text style={styles.policyDot}>⚠️</Text>
            <Text style={styles.policyText}>Après acceptation (raison valide) : <Text style={styles.policyGreen}>remboursement intégral</Text></Text>
          </View>
          <View style={styles.policyRow}>
            <Text style={styles.policyDot}>❌</Text>
            <Text style={styles.policyText}>Changement d'avis : <Text style={styles.policyError}>sans remboursement</Text></Text>
          </View>
        </View>

        {/* Reason selection */}
        <Text style={styles.sectionLabel}>RAISON DE L'ANNULATION</Text>
        {CANCEL_REASONS.map(r => (
          <TouchableOpacity
            key={r.key}
            style={[styles.reasonCard, reason === r.key && styles.reasonCardSelected]}
            onPress={() => setReason(r.key)}
            activeOpacity={0.8}
          >
            <View style={[styles.radio, reason === r.key && styles.radioSelected]}>
              {reason === r.key && <View style={styles.radioDot} />}
            </View>
            <View style={styles.reasonInfo}>
              <Text style={[styles.reasonLabel, reason === r.key && { color: COLORS.text }]}>{r.label}</Text>
              <Text style={[styles.reasonRefund, { color: r.refund ? COLORS.green : COLORS.muted }]}>
                {r.refund ? '✅ Remboursement éligible' : '— Pas de remboursement'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {reason === 'OTHER' && (
          <TextInput
            style={styles.customInput}
            placeholder="Précisez votre raison…"
            placeholderTextColor={COLORS.muted}
            value={customReason}
            onChangeText={setCustomReason}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        )}

        {/* Preview */}
        {reason && (
          <View style={[styles.previewBox, { borderColor: mayGetRefund ? COLORS.green : COLORS.error }]}>
            <Text style={[styles.previewTitle, { color: mayGetRefund ? COLORS.green : COLORS.error }]}>
              {mayGetRefund ? '💚 Remboursement prévu' : '🔴 Aucun remboursement'}
            </Text>
            {mayGetRefund && price && (
              <Text style={styles.previewAmount}>+{Number(price).toFixed(3)} TND → votre wallet</Text>
            )}
            {hasPenalty && (
              <Text style={styles.penaltyNote}>Frais d'annulation : −0.500 TND</Text>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.cancelBtn, (!reason || cancelling) && { opacity: 0.5 }]}
          onPress={handleCancel}
          disabled={!reason || cancelling}
          activeOpacity={0.85}
        >
          {cancelling ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.cancelBtnText}>Confirmer l'annulation</Text>
          )}
        </TouchableOpacity>
      </View>
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
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  scroll: { padding: 16 },
  orderInfo: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
  },
  orderLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 4 },
  orderId: { color: COLORS.text, fontSize: 18, fontWeight: '800', fontFamily: 'monospace', marginBottom: 4 },
  orderPrice: { color: COLORS.green, fontSize: 20, fontWeight: '900' },
  warningBox: {
    backgroundColor: '#1A1000', borderRadius: 12, padding: 14,
    marginBottom: 14, borderWidth: 1, borderColor: COLORS.amber,
  },
  warningTitle: { color: COLORS.amber, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  warningText: { color: '#C8A045', fontSize: 13, lineHeight: 18 },
  policyBox: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: COLORS.border, gap: 8,
  },
  policyTitle: { color: COLORS.text, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  policyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  policyDot: { fontSize: 13 },
  policyText: { color: COLORS.muted, fontSize: 12, flex: 1, lineHeight: 18 },
  policyGreen: { color: COLORS.green, fontWeight: '600' },
  policyError: { color: COLORS.error, fontWeight: '600' },
  sectionLabel: {
    color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4,
    textTransform: 'uppercase', marginBottom: 10,
  },
  reasonCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1.5, borderColor: COLORS.border,
  },
  reasonCardSelected: { borderColor: COLORS.error, backgroundColor: '#1A0808' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: COLORS.error },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.error },
  reasonInfo: { flex: 1 },
  reasonLabel: { color: COLORS.muted, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  reasonRefund: { fontSize: 11 },
  customInput: {
    backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border,
    color: COLORS.text, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 14,
  },
  previewBox: {
    borderRadius: 12, padding: 14, borderWidth: 1.5, marginTop: 8,
    backgroundColor: COLORS.surface,
  },
  previewTitle: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  previewAmount: { color: COLORS.green, fontSize: 16, fontWeight: '700' },
  penaltyNote: { color: COLORS.error, fontSize: 12, marginTop: 4 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.bg, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  cancelBtn: { backgroundColor: COLORS.error, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  cancelBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});
