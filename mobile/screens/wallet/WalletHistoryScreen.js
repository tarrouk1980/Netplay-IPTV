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

const CATEGORIES = [
  ['all', 'Toutes'], ['credit', 'Entrées'], ['debit', 'Sorties'],
];

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function WalletHistoryScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [balance, setBalance] = useState(0);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/wallet');
      setBalance(res.data?.balance || 0);
      const list = (res.data?.transactions || []).map(t => ({
        id: t.id,
        type: t.type === 'CREDIT' ? 'credit' : 'debit',
        desc: t.label || 'Transaction',
        amount: t.amount,
        date: fmtDate(t.date),
      }));
      setTxns(list);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = txns.filter(t => {
    const matchSearch = !search || t.desc.toLowerCase().includes(search.toLowerCase()) || String(t.id).includes(search);
    const matchFilter = filter === 'all' || t.type === filter;
    return matchSearch && matchFilter;
  });

  const totalIn  = filtered.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter(t => t.type === 'debit').reduce((s, t) => s + Math.abs(t.amount), 0);

  const renderItem = ({ item: t }) => (
    <View style={styles.txnRow}>
      <View style={[styles.txnIconWrap, { backgroundColor: t.type === 'credit' ? '#0D2E0D' : '#1A0808' }]}>
        <Text style={{ fontSize: 18 }}>{t.type === 'credit' ? '↓' : '↑'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.txnDesc} numberOfLines={1}>{t.desc}</Text>
        <Text style={styles.txnMeta}>{t.date}</Text>
      </View>
      <Text style={[styles.txnAmount, { color: t.type === 'credit' ? COLORS.green : COLORS.red }]}>
        {t.type === 'credit' ? '+' : ''}{t.amount.toFixed(2)} TND
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historique portefeuille</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
      ) : error ? (
        <View style={styles.emptyBox}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={styles.emptyText}>Impossible de charger votre portefeuille.</Text>
          <TouchableOpacity onPress={() => { setLoading(true); load(); }} style={styles.retryBtn}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Balance banner */}
          <View style={styles.balanceBanner}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLbl}>Solde actuel</Text>
              <Text style={styles.balanceNum}>{balance.toFixed(2)} TND</Text>
            </View>
          </View>

          {/* Summary */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryChip, { backgroundColor: '#0D2E0D' }]}>
              <Text style={{ color: COLORS.green, fontSize: 12, fontWeight: '700' }}>↓ +{totalIn.toFixed(2)} TND</Text>
            </View>
            <View style={[styles.summaryChip, { backgroundColor: '#1A0808' }]}>
              <Text style={{ color: COLORS.red, fontSize: 12, fontWeight: '700' }}>↑ -{totalOut.toFixed(2)} TND</Text>
            </View>
            <Text style={styles.summaryCount}>{filtered.length} opérations</Text>
          </View>

          {/* Search */}
          <View style={styles.searchRow}>
            <Text style={{ color: COLORS.muted }}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
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

          {/* Category filters */}
          <View style={styles.filtersRow}>
            {CATEGORIES.map(([val, lbl]) => (
              <TouchableOpacity
                key={val}
                style={[styles.filterChip, filter === val && styles.filterChipActive]}
                onPress={() => setFilter(val)}
              >
                <Text style={[styles.filterText, filter === val && { color: '#000' }]}>{lbl}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={t => String(t.id)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>💳</Text>
                <Text style={styles.emptyText}>Aucune transaction</Text>
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
  balanceBanner: {
    flexDirection: 'row', margin: 16, backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  balanceItem: { flex: 1, alignItems: 'center' },
  balanceLbl: { color: COLORS.muted, fontSize: 11, marginBottom: 4 },
  balanceNum: { color: COLORS.white, fontSize: 20, fontWeight: '900' },
  balanceDivider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: 12 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 10 },
  summaryChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  summaryCount: { color: COLORS.muted, fontSize: 12, marginLeft: 'auto' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, color: COLORS.white, fontSize: 14 },
  filtersRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingBottom: 10 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterText: { color: COLORS.white, fontSize: 11, fontWeight: '600' },
  txnRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12,
  },
  txnIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txnDesc: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  txnMeta: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  txnAmount: { fontSize: 14, fontWeight: '800' },
  separator: { height: 1, backgroundColor: COLORS.border },
  emptyBox: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: COLORS.muted, fontSize: 15, textAlign: 'center', paddingHorizontal: 30 },
  retryBtn: { marginTop: 16, backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
});
