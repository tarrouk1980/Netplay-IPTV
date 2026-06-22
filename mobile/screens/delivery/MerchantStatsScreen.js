import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
  green: '#27AE60',
  red: '#E74C3C',
  blue: '#3498DB',
  purple: '#9B59B6',
};

const PERIODS = ["Aujourd'hui", 'Ce mois'];

export default function MerchantStatsScreen({ navigation }) {
  const [period, setPeriod] = useState(PERIODS[0]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    api.get('/api/merchants/stats')
      .then(r => { setStats(r.data); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const data = stats ? (period === PERIODS[0]
    ? { commandes: stats.todayOrders, revenus: stats.todayRevenue, pending: stats.pendingOrders }
    : { commandes: stats.monthOrders, revenus: stats.monthRevenue, pending: stats.pendingOrders }) : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (error || !stats) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 30 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
            Impossible de charger vos statistiques.
          </Text>
          <TouchableOpacity onPress={() => { setLoading(true); load(); }} style={{ backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
            <Text style={{ color: COLORS.bg, fontWeight: '700' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes statistiques</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Commandes reçues</Text>
            <Text style={styles.kpiValue}>{data.commandes}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Revenus</Text>
            <Text style={styles.kpiValue}>{data.revenus.toFixed(2)}</Text>
            <Text style={styles.kpiSub}>TND</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Note moyenne</Text>
            <Text style={styles.kpiValue}>⭐ {stats.rating}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Commandes en attente</Text>
            <Text style={styles.kpiValue}>{data.pending}</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backArrow: { color: COLORS.primary, fontSize: 22, fontWeight: 'bold' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  periodRow: {
    flexDirection: 'row', margin: 16, backgroundColor: COLORS.surface,
    borderRadius: 12, padding: 4, gap: 4,
  },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  periodBtnActive: { backgroundColor: COLORS.primary },
  periodText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  periodTextActive: { color: COLORS.bg },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12, marginBottom: 8 },
  kpiCard: {
    width: '46%', backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  kpiLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  kpiValue: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  kpiSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  kpiTrend: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  section: {
    marginHorizontal: 16, marginTop: 16, backgroundColor: COLORS.surface,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  sectionTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 14 },
  productRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  productRank: { color: COLORS.muted, fontSize: 13, width: 20, fontWeight: '700' },
  productEmoji: { fontSize: 20, marginRight: 10 },
  productName: { color: COLORS.text, fontSize: 14, flex: 1 },
  productStats: { alignItems: 'flex-end' },
  productVentes: { color: COLORS.muted, fontSize: 11 },
  productRevenu: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 110, gap: 3 },
  barWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '100%', backgroundColor: COLORS.primary, borderRadius: 3, marginBottom: 4 },
  barLabel: { color: COLORS.muted, fontSize: 8, textAlign: 'center' },
  satRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  satLabel: { width: 52, fontSize: 12, fontWeight: '600' },
  satBarBg: { flex: 1, height: 10, backgroundColor: COLORS.border, borderRadius: 5, overflow: 'hidden' },
  satBar: { height: '100%', borderRadius: 5 },
  satPct: { color: COLORS.muted, fontSize: 12, width: 36, textAlign: 'right' },
});
