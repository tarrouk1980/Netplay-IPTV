import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_PAYMENTS = [
  { id: 'PAY-9001', type: 'taxi', icon: '🚕', desc: 'Course taxi TXI-7741', amount: 16.50, date: 'Auj. 14:32', method: 'Wallet', status: 'success' },
  { id: 'PAY-9000', type: 'delivery', icon: '🛵', desc: 'Livraison DEL-4421', amount: 8.50, date: 'Auj. 13:10', method: 'Wallet', status: 'success' },
  { id: 'PAY-8999', type: 'sos', icon: '🔧', desc: 'SOS Dépannage SOS-0041', amount: 65.00, date: 'Hier 18:22', method: 'D17', status: 'success' },
  { id: 'PAY-8998', type: 'grocery', icon: '🍕', desc: 'Épicerie GRC-1120', amount: 22.00, date: 'Hier 12:05', method: 'Konnect', status: 'success' },
  { id: 'PAY-8997', type: 'topup', icon: '💳', desc: 'Rechargement wallet', amount: 100.00, date: '02/06 09:00', method: 'Konnect', status: 'success' },
  { id: 'PAY-8996', type: 'taxi', icon: '🚕', desc: 'Course taxi TXI-7612', amount: 11.00, date: '01/06 20:44', method: 'Espèces', status: 'success' },
  { id: 'PAY-8995', type: 'delivery', icon: '🛵', desc: 'Livraison DEL-4301', amount: 9.00, date: '01/06 13:30', method: 'Wallet', status: 'refunded' },
  { id: 'PAY-8994', type: 'pass', icon: '⭐', desc: 'Abonnement EasyPass Mensuel', amount: 29.00, date: '01/06 08:00', method: 'Konnect', status: 'success' },
];

const METHOD_ICONS = { Wallet: '👛', D17: '📱', Konnect: '💳', Espèces: '💵' };
const STATUS_META = {
  success:  { label: 'Réussi',    color: COLORS.green },
  refunded: { label: 'Remboursé', color: COLORS.blue },
  failed:   { label: 'Échoué',    color: COLORS.red },
};
const TYPE_FILTERS = [['all', 'Tous'], ['taxi', 'Taxi'], ['delivery', 'Livraison'], ['sos', 'SOS'], ['grocery', 'Épicerie']];

export default function PaymentHistoryScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = MOCK_PAYMENTS.filter(p => {
    const matchSearch = !search || p.desc.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search);
    const matchType = typeFilter === 'all' || p.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalSpent = filtered.filter(p => p.status === 'success' && p.type !== 'topup').reduce((s, p) => s + p.amount, 0);

  const renderItem = ({ item: p }) => {
    const meta = STATUS_META[p.status];
    return (
      <View style={styles.payRow}>
        <View style={[styles.payIconWrap, { backgroundColor: p.status === 'refunded' ? '#0A1A2E' : '#0D1A0D' }]}>
          <Text style={{ fontSize: 22 }}>{p.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.payDesc} numberOfLines={1}>{p.desc}</Text>
          <View style={styles.payMeta}>
            <Text style={styles.payDate}>{p.date}</Text>
            <Text style={styles.payMethod}>{METHOD_ICONS[p.method]} {p.method}</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.payAmount, { color: p.status === 'refunded' ? COLORS.blue : COLORS.white }]}>
            {p.status === 'refunded' ? '↩ ' : ''}{p.amount.toFixed(2)} TND
          </Text>
          <Text style={[styles.payStatus, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historique paiements</Text>
        <TouchableOpacity>
          <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '600' }}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLbl}>Total dépensé</Text>
          <Text style={styles.summaryVal}>{totalSpent.toFixed(2)} TND</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLbl}>Transactions</Text>
          <Text style={styles.summaryVal}>{filtered.length}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLbl}>Remboursés</Text>
          <Text style={[styles.summaryVal, { color: COLORS.blue }]}>
            {filtered.filter(p => p.status === 'refunded').length}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Text style={{ color: COLORS.muted }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Référence, description..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: COLORS.muted }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Type filters */}
      <View style={styles.filtersRow}>
        {TYPE_FILTERS.map(([val, lbl]) => (
          <TouchableOpacity
            key={val}
            style={[styles.filterChip, typeFilter === val && styles.filterChipActive]}
            onPress={() => setTypeFilter(val)}
          >
            <Text style={[styles.filterText, typeFilter === val && { color: '#000' }]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>💳</Text>
            <Text style={styles.emptyText}>Aucun paiement</Text>
          </View>
        }
      />
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
  summaryCard: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 12, marginBottom: 4,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLbl: { color: COLORS.muted, fontSize: 10, marginBottom: 4 },
  summaryVal: { color: COLORS.white, fontSize: 16, fontWeight: '900' },
  summaryDivider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: 8 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginVertical: 10,
    backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, color: COLORS.white, fontSize: 14 },
  filtersRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingBottom: 10 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterText: { color: COLORS.white, fontSize: 11, fontWeight: '600' },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  payIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  payDesc: { color: COLORS.white, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  payMeta: { flexDirection: 'row', gap: 10 },
  payDate: { color: COLORS.muted, fontSize: 11 },
  payMethod: { color: COLORS.muted, fontSize: 11 },
  payAmount: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  payStatus: { fontSize: 10, fontWeight: '700' },
  separator: { height: 1, backgroundColor: COLORS.border },
  emptyBox: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: COLORS.muted, fontSize: 15 },
});
