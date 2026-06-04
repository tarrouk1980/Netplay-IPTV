import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', purple: '#9B59B6',
};

const PERIODS = [
  { label: '7j', days: 7 },
  { label: '30j', days: 30 },
  { label: '3m', days: 90 },
  { label: '12m', days: 365 },
];

const MOCK = {
  totalRevenue: 124850.750,
  ordersCount: 18432,
  avgTicket: 6.774,
  growth: 12.4,
  byService: [
    { service: 'TAXI', label: 'Taxi EasyWay', count: 12840, revenue: 89230.500, color: '#F5A623' },
    { service: 'DELIVERY', label: 'Livraison', count: 3210, revenue: 19870.250, color: '#3498DB' },
    { service: 'GROCERY', label: 'Épicerie', count: 1620, revenue: 9840.000, color: '#27AE60' },
    { service: 'SOS', label: 'SOS Dépannage', count: 762, revenue: 5910.000, color: '#9B59B6' },
  ],
  daily: [42.5, 68.2, 55.1, 90.3, 120.8, 145.2, 98.6, 77.4, 110.0, 132.5,
          88.3, 95.0, 140.2, 115.6, 78.9, 102.3, 130.0, 160.5, 88.2, 75.0,
          92.4, 118.7, 145.0, 98.3, 112.5, 135.8, 77.2, 88.6, 105.0, 92.3],
};

export default function AdminRevenueScreen({ navigation }) {
  const [period, setPeriod] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/admin/revenue?days=${PERIODS[period].days}`)
      .then(r => setData(r.data || MOCK))
      .catch(() => setData(MOCK))
      .finally(() => setLoading(false));
  }, [period]);

  const maxDaily = data ? Math.max(...(data.daily || [1])) : 1;
  const totalRevForBar = data ? data.byService.reduce((s, x) => s + x.revenue, 0) : 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Revenus & Analytics</Text>
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
      ) : data ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Chiffre d'affaires ({PERIODS[period].label})</Text>
            <Text style={styles.heroAmount}>{data.totalRevenue.toFixed(3)}</Text>
            <Text style={styles.heroTND}>TND</Text>
            <View style={styles.zeroBadge}>
              <Text style={styles.zeroBadgeText}>✦ 0% COMMISSION PRELEVÉE</Text>
            </View>
            <View style={styles.kpiRow}>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiNum}>{data.ordersCount.toLocaleString()}</Text>
                <Text style={styles.kpiLabel}>commandes</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiNum}>{data.avgTicket.toFixed(3)}</Text>
                <Text style={styles.kpiLabel}>panier moy.</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={[styles.kpiNum, { color: data.growth >= 0 ? COLORS.green : COLORS.red }]}>
                  {data.growth >= 0 ? '+' : ''}{data.growth}%
                </Text>
                <Text style={styles.kpiLabel}>vs période préc.</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>ACTIVITÉ QUOTIDIENNE (TND)</Text>
            <View style={styles.barChart}>
              {(data.daily || []).slice(-14).map((val, i) => (
                <View key={i} style={styles.barCol}>
                  <View style={[styles.bar, { height: Math.max(4, (val / maxDaily) * 100) }]} />
                </View>
              ))}
            </View>
            <Text style={styles.chartHint}>14 derniers jours</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>PAR SERVICE</Text>
            {data.byService.map((s, i) => (
              <View key={i} style={styles.serviceRow}>
                <View style={styles.serviceTop}>
                  <View style={[styles.serviceDot, { backgroundColor: s.color }]} />
                  <Text style={styles.serviceLabel}>{s.label}</Text>
                  <Text style={styles.serviceAmount}>{s.revenue.toFixed(3)} TND</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, {
                    width: `${Math.round((s.revenue / totalRevForBar) * 100)}%`,
                    backgroundColor: s.color,
                  }]} />
                </View>
                <View style={styles.serviceStats}>
                  <Text style={styles.serviceStat}>{s.count.toLocaleString()} commandes</Text>
                  <Text style={styles.serviceStat}>{Math.round((s.revenue / totalRevForBar) * 100)}%</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      ) : null}
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
  heroCard: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 16,
    borderWidth: 1.5, borderColor: '#F5A62350',
  },
  heroLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 8 },
  heroAmount: { color: COLORS.accent, fontSize: 48, fontWeight: '900', lineHeight: 54 },
  heroTND: { color: COLORS.accent, fontSize: 15, fontWeight: '600', marginBottom: 12 },
  zeroBadge: {
    backgroundColor: '#27AE6020', borderRadius: 20, borderWidth: 1,
    borderColor: '#27AE6050', paddingHorizontal: 14, paddingVertical: 5, marginBottom: 16,
  },
  zeroBadgeText: { color: COLORS.green, fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  kpiRow: { flexDirection: 'row', gap: 28 },
  kpiItem: { alignItems: 'center' },
  kpiNum: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  kpiLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 14 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 3 },
  barCol: { flex: 1, justifyContent: 'flex-end' },
  bar: { backgroundColor: '#F5A623CC', borderRadius: 2 },
  chartHint: { color: COLORS.muted, fontSize: 10, marginTop: 8, textAlign: 'center' },
  serviceRow: { marginBottom: 14 },
  serviceTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  serviceDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  serviceLabel: { flex: 1, color: COLORS.text, fontSize: 13 },
  serviceAmount: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  progressBg: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
  serviceStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  serviceStat: { color: COLORS.muted, fontSize: 11 },
});
