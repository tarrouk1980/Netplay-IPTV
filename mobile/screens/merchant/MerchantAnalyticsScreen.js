import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F', blue: '#1565C0', purple: '#8E44AD',
};

const MOCK_WEEKLY = [
  { day: 'Lun', revenue: 120, orders: 8 },
  { day: 'Mar', revenue: 85,  orders: 6 },
  { day: 'Mer', revenue: 200, orders: 14 },
  { day: 'Jeu', revenue: 155, orders: 11 },
  { day: 'Ven', revenue: 310, orders: 22 },
  { day: 'Sam', revenue: 420, orders: 30 },
  { day: 'Dim', revenue: 280, orders: 20 },
];

const MOCK_TOP = [
  { name: 'Pizza Margherita', sold: 42, revenue: 294, emoji: '🍕' },
  { name: 'Poulet rôti 1/2', sold: 38, revenue: 304, emoji: '🍗' },
  { name: 'Coca-Cola 1.5L', sold: 35, revenue: 87.5, emoji: '🥤' },
  { name: 'Burger Spécial', sold: 29, revenue: 319, emoji: '🍔' },
  { name: 'Salade César', sold: 24, revenue: 216, emoji: '🥗' },
];

const MAX_REV = Math.max(...MOCK_WEEKLY.map(d => d.revenue));

export default function MerchantAnalyticsScreen({ navigation }) {
  const [stats, setStats] = useState({ revenue: 1570, orders: 111, avgOrder: 14.1, rating: 4.8 });
  const [weekly, setWeekly] = useState(MOCK_WEEKLY);
  const [topProducts, setTopProducts] = useState(MOCK_TOP);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/merchant/analytics?period=${period}`);
        if (res.data?.stats) setStats(res.data.stats);
        if (res.data?.weekly) setWeekly(res.data.weekly);
        if (res.data?.topProducts) setTopProducts(res.data.topProducts);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, [period]);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📊 Analytiques</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Period selector */}
      <View style={styles.periodRow}>
        {[{ key: 'week', label: '7 jours' }, { key: 'month', label: '30 jours' }, { key: 'year', label: '12 mois' }].map(p => (
          <TouchableOpacity
            key={p.key}
            style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[styles.periodText, period === p.key && { color: '#000' }]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* KPIs */}
        <View style={styles.kpiGrid}>
          {[
            { label: 'Chiffre d\'affaires', value: `${stats.revenue.toFixed(3)} TND`, color: COLORS.accent },
            { label: 'Commandes',           value: stats.orders,      color: COLORS.blue },
            { label: 'Panier moyen',        value: `${stats.avgOrder.toFixed(3)} TND`, color: COLORS.green },
            { label: 'Note clients',        value: `⭐ ${stats.rating}`, color: COLORS.purple },
          ].map(k => (
            <View key={k.label} style={styles.kpiCard}>
              <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
              <Text style={styles.kpiLabel}>{k.label}</Text>
            </View>
          ))}
        </View>

        {/* Revenue chart */}
        <Text style={styles.sectionLabel}>Revenus journaliers</Text>
        <View style={styles.chartCard}>
          {loading ? <ActivityIndicator color={COLORS.accent} /> : (
            <View style={styles.chart}>
              {weekly.map(d => (
                <View key={d.day} style={styles.barCol}>
                  <Text style={styles.barRevenue}>{d.revenue}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${(d.revenue / MAX_REV) * 100}%` }]} />
                  </View>
                  <Text style={styles.barDay}>{d.day}</Text>
                  <Text style={styles.barOrders}>{d.orders} cmd</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Top products */}
        <Text style={styles.sectionLabel}>Produits les plus vendus</Text>
        <View style={styles.topCard}>
          {topProducts.map((p, i) => (
            <View key={p.name} style={[styles.topRow, i === topProducts.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.topRank}>#{i + 1}</Text>
              <Text style={{ fontSize: 24 }}>{p.emoji}</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.topName}>{p.name}</Text>
                <Text style={styles.topSold}>{p.sold} vendus</Text>
              </View>
              <Text style={styles.topRevenue}>{p.revenue.toFixed(3)} TND</Text>
            </View>
          ))}
        </View>

        {/* Peak hours hint */}
        <View style={styles.hintCard}>
          <Text style={styles.hintTitle}>⏰ Heures de pointe</Text>
          <Text style={styles.hintText}>Vos pics de commandes : 12h–14h et 19h–21h. Assurez-vous d'avoir suffisamment de stock à ces horaires.</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  periodRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, paddingVertical: 10 },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  periodBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  periodText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  scroll: { padding: 16 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  kpiCard: { width: '47%', backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 14, alignItems: 'center' },
  kpiValue: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  kpiLabel: { color: COLORS.muted, fontSize: 11, textAlign: 'center' },
  sectionLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  chartCard: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 16, minHeight: 160 },
  chart: { flexDirection: 'row', height: 140, alignItems: 'flex-end', gap: 6 },
  barCol: { flex: 1, alignItems: 'center' },
  barRevenue: { color: COLORS.accent, fontSize: 8, fontWeight: '700', marginBottom: 3 },
  barTrack: { width: '80%', height: 100, backgroundColor: '#16161F', borderRadius: 4, justifyContent: 'flex-end' },
  barFill: { backgroundColor: COLORS.accent, borderRadius: 4, width: '100%' },
  barDay: { color: COLORS.white, fontSize: 10, marginTop: 4, fontWeight: '600' },
  barOrders: { color: COLORS.muted, fontSize: 8 },
  topCard: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16, overflow: 'hidden' },
  topRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 8 },
  topRank: { color: COLORS.accent, fontWeight: '900', fontSize: 14, width: 26 },
  topName: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  topSold: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  topRevenue: { color: COLORS.green, fontSize: 13, fontWeight: '800' },
  hintCard: { backgroundColor: '#1A1200', borderRadius: 12, borderWidth: 1, borderColor: COLORS.accent + '44', padding: 14 },
  hintTitle: { color: COLORS.accent, fontWeight: '700', fontSize: 13, marginBottom: 6 },
  hintText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
});
