import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22', purple: '#9B59B6',
};

const REFUND_REASONS = [
  'Chauffeur non présenté', 'Commande incomplète', 'Produit endommagé',
  'Retard excessif', 'Erreur de facturation', 'Double facturation', 'Autre',
];

const MOCK = {
  id: 'RFD-20240603-0091',
  orderId: 'TXI-20240603-7741',
  orderType: 'taxi',
  clientName: 'Tarek Tarrouk',
  clientPhone: '+216 20 000 000',
  clientId: 'USR-0042',
  requestedAt: '03/06/2024 à 15:30',
  amount: 16.50,
  status: 'pending',
  reason: 'Chauffeur non présenté',
  description: 'J\'ai attendu 30 minutes. Le chauffeur n\'est jamais venu.',
  paymentMethod: 'Carte bancaire',
};

const STATUS_MAP = {
  pending: { label: 'En attente', color: COLORS.orange, bg: '#2A1A08' },
  approved: { label: 'Approuvé', color: COLORS.green, bg: '#0D2E0D' },
  rejected: { label: 'Rejeté', color: COLORS.red, bg: '#1A0808' },
  processed: { label: 'Traité', color: COLORS.blue, bg: '#08141A' },
};

export default function AdminRefundDetailScreen({ navigation, route }) {
  const refund = route.params?.refund || MOCK;
  const [status, setStatus] = useState(refund.status);
  const [adminNote, setAdminNote] = useState('');
  const [partialAmount, setPartialAmount] = useState(String(refund.amount));

  const sc = STATUS_MAP[status] || STATUS_MAP.pending;

  const handleApprove = () => {
    const amt = parseFloat(partialAmount);
    if (!amt || amt <= 0 || amt > refund.amount) {
      Alert.alert('Montant invalide', `Le montant doit être entre 0.01 et ${refund.amount.toFixed(2)} TND`);
      return;
    }
    Alert.alert(
      'Approuver le remboursement',
      `Rembourser ${amt.toFixed(2)} TND à ${refund.clientName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Approuver', onPress: () => setStatus('approved') },
      ]
    );
  };

  const handleReject = () => {
    if (!adminNote.trim()) {
      Alert.alert('Note requise', 'Veuillez indiquer la raison du rejet avant de continuer.');
      return;
    }
    Alert.alert(
      'Rejeter le remboursement',
      `Êtes-vous sûr de vouloir rejeter la demande de ${refund.clientName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Rejeter', style: 'destructive', onPress: () => setStatus('rejected') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Demande de remboursement</Text>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
          </View>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.refundId}>{refund.id}</Text>
          <Text style={styles.refundAmount}>{refund.amount.toFixed(2)} TND</Text>
          <Text style={styles.refundDate}>{refund.requestedAt}</Text>
          <View style={styles.refundOrder}>
            <Text style={styles.refundOrderText}>
              {refund.orderType === 'taxi' ? '🚕' : '🛵'} Commande {refund.orderId}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminOrders')}>
              <Text style={styles.viewOrderLink}>Voir ›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Client</Text>
          <View style={styles.clientCard}>
            <View style={styles.clientAvatar}>
              <Text style={{ fontSize: 26 }}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.clientName}>{refund.clientName}</Text>
              <Text style={styles.clientMeta}>{refund.clientPhone}</Text>
              <Text style={styles.clientMeta}>ID: {refund.clientId}</Text>
            </View>
            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => navigation.navigate('AdminUserDetail', { userId: refund.clientId })}
            >
              <Text style={styles.viewBtnText}>Profil ›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reason */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Motif de la demande</Text>
          <View style={styles.reasonCard}>
            <View style={styles.reasonTag}>
              <Text style={styles.reasonTagText}>{refund.reason}</Text>
            </View>
            <Text style={styles.reasonDesc}>{refund.description}</Text>
          </View>
        </View>

        {/* Payment info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Mode de remboursement</Text>
          <View style={styles.payCard}>
            <Text style={styles.payMethod}>🏦 {refund.paymentMethod}</Text>
            <Text style={styles.payNote}>Le remboursement sera effectué sur le même moyen de paiement.</Text>
          </View>
        </View>

        {/* Admin Actions */}
        {status === 'pending' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Décision admin</Text>

            <Text style={styles.fieldLabel}>Montant à rembourser (TND)</Text>
            <View style={styles.amountRow}>
              <TextInput
                style={styles.amountInput}
                keyboardType="decimal-pad"
                value={partialAmount}
                onChangeText={setPartialAmount}
                placeholderTextColor={COLORS.muted}
              />
              <TouchableOpacity onPress={() => setPartialAmount(String(refund.amount))}>
                <Text style={styles.fullAmountBtn}>Montant total</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Note admin (requise pour rejet)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Justification de la décision..."
              placeholderTextColor={COLORS.muted}
              value={adminNote}
              onChangeText={setAdminNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.decisionBtns}>
              <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
                <Text style={styles.rejectBtnText}>✕ Rejeter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.approveBtn} onPress={handleApprove}>
                <Text style={styles.approveBtnText}>✓ Approuver</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Result state */}
        {status !== 'pending' && (
          <View style={[styles.resultCard, { borderColor: sc.color + '55', backgroundColor: sc.bg }]}>
            <Text style={[styles.resultIcon, { color: sc.color }]}>
              {status === 'approved' ? '✓' : '✕'}
            </Text>
            <Text style={[styles.resultTitle, { color: sc.color }]}>
              Remboursement {sc.label.toLowerCase()}
            </Text>
            {adminNote ? <Text style={styles.resultNote}>Note: {adminNote}</Text> : null}
          </View>
        )}

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
  headerCenter: { alignItems: 'center', gap: 5 },
  headerTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  summaryCard: {
    margin: 16, backgroundColor: '#1A0E00', borderRadius: 16,
    padding: 20, borderWidth: 1, borderColor: COLORS.accent, alignItems: 'center',
  },
  refundId: { color: COLORS.muted, fontSize: 12, marginBottom: 8 },
  refundAmount: { color: COLORS.accent, fontSize: 38, fontWeight: '900', marginBottom: 4 },
  refundDate: { color: COLORS.muted, fontSize: 12, marginBottom: 12 },
  refundOrder: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  refundOrderText: { color: COLORS.white, fontSize: 13 },
  viewOrderLink: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  clientCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  clientAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center',
  },
  clientName: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  clientMeta: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  viewBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.accent,
  },
  viewBtnText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  reasonCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  reasonTag: {
    backgroundColor: '#1A0A0A', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: COLORS.red, alignSelf: 'flex-start', marginBottom: 10,
  },
  reasonTagText: { color: COLORS.red, fontSize: 12, fontWeight: '700' },
  reasonDesc: { color: COLORS.white, fontSize: 13, lineHeight: 18 },
  payCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  payMethod: { color: COLORS.white, fontSize: 14, fontWeight: '600', marginBottom: 6 },
  payNote: { color: COLORS.muted, fontSize: 12 },
  fieldLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 6, marginTop: 4 },
  amountRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12,
  },
  amountInput: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, fontSize: 18, fontWeight: '800', paddingHorizontal: 14, paddingVertical: 12,
  },
  fullAmountBtn: { color: COLORS.accent, fontSize: 12, fontWeight: '600' },
  noteInput: {
    backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, fontSize: 14, padding: 12, marginBottom: 16,
  },
  decisionBtns: { flexDirection: 'row', gap: 10 },
  rejectBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#1A0808', borderWidth: 1, borderColor: COLORS.red, alignItems: 'center',
  },
  rejectBtnText: { color: COLORS.red, fontSize: 14, fontWeight: '700' },
  approveBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 12,
    backgroundColor: COLORS.green, alignItems: 'center',
  },
  approveBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  resultCard: {
    marginHorizontal: 16, borderRadius: 14, padding: 24,
    borderWidth: 1, alignItems: 'center',
  },
  resultIcon: { fontSize: 40, marginBottom: 10 },
  resultTitle: { fontSize: 18, fontWeight: '800' },
  resultNote: { color: COLORS.muted, fontSize: 13, marginTop: 8, textAlign: 'center' },
});
