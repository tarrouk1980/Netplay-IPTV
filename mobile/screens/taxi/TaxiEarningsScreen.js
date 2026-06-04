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
  balance: 284.500,
  today: { earned: 42.000, trips: 6, hours: 5.5 },
  week: { earned: 318.000, trips: 48, hours: 38 },
  month: { earned: 1240.000, trips: 187, hours: 148 },
  weeklyBars: [28, 45, 52, 38, 60, 72, 23],
  weekDays: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
  recentTrips: [
    { id: 'T1', from: 'Lac 1', to: 'Aéroport', fare: 14.500, date: 'Aujourd\'hui 15:22', surge: false },
    { id: 'T2', from: 'La Marsa', to: 'Bardo', fare: 21.000, date: 'Aujourd\'hui 13:05', surge: true },
    { id: 'T3', from: 'Centre Ville', to: 'Ennasr', fare: 9.200, date: 'Aujourd\'hui 11:40', surge: false },
    { id: 'T4', from: 'Sousse Centre', to: 'Monastir', fare: 28.000, date: 'Hier 18:30', surge: false },
  ],
};

function WeekBar({ value, max, day, isToday }) {
  const pct = max > 0 ? (value / max) : 0;
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View style={{ height: 60, justifyContent: 'flex-end', width: '80%' }}>
        <View style={{ height: Math.max(4, pct * 56), backgroundColor: isToday ? COLORS.accent : COLORS.accent + '50', borderRadius: 4 }} />
      </View>
      <Text style={[styles.barDay, isToday && { color: COLORS.accent, fontWeight: '800' }]}>{day}</Text>
    </View>
  );
}

export default function TaxiEarningsScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    api.get('/api/taxi/driver/earnings')
      .then(r => setData(r.data || MOCK))
      .catch(() => setData(MOCK))
      .finally(() => setLoading(false));
  }, []);

  const stats = data ? data[period] : null;
  const maxBar = data ? Math.max(...data.weeklyBars) : 1;
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💰 Mes gains</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

          {/* Balance */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>SOLDE DISPONIBLE</Text>
            <Text style={styles.balanceVal}>{data.balance.toFixed(3)} <Text style={styles.balanceCurrency}>TND</Text></Text>
            <TouchableOpacity style={styles.withdrawBtn}>
              <Text style={styles.withdrawBtnText}>💳 Virer vers mon compte</Text>
            </TouchableOpacity>
            <Text style={styles.commissionNote}>✅ EasyWay 0% commission — revenus 100% pour vous</Text>
          </View>

          {/* Period selector */}
          <View style={styles.periodRow}>
            {[{ k: 'today', l: "Auj." }, { k: 'week', l: 'Semaine' }, { k: 'month', l: 'Mois' }].map(p => (
              <TouchableOpacity key={p.k} style={[styles.periodBtn, period === p.k && styles.periodBtnActive]} onPress={() => setPeriod(p.k)}>
                <Text style={[styles.periodLabel, period === p.k && styles.periodLabelActive]}>{p.l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: COLORS.accent }]}>{stats.earned.toFixed(3)}</Text>
              <Text style={styles.statSub}>TND gagnés</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: COLORS.text }]}>{stats.trips}</Text>
              <Text style={styles.statSub}>Courses</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: COLORS.blue }]}>{stats.hours}h</Text>
              <Text style={styles.statSub}>En ligne</Text>
            </View>
          </View>

          {/* Weekly chart */}
          {period !== 'today' && (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>ACTIVITÉ DE LA SEMAINE</Text>
              <View style={styles.barsRow}>
                {data.weeklyBars.map((v, i) => (
                  <WeekBar key={i} value={v} max={maxBar} day={data.weekDays[i]} isToday={i === todayIdx} />
                ))}
              </View>
            </View>
          )}

          {/* Recent trips */}
          <Text style={styles.sectionTitle}>COURSES RÉCENTES</Text>
          {data.recentTrips.map(trip => (
            <View key={trip.id} style={styles.tripCard}>
              <View style={styles.tripRoute}>
                <View style={styles.routeDot} />
                <Text style={styles.routeText} numberOfLines={1}>{trip.from}</Text>
              </View>
              <View style={[styles.tripRoute, { marginTop: 4 }]}>
                <View style={[styles.routeDot, { backgroundColor: COLORS.red }]} />
                <Text style={styles.routeText} numberOfLines={1}>{trip.to}</Text>
              </View>
              <View style={styles.tripBottom}>
                <Text style={styles.tripDate}>{trip.date}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {trip.surge && <View style={styles.surgeBadge}><Text style={styles.surgeBadgeText}>⚡ Surge</Text></View>}
                  <Text style={styles.tripFare}>{trip.fare.toFixed(3)} TND</Text>
                </View>
              </View>
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
  balanceCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: COLORS.accent + '40', marginBottom: 16, alignItems: 'center' },
  balanceLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  balanceVal: { color: COLORS.accent, fontSize: 42, fontWeight: '900', marginVertical: 8 },
  balanceCurrency: { fontSize: 20, fontWeight: '600' },
  withdrawBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 4, marginBottom: 10 },
  withdrawBtnText: { color: '#000', fontSize: 14, fontWeight: '900' },
  commissionNote: { color: COLORS.green, fontSize: 11 },
  periodRow: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  periodBtnActive: { backgroundColor: COLORS.accent },
  periodLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  periodLabelActive: { color: '#000', fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statVal: { fontSize: 17, fontWeight: '900' },
  statSub: { color: COLORS.muted, fontSize: 10, marginTop: 4, textAlign: 'center' },
  chartCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  chartTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  barDay: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  tripCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  tripRoute: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green },
  routeText: { color: COLORS.muted, fontSize: 12, flex: 1 },
  tripBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  tripDate: { color: COLORS.muted, fontSize: 11 },
  tripFare: { color: COLORS.accent, fontSize: 14, fontWeight: '900' },
  surgeBadge: { backgroundColor: COLORS.orange + '20', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  surgeBadgeText: { color: COLORS.orange, fontSize: 10, fontWeight: '700' },
});
