import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const MOCK_WALLET = {
  balance: 47.500,
  pendingBalance: 5.000,
  transactions: [
    { id: 'T1', type: 'CREDIT', label: 'Recharge portefeuille', amount: 50.000, date: '03 juin', icon: '💳' },
    { id: 'T2', type: 'DEBIT', label: 'Course Taxi — Karim B.', amount: -18.500, date: '03 juin', icon: '🚕' },
    { id: 'T3', type: 'DEBIT', label: 'Livraison Pizza Roma', amount: -5.000, date: '02 juin', icon: '📦' },
    { id: 'T4', type: 'CREDIT', label: 'Remboursement course', amount: 12.000, date: '01 juin', icon: '↩️' },
    { id: 'T5', type: 'DEBIT', label: 'SOS Dépannage', amount: -45.000, date: '30 mai', icon: '🔧' },
    { id: 'T6', type: 'CREDIT', label: 'Bonus parrainage', amount: 10.000, date: '28 mai', icon: '🎁' },
  ],
};

const TX_FILTERS = ['Toutes', 'Crédits', 'Débits'];

function TxRow({ item }) {
  const isCredit = item.type === 'CREDIT';
  return (
    <View style={styles.txRow}>
      <View style={[styles.txIcon, { backgroundColor: (isCredit ? COLORS.green : COLORS.red) + '20' }]}>
        <Text style={{ fontSize: 18 }}>{item.icon}</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txLabel} numberOfLines={1}>{item.label}</Text>
        <Text style={styles.txDate}>{item.date}</Text>
      </View>
      <Text style={[styles.txAmount, { color: isCredit ? COLORS.green : COLORS.red }]}>
        {isCredit ? '+' : ''}{item.amount.toFixed(3)} TND
      </Text>
    </View>
  );
}

export default function WalletScreen({ navigation }) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Toutes');

  const load = useCallback(() => {
    api.get('/api/wallet')
      .then(r => setWallet(r.data || MOCK_WALLET))
      .catch(() => setWallet(MOCK_WALLET))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = (wallet?.transactions || []).filter(t => {
    if (filter === 'Crédits') return t.type === 'CREDIT';
    if (filter === 'Débits') return t.type === 'DEBIT';
    return true;
  });

  const totalIn = (wallet?.transactions || []).filter(t => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
  const totalOut = (wallet?.transactions || []).filter(t => t.type === 'DEBIT').reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon portefeuille</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Balance card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <Text style={styles.balanceAmount}>{wallet.balance.toFixed(3)}</Text>
            <Text style={styles.balanceTND}>TND</Text>
            {wallet.pendingBalance > 0 && (
              <Text style={styles.pendingText}>+ {wallet.pendingBalance.toFixed(3)} TND en attente</Text>
            )}
            <TouchableOpacity
              style={styles.rechargeBtn}
              onPress={() => navigation.navigate('WalletRecharge')}
            >
              <Text style={styles.rechargeBtnText}>+ Recharger</Text>
            </TouchableOpacity>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: COLORS.green }]}>+{totalIn.toFixed(3)}</Text>
              <Text style={styles.statLabel}>Total crédits</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: COLORS.red }]}>-{totalOut.toFixed(3)}</Text>
              <Text style={styles.statLabel}>Total débits</Text>
            </View>
          </View>

          {/* Quick actions */}
          <View style={styles.quickRow}>
            {[
              { icon: '💳', label: 'Recharger', onPress: () => navigation.navigate('WalletRecharge') },
              { icon: '↗️', label: 'Virement', onPress: () => {} },
              { icon: '🎁', label: 'Parrainer', onPress: () => {} },
            ].map((a, i) => (
              <TouchableOpacity key={i} style={styles.quickBtn} onPress={a.onPress}>
                <Text style={styles.quickIcon}>{a.icon}</Text>
                <Text style={styles.quickLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Transactions */}
          <View style={styles.txSection}>
            <View style={styles.txHeader}>
              <Text style={styles.txTitle}>Transactions</Text>
              <View style={styles.filterRow}>
                {TX_FILTERS.map(f => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                    onPress={() => setFilter(f)}
                  >
                    <Text style={[styles.filterLabel, filter === f && styles.filterLabelActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.txList}>
              {filtered.map(t => (
                <React.Fragment key={t.id}>
                  <TxRow item={t} />
                  <View style={styles.txSeparator} />
                </React.Fragment>
              ))}
              {filtered.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Text style={{ color: COLORS.muted }}>Aucune transaction</Text>
                </View>
              )}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
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
  balanceCard: {
    backgroundColor: COLORS.surface, borderRadius: 24, padding: 28,
    alignItems: 'center', marginBottom: 16,
    borderWidth: 1.5, borderColor: COLORS.accent + '40',
  },
  balanceLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 8 },
  balanceAmount: { color: COLORS.accent, fontSize: 52, fontWeight: '900', lineHeight: 56 },
  balanceTND: { color: COLORS.accent, fontSize: 16, fontWeight: '600', marginBottom: 6 },
  pendingText: { color: COLORS.muted, fontSize: 12, marginBottom: 16 },
  rechargeBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 12,
    marginTop: 8,
  },
  rechargeBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statNum: { fontSize: 16, fontWeight: '800' },
  statLabel: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickBtn: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  quickIcon: { fontSize: 22, marginBottom: 4 },
  quickLabel: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  txSection: { backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  txHeader: { padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  txTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterBtn: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14,
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
  },
  filterBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  filterLabelActive: { color: '#000' },
  txList: {},
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  txIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  txDate: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '800' },
  txSeparator: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 14 },
});
