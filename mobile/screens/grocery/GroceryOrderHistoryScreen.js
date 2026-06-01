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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  green: '#27AE60',
  orange: '#F57C00',
  accent: '#D32F2F',
  teal: '#00838F',
};

const STATUS_CONFIG = {
  PENDING: { color: COLORS.orange, label: 'En attente' },
  CONFIRMED: { color: '#1565C0', label: 'Confirmée' },
  PREPARING: { color: COLORS.orange, label: 'En préparation' },
  OUT_FOR_DELIVERY: { color: COLORS.teal, label: 'En livraison' },
  DELIVERED: { color: COLORS.green, label: 'Livré' },
  CANCELLED: { color: COLORS.muted, label: 'Annulé' },
};

const MOCK_ORDERS = [
  {
    id: 'groc-001',
    status: 'DELIVERED',
    storeName: 'Monoprix Menzah',
    storeIcon: '🛒',
    totalAmount: 38.5,
    itemCount: 7,
    createdAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    deliveryAddress: 'Rue du Lac, Les Berges du Lac, Tunis',
    items: [
      { name: 'Lait Centrale 1L', qty: 2, price: 3.6 },
      { name: 'Pain de mie Harry\'s', qty: 1, price: 4.2 },
    ],
  },
  {
    id: 'groc-002',
    status: 'DELIVERED',
    storeName: 'Carrefour Tunis City',
    storeIcon: '🛒',
    totalAmount: 62.0,
    itemCount: 12,
    createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    deliveryAddress: 'Avenue Habib Bourguiba, Tunis',
    items: [],
  },
  {
    id: 'groc-003',
    status: 'CANCELLED',
    storeName: 'BioMarché Bio',
    storeIcon: '🌿',
    totalAmount: 0,
    itemCount: 4,
    createdAt: new Date(Date.now() - 10 * 24 * 3600000).toISOString(),
    deliveryAddress: 'La Marsa, Tunis',
    items: [],
  },
];

export default function GroceryOrderHistoryScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async (silent = false) => {
    try {
      const res = await api.get('/api/grocery/orders/history');
      setOrders(res.data.orders || []);
    } catch {
      if (!silent) setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalSpent = orders
    .filter((o) => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

  const toggleExpand = (id) => setExpanded((prev) => (prev === id ? null : id));

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.teal} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>🛒 Mes courses</Text>
        <View style={s.badge}>
          <Text style={s.badgeTxt}>{orders.length}</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={s.summaryRow}>
        <View style={s.summaryCard}>
          <Text style={[s.summaryVal, { color: COLORS.teal }]}>{orders.length}</Text>
          <Text style={s.summaryLbl}>Commandes</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={[s.summaryVal, { color: COLORS.green }]}>{orders.filter((o) => o.status === 'DELIVERED').length}</Text>
          <Text style={s.summaryLbl}>Livrées</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={[s.summaryVal, { color: COLORS.orange }]}>{totalSpent.toFixed(1)} TND</Text>
          <Text style={s.summaryLbl}>Total dépensé</Text>
        </View>
      </View>

      <FlatList
        data={orders}
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
          const isExpanded = expanded === item.id;
          const date = new Date(item.createdAt).toLocaleDateString('fr-TN', {
            day: '2-digit', month: 'short', year: 'numeric',
          });
          return (
            <TouchableOpacity
              style={[s.card, { borderLeftColor: st.color }]}
              onPress={() => toggleExpand(item.id)}
              activeOpacity={0.8}
            >
              <View style={s.cardTop}>
                <Text style={{ fontSize: 22 }}>{item.storeIcon || '🛒'}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.storeName}>{item.storeName}</Text>
                  <Text style={s.date}>{date} · {item.itemCount} articles</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <View style={[s.statusBadge, { backgroundColor: st.color + '22', borderColor: st.color }]}>
                    <Text style={[s.statusTxt, { color: st.color }]}>{st.label}</Text>
                  </View>
                  {item.status === 'DELIVERED' && (
                    <Text style={[s.amount, { color: COLORS.teal }]}>{parseFloat(item.totalAmount).toFixed(1)} TND</Text>
                  )}
                </View>
              </View>

              {item.deliveryAddress ? (
                <Text style={s.address} numberOfLines={1}>📍 {item.deliveryAddress}</Text>
              ) : null}

              {isExpanded && item.items && item.items.length > 0 && (
                <View style={s.itemsBox}>
                  {item.items.map((it, idx) => (
                    <View key={idx} style={s.itemRow}>
                      <Text style={s.itemName}>{it.qty}× {it.name}</Text>
                      <Text style={s.itemPrice}>{(it.price * it.qty).toFixed(2)} TND</Text>
                    </View>
                  ))}
                </View>
              )}

              {item.status === 'DELIVERED' && (
                <TouchableOpacity
                  style={s.reorderBtn}
                  onPress={() => navigation.navigate('GroceryHome')}
                >
                  <Text style={s.reorderTxt}>🔄 Commander à nouveau</Text>
                </TouchableOpacity>
              )}

              <Text style={[s.expandHint, { color: COLORS.muted }]}>
                {isExpanded ? '▲ Réduire' : '▼ Voir les articles'}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🛒</Text>
            <Text style={s.emptyTitle}>Aucune commande</Text>
            <Text style={s.emptySub}>Vos commandes de courses apparaîtront ici.</Text>
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
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', flex: 1 },
  badge: { backgroundColor: COLORS.teal, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTxt: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', padding: 16, gap: 8 },
  summaryCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  summaryVal: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  summaryLbl: { color: COLORS.muted, fontSize: 10, fontWeight: '600' },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 8, padding: 14, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  storeName: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  date: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1 },
  statusTxt: { fontSize: 10, fontWeight: '700' },
  amount: { fontSize: 13, fontWeight: '700' },
  address: { color: COLORS.muted, fontSize: 11, marginBottom: 6 },
  itemsBox: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8, marginTop: 6 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  itemName: { color: COLORS.text, fontSize: 12 },
  itemPrice: { color: COLORS.muted, fontSize: 12 },
  reorderBtn: { backgroundColor: COLORS.teal + '22', borderRadius: 8, padding: 10, marginTop: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.teal },
  reorderTxt: { color: COLORS.teal, fontSize: 13, fontWeight: '700' },
  expandHint: { fontSize: 10, textAlign: 'center', marginTop: 6 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center' },
});
