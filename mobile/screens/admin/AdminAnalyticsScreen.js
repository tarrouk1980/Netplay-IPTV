import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  accent: '#F5A623',
};

const SERVICE_COLORS = {
  TAXI: '#F5A623',
  SOS: '#E74C3C',
  DELIVERY: '#4A9EFF',
  GROCERY: '#27AE60',
};

const SERVICE_ICONS = { TAXI: '🚕', SOS: '🚑', DELIVERY: '🛵', GROCERY: '🛒' };

// Pure RN bar chart
function BarChart({ data = [], labels = [], color = '#F5A623', height = 120, title }) {
  const max = Math.max(...data, 1);
  return (
    <View style={bc.wrapper}>
      {title && <Text style={bc.title}>{title}</Text>}
      <View style={bc.container}>
        {data.map((val, i) => {
          const barH = Math.max(4, Math.round((val / max) * height));
          return (
            <View key={i} style={bc.col}>
              <Text style={bc.val}>{val > 0 ? (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val) : ''}</Text>
              <View style={[bc.bar, { height: barH, backgroundColor: color }]} />
              <Text style={bc.label}>{labels[i] || ''}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const bc = StyleSheet.create({
  wrapper: { marginBottom: 8 },
  title: { color: '#8E8E9A', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  container: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  col: { flex: 1, alignItems: 'center' },
  val: { color: '#8E8E9A', fontSize: 8, marginBottom: 2 },
  bar: { width: '80%', borderRadius: 3 },
  label: { color: '#4A4A5A', fontSize: 8, marginTop: 4 },
});

// Horizontal bar for service breakdown
function ServiceBar({ item, maxRevenue }) {
  const pct = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
  return (
    <View style={styles.serviceRow}>
      <Text style={styles.serviceIcon}>{SERVICE_ICONS[item.type]}</Text>
      <View style={{ flex: 1 }}>
        <View style={styles.serviceBarTrack}>
          <View style={[styles.serviceBarFill, { width: `${pct}%`, backgroundColor: SERVICE_COLORS[item.type] }]} />
        </View>
        <View style={styles.serviceRowMeta}>
          <Text style={styles.serviceType}>{item.type}</Text>
          <Text style={styles.serviceStats}>{item.count} courses · {item.percent}%</Text>
        </View>
      </View>
      <Text style={[styles.serviceRevenue, { color: SERVICE_COLORS[item.type] }]}>
        {item.revenue.toFixed(1)} TND
      </Text>
    </View>
  );
}

export default function AdminAnalyticsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [revenueChart, setRevenueChart] = useState({ labels: [], data: [] });
  const [activeUsers, setActiveUsers] = useState({ labels: [], data: [] });
  const [byService, setByService] = useState({ services: [], total: 0 });
  const [topProviders, setTopProviders] = useState([]);
  const [period, setPeriod] = useState('30j');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rev, au, svc, top] = await Promise.all([
        api.get('/api/admin/stats/revenue-chart').catch(() => ({ data: { labels: [], data: [] } })),
        api.get('/api/admin/stats/active-users').catch(() => ({ data: { labels: [], data: [] } })),
        api.get('/api/admin/stats/revenue-by-service').catch(() => ({ data: { services: [], total: 0 } })),
        api.get('/api/admin/stats/top-providers').catch(() => ({ data: { providers: [] } })),
      ]);
      setRevenueChart(rev.data);
      setActiveUsers(au.data);
      setByService(svc.data);
      setTopProviders(top.data.providers || []);
    } finally {
      setLoading(false);
    }
  };

  // Show last 14 days of revenue chart
  const chartLabels = revenueChart.labels.slice(-14).map((l) => l.slice(5)); // MM-DD
  const chartData = revenueChart.data.slice(-14);
  const totalRevenue = revenueChart.data.reduce((s, v) => s + v, 0);
  const maxService = Math.max(...byService.services.map((s) => s.revenue), 1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📊 Analytics</Text>
        <TouchableOpacity onPress={fetchAll} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.accent} size="large" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Revenue summary */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{totalRevenue.toFixed(0)} TND</Text>
              <Text style={styles.summaryLabel}>Revenus 30j</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: '#4A9EFF' }]}>
                {activeUsers.data.reduce((s, v) => s + v, 0)}
              </Text>
              <Text style={styles.summaryLabel}>Utilisateurs actifs 14j</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: COLORS.accent }]}>
                {byService.services.reduce((s, r) => s + r.count, 0)}
              </Text>
              <Text style={styles.summaryLabel}>Courses 30j</Text>
            </View>
          </View>

          {/* Revenue chart */}
          <View style={styles.card}>
            <BarChart
              data={chartData}
              labels={chartLabels}
              color={COLORS.accent}
              height={100}
              title="Revenus (14 derniers jours) — TND"
            />
          </View>

          {/* Active users chart */}
          <View style={styles.card}>
            <BarChart
              data={activeUsers.data}
              labels={activeUsers.labels}
              color="#4A9EFF"
              height={80}
              title="Utilisateurs actifs (14 derniers jours)"
            />
          </View>

          {/* Revenue by service */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Revenus par service — 30j</Text>
            <Text style={styles.cardTotal}>Total : {byService.total.toFixed(3)} TND</Text>
            {byService.services.map((s) => (
              <ServiceBar key={s.type} item={s} maxRevenue={maxService} />
            ))}
          </View>

          {/* Top providers */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Top prestataires — 30j</Text>
            {topProviders.length === 0 ? (
              <Text style={styles.emptyText}>Aucune donnée</Text>
            ) : (
              topProviders.map((p, i) => (
                <View key={p.id || i} style={styles.providerRow}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.providerName}>{p.name || 'Prestataire'}</Text>
                    <Text style={styles.providerRole}>{p.role} · ⭐ {(p.avgRating || 0).toFixed(1)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.providerOrders}>{p.orders} courses</Text>
                    <Text style={[styles.providerRevenue, { color: COLORS.accent }]}>
                      {p.revenue.toFixed(1)} TND
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { width: 36 },
  backText: { color: COLORS.text, fontSize: 28 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  refreshBtn: { width: 36, alignItems: 'flex-end' },
  refreshText: { color: COLORS.accent, fontSize: 22 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 12 },
  summaryCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, alignItems: 'center' },
  summaryValue: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  summaryLabel: { color: COLORS.textMuted, fontSize: 10, marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.surface, marginHorizontal: 16,
    marginBottom: 12, borderRadius: 16, padding: 16,
  },
  cardTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  cardTotal: { color: COLORS.textMuted, fontSize: 12, marginBottom: 12 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  serviceIcon: { fontSize: 20 },
  serviceBarTrack: { height: 8, backgroundColor: '#12121C', borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  serviceBarFill: { height: '100%', borderRadius: 4 },
  serviceRowMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  serviceType: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  serviceStats: { color: COLORS.textMuted, fontSize: 11 },
  serviceRevenue: { fontWeight: '700', fontSize: 14 },
  providerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  rankBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.accent + '22', alignItems: 'center', justifyContent: 'center',
  },
  rankText: { color: COLORS.accent, fontWeight: '800', fontSize: 12 },
  providerName: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
  providerRole: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  providerOrders: { color: COLORS.textMuted, fontSize: 12 },
  providerRevenue: { fontWeight: '700', fontSize: 14 },
  emptyText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 12 },
});
