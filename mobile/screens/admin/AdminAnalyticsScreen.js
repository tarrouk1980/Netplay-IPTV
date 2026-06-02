import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
  green: '#2ECC71',
  red: '#E74C3C',
};

const PERIODS = ["Aujourd'hui", '7 jours', '30 jours', 'Année'];

const KPI_DATA = [
  { icon: '🚕', label: 'Trajets totaux', value: '1 284', trend: '+12%', up: true },
  { icon: '📦', label: 'Livraisons totales', value: '876', trend: '+8%', up: true },
  { icon: '💰', label: 'Revenus plateforme', value: '14 320 TND', trend: '+5%', up: true },
  { icon: '👥', label: 'Utilisateurs actifs', value: '3 417', trend: '-2%', up: false },
  { icon: '🚗', label: 'Chauffeurs en ligne', value: '48', trend: '+15%', up: true },
  { icon: '🛻', label: 'SOS résolus', value: '37', trend: '+3%', up: true },
];

const BAR_DATA = [
  { day: 'Lun', value: 1820, max: 3000 },
  { day: 'Mar', value: 2450, max: 3000 },
  { day: 'Mer', value: 2100, max: 3000 },
  { day: 'Jeu', value: 2900, max: 3000 },
  { day: 'Ven', value: 2650, max: 3000 },
  { day: 'Sam', value: 1400, max: 3000 },
  { day: 'Dim', value: 980, max: 3000 },
];

const TOP_SERVICES = [
  { rank: 1, name: 'Taxi', usage: 1284, icon: '🚕', pct: 100 },
  { rank: 2, name: 'SOS', usage: 876, icon: '🛻', pct: 68 },
  { rank: 3, name: 'Livraison', usage: 654, icon: '📦', pct: 51 },
  { rank: 4, name: 'Épicerie', usage: 412, icon: '🛒', pct: 32 },
];

const BAR_HEIGHT = 120;

export default function AdminAnalyticsScreen({ navigation }) {
  const [activePeriod, setActivePeriod] = useState(1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytiques</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodRow}>
          {PERIODS.map((p, i) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodTab, activePeriod === i && styles.periodTabActive]}
              onPress={() => setActivePeriod(i)}
            >
              <Text style={[styles.periodTabText, activePeriod === i && styles.periodTabTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KPI Grid */}
        <Text style={styles.sectionTitle}>Indicateurs clés</Text>
        <View style={styles.kpiGrid}>
          {KPI_DATA.map((kpi) => (
            <View key={kpi.label} style={styles.kpiCard}>
              <Text style={styles.kpiIcon}>{kpi.icon}</Text>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
              <View style={styles.kpiTrendRow}>
                <Text style={[styles.kpiTrend, { color: kpi.up ? COLORS.green : COLORS.red }]}>
                  {kpi.up ? '↑' : '↓'} {kpi.trend}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bar Chart */}
        <Text style={styles.sectionTitle}>Revenus — 7 derniers jours</Text>
        <View style={styles.chartContainer}>
          <View style={styles.chartBars}>
            {BAR_DATA.map((bar) => {
              const barH = Math.round((bar.value / bar.max) * BAR_HEIGHT);
              return (
                <View key={bar.day} style={styles.barColumn}>
                  <Text style={styles.barValueLabel}>
                    {bar.value >= 1000 ? (bar.value / 1000).toFixed(1) + 'k' : bar.value}
                  </Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: barH }]} />
                  </View>
                  <Text style={styles.barDayLabel}>{bar.day}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.chartSubtitle}>Revenus en TND</Text>
        </View>

        {/* Top Services */}
        <Text style={styles.sectionTitle}>Top services</Text>
        {TOP_SERVICES.map((svc) => (
          <View key={svc.name} style={styles.serviceRow}>
            <View style={styles.serviceRankBadge}>
              <Text style={styles.serviceRankText}>#{svc.rank}</Text>
            </View>
            <Text style={styles.serviceIcon}>{svc.icon}</Text>
            <View style={styles.serviceInfo}>
              <View style={styles.serviceNameRow}>
                <Text style={styles.serviceName}>{svc.name}</Text>
                <Text style={styles.serviceUsage}>{svc.usage.toLocaleString()} utilisations</Text>
              </View>
              <View style={styles.serviceBarTrack}>
                <View style={[styles.serviceBarFill, { width: svc.pct + '%' }]} />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backArrow: { color: COLORS.text, fontSize: 22 },
  headerTitle: { flex: 1, color: COLORS.text, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  headerRight: { width: 36 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  periodTab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  periodTabActive: { backgroundColor: COLORS.primary },
  periodTabText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  periodTabTextActive: { color: '#000000' },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 14 },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  kpiCard: {
    width: '47.5%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'flex-start',
  },
  kpiIcon: { fontSize: 22, marginBottom: 8 },
  kpiValue: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  kpiLabel: { color: COLORS.muted, fontSize: 11, marginBottom: 6 },
  kpiTrendRow: { flexDirection: 'row', alignItems: 'center' },
  kpiTrend: { fontSize: 12, fontWeight: '600' },
  chartContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_HEIGHT + 40,
    marginBottom: 8,
  },
  barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barValueLabel: { color: COLORS.muted, fontSize: 9, marginBottom: 4 },
  barTrack: {
    width: 20,
    height: BAR_HEIGHT,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { backgroundColor: COLORS.primary, borderRadius: 4, width: '100%' },
  barDayLabel: { color: COLORS.muted, fontSize: 10, marginTop: 6 },
  chartSubtitle: { color: COLORS.muted, fontSize: 11, textAlign: 'center' },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  serviceRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceRankText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  serviceIcon: { fontSize: 22 },
  serviceInfo: { flex: 1 },
  serviceNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  serviceName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  serviceUsage: { color: COLORS.muted, fontSize: 12 },
  serviceBarTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  serviceBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
});
