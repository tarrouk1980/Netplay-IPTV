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

const CANCEL_REASONS = [
  { key: 'changed_mind',  label: 'J\'ai changé d\'avis',          fee: false },
  { key: 'too_long',      label: 'Attente trop longue',           fee: false },
  { key: 'wrong_address', label: 'Mauvaise adresse saisie',       fee: false },
  { key: 'driver_late',   label: 'Chauffeur/livreur en retard',   fee: false },
  { key: 'emergency',     label: 'Urgence personnelle',           fee: false },
  { key: 'price',         label: 'Prix trop élevé',               fee: true  },
  { key: 'other',         label: 'Autre raison',                  fee: true  },
];

export default function OrderCancelScreen({ navigation, route }) {
  const { orderId, orderType = 'commande', hasFee = false } = route?.params || {};

  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selected = CANCEL_REASONS.find(r => r.key === reason);
  const willChargeFee = hasFee && selected?.fee;

  const handleCancel = async () => {
    if (!reason) { Alert.alert('Erreur', 'Choisissez une raison'); return; }

    const confirmMsg = willChargeFee
      ? `Des frais d'annulation peuvent s'appliquer. Confirmer l'annulation de ${orderType} #${orderId} ?`
      : `Confirmer l'annulation de ${orderType} #${orderId} ?`;

    Alert.alert('⚠️ Confirmer l\'annulation', confirmMsg, [
      { text: 'Non, garder', style: 'cancel' },
      {
        text: 'Oui, annuler', style: 'destructive',
        onPress: async () => {
          setSubmitting(true);
          try {
            await api.post(`/api/orders/${orderId}/cancel`, { reason, details });
            Alert.alert(
              'Annulation confirmée',
              `Votre ${orderType} a été annulé${willChargeFee ? '. Des frais peuvent être prélevés.' : ' sans frais.'}`,
              [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
            );
          } catch {
            Alert.alert('Erreur', 'Impossible d\'annuler. Contactez le support.');
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>❌ Annuler la {orderType}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {orderId && (
          <View style={styles.refBox}>
            <Text style={styles.refLabel}>Référence</Text>
            <Text style={styles.refValue}>{orderType} #{orderId}</Text>
          </View>
        )}

        {hasFee && (
          <View style={styles.feeWarning}>
            <Text style={styles.feeWarnText}>⚠️ Selon la raison choisie, des frais d'annulation de 2–5 TND peuvent s'appliquer.</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Raison de l'annulation</Text>
        {CANCEL_REASONS.map(r => (
          <TouchableOpacity
            key={r.key}
            style={[styles.reasonRow, reason === r.key && styles.reasonRowActive]}
            onPress={() => setReason(r.key)}
          >
            <View style={[styles.radio, reason === r.key && styles.radioActive]}>
              {reason === r.key && <View style={styles.radioDot} />}
            </View>
            <Text style={[styles.reasonText, reason === r.key && { color: COLORS.white }]}>{r.label}</Text>
            {r.fee && hasFee && (
              <View style={styles.feeBadge}>
                <Text style={styles.feeBadgeText}>Frais</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Détails supplémentaires (optionnel)</Text>
        <TextInput
          style={styles.textArea}
          value={details}
          onChangeText={setDetails}
          placeholder="Précisez si nécessaire..."
          placeholderTextColor={COLORS.muted}
          multiline maxLength={300}
          textAlignVertical="top"
        />

        {willChargeFee && (
          <View style={styles.feeConfirm}>
            <Text style={styles.feeConfirmText}>💳 Des frais d'annulation seront déduits de votre portefeuille.</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.cancelBtn, !reason && { opacity: 0.4 }]}
          onPress={handleCancel}
          disabled={!reason || submitting}
        >
          {submitting
            ? <ActivityIndicator color={COLORS.white} size="small" />
            : <Text style={styles.cancelBtnText}>Confirmer l'annulation</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.keepBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.keepBtnText}>← Garder ma {orderType}</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  scroll: { padding: 16 },
  refBox: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 14 },
  refLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  refValue: { color: COLORS.accent, fontSize: 15, fontWeight: '700', marginTop: 4 },
  feeWarning: { backgroundColor: '#1A0A00', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.orange, marginBottom: 14 },
  feeWarnText: { color: COLORS.orange, fontSize: 13, lineHeight: 18 },
  sectionLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 8 },
  reasonRowActive: { borderColor: COLORS.red, backgroundColor: '#1A0000' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.muted, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.red },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.red },
  reasonText: { flex: 1, color: COLORS.muted, fontSize: 14 },
  feeBadge: { backgroundColor: COLORS.orange + '22', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  feeBadgeText: { color: COLORS.orange, fontSize: 11, fontWeight: '700' },
  textArea: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, color: COLORS.white, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, minHeight: 80, marginBottom: 14 },
  feeConfirm: { backgroundColor: '#1A0A00', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.orange + '66', marginBottom: 14 },
  feeConfirmText: { color: COLORS.orange, fontSize: 12, lineHeight: 18 },
  cancelBtn: { backgroundColor: COLORS.red, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  cancelBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
  keepBtn: { backgroundColor: COLORS.green, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  keepBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});
