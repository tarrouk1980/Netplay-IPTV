import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  accent: '#F5A623',
  accentLight: '#FFD580',
  white: '#FFFFFF',
  muted: '#8A8A9A',
  border: '#2A2A3A',
  green: '#2E7D32',
  greenLight: '#4CAF50',
  red: '#D32F2F',
};

const PERIOD_TABS = [
  { key: '7', label: '7 jours' },
  { key: '14', label: '14 jours' },
  { key: '30', label: '30 jours' },
];

// Pure RN bar chart
function EarningsBarChart({ data = [], labels = [], accentColor }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  return (
    <View style={chart.container}>
      <View style={chart.barsRow}>
        {data.map((val, i) => {
          const height = Math.max(4, Math.round((val / max) * 100));
          return (
            <View key={i} style={chart.barWrapper}>
              <Text style={chart.barValue}>{val > 0 ? val.toFixed(0) : ''}</Text>
              <View style={[chart.bar, { height, backgroundColor: accentColor }]} />
              <Text style={chart.barLabel}>{labels[i] ? labels[i].slice(5) : ''}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const chart = StyleSheet.create({
  container: { paddingHorizontal: 4 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 130 },
  barWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 2 },
  bar: { width: '80%', borderRadius: 4 },
  barValue: { color: '#FFFFFF', fontSize: 8, marginBottom: 3, textAlign: 'center' },
  barLabel: { color: '#8A8A9A', fontSize: 8, marginTop: 4, textAlign: 'center' },
});

function KPITile({ label, value, sub, color }) {
  return (
    <View style={[kpi.tile, { borderTopColor: color }]}>
      <Text style={kpi.value}>{value}</Text>
      <Text style={kpi.label}>{label}</Text>
      {sub ? <Text style={kpi.sub}>{sub}</Text> : null}
    </View>
  );
}

const kpi = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    padding: 14,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: '#2A2A3A',
    alignItems: 'center',
    margin: 5,
  },
  value: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  label: { color: '#8A8A9A', fontSize: 11, fontWeight: '500', textAlign: 'center' },
  sub: { color: '#F5A623', fontSize: 10, marginTop: 3, textAlign: 'center' },
});

const MOCK_DATA = {
  '7': {
    totalTND: 42.5,
    ordersCompleted: 8,
    avgPerOrder: 5.3,
    chart: {
      labels: ['2026-05-25', '2026-05-26', '2026-05-27', '2026-05-28', '2026-05-29', '2026-05-30', '2026-05-31'],
      data: [4, 8, 5, 10, 6, 7, 2.5],
    },
    topDay: { date: '2026-05-28', amount: 10 },
    byHour: [0, 0, 0, 0, 0, 0, 1, 3, 4, 2, 1, 2, 3, 2, 1, 2, 4, 5, 3, 1, 0, 0, 0, 0],
  },
  '14': {
    totalTND: 89,
    ordersCompleted: 17,
    avgPerOrder: 5.2,
    chart: {
      labels: Array.from({ length: 14 }, (_, i) => {
        const d = new Date(Date.now() - (13 - i) * 86400000);
        return d.toISOString().slice(0, 10);
      }),
      data: [3, 5, 4, 8, 6, 7, 4, 5, 8, 5, 7, 10, 6, 11],
    },
    topDay: { date: '2026-05-31', amount: 11 },
    byHour: [0, 0, 0, 0, 0, 0, 1, 3, 4, 2, 1, 2, 3, 2, 1, 2, 4, 5, 3, 1, 0, 0, 0, 0],
  },
  '30': {
    totalTND: 182,
    ordersCompleted: 35,
    avgPerOrder: 5.2,
    chart: {
      labels: Array.from({ length: 30 }, (_, i) => {
        const d = new Date(Date.now() - (29 - i) * 86400000);
        return d.toISOString().slice(0, 10);
      }),
      data: Array.from({ length: 30 }, () => Math.round(Math.random() * 12)),
    },
    topDay: { date: '2026-05-20', amount: 12 },
    byHour: [0, 0, 0, 0, 0, 0, 1, 3, 4, 2, 1, 2, 3, 2, 1, 2, 4, 5, 3, 1, 0, 0, 0, 0],
  },
};

// Simplified hour bar (horizontal)
function HourBars({ data = [] }) {
  const max = Math.max(...data, 1);
  const PEAKS = [7, 8, 9, 12, 17, 18, 19, 20];
  return (
    <View style={hourStyles.container}>
      <Text style={hourStyles.title}>Activité par heure</Text>
      {data.map((val, hour) => {
        const pct = val / max;
        const isPeak = PEAKS.includes(hour);
        return (
          <View key={hour} style={hourStyles.row}>
            <Text style={hourStyles.hourLabel}>{String(hour).padStart(2, '0')}h</Text>
            <View style={hourStyles.barBg}>
              <View style={[hourStyles.barFill, { width: `${Math.max(2, pct * 100)}%`, backgroundColor: isPeak ? COLORS.accent : COLORS.muted + '55' }]} />
            </View>
            <Text style={hourStyles.valLabel}>{val > 0 ? val : ''}</Text>
          </View>
        );
      })}
    </View>
  );
}

const hourStyles = StyleSheet.create({
  container: { marginTop: 4 },
  title: { color: COLORS.muted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8 },
  hourLabel: { color: COLORS.muted, fontSize: 10, width: 26, textAlign: 'right' },
  barBg: { flex: 1, height: 8, backgroundColor: '#16161F', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  valLabel: { color: COLORS.muted, fontSize: 10, width: 16, textAlign: 'right' },
});

export default function ProviderEarningsScreen({ navigation }) {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState('14');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.get(`/api/provider/earnings?days=${period}`);
      setData(res.data);
    } catch {
      setData(MOCK_DATA[period]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const roleLabel = {
    CHAUFFEUR: 'Chauffeur',
    LIVREUR: 'Livreur',
    DEPANNEUR: 'Dépanneur',
  }[user?.role] || 'Prestataire';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>💰 Mes Gains</Text>
          <Text style={styles.headerSub}>{roleLabel} · {user?.name || ''}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Period tabs */}
      <View style={styles.tabs}>
        {PERIOD_TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, period === tab.key && styles.tabActive]}
            onPress={() => setPeriod(tab.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, period === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 50 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.accent} />}
        >
          {/* KPI tiles */}
          <View style={styles.kpiRow}>
            <KPITile
              label="Gains totaux"
              value={`${(data?.totalTND ?? 0).toFixed(1)} TND`}
              sub={`${period} derniers jours`}
              color={COLORS.accent}
            />
            <KPITile
              label="Courses"
              value={data?.ordersCompleted ?? 0}
              sub="complétées"
              color={COLORS.greenLight}
            />
          </View>
          <View style={styles.kpiRow}>
            <KPITile
              label="Gain moyen"
              value={`${(data?.avgPerOrder ?? 0).toFixed(1)} TND`}
              sub="par course"
              color="#1565C0"
            />
            <KPITile
              label="Meilleur jour"
              value={`${(data?.topDay?.amount ?? 0).toFixed(1)} TND`}
              sub={data?.topDay?.date ? data.topDay.date.slice(5) : '—'}
              color={COLORS.accent}
            />
          </View>

          {/* Bar chart */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gains journaliers (TND)</Text>
            <EarningsBarChart
              data={data?.chart?.data || []}
              labels={data?.chart?.labels || []}
              accentColor={COLORS.accent}
            />
          </View>

          {/* Hour activity */}
          {data?.byHour && (
            <View style={styles.card}>
              <HourBars data={data.byHour} />
              <Text style={styles.peakNote}>
                🕐 Heures de pointe : 7h–9h et 17h–20h
              </Text>
            </View>
          )}

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Conseils pour maximiser vos gains</Text>
            <Text style={styles.tip}>• Connectez-vous pendant les heures de pointe (7h–9h, 17h–20h)</Text>
            <Text style={styles.tip}>• Maintenez une note ≥ 4.5 pour apparaître en priorité</Text>
            <Text style={styles.tip}>• Acceptez rapidement les demandes — 30 secondes max</Text>
            <Text style={styles.tip}>• Gardez votre wallet rechargé pour ne pas perdre de courses</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 30, color: COLORS.white, lineHeight: 30 },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  headerSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent },
  tabText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: COLORS.accentLight, fontWeight: '700' },
  scroll: { flex: 1 },
  kpiRow: { flexDirection: 'row', paddingHorizontal: 10, marginTop: 4 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    margin: 16,
    marginTop: 4,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },
  peakNote: { color: COLORS.muted, fontSize: 11, marginTop: 12, textAlign: 'center', fontStyle: 'italic' },
  tipsCard: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 16,
    margin: 16,
    marginTop: 4,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  tipsTitle: { color: COLORS.accentLight, fontSize: 13, fontWeight: '700', marginBottom: 10 },
  tip: { color: COLORS.muted, fontSize: 12, lineHeight: 20 },
});
