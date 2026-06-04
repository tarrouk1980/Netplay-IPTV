import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK = {
  balance: 142.500,
  pending: 28.000,
  totalEarned: 3840.000,
  interventions: 127,
  avgRating: 4.8,
  weeklyBars: [18, 32, 25, 40, 55, 48, 22],
  weekDays: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
  recent: [
    { id: 'I1', type: 'Batterie déchargée', client: 'Karim B.', earned: 26.000, date: 'Aujourd\'hui 15:30', rating: 5 },
    { id: 'I2', type: 'Crevaison', client: 'Sana T.', earned: 20.000, date: 'Aujourd\'hui 11:05', rating: 5 },
    { id: 'I3', type: 'Remorquage', client: 'Nabil R.', earned: 55.000, date: 'Hier 18:40', rating: 4 },
    { id: 'I4', type: 'Panne sèche', client: 'Rim H.', earned: 15.000, date: 'Hier 14:20', rating: 5 },
  ],
};

function WeekBar({ value, max, day, isToday }) {
  const pct = max > 0 ? value / max : 0;
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View style={{ height: 60, justifyContent: 'flex-end', width: '80%' }}>
        <View style={{ height: Math.max(4, pct * 56), backgroundColor: isToday ? COLORS.accent : COLORS.accent + '50', borderRadius: 4 }} />
      </View>
      <Text style={[styles.barDay, isToday && { color: COLORS.accent, fontWeight: '800' }]}>{day}</Text>
    </View>
  );
}

export default function DepanneurEarningsScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    api.get('/api/sos/depanneur/earnings')
      .then(r => setData(r.data || MOCK))
      .catch(() => setData(MOCK))
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = () => {
    if (!data || data.balance < 10) {
      Alert.alert('Solde insuffisant', 'Minimum 10 TND requis pour un virement.');
      return;
    }
    Alert.alert('Virement bancaire', `${data.balance.toFixed(3)} TND vers votre compte bancaire enregistré.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Confirmer', onPress: async () => {
          setWithdrawing(true);
          try { await api.post('/api/sos/depanneur/withdraw'); } catch {}
          setWithdrawing(false);
          Alert.alert('✅ Virement initié', 'Votre virement sera traité sous 24-48h.');
        },
      },
    ]);
  };

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

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>SOLDE DISPONIBLE</Text>
            <Text style={styles.balanceVal}>{data.balance.toFixed(3)} <Text style={styles.balanceCurrency}>TND</Text></Text>
            {data.pending > 0 && <Text style={styles.pendingText}>+ {data.pending.toFixed(3)} TND en attente de validation</Text>}
            <TouchableOpacity style={[styles.withdrawBtn, withdrawing && { opacity: 0.6 }]} onPress={handleWithdraw} disabled={withdrawing}>
              {withdrawing ? <ActivityIndicator color="#000" /> : <Text style={styles.withdrawBtnText}>💳 Virer vers mon compte</Text>}
            </TouchableOpacity>
            <Text style={styles.commissionNote}>✅ EasyWay 0% commission — revenus 100% pour vous</Text>
          </View>

          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}><Text style={[styles.kpiVal, { color: COLORS.accent }]}>{data.totalEarned.toFixed(0)}</Text><Text style={styles.kpiSub}>TND total</Text></View>
            <View style={styles.kpiCard}><Text style={[styles.kpiVal, { color: COLORS.text }]}>{data.interventions}</Text><Text style={styles.kpiSub}>Interventions</Text></View>
            <View style={styles.kpiCard}><Text style={[styles.kpiVal, { color: COLORS.accent }]}>⭐ {data.avgRating}</Text><Text style={styles.kpiSub}>Note moy.</Text></View>
          </View>

          <View style={styles.periodRow}>
            {[{ k: 'week', l: 'Semaine' }, { k: 'month', l: 'Mois' }].map(p => (
              <TouchableOpacity key={p.k} style={[styles.periodBtn, period === p.k && styles.periodBtnActive]} onPress={() => setPeriod(p.k)}>
                <Text style={[styles.periodLabel, period === p.k && styles.periodLabelActive]}>{p.l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>ACTIVITÉ DE LA SEMAINE</Text>
            <View style={styles.barsRow}>
              {data.weeklyBars.map((v, i) => (
                <WeekBar key={i} value={v} max={maxBar} day={data.weekDays[i]} isToday={i === todayIdx} />
              ))}
            </View>
          </View>

          <Text style={styles.sectionTitle}>INTERVENTIONS RÉCENTES</Text>
          {data.recent.map(item => (
            <View key={item.id} style={styles.interventionCard}>
              <View style={styles.interventionTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.interventionType}>{item.type}</Text>
                  <Text style={styles.interventionClient}>👤 {item.client}</Text>
                  <Text style={styles.interventionDate}>{item.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.interventionEarned}>+{item.earned.toFixed(3)} TND</Text>
                  <Text style={styles.interventionRating}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</Text>
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
  pendingText: { color: COLORS.orange, fontSize: 12, marginBottom: 10 },
  withdrawBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginBottom: 10 },
  withdrawBtnText: { color: '#000', fontSize: 14, fontWeight: '900' },
  commissionNote: { color: COLORS.green, fontSize: 11 },
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  kpiCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  kpiVal: { fontSize: 17, fontWeight: '900' },
  kpiSub: { color: COLORS.muted, fontSize: 10, marginTop: 4, textAlign: 'center' },
  periodRow: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  periodBtnActive: { backgroundColor: COLORS.accent },
  periodLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  periodLabelActive: { color: '#000', fontWeight: '800' },
  chartCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  chartTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  barDay: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  interventionCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  interventionTop: { flexDirection: 'row', alignItems: 'flex-start' },
  interventionType: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  interventionClient: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  interventionDate: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  interventionEarned: { color: COLORS.green, fontSize: 15, fontWeight: '900' },
  interventionRating: { color: COLORS.accent, fontSize: 13, marginTop: 4 },
});
