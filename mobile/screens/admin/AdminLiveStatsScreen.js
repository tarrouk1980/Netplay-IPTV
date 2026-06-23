import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', purple: '#9B59B6', orange: '#E67E22',
};

const SERVICES = [
  { id: 'TAXI', icon: '🚕', label: 'Taxi', color: COLORS.accent },
  { id: 'DELIVERY', icon: '🛵', label: 'Livraison', color: COLORS.green },
  { id: 'SOS', icon: '🔧', label: 'SOS', color: COLORS.red },
  { id: 'GROCERY', icon: '🛒', label: 'Épicerie', color: COLORS.blue },
];

export default function AdminLiveStatsScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState(null);
  const [revenueByService, setRevenueByService] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/api/admin/stats'),
      api.get('/api/admin/stats/orders-chart'),
      api.get('/api/admin/stats/revenue-by-service'),
    ])
      .then(([s, c, r]) => {
        setStats(s.data);
        setChart(c.data);
        setRevenueByService(r.data.services || []);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const KPICard = ({ icon, value, label, color }) => (
    <View style={[styles.kpiCard, { borderColor: color + '55' }]}>
      <Text style={styles.kpiIcon}>{icon}</Text>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );

  if (loading && !stats) {
    return (
      <SafeAreaView style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </SafeAreaView>
    );
  }

  if (error || !stats) {
    return (
      <SafeAreaView style={[styles.root, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ color: COLORS.muted, textAlign: 'center', marginBottom: 16 }}>
          Impossible de charger les statistiques.
        </Text>
        <TouchableOpacity onPress={load} style={{ backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 }}>
          <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const maxChartValue = Math.max(1, ...(chart?.data || [1]));
  const lastDays = (chart?.labels || []).map((l, i) => ({ label: l, value: chart.data[i] })).slice(-14);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Stats plateforme</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={styles.kpiGrid}>
          <KPICard icon="📦" value={stats.orders.today} label="Commandes today" color={COLORS.blue} />
          <KPICard icon="⏳" value={stats.orders.pending} label="En attente" color={COLORS.orange} />
          <KPICard icon="✅" value={stats.orders.completed} label="Terminées" color={COLORS.green} />
          <KPICard icon="❌" value={stats.orders.cancelled} label="Annulées" color={COLORS.red} />
          <KPICard icon="💰" value={`${Number(stats.revenue.todayTND).toFixed(0)} TND`} label="Revenus today" color={COLORS.purple} />
          <KPICard icon="📅" value={`${Number(stats.revenue.monthTND).toFixed(0)} TND`} label="Revenus mois" color={COLORS.accent} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Revenus par service (30j)</Text>
          <View style={styles.serviceGrid}>
            {SERVICES.map((s) => {
              const sd = revenueByService.find((r) => r.type === s.id);
              return (
                <View key={s.id} style={[styles.serviceCard, { borderColor: s.color + '55' }]}>
                  <Text style={styles.serviceIcon}>{s.icon}</Text>
                  <Text style={[styles.serviceName, { color: s.color }]}>{s.label}</Text>
                  <Text style={styles.serviceActive}>{sd ? `${Number(sd.revenue).toFixed(0)} TND` : '—'}</Text>
                  <Text style={styles.serviceDrivers}>{sd ? `${sd.count} courses` : '0 courses'}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Commandes / jour (14 derniers jours)</Text>
          <View style={styles.chartRow}>
            {lastDays.map((d, i) => (
              <View key={i} style={styles.chartBarWrapper}>
                <View style={[styles.chartBar, { height: (d.value / maxChartValue) * 100, backgroundColor: i === lastDays.length - 1 ? COLORS.accent : COLORS.surface, borderTopWidth: 2, borderTopColor: i === lastDays.length - 1 ? COLORS.accent : COLORS.blue + '88' }]} />
                <Text style={styles.chartHour}>{d.label.slice(8, 10)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Actions rapides</Text>
          <View style={styles.quickActions}>
            {[
              { label: '🗺 Carte live', screen: 'AdminLiveMap' },
              { label: '📋 Commandes', screen: 'AdminOrders' },
              { label: '👥 Chauffeurs', screen: 'AdminDrivers' },
            ].map((a) => (
              <TouchableOpacity
                key={a.screen}
                style={styles.quickBtn}
                onPress={() => navigation.navigate(a.screen)}
              >
                <Text style={styles.quickBtnText}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  kpiGrid: {
    flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 10,
  },
  kpiCard: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, borderWidth: 1, alignItems: 'center',
  },
  kpiIcon: { fontSize: 24, marginBottom: 6 },
  kpiValue: { fontSize: 22, fontWeight: '900' },
  kpiLabel: { color: COLORS.muted, fontSize: 11, marginTop: 3, textAlign: 'center' },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  serviceGrid: { flexDirection: 'row', gap: 8 },
  serviceCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1,
    padding: 12, alignItems: 'center',
  },
  serviceIcon: { fontSize: 24, marginBottom: 4 },
  serviceName: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  serviceActive: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  serviceDrivers: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  chartRow: {
    flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 4,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  chartBarWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  chartBar: { width: '80%', borderRadius: 3 },
  chartHour: { color: COLORS.muted, fontSize: 8, marginTop: 3 },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickBtn: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  quickBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
});
