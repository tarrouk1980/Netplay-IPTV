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

const PERIODS = ['7j', '30j', '3m'];

const MOCK = {
  '7j': {
    total: 248, completed: 231, pending: 4, cancelled: 13,
    avgResponseTime: '5.8 min', avgJobDuration: '42 min',
    revenue: 18600, avgFare: 75.00,
    activeDep: 18, onlineNow: 9,
    weeklyData: [28, 42, 35, 52, 44, 38, 9],
    incidentTypes: [
      { type: 'Crevaison', count: 88, pct: 35, icon: '🔧' },
      { type: 'Panne batterie', count: 62, pct: 25, icon: '🔋' },
      { type: 'Accident', count: 50, pct: 20, icon: '🚗' },
      { type: 'Remorquage', count: 30, pct: 12, icon: '🚛' },
      { type: 'Autre', count: 18, pct: 8, icon: '📝' },
    ],
    topDepanneurs: [
      { name: 'Karim SOS Express', jobs: 44, rating: 4.9, responseTime: '4.2 min' },
      { name: 'Mohamed Dépanne', jobs: 38, rating: 4.8, responseTime: '5.1 min' },
      { name: 'Amine SOS Pro', jobs: 29, rating: 4.7, responseTime: '6.8 min' },
    ],
  },
};

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function AdminSOSStatsScreen({ navigation }) {
  const [period, setPeriod] = useState('7j');
  const data = MOCK[period] || MOCK['7j'];
  const BAR_MAX = Math.max(...data.weeklyData);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stats SOS Dépannage</Text>
        <TouchableOpacity>
          <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '600' }}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Period */}
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

        {/* Live status */}
        <View style={styles.liveRow}>
          <View style={[styles.liveCard, { borderColor: COLORS.green + '55' }]}>
            <View style={styles.liveDotRow}>
              <View style={styles.liveDot} />
              <Text style={{ color: COLORS.green, fontSize: 10, fontWeight: '700' }}>EN LIGNE</Text>
            </View>
            <Text style={[styles.liveNum, { color: COLORS.green }]}>{data.onlineNow}</Text>
            <Text style={styles.liveLbl}>Dépanneurs actifs</Text>
          </View>
          <View style={[styles.liveCard, { borderColor: COLORS.orange + '55' }]}>
            <Text style={{ fontSize: 20, marginBottom: 4 }}>⏳</Text>
            <Text style={[styles.liveNum, { color: COLORS.orange }]}>{data.pending}</Text>
            <Text style={styles.liveLbl}>En attente</Text>
          </View>
          <View style={[styles.liveCard, { borderColor: COLORS.blue + '55' }]}>
            <Text style={{ fontSize: 20, marginBottom: 4 }}>⚡</Text>
            <Text style={[styles.liveNum, { color: COLORS.blue }]}>{data.avgResponseTime}</Text>
            <Text style={styles.liveLbl}>Réponse moy.</Text>
          </View>
        </View>

        {/* KPI grid */}
        <View style={styles.kpiGrid}>
          {[
            { icon: '🆘', label: 'Interventions', value: data.total, color: COLORS.white },
            { icon: '✅', label: 'Complétées', value: data.completed, color: COLORS.green },
            { icon: '💰', label: 'CA SOS', value: `${data.revenue.toLocaleString()} TND`, color: COLORS.accent },
            { icon: '📊', label: 'Fare moyen', value: `${data.avgFare.toFixed(0)} TND`, color: COLORS.blue },
            { icon: '⏱️', label: 'Durée moy.', value: data.avgJobDuration, color: COLORS.muted },
            { icon: '❌', label: 'Annulées', value: data.cancelled, color: COLORS.red },
          ].map((k, i) => (
            <View key={i} style={[styles.kpiCard, { borderColor: k.color + '33' }]}>
              <Text style={styles.kpiIcon}>{k.icon}</Text>
              <Text style={[styles.kpiVal, { color: k.color }]}>{k.value}</Text>
              <Text style={styles.kpiLabel}>{k.label}</Text>
            </View>
          ))}
        </View>

        {/* Weekly chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Interventions par jour</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              {data.weeklyData.map((v, i) => (
                <View key={i} style={styles.chartBarCol}>
                  <Text style={styles.chartBarVal}>{v}</Text>
                  <View style={[
                    styles.chartBar,
                    {
                      height: (v / BAR_MAX) * 80,
                      backgroundColor: i === 6 ? COLORS.accent : COLORS.red + '77',
                      borderTopWidth: 2,
                      borderTopColor: i === 6 ? COLORS.accent : COLORS.red,
                    }
                  ]} />
                  <Text style={styles.chartBarDay}>{DAYS[i]}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Incident types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Types d'incidents</Text>
          {data.incidentTypes.map(t => (
            <View key={t.type} style={styles.incidentRow}>
              <Text style={{ fontSize: 20, width: 28 }}>{t.icon}</Text>
              <Text style={styles.incidentType}>{t.type}</Text>
              <View style={styles.incidentBarWrap}>
                <View style={[styles.incidentBar, { width: `${t.pct}%` }]} />
              </View>
              <Text style={styles.incidentPct}>{t.pct}%</Text>
              <Text style={styles.incidentCount}>{t.count}</Text>
            </View>
          ))}
        </View>

        {/* Top depanneurs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Top dépanneurs</Text>
          {data.topDepanneurs.map((d, i) => (
            <View key={d.name} style={styles.rankRow}>
              <Text style={styles.rankNum}>#{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rankName}>{d.name}</Text>
                <Text style={styles.rankSub}>{d.jobs} interventions · ⏱ {d.responseTime}</Text>
              </View>
              <Text style={[styles.rankRating, { color: COLORS.accent }]}>⭐ {d.rating}</Text>
            </View>
          ))}
        </View>

        {/* Links */}
        <View style={styles.section}>
          <View style={styles.linksRow}>
            {[
              { label: '🆘 Interventions', screen: 'AdminSOSInterventions' },
              { label: '🔧 Dépanneurs', screen: 'AdminDrivers' },
            ].map(l => (
              <TouchableOpacity
                key={l.screen}
                style={styles.linkBtn}
                onPress={() => navigation.navigate(l.screen)}
              >
                <Text style={styles.linkBtnText}>{l.label}</Text>
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
  periodRow: { flexDirection: 'row', gap: 8, padding: 12 },
  periodBtn: { flex: 1, paddingVertical: 9, borderRadius: 20, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  periodBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  periodText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  liveRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  liveCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1 },
  liveDotRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: COLORS.green },
  liveNum: { fontSize: 20, fontWeight: '900', marginBottom: 2 },
  liveLbl: { color: COLORS.muted, fontSize: 10, textAlign: 'center' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  kpiCard: { width: '47%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1 },
  kpiIcon: { fontSize: 20, marginBottom: 6 },
  kpiVal: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  kpiLabel: { color: COLORS.muted, fontSize: 11 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  chartCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', height: 110, gap: 6 },
  chartBarCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  chartBarVal: { color: COLORS.muted, fontSize: 8, marginBottom: 3 },
  chartBar: { width: '100%', borderRadius: 3 },
  chartBarDay: { color: COLORS.muted, fontSize: 9, marginTop: 4 },
  incidentRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  incidentType: { color: COLORS.white, fontSize: 12, width: 80 },
  incidentBarWrap: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  incidentBar: { height: '100%', backgroundColor: COLORS.red, borderRadius: 4 },
  incidentPct: { color: COLORS.muted, fontSize: 11, width: 30, textAlign: 'right' },
  incidentCount: { color: COLORS.white, fontSize: 12, fontWeight: '700', width: 28, textAlign: 'right' },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  rankNum: { color: COLORS.accent, fontSize: 16, fontWeight: '900', width: 28 },
  rankName: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  rankSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  rankRating: { fontSize: 13, fontWeight: '800' },
  linksRow: { flexDirection: 'row', gap: 8 },
  linkBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  linkBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
});
