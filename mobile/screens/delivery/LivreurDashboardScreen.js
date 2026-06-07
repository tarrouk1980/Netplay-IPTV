import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert, Switch,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const MOCK_ORDERS = [
  { id: 'LIV001', clientName: 'Nadia K.', pickup: 'Pizza Roma, Lac 1', dropoff: 'Berges du Lac 2', distance: 2.3, amount: 5.000, type: 'FOOD', createdAt: '14:45' },
  { id: 'LIV002', clientName: 'Ahmed B.', pickup: 'Carrefour Market, La Marsa', dropoff: 'Sidi Bou Said', distance: 4.1, amount: 7.500, type: 'GROCERY', createdAt: '14:40' },
];

const MOCK_STATS = { todayEarnings: 34.500, todayDeliveries: 7, rating: 4.9, streak: 3 };

function OrderCard({ item, onAccept }) {
  const typeColor = item.type === 'FOOD' ? COLORS.accent : COLORS.blue;
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={[styles.typeBadge, { backgroundColor: typeColor + '20', borderColor: typeColor + '50' }]}>
          <Text style={[styles.typeText, { color: typeColor }]}>
            {item.type === 'FOOD' ? '🍕 Resto' : '🛒 Épicerie'}
          </Text>
        </View>
        <Text style={styles.orderTime}>{item.createdAt}</Text>
      </View>

      <View style={styles.routeSection}>
        <View style={styles.routeRow}>
          <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
          <Text style={styles.routeText} numberOfLines={1}>{item.pickup}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <View style={[styles.dot, { backgroundColor: COLORS.accent }]} />
          <Text style={styles.routeText} numberOfLines={1}>{item.dropoff}</Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderDistance}>📍 {item.distance} km</Text>
        <Text style={styles.orderClient}>{item.clientName}</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.orderAmount}>{item.amount.toFixed(3)} TND</Text>
      </View>

      <TouchableOpacity style={styles.acceptBtn} onPress={() => onAccept(item)}>
        <Text style={styles.acceptBtnText}>✓ Accepter la livraison</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function LivreurDashboardScreen({ navigation }) {
  const { logout } = useAuthStore();
  const [online, setOnline] = useState(false);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(MOCK_STATS);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      api.get('/api/livreur/orders/available').catch(() => ({ data: { orders: MOCK_ORDERS } })),
      api.get('/api/livreur/stats').catch(() => ({ data: MOCK_STATS })),
      api.get('/api/livreur/status').catch(() => ({ data: { online: false } })),
    ]).then(([ordRes, statsRes, statusRes]) => {
      setOrders(ordRes.data.orders || MOCK_ORDERS);
      setStats(statsRes.data || MOCK_STATS);
      setOnline(statusRes.data.online || false);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, [])
  );

  const toggleOnline = async (val) => {
    setToggling(true);
    try {
      await api.post('/api/livreur/status', { online: val });
      setOnline(val);
    } catch {
      setOnline(v => v);
    } finally {
      setToggling(false);
    }
  };

  const handleAccept = async (order) => {
    try {
      await api.post(`/api/livreur/orders/${order.id}/accept`);
      setOrders(prev => prev.filter(o => o.id !== order.id));
      navigation.navigate('LivreurLiveMap', { orderId: order.id });
    } catch {
      Alert.alert('Erreur', 'Impossible d\'accepter cette livraison.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => logout()} style={{ padding: 8, marginRight: 4 }}>
          <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: '300' }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📦 Tableau de bord</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProviderIncome')} style={styles.earningsBtn}>
          <Text style={styles.earningsBtnText}>Revenus</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.onlineCard, online ? styles.onlineCardOn : styles.onlineCardOff]}>
        <View>
          <Text style={styles.onlineLabel}>{online ? '🟢 En ligne' : '⚫ Hors ligne'}</Text>
          <Text style={styles.onlineSub}>
            {online ? 'Vous recevez les commandes de livraison' : 'Activez pour recevoir des livraisons'}
          </Text>
        </View>
        {toggling ? (
          <ActivityIndicator color={COLORS.accent} />
        ) : (
          <Switch value={online} onValueChange={toggleOnline}
            trackColor={{ false: COLORS.border, true: COLORS.green }} thumbColor={online ? '#FFF' : COLORS.muted} />
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: COLORS.accent }]}>{stats.todayEarnings.toFixed(3)}</Text>
              <Text style={styles.statLabel}>TND aujourd'hui</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{stats.todayDeliveries}</Text>
              <Text style={styles.statLabel}>livraisons</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: COLORS.accent }]}>★ {stats.rating}</Text>
              <Text style={styles.statLabel}>note</Text>
            </View>
          </View>

          {stats.streak >= 3 && (
            <View style={styles.streakBanner}>
              <Text style={styles.streakText}>🔥 Série de {stats.streak} jours consécutifs !</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>
            {online ? `LIVRAISONS DISPONIBLES (${orders.length})` : 'PASSEZ EN LIGNE POUR VOIR LES LIVRAISONS'}
          </Text>

          {online && orders.length === 0 && (
            <View style={styles.empty}>
              <Text style={{ fontSize: 40 }}>📭</Text>
              <Text style={{ color: COLORS.muted, marginTop: 10 }}>Aucune livraison disponible</Text>
            </View>
          )}

          {online && orders.map(o => <OrderCard key={o.id} item={o} onAccept={handleAccept} />)}

          <Text style={styles.sectionTitle}>ACTIONS RAPIDES</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: '📋', label: 'Historique', screen: 'LivreurHistory' },
              { icon: '👤', label: 'Mon profil', screen: 'ProviderProfile' },
              { icon: '💰', label: 'Revenus', screen: 'ProviderIncome' },
              { icon: '🗺️', label: 'Live map', screen: 'LivreurLiveMap' },
            ].map(a => (
              <TouchableOpacity key={a.screen} style={styles.actionBtn} onPress={() => navigation.navigate(a.screen)}>
                <Text style={styles.actionIcon}>{a.icon}</Text>
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
  earningsBtn: { backgroundColor: COLORS.accent + '20', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  earningsBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  onlineCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    margin: 16, borderRadius: 16, padding: 16, borderWidth: 1.5,
  },
  onlineCardOn: { backgroundColor: '#27AE6015', borderColor: COLORS.green + '50' },
  onlineCardOff: { backgroundColor: COLORS.surface, borderColor: COLORS.border },
  onlineLabel: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  onlineSub: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  scroll: { paddingHorizontal: 16 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statNum: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  statLabel: { color: COLORS.muted, fontSize: 10, marginTop: 3, textAlign: 'center' },
  streakBanner: {
    backgroundColor: '#E67E2215', borderRadius: 12, padding: 10, marginBottom: 16,
    borderWidth: 1, borderColor: '#E67E2240', alignItems: 'center',
  },
  streakText: { color: '#E67E22', fontSize: 13, fontWeight: '700' },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  orderCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  typeBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  typeText: { fontSize: 12, fontWeight: '700' },
  orderTime: { color: COLORS.muted, fontSize: 12 },
  routeSection: { marginBottom: 10 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  routeLine: { width: 1, height: 12, backgroundColor: COLORS.border, marginLeft: 3.5, marginVertical: 2 },
  routeText: { flex: 1, color: COLORS.text, fontSize: 13 },
  orderFooter: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  orderDistance: { color: COLORS.muted, fontSize: 12 },
  orderClient: { color: COLORS.muted, fontSize: 12 },
  orderAmount: { color: COLORS.accent, fontSize: 15, fontWeight: '800' },
  acceptBtn: { backgroundColor: COLORS.green, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  acceptBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  actionBtn: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  actionIcon: { fontSize: 26, marginBottom: 6 },
  actionLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
});
