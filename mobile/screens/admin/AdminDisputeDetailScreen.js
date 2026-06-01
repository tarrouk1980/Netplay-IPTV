import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  accent: '#D32F2F',
  green: '#27AE60',
  orange: '#F57C00',
  blue: '#1565C0',
};

const STATUS_COLOR = {
  OPEN: COLORS.orange,
  UNDER_REVIEW: COLORS.blue,
  RESOLVED: COLORS.green,
  CLOSED: COLORS.muted,
};

const STATUS_LABEL = {
  OPEN: 'Ouvert',
  UNDER_REVIEW: 'En révision',
  RESOLVED: 'Résolu',
  CLOSED: 'Fermé',
};

function Section({ title, children }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionBody}>{children}</View>
    </View>
  );
}

function Row({ label, value, valueColor }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, valueColor ? { color: valueColor } : null]}>{value || '—'}</Text>
    </View>
  );
}

function RefundModal({ visible, dispute, onClose, onConfirm }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Erreur', 'Montant invalide.');
      return;
    }
    setLoading(true);
    try {
      await onConfirm(num, note.trim());
      setAmount('');
      setNote('');
      onClose();
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.card}>
          <Text style={m.title}>💸 Rembourser le client</Text>
          <Text style={m.sub}>Litige #{dispute?.id?.slice(-6)}</Text>
          <TextInput
            style={m.input}
            placeholder="Montant (TND)"
            placeholderTextColor={COLORS.muted}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          <TextInput
            style={[m.input, { minHeight: 70, textAlignVertical: 'top' }]}
            placeholder="Note interne (optionnelle)..."
            placeholderTextColor={COLORS.muted}
            value={note}
            onChangeText={setNote}
            multiline
          />
          <View style={m.btns}>
            <TouchableOpacity style={m.cancel} onPress={onClose} disabled={loading}>
              <Text style={m.cancelTxt}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={m.confirm} onPress={handle} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={m.confirmTxt}>Rembourser</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, width: '100%', borderWidth: 1, borderColor: COLORS.border },
  title: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 4 },
  sub: { color: COLORS.muted, fontSize: 13, marginBottom: 16 },
  input: { backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 12, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  btns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancel: { flex: 1, backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 13, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  cancelTxt: { color: COLORS.muted, fontWeight: '600' },
  confirm: { flex: 1, backgroundColor: COLORS.green, borderRadius: 10, padding: 13, alignItems: 'center' },
  confirmTxt: { color: '#FFF', fontWeight: '700' },
});

export default function AdminDisputeDetailScreen({ route, navigation }) {
  const { disputeId } = route.params || {};
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [refundModal, setRefundModal] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/admin/disputes/${disputeId}`);
      setDispute(res.data.dispute);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger ce litige.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [disputeId]);

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (status) => {
    setActionLoading(status);
    try {
      await api.patch(`/api/admin/disputes/${disputeId}/status`, { status, adminNote: adminNote.trim() || undefined });
      Alert.alert('Succès', `Statut mis à jour : ${STATUS_LABEL[status] || status}`);
      load();
    } catch (e) {
      Alert.alert('Erreur', e?.response?.data?.error || 'Erreur serveur');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (amount, note) => {
    await api.post(`/api/admin/disputes/${disputeId}/refund`, { amount, note });
    Alert.alert('Remboursement envoyé ✅', `${amount} TND crédités au client.`);
    load();
  };

  const handleWarn = async (userId) => {
    Alert.alert('Avertir l\'utilisateur ?', 'Un avertissement sera envoyé sur son compte.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Avertir', style: 'destructive',
        onPress: async () => {
          try {
            await api.post(`/api/admin/users/${userId}/warn`);
            Alert.alert('Avertissement envoyé');
          } catch {
            Alert.alert('Erreur');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  if (!dispute) return null;

  const statusColor = STATUS_COLOR[dispute.status] || COLORS.muted;
  const meta = dispute.metadata || {};

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>⚖️ Litige #{dispute.id.slice(-6).toUpperCase()}</Text>
          <Text style={[s.statusBadge, { color: statusColor }]}>
            ● {STATUS_LABEL[dispute.status] || dispute.status}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        <Section title="Informations générales">
          <Row label="Type" value={dispute.type} />
          <Row label="Créé le" value={new Date(dispute.createdAt).toLocaleString('fr-TN')} />
          <Row label="Statut" value={STATUS_LABEL[dispute.status]} valueColor={statusColor} />
          {dispute.resolvedAt && (
            <Row label="Résolu le" value={new Date(dispute.resolvedAt).toLocaleString('fr-TN')} />
          )}
        </Section>

        <Section title="Commande concernée">
          <Row label="ID commande" value={dispute.orderId?.slice(-8).toUpperCase()} />
          <Row label="Service" value={meta.service} />
          <Row label="Montant" value={meta.orderAmount ? `${meta.orderAmount} TND` : null} />
          <TouchableOpacity
            style={s.linkBtn}
            onPress={() => navigation.navigate('AdminOrderDetail', { orderId: dispute.orderId })}
          >
            <Text style={s.linkTxt}>🔍 Voir la commande →</Text>
          </TouchableOpacity>
        </Section>

        <Section title="Client plaignant">
          <Row label="Nom" value={dispute.client?.name} />
          <Row label="Téléphone" value={dispute.client?.phone} />
          <Row label="Email" value={dispute.client?.email} />
          <TouchableOpacity
            style={s.linkBtn}
            onPress={() => navigation.navigate('AdminUserDetail', { userId: dispute.clientId })}
          >
            <Text style={s.linkTxt}>👤 Voir le profil →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.warnBtn} onPress={() => handleWarn(dispute.clientId)}>
            <Text style={s.warnTxt}>⚠️ Avertir le client</Text>
          </TouchableOpacity>
        </Section>

        {dispute.providerId && (
          <Section title="Prestataire impliqué">
            <Row label="Nom" value={dispute.provider?.name} />
            <Row label="Rôle" value={dispute.provider?.role} />
            <Row label="Téléphone" value={dispute.provider?.phone} />
            <TouchableOpacity
              style={s.linkBtn}
              onPress={() => navigation.navigate('AdminUserDetail', { userId: dispute.providerId })}
            >
              <Text style={s.linkTxt}>👤 Voir le profil →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.warnBtn} onPress={() => handleWarn(dispute.providerId)}>
              <Text style={s.warnTxt}>⚠️ Avertir le prestataire</Text>
            </TouchableOpacity>
          </Section>
        )}

        <Section title="Détails du litige">
          <Text style={s.description}>{dispute.description || 'Aucune description fournie.'}</Text>
          {meta.evidence && (
            <Text style={s.evidence}>📎 Preuves jointes: {meta.evidence}</Text>
          )}
        </Section>

        {dispute.adminNote && (
          <Section title="Note admin précédente">
            <Text style={s.description}>{dispute.adminNote}</Text>
          </Section>
        )}

        <Section title="Note admin">
          <TextInput
            style={s.noteInput}
            placeholder="Ajouter une note interne..."
            placeholderTextColor={COLORS.muted}
            value={adminNote}
            onChangeText={setAdminNote}
            multiline
          />
        </Section>

        {/* Refund history */}
        {dispute.refunds?.length > 0 && (
          <Section title="Remboursements effectués">
            {dispute.refunds.map((r, i) => (
              <View key={i} style={s.refundRow}>
                <Text style={s.refundAmt}>+{r.amount} TND</Text>
                <Text style={s.refundDate}>{new Date(r.createdAt).toLocaleDateString('fr-TN')}</Text>
                {r.note ? <Text style={s.refundNote}>{r.note}</Text> : null}
              </View>
            ))}
          </Section>
        )}

        {/* Actions */}
        <View style={s.actionsSection}>
          <Text style={s.sectionTitle}>Actions</Text>
          <View style={s.actionsGrid}>
            {dispute.status !== 'UNDER_REVIEW' && (
              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: COLORS.blue + '22', borderColor: COLORS.blue }]}
                onPress={() => handleStatus('UNDER_REVIEW')}
                disabled={!!actionLoading}
              >
                {actionLoading === 'UNDER_REVIEW' ? (
                  <ActivityIndicator color={COLORS.blue} size="small" />
                ) : (
                  <Text style={[s.actionBtnTxt, { color: COLORS.blue }]}>🔍 Mettre en révision</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: COLORS.green + '22', borderColor: COLORS.green }]}
              onPress={() => setRefundModal(true)}
            >
              <Text style={[s.actionBtnTxt, { color: COLORS.green }]}>💸 Rembourser</Text>
            </TouchableOpacity>

            {dispute.status !== 'RESOLVED' && (
              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: COLORS.green + '22', borderColor: COLORS.green }]}
                onPress={() => handleStatus('RESOLVED')}
                disabled={!!actionLoading}
              >
                {actionLoading === 'RESOLVED' ? (
                  <ActivityIndicator color={COLORS.green} size="small" />
                ) : (
                  <Text style={[s.actionBtnTxt, { color: COLORS.green }]}>✅ Marquer résolu</Text>
                )}
              </TouchableOpacity>
            )}

            {dispute.status !== 'CLOSED' && (
              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent }]}
                onPress={() => handleStatus('CLOSED')}
                disabled={!!actionLoading}
              >
                {actionLoading === 'CLOSED' ? (
                  <ActivityIndicator color={COLORS.accent} size="small" />
                ) : (
                  <Text style={[s.actionBtnTxt, { color: COLORS.accent }]}>🔒 Fermer le litige</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

      </ScrollView>

      <RefundModal
        visible={refundModal}
        dispute={dispute}
        onClose={() => setRefundModal(false)}
        onConfirm={handleRefund}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  backArrow: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  statusBadge: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  section: { marginHorizontal: 16, marginTop: 16 },
  sectionTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  sectionBody: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { color: COLORS.muted, fontSize: 13 },
  rowValue: { color: COLORS.text, fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  linkBtn: { marginTop: 6 },
  linkTxt: { color: COLORS.blue, fontSize: 13, fontWeight: '600' },
  warnBtn: {
    backgroundColor: COLORS.orange + '22',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.orange,
    marginTop: 6,
  },
  warnTxt: { color: COLORS.orange, fontSize: 13, fontWeight: '600' },
  description: { color: COLORS.text, fontSize: 14, lineHeight: 20 },
  evidence: { color: COLORS.muted, fontSize: 12, marginTop: 6 },
  noteInput: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
    padding: 12,
    color: COLORS.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  refundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  refundAmt: { color: COLORS.green, fontSize: 14, fontWeight: '700', minWidth: 70 },
  refundDate: { color: COLORS.muted, fontSize: 12 },
  refundNote: { color: COLORS.muted, fontSize: 12, flex: 1, fontStyle: 'italic' },
  actionsSection: { marginHorizontal: 16, marginTop: 16 },
  actionsGrid: { gap: 10, marginTop: 8 },
  actionBtn: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionBtnTxt: { fontWeight: '700', fontSize: 14 },
});
