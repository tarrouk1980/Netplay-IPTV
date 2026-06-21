import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const TYPE_FILTERS = [['all', 'Tous'], ['credit', 'Entrées'], ['debit', 'Sorties']];

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function PaymentHistoryScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/wallet');
      const list = (res.data?.transactions || []).map(t => ({
        id: t.id,
        type: t.type === 'CREDIT' ? 'credit' : 'debit',
        desc: t.label || 'Transaction',
        amount: t.amount,
        date: fmtDate(t.date),
      }));
      setItems(list);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(p => {
    const matchSearch = !search || p.desc.toLowerCase().includes(search.toLowerCase()) || String(p.id).includes(search);
    const matchType = typeFilter === 'all' || p.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalSpent = filtered.filter(p => p.type === 'debit').reduce((s, p) => s + Math.abs(p.amount), 0);

  const renderItem = ({ item: p }) => (
    <View style={styles.payRow}>
      <View style={[styles.payIconWrap, { backgroundColor: p.type === 'credit' ? '#0D1A0D' : '#1A0808' }]}>
        <Text style={{ fontSize: 22 }}>{p.type === 'credit' ? '↓' : '↑'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.payDesc} numberOfLines={1}>{p.desc}</Text>
        <View style={styles.payMeta}>
          <Text style={styles.payDate}>{p.date}</Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.payAmount, { color: p.type === 'credit' ? COLORS.green : COLORS.white }]}>
          {p.type === 'credit' ? '+' : ''}{p.amount.toFixed(2)} TND
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historique paiements</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
      ) : error ? (
        <View style={styles.emptyBox}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={styles.emptyText}>Impossible de charger l'historique.</Text>
          <TouchableOpacity onPress={() => { setLoading(true); load(); }} style={styles.retryBtn}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLbl}>Total sorties</Text>
              <Text style={styles.summaryVal}>{totalSpent.toFixed(2)} TND</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLbl}>Transactions</Text>
              <Text style={styles.summaryVal}>{filtered.length}</Text>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchRow}>
            <Text style={{ color: COLORS.muted }}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Description..."
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
            keyExtractor={p => String(p.id)}
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
        </>
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
  emptyText: { color: COLORS.muted, fontSize: 15, textAlign: 'center', paddingHorizontal: 30 },
  retryBtn: { marginTop: 16, backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
});
