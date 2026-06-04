import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const PERIODS = ['7j', '30j', '90j'];

const MOCK = {
  revenue: [320, 450, 280, 510, 390, 620, 480],
  orders: [22, 31, 19, 35, 27, 44, 33],
  topItems: [
    { name: 'Kafteji', revenue: 840, orders: 84 },
    { name: 'Sandwich Tunisien', revenue: 720, orders: 96 },
    { name: 'Lablabi', revenue: 530, orders: 106 },
    { name: 'Couscous', revenue: 480, orders: 48 },
    { name: 'Brik', revenue: 310, orders: 124 },
  ],
  summary: { totalRevenue: 3050, avgOrderValue: 31.75, cancelRate: 4.2, repeatRate: 61 },
  days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
};

function MiniBar({ value, maxValue, color }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 60 }}>
      <View style={{
        width: '70%', borderRadius: 3,
        height: Math.max(3, (value / maxValue) * 56),
        backgroundColor: color,
      }} />
    </View>
  );
}

export default function MerchantAnalyticsScreen({ navigation }) {
  const [period, setPeriod] = useState('7j');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('revenue');

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/merchant/analytics?period=' + period)
      .then(r => setData(r.data || MOCK))
      .catch(() => setData(MOCK))
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const d = data || MOCK;
  const chartData = tab === 'revenue' ? d.revenue : d.orders;
  const maxVal = Math.max(...chartData, 1);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📊 Analytiques</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.periodRow}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p} style={[styles.periodBtn, period === p && styles.periodBtnActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryGrid}>
            {[
              { label: 'CA total', value: d.summary.totalRevenue + ' TND', color: COLORS.accent },
              { label: 'Panier moy.', value: d.summary.avgOrderValue + ' TND' },
              { label: 'Taux annulation', value: d.summary.cancelRate + '%', color: COLORS.red },
              { label: 'Clients fidèles', value: d.summary.repeatRate + '%', color: COLORS.green },
            ].map((s, i) => (
              <View key={i} style={styles.summaryCard}>
                <Text style={[styles.summaryValue, s.color && { color: s.color }]}>{s.value}</Text>
                <Text style={styles.summaryLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tabBtn, tab === 'revenue' && styles.tabBtnActive]}
                onPress={() => setTab('revenue')}
              >
                <Text style={[styles.tabText, tab === 'revenue' && styles.tabTextActive]}>CA (TND)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, tab === 'orders' && styles.tabBtnActive]}
                onPress={() => setTab('orders')}
              >
                <Text style={[styles.tabText, tab === 'orders' && styles.tabTextActive]}>Commandes</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chartArea}>
              {chartData.map((v, i) => (
                <MiniBar key={i} value={v} maxValue={maxVal}
                  color={tab === 'revenue' ? COLORS.accent : COLORS.blue} />
              ))}
            </View>
            <View style={styles.chartLabels}>
              {d.days.map((day, i) => (
                <Text key={i} style={styles.chartLabel}>{day}</Text>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>TOP ARTICLES</Text>
            {d.topItems.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={[styles.rank, i === 0 && { backgroundColor: COLORS.accent }]}>
                  <Text style={[styles.rankText, i === 0 && { color: '#000' }]}>#{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSub}>{item.orders} commandes</Text>
                </View>
                <Text style={styles.itemRevenue}>{item.revenue} TND</Text>
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
  backBtn: { padding: 4 },
  backText: { color: COLORS.accent, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  periodRow: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 0 },
  periodBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 8, alignItems: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  periodBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  periodText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  periodTextActive: { color: COLORS.accent },
  scroll: { padding: 16 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  summaryCard: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  summaryValue: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  summaryLabel: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tabBtn: {
    flex: 1, borderRadius: 8, paddingVertical: 7, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  tabBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  tabText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: COLORS.accent },
  chartArea: { flexDirection: 'row', height: 60, alignItems: 'flex-end', marginBottom: 4 },
  chartLabels: { flexDirection: 'row' },
  chartLabel: { flex: 1, color: COLORS.muted, fontSize: 9, textAlign: 'center' },
  cardTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  rank: {
    width: 24, height: 24, borderRadius: 8, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  rankText: { color: COLORS.muted, fontSize: 11, fontWeight: '800' },
  itemName: { color: COLORS.text, fontSize: 14 },
  itemSub: { color: COLORS.muted, fontSize: 11 },
  itemRevenue: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
});
