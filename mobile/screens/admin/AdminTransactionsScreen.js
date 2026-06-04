import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const TYPE_CONFIG = {
  PAYMENT:   { label: 'Paiement',    icon: '💳', color: COLORS.green },
  REFUND:    { label: 'Remboursement', icon: '↩️', color: COLORS.blue },
  PAYOUT:    { label: 'Virement',    icon: '🏦', color: COLORS.orange },
  WALLET:    { label: 'Wallet',      icon: '👛', color: COLORS.accent },
  FEE:       { label: 'Commission',  icon: '📊', color: COLORS.muted },
};

const MOCK_TX = [
  { id: 'TX001', type: 'PAYMENT',  amount: 12.500, user: 'Nadia K.',  role: 'CLIENT',    service: 'Taxi',      date: '03/06 14:32', status: 'SUCCESS', ref: 'TXN-8821' },
  { id: 'TX002', type: 'PAYOUT',   amount: 45.000, user: 'Karim B.', role: 'CHAUFFEUR', service: 'Taxi',      date: '03/06 12:00', status: 'SUCCESS', ref: 'PAY-2201' },
  { id: 'TX003', type: 'REFUND',   amount: 8.200,  user: 'Sara M.',  role: 'CLIENT',    service: 'Livraison', date: '02/06 09:15', status: 'SUCCESS', ref: 'REF-0044' },
  { id: 'TX004', type: 'WALLET',   amount: 50.000, user: 'Ahmed R.', role: 'CLIENT',    service: 'Wallet',    date: '01/06 18:00', status: 'SUCCESS', ref: 'WLT-3399' },
  { id: 'TX005', type: 'PAYMENT',  amount: 6.500,  user: 'Rim H.',   role: 'CLIENT',    service: 'Épicerie',  date: '01/06 11:20', status: 'FAILED',  ref: 'TXN-5512' },
  { id: 'TX006', type: 'FEE',      amount: 0.000,  user: 'Système',  role: 'SYSTEM',    service: 'Taxi',      date: '30/05 08:00', status: 'SUCCESS', ref: 'FEE-0001' },
  { id: 'TX007', type: 'PAYOUT',   amount: 30.000, user: 'Nabil R.', role: 'LIVREUR',   service: 'Livraison', date: '30/05 07:00', status: 'PENDING', ref: 'PAY-2209' },
];

const FILTERS = [
  { key: 'ALL', label: 'Toutes' },
  { key: 'PAYMENT', label: '💳 Paiements' },
  { key: 'PAYOUT', label: '🏦 Virements' },
  { key: 'REFUND', label: '↩️ Remboursements' },
  { key: 'WALLET', label: '👛 Wallet' },
];

const STATUS_COLOR = { SUCCESS: COLORS.green, FAILED: COLORS.red, PENDING: COLORS.orange };

function TxCard({ item, onPress }) {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.PAYMENT;
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.85}>
      <View style={[styles.txIcon, { backgroundColor: cfg.color + '20' }]}>
        <Text style={{ fontSize: 20 }}>{cfg.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.txRef}>{item.ref}</Text>
        <Text style={styles.txUser}>{item.user} · {item.service}</Text>
        <Text style={styles.txDate}>{item.date}</Text>
      </View>
      <View style={styles.txRight}>
        <Text style={[styles.txAmount, { color: item.type === 'REFUND' ? COLORS.red : cfg.color }]}>
          {item.type === 'REFUND' ? '-' : '+'}{item.amount.toFixed(3)} TND
        </Text>
        <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[item.status] }]} />
      </View>
    </TouchableOpacity>
  );
}

export default function AdminTransactionsScreen({ navigation }) {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/admin/transactions')
      .then(r => setTxs(r.data.transactions || MOCK_TX))
      .catch(() => setTxs(MOCK_TX))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = txs.filter(t => {
    const matchType = filter === 'ALL' || t.type === filter;
    const q = search.toLowerCase();
    const matchQ = !q || t.ref.toLowerCase().includes(q) || t.user.toLowerCase().includes(q) || t.service.toLowerCase().includes(q);
    return matchType && matchQ;
  });

  const totalIn = txs.filter(t => t.type === 'PAYMENT' && t.status === 'SUCCESS').reduce((s, t) => s + t.amount, 0);
  const totalOut = txs.filter(t => t.type === 'PAYOUT' && t.status === 'SUCCESS').reduce((s, t) => s + t.amount, 0);
  const failed = txs.filter(t => t.status === 'FAILED').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💳 Transactions</Text>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}>
          <Text style={{ color: COLORS.accent, fontSize: 20 }}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiVal, { color: COLORS.green }]}>{totalIn.toFixed(0)} TND</Text>
          <Text style={styles.kpiLabel}>Encaissé</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiVal, { color: COLORS.orange }]}>{totalOut.toFixed(0)} TND</Text>
          <Text style={styles.kpiLabel}>Viré</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiVal, { color: failed > 0 ? COLORS.red : COLORS.muted }]}>{failed}</Text>
          <Text style={styles.kpiLabel}>Échecs</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Réf., utilisateur, service..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={f => f.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>{f.label}</Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={t => t.id}
          renderItem={({ item }) => <TxCard item={item} onPress={setSelected} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 40 }}>💳</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucune transaction</Text>
            </View>
          }
        />
      )}

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selected?.ref}</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={{ color: COLORS.muted, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.detailGrid}>
              {[
                { label: 'Type', value: TYPE_CONFIG[selected?.type]?.label },
                { label: 'Montant', value: `${selected?.amount?.toFixed(3)} TND` },
                { label: 'Utilisateur', value: selected?.user },
                { label: 'Rôle', value: selected?.role },
                { label: 'Service', value: selected?.service },
                { label: 'Date', value: selected?.date },
                { label: 'Statut', value: selected?.status },
                { label: 'Référence', value: selected?.ref },
              ].map(d => (
                <View key={d.label} style={styles.detailItem}>
                  <Text style={styles.detailLabel}>{d.label}</Text>
                  <Text style={[styles.detailValue, d.label === 'Statut' && { color: STATUS_COLOR[selected?.status] }]}>
                    {d.value}
                  </Text>
                </View>
              ))}
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
  refreshBtn: { width: 40, alignItems: 'flex-end' },
  kpiRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    paddingVertical: 12,
  },
  kpiItem: { flex: 1, alignItems: 'center' },
  kpiVal: { fontSize: 16, fontWeight: '900' },
  kpiLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  kpiDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  searchRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  searchInput: {
    backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  filterRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterBtn: {
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 7, backgroundColor: COLORS.surface,
  },
  filterBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  filterLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  filterLabelActive: { color: COLORS.accent },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  txIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txRef: { color: COLORS.text, fontSize: 13, fontWeight: '800' },
  txUser: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  txDate: { color: COLORS.muted, fontSize: 11, marginTop: 1 },
  txRight: { alignItems: 'flex-end', gap: 6 },
  txAmount: { fontSize: 14, fontWeight: '900' },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderWidth: 1, borderColor: COLORS.border,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  detailItem: { width: '45%' },
  detailLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 3 },
  detailValue: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
});
