import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  green: '#27AE60',
  orange: '#F57C00',
  accent: '#D32F2F',
  gold: '#F5A623',
};

const PERIODS = [
  { key: 'today', label: "Auj." },
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
  { key: 'year', label: 'Année' },
];

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? value / max : 0;
  return (
    <View style={{ height: 6, backgroundColor: COLORS.surfaceAlt, borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
      <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: color || COLORS.green, borderRadius: 3 }} />
    </View>
  );
}

function WeeklyChart({ data }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 70, gap: 4, paddingTop: 8 }}>
      {data.map((d, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
          <View style={{
            width: '75%',
            height: Math.max(3, (d.value / max) * 60),
            backgroundColor: d.isToday ? COLORS.gold : COLORS.green,
            borderRadius: 3,
          }} />
          <Text style={{ color: d.isToday ? COLORS.gold : COLORS.muted, fontSize: 9, marginTop: 3 }}>{d.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function ProviderEarningsDashboardScreen({ navigation }) {
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/provider/earnings-summary?period=${period}`);
      setData(res.data);
    } catch {
      setData({
        totalRevenue: 0,
        totalOrders: 0,
        totalTips: 0,
        avgPerOrder: 0,
        hoursOnline: 0,
        conversionRate: 0,
        goalProgress: 0,
        goalAmount: 100,
        weeklyChart: [],
        topHours: [],
        recentOrders: [],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const exportCSV = async () => {
    if (!data?.recentOrders?.length) return;
    setExporting(true);
    try {
      const header = 'ID,Date,Montant,Pourboire,Statut\n';
      const rows = data.recentOrders.map((o) =>
        `${o.id},${o.createdAt},${o.price || 0},${o.tip || 0},${o.status}`
      ).join('\n');
      const uri = FileSystem.documentDirectory + 'revenus.csv';
      await FileSystem.writeAsStringAsync(uri, header + rows, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Exporter les revenus' });
    } catch { /* ignore */ } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={COLORS.green} size="large" />
      </View>
    );
  }

  const goalPct = data?.goalAmount > 0 ? Math.min(1, (data.totalRevenue || 0) / data.goalAmount) : 0;
  const dayLabels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  const todayIdx = new Date().getDay();
  const chartData = data?.weeklyChart?.map((d, i) => ({ ...d, isToday: d.label === dayLabels[todayIdx] })) || [];

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>💰 Tableau des revenus</Text>
        <TouchableOpacity onPress={exportCSV} disabled={exporting}>
          {exporting ? <ActivityIndicator color={COLORS.green} size="small" /> : <Text style={s.csvBtn}>CSV</Text>}
        </TouchableOpacity>
      </View>

      {/* Period tabs */}
      <View style={s.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity key={p.key} style={[s.tab, period === p.key && s.tabActive]} onPress={() => setPeriod(p.key)}>
            <Text style={[s.tabTxt, period === p.key && s.tabTxtActive]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.green} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Main revenue card */}
        <View style={s.mainCard}>
          <Text style={s.mainLabel}>Revenus totaux</Text>
          <Text style={s.mainValue}>{(data?.totalRevenue || 0).toFixed(3)} TND</Text>
          {data?.totalTips > 0 && (
            <Text style={s.tipsLine}>dont {data.totalTips.toFixed(3)} TND de pourboires 🎁</Text>
          )}

          {/* Goal progress */}
          {data?.goalAmount > 0 && (
            <View style={s.goalSection}>
              <View style={s.goalHeader}>
                <Text style={s.goalLabel}>Objectif : {data.goalAmount} TND</Text>
                <Text style={[s.goalPct, { color: goalPct >= 1 ? COLORS.gold : COLORS.green }]}>
                  {(goalPct * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={s.goalTrack}>
                <View style={[s.goalFill, { width: `${goalPct * 100}%` }]} />
              </View>
            </View>
          )}
        </View>

        {/* KPI grid */}
        <View style={s.kpiGrid}>
          {[
            { label: 'Courses', value: data?.totalOrders ?? 0 },
            { label: 'Moy/course', value: `${(data?.avgPerOrder || 0).toFixed(2)} TND`, color: COLORS.green },
            { label: 'Heures en ligne', value: `${(data?.hoursOnline || 0).toFixed(1)}h`, color: COLORS.orange },
            { label: 'Taux accept.', value: `${(data?.conversionRate || 0).toFixed(0)}%`, color: COLORS.gold },
          ].map((k, i) => (
            <View key={i} style={s.kpiCard}>
              <Text style={[s.kpiValue, { color: k.color || COLORS.text }]}>{k.value}</Text>
              <Text style={s.kpiLabel}>{k.label}</Text>
            </View>
          ))}
        </View>

        {/* Weekly chart */}
        {chartData.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Évolution de la semaine</Text>
            <WeeklyChart data={chartData} />
          </View>
        )}

        {/* Top hours */}
        {data?.topHours?.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>⏰ Meilleures heures</Text>
            {data.topHours.slice(0, 5).map((h, i) => {
              const max = data.topHours[0]?.revenue || 1;
              return (
                <View key={i} style={s.hourRow}>
                  <Text style={s.hourLabel}>{h.hour}h — {(parseInt(h.hour) + 1)}h</Text>
                  <View style={{ flex: 1, marginHorizontal: 10 }}>
                    <MiniBar value={h.revenue} max={max} color={COLORS.gold} />
                  </View>
                  <Text style={s.hourRevenue}>{(h.revenue || 0).toFixed(1)} TND</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Recent orders */}
        {data?.recentOrders?.length > 0 && (
          <View style={{ marginHorizontal: 16 }}>
            <Text style={s.sectionTitle}>Courses récentes</Text>
            {data.recentOrders.slice(0, 8).map((order) => (
              <View key={order.id} style={s.orderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.orderClient}>{order.client?.name || 'Client'}</Text>
                  <Text style={s.orderDate}>
                    {new Date(order.createdAt).toLocaleString('fr-TN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.orderAmount}>{parseFloat(order.price || 0).toFixed(3)} TND</Text>
                  {order.tip > 0 && <Text style={s.orderTip}>+{parseFloat(order.tip).toFixed(3)} 🎁</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Links */}
        <View style={s.linksRow}>
          <TouchableOpacity style={s.linkBtn} onPress={() => navigation.navigate('EarningsGoal')}>
            <Text style={s.linkBtnTxt}>🎯 Modifier l'objectif</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.linkBtn} onPress={() => navigation.navigate('ProviderReviews')}>
            <Text style={s.linkBtnTxt}>⭐ Mes avis</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 17, fontWeight: '700', flex: 1 },
  csvBtn: { color: COLORS.green, fontSize: 13, fontWeight: '700', borderWidth: 1, borderColor: COLORS.green, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  periodRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  tabActive: { borderColor: COLORS.green, backgroundColor: COLORS.green + '22' },
  tabTxt: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  tabTxtActive: { color: COLORS.green },
  mainCard: { backgroundColor: COLORS.surface, borderRadius: 16, marginHorizontal: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  mainLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 4 },
  mainValue: { color: COLORS.green, fontSize: 36, fontWeight: '900', marginBottom: 4 },
  tipsLine: { color: COLORS.orange, fontSize: 12, marginBottom: 12 },
  goalSection: { marginTop: 8 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  goalLabel: { color: COLORS.muted, fontSize: 12 },
  goalPct: { fontSize: 12, fontWeight: '700' },
  goalTrack: { height: 8, backgroundColor: COLORS.surfaceAlt, borderRadius: 4, overflow: 'hidden' },
  goalFill: { height: '100%', backgroundColor: COLORS.green, borderRadius: 4 },
  kpiGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  kpiCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  kpiValue: { color: COLORS.text, fontSize: 14, fontWeight: '800', marginBottom: 4 },
  kpiLabel: { color: COLORS.muted, fontSize: 9, textAlign: 'center' },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, marginHorizontal: 16, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  cardTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  hourRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  hourLabel: { color: COLORS.muted, fontSize: 12, width: 70 },
  hourRevenue: { color: COLORS.gold, fontSize: 12, fontWeight: '700', width: 56, textAlign: 'right' },
  sectionTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  orderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  orderClient: { color: COLORS.text, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  orderDate: { color: COLORS.muted, fontSize: 11 },
  orderAmount: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  orderTip: { color: COLORS.orange, fontSize: 11 },
  linksRow: { flexDirection: 'row', marginHorizontal: 16, gap: 10, marginTop: 16 },
  linkBtn: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  linkBtnTxt: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
});
