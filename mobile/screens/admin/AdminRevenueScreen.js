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
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', purple: '#9B59B6',
};

const PERIODS = ['Aujourd\'hui', '7 jours', 'Ce mois', 'Cette année'];

const MOCK = {
  total: 124850.750,
  byService: [
    { name: 'Taxi', icon: '🚕', amount: 68420.500, pct: 54.8, color: COLORS.accent },
    { name: 'Livraison', icon: '📦', amount: 32180.250, pct: 25.8, color: COLORS.blue },
    { name: 'Épicerie', icon: '🛒', amount: 15640.000, pct: 12.5, color: COLORS.green },
    { name: 'SOS', icon: '🔧', amount: 8610.000, pct: 6.9, color: COLORS.red },
  ],
  topProviders: [
    { name: 'Mohamed A.', role: 'Chauffeur', amount: 4280.500, trips: 312 },
    { name: 'Sami K.', role: 'Livreur', amount: 3840.250, trips: 287 },
    { name: 'Pizza Roma', role: 'Marchand', amount: 3120.000, trips: 198 },
    { name: 'Nour B.', role: 'Chauffeur', amount: 2980.750, trips: 241 },
    { name: 'Karim M.', role: 'Dépanneur', amount: 2640.000, trips: 88 },
  ],
  daily: [3200, 4100, 2800, 5100, 4400, 6200, 5800],
  days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  growth: 12.4,
};

function Bar({ value, maxValue }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 64 }}>
      <View style={{
        width: '75%', borderRadius: 3, backgroundColor: COLORS.accent,
        height: Math.max(3, (value / maxValue) * 60),
      }} />
    </View>
  );
}

export default function AdminRevenueScreen({ navigation }) {
  const [period, setPeriod] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/admin/revenue?period=' + period)
      .then(r => setData(r.data || MOCK))
      .catch(() => setData(MOCK))
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const d = data || MOCK;
  const maxVal = Math.max(...d.daily, 1);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💰 Revenus plateforme</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {PERIODS.map((p, i) => (
          <TouchableOpacity key={i} style={[styles.periodBtn, period === i && styles.periodBtnActive]} onPress={() => setPeriod(i)}>
            <Text style={[styles.periodText, period === i && styles.periodTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Revenus totaux</Text>
            <Text style={styles.heroAmount}>{d.total.toFixed(3)}</Text>
            <Text style={styles.heroTND}>TND</Text>
            <View style={[styles.growthBadge, { backgroundColor: d.growth >= 0 ? COLORS.green + '20' : COLORS.red + '20' }]}>
              <Text style={[styles.growthText, { color: d.growth >= 0 ? COLORS.green : COLORS.red }]}>
                {d.growth >= 0 ? '↑' : '↓'} {Math.abs(d.growth)}% vs période précédente
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>ÉVOLUTION 7 JOURS</Text>
            <View style={styles.chartRow}>
              {d.daily.map((v, i) => <Bar key={i} value={v} maxValue={maxVal} />)}
            </View>
            <View style={styles.chartLabels}>
              {d.days.map((day, i) => <Text key={i} style={styles.chartLabel}>{day}</Text>)}
            </View>
          </View>

          <Text style={styles.sectionTitle}>PAR SERVICE</Text>
          {d.byService.map((s, i) => (
            <View key={i} style={styles.serviceRow}>
              <Text style={styles.serviceIcon}>{s.icon}</Text>
              <View style={{ flex: 1 }}>
                <View style={styles.serviceTop}>
                  <Text style={styles.serviceName}>{s.name}</Text>
                  <Text style={[styles.serviceAmount, { color: s.color }]}>{s.amount.toFixed(3)} TND</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: s.pct + '%', backgroundColor: s.color }]} />
                </View>
                <Text style={styles.servicePct}>{s.pct}%</Text>
              </View>
            </View>
          ))}

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>TOP PRESTATAIRES</Text>
          <View style={styles.card}>
            {d.topProviders.map((p, i) => (
              <View key={i} style={[styles.providerRow, i < d.topProviders.length - 1 && styles.providerRowBorder]}>
                <View style={[styles.providerRank, i === 0 && { backgroundColor: COLORS.accent }]}>
                  <Text style={[styles.providerRankText, i === 0 && { color: '#000' }]}>#{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.providerName}>{p.name}</Text>
                  <Text style={styles.providerRole}>{p.role} · {p.trips} courses</Text>
                </View>
                <Text style={styles.providerAmount}>{p.amount.toFixed(3)} TND</Text>
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
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  periodScroll: { paddingVertical: 12 },
  periodBtn: {
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  periodBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  periodText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  periodTextActive: { color: COLORS.accent },
  scroll: { padding: 16 },
  heroCard: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 16,
    borderWidth: 1.5, borderColor: COLORS.accent + '40',
  },
  heroLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 6 },
  heroAmount: { color: COLORS.accent, fontSize: 40, fontWeight: '900', lineHeight: 44 },
  heroTND: { color: COLORS.accent, fontSize: 14, fontWeight: '600', marginBottom: 12 },
  growthBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  growthText: { fontSize: 13, fontWeight: '700' },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  chartRow: { flexDirection: 'row', height: 64, alignItems: 'flex-end', marginBottom: 4 },
  chartLabels: { flexDirection: 'row' },
  chartLabel: { flex: 1, color: COLORS.muted, fontSize: 9, textAlign: 'center' },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  serviceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  serviceIcon: { fontSize: 22 },
  serviceTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  serviceName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  serviceAmount: { fontSize: 13, fontWeight: '700' },
  progressBg: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginBottom: 3 },
  progressFill: { height: 4, borderRadius: 2 },
  servicePct: { color: COLORS.muted, fontSize: 11 },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  providerRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  providerRank: {
    width: 26, height: 26, borderRadius: 8, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  providerRankText: { color: COLORS.muted, fontSize: 11, fontWeight: '800' },
  providerName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  providerRole: { color: COLORS.muted, fontSize: 11, marginTop: 1 },
  providerAmount: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
});
