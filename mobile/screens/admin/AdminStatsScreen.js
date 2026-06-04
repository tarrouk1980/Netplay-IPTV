import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', purple: '#9B59B6',
};

const PERIODS = [{ label: '7j', days: 7 }, { label: '30j', days: 30 }, { label: '3m', days: 90 }, { label: '12m', days: 365 }];

const MOCK = {
  totalRevenue: 124850.750,
  totalOrders: 18432,
  totalUsers: 4210,
  totalProviders: 342,
  avgTicket: 6.774,
  growthRevenue: 12.4,
  growthOrders: 8.2,
  growthUsers: 15.1,
  byService: [
    { service: 'TAXI', label: 'Taxi', icon: '🚕', orders: 12840, revenue: 89230.500, color: COLORS.accent },
    { service: 'DELIVERY', label: 'Livraison', icon: '📦', orders: 3210, revenue: 19870.250, color: COLORS.blue },
    { service: 'GROCERY', label: 'Épicerie', icon: '🛒', orders: 1620, revenue: 9840.000, color: COLORS.green },
    { service: 'SOS', label: 'SOS', icon: '🔧', orders: 762, revenue: 5910.000, color: COLORS.purple },
  ],
  topZones: [
    { name: 'Tunis Centre', orders: 4210, revenue: 31250.500 },
    { name: 'La Marsa', orders: 2840, revenue: 21100.250 },
    { name: 'Ariana', orders: 2110, revenue: 15800.000 },
    { name: 'Sousse', orders: 1640, revenue: 12200.000 },
    { name: 'Sfax', orders: 980, revenue: 7400.000 },
  ],
  daily: [88, 102, 94, 145, 178, 212, 165, 134, 189, 201, 145, 167, 198, 221],
};

function GrowthBadge({ value }) {
  const positive = value >= 0;
  return (
    <View style={[styles.growthBadge, { backgroundColor: (positive ? COLORS.green : COLORS.red) + '20' }]}>
      <Text style={[styles.growthText, { color: positive ? COLORS.green : COLORS.red }]}>
        {positive ? '↑' : '↓'} {Math.abs(value)}%
      </Text>
    </View>
  );
}

export default function AdminStatsScreen({ navigation }) {
  const [period, setPeriod] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/api/admin/stats?days=${PERIODS[period].days}`)
      .then(r => setData(r.data || MOCK))
      .catch(() => setData(MOCK))
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const d = data || MOCK;
  const maxDaily = d.daily ? Math.max(...d.daily, 1) : 1;
  const totalOrders = d.byService.reduce((s, x) => s + x.orders, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistiques</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.periodRow}>
        {PERIODS.map((p, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.periodBtn, period === i && styles.periodBtnActive]}
            onPress={() => setPeriod(i)}
          >
            <Text style={[styles.periodLabel, period === i && styles.periodLabelActive]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* KPI cards */}
          <View style={styles.kpiGrid}>
            {[
              { icon: '💰', label: 'CA total', value: `${d.totalRevenue.toFixed(0)} TND`, growth: d.growthRevenue, color: COLORS.accent },
              { icon: '📦', label: 'Commandes', value: d.totalOrders.toLocaleString(), growth: d.growthOrders },
              { icon: '👥', label: 'Utilisateurs', value: d.totalUsers.toLocaleString(), growth: d.growthUsers },
              { icon: '🚗', label: 'Prestataires', value: d.totalProviders },
            ].map((kpi, i) => (
              <View key={i} style={styles.kpiCard}>
                <Text style={styles.kpiIcon}>{kpi.icon}</Text>
                <Text style={[styles.kpiValue, kpi.color && { color: kpi.color }]}>{kpi.value}</Text>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
                {kpi.growth != null && <GrowthBadge value={kpi.growth} />}
              </View>
            ))}
          </View>

          {/* Daily activity chart */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ACTIVITÉ QUOTIDIENNE (commandes)</Text>
            <View style={styles.barChart}>
              {d.daily.map((v, i) => (
                <View key={i} style={styles.barCol}>
                  <View style={[styles.bar, { height: Math.max(3, (v / maxDaily) * 90), backgroundColor: COLORS.accent + (i === d.daily.length - 1 ? 'FF' : '80') }]} />
                </View>
              ))}
            </View>
            <Text style={styles.chartHint}>{d.daily.length} derniers jours</Text>
          </View>

          {/* By service */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>PAR SERVICE</Text>
            {d.byService.map((s, i) => {
              const pct = Math.round((s.orders / totalOrders) * 100);
              return (
                <View key={i} style={styles.serviceRow}>
                  <View style={styles.serviceTop}>
                    <Text style={styles.serviceIcon}>{s.icon}</Text>
                    <Text style={styles.serviceLabel}>{s.label}</Text>
                    <Text style={styles.serviceOrders}>{s.orders.toLocaleString()} cmd</Text>
                    <Text style={[styles.serviceRevenue, { color: s.color }]}>{s.revenue.toFixed(0)} TND</Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: s.color }]} />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Top zones */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>TOP ZONES</Text>
            {d.topZones.map((z, i) => (
              <View key={i} style={styles.zoneRow}>
                <View style={[styles.zoneRank, i === 0 && { backgroundColor: COLORS.accent }]}>
                  <Text style={[styles.zoneRankText, i === 0 && { color: '#000' }]}>#{i + 1}</Text>
                </View>
                <Text style={styles.zoneName}>{z.name}</Text>
                <Text style={styles.zoneOrders}>{z.orders.toLocaleString()} cmd</Text>
                <Text style={styles.zoneRevenue}>{z.revenue.toFixed(0)} TND</Text>
              </View>
            ))}
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
  periodRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  periodBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    backgroundColor: COLORS.surface, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  periodBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  periodLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  periodLabelActive: { color: '#000' },
  scroll: { padding: 16 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  kpiCard: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, gap: 4,
  },
  kpiIcon: { fontSize: 20 },
  kpiValue: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  kpiLabel: { color: COLORS.muted, fontSize: 11 },
  growthBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 2 },
  growthText: { fontSize: 11, fontWeight: '700' },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 14 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 90, gap: 2 },
  barCol: { flex: 1, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 2 },
  chartHint: { color: COLORS.muted, fontSize: 10, marginTop: 6, textAlign: 'center' },
  serviceRow: { marginBottom: 12 },
  serviceTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  serviceIcon: { fontSize: 16 },
  serviceLabel: { flex: 1, color: COLORS.text, fontSize: 13 },
  serviceOrders: { color: COLORS.muted, fontSize: 11 },
  serviceRevenue: { fontSize: 13, fontWeight: '700', marginLeft: 8 },
  progressBg: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  zoneRank: {
    width: 24, height: 24, borderRadius: 6, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  zoneRankText: { color: COLORS.muted, fontSize: 11, fontWeight: '800' },
  zoneName: { flex: 1, color: COLORS.text, fontSize: 13 },
  zoneOrders: { color: COLORS.muted, fontSize: 11 },
  zoneRevenue: { color: COLORS.accent, fontSize: 13, fontWeight: '700', marginLeft: 8 },
});
