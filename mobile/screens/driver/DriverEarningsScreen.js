import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const PERIODS = [
  { key: 'TODAY', label: "Aujourd'hui" },
  { key: 'WEEK', label: 'Cette semaine' },
  { key: 'MONTH', label: 'Ce mois' },
];

const MOCK = {
  TODAY: { total: 145.50, rides: 12, hours: 8.5, avgPerRide: 12.13, tip: 8.0, bonus: 0 },
  WEEK: { total: 892.00, rides: 74, hours: 52, avgPerRide: 12.05, tip: 42.0, bonus: 25 },
  MONTH: { total: 3240.00, rides: 288, hours: 198, avgPerRide: 11.25, tip: 156.0, bonus: 75 },
};

const MOCK_HISTORY = [
  { id: 1, time: '18:42', from: 'La Marsa', to: 'Centre-ville', amount: 14.5, duration: '22 min', status: 'COMPLETED' },
  { id: 2, time: '16:10', from: 'Ariana', to: 'Aéroport', amount: 22.0, duration: '35 min', status: 'COMPLETED' },
  { id: 3, time: '13:55', from: 'Bardo', to: 'La Goulette', amount: 18.0, duration: '28 min', status: 'COMPLETED' },
  { id: 4, time: '11:20', from: 'Centre-ville', to: 'Manouba', amount: 16.5, duration: '30 min', status: 'COMPLETED' },
  { id: 5, time: '09:05', from: 'Ben Arous', to: 'Tunis Centre', amount: 19.0, duration: '32 min', status: 'COMPLETED' },
];

export default function DriverEarningsScreen({ navigation }) {
  const [period, setPeriod] = useState('TODAY');
  const [earnings, setEarnings] = useState(MOCK.TODAY);
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [earnRes, histRes] = await Promise.all([
        api.get(`/api/taxi/driver/earnings?period=${period}`),
        api.get('/api/taxi/driver/history?limit=10'),
      ]);
      if (earnRes.data) setEarnings(earnRes.data);
      if (histRes.data?.rides?.length > 0) setHistory(histRes.data.rides);
    } catch {
      setEarnings(MOCK[period]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes revenus</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.periodRow}>
        {PERIODS.map(p => (
          <TouchableOpacity key={p.key} style={[styles.periodBtn, period === p.key && styles.periodBtnActive]} onPress={() => setPeriod(p.key)}>
            <Text style={[styles.periodText, period === p.key && { color: '#000' }]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} style={{ marginTop: 60 }} /> : (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

          {/* Hero card */}
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Revenus nets</Text>
            <Text style={styles.heroAmount}>{earnings.total.toFixed(2)} TND</Text>
            <Text style={styles.heroSub}>0% commission — modèle EASYWAY</Text>
          </View>

          {/* KPIs */}
          <View style={styles.kpiRow}>
            {[
              { label: 'Courses', value: earnings.rides, color: COLORS.white, icon: '🚕' },
              { label: 'Heures', value: `${earnings.hours}h`, color: COLORS.blue, icon: '⏱' },
              { label: 'Moy/course', value: `${earnings.avgPerRide?.toFixed(2)} TND`, color: COLORS.accent, icon: '📊' },
              { label: 'Pourboires', value: `${earnings.tip?.toFixed(2)} TND`, color: COLORS.green, icon: '💝' },
            ].map((k, i) => (
              <View key={i} style={styles.kpiCard}>
                <Text style={{ fontSize: 18, marginBottom: 4 }}>{k.icon}</Text>
                <Text style={[styles.kpiVal, { color: k.color }]}>{k.value}</Text>
                <Text style={styles.kpiLabel}>{k.label}</Text>
              </View>
            ))}
          </View>

          {earnings.bonus > 0 && (
            <View style={styles.bonusCard}>
              <Text style={{ fontSize: 20 }}>🎁</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.bonusTitle}>Bonus performance</Text>
                <Text style={styles.bonusSub}>Objectif atteint cette période</Text>
              </View>
              <Text style={styles.bonusAmount}>+{earnings.bonus.toFixed(2)} TND</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>📋 Dernières courses</Text>
          {history.map(ride => (
            <View key={ride.id} style={styles.rideRow}>
              <View style={styles.rideTime}>
                <Text style={styles.rideTimeText}>{ride.time || '—'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rideRoute}>{ride.from || ride.originAddress} → {ride.to || ride.destinationAddress}</Text>
                <Text style={styles.rideDuration}>{ride.duration || ride.durationMin ? `${ride.durationMin} min` : ''}</Text>
              </View>
              <Text style={styles.rideAmount}>{(ride.amount || ride.fare || 0).toFixed(2)} TND</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.withdrawBtn} onPress={() => navigation.navigate('DriverWithdraw')}>
            <Text style={styles.withdrawBtnText}>💸 Retirer mes gains</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  periodRow: { flexDirection: 'row', gap: 8, padding: 12 },
  periodBtn: { flex: 1, paddingVertical: 9, borderRadius: 20, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  periodBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  periodText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  heroCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: COLORS.accent + '44' },
  heroLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 8 },
  heroAmount: { color: COLORS.accent, fontSize: 42, fontWeight: '900', marginBottom: 6 },
  heroSub: { color: COLORS.green, fontSize: 11, fontWeight: '600' },
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  kpiCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  kpiVal: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  kpiLabel: { color: COLORS.muted, fontSize: 10 },
  bonusCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.green + '15', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.green + '44' },
  bonusTitle: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  bonusSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  bonusAmount: { color: COLORS.green, fontSize: 16, fontWeight: '900' },
  sectionTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  rideRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rideTime: { backgroundColor: COLORS.surfaceAlt, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  rideTimeText: { color: COLORS.muted, fontSize: 11, fontWeight: '700' },
  rideRoute: { color: COLORS.white, fontSize: 12, fontWeight: '600', marginBottom: 2 },
  rideDuration: { color: COLORS.muted, fontSize: 11 },
  rideAmount: { color: COLORS.accent, fontSize: 14, fontWeight: '900' },
  withdrawBtn: { marginTop: 20, backgroundColor: COLORS.green, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  withdrawBtnText: { color: '#FFF', fontSize: 15, fontWeight: '900' },
});
