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

const MOCK = {
  balance: 284.500,
  pending: 45.000,
  todayEarnings: 85.000,
  todayJobs: 3,
  weekEarnings: 320.750,
  monthEarnings: 1240.500,
  history: [
    { id: 'SOS201', type: 'Crevaison', client: 'Ahmed B.', amount: 45.000, date: '03/06/2026 16:10', status: 'PAID' },
    { id: 'SOS202', type: 'Panne moteur', client: 'Nadia K.', amount: 80.000, date: '03/06/2026 13:30', status: 'PAID' },
    { id: 'SOS203', type: 'Batterie', client: 'Sami T.', amount: 35.000, date: '03/06/2026 10:15', status: 'PENDING' },
    { id: 'SOS204', type: 'Remorquage', client: 'Rim S.', amount: 120.000, date: '02/06/2026 18:40', status: 'PAID' },
    { id: 'SOS205', type: 'Carburant', client: 'Youssef M.', amount: 15.000, date: '02/06/2026 14:22', status: 'PAID' },
  ],
};

export default function DepanneurEarningsScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api.get('/api/depanneur/earnings')
      .then(r => setData(r.data || MOCK))
      .catch(() => setData(MOCK))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const d = data || MOCK;

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
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>{d.pending.toFixed(3)} TND en attente</Text>
              </View>
            )}
            <TouchableOpacity style={styles.withdrawBtn}>
              <Text style={styles.withdrawBtnText}>🏦 Demander un virement</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            {[
              { label: "Aujourd'hui", value: d.todayEarnings.toFixed(3) + ' TND', sub: d.todayJobs + ' interventions', color: COLORS.accent },
              { label: 'Cette semaine', value: d.weekEarnings.toFixed(3) + ' TND', color: COLORS.blue },
              { label: 'Ce mois', value: d.monthEarnings.toFixed(3) + ' TND', color: COLORS.green },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
                {s.sub && <Text style={styles.statSub}>{s.sub}</Text>}
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>HISTORIQUE DES INTERVENTIONS</Text>
          {d.history.map((item, i) => (
            <View key={i} style={styles.historyCard}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyType}>{item.type}</Text>
                <Text style={styles.historyMeta}>{item.client} · {item.date}</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyAmount}>{item.amount.toFixed(3)} TND</Text>
                <View style={[styles.historyStatus, {
                  backgroundColor: item.status === 'PAID' ? COLORS.green + '20' : COLORS.accent + '20',
                  borderColor: item.status === 'PAID' ? COLORS.green + '50' : COLORS.accent + '50',
                }]}>
                  <Text style={{ color: item.status === 'PAID' ? COLORS.green : COLORS.accent, fontSize: 10, fontWeight: '700' }}>
                    {item.status === 'PAID' ? 'Payé' : 'En attente'}
                  </Text>
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
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  scroll: { padding: 16 },
  balanceCard: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 16,
    borderWidth: 1.5, borderColor: COLORS.accent + '40',
  },
  balanceLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 6 },
  balanceAmount: { color: COLORS.accent, fontSize: 42, fontWeight: '900', lineHeight: 46 },
  balanceTND: { color: COLORS.accent, fontSize: 14, fontWeight: '600', marginBottom: 10 },
  pendingBadge: { backgroundColor: COLORS.accent + '15', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 16 },
  pendingText: { color: COLORS.accent, fontSize: 12, fontWeight: '600' },
  withdrawBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 12,
    paddingHorizontal: 28, marginTop: 6,
  },
  withdrawBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
  statsGrid: { gap: 10, marginBottom: 20 },
  statCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  statValue: { fontSize: 18, fontWeight: '800', marginBottom: 3 },
  statLabel: { color: COLORS.muted, fontSize: 12 },
  statSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  historyCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  historyLeft: { flex: 1 },
  historyType: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 3 },
  historyMeta: { color: COLORS.muted, fontSize: 11 },
  historyRight: { alignItems: 'flex-end', gap: 5 },
  historyAmount: { color: COLORS.accent, fontSize: 14, fontWeight: '800' },
  historyStatus: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
});
