import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', accentDark: '#C47D0E',
  white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_STATS = {
  balance: 1284.50,
  pending: 320.00,
  totalPaid: 8420.75,
  thisMonth: 1604.50,
};

const MOCK_PAYOUTS = [
  { id: 'PAY-001', date: '01/06/2024', amount: 780.00, status: 'paid', method: 'Virement', orders: 52 },
  { id: 'PAY-002', date: '15/05/2024', amount: 640.50, status: 'paid', method: 'Virement', orders: 43 },
  { id: 'PAY-003', date: '01/05/2024', amount: 920.25, status: 'paid', method: 'CCP', orders: 61 },
  { id: 'PAY-004', date: '15/04/2024', amount: 503.00, status: 'paid', method: 'Virement', orders: 34 },
  { id: 'PAY-005', date: '01/04/2024', amount: 1200.00, status: 'paid', method: 'Virement', orders: 80 },
];

const MOCK_PENDING = [
  { orderId: 'ORD-8841', date: '03/06/2024', amount: 45.50, status: 'confirmed' },
  { orderId: 'ORD-8832', date: '02/06/2024', amount: 128.00, status: 'confirmed' },
  { orderId: 'ORD-8801', date: '01/06/2024', amount: 92.75, status: 'in_review' },
  { orderId: 'ORD-8795', date: '31/05/2024', amount: 53.75, status: 'confirmed' },
];

const STATUS_CONFIG = {
  paid: { label: 'Versé', color: COLORS.green, bg: '#0D2E0D' },
  pending: { label: 'En attente', color: COLORS.orange, bg: '#2A1A08' },
  confirmed: { label: 'Confirmé', color: COLORS.blue, bg: '#08141A' },
  in_review: { label: 'En vérification', color: COLORS.orange, bg: '#2A1A08' },
};

export default function MerchantPayoutsScreen({ navigation }) {
  const [tab, setTab] = useState('history');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(MOCK_STATS);
  const [payouts, setPayouts] = useState(MOCK_PAYOUTS);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // const res = await api.get('/merchant/payouts');
      // setPayouts(res.data.payouts); setStats(res.data.stats);
    } catch {}
    setRefreshing(false);
  };

  const nextPayoutDate = () => {
    const d = new Date();
    const next = d.getDate() <= 15 ? new Date(d.getFullYear(), d.getMonth(), 15) : new Date(d.getFullYear(), d.getMonth() + 1, 1);
    return next.toLocaleDateString('fr-FR');
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes versements</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceTop}>
            <View>
              <Text style={styles.balanceLabel}>Solde disponible</Text>
              <Text style={styles.balanceAmount}>{stats.balance.toFixed(2)} TND</Text>
            </View>
            <View style={styles.nextPayoutBadge}>
              <Text style={styles.nextPayoutLabel}>Prochain versement</Text>
              <Text style={styles.nextPayoutDate}>{nextPayoutDate()}</Text>
            </View>
          </View>
          <View style={styles.balanceMiniRow}>
            <View style={styles.balanceMini}>
              <Text style={styles.balanceMiniNum}>{stats.pending.toFixed(0)} TND</Text>
              <Text style={styles.balanceMiniLabel}>En attente</Text>
            </View>
            <View style={styles.balanceMini}>
              <Text style={styles.balanceMiniNum}>{stats.thisMonth.toFixed(0)} TND</Text>
              <Text style={styles.balanceMiniLabel}>Ce mois</Text>
            </View>
            <View style={styles.balanceMini}>
              <Text style={styles.balanceMiniNum}>{stats.totalPaid.toFixed(0)} TND</Text>
              <Text style={styles.balanceMiniLabel}>Total versé</Text>
            </View>
          </View>
          <View style={styles.commissionNote}>
            <Text style={styles.commissionText}>✅ Commission EASYWAY : <Text style={{ color: COLORS.green, fontWeight: '800' }}>0%</Text> — Modèle zéro commission</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {[
            { id: 'history', label: '📋 Historique' },
            { id: 'pending', label: '⏳ En attente' },
          ].map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tab, tab === t.id && styles.tabActive]}
              onPress={() => setTab(t.id)}
            >
              <Text style={[styles.tabText, tab === t.id && { color: '#000' }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'history' && (
          <View style={styles.listSection}>
            {payouts.map((p) => {
              const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
              return (
                <View key={p.id} style={styles.payoutCard}>
                  <View style={styles.payoutLeft}>
                    <View style={[styles.payoutIcon, { backgroundColor: sc.bg }]}>
                      <Text style={{ fontSize: 20 }}>💸</Text>
                    </View>
                    <View>
                      <Text style={styles.payoutId}>{p.id}</Text>
                      <Text style={styles.payoutDate}>{p.date} · {p.method}</Text>
                      <Text style={styles.payoutOrders}>{p.orders} commandes</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Text style={styles.payoutAmount}>{p.amount.toFixed(2)} TND</Text>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {tab === 'pending' && (
          <View style={styles.listSection}>
            <View style={styles.pendingTotal}>
              <Text style={styles.pendingTotalLabel}>Total en attente</Text>
              <Text style={styles.pendingTotalAmount}>
                {MOCK_PENDING.reduce((s, p) => s + p.amount, 0).toFixed(2)} TND
              </Text>
            </View>
            {MOCK_PENDING.map((p) => {
              const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
              return (
                <View key={p.orderId} style={styles.payoutCard}>
                  <View style={styles.payoutLeft}>
                    <View style={[styles.payoutIcon, { backgroundColor: sc.bg }]}>
                      <Text style={{ fontSize: 20 }}>🧾</Text>
                    </View>
                    <View>
                      <Text style={styles.payoutId}>{p.orderId}</Text>
                      <Text style={styles.payoutDate}>{p.date}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Text style={styles.payoutAmount}>{p.amount.toFixed(2)} TND</Text>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
            <View style={styles.pendingNote}>
              <Text style={styles.pendingNoteText}>
                ℹ️ Les montants confirmés sont versés le 1er et 15 de chaque mois.
              </Text>
            </View>
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
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  balanceCard: {
    margin: 16, backgroundColor: '#0A1A0A', borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.green, padding: 18,
  },
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  balanceLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  balanceAmount: { color: COLORS.green, fontSize: 32, fontWeight: '900' },
  nextPayoutBadge: {
    backgroundColor: '#0D2E0D', borderRadius: 10, padding: 10,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.green,
  },
  nextPayoutLabel: { color: COLORS.muted, fontSize: 10 },
  nextPayoutDate: { color: COLORS.green, fontSize: 13, fontWeight: '700', marginTop: 2 },
  balanceMiniRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 14 },
  balanceMini: { alignItems: 'center' },
  balanceMiniNum: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  balanceMiniLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  commissionNote: {
    backgroundColor: '#0D2E0D', borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: COLORS.green,
  },
  commissionText: { color: COLORS.muted, fontSize: 12, textAlign: 'center' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  listSection: { paddingHorizontal: 16, gap: 8 },
  payoutCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  payoutLeft: { flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 },
  payoutIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  payoutId: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  payoutDate: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  payoutOrders: { color: COLORS.muted, fontSize: 11, marginTop: 1 },
  payoutAmount: { color: COLORS.accent, fontSize: 16, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  pendingTotal: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 12, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 4,
  },
  pendingTotalLabel: { color: COLORS.muted, fontSize: 14 },
  pendingTotalAmount: { color: COLORS.accent, fontSize: 20, fontWeight: '900' },
  pendingNote: {
    backgroundColor: '#08141A', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: COLORS.blue, marginTop: 8,
  },
  pendingNoteText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
});
