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
  totalRevenue: 142850.750,
  growthMonth: 18.4,
  avgPerDay: 4761.700,
  services: [
    { name: 'Taxi', revenue: 68400.000, pct: 47.9, color: COLORS.accent, icon: '🚕' },
    { name: 'Livraison', revenue: 41250.500, pct: 28.9, color: COLORS.blue, icon: '📦' },
    { name: 'Épicerie', revenue: 22100.250, pct: 15.5, color: COLORS.green, icon: '🛒' },
    { name: 'SOS Dépannage', revenue: 11100.000, pct: 7.8, color: COLORS.red, icon: '🔧' },
  ],
  monthly: [
    { month: 'Jan', val: 85000 }, { month: 'Fév', val: 92000 },
    { month: 'Mar', val: 108000 }, { month: 'Avr', val: 115000 },
    { month: 'Mai', val: 128000 }, { month: 'Jun', val: 142850 },
  ],
  topMerchants: [
    { name: 'Restaurant El Bey', revenue: 12400.000, orders: 310 },
    { name: 'Carrefour La Marsa', revenue: 9800.500, orders: 245 },
    { name: 'Pizza Palace', revenue: 8200.000, orders: 410 },
  ],
};

export default function AdminRevenueChartScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    api.get('/api/admin/revenue/chart')
      .then(r => setData(r.data || MOCK))
      .catch(() => setData(MOCK))
      .finally(() => setLoading(false));
  }, []);

  const maxMonthly = data ? Math.max(...data.monthly.map(m => m.val)) : 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📈 Revenus plateforme</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

          <View style={styles.heroRow}>
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>Revenus totaux</Text>
              <Text style={styles.heroVal}>{(data.totalRevenue / 1000).toFixed(1)}k TND</Text>
              <Text style={[styles.heroGrowth, { color: COLORS.green }]}>▲ +{data.growthMonth}% ce mois</Text>
            </View>
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>Moyenne / jour</Text>
              <Text style={[styles.heroVal, { fontSize: 22 }]}>{data.avgPerDay.toFixed(0)}</Text>
              <Text style={styles.heroSub}>TND / jour</Text>
            </View>
          </View>

          <View style={styles.periodRow}>
            {['week', 'month', 'year'].map(p => (
              <TouchableOpacity key={p} style={[styles.periodBtn, period === p && styles.periodBtnActive]} onPress={() => setPeriod(p)}>
                <Text style={[styles.periodText, period === p && { color: COLORS.accent }]}>
                  {p === 'week' ? '7j' : p === 'month' ? '6 mois' : 'Année'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>ÉVOLUTION 6 MOIS</Text>
          <View style={styles.chartCard}>
            <View style={styles.chart}>
              {data.monthly.map((m, i) => {
                const h = Math.round((m.val / maxMonthly) * 100);
                const isLast = i === data.monthly.length - 1;
                return (
                  <View key={m.month} style={styles.barCol}>
                    <Text style={[styles.barValLabel, isLast && { color: COLORS.accent }]}>
                      {isLast ? `${(m.val / 1000).toFixed(0)}k` : ''}
                    </Text>
                    <View style={[styles.bar, { height: `${h}%`, backgroundColor: isLast ? COLORS.accent : COLORS.blue + '60' }]} />
                    <Text style={styles.barMonthLabel}>{m.month}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <Text style={styles.sectionTitle}>RÉPARTITION PAR SERVICE</Text>
          {data.services.map(s => (
            <View key={s.name} style={styles.serviceRow}>
              <Text style={{ fontSize: 20, width: 32 }}>{s.icon}</Text>
              <View style={{ flex: 1 }}>
                <View style={styles.serviceBarBg}>
                  <View style={[styles.serviceBarFill, { width: `${s.pct}%`, backgroundColor: s.color }]} />
                </View>
              </View>
              <Text style={styles.servicePct}>{s.pct}%</Text>
              <Text style={styles.serviceRevenue}>{(s.revenue / 1000).toFixed(1)}k</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>TOP MARCHANDS</Text>
          {data.topMerchants.map((m, i) => (
            <View key={m.name} style={styles.merchantRow}>
              <View style={[styles.rankBadge, i === 0 && { backgroundColor: COLORS.accent + '30' }]}>
                <Text style={[styles.rankText, i === 0 && { color: COLORS.accent }]}>#{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.merchantName}>{m.name}</Text>
                <Text style={styles.merchantOrders}>{m.orders} commandes</Text>
              </View>
              <Text style={styles.merchantRevenue}>{m.revenue.toFixed(0)} TND</Text>
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
  heroRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  heroCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  heroLabel: { color: COLORS.muted, fontSize: 11, marginBottom: 6 },
  heroVal: { color: COLORS.text, fontSize: 26, fontWeight: '900', marginBottom: 4 },
  heroGrowth: { fontSize: 12, fontWeight: '700' },
  heroSub: { color: COLORS.muted, fontSize: 11 },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  periodBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  periodBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  periodText: { color: COLORS.muted, fontSize: 12, fontWeight: '700' },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  chartCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 6 },
  barCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barValLabel: { color: COLORS.muted, fontSize: 9, marginBottom: 2 },
  bar: { width: '100%', borderRadius: 4, minHeight: 4 },
  barMonthLabel: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  serviceBarBg: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  serviceBarFill: { height: 8, borderRadius: 4 },
  servicePct: { color: COLORS.muted, fontSize: 12, width: 36, textAlign: 'right' },
  serviceRevenue: { color: COLORS.text, fontSize: 13, fontWeight: '800', width: 48, textAlign: 'right' },
  merchantRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rankBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  rankText: { color: COLORS.muted, fontSize: 12, fontWeight: '900' },
  merchantName: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  merchantOrders: { color: COLORS.muted, fontSize: 11 },
  merchantRevenue: { color: COLORS.green, fontSize: 14, fontWeight: '900' },
});
