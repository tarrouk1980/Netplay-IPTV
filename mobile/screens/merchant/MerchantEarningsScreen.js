import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK = {
  balance: 1240.750,
  pendingPayout: 380.000,
  thisMonth: { revenue: 4820.500, orders: 312, avgOrder: 15.450, commission: 0 },
  lastMonth: { revenue: 4210.000, orders: 287 },
  growth: 14.5,
  weeklyData: [620, 580, 710, 490, 830, 950, 640],
  recentPayouts: [
    { id: 'PAY-001', amount: 850.000, date: '01/06/2026', status: 'completed' },
    { id: 'PAY-002', amount: 720.500, date: '15/05/2026', status: 'completed' },
    { id: 'PAY-003', amount: 930.000, date: '01/05/2026', status: 'completed' },
  ],
  topItems: [
    { name: 'Pizza Margherita', orders: 48, revenue: 576.000 },
    { name: 'Burger Double', orders: 35, revenue: 455.000 },
    { name: 'Salade César', orders: 29, revenue: 261.000 },
  ],
};

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function MerchantEarningsScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    api.get('/api/merchant/earnings')
      .then(r => setData(r.data || MOCK))
      .catch(() => setData(MOCK))
      .finally(() => setLoading(false));
  }, []);

  const maxWeekly = data ? Math.max(...data.weeklyData) : 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💰 Mes revenus</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <Text style={styles.balanceVal}>{data.balance.toFixed(3)} TND</Text>
            <View style={styles.pendingRow}>
              <Text style={styles.pendingText}>⏳ {data.pendingPayout.toFixed(3)} TND en cours de virement</Text>
            </View>
            <View style={styles.commissionNote}>
              <Text style={styles.commissionText}>✅ EasyWay 0% commission — revenus 100% à vous</Text>
            </View>
          </View>

          <View style={styles.periodRow}>
            {['week', 'month', 'year'].map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.periodBtn, period === p && styles.periodBtnActive]}
                onPress={() => setPeriod(p)}
              >
                <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                  {p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Année'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: COLORS.accent }]}>{data.thisMonth.revenue.toFixed(0)}</Text>
              <Text style={styles.statSub}>TND revenus</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: COLORS.text }]}>{data.thisMonth.orders}</Text>
              <Text style={styles.statSub}>Commandes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: COLORS.green }]}>+{data.growth}%</Text>
              <Text style={styles.statSub}>vs mois dernier</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>CETTE SEMAINE</Text>
          <View style={styles.chartCard}>
            <View style={styles.chart}>
              {data.weeklyData.map((val, i) => {
                const h = (val / maxWeekly) * 100;
                return (
                  <View key={i} style={styles.barCol}>
                    <Text style={styles.barValLabel}>{val > 700 ? val : ''}</Text>
                    <View style={[styles.bar, { height: `${h}%`, backgroundColor: i === 5 ? COLORS.accent : COLORS.blue + '80' }]} />
                    <Text style={styles.barDayLabel}>{DAYS[i]}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <Text style={styles.sectionTitle}>TOP PRODUITS</Text>
          {data.topItems.map((item, i) => (
            <View key={i} style={styles.topItemRow}>
              <View style={styles.topItemRank}><Text style={styles.topItemRankText}>{i + 1}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.topItemName}>{item.name}</Text>
                <Text style={styles.topItemOrders}>{item.orders} commandes</Text>
              </View>
              <Text style={styles.topItemRevenue}>{item.revenue.toFixed(0)} TND</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>VIREMENTS RÉCENTS</Text>
          {data.recentPayouts.map(p => (
            <View key={p.id} style={styles.payoutRow}>
              <View style={styles.payoutIcon}><Text style={{ fontSize: 18 }}>🏦</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.payoutId}>{p.id}</Text>
                <Text style={styles.payoutDate}>{p.date}</Text>
              </View>
              <View>
                <Text style={styles.payoutAmount}>{p.amount.toFixed(3)} TND</Text>
                <Text style={[styles.payoutStatus, { color: COLORS.green }]}>✅ Versé</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  balanceCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: COLORS.accent + '30' },
  balanceLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  balanceVal: { color: COLORS.accent, fontSize: 34, fontWeight: '900', marginBottom: 10 },
  pendingRow: { backgroundColor: COLORS.orange + '15', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 10, borderWidth: 1, borderColor: COLORS.orange + '40' },
  pendingText: { color: COLORS.orange, fontSize: 11, fontWeight: '600' },
  commissionNote: { backgroundColor: COLORS.green + '10', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.green + '30' },
  commissionText: { color: COLORS.green, fontSize: 11 },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  periodBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  periodBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  periodText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  periodTextActive: { color: COLORS.accent },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statVal: { fontSize: 18, fontWeight: '900' },
  statSub: { color: COLORS.muted, fontSize: 9, marginTop: 4, textAlign: 'center' },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  chartCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 6 },
  barCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barValLabel: { color: COLORS.accent, fontSize: 8, marginBottom: 2 },
  bar: { width: '100%', borderRadius: 4, minHeight: 4 },
  barDayLabel: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  topItemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  topItemRank: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.accent + '20', alignItems: 'center', justifyContent: 'center' },
  topItemRankText: { color: COLORS.accent, fontSize: 12, fontWeight: '900' },
  topItemName: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  topItemOrders: { color: COLORS.muted, fontSize: 11 },
  topItemRevenue: { color: COLORS.green, fontSize: 14, fontWeight: '800' },
  payoutRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  payoutIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  payoutId: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  payoutDate: { color: COLORS.muted, fontSize: 11 },
  payoutAmount: { color: COLORS.text, fontSize: 14, fontWeight: '900', textAlign: 'right' },
  payoutStatus: { fontSize: 11, textAlign: 'right', marginTop: 2 },
});
