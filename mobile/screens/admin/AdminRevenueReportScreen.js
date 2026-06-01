import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#D32F2F', accentLight: '#FF5252', white: '#FFFFFF',
  muted: '#8A8A9A', border: '#2A2A3A', green: '#2E7D32',
  amber: '#F57C00', blue: '#1565C0', purple: '#7B1FA2',
};

const PERIODS = [
  { key: 'today', label: "Aujourd'hui" },
  { key: 'week', label: '7 jours' },
  { key: 'month', label: '30 jours' },
  { key: 'quarter', label: '3 mois' },
];

const SERVICE_COLORS = {
  TAXI: COLORS.amber,
  SOS: COLORS.accent,
  DELIVERY: COLORS.green,
  GROCERY: COLORS.blue,
};

const MOCK = {
  today: {
    totalTND: 1840, totalOrders: 92, avgOrderValue: 20,
    growth: +12.4,
    byService: [
      { service: 'TAXI', revenue: 920, orders: 46, pct: 50 },
      { service: 'DELIVERY', revenue: 460, orders: 28, pct: 25 },
      { service: 'SOS', revenue: 276, orders: 10, pct: 15 },
      { service: 'GROCERY', revenue: 184, orders: 8, pct: 10 },
    ],
    topProviders: [
      { name: 'Mohamed B.', role: 'CHAUFFEUR', revenue: 185, orders: 9 },
      { name: 'Farouk T.', role: 'CHAUFFEUR', revenue: 162, orders: 8 },
      { name: 'Slim M.', role: 'LIVREUR', revenue: 98, orders: 12 },
    ],
    dailyChart: [820, 940, 1100, 990, 1250, 1640, 1840],
    chartLabels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  },
  week: {
    totalTND: 9200, totalOrders: 480, avgOrderValue: 19.2,
    growth: +8.1,
    byService: [
      { service: 'TAXI', revenue: 4600, orders: 230, pct: 50 },
      { service: 'DELIVERY', revenue: 2300, orders: 140, pct: 25 },
      { service: 'SOS', revenue: 1380, orders: 50, pct: 15 },
      { service: 'GROCERY', revenue: 920, orders: 60, pct: 10 },
    ],
    topProviders: [
      { name: 'Mohamed B.', role: 'CHAUFFEUR', revenue: 840, orders: 42 },
      { name: 'Yassine K.', role: 'CHAUFFEUR', revenue: 780, orders: 39 },
      { name: 'Slim M.', role: 'LIVREUR', revenue: 510, orders: 63 },
      { name: 'El Aziz F.', role: 'DEPANNEUR', revenue: 450, orders: 15 },
    ],
    dailyChart: [1100, 1300, 1400, 1200, 1350, 1500, 1350],
    chartLabels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  },
  month: {
    totalTND: 38400, totalOrders: 1920, avgOrderValue: 20,
    growth: +15.3,
    byService: [
      { service: 'TAXI', revenue: 19200, orders: 960, pct: 50 },
      { service: 'DELIVERY', revenue: 9600, orders: 600, pct: 25 },
      { service: 'SOS', revenue: 5760, orders: 200, pct: 15 },
      { service: 'GROCERY', revenue: 3840, orders: 160, pct: 10 },
    ],
    topProviders: [
      { name: 'Mohamed B.', role: 'CHAUFFEUR', revenue: 3200, orders: 160 },
      { name: 'Yassine K.', role: 'CHAUFFEUR', revenue: 2900, orders: 145 },
      { name: 'Slim M.', role: 'LIVREUR', revenue: 1800, orders: 220 },
      { name: 'El Aziz F.', role: 'DEPANNEUR', revenue: 1600, orders: 55 },
      { name: 'Hamza R.', role: 'LIVREUR', revenue: 1200, orders: 150 },
    ],
    dailyChart: [1100, 1250, 1300, 1280, 1350, 1500, 1200, 1400, 1450, 1500, 1350, 1280, 1310, 1250, 1400, 1420, 1500, 1480, 1520, 1600, 1480, 1420, 1380, 1440, 1500, 1520, 1480, 1400, 1420, 1450],
    chartLabels: Array.from({ length: 30 }, (_, i) => String(i + 1)),
  },
  quarter: {
    totalTND: 112000, totalOrders: 5600, avgOrderValue: 20,
    growth: +22.7,
    byService: [
      { service: 'TAXI', revenue: 56000, orders: 2800, pct: 50 },
      { service: 'DELIVERY', revenue: 28000, orders: 1750, pct: 25 },
      { service: 'SOS', revenue: 16800, orders: 580, pct: 15 },
      { service: 'GROCERY', revenue: 11200, orders: 470, pct: 10 },
    ],
    topProviders: [
      { name: 'Mohamed B.', role: 'CHAUFFEUR', revenue: 9200, orders: 460 },
      { name: 'Yassine K.', role: 'CHAUFFEUR', revenue: 8600, orders: 430 },
      { name: 'Slim M.', role: 'LIVREUR', revenue: 5200, orders: 650 },
    ],
    dailyChart: [32000, 38000, 42000],
    chartLabels: ['Mois 1', 'Mois 2', 'Mois 3'],
  },
};

const ROLE_EMOJI = { CHAUFFEUR: '🚕', LIVREUR: '🛵', DEPANNEUR: '🛻', MARCHAND: '🏪' };

function MiniBarChart({ data, labels, color }) {
  const max = Math.max(...data, 1);
  const show = data.slice(-10);
  const lbls = labels.slice(-10);
  return (
    <View style={chart.container}>
      <View style={chart.barsRow}>
        {show.map((v, i) => {
          const h = Math.max(4, Math.round((v / max) * 60));
          return (
            <View key={i} style={chart.barWrap}>
              <View style={[chart.bar, { height: h, backgroundColor: color }]} />
              <Text style={chart.label}>{lbls[i]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const chart = StyleSheet.create({
  container: { marginTop: 8 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 80 },
  barWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 2 },
  bar: { width: '80%', borderRadius: 3 },
  label: { color: COLORS.muted, fontSize: 8, marginTop: 4 },
});

export default function AdminRevenueReportScreen({ navigation }) {
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState(MOCK.week);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async (p) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/revenue?period=${p}`);
      setData(res.data);
    } catch {
      setData(MOCK[p]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(period); }, [period]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const rows = [
        'Service,Revenus TND,Commandes,Part %',
        ...(data.byService || []).map(s => `${s.service},${s.revenue},${s.orders},${s.pct}%`),
        '',
        'TOP PRESTATAIRES',
        'Nom,Rôle,Revenus TND,Commandes',
        ...(data.topProviders || []).map(p => `${p.name},${p.role},${p.revenue},${p.orders}`),
      ];
      const csv = rows.join('\n');
      const path = FileSystem.documentDirectory + `revenue_${period}_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Exporter le rapport' });
    } catch {}
    finally { setExporting(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📊 Rapport revenus</Text>
        <TouchableOpacity onPress={handleExport} style={styles.exportBtn} disabled={exporting}>
          {exporting ? <ActivityIndicator color={COLORS.accent} size="small" /> : <Text style={styles.exportBtnText}>CSV</Text>}
        </TouchableOpacity>
      </View>

      {/* Period tabs */}
      <View style={styles.periodRow}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p.key}
            style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[styles.periodLabel, period === p.key && styles.periodLabelActive]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={COLORS.accent} size="large" /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* KPI row */}
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiEmoji}>💰</Text>
              <Text style={styles.kpiValue}>{(data.totalTND || 0).toLocaleString()}</Text>
              <Text style={styles.kpiLabel}>TND</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiEmoji}>📦</Text>
              <Text style={styles.kpiValue}>{(data.totalOrders || 0).toLocaleString()}</Text>
              <Text style={styles.kpiLabel}>Commandes</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiEmoji}>📈</Text>
              <Text style={[styles.kpiValue, { color: (data.growth || 0) >= 0 ? COLORS.green : COLORS.accent }]}>
                {(data.growth || 0) >= 0 ? '+' : ''}{(data.growth || 0).toFixed(1)}%
              </Text>
              <Text style={styles.kpiLabel}>vs période préc.</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiEmoji}>💵</Text>
              <Text style={styles.kpiValue}>{(data.avgOrderValue || 0).toFixed(0)}</Text>
              <Text style={styles.kpiLabel}>TND moyen</Text>
            </View>
          </View>

          {/* Trend chart */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Évolution sur la période</Text>
            <MiniBarChart data={data.dailyChart || []} labels={data.chartLabels || []} color={COLORS.accent} />
          </View>

          {/* Service breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Répartition par service</Text>
            {(data.byService || []).map(s => (
              <View key={s.service} style={styles.serviceRow}>
                <View style={[styles.serviceDot, { backgroundColor: SERVICE_COLORS[s.service] || COLORS.muted }]} />
                <Text style={styles.serviceLabel}>{s.service}</Text>
                <View style={styles.serviceBarBg}>
                  <View style={[styles.serviceBarFill, { width: `${s.pct}%`, backgroundColor: SERVICE_COLORS[s.service] || COLORS.muted }]} />
                </View>
                <Text style={styles.serviceRevenue}>{s.revenue.toLocaleString()} TND</Text>
                <Text style={styles.servicePct}>{s.pct}%</Text>
              </View>
            ))}
          </View>

          {/* Service detail cards */}
          <View style={styles.serviceCardRow}>
            {(data.byService || []).map(s => (
              <View key={s.service} style={[styles.serviceCard, { borderTopColor: SERVICE_COLORS[s.service] || COLORS.muted }]}>
                <Text style={styles.serviceCardLabel}>{s.service}</Text>
                <Text style={[styles.serviceCardVal, { color: SERVICE_COLORS[s.service] || COLORS.white }]}>
                  {s.revenue.toLocaleString()} TND
                </Text>
                <Text style={styles.serviceCardOrders}>{s.orders} courses</Text>
              </View>
            ))}
          </View>

          {/* Top providers */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top prestataires</Text>
            {(data.topProviders || []).map((p, i) => (
              <View key={i} style={styles.providerRow}>
                <View style={styles.providerRank}>
                  <Text style={styles.providerRankText}>{i + 1}</Text>
                </View>
                <Text style={styles.providerEmoji}>{ROLE_EMOJI[p.role] || '👤'}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.providerName}>{p.name}</Text>
                  <Text style={styles.providerRole}>{p.role} · {p.orders} courses</Text>
                </View>
                <Text style={styles.providerRevenue}>{p.revenue.toLocaleString()} TND</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, alignItems: 'center' },
  backText: { color: COLORS.white, fontSize: 28 },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  exportBtn: { backgroundColor: COLORS.surface, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.accent },
  exportBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
  periodRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  periodBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  periodBtnActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  periodLabel: { color: COLORS.muted, fontSize: 13 },
  periodLabelActive: { color: COLORS.accent, fontWeight: '700' },
  kpiRow: { flexDirection: 'row', padding: 8, gap: 4 },
  kpiCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 10,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  kpiEmoji: { fontSize: 18, marginBottom: 4 },
  kpiValue: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  kpiLabel: { color: COLORS.muted, fontSize: 9, marginTop: 2, textAlign: 'center' },
  section: {
    backgroundColor: COLORS.surface, margin: 12, marginTop: 0, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8,
  },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  serviceDot: { width: 10, height: 10, borderRadius: 5 },
  serviceLabel: { color: COLORS.white, fontSize: 12, fontWeight: '700', width: 72 },
  serviceBarBg: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3 },
  serviceBarFill: { height: 6, borderRadius: 3 },
  serviceRevenue: { color: COLORS.white, fontSize: 12, fontWeight: '600', width: 70, textAlign: 'right' },
  servicePct: { color: COLORS.muted, fontSize: 12, width: 32, textAlign: 'right' },
  serviceCardRow: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 8, gap: 6 },
  serviceCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, padding: 10,
    borderTopWidth: 3, borderWidth: 1, borderColor: COLORS.border,
  },
  serviceCardLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', marginBottom: 4 },
  serviceCardVal: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  serviceCardOrders: { color: COLORS.muted, fontSize: 10 },
  providerRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  providerRank: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  providerRankText: { color: COLORS.muted, fontSize: 12, fontWeight: '700' },
  providerEmoji: { fontSize: 22, marginLeft: 8 },
  providerName: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  providerRole: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  providerRevenue: { color: COLORS.accent, fontSize: 15, fontWeight: '800' },
});
