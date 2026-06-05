import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_STATS = {
  todayRevenue: 127.500, todayOrders: 18, pendingOrders: 3,
  monthRevenue: 3840.250, rating: 4.7, totalOrders: 612,
  topItems: [
    { name: 'Kafteji', count: 42 },
    { name: 'Sandwich Tunisien', count: 38 },
    { name: 'Lablabi', count: 31 },
  ],
  hourlyOrders: [0, 0, 0, 0, 0, 1, 2, 5, 8, 12, 9, 14, 18, 11, 7, 9, 13, 16, 11, 6, 3, 2, 1, 0],
};

function KPICard({ icon, value, label, color, onPress }) {
  return (
    <TouchableOpacity style={styles.kpiCard} onPress={onPress} activeOpacity={onPress ? 0.8 : 1}>
      <Text style={styles.kpiIcon}>{icon}</Text>
      <Text style={[styles.kpiValue, color && { color }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function MerchantDashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  const load = useCallback(() => {
    api.get('/api/merchant/dashboard')
      .then(r => setStats(r.data || MOCK_STATS))
      .catch(() => setStats(MOCK_STATS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleOpen = async () => {
    const next = !isOpen;
    setIsOpen(next);
    await api.post('/api/merchant/status', { open: next }).catch(() => setIsOpen(v => !v));
  };

  const peakHour = stats ? stats.hourlyOrders.indexOf(Math.max(...stats.hourlyOrders)) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginRight: 8 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '300' }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏪 Mon commerce</Text>
        <TouchableOpacity
          style={[styles.statusToggle, isOpen ? styles.statusOpen : styles.statusClosed]}
          onPress={toggleOpen}
        >
          <Text style={[styles.statusToggleText, isOpen ? { color: COLORS.green } : { color: COLORS.red }]}>
            {isOpen ? '🟢 Ouvert' : '🔴 Fermé'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Today hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroLabel}>CA aujourd'hui</Text>
              <Text style={styles.heroAmount}>{stats.todayRevenue.toFixed(3)}</Text>
              <Text style={styles.heroTND}>TND</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroRight}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>{stats.todayOrders}</Text>
                <Text style={styles.heroStatLabel}>commandes</Text>
              </View>
              {stats.pendingOrders > 0 && (
                <TouchableOpacity
                  style={styles.pendingAlert}
                  onPress={() => navigation.navigate('MerchantOrders')}
                >
                  <Text style={styles.pendingAlertText}>⚠️ {stats.pendingOrders} en attente</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* KPIs grid */}
          <View style={styles.kpiGrid}>
            <KPICard icon="📅" value={`${stats.monthRevenue.toFixed(0)} TND`} label="CA ce mois" color={COLORS.accent} />
            <KPICard icon="★" value={stats.rating} label="Note clients" color={COLORS.accent} />
            <KPICard icon="📦" value={stats.totalOrders} label="Total commandes" />
            <KPICard icon="🕐" value={`${peakHour}h`} label="Heure de pointe" color={COLORS.blue} />
          </View>

          {/* Top items */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>TOP ARTICLES DU JOUR</Text>
            {stats.topItems.map((item, i) => (
              <View key={i} style={styles.topItemRow}>
                <View style={[styles.rankBadge, i === 0 && { backgroundColor: COLORS.accent }]}>
                  <Text style={[styles.rankText, i === 0 && { color: '#000' }]}>#{i + 1}</Text>
                </View>
                <Text style={styles.topItemName}>{item.name}</Text>
                <Text style={styles.topItemCount}>{item.count}×</Text>
              </View>
            ))}
          </View>

          {/* Hourly chart */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ACTIVITÉ PAR HEURE</Text>
            <View style={styles.hourChart}>
              {stats.hourlyOrders.map((v, h) => {
                const maxV = Math.max(...stats.hourlyOrders, 1);
                return (
                  <View key={h} style={styles.hourCol}>
                    <View style={[styles.hourBar, {
                      height: Math.max(2, (v / maxV) * 60),
                      backgroundColor: h === peakHour ? COLORS.accent : COLORS.accent + '50',
                    }]} />
                    {h % 4 === 0 && <Text style={styles.hourLabel}>{h}h</Text>}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Quick actions */}
          <Text style={styles.sectionTitle}>ACTIONS RAPIDES</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: '📋', label: 'Commandes', screen: 'MerchantOrders', badge: stats.pendingOrders },
              { icon: '🍽️', label: 'Menu', screen: 'MerchantMenuEditor' },
              { icon: '💰', label: 'Revenus', screen: 'ProviderIncome' },
              { icon: '👤', label: 'Profil', screen: 'ProviderProfile' },
            ].map(a => (
              <TouchableOpacity key={a.screen} style={styles.actionBtn} onPress={() => navigation.navigate(a.screen)}>
                <View style={{ position: 'relative' }}>
                  <Text style={styles.actionIcon}>{a.icon}</Text>
                  {a.badge > 0 && (
                    <View style={styles.actionBadge}>
                      <Text style={styles.actionBadgeText}>{a.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

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
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  statusToggle: {
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1,
  },
  statusOpen: { backgroundColor: COLORS.green + '15', borderColor: COLORS.green + '50' },
  statusClosed: { backgroundColor: COLORS.red + '15', borderColor: COLORS.red + '50' },
  statusToggleText: { fontSize: 13, fontWeight: '700' },
  scroll: { padding: 16 },
  heroCard: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', marginBottom: 16,
    borderWidth: 1.5, borderColor: COLORS.accent + '40',
  },
  heroLeft: { flex: 1 },
  heroLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  heroAmount: { color: COLORS.accent, fontSize: 36, fontWeight: '900', lineHeight: 40 },
  heroTND: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  heroDivider: { width: 1, height: 60, backgroundColor: COLORS.border, marginHorizontal: 20 },
  heroRight: { alignItems: 'flex-end', gap: 8 },
  heroStat: { alignItems: 'flex-end' },
  heroStatNum: { color: COLORS.text, fontSize: 24, fontWeight: '800' },
  heroStatLabel: { color: COLORS.muted, fontSize: 11 },
  pendingAlert: {
    backgroundColor: COLORS.orange + '20', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: COLORS.orange + '40',
  },
  pendingAlertText: { color: COLORS.orange, fontSize: 11, fontWeight: '700' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  kpiCard: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  kpiIcon: { fontSize: 22, marginBottom: 6 },
  kpiValue: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  kpiLabel: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  topItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  rankBadge: {
    width: 24, height: 24, borderRadius: 8, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  rankText: { color: COLORS.muted, fontSize: 11, fontWeight: '800' },
  topItemName: { flex: 1, color: COLORS.text, fontSize: 14 },
  topItemCount: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
  hourChart: { flexDirection: 'row', alignItems: 'flex-end', height: 70, gap: 2 },
  hourCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  hourBar: { width: '100%', borderRadius: 2 },
  hourLabel: { color: COLORS.muted, fontSize: 8, marginTop: 3 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  actionIcon: { fontSize: 26, marginBottom: 6 },
  actionLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  actionBadge: {
    position: 'absolute', top: -4, right: -8,
    backgroundColor: COLORS.red, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1,
  },
  actionBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
});
