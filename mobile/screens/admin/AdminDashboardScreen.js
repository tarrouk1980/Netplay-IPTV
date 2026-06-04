import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl, BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', purple: '#9B59B6',
};

const MOCK = {
  revenue: { today: 4280.750, month: 124850.750, growth: 12.4 },
  orders: { today: 312, active: 47, pending: 8 },
  users: { total: 18432, newToday: 24, providers: 342 },
  services: [
    { name: 'Taxi', icon: '🚕', active: 28, color: COLORS.accent },
    { name: 'Livraison', icon: '📦', active: 12, color: COLORS.blue },
    { name: 'Épicerie', icon: '🛒', active: 5, color: COLORS.green },
    { name: 'SOS', icon: '🔧', active: 3, color: COLORS.red },
  ],
  alerts: [
    { type: 'KYC', message: '3 dossiers KYC en attente d\'approbation', color: COLORS.accent },
    { type: 'ORDER', message: '8 commandes sans chauffeur depuis >10min', color: COLORS.red },
  ],
};

function KPICard({ icon, label, value, sub, color, onPress }) {
  return (
    <TouchableOpacity
      style={styles.kpiCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <Text style={styles.kpiIcon}>{icon}</Text>
      <Text style={[styles.kpiValue, color && { color }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
      {sub && <Text style={styles.kpiSub}>{sub}</Text>}
    </TouchableOpacity>
  );
}

export default function AdminDashboardScreen({ navigation }) {
  const { logout } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/api/admin/dashboard');
      setData(res.data || MOCK);
    } catch {
      setData(MOCK);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Block Android hardware back button — AdminDashboard is the root screen
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, [])
  );

  const onRefresh = () => { setRefreshing(true); load(true); };

  const d = data || MOCK;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>⚡ EASYWAY Admin</Text>
          <Text style={styles.headerSub}>Tableau de bord</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('AdminLiveMap')}>
            <Text style={{ fontSize: 18 }}>🗺️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => { logout(); navigation.replace('Login'); }}>
            <Text style={{ fontSize: 18 }}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
        >
          {/* Alerts */}
          {d.alerts?.map((alert, i) => (
            <View key={i} style={[styles.alertCard, { borderColor: alert.color + '50', backgroundColor: alert.color + '12' }]}>
              <Text style={[styles.alertText, { color: alert.color }]}>⚠️ {alert.message}</Text>
            </View>
          ))}

          {/* Revenue hero */}
          <View style={styles.revenueHero}>
            <View>
              <Text style={styles.revenueLabel}>CA aujourd'hui</Text>
              <Text style={styles.revenueAmount}>{d.revenue.today.toFixed(3)}</Text>
              <Text style={styles.revenueTND}>TND</Text>
            </View>
            <View style={styles.revenueSide}>
              <View style={styles.zeroBadge}>
                <Text style={styles.zeroBadgeText}>0% COMMISSION</Text>
              </View>
              <Text style={[styles.growthText, { color: d.revenue.growth >= 0 ? COLORS.green : COLORS.red }]}>
                {d.revenue.growth >= 0 ? '↑' : '↓'} {Math.abs(d.revenue.growth)}% vs hier
              </Text>
            </View>
          </View>

          {/* KPI grid */}
          <View style={styles.kpiGrid}>
            <KPICard icon="📦" label="Commandes/jour" value={d.orders.today}
              sub={`${d.orders.active} actives`} color={COLORS.blue}
              onPress={() => navigation.navigate('AdminOrders')} />
            <KPICard icon="⏳" label="En attente" value={d.orders.pending}
              color={d.orders.pending > 5 ? COLORS.red : COLORS.accent}
              onPress={() => navigation.navigate('AdminOrders')} />
            <KPICard icon="👥" label="Utilisateurs" value={d.users.total.toLocaleString()}
              sub={`+${d.users.newToday} aujourd'hui`}
              onPress={() => navigation.navigate('AdminUsers')} />
            <KPICard icon="🚗" label="Prestataires" value={d.users.providers}
              onPress={() => navigation.navigate('AdminDrivers')} />
          </View>

          {/* Services live */}
          <Text style={styles.sectionTitle}>SERVICES EN DIRECT</Text>
          <View style={styles.servicesRow}>
            {d.services.map(s => (
              <View key={s.name} style={[styles.serviceCard, { borderColor: s.color + '40' }]}>
                <Text style={styles.serviceIcon}>{s.icon}</Text>
                <Text style={[styles.serviceActive, { color: s.color }]}>{s.active}</Text>
                <Text style={styles.serviceLabel}>{s.name}</Text>
                <Text style={styles.serviceSubLabel}>actifs</Text>
              </View>
            ))}
          </View>

          {/* Quick nav */}
          <Text style={styles.sectionTitle}>GESTION</Text>
          <View style={styles.navGrid}>
            {[
              { icon: '🪪', label: 'KYC', screen: 'AdminKYC', badge: 3 },
              { icon: '👥', label: 'Utilisateurs', screen: 'AdminUsers' },
              { icon: '🚕', label: 'Chauffeurs', screen: 'AdminDrivers' },
              { icon: '💰', label: 'Revenus', screen: 'AdminRevenue' },
              { icon: '🎁', label: 'Promos', screen: 'AdminPromoCodes' },
              { icon: '🗺️', label: 'Zones géo', screen: 'AdminGeoZones' },
              { icon: '🔔', label: 'Notifs push', screen: 'AdminPushNotif' },
              { icon: '⚙️', label: 'Paramètres', screen: 'AdminAppSettings' },
            ].map(item => (
              <TouchableOpacity
                key={item.screen}
                style={styles.navBtn}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={{ position: 'relative' }}>
                  <Text style={styles.navIcon}>{item.icon}</Text>
                  {item.badge > 0 && (
                    <View style={styles.navBadge}>
                      <Text style={styles.navBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.navLabel}>{item.label}</Text>
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
  headerSub: { color: COLORS.muted, fontSize: 11, marginTop: 1 },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerBtn: { padding: 8 },
  scroll: { padding: 16 },
  alertCard: {
    borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 10,
  },
  alertText: { fontSize: 13, fontWeight: '600' },
  revenueHero: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16, borderWidth: 1.5, borderColor: COLORS.accent + '40',
  },
  revenueLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  revenueAmount: { color: COLORS.accent, fontSize: 36, fontWeight: '900', lineHeight: 40 },
  revenueTND: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  revenueSide: { alignItems: 'flex-end', gap: 10 },
  zeroBadge: {
    backgroundColor: COLORS.green + '20', borderRadius: 20, borderWidth: 1,
    borderColor: COLORS.green + '50', paddingHorizontal: 10, paddingVertical: 4,
  },
  zeroBadgeText: { color: COLORS.green, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  growthText: { fontSize: 14, fontWeight: '700' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  kpiCard: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  kpiIcon: { fontSize: 22, marginBottom: 6 },
  kpiValue: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  kpiLabel: { color: COLORS.muted, fontSize: 11, marginTop: 3, textAlign: 'center' },
  kpiSub: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  servicesRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  serviceCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 10,
    alignItems: 'center', borderWidth: 1,
  },
  serviceIcon: { fontSize: 20, marginBottom: 4 },
  serviceActive: { fontSize: 20, fontWeight: '900' },
  serviceLabel: { color: COLORS.text, fontSize: 11, fontWeight: '600', marginTop: 2 },
  serviceSubLabel: { color: COLORS.muted, fontSize: 9 },
  navGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  navBtn: {
    width: '22%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  navIcon: { fontSize: 22, marginBottom: 4 },
  navLabel: { color: COLORS.muted, fontSize: 10, textAlign: 'center' },
  navBadge: {
    position: 'absolute', top: -4, right: -6,
    backgroundColor: COLORS.red, borderRadius: 8, paddingHorizontal: 4, paddingVertical: 1,
  },
  navBadgeText: { color: '#FFF', fontSize: 8, fontWeight: '800' },
});
