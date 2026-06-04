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

const MOCK = {
  balance: 45.250,
  transactions: [
    { id: 'T1', type: 'CREDIT', label: 'Recharge portefeuille', amount: 50.000, date: '03/06/2026 10:00', icon: '➕' },
    { id: 'T2', type: 'DEBIT', label: 'Course taxi — Lac 1 → Berges', amount: -8.500, date: '03/06/2026 14:52', icon: '🚕' },
    { id: 'T3', type: 'DEBIT', label: 'Livraison Pizza Roma', amount: -12.800, date: '02/06/2026 19:30', icon: '📦' },
    { id: 'T4', type: 'CREDIT', label: 'Remboursement course annulée', amount: 6.000, date: '01/06/2026 11:20', icon: '↩️' },
    { id: 'T5', type: 'DEBIT', label: 'Épicerie Monoprix', amount: -18.500, date: '31/05/2026 16:10', icon: '🛒' },
    { id: 'T6', type: 'CREDIT', label: 'Bonus parrainage', amount: 10.000, date: '28/05/2026 09:00', icon: '🎁' },
  ],
};

const RECHARGE_AMOUNTS = [10, 20, 50, 100];

export default function ClientWalletScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('history');

  const load = useCallback(() => {
    api.get('/api/client/wallet')
      .then(r => setData(r.data || MOCK))
      .catch(() => setData(MOCK))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const d = data || MOCK;

  const recharge = (amount) => {
    navigation.navigate('Payment', { amount, purpose: 'WALLET_RECHARGE' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💳 Mon portefeuille</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <Text style={styles.balanceAmount}>{d.balance.toFixed(3)}</Text>
            <Text style={styles.balanceTND}>TND</Text>
          </View>

          <Text style={styles.sectionTitle}>RECHARGER</Text>
          <View style={styles.rechargeGrid}>
            {RECHARGE_AMOUNTS.map(amt => (
              <TouchableOpacity key={amt} style={styles.rechargeBtn} onPress={() => recharge(amt)}>
                <Text style={styles.rechargeAmount}>{amt} TND</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.customRechargeBtn} onPress={() => recharge(0)}>
            <Text style={styles.customRechargeBtnText}>+ Montant personnalisé</Text>
          </TouchableOpacity>

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'history' && styles.tabBtnActive]}
              onPress={() => setTab('history')}
            >
              <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>Historique</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'stats' && styles.tabBtnActive]}
              onPress={() => setTab('stats')}
            >
              <Text style={[styles.tabText, tab === 'stats' && styles.tabTextActive]}>Statistiques</Text>
            </TouchableOpacity>
          </View>

          {tab === 'history' ? (
            d.transactions.map(tx => (
              <View key={tx.id} style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: tx.type === 'CREDIT' ? COLORS.green + '20' : COLORS.red + '20' }]}>
                  <Text style={{ fontSize: 18 }}>{tx.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txLabel}>{tx.label}</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
                <Text style={[styles.txAmount, { color: tx.type === 'CREDIT' ? COLORS.green : COLORS.red }]}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(3)} TND
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.statsCard}>
              {[
                { label: 'Total rechargé', value: '+60.000 TND', color: COLORS.green },
                { label: 'Total dépensé', value: '-39.800 TND', color: COLORS.red },
                { label: 'Économies coupons', value: '8.500 TND', color: COLORS.accent },
              ].map((s, i) => (
                <View key={i} style={[styles.statRow, i > 0 && { borderTopWidth: 1, borderTopColor: COLORS.border }]}>
                  <Text style={styles.statLabel}>{s.label}</Text>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                </View>
              ))}
            </View>
          )}

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
  backBtn: { padding: 4 },
  backText: { color: COLORS.accent, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  scroll: { padding: 16 },
  balanceCard: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 28,
    alignItems: 'center', marginBottom: 20,
    borderWidth: 1.5, borderColor: COLORS.accent + '40',
  },
  balanceLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 8 },
  balanceAmount: { color: COLORS.accent, fontSize: 44, fontWeight: '900', lineHeight: 48 },
  balanceTND: { color: COLORS.accent, fontSize: 15, fontWeight: '600' },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  rechargeGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  rechargeBtn: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  rechargeAmount: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  customRechargeBtn: {
    backgroundColor: COLORS.accent + '15', borderRadius: 12, paddingVertical: 12,
    alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: COLORS.accent + '40',
  },
  customRechargeBtnText: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tabBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  tabBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  tabText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: COLORS.accent },
  txRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  txIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  txLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  txDate: { color: COLORS.muted, fontSize: 11 },
  txAmount: { fontSize: 13, fontWeight: '800' },
  statsCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  statLabel: { color: COLORS.muted, fontSize: 14 },
  statValue: { fontSize: 14, fontWeight: '700' },
});
