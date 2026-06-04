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
    total: 1842, completed: 1786, cancelled: 56, cancelRate: 3.0,
    avgTime: '26 min', revenue: 9210, onTime: 91.4,
    topMerchants: [
      { name: 'Pizza Roma', orders: 312, revenue: 2184 },
      { name: 'Burger House', orders: 248, revenue: 1736 },
      { name: 'Sushi Palace', orders: 189, revenue: 1512 },
    ],
    topLivreurs: [
      { name: 'Khaled M.', deliveries: 88, rating: 4.9 },
      { name: 'Sami R.', deliveries: 74, rating: 4.8 },
      { name: 'Amine L.', deliveries: 61, rating: 4.7 },
    ],
    hourlyData: [5, 12, 18, 32, 28, 22, 14, 30, 45, 52, 48, 38, 20, 14, 18, 22, 35, 48, 55, 42, 30, 18, 10, 6],
  },
};

const BAR_MAX_H = 55;

export default function AdminDeliveryStatsScreen({ navigation }) {
  const [period, setPeriod] = useState('7j');
  const data = MOCK[period] || MOCK['7j'];

  const peakHour = data.hourlyData.indexOf(Math.max(...data.hourlyData));

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stats livraison</Text>
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

        {/* KPI grid */}
        <View style={styles.kpiGrid}>
          {[
            { icon: '📦', label: 'Commandes total', value: data.total.toLocaleString(), color: COLORS.white },
            { icon: '✅', label: 'Complétées', value: data.completed.toLocaleString(), color: COLORS.green },
            { icon: '❌', label: 'Annulées', value: `${data.cancelled} (${data.cancelRate}%)`, color: data.cancelRate > 5 ? COLORS.red : COLORS.muted },
            { icon: '⏱️', label: 'Temps moyen', value: data.avgTime, color: COLORS.blue },
            { icon: '💰', label: 'CA livraison', value: `${data.revenue.toLocaleString()} TND`, color: COLORS.accent },
            { icon: '🎯', label: 'Ponctualité', value: `${data.onTime}%`, color: data.onTime >= 90 ? COLORS.green : COLORS.orange },
          ].map((k, i) => (
            <View key={i} style={[styles.kpiCard, { borderColor: k.color + '33' }]}>
              <Text style={styles.kpiIcon}>{k.icon}</Text>
              <Text style={[styles.kpiVal, { color: k.color }]}>{k.value}</Text>
              <Text style={styles.kpiLabel}>{k.label}</Text>
            </View>
          ))}
        </View>

        {/* Hourly chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Activité par heure (moy. journalière)</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              {data.hourlyData.filter((_, i) => i % 2 === 0).map((v, i) => {
                const hour = i * 2;
                const isPeak = hour === peakHour || hour === peakHour - 1;
                return (
                  <View key={i} style={styles.chartBarCol}>
                    <View style={[
                      styles.chartBar,
                      {
                        height: (v / BAR_MAX_H) * 70,
                        backgroundColor: isPeak ? COLORS.accent : COLORS.blue + '77',
                        borderTopWidth: 2,
                        borderTopColor: isPeak ? COLORS.accent : COLORS.blue,
                      }
                    ]} />
                    <Text style={styles.chartBarLbl}>{hour}h</Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.peakNote}>🔥 Pic : {peakHour}h – {peakHour + 1}h</Text>
          </View>
        </View>

        {/* Top merchants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Top marchands</Text>
          {data.topMerchants.map((m, i) => (
            <View key={m.name} style={styles.rankRow}>
              <Text style={styles.rankNum}>#{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rankName}>{m.name}</Text>
                <Text style={styles.rankSub}>{m.orders} commandes</Text>
              </View>
              <Text style={styles.rankVal}>{m.revenue.toLocaleString()} TND</Text>
            </View>
          ))}
        </View>

        {/* Top livreurs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛵 Top livreurs</Text>
          {data.topLivreurs.map((l, i) => (
            <View key={l.name} style={styles.rankRow}>
              <Text style={styles.rankNum}>#{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rankName}>{l.name}</Text>
                <Text style={styles.rankSub}>{l.deliveries} livraisons</Text>
              </View>
              <Text style={[styles.rankVal, { color: COLORS.accent }]}>⭐ {l.rating}</Text>
            </View>
          ))}
        </View>

        {/* Quick links */}
        <View style={styles.section}>
          <View style={styles.linksRow}>
            {[
              { label: '🛵 Livreurs', screen: 'AdminDrivers' },
              { label: '🍕 Marchands', screen: 'AdminMerchants' },
              { label: '📋 Commandes', screen: 'AdminOrders' },
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
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  kpiCard: { width: '47%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1 },
  kpiIcon: { fontSize: 20, marginBottom: 6 },
  kpiVal: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  kpiLabel: { color: COLORS.muted, fontSize: 11 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  chartCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', height: 90, gap: 4 },
  chartBarCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  chartBar: { width: '100%', borderRadius: 3 },
  chartBarLbl: { color: COLORS.muted, fontSize: 8, marginTop: 4 },
  peakNote: { color: COLORS.accent, fontSize: 12, fontWeight: '700', marginTop: 10, textAlign: 'center' },
  rankRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, marginBottom: 6,
    borderWidth: 1, borderColor: COLORS.border,
  },
  rankNum: { color: COLORS.accent, fontSize: 16, fontWeight: '900', width: 28 },
  rankName: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  rankSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  rankVal: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
  linksRow: { flexDirection: 'row', gap: 8 },
  linkBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  linkBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
});
