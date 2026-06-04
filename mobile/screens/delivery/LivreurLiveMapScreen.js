import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#27AE60', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  orange: '#E67E22', red: '#E74C3C', blue: '#3498DB',
};

const MOCK_ORDERS = [
  { id: 'CMD-8821', merchant: 'Pizza Express', client: 'Sana B.', distance: 0.8, address: '12 Rue de la Liberté, Tunis', status: 'WAITING_PICKUP', amount: 24.5, items: 3 },
  { id: 'CMD-8819', merchant: 'Burger House', client: 'Karim L.', distance: 2.1, address: '45 Av. Habib Bourguiba', status: 'AVAILABLE', amount: 18.0, items: 2 },
  { id: 'CMD-8815', merchant: 'Sushi Time', client: 'Ines M.', distance: 3.4, address: '8 Rue Ibn Khaldoun', status: 'AVAILABLE', amount: 42.0, items: 5 },
];

const STATUS_CONFIG = {
  WAITING_PICKUP: { label: 'À récupérer', color: '#E67E22', bg: '#E67E2222' },
  AVAILABLE: { label: 'Disponible', color: '#27AE60', bg: '#27AE6022' },
  IN_DELIVERY: { label: 'En livraison', color: '#3498DB', bg: '#3498DB22' },
};

export default function LivreurLiveMapScreen({ navigation }) {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [selected, setSelected] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchOrders();
    intervalRef.current = setInterval(fetchOrders, 20000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/delivery/livreur/nearby-orders');
      if (res.data?.orders?.length > 0) setOrders(res.data.orders);
    } catch {} finally { setLoading(false); }
  };

  const acceptOrder = async (order) => {
    try {
      await api.post(`/api/delivery/orders/${order.id}/accept`);
      navigation.navigate('DeliveryTracking', { orderId: order.id });
    } catch {
      navigation.navigate('DeliveryTracking', { orderId: order.id });
    }
  };

  const toggleOnline = async () => {
    const next = !online;
    setOnline(next);
    try { await api.post('/api/delivery/livreur/status', { online: next }); } catch {}
  };

  const available = orders.filter(o => o.status === 'AVAILABLE').length;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carte livraisons</Text>
        <TouchableOpacity style={[styles.onlineBtn, { backgroundColor: online ? COLORS.accent + '22' : COLORS.red + '22', borderColor: online ? COLORS.accent : COLORS.red }]} onPress={toggleOnline}>
          <View style={[styles.onlineDot, { backgroundColor: online ? COLORS.accent : COLORS.red }]} />
          <Text style={{ color: online ? COLORS.accent : COLORS.red, fontSize: 11, fontWeight: '700' }}>{online ? 'EN LIGNE' : 'HORS LIGNE'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.accent }]}>{available}</Text>
          <Text style={styles.statLabel}>Commandes dispo</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.orange }]}>{orders.filter(o => o.status === 'WAITING_PICKUP').length}</Text>
          <Text style={styles.statLabel}>À récupérer</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.white }]}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total zone</Text>
        </View>
      </View>

      {/* Map placeholder */}
      <View style={styles.mapBox}>
        <Text style={{ fontSize: 36, marginBottom: 6 }}>🗺️</Text>
        <Text style={{ color: COLORS.muted, fontSize: 12 }}>Zone de livraison active</Text>
        <View style={styles.mapPins}>
          {orders.map((o, i) => (
            <TouchableOpacity
              key={o.id}
              style={[styles.mapPin, { left: 30 + i * 60, top: 15 + (i % 2) * 25 }, { backgroundColor: STATUS_CONFIG[o.status]?.color || COLORS.muted }, selected?.id === o.id && { width: 32, height: 32, borderRadius: 16 }]}
              onPress={() => setSelected(selected?.id === o.id ? null : o)}
            >
              <Text style={{ fontSize: 9 }}>🛵</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} /> : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <Text style={styles.listTitle}>📦 Commandes à proximité</Text>
          {orders.map(o => {
            const sc = STATUS_CONFIG[o.status];
            const isSel = selected?.id === o.id;
            return (
              <TouchableOpacity key={o.id} style={[styles.card, isSel && { borderColor: COLORS.accent }]} onPress={() => setSelected(isSel ? null : o)} activeOpacity={0.85}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardId}>{o.id}</Text>
                      <View style={[styles.badge, { backgroundColor: sc.bg, borderColor: sc.color }]}>
                        <Text style={[styles.badgeText, { color: sc.color }]}>{sc.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardMerchant}>🏪 {o.merchant}</Text>
                    <Text style={styles.cardAddr} numberOfLines={1}>📍 {o.address}</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={styles.cardDist}>{o.distance} km</Text>
                    <Text style={styles.cardAmount}>{o.amount.toFixed(2)} TND</Text>
                    <Text style={styles.cardItems}>{o.items} article{o.items > 1 ? 's' : ''}</Text>
                  </View>
                </View>
                {isSel && (
                  <TouchableOpacity style={styles.acceptBtn} onPress={() => acceptOrder(o)}>
                    <Text style={styles.acceptBtnText}>✅ Accepter cette livraison</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  onlineBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5 },
  statsBar: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '900' },
  statLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  mapBox: { height: 140, backgroundColor: COLORS.surfaceAlt, margin: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  mapPins: { position: 'absolute', width: '100%', height: '100%' },
  mapPin: { position: 'absolute', width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  listTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  cardTop: { flexDirection: 'row', gap: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardId: { color: COLORS.muted, fontSize: 11, fontWeight: '700' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  cardMerchant: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  cardAddr: { color: COLORS.muted, fontSize: 11 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  cardDist: { color: COLORS.accent, fontSize: 14, fontWeight: '900' },
  cardAmount: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  cardItems: { color: COLORS.muted, fontSize: 11 },
  acceptBtn: { marginTop: 12, backgroundColor: COLORS.accent, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  acceptBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
});
