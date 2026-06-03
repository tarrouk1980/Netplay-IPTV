import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', purple: '#9B59B6', orange: '#E67E22',
};

const SERVICES = [
  { id: 'taxi', icon: '🚕', label: 'Taxi', color: COLORS.accent },
  { id: 'delivery', icon: '🛵', label: 'Livraison', color: COLORS.green },
  { id: 'sos', icon: '🔧', label: 'SOS', color: COLORS.red },
  { id: 'grocery', icon: '🛒', label: 'Épicerie', color: COLORS.blue },
];

const generateStats = () => ({
  activeRides: Math.floor(Math.random() * 40) + 20,
  onlineDrivers: Math.floor(Math.random() * 80) + 60,
  ordersToday: Math.floor(Math.random() * 200) + 350,
  revenueToday: (Math.random() * 3000 + 4000).toFixed(2),
  pendingSOS: Math.floor(Math.random() * 5),
  avgETA: Math.floor(Math.random() * 5) + 6,
  cancelRate: (Math.random() * 3 + 1).toFixed(1),
  satisfaction: (Math.random() * 0.3 + 4.6).toFixed(1),
  byService: {
    taxi: { active: Math.floor(Math.random() * 25) + 10, drivers: Math.floor(Math.random() * 40) + 30 },
    delivery: { active: Math.floor(Math.random() * 20) + 8, drivers: Math.floor(Math.random() * 30) + 20 },
    sos: { active: Math.floor(Math.random() * 5) + 1, drivers: Math.floor(Math.random() * 10) + 5 },
    grocery: { active: Math.floor(Math.random() * 15) + 5, drivers: Math.floor(Math.random() * 15) + 5 },
  },
});

const RECENT_EVENTS = [
  { time: '14:32', type: 'sos', msg: 'SOS activé — Zone Ariana', color: COLORS.red },
  { time: '14:28', msg: 'Pic de demande — Tunis Centre', type: 'peak', color: COLORS.orange },
  { time: '14:21', msg: 'Nouveau chauffeur connecté — Manouba', type: 'driver', color: COLORS.green },
  { time: '14:15', msg: '10 commandes épicerie en 5 min', type: 'grocery', color: COLORS.blue },
  { time: '14:08', msg: 'Litige signalé — Course #8812', type: 'dispute', color: COLORS.purple },
  { time: '13:55', msg: 'Panne système signalée — La Marsa', type: 'sos', color: COLORS.red },
];

export default function AdminLiveStatsScreen({ navigation }) {
  const [stats, setStats] = useState(generateStats());
  const [live, setLive] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (live) {
      intervalRef.current = setInterval(() => setStats(generateStats()), 5000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [live]);

  const KPICard = ({ icon, value, label, color, sub }) => (
    <View style={[styles.kpiCard, { borderColor: color + '55' }]}>
      <Text style={styles.kpiIcon}>{icon}</Text>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
      {sub && <Text style={styles.kpiSub}>{sub}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Stats en direct</Text>
          <View style={styles.liveRow}>
            <Animated.View style={[styles.liveDot, { transform: [{ scale: live ? pulseAnim : 1 }], backgroundColor: live ? COLORS.green : COLORS.muted }]} />
            <Text style={[styles.liveText, { color: live ? COLORS.green : COLORS.muted }]}>{live ? 'EN DIRECT' : 'PAUSE'}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.toggleLiveBtn, { borderColor: live ? COLORS.green : COLORS.border }]}
          onPress={() => setLive(p => !p)}
        >
          <Text style={{ color: live ? COLORS.green : COLORS.muted, fontSize: 12, fontWeight: '700' }}>
            {live ? '⏸' : '▶'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Main KPIs */}
        <View style={styles.kpiGrid}>
          <KPICard icon="🚗" value={stats.activeRides} label="Courses actives" color={COLORS.accent} />
          <KPICard icon="👤" value={stats.onlineDrivers} label="Chauf. en ligne" color={COLORS.green} />
          <KPICard icon="📦" value={stats.ordersToday} label="Commandes today" color={COLORS.blue} />
          <KPICard icon="💰" value={`${stats.revenueToday} TND`} label="Revenus today" color={COLORS.purple} />
          <KPICard icon="🆘" value={stats.pendingSOS} label="SOS en attente" color={stats.pendingSOS > 2 ? COLORS.red : COLORS.orange} />
          <KPICard icon="⏱" value={`${stats.avgETA} min`} label="ETA moyen" color={COLORS.accent} />
          <KPICard icon="❌" value={`${stats.cancelRate}%`} label="Taux annulation" color={parseFloat(stats.cancelRate) > 3 ? COLORS.red : COLORS.green} />
          <KPICard icon="⭐" value={stats.satisfaction} label="Satisfaction" color={COLORS.accent} sub="/5" />
        </View>

        {/* Per Service */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Par service</Text>
          <View style={styles.serviceGrid}>
            {SERVICES.map((s) => {
              const sd = stats.byService[s.id];
              return (
                <View key={s.id} style={[styles.serviceCard, { borderColor: s.color + '55' }]}>
                  <Text style={styles.serviceIcon}>{s.icon}</Text>
                  <Text style={[styles.serviceName, { color: s.color }]}>{s.label}</Text>
                  <Text style={styles.serviceActive}>{sd.active} actifs</Text>
                  <Text style={styles.serviceDrivers}>{sd.drivers} disponibles</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Hourly Mini Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Courses / heure (aujourd'hui)</Text>
          <View style={styles.chartRow}>
            {[12, 18, 24, 35, 42, 38, 55, 71, 68, 82, 90, 75].map((v, i) => (
              <View key={i} style={styles.chartBarWrapper}>
                <View style={[styles.chartBar, { height: (v / 90) * 100, backgroundColor: i === 11 ? COLORS.accent : COLORS.surface, borderTopWidth: 2, borderTopColor: i === 11 ? COLORS.accent : COLORS.blue + '88' }]} />
                <Text style={styles.chartHour}>{8 + i}h</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Événements récents</Text>
          {RECENT_EVENTS.map((e, i) => (
            <View key={i} style={styles.eventRow}>
              <View style={[styles.eventDot, { backgroundColor: e.color }]} />
              <Text style={styles.eventTime}>{e.time}</Text>
              <Text style={styles.eventMsg} numberOfLines={1}>{e.msg}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Actions rapides</Text>
          <View style={styles.quickActions}>
            {[
              { label: '🗺 Carte live', screen: 'AdminLiveMap' },
              { label: '🚨 SOS actifs', screen: 'AdminSOS' },
              { label: '📋 Commandes', screen: 'AdminOrders' },
              { label: '👥 Chauffeurs', screen: 'AdminDrivers' },
            ].map((a) => (
              <TouchableOpacity
                key={a.screen}
                style={styles.quickBtn}
                onPress={() => navigation.navigate(a.screen)}
              >
                <Text style={styles.quickBtnText}>{a.label}</Text>
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
  headerCenter: { alignItems: 'center' },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  toggleLiveBtn: {
    width: 34, height: 34, borderRadius: 10,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  kpiGrid: {
    flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 10,
  },
  kpiCard: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, borderWidth: 1, alignItems: 'center',
  },
  kpiIcon: { fontSize: 24, marginBottom: 6 },
  kpiValue: { fontSize: 22, fontWeight: '900' },
  kpiLabel: { color: COLORS.muted, fontSize: 11, marginTop: 3, textAlign: 'center' },
  kpiSub: { color: COLORS.muted, fontSize: 10 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  serviceGrid: { flexDirection: 'row', gap: 8 },
  serviceCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1,
    padding: 12, alignItems: 'center',
  },
  serviceIcon: { fontSize: 24, marginBottom: 4 },
  serviceName: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  serviceActive: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  serviceDrivers: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  chartRow: {
    flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 4,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  chartBarWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  chartBar: { width: '80%', borderRadius: 3 },
  chartHour: { color: COLORS.muted, fontSize: 8, marginTop: 3 },
  eventRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 10,
    padding: 12, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  eventDot: { width: 8, height: 8, borderRadius: 4 },
  eventTime: { color: COLORS.muted, fontSize: 11, width: 38 },
  eventMsg: { color: COLORS.white, fontSize: 13, flex: 1 },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickBtn: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  quickBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
});
