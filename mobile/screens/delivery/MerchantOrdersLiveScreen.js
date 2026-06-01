import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  orange: '#F57C00',
  green: '#27AE60',
  accent: '#D32F2F',
  teal: '#00838F',
  blue: '#1565C0',
};

const STATUS_CONFIG = {
  PENDING: { color: COLORS.orange, label: 'Nouvelle', icon: '🔔', next: 'CONFIRMED', nextLabel: 'Confirmer' },
  CONFIRMED: { color: COLORS.blue, label: 'Confirmée', icon: '✅', next: 'PREPARING', nextLabel: 'Commencer prépa' },
  PREPARING: { color: COLORS.teal, label: 'En préparation', icon: '🍽', next: 'READY', nextLabel: 'Prêt à livrer' },
  READY: { color: COLORS.green, label: 'Prêt', icon: '📦', next: null, nextLabel: null },
  OUT_FOR_DELIVERY: { color: COLORS.green, label: 'En livraison', icon: '🛵', next: null, nextLabel: null },
  DELIVERED: { color: COLORS.muted, label: 'Livré', icon: '🏁', next: null, nextLabel: null },
  CANCELLED: { color: COLORS.accent, label: 'Annulé', icon: '❌', next: null, nextLabel: null },
};

const MOCK_ORDERS = [
  {
    id: 'ord-001',
    status: 'PENDING',
    clientName: 'Sami B.',
    totalAmount: 34.5,
    itemCount: 5,
    createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
    address: 'Les Berges du Lac, Tunis',
    items: [{ name: 'Pizza Margherita', qty: 1 }, { name: 'Salade César', qty: 2 }],
  },
  {
    id: 'ord-002',
    status: 'PREPARING',
    clientName: 'Leila M.',
    totalAmount: 21.0,
    itemCount: 3,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    address: 'Menzah 9, Ariana',
    items: [{ name: 'Burger Classique', qty: 1 }, { name: 'Frites', qty: 1 }],
  },
];

function PulseDot({ color }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.4, duration: 500, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, transform: [{ scale }] }} />;
}

export default function MerchantOrdersLiveScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async (silent = false) => {
    try {
      const res = await api.get('/api/merchant/orders/live');
      setOrders(res.data.orders || []);
      setLastUpdated(new Date());
    } catch {
      if (!silent) setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(() => load(true), 8000);
    return () => clearInterval(iv);
  }, [load]);

  const advanceStatus = async (orderId, nextStatus) => {
    try {
      await api.patch(`/api/merchant/orders/${orderId}/status`, { status: nextStatus });
      load(true);
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut.');
    }
  };

  const active = orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status));
  const done = orders.filter((o) => ['DELIVERED', 'CANCELLED'].includes(o.status));

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.teal} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <PulseDot color={COLORS.green} />
            <Text style={s.title}>Commandes en direct</Text>
          </View>
          <Text style={s.sub}>{lastUpdated ? `MàJ ${lastUpdated.toLocaleTimeString('fr-TN')}` : '...'}</Text>
        </View>
        <View style={s.activeBadge}>
          <Text style={s.activeBadgeTxt}>{active.length} actives</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Text style={[s.statVal, { color: COLORS.orange }]}>{orders.filter((o) => o.status === 'PENDING').length}</Text>
          <Text style={s.statLbl}>Nouvelles</Text>
        </View>
        <View style={s.statCard}>
          <Text style={[s.statVal, { color: COLORS.teal }]}>{orders.filter((o) => o.status === 'PREPARING').length}</Text>
          <Text style={s.statLbl}>En prépa</Text>
        </View>
        <View style={s.statCard}>
          <Text style={[s.statVal, { color: COLORS.green }]}>{orders.filter((o) => o.status === 'DELIVERED').length}</Text>
          <Text style={s.statLbl}>Livrées</Text>
        </View>
        <View style={s.statCard}>
          <Text style={[s.statVal, { color: COLORS.text }]}>
            {orders.filter((o) => o.status === 'DELIVERED').reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0).toFixed(0)} TND
          </Text>
          <Text style={s.statLbl}>Revenus</Text>
        </View>
      </View>

      <FlatList
        data={[...active, ...done]}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(true); }}
            tintColor={COLORS.teal}
          />
        }
        renderItem={({ item }) => {
          const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
          const elapsed = Math.floor((Date.now() - new Date(item.createdAt)) / 60000);
          const isNew = item.status === 'PENDING';
          return (
            <View style={[s.card, { borderLeftColor: st.color }, isNew && s.cardNew]}>
              <View style={s.cardTop}>
                <Text style={{ fontSize: 20 }}>{st.icon}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={s.orderId}>#{item.id.slice(-5).toUpperCase()}</Text>
                    <View style={[s.statusBadge, { backgroundColor: st.color + '22', borderColor: st.color }]}>
                      <Text style={[s.statusTxt, { color: st.color }]}>{st.label}</Text>
                    </View>
                  </View>
                  <Text style={s.clientName}>{item.clientName} · {item.itemCount} articles</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.amount, { color: COLORS.teal }]}>{parseFloat(item.totalAmount).toFixed(1)} TND</Text>
                  <Text style={[s.elapsed, elapsed > 20 ? { color: COLORS.accent } : null]}>⏱ {elapsed}min</Text>
                </View>
              </View>

              {item.address ? (
                <Text style={s.address} numberOfLines={1}>📍 {item.address}</Text>
              ) : null}

              {item.items && item.items.length > 0 && (
                <View style={s.itemsRow}>
                  {item.items.map((it, i) => (
                    <Text key={i} style={s.itemChip}>{it.qty}× {it.name}</Text>
                  ))}
                </View>
              )}

              {st.next && (
                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: st.color }]}
                  onPress={() => advanceStatus(item.id, st.next)}
                >
                  <Text style={s.actionBtnTxt}>{st.nextLabel}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🏪</Text>
            <Text style={s.emptyTitle}>Aucune commande active</Text>
            <Text style={s.emptySub}>Les nouvelles commandes apparaîtront ici en temps réel.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  sub: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  activeBadge: { backgroundColor: COLORS.teal, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  activeBadgeTxt: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statVal: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  statLbl: { color: COLORS.muted, fontSize: 9, textAlign: 'center' },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 10, padding: 14, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 3 },
  cardNew: { borderColor: COLORS.orange + '66' },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  orderId: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  statusBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1 },
  statusTxt: { fontSize: 10, fontWeight: '700' },
  clientName: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '700' },
  elapsed: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  address: { color: COLORS.muted, fontSize: 11, marginBottom: 6 },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 10 },
  itemChip: { backgroundColor: COLORS.surfaceAlt || '#16161F', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, color: COLORS.muted, fontSize: 11, borderWidth: 1, borderColor: COLORS.border },
  actionBtn: { borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  actionBtnTxt: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center' },
});
