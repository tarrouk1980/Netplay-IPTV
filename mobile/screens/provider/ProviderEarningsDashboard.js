import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const PERIODS = ['Auj.', '7j', '30j', '3m'];

const MOCK = {
  today: { gross: 84.50, trips: 7, bonus: 5.00, net: 89.50 },
  week:  { gross: 412.00, trips: 38, bonus: 20.00, net: 432.00 },
  month: { gross: 1820.00, trips: 162, bonus: 80.00, net: 1900.00 },
  quarter: { gross: 5200.00, trips: 480, bonus: 220.00, net: 5420.00 },
  weeklyData: [52, 78, 61, 90, 84, 72, 84],
  recentPayouts: [
    { id: 'PAY-0091', date: '01/06/2026', amount: 450.00, method: 'D17', status: 'done' },
    { id: 'PAY-0085', date: '25/05/2026', amount: 380.00, method: 'CCP', status: 'done' },
    { id: 'PAY-0079', date: '18/05/2026', amount: 520.00, method: 'D17', status: 'done' },
  ],
  bonuses: [
    { label: 'Bonus pointe 08h-10h', amount: 5.00, date: 'Auj.' },
    { label: 'Bonus top chauffeur semaine', amount: 15.00, date: '01/06' },
    { label: 'Parrainage Sana B.', amount: 10.00, date: '28/05' },
  ],
};

const BAR_MAX = Math.max(...MOCK.weeklyData);
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const periodKey = { 'Auj.': 'today', '7j': 'week', '30j': 'month', '3m': 'quarter' };

export default function ProviderEarningsDashboard({ navigation }) {
  const [period, setPeriod] = useState('7j');
  const data = MOCK[periodKey[period]];

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes gains</Text>
        <TouchableOpacity onPress={() => navigation.navigate('DriverWithdraw')}>
          <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '600' }}>Retirer</Text>
        </TouchableOpacity>
      </View>

      {/* Period selector */}
      <View style={styles.periodRow}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && { color: '#000' }]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Gains nets · {period}</Text>
          <Text style={styles.heroAmount}>{data.net.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} TND</Text>
          <View style={styles.heroRow}>
            <View style={styles.heroSub}>
              <Text style={styles.heroSubNum}>{data.trips}</Text>
              <Text style={styles.heroSubLbl}>Courses</Text>
            </View>
            <View style={styles.heroSub}>
              <Text style={[styles.heroSubNum, { color: COLORS.green }]}>+{data.bonus.toFixed(2)} TND</Text>
              <Text style={styles.heroSubLbl}>Bonus</Text>
            </View>
            <View style={styles.heroSub}>
              <Text style={styles.heroSubNum}>{data.gross.toLocaleString()} TND</Text>
              <Text style={styles.heroSubLbl}>Brut</Text>
            </View>
          </View>
        </View>

        {/* Weekly chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Revenus 7 derniers jours</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              {MOCK.weeklyData.map((v, i) => (
                <View key={i} style={styles.chartBarCol}>
                  <Text style={styles.chartBarVal}>{v}</Text>
                  <View style={[
                    styles.chartBar,
                    {
                      height: (v / BAR_MAX) * 80,
                      backgroundColor: i === 6 ? COLORS.accent : COLORS.blue + '88',
                      borderTopWidth: 2,
                      borderTopColor: i === 6 ? COLORS.accent : COLORS.blue,
                    }
                  ]} />
                  <Text style={styles.chartBarDay}>{DAYS[i]}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Bonuses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎁 Bonus récents</Text>
          {MOCK.bonuses.map((b, i) => (
            <View key={i} style={styles.bonusRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bonusLabel}>{b.label}</Text>
                <Text style={styles.bonusDate}>{b.date}</Text>
              </View>
              <Text style={styles.bonusAmount}>+{b.amount.toFixed(2)} TND</Text>
            </View>
          ))}
        </View>

        {/* Payouts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💸 Versements récents</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DriverWithdraw')}>
              <Text style={styles.seeAll}>Tout voir ›</Text>
            </TouchableOpacity>
          </View>
          {MOCK.recentPayouts.map((p) => (
            <View key={p.id} style={styles.payoutRow}>
              <View style={styles.payoutIcon}>
                <Text style={{ fontSize: 20 }}>💳</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.payoutId}>{p.id} · {p.method}</Text>
                <Text style={styles.payoutDate}>{p.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.payoutAmount}>{p.amount.toFixed(2)} TND</Text>
                <Text style={{ color: COLORS.green, fontSize: 10, fontWeight: '700' }}>✓ Reçu</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Withdraw CTA */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.withdrawBtn}
            onPress={() => navigation.navigate('DriverWithdraw')}
          >
            <Text style={styles.withdrawBtnText}>💸 Demander un versement</Text>
          </TouchableOpacity>
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
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  periodRow: { flexDirection: 'row', gap: 8, padding: 12 },
  periodBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  periodBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  periodText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  heroCard: {
    margin: 16, backgroundColor: '#0A1A0A', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: COLORS.green,
  },
  heroLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  heroAmount: { color: COLORS.green, fontSize: 36, fontWeight: '900', marginBottom: 16 },
  heroRow: { flexDirection: 'row', gap: 20 },
  heroSub: {},
  heroSubNum: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  heroSubLbl: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  seeAll: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  chartCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', height: 110, gap: 6 },
  chartBarCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  chartBarVal: { color: COLORS.muted, fontSize: 8, marginBottom: 3 },
  chartBar: { width: '100%', borderRadius: 3 },
  chartBarDay: { color: COLORS.muted, fontSize: 9, marginTop: 4 },
  bonusRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  bonusLabel: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  bonusDate: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  bonusAmount: { color: COLORS.green, fontSize: 14, fontWeight: '800' },
  payoutRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, marginBottom: 6,
    borderWidth: 1, borderColor: COLORS.border,
  },
  payoutIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  payoutId: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  payoutDate: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  payoutAmount: { color: COLORS.accent, fontSize: 14, fontWeight: '800' },
  withdrawBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  withdrawBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
});
