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
  blue: '#1565C0',
};

const PERIODS = [
  { key: 'today', label: "Aujourd'hui" },
  { key: 'week', label: 'Cette semaine' },
  { key: 'month', label: 'Ce mois' },
];

function BarChart({ data, maxVal, color }) {
  if (!data || data.length === 0) return null;
  const max = maxVal || Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 4, marginVertical: 8 }}>
      {data.map((d, i) => {
        const pct = max > 0 ? d.value / max : 0;
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
            <View
              style={{
                width: '80%',
                height: Math.max(4, pct * 70),
                backgroundColor: color || COLORS.green,
                borderRadius: 3,
              }}
            />
            <Text style={{ color: COLORS.muted, fontSize: 8, marginTop: 3 }}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <View style={s.statCard}>
      <Text style={[s.statValue, { color: color || COLORS.text }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
      {sub ? <Text style={s.statSub}>{sub}</Text> : null}
    </View>
  );
}

export default function LivreurEarningsScreen({ navigation }) {
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/livreur/earnings?period=${period}`);
      setData(res.data);
    } catch {
      // mock
      const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
      setData({
        totalRevenue: 0,
        totalDeliveries: 0,
        totalTips: 0,
        avgPerDelivery: 0,
        chart: days.map((l) => ({ label: l, value: 0 })),
        orders: [],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const exportCSV = async () => {
    if (!data?.orders?.length) return;
    setExporting(true);
    try {
      const header = 'ID,Date,Client,Montant,Pourboire,Statut\n';
      const rows = data.orders.map((o) =>
        `${o.id},${o.createdAt},${o.client?.name || ''},${o.price || 0},${o.tip || 0},${o.status}`
      ).join('\n');
      const uri = FileSystem.documentDirectory + 'livreur_gains.csv';
      await FileSystem.writeAsStringAsync(uri, header + rows, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Exporter les gains' });
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

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>💰 Mes gains</Text>
        <TouchableOpacity onPress={exportCSV} disabled={exporting}>
          {exporting ? (
            <ActivityIndicator color={COLORS.green} size="small" />
          ) : (
            <Text style={s.exportBtn}>CSV</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Period selector */}
      <View style={s.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[s.periodBtn, period === p.key && s.periodActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[s.periodTxt, period === p.key && s.periodActiveTxt]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.green} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* KPI cards */}
        <View style={s.kpiRow}>
          <StatCard label="Total gains" value={`${(data?.totalRevenue || 0).toFixed(3)} TND`} color={COLORS.green} />
          <StatCard label="Livraisons" value={data?.totalDeliveries || 0} />
          <StatCard label="Pourboires" value={`${(data?.totalTips || 0).toFixed(3)} TND`} color={COLORS.orange} />
          <StatCard label="Moy/livraison" value={`${(data?.avgPerDelivery || 0).toFixed(3)} TND`} />
        </View>

        {/* Bar chart */}
        {data?.chart?.length > 0 && (
          <View style={s.chartCard}>
            <Text style={s.cardTitle}>Évolution des gains</Text>
            <BarChart data={data.chart} color={COLORS.green} />
          </View>
        )}

        {/* Orders list */}
        <Text style={s.sectionTitle}>Détail des courses</Text>
        {(!data?.orders || data.orders.length === 0) ? (
          <Text style={s.emptyTxt}>Aucune course sur cette période.</Text>
        ) : (
          data.orders.map((order) => (
            <View key={order.id} style={s.orderCard}>
              <View style={{ flex: 1 }}>
                <Text style={s.orderClient}>{order.client?.name || 'Client'}</Text>
                <Text style={s.orderDate}>
                  {new Date(order.createdAt).toLocaleString('fr-TN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </Text>
                {order.metadata?.deliveryAddress ? (
                  <Text style={s.orderAddr}>📍 {order.metadata.deliveryAddress}</Text>
                ) : null}
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={s.orderAmount}>{parseFloat(order.price || 0).toFixed(3)} TND</Text>
                {order.tip > 0 && (
                  <Text style={s.orderTip}>+{parseFloat(order.tip).toFixed(3)} TND 🎁</Text>
                )}
                <View style={[s.statusBadge, { backgroundColor: order.status === 'COMPLETED' ? COLORS.green + '22' : COLORS.muted + '22' }]}>
                  <Text style={[s.statusTxt, { color: order.status === 'COMPLETED' ? COLORS.green : COLORS.muted }]}>
                    {order.status === 'COMPLETED' ? 'Livrée' : order.status}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', flex: 1 },
  exportBtn: { color: COLORS.green, fontSize: 14, fontWeight: '700', borderWidth: 1, borderColor: COLORS.green, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  periodRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  periodBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  periodActive: { borderColor: COLORS.green, backgroundColor: COLORS.green + '22' },
  periodTxt: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  periodActiveTxt: { color: COLORS.green },
  kpiRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: { color: COLORS.text, fontSize: 13, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: COLORS.muted, fontSize: 9, textAlign: 'center' },
  statSub: { color: COLORS.muted, fontSize: 9, marginTop: 2 },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  cardTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  sectionTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginHorizontal: 16, marginBottom: 8 },
  emptyTxt: { color: COLORS.muted, textAlign: 'center', fontSize: 13, marginTop: 8 },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderClient: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  orderDate: { color: COLORS.muted, fontSize: 11, marginBottom: 2 },
  orderAddr: { color: COLORS.muted, fontSize: 11 },
  orderAmount: { color: COLORS.green, fontSize: 14, fontWeight: '700' },
  orderTip: { color: COLORS.orange, fontSize: 11, fontWeight: '600' },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusTxt: { fontSize: 10, fontWeight: '700' },
});
