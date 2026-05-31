import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  accent: '#D32F2F',
  accentLight: '#FF5252',
  white: '#FFFFFF',
  muted: '#8A8A9A',
  border: '#2A2A3A',
  green: '#2E7D32',
  greenLight: '#4CAF50',
  amber: '#F57C00',
  purple: '#6A1B9A',
};

const STATUS_FILTERS = [
  { key: '', label: 'Tous' },
  { key: 'OPEN', label: 'Ouverts' },
  { key: 'IN_REVIEW', label: 'En examen' },
  { key: 'RESOLVED', label: 'Résolus' },
  { key: 'CLOSED', label: 'Fermés' },
];

const STATUS_COLORS = {
  OPEN: '#D32F2F',
  IN_REVIEW: '#F57C00',
  RESOLVED: '#2E7D32',
  CLOSED: '#8A8A9A',
};

const STATUS_LABELS = {
  OPEN: 'Ouvert',
  IN_REVIEW: 'En examen',
  RESOLVED: 'Résolu',
  CLOSED: 'Fermé',
};

const MOCK_DISPUTES = [
  {
    id: 'd1',
    orderId: 'ORD-001',
    serviceType: 'TAXI',
    clientName: 'Ali Mansouri',
    clientPhone: '21123456',
    driverName: 'Karim Jouini',
    reason: 'Le chauffeur a pris un itinéraire trop long et a demandé un supplément non justifié.',
    status: 'OPEN',
    amount: 12.5,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'd2',
    orderId: 'ORD-047',
    serviceType: 'DELIVERY',
    clientName: 'Sonia Ben Amor',
    clientPhone: '25987654',
    driverName: 'Youssef Karray',
    reason: 'Commande reçue avec 45 minutes de retard. Nourriture froide.',
    status: 'IN_REVIEW',
    amount: 8.0,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 'd3',
    orderId: 'ORD-023',
    serviceType: 'SOS',
    clientName: 'Mohamed Gharbi',
    clientPhone: '52001234',
    driverName: 'Hamdi Triki',
    reason: 'Remorquage mal effectué, rayures sur le véhicule.',
    status: 'RESOLVED',
    amount: 45.0,
    createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    resolution: 'Remboursement de 20 TND accordé au client.',
  },
];

const SERVICE_ICONS = {
  TAXI: '🚕',
  DELIVERY: '📦',
  SOS: '🚨',
  GROCERY: '🛒',
};

function DisputeCard({ dispute, onResolve }) {
  const statusColor = STATUS_COLORS[dispute.status] || COLORS.muted;
  const age = Math.round((Date.now() - new Date(dispute.createdAt)) / 3600000);
  const ageLabel = age < 24 ? `${age}h` : `${Math.round(age / 24)}j`;

  return (
    <View style={[dcard.container, dispute.status === 'OPEN' && dcard.urgent]}>
      <View style={dcard.topRow}>
        <Text style={dcard.service}>{SERVICE_ICONS[dispute.serviceType] || '❓'} {dispute.serviceType}</Text>
        <View style={[dcard.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor + '44' }]}>
          <Text style={[dcard.statusText, { color: statusColor }]}>{STATUS_LABELS[dispute.status]}</Text>
        </View>
        <Text style={dcard.age}>{ageLabel}</Text>
      </View>

      <Text style={dcard.orderId}>#{dispute.orderId}</Text>

      <View style={dcard.partiesRow}>
        <View style={dcard.party}>
          <Text style={dcard.partyLabel}>Client</Text>
          <Text style={dcard.partyName}>{dispute.clientName}</Text>
          <Text style={dcard.partyPhone}>{dispute.clientPhone}</Text>
        </View>
        <Text style={dcard.vs}>⚔️</Text>
        <View style={[dcard.party, { alignItems: 'flex-end' }]}>
          <Text style={dcard.partyLabel}>Prestataire</Text>
          <Text style={dcard.partyName}>{dispute.driverName}</Text>
          <Text style={[dcard.partyPhone, { textAlign: 'right' }]}>Montant: {dispute.amount} TND</Text>
        </View>
      </View>

      <View style={dcard.reasonBox}>
        <Text style={dcard.reasonLabel}>Motif du litige</Text>
        <Text style={dcard.reasonText}>{dispute.reason}</Text>
      </View>

      {dispute.resolution ? (
        <View style={dcard.resolutionBox}>
          <Text style={dcard.resolutionLabel}>✅ Résolution</Text>
          <Text style={dcard.resolutionText}>{dispute.resolution}</Text>
        </View>
      ) : null}

      {dispute.status !== 'CLOSED' && dispute.status !== 'RESOLVED' && (
        <View style={dcard.actions}>
          <TouchableOpacity
            style={[dcard.actionBtn, { borderColor: COLORS.amber + '44', backgroundColor: COLORS.amber + '11' }]}
            onPress={() => onResolve(dispute, 'IN_REVIEW')}
            activeOpacity={0.75}
          >
            <Text style={[dcard.actionText, { color: COLORS.amber }]}>🔍 Examiner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dcard.actionBtn, { borderColor: COLORS.greenLight + '44', backgroundColor: COLORS.green + '11' }]}
            onPress={() => onResolve(dispute, 'RESOLVED')}
            activeOpacity={0.75}
          >
            <Text style={[dcard.actionText, { color: COLORS.greenLight }]}>✅ Résoudre</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const dcard = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C28',
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  urgent: { borderColor: '#D32F2F44', borderLeftWidth: 3, borderLeftColor: '#D32F2F' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  service: { color: '#8A8A9A', fontSize: 12, fontWeight: '600', flex: 1 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '700' },
  age: { color: '#8A8A9A', fontSize: 11 },
  orderId: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 10 },
  partiesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  party: { flex: 1 },
  vs: { fontSize: 18, marginHorizontal: 8 },
  partyLabel: { color: '#8A8A9A', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  partyName: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  partyPhone: { color: '#8A8A9A', fontSize: 11, marginTop: 1 },
  reasonBox: { backgroundColor: '#16161F', borderRadius: 10, padding: 10, marginBottom: 10 },
  reasonLabel: { color: '#8A8A9A', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  reasonText: { color: '#FFFFFF', fontSize: 13, lineHeight: 18 },
  resolutionBox: { backgroundColor: '#2E7D3211', borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#4CAF5033' },
  resolutionLabel: { color: '#4CAF50', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  resolutionText: { color: '#FFFFFF', fontSize: 12, lineHeight: 17 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: 'center', borderWidth: 1 },
  actionText: { fontSize: 13, fontWeight: '600' },
});

export default function AdminDisputesScreen({ navigation }) {
  const [disputes, setDisputes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [resolveModal, setResolveModal] = useState(null);
  const [resolution, setResolution] = useState('');
  const [resolving, setResolving] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.get('/api/admin/disputes');
      setDisputes(res.data?.disputes || res.data || []);
    } catch {
      setDisputes(MOCK_DISPUTES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let list = disputes;
    if (statusFilter) list = list.filter(d => d.status === statusFilter);
    setFiltered(list);
  }, [disputes, statusFilter]);

  const handleResolve = (dispute, targetStatus) => {
    if (targetStatus === 'RESOLVED') {
      setResolveModal({ dispute, targetStatus });
      setResolution('');
    } else {
      // IN_REVIEW — no resolution text needed
      applyStatusChange(dispute.id, targetStatus, '');
    }
  };

  const applyStatusChange = async (id, status, resolutionText) => {
    setResolving(true);
    try {
      await api.patch(`/api/admin/disputes/${id}`, { status, resolution: resolutionText });
      setDisputes(prev =>
        prev.map(d => d.id === id ? { ...d, status, resolution: resolutionText || d.resolution } : d)
      );
      setResolveModal(null);
    } catch {
      // Optimistic UI even if API fails
      setDisputes(prev =>
        prev.map(d => d.id === id ? { ...d, status, resolution: resolutionText || d.resolution } : d)
      );
      setResolveModal(null);
    } finally {
      setResolving(false);
    }
  };

  const openCount = disputes.filter(d => d.status === 'OPEN').length;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>⚠️ Litiges & Disputes</Text>
          {openCount > 0 && (
            <Text style={styles.headerSub}>{openCount} litige{openCount > 1 ? 's' : ''} en attente d'action</Text>
          )}
        </View>
        <View style={styles.headerCount}>
          <Text style={styles.headerCountText}>{filtered.length}</Text>
        </View>
      </View>

      {/* Status filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}>
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, statusFilter === f.key && styles.filterChipActive]}
            onPress={() => setStatusFilter(f.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterChipText, statusFilter === f.key && styles.filterChipTextActive]}>
              {f.label}
              {f.key === 'OPEN' && openCount > 0 ? ` (${openCount})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id?.toString()}
          renderItem={({ item }) => (
            <DisputeCard dispute={item} onResolve={handleResolve} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.accent} />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>Aucun litige trouvé</Text>
          }
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 4 }}
        />
      )}

      {/* Resolve modal */}
      <Modal
        visible={!!resolveModal}
        transparent
        animationType="slide"
        onRequestClose={() => setResolveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✅ Résoudre le litige</Text>
            <Text style={styles.modalSub}>
              Litige #{resolveModal?.dispute?.orderId} — {resolveModal?.dispute?.clientName}
            </Text>
            <TextInput
              style={styles.resolutionInput}
              placeholder="Décrivez la résolution (remboursement, avertissement, etc.)…"
              placeholderTextColor={COLORS.muted}
              value={resolution}
              onChangeText={setResolution}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setResolveModal(null)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, resolving && { opacity: 0.6 }]}
                onPress={() => applyStatusChange(resolveModal.dispute.id, 'RESOLVED', resolution)}
                disabled={resolving || !resolution.trim()}
              >
                {resolving
                  ? <ActivityIndicator color={COLORS.white} size="small" />
                  : <Text style={styles.modalConfirmText}>Confirmer</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 30, color: COLORS.white, lineHeight: 30 },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  headerSub: { color: COLORS.accent, fontSize: 11, marginTop: 2 },
  headerCount: {
    marginLeft: 'auto',
    backgroundColor: COLORS.accent + '22',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.accent + '44',
  },
  headerCountText: { color: COLORS.accentLight, fontSize: 13, fontWeight: '700' },
  filterScroll: { flexGrow: 0 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent },
  filterChipText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.white },
  empty: { color: COLORS.muted, textAlign: 'center', marginTop: 60, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  modalSub: { color: COLORS.muted, fontSize: 13, marginBottom: 16 },
  resolutionInput: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    color: COLORS.white,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancel: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelText: { color: COLORS.muted, fontSize: 15, fontWeight: '600' },
  modalConfirm: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: COLORS.green,
  },
  modalConfirmText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});
