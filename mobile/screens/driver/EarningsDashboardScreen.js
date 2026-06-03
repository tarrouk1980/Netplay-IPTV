import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F', blue: '#1565C0',
};

const MOCK_WEEKLY = [
  { day: 'Lun', amount: 42.5, courses: 6 },
  { day: 'Mar', amount: 58.0, courses: 8 },
  { day: 'Mer', amount: 31.0, courses: 4 },
  { day: 'Jeu', amount: 67.5, courses: 9 },
  { day: 'Ven', amount: 88.0, courses: 12 },
  { day: 'Sam', amount: 95.0, courses: 13 },
  { day: 'Dim', amount: 54.0, courses: 7 },
];

const MOCK_HISTORY = [
  { id: 'C001', type: 'Taxi', from: 'Lac Tunis', to: 'Aéroport', amount: 35.0, date: '15/01', status: 'done' },
  { id: 'C002', type: 'Taxi', from: 'Menzah 6', to: 'Centre Ville', amount: 12.5, date: '15/01', status: 'done' },
  { id: 'C003', type: 'SOS', from: 'Autoroute A1', to: 'Garage Ariana', amount: 55.0, date: '14/01', status: 'done' },
  { id: 'C004', type: 'Livraison', from: 'Entrepôt Ben Arous', to: 'Client La Marsa', amount: 18.0, date: '14/01', status: 'done' },
  { id: 'C005', type: 'Taxi', from: 'La Goulette', to: 'Bab Bhar', amount: 9.0, date: '13/01', status: 'done' },
];

const MAX_WEEK = Math.max(...MOCK_WEEKLY.map((d) => d.amount));

export default function EarningsDashboardScreen({ navigation }) {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ today: 54.0, week: 436.0, month: 1820.5, courses: 59 });
  const [weekly, setWeekly] = useState(MOCK_WEEKLY);
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('semaine');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/driver/earnings');
        if (res.data?.stats) setStats(res.data.stats);
        if (res.data?.weekly) setWeekly(res.data.weekly);
        if (res.data?.history) setHistory(res.data.history);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>💰 Mes Gains</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Stats cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: COLORS.accent }]}>
            <Text style={styles.statValue}>{stats.today.toFixed(3)}</Text>
            <Text style={styles.statLabel}>Aujourd'hui (TND)</Text>
          </View>
          <View style={[styles.statCard, { borderColor: COLORS.green }]}>
            <Text style={[styles.statValue, { color: COLORS.green }]}>{stats.week.toFixed(3)}</Text>
            <Text style={styles.statLabel}>Cette semaine</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: COLORS.blue }]}>
            <Text style={[styles.statValue, { color: COLORS.blue }]}>{stats.month.toFixed(3)}</Text>
            <Text style={styles.statLabel}>Ce mois</Text>
          </View>
          <View style={[styles.statCard, { borderColor: COLORS.muted }]}>
            <Text style={styles.statValue}>{stats.courses}</Text>
            <Text style={styles.statLabel}>Courses totales</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {[{ key: 'semaine', label: '📊 Semaine' }, { key: 'historique', label: '📋 Historique' }].map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, tab === t.key && styles.tabActive]}
              onPress={() => setTab(t.key)}
            >
              <Text style={[styles.tabText, tab === t.key && { color: '#000' }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'semaine' && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Gains par jour — cette semaine</Text>
            <View style={styles.chart}>
              {weekly.map((d) => (
                <View key={d.day} style={styles.barCol}>
                  <Text style={styles.barAmount}>{d.amount}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${(d.amount / MAX_WEEK) * 100}%` }]} />
                  </View>
                  <Text style={styles.barDay}>{d.day}</Text>
                  <Text style={styles.barCourses}>{d.courses}×</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {tab === 'historique' && (
          <View style={styles.histCard}>
            {loading && <ActivityIndicator color={COLORS.accent} />}
            {history.map((c) => (
              <View key={c.id} style={styles.histRow}>
                <View style={[styles.typeTag, { backgroundColor: COLORS.accent + '22' }]}>
                  <Text style={{ color: COLORS.accent, fontSize: 11, fontWeight: '700' }}>{c.type}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.histFrom}>{c.from} → {c.to}</Text>
                  <Text style={styles.histDate}>{c.date}</Text>
                </View>
                <Text style={styles.histAmount}>+{c.amount.toFixed(3)} TND</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.withdrawCard}>
          <Text style={styles.withdrawTitle}>💳 Virement disponible</Text>
          <Text style={styles.withdrawAmount}>{stats.week.toFixed(3)} TND</Text>
          <TouchableOpacity style={styles.withdrawBtn}>
            <Text style={styles.withdrawBtnText}>Demander un virement</Text>
          </TouchableOpacity>
          <Text style={styles.withdrawNote}>Virement traité sous 24–48h ouvrés via votre compte bancaire enregistré.</Text>
        </View>

        <View style={{ height: 24 }} />
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
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  scroll: { padding: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 16, borderWidth: 1.5, alignItems: 'center',
  },
  statValue: { color: COLORS.accent, fontSize: 22, fontWeight: '900' },
  statLabel: { color: COLORS.muted, fontSize: 11, marginTop: 4, textAlign: 'center' },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: {
    flex: 1, paddingVertical: 9, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  chartCard: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 12,
  },
  chartTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 },
  chart: { flexDirection: 'row', height: 140, alignItems: 'flex-end', gap: 6 },
  barCol: { flex: 1, alignItems: 'center' },
  barAmount: { color: COLORS.accent, fontSize: 9, fontWeight: '700', marginBottom: 4 },
  barTrack: { width: '80%', height: 100, backgroundColor: COLORS.surfaceAlt, borderRadius: 4, justifyContent: 'flex-end' },
  barFill: { backgroundColor: COLORS.accent, borderRadius: 4, width: '100%' },
  barDay: { color: COLORS.white, fontSize: 10, marginTop: 4, fontWeight: '600' },
  barCourses: { color: COLORS.muted, fontSize: 9 },
  histCard: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 12,
  },
  histRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  typeTag: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  histFrom: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  histDate: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  histAmount: { color: COLORS.green, fontSize: 14, fontWeight: '800' },
  withdrawCard: {
    backgroundColor: '#0A1A0A', borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.green, padding: 20, alignItems: 'center',
  },
  withdrawTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  withdrawAmount: { color: COLORS.green, fontSize: 32, fontWeight: '900', marginVertical: 8 },
  withdrawBtn: {
    backgroundColor: COLORS.green, borderRadius: 10,
    paddingHorizontal: 24, paddingVertical: 12, marginBottom: 10,
  },
  withdrawBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  withdrawNote: { color: COLORS.muted, fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
