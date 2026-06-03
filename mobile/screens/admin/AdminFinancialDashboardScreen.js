import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22', purple: '#9B59B6',
};

const PERIODS = ['Auj.', '7j', '30j', '3m', '12m'];

const MOCK = {
  revenue: { today: 4210.50, week: 28400.00, month: 112000.00, growth: 12.4 },
  payouts: { pending: 18420.00, thisMonth: 89000.00, lastMonth: 79500.00 },
  refunds: { pending: 3, total: 1240.00, rate: 1.1 },
  commissions: { collected: 0, model: 'Zero commission' },
  topServices: [
    { name: 'Taxi', revenue: 48200, pct: 43 },
    { name: 'Livraison', revenue: 31100, pct: 28 },
    { name: 'SOS', revenue: 22400, pct: 20 },
    { name: 'Épicerie', revenue: 10300, pct: 9 },
  ],
  weeklyRevenue: [2100, 3200, 2800, 3900, 4100, 3600, 4210],
  recentTransactions: [
    { id: 'TXN-001', desc: 'Course taxi TXI-7741', amount: 16.50, time: '14:32', type: 'credit' },
    { id: 'TXN-002', desc: 'Remboursement RFD-0091', amount: -14.00, time: '13:55', type: 'debit' },
    { id: 'TXN-003', desc: 'Livraison DEL-4421', amount: 8.50, time: '13:10', type: 'credit' },
    { id: 'TXN-004', desc: 'SOS SOS-0041', amount: 85.00, time: '12:48', type: 'credit' },
    { id: 'TXN-005', desc: 'Versement chauffeur Achraf B.', amount: -780.00, time: '12:00', type: 'debit' },
  ],
};

const BAR_MAX = Math.max(...MOCK.weeklyRevenue);
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function AdminFinancialDashboardScreen({ navigation }) {
  const [period, setPeriod] = useState('7j');

  const revenueByPeriod = {
    'Auj.': MOCK.revenue.today,
    '7j': MOCK.revenue.week,
    '30j': MOCK.revenue.month,
    '3m': MOCK.revenue.month * 3,
    '12m': MOCK.revenue.month * 12,
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tableau financier</Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '600' }}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
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

        {/* Main Revenue Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Revenus totaux · {period}</Text>
          <Text style={styles.heroAmount}>{revenueByPeriod[period]?.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} TND</Text>
          <View style={styles.heroGrowth}>
            <Text style={[styles.growthText, { color: COLORS.green }]}>
              ↑ +{MOCK.revenue.growth}% vs période précédente
            </Text>
          </View>
          <View style={styles.heroRow}>
            <View style={styles.heroSub}>
              <Text style={styles.heroSubNum}>{MOCK.payouts.thisMonth.toLocaleString()} TND</Text>
              <Text style={styles.heroSubLbl}>Versements mois</Text>
            </View>
            <View style={styles.heroSub}>
              <Text style={[styles.heroSubNum, { color: MOCK.refunds.rate > 2 ? COLORS.red : COLORS.muted }]}>
                {MOCK.refunds.rate}%
              </Text>
              <Text style={styles.heroSubLbl}>Taux remboursements</Text>
            </View>
          </View>
        </View>

        {/* Zero Commission Banner */}
        <View style={styles.zeroBanner}>
          <Text style={styles.zeroBannerText}>
            ✅ Modèle <Text style={{ color: COLORS.green, fontWeight: '800' }}>ZERO COMMISSION</Text> — Revenus = frais de plateforme uniquement
          </Text>
        </View>

        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          {[
            { icon: '💸', label: 'Versements en attente', value: `${MOCK.payouts.pending.toLocaleString()} TND`, color: COLORS.orange },
            { icon: '🔄', label: 'Remboursements en attente', value: `${MOCK.refunds.pending} · ${MOCK.refunds.total.toFixed(0)} TND`, color: COLORS.red },
            { icon: '📈', label: 'Mois précédent', value: `${MOCK.payouts.lastMonth.toLocaleString()} TND`, color: COLORS.muted },
            { icon: '⭐', label: 'Abonnements EasyPass', value: '320 actifs', color: COLORS.purple },
          ].map((k, i) => (
            <View key={i} style={[styles.kpiCard, { borderColor: k.color + '44' }]}>
              <Text style={styles.kpiIcon}>{k.icon}</Text>
              <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
              <Text style={styles.kpiLabel}>{k.label}</Text>
            </View>
          ))}
        </View>

        {/* Weekly Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Revenus 7 derniers jours</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              {MOCK.weeklyRevenue.map((v, i) => (
                <View key={i} style={styles.chartBarCol}>
                  <Text style={styles.chartBarValue}>{(v / 1000).toFixed(1)}k</Text>
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

        {/* Top Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Revenus par service</Text>
          {MOCK.topServices.map((s) => (
            <View key={s.name} style={styles.serviceRow}>
              <Text style={styles.serviceName}>{s.name}</Text>
              <View style={styles.serviceBarWrap}>
                <View style={[styles.serviceBar, { width: `${s.pct}%` }]} />
              </View>
              <Text style={styles.servicePct}>{s.pct}%</Text>
              <Text style={styles.serviceAmt}>{s.revenue.toLocaleString()} TND</Text>
            </View>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🧾 Transactions récentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminPayments')}>
              <Text style={styles.seeAllText}>Tout voir ›</Text>
            </TouchableOpacity>
          </View>
          {MOCK.recentTransactions.map((t) => (
            <View key={t.id} style={styles.txnRow}>
              <View style={[styles.txnIcon, { backgroundColor: t.type === 'credit' ? '#0D2E0D' : '#1A0808' }]}>
                <Text style={{ fontSize: 16 }}>{t.type === 'credit' ? '↓' : '↑'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txnDesc} numberOfLines={1}>{t.desc}</Text>
                <Text style={styles.txnTime}>{t.time} · {t.id}</Text>
              </View>
              <Text style={[
                styles.txnAmount,
                { color: t.type === 'credit' ? COLORS.green : COLORS.red }
              ]}>
                {t.type === 'credit' ? '+' : ''}{t.amount.toFixed(2)} TND
              </Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Actions</Text>
          <View style={styles.actionsRow}>
            {[
              { label: '💸 Versements', screen: 'AdminProviderPayouts' },
              { label: '🔄 Remboursements', screen: 'AdminRefunds' },
              { label: '📄 Rapport PDF', screen: 'AdminFinancialReport' },
            ].map((a) => (
              <TouchableOpacity
                key={a.screen}
                style={styles.actionBtn}
                onPress={() => navigation.navigate(a.screen)}
              >
                <Text style={styles.actionBtnText}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  periodRow: { flexDirection: 'row', gap: 6, padding: 12 },
  periodBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  periodBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  periodText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  heroCard: {
    margin: 16, backgroundColor: '#0A1A0A', borderRadius: 16,
    padding: 20, borderWidth: 1, borderColor: COLORS.green,
  },
  heroLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  heroAmount: { color: COLORS.green, fontSize: 36, fontWeight: '900', marginBottom: 6 },
  heroGrowth: { marginBottom: 16 },
  growthText: { fontSize: 12, fontWeight: '600' },
  heroRow: { flexDirection: 'row', gap: 20 },
  heroSub: {},
  heroSubNum: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  heroSubLbl: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  zeroBanner: {
    marginHorizontal: 16, marginBottom: 12, backgroundColor: '#0D2E0D',
    borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.green,
  },
  zeroBannerText: { color: COLORS.muted, fontSize: 12, textAlign: 'center' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  kpiCard: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, borderWidth: 1,
  },
  kpiIcon: { fontSize: 22, marginBottom: 6 },
  kpiValue: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  kpiLabel: { color: COLORS.muted, fontSize: 11 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  seeAllText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  chartCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', height: 110, gap: 6 },
  chartBarCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  chartBarValue: { color: COLORS.muted, fontSize: 8, marginBottom: 3 },
  chartBar: { width: '100%', borderRadius: 3 },
  chartBarDay: { color: COLORS.muted, fontSize: 9, marginTop: 4 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  serviceName: { color: COLORS.white, fontSize: 13, width: 72 },
  serviceBarWrap: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  serviceBar: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 4 },
  servicePct: { color: COLORS.muted, fontSize: 12, width: 32, textAlign: 'right' },
  serviceAmt: { color: COLORS.white, fontSize: 12, fontWeight: '600', width: 80, textAlign: 'right' },
  txnRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, marginBottom: 6,
    borderWidth: 1, borderColor: COLORS.border,
  },
  txnIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  txnDesc: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  txnTime: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  txnAmount: { fontSize: 14, fontWeight: '800' },
  actionsRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  actionBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
});
