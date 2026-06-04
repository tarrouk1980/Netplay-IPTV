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
    total: 3241, completed: 3098, cancelled: 143, cancelRate: 4.4,
    avgFare: 14.80, revenue: 45810, onTime: 88.6, avgDistance: 6.2,
    activeDrivers: 87, onlineNow: 42,
    weeklyData: [380, 512, 448, 621, 598, 440, 242],
    topDrivers: [
      { name: 'Achraf B.', rides: 88, rating: 4.9, earnings: 1302 },
      { name: 'Mohamed S.', rides: 74, rating: 4.8, earnings: 1095 },
      { name: 'Sami T.', rides: 61, rating: 4.7, earnings: 903 },
    ],
    topZones: [
      { name: 'Tunis Centre', rides: 1241, pct: 38 },
      { name: 'La Marsa', rides: 812, pct: 25 },
      { name: 'Ariana', rides: 648, pct: 20 },
      { name: 'Autres', rides: 540, pct: 17 },
    ],
  },
};

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function AdminTaxiStatsScreen({ navigation }) {
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
        <Text style={styles.headerTitle}>Stats Taxi</Text>
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

        {/* Live row */}
        <View style={styles.liveRow}>
          <View style={[styles.liveCard, { borderColor: COLORS.green + '55' }]}>
            <View style={styles.liveDotWrap}>
              <View style={styles.liveDot} />
              <Text style={{ color: COLORS.green, fontSize: 11, fontWeight: '700' }}>EN LIGNE</Text>
            </View>
            <Text style={[styles.liveNum, { color: COLORS.green }]}>{data.onlineNow}</Text>
            <Text style={styles.liveLbl}>Chauffeurs actifs</Text>
          </View>
          <View style={[styles.liveCard, { borderColor: COLORS.blue + '55' }]}>
            <Text style={{ fontSize: 20, marginBottom: 4 }}>🚕</Text>
            <Text style={[styles.liveNum, { color: COLORS.blue }]}>{data.activeDrivers}</Text>
            <Text style={styles.liveLbl}>Total inscrits</Text>
          </View>
        </View>

        {/* KPI grid */}
        <View style={styles.kpiGrid}>
          {[
            { icon: '🚕', label: 'Courses total', value: data.total.toLocaleString(), color: COLORS.white },
            { icon: '✅', label: 'Complétées', value: data.completed.toLocaleString(), color: COLORS.green },
            { icon: '❌', label: 'Annulées', value: `${data.cancelled} (${data.cancelRate}%)`, color: data.cancelRate > 5 ? COLORS.red : COLORS.muted },
            { icon: '💰', label: 'CA total', value: `${data.revenue.toLocaleString()} TND`, color: COLORS.accent },
            { icon: '📏', label: 'Distance moy.', value: `${data.avgDistance} km`, color: COLORS.blue },
            { icon: '🎯', label: 'Ponctualité', value: `${data.onTime}%`, color: data.onTime >= 90 ? COLORS.green : COLORS.orange },
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
          <Text style={styles.sectionTitle}>📊 Courses par jour</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              {data.weeklyData.map((v, i) => (
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

        {/* Top zones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Zones les plus actives</Text>
          {data.topZones.map(z => (
            <View key={z.name} style={styles.zoneRow}>
              <Text style={styles.zoneName}>{z.name}</Text>
              <View style={styles.zoneBarWrap}>
                <View style={[styles.zoneBar, { width: `${z.pct}%` }]} />
              </View>
              <Text style={styles.zonePct}>{z.pct}%</Text>
              <Text style={styles.zoneRides}>{z.rides.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Top drivers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Top chauffeurs</Text>
          {data.topDrivers.map((d, i) => (
            <View key={d.name} style={styles.rankRow}>
              <Text style={styles.rankNum}>#{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rankName}>{d.name}</Text>
                <Text style={styles.rankSub}>{d.rides} courses · ⭐ {d.rating}</Text>
              </View>
              <Text style={styles.rankEarnings}>{d.earnings.toLocaleString()} TND</Text>
            </View>
          ))}
        </View>

        {/* Quick links */}
        <View style={styles.section}>
          <View style={styles.linksRow}>
            {[
              { label: '🚗 Chauffeurs', screen: 'AdminDrivers' },
              { label: '📋 Courses', screen: 'AdminOrders' },
              { label: '🗺️ Live map', screen: 'AdminLiveMap' },
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
  liveRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
  liveCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1 },
  liveDotWrap: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: COLORS.green },
  liveNum: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
  liveLbl: { color: COLORS.muted, fontSize: 11 },
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
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  zoneName: { color: COLORS.white, fontSize: 12, width: 90 },
  zoneBarWrap: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  zoneBar: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 4 },
  zonePct: { color: COLORS.muted, fontSize: 11, width: 32, textAlign: 'right' },
  zoneRides: { color: COLORS.white, fontSize: 12, fontWeight: '700', width: 44, textAlign: 'right' },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  rankNum: { color: COLORS.accent, fontSize: 16, fontWeight: '900', width: 28 },
  rankName: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  rankSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  rankEarnings: { color: COLORS.green, fontSize: 13, fontWeight: '800' },
  linksRow: { flexDirection: 'row', gap: 8 },
  linkBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  linkBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
});
