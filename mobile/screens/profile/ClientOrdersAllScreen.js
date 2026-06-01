import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
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
  blue: '#1565C0',
  teal: '#00838F',
};

const SERVICE_ICONS = {
  TAXI: '🚕', DELIVERY: '🛵', SOS: '🛻', GROCERY: '🛒',
};

const STATUS_CONFIG = {
  PENDING: { color: COLORS.orange, label: 'En attente' },
  ACCEPTED: { color: COLORS.blue, label: 'Accepté' },
  IN_PROGRESS: { color: COLORS.teal, label: 'En cours' },
  COMPLETED: { color: COLORS.green, label: 'Terminé' },
  CANCELLED: { color: COLORS.muted, label: 'Annulé' },
};

const MOCK_ORDERS = [
  { id: 'ord-001', serviceType: 'TAXI', status: 'COMPLETED', price: 18, createdAt: new Date(Date.now() - 1 * 3600000).toISOString(), pickup: 'Aéroport Tunis-Carthage', destination: 'Centre Ville', rating: 5 },
  { id: 'ord-002', serviceType: 'DELIVERY', status: 'IN_PROGRESS', price: 24.5, createdAt: new Date(Date.now() - 30 * 60000).toISOString(), pickup: 'Pizza Roma', destination: 'Les Berges du Lac', rating: null },
  { id: 'ord-003', serviceType: 'GROCERY', status: 'COMPLETED', price: 52, createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), pickup: 'Monoprix', destination: 'Menzah 9', rating: 4 },
  { id: 'ord-004', serviceType: 'SOS', status: 'COMPLETED', price: 45, createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(), pickup: 'Route GP1, Km 42', destination: null, rating: 5 },
  { id: 'ord-005', serviceType: 'TAXI', status: 'CANCELLED', price: 0, createdAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(), pickup: 'La Marsa', destination: 'Ennasr', rating: null },
];

const FILTERS = ['TOUS', 'TAXI', 'LIVRAISON', 'SOS', 'ÉPICERIE'];
const FILTER_KEYS = { 'TOUS': null, 'TAXI': 'TAXI', 'LIVRAISON': 'DELIVERY', 'SOS': 'SOS', 'ÉPICERIE': 'GROCERY' };

function Stars({ rating }) {
  if (!rating) return null;
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1,2,3,4,5].map((i) => (
        <Text key={i} style={{ fontSize: 10, color: i <= rating ? '#FFD700' : COLORS.border }}>★</Text>
      ))}
    </View>
  );
}

export default function ClientOrdersAllScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('TOUS');

  const load = useCallback(async (silent = false) => {
    try {
      const res = await api.get('/api/clients/orders');
      setOrders(res.data.orders || []);
    } catch {
      if (!silent) setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const serviceKey = FILTER_KEYS[filter];
  const filtered = serviceKey ? orders.filter((o) => o.serviceType === serviceKey) : orders;

  const totalSpent = orders.filter((o) => o.status === 'COMPLETED').reduce((s, o) => s + (parseFloat(o.price) || 0), 0);

  const navigateToDetail = (order) => {
    const screens = {
      TAXI: 'TaxiOrderDetail',
      DELIVERY: 'DeliveryOrderDetail',
      SOS: 'SOSOrderDetail',
      GROCERY: 'GroceryOrderHistory',
    };
    const screen = screens[order.serviceType];
    if (screen) navigation.navigate(screen, { orderId: order.id });
  };

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.orange} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>📋 Toutes mes commandes</Text>
          <Text style={s.sub}>{orders.length} commandes · {totalSpent.toFixed(0)} TND dépensés</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={s.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[s.filterTab, filter === f && s.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.filterTxt, filter === f && s.filterTxtActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={COLORS.orange} />}
        renderItem={({ item }) => {
          const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
          const date = new Date(item.createdAt).toLocaleDateString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' });
          return (
            <TouchableOpacity style={[s.card, { borderLeftColor: st.color }]} onPress={() => navigateToDetail(item)}>
              <View style={s.cardTop}>
                <Text style={{ fontSize: 24 }}>{SERVICE_ICONS[item.serviceType] || '📦'}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.pickup} numberOfLines={1}>{item.pickup}</Text>
                  {item.destination && <Text style={s.destination} numberOfLines={1}>→ {item.destination}</Text>}
                  <Text style={s.date}>{date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <View style={[s.statusBadge, { backgroundColor: st.color + '22', borderColor: st.color }]}>
                    <Text style={[s.statusTxt, { color: st.color }]}>{st.label}</Text>
                  </View>
                  {item.price > 0 && (
                    <Text style={[s.price, { color: item.status === 'COMPLETED' ? COLORS.orange : COLORS.muted }]}>
                      {parseFloat(item.price).toFixed(1)} TND
                    </Text>
                  )}
                </View>
              </View>
              {item.rating && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <Stars rating={item.rating} />
                  <Text style={s.ratingTxt}>Vous avez noté {item.rating}/5</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
            <Text style={s.emptyTitle}>Aucune commande</Text>
            <Text style={s.emptySub}>Vos commandes apparaîtront ici.</Text>
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
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 6, flexWrap: 'wrap' },
  filterTab: { backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  filterTabActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orange + '22' },
  filterTxt: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  filterTxtActive: { color: COLORS.orange },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 8, padding: 14, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  pickup: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  destination: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  date: { color: COLORS.muted, fontSize: 10, marginTop: 3 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1 },
  statusTxt: { fontSize: 10, fontWeight: '700' },
  price: { fontSize: 13, fontWeight: '700' },
  ratingTxt: { color: COLORS.muted, fontSize: 10 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center' },
});
