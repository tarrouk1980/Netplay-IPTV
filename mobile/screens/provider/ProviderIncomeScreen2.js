import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const PERIODS = ['Aujourd\'hui', 'Semaine', 'Mois', 'Année'];

const MOCK = {
  balance: 184.250,
  pending: 32.000,
  periods: {
    "Aujourd'hui": { earnings: 67.500, trips: 8, avgPerTrip: 8.44, bonuses: 5.000 },
    'Semaine': { earnings: 320.750, trips: 38, avgPerTrip: 8.44, bonuses: 15.000 },
    'Mois': { earnings: 1240.500, trips: 147, avgPerTrip: 8.44, bonuses: 50.000 },
    'Année': { earnings: 14280.000, trips: 1692, avgPerTrip: 8.44, bonuses: 580.000 },
  },
  recentPayments: [
    { date: '03/06/2026', amount: 67.500, type: 'Courses', status: 'CREDITED' },
    { date: '02/06/2026', amount: 84.250, type: 'Courses + bonus', status: 'CREDITED' },
    { date: '01/06/2026', amount: 72.000, type: 'Courses', status: 'CREDITED' },
    { date: '31/05/2026', amount: 97.000, type: 'Courses + bonus', status: 'CREDITED' },
  ],
};

function MiniBar({ value, maxValue, label, color }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ height: 70, justifyContent: 'flex-end', width: '80%' }}>
        <View style={{
          width: '100%', borderRadius: 4, backgroundColor: color,
          height: Math.max(4, (value / maxValue) * 66),
        }} />
      </View>
      <Text style={{ color: COLORS.muted, fontSize: 9, marginTop: 4 }}>{label}</Text>
    </View>
  );
}

export default function ProviderIncomeScreen2({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("Aujourd'hui");

  const load = useCallback(() => {
    api.get('/api/provider/income')
      .then(r => setData(r.data || MOCK))
      .catch(() => setData(MOCK))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const d = data || MOCK;
  const pd = d.periods[period] || d.periods["Aujourd'hui"];
  const weekData = [45, 78, 62, 84, 91, 67, 84];
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const maxWeek = Math.max(...weekData, 1);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💰 Mes revenus</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <Text style={styles.balanceAmount}>{d.balance.toFixed(3)}</Text>
            <Text style={styles.balanceTND}>TND</Text>
            {d.pending > 0 && (
              <Text style={styles.pendingText}>{d.pending.toFixed(3)} TND en traitement</Text>
            )}
            <TouchableOpacity style={styles.withdrawBtn}>
              <Text style={styles.withdrawBtnText}>🏦 Virer vers mon compte</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.periodRow}>
            {PERIODS.map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.periodBtn, period === p && styles.periodBtnActive]}
                onPress={() => setPeriod(p)}
              >
                <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.statsGrid}>
            {[
              { label: 'Revenus', value: pd.earnings.toFixed(3) + ' TND', color: COLORS.accent },
              { label: 'Courses', value: pd.trips.toString() },
              { label: 'Moy./course', value: pd.avgPerTrip.toFixed(2) + ' TND' },
              { label: 'Bonus', value: pd.bonuses.toFixed(3) + ' TND', color: COLORS.green },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={[styles.statValue, s.color && { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>ACTIVITÉ DE LA SEMAINE (TND)</Text>
            <View style={styles.chartRow}>
              {weekData.map((v, i) => (
                <MiniBar key={i} value={v} maxValue={maxWeek} label={days[i]} color={COLORS.accent + (i === 4 ? 'FF' : '80')} />
              ))}
            </View>
          </View>

          <Text style={styles.sectionTitle}>HISTORIQUE DES VERSEMENTS</Text>
          {d.recentPayments.map((p, i) => (
            <View key={i} style={styles.paymentRow}>
              <View style={styles.paymentLeft}>
                <Text style={styles.paymentDate}>{p.date}</Text>
                <Text style={styles.paymentType}>{p.type}</Text>
              </View>
              <View style={styles.paymentRight}>
                <Text style={styles.paymentAmount}>+{p.amount.toFixed(3)} TND</Text>
                <View style={styles.paymentStatus}>
                  <Text style={styles.paymentStatusText}>✓ Versé</Text>
                </View>
              </View>
            </View>
          ))}

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
  scroll: { padding: 16 },
  balanceCard: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 16,
    borderWidth: 1.5, borderColor: COLORS.accent + '40',
  },
  balanceLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 6 },
  balanceAmount: { color: COLORS.accent, fontSize: 42, fontWeight: '900', lineHeight: 46 },
  balanceTND: { color: COLORS.accent, fontSize: 14, fontWeight: '600', marginBottom: 6 },
  pendingText: { color: COLORS.muted, fontSize: 12, marginBottom: 14 },
  withdrawBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 28,
  },
  withdrawBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  periodBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 8, alignItems: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  periodBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  periodText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  periodTextActive: { color: COLORS.accent },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statValue: { color: COLORS.text, fontSize: 15, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: COLORS.muted, fontSize: 11 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  chartRow: { flexDirection: 'row', height: 80, alignItems: 'flex-end' },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  paymentRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  paymentLeft: {},
  paymentDate: { color: COLORS.text, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  paymentType: { color: COLORS.muted, fontSize: 11 },
  paymentRight: { alignItems: 'flex-end', gap: 4 },
  paymentAmount: { color: COLORS.green, fontSize: 14, fontWeight: '800' },
  paymentStatus: { backgroundColor: COLORS.green + '20', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  paymentStatusText: { color: COLORS.green, fontSize: 10, fontWeight: '700' },
});
