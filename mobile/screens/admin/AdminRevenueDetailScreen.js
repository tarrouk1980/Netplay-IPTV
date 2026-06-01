import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  orange: '#F57C00',
  green: '#27AE60',
  accent: '#D32F2F',
  blue: '#1565C0',
};

const SERVICE_CONFIG = {
  TAXI: { icon: '🚕', color: COLORS.orange, label: 'Taxi' },
  DELIVERY: { icon: '🛵', color: COLORS.green, label: 'Livraison' },
  SOS: { icon: '🛻', color: COLORS.accent, label: 'SOS' },
  GROCERY: { icon: '🛒', color: '#00838F', label: 'Épicerie' },
};

const PERIODS = ['7j', '30j', '90j', '1an'];

const MOCK = {
  totalRevenue: 18450,
  totalOrders: 1243,
  avgOrderValue: 14.8,
  growthPct: 12.4,
  byService: [
    { type: 'TAXI', revenue: 9800, orders: 680, pct: 53 },
    { type: 'DELIVERY', revenue: 4300, orders: 390, pct: 23 },
    { type: 'SOS', revenue: 3200, orders: 112, pct: 17 },
    { type: 'GROCERY', revenue: 1150, orders: 61, pct: 7 },
  ],
  daily: [820, 940, 700, 1100, 850, 920, 1080, 760, 990, 870, 1050, 1200, 880, 960],
  topProviders: [
    { name: 'Karim Ben Ali', role: 'CHAUFFEUR', revenue: 1240, trips: 88 },
    { name: 'Mohamed Saidi', role: 'DEPANNEUR', revenue: 980, trips: 32 },
    { name: 'Sami Triki', role: 'LIVREUR', revenue: 760, trips: 145 },
  ],
};

function MiniBarChart({ data, color }) {
  const max = Math.max(...data, 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 50, gap: 2 }}>
      {data.map((v, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: (v / max) * 50,
            backgroundColor: i === data.length - 1 ? color : color + '55',
            borderRadius: 2,
          }}
        />
      ))}
    </View>
  );
}

export default function AdminRevenueDetailScreen({ navigation }) {
  const [period, setPeriod] = useState('30j');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/revenue/detail?period=${period}`);
      setData(res.data);
    } catch {
      setData(MOCK);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.orange} size="large" /></View>;

  const d = data || MOCK;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>💰 Revenus détaillés</Text>
      </View>

      {/* Period tabs */}
      <View style={s.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[s.periodTab, period === p && s.periodTabActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[s.periodTxt, period === p && s.periodTxtActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* KPI row */}
        <View style={s.kpiRow}>
          <View style={s.kpiCard}>
            <Text style={[s.kpiVal, { color: COLORS.green }]}>{d.totalRevenue?.toFixed(0)} TND</Text>
            <Text style={s.kpiLbl}>Revenu total</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={[s.kpiVal, { color: COLORS.orange }]}>{d.totalOrders}</Text>
            <Text style={s.kpiLbl}>Commandes</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={[s.kpiVal, { color: COLORS.blue }]}>{d.avgOrderValue?.toFixed(1)} TND</Text>
            <Text style={s.kpiLbl}>Panier moyen</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={[s.kpiVal, { color: d.growthPct >= 0 ? COLORS.green : COLORS.accent }]}>
              {d.growthPct >= 0 ? '+' : ''}{d.growthPct?.toFixed(1)}%
            </Text>
            <Text style={s.kpiLbl}>Croissance</Text>
          </View>
        </View>

        {/* Trend chart */}
        <View style={s.chartCard}>
          <Text style={s.sectionTitle}>Tendance quotidienne</Text>
          <MiniBarChart data={d.daily || []} color={COLORS.orange} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={s.chartLabel}>Début</Text>
            <Text style={[s.chartLabel, { color: COLORS.orange }]}>Aujourd'hui</Text>
          </View>
        </View>

        {/* By service */}
        <Text style={s.sectionTitle}>Par service</Text>
        {(d.byService || []).map((svc) => {
          const cfg = SERVICE_CONFIG[svc.type] || SERVICE_CONFIG.TAXI;
          return (
            <View key={svc.type} style={s.svcCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 20 }}>{cfg.icon}</Text>
                <Text style={[s.svcLabel, { marginLeft: 8 }]}>{cfg.label}</Text>
                <View style={{ flex: 1 }} />
                <Text style={[s.svcRevenue, { color: cfg.color }]}>{svc.revenue?.toFixed(0)} TND</Text>
              </View>
              <View style={s.svcBar}>
                <View style={[s.svcBarFill, { width: `${svc.pct}%`, backgroundColor: cfg.color }]} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={s.svcMeta}>{svc.orders} commandes</Text>
                <Text style={[s.svcMeta, { color: cfg.color }]}>{svc.pct}% du total</Text>
              </View>
            </View>
          );
        })}

        {/* Top providers */}
        <Text style={s.sectionTitle}>Top prestataires</Text>
        {(d.topProviders || []).map((p, i) => (
          <View key={p.name} style={s.providerRow}>
            <Text style={[s.rank, { color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : COLORS.orange }]}>
              {['🥇', '🥈', '🥉'][i] || `#${i + 1}`}
            </Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={s.providerName}>{p.name}</Text>
              <Text style={s.providerMeta}>{p.trips} courses</Text>
            </View>
            <Text style={[s.providerRevenue, { color: COLORS.green }]}>{p.revenue} TND</Text>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', flex: 1 },
  periodRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  periodTab: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  periodTabActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orange + '22' },
  periodTxt: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  periodTxtActive: { color: COLORS.orange },
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  kpiCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  kpiVal: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  kpiLbl: { color: COLORS.muted, fontSize: 9, textAlign: 'center' },
  chartCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  chartLabel: { color: COLORS.muted, fontSize: 10 },
  svcCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  svcLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  svcRevenue: { fontSize: 14, fontWeight: '700' },
  svcBar: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  svcBarFill: { height: '100%', borderRadius: 3 },
  svcMeta: { color: COLORS.muted, fontSize: 11 },
  providerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  rank: { fontSize: 18, fontWeight: '800' },
  providerName: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  providerMeta: { color: COLORS.muted, fontSize: 11 },
  providerRevenue: { fontSize: 14, fontWeight: '700' },
});
