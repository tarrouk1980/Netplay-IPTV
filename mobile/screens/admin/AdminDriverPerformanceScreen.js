import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#2196F3',
};

const PERIODS = ['7j', '30j', '90j'];

const DRIVERS = [
  { id: '1', name: 'Karim Bouzid', role: '🚕 Taxi', trips: 142, rating: 4.9, revenue: 1240, acceptance: 97, cancellation: 1.2, online: 38 },
  { id: '2', name: 'Yassine Dhouib', role: '🛵 Livreur', trips: 88, rating: 4.7, revenue: 620, acceptance: 91, cancellation: 3.1, online: 24 },
  { id: '3', name: 'Sami Triki', role: '🚕 Taxi', trips: 115, rating: 4.6, revenue: 980, acceptance: 88, cancellation: 4.5, online: 30 },
  { id: '4', name: 'Ahmed Bensalem', role: '🛻 Dépanneur', trips: 56, rating: 4.8, revenue: 1820, acceptance: 95, cancellation: 2.0, online: 42 },
  { id: '5', name: 'Rami Gharbi', role: '🛵 Livreur', trips: 71, rating: 4.5, revenue: 510, acceptance: 84, cancellation: 5.8, online: 18 },
];

function StatPill({ label, value, color }) {
  return (
    <View style={[styles.pill, { borderColor: color + '50' }]}>
      <Text style={[styles.pillValue, { color }]}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

export default function AdminDriverPerformanceScreen({ navigation }) {
  const [period, setPeriod] = useState('30j');
  const [sortBy, setSortBy] = useState('trips');

  const sorted = [...DRIVERS].sort((a, b) => b[sortBy] - a[sortBy]);

  const totalTrips = DRIVERS.reduce((s, d) => s + d.trips, 0);
  const avgRating = (DRIVERS.reduce((s, d) => s + d.rating, 0) / DRIVERS.length).toFixed(2);
  const totalRevenue = DRIVERS.reduce((s, d) => s + d.revenue, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📊 Performance chauffeurs</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period tabs */}
        <View style={styles.periodRow}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodLabel, period === p && { color: COLORS.accent }]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KPI row */}
        <View style={styles.kpiRow}>
          <StatPill label="Courses" value={totalTrips} color={COLORS.accent} />
          <StatPill label="Note moy." value={`★ ${avgRating}`} color={COLORS.green} />
          <StatPill label="Revenus" value={`${totalRevenue} TND`} color={COLORS.blue} />
        </View>

        {/* Sort tabs */}
        <Text style={styles.sectionTitle}>CLASSEMENT CHAUFFEURS</Text>
        <View style={styles.sortRow}>
          {[['trips', '🏁 Courses'], ['rating', '⭐ Note'], ['revenue', '💰 Revenus'], ['acceptance', '✅ Acceptation']].map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.sortBtn, sortBy === key && styles.sortBtnActive]}
              onPress={() => setSortBy(key)}
            >
              <Text style={[styles.sortLabel, sortBy === key && { color: COLORS.accent }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {sorted.map((d, i) => (
          <TouchableOpacity
            key={d.id}
            style={styles.driverCard}
            onPress={() => navigation.navigate('AdminDriverDetail', { driverId: d.id })}
            activeOpacity={0.8}
          >
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={styles.driverName}>{d.name}</Text>
                <Text style={{ color: COLORS.muted, fontSize: 11 }}>{d.role}</Text>
              </View>
              <View style={styles.driverStats}>
                <Text style={styles.statChip}>🏁 {d.trips}</Text>
                <Text style={styles.statChip}>⭐ {d.rating}</Text>
                <Text style={styles.statChip}>💰 {d.revenue} TND</Text>
                <Text style={[styles.statChip, { color: d.cancellation > 4 ? COLORS.red : COLORS.green }]}>
                  ✕ {d.cancellation}%
                </Text>
              </View>
              <View style={styles.barRow}>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${d.acceptance}%`, backgroundColor: COLORS.green }]} />
                </View>
                <Text style={styles.barLabel}>{d.acceptance}% accept.</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, width: 36 },
  backIcon: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  periodBtn: {
    flex: 1, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 8, alignItems: 'center', backgroundColor: COLORS.surface,
  },
  periodBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  periodLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  pill: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1,
  },
  pillValue: { fontSize: 16, fontWeight: '900' },
  pillLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  sortRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  sortBtn: {
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.surface,
  },
  sortBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  sortLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  driverCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  rankBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.accent + '20', borderWidth: 1, borderColor: COLORS.accent + '50',
    alignItems: 'center', justifyContent: 'center',
  },
  rankText: { color: COLORS.accent, fontSize: 12, fontWeight: '900' },
  driverName: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  driverStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  statChip: { color: COLORS.muted, fontSize: 11 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  barBg: { flex: 1, height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 2 },
  barLabel: { color: COLORS.muted, fontSize: 10, width: 70 },
});
