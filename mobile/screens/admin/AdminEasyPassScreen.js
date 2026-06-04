import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22', purple: '#9B59B6',
};

const MOCK_STATS = {
  active: 320, expired: 44, revenue: 9600, churnRate: 4.2, avgDuration: 3.1,
  newThisMonth: 58, renewals: 24,
};

const MOCK_PLANS = [
  { id: 'monthly', name: 'Mensuel', price: 29, duration: '1 mois', subscribers: 198, color: COLORS.blue },
  { id: 'quarterly', name: 'Trimestriel', price: 79, duration: '3 mois', subscribers: 91, color: COLORS.accent },
  { id: 'annual', name: 'Annuel', price: 289, duration: '12 mois', subscribers: 31, color: COLORS.purple },
];

const MOCK_SUBSCRIBERS = [
  { id: 1, name: 'Sana Belhaj', plan: 'Mensuel', start: '01/06/2026', end: '01/07/2026', status: 'active', auto: true },
  { id: 2, name: 'Karim Lakhal', plan: 'Trimestriel', start: '15/04/2026', end: '15/07/2026', status: 'active', auto: false },
  { id: 3, name: 'Ines Mansouri', plan: 'Annuel', start: '10/01/2026', end: '10/01/2027', status: 'active', auto: true },
  { id: 4, name: 'Youssef Triki', plan: 'Mensuel', start: '01/05/2026', end: '01/06/2026', status: 'expired', auto: false },
];

const SUB_STATUS = {
  active:  { label: 'Actif',   color: COLORS.green },
  expired: { label: 'Expiré',  color: COLORS.muted },
};

export default function AdminEasyPassScreen({ navigation }) {
  const [tab, setTab] = useState('overview');

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion EasyPass</Text>
        <TouchableOpacity>
          <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '600' }}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {[['overview', '📊 Vue d\'ensemble'], ['subscribers', '👥 Abonnés'], ['plans', '📋 Forfaits']].map(([val, lbl]) => (
          <TouchableOpacity
            key={val}
            style={[styles.tab, tab === val && styles.tabActive]}
            onPress={() => setTab(val)}
          >
            <Text style={[styles.tabText, tab === val && { color: '#000' }]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {tab === 'overview' && (
          <>
            {/* KPIs */}
            <View style={styles.kpiGrid}>
              {[
                { icon: '✅', label: 'Abonnés actifs', value: MOCK_STATS.active, color: COLORS.green },
                { icon: '💰', label: 'Revenus ce mois', value: `${MOCK_STATS.revenue.toLocaleString()} TND`, color: COLORS.accent },
                { icon: '📈', label: 'Nouveaux ce mois', value: MOCK_STATS.newThisMonth, color: COLORS.blue },
                { icon: '🔄', label: 'Renouvellements', value: MOCK_STATS.renewals, color: COLORS.purple },
                { icon: '❌', label: 'Expirés', value: MOCK_STATS.expired, color: COLORS.muted },
                { icon: '📉', label: 'Taux résiliation', value: `${MOCK_STATS.churnRate}%`, color: COLORS.red },
              ].map((k, i) => (
                <View key={i} style={[styles.kpiCard, { borderColor: k.color + '44' }]}>
                  <Text style={styles.kpiIcon}>{k.icon}</Text>
                  <Text style={[styles.kpiVal, { color: k.color }]}>{k.value}</Text>
                  <Text style={styles.kpiLabel}>{k.label}</Text>
                </View>
              ))}
            </View>

            {/* Revenue trend */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Répartition par forfait</Text>
              {MOCK_PLANS.map((p) => {
                const pct = Math.round((p.subscribers / MOCK_STATS.active) * 100);
                return (
                  <View key={p.id} style={styles.planBar}>
                    <Text style={[styles.planName, { color: p.color }]}>{p.name}</Text>
                    <View style={styles.planBarWrap}>
                      <View style={[styles.planBarFill, { width: `${pct}%`, backgroundColor: p.color }]} />
                    </View>
                    <Text style={styles.planPct}>{pct}%</Text>
                    <Text style={styles.planCount}>{p.subscribers}</Text>
                  </View>
                );
              })}
            </View>

            {/* Avg duration */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>📆 Durée moyenne d'abonnement</Text>
              <Text style={[styles.infoVal, { color: COLORS.purple }]}>{MOCK_STATS.avgDuration} mois</Text>
            </View>
          </>
        )}

        {tab === 'subscribers' && (
          <>
            {MOCK_SUBSCRIBERS.map((s) => {
              const meta = SUB_STATUS[s.status];
              return (
                <View key={s.id} style={styles.subCard}>
                  <View style={styles.subTop}>
                    <View>
                      <Text style={styles.subName}>{s.name}</Text>
                      <Text style={styles.subPlan}>Forfait {s.plan}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: meta.color + '22' }]}>
                      <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                    </View>
                  </View>
                  <View style={styles.subDates}>
                    <Text style={styles.subDate}>Début : {s.start}</Text>
                    <Text style={styles.subDate}>Fin : {s.end}</Text>
                    <Text style={[styles.subAuto, { color: s.auto ? COLORS.green : COLORS.muted }]}>
                      {s.auto ? '🔄 Auto-renouvellement' : '❌ Manuel'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {tab === 'plans' && (
          <>
            {MOCK_PLANS.map((p) => (
              <View key={p.id} style={[styles.planCard, { borderColor: p.color + '55' }]}>
                <View style={styles.planCardTop}>
                  <Text style={[styles.planCardName, { color: p.color }]}>{p.name}</Text>
                  <Text style={styles.planCardPrice}>{p.price} TND / {p.duration}</Text>
                </View>
                <View style={styles.planCardStats}>
                  <Text style={styles.planStatText}>👥 {p.subscribers} abonnés actifs</Text>
                  <Text style={styles.planStatText}>
                    💰 {(p.subscribers * p.price).toLocaleString()} TND/mois
                  </Text>
                </View>
                <TouchableOpacity style={[styles.editPlanBtn, { borderColor: p.color }]}>
                  <Text style={[styles.editPlanText, { color: p.color }]}>✏️ Modifier le forfait</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addPlanBtn}>
              <Text style={styles.addPlanText}>＋ Créer un nouveau forfait</Text>
            </TouchableOpacity>
          </>
        )}

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
  tabRow: { flexDirection: 'row', gap: 6, padding: 12 },
  tab: {
    flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  kpiCard: {
    width: '31%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1,
  },
  kpiIcon: { fontSize: 20, marginBottom: 4 },
  kpiVal: { fontSize: 16, fontWeight: '900', marginBottom: 2 },
  kpiLabel: { color: COLORS.muted, fontSize: 10, textAlign: 'center' },
  section: { marginBottom: 16 },
  sectionTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  planBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  planName: { fontSize: 12, fontWeight: '700', width: 80 },
  planBarWrap: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  planBarFill: { height: '100%', borderRadius: 4 },
  planPct: { color: COLORS.muted, fontSize: 11, width: 30, textAlign: 'right' },
  planCount: { color: COLORS.white, fontSize: 12, fontWeight: '700', width: 28, textAlign: 'right' },
  infoCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1,
    borderColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  infoTitle: { color: COLORS.muted, fontSize: 13 },
  infoVal: { fontSize: 20, fontWeight: '900' },
  subCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1,
    borderColor: COLORS.border, marginBottom: 8,
  },
  subTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  subName: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  subPlan: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  subDates: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  subDate: { color: COLORS.muted, fontSize: 11 },
  subAuto: { fontSize: 11, fontWeight: '600' },
  planCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 10,
  },
  planCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  planCardName: { fontSize: 16, fontWeight: '900' },
  planCardPrice: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  planCardStats: { gap: 4, marginBottom: 12 },
  planStatText: { color: COLORS.muted, fontSize: 13 },
  editPlanBtn: {
    borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1,
  },
  editPlanText: { fontSize: 13, fontWeight: '700' },
  addPlanBtn: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.accent, borderStyle: 'dashed',
  },
  addPlanText: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
});
