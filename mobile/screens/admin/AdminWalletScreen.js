import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, StatusBar, Modal,
  RefreshControl,
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
  green: '#2E7D32',
  greenLight: '#27AE60',
  accent: '#D32F2F',
  amber: '#F57C00',
};

const MOCK_WALLETS = [
  { userId: 'u1', name: 'Ali Ben Salah', phone: '+216 55 123 456', balance: 42.50, role: 'CHAUFFEUR', lastTx: '2025-05-30' },
  { userId: 'u2', name: 'Sonia Trabelsi', phone: '+216 98 765 432', balance: 7.00, role: 'CLIENT', lastTx: '2025-05-29' },
  { userId: 'u3', name: 'Karim Gharbi', phone: '+216 22 334 455', balance: 0.30, role: 'LIVREUR', lastTx: '2025-05-28' },
  { userId: 'u4', name: 'Nadia Belhaj', phone: '+216 73 211 900', balance: 120.00, role: 'DEPANNEUR', lastTx: '2025-05-27' },
];

const ROLE_COLORS = {
  CLIENT: '#4A9EFF',
  CHAUFFEUR: '#F5A623',
  LIVREUR: '#27AE60',
  DEPANNEUR: '#9B59B6',
  MARCHAND: '#E74C3C',
};

function WalletRow({ item, onAdjust }) {
  const low = item.balance < 1;
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowName}>{item.name}</Text>
        <Text style={styles.rowPhone}>{item.phone}</Text>
        <View style={[styles.roleBadge, { backgroundColor: (ROLE_COLORS[item.role] || COLORS.muted) + '33' }]}>
          <Text style={[styles.roleBadgeText, { color: ROLE_COLORS[item.role] || COLORS.muted }]}>{item.role}</Text>
        </View>
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.rowBalance, low && { color: COLORS.accent }]}>
          {Number(item.balance).toFixed(2)} TND
        </Text>
        {low && <Text style={styles.lowBadge}>Faible</Text>}
        <TouchableOpacity style={styles.adjustBtn} onPress={() => onAdjust(item)}>
          <Text style={styles.adjustBtnText}>Ajuster</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AdminWalletScreen({ navigation }) {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [modal, setModal] = useState(null); // { user } | null
  const [adjAmount, setAdjAmount] = useState('');
  const [adjType, setAdjType] = useState('CREDIT');
  const [adjReason, setAdjReason] = useState('');
  const [saving, setSaving] = useState(false);

  const [stats, setStats] = useState({ total: 0, low: 0, sum: 0 });

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/wallets');
      const data = res.data?.wallets || MOCK_WALLETS;
      setWallets(data);
      setStats({
        total: data.length,
        low: data.filter(w => w.balance < 1).length,
        sum: data.reduce((acc, w) => acc + (w.balance || 0), 0),
      });
    } catch {
      setWallets(MOCK_WALLETS);
      setStats({
        total: MOCK_WALLETS.length,
        low: MOCK_WALLETS.filter(w => w.balance < 1).length,
        sum: MOCK_WALLETS.reduce((acc, w) => acc + w.balance, 0),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdjust = async () => {
    const amt = parseFloat(adjAmount);
    if (!amt || amt <= 0) {
      Alert.alert('Montant invalide', 'Entrez un montant positif.');
      return;
    }
    setSaving(true);
    try {
      await api.post(`/api/admin/wallets/${modal.userId}/adjust`, {
        amount: amt,
        type: adjType,
        reason: adjReason.trim() || 'Ajustement admin',
      });
      setWallets(prev => prev.map(w => {
        if (w.userId !== modal.userId) return w;
        const newBal = adjType === 'CREDIT' ? w.balance + amt : Math.max(0, w.balance - amt);
        return { ...w, balance: newBal };
      }));
      setModal(null);
      setAdjAmount('');
      setAdjReason('');
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Ajustement impossible.');
    } finally {
      setSaving(false);
    }
  };

  const FILTERS = ['ALL', 'CLIENT', 'CHAUFFEUR', 'LIVREUR', 'DEPANNEUR'];

  const filtered = wallets.filter(w => {
    const matchFilter = filter === 'ALL' || w.role === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || w.name?.toLowerCase().includes(q) || w.phone?.includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💼 Wallets utilisateurs</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statNum}>{stats.total}</Text>
          <Text style={styles.statLbl}>Wallets</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={[styles.statNum, stats.low > 0 && { color: COLORS.accent }]}>{stats.low}</Text>
          <Text style={styles.statLbl}>Faibles (&lt;1)</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={[styles.statNum, { color: COLORS.greenLight }]}>{stats.sum.toFixed(0)} TND</Text>
          <Text style={styles.statLbl}>Total</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher nom / téléphone…"
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && { backgroundColor: COLORS.surface, borderColor: COLORS.text }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterChipText, filter === f && { color: COLORS.text }]}>
              {f === 'ALL' ? 'Tous' : f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.greenLight} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.userId}
          renderItem={({ item }) => <WalletRow item={item} onAdjust={u => { setModal(u); setAdjAmount(''); setAdjReason(''); setAdjType('CREDIT'); }} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.greenLight} />}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucun wallet trouvé.</Text>}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
        />
      )}

      {/* Adjust Modal */}
      <Modal visible={!!modal} transparent animationType="slide" onRequestClose={() => setModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Ajuster le wallet</Text>
            <Text style={styles.modalUser}>{modal?.name}</Text>
            <Text style={styles.modalBalance}>Solde actuel : {Number(modal?.balance || 0).toFixed(2)} TND</Text>

            {/* Credit / Debit toggle */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, adjType === 'CREDIT' && { backgroundColor: COLORS.greenLight }]}
                onPress={() => setAdjType('CREDIT')}
              >
                <Text style={[styles.toggleBtnText, adjType === 'CREDIT' && { color: '#FFF' }]}>+ Créditer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, adjType === 'DEBIT' && { backgroundColor: COLORS.accent }]}
                onPress={() => setAdjType('DEBIT')}
              >
                <Text style={[styles.toggleBtnText, adjType === 'DEBIT' && { color: '#FFF' }]}>− Débiter</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Montant (TND)"
              placeholderTextColor={COLORS.muted}
              keyboardType="numeric"
              value={adjAmount}
              onChangeText={setAdjAmount}
            />
            <TextInput
              style={[styles.modalInput, { marginTop: 10 }]}
              placeholder="Raison (optionnel)"
              placeholderTextColor={COLORS.muted}
              value={adjReason}
              onChangeText={setAdjReason}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModal(null)}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: adjType === 'CREDIT' ? COLORS.greenLight : COLORS.accent }]}
                onPress={handleAdjust}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#FFF" size="small" /> : (
                  <Text style={styles.modalConfirmText}>Confirmer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  statsRow: { flexDirection: 'row', padding: 12, gap: 10 },
  statChip: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statNum: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  statLbl: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  searchRow: { paddingHorizontal: 12, marginBottom: 10 },
  searchInput: {
    backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.text, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
  },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  filterChip: {
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  list: { paddingHorizontal: 12, paddingBottom: 40 },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 4 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, gap: 10,
  },
  rowLeft: { flex: 1 },
  rowName: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  rowPhone: { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  roleBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  roleBadgeText: { fontSize: 10, fontWeight: '700' },
  rowRight: { alignItems: 'flex-end', gap: 4 },
  rowBalance: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  lowBadge: { color: COLORS.accent, fontSize: 10, fontWeight: '700' },
  adjustBtn: { backgroundColor: COLORS.surface, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  adjustBtnText: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  emptyText: { color: COLORS.muted, textAlign: 'center', marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  modalUser: { color: COLORS.muted, fontSize: 14, marginBottom: 2 },
  modalBalance: { color: COLORS.greenLight, fontSize: 14, fontWeight: '600', marginBottom: 16 },
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  toggleBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  toggleBtnText: { color: COLORS.muted, fontWeight: '700', fontSize: 14 },
  modalInput: {
    backgroundColor: COLORS.bg, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border,
    color: COLORS.text, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16,
  },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalCancelBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  modalCancelText: { color: COLORS.muted, fontWeight: '700', fontSize: 14 },
  modalConfirmBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalConfirmText: { color: '#FFF', fontWeight: '900', fontSize: 14 },
});
