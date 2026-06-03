import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F',
};

const MOCK_PAST_ORDERS = [
  {
    id: 'ORD_GRC_001',
    store: 'Carrefour Berges du Lac',
    date: '14/01/2025',
    total: 42.8,
    items: [
      { id: 'p1', name: 'Lait demi-écrémé 1L', qty: 2, price: 2.1, emoji: '🥛' },
      { id: 'p2', name: 'Pain de mie complet', qty: 1, price: 3.5, emoji: '🍞' },
      { id: 'p3', name: 'Yaourt nature x6', qty: 1, price: 5.2, emoji: '🥛' },
      { id: 'p4', name: 'Pommes Golden 1kg', qty: 2, price: 4.0, emoji: '🍎' },
    ],
  },
  {
    id: 'ORD_GRC_002',
    store: 'Monoprix Menzah',
    date: '07/01/2025',
    total: 28.5,
    items: [
      { id: 'p5', name: 'Eau minérale 6×1.5L', qty: 1, price: 4.8, emoji: '💧' },
      { id: 'p6', name: 'Pâtes spaghetti 500g', qty: 3, price: 1.9, emoji: '🍝' },
      { id: 'p7', name: 'Sauce tomate 400g', qty: 2, price: 3.2, emoji: '🍅' },
      { id: 'p8', name: 'Huile d\'olive 750ml', qty: 1, price: 12.5, emoji: '🫒' },
    ],
  },
];

function OrderCard({ order, onReorder }) {
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState(() => Object.fromEntries(order.items.map((i) => [i.id, true])));

  const toggleItem = (id) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const selectedItems = order.items.filter((i) => selected[i.id]);
  const total = selectedItems.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardHeader} onPress={() => setExpanded(!expanded)}>
        <View>
          <Text style={styles.storeName}>{order.store}</Text>
          <Text style={styles.orderDate}>Commande du {order.date} · {order.total.toFixed(3)} TND</Text>
        </View>
        <Text style={{ color: COLORS.accent, fontSize: 22 }}>{expanded ? '∧' : '∨'}</Text>
      </TouchableOpacity>

      {expanded && (
        <>
          {order.items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemRow, !selected[item.id] && styles.itemRowOff]}
              onPress={() => toggleItem(item.id)}
            >
              <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.itemName, !selected[item.id] && { color: COLORS.muted }]}>{item.name}</Text>
                <Text style={styles.itemPrice}>×{item.qty} · {item.price.toFixed(3)} TND</Text>
              </View>
              <View style={[styles.checkbox, selected[item.id] && styles.checkboxOn]}>
                {selected[item.id] && <Text style={{ color: '#000', fontSize: 11, fontWeight: '900' }}>✓</Text>}
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.reorderFooter}>
            <Text style={styles.reorderTotal}>{selectedItems.length} article(s) · {total.toFixed(3)} TND</Text>
            <TouchableOpacity
              style={[styles.reorderBtn, selectedItems.length === 0 && { opacity: 0.4 }]}
              onPress={() => onReorder(order, selectedItems)}
              disabled={selectedItems.length === 0}
            >
              <Text style={styles.reorderBtnText}>🔄 Recommander</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

export default function GroceryReorderScreen({ navigation }) {
  const [orders, setOrders] = useState(MOCK_PAST_ORDERS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/grocery/orders/history');
        if (res.data?.orders?.length) setOrders(res.data.orders);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleReorder = (order, items) => {
    Alert.alert(
      '🛒 Confirmer la commande',
      `Recommander ${items.length} article(s) chez ${order.store} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => navigation.navigate('GroceryCheckout', {
            storeId: order.storeId,
            storeName: order.store,
            items: items.map((i) => ({ ...i, selected: true })),
          }),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔄 Recommander</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>♻️ Retrouvez vos commandes passées et recommandez en un clic !</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {loading && <ActivityIndicator color={COLORS.accent} style={{ marginTop: 30 }} />}
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} onReorder={handleReorder} />
        ))}
        {orders.length === 0 && !loading && (
          <View style={styles.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🛒</Text>
            <Text style={styles.emptyText}>Pas encore de commandes précédentes.</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('GroceryHome')}>
              <Text style={styles.shopBtnText}>Faire ma première commande</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 24 }} />
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
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  banner: {
    backgroundColor: '#0A1A0A', margin: 12, borderRadius: 10,
    padding: 10, borderWidth: 1, borderColor: COLORS.green,
  },
  bannerText: { color: COLORS.green, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  scroll: { padding: 12 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 12, overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16,
  },
  storeName: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  orderDate: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  itemRowOff: { opacity: 0.4 },
  itemName: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  itemPrice: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  checkbox: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  reorderFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderTopWidth: 1, borderTopColor: COLORS.border,
    backgroundColor: '#0A1A0A',
  },
  reorderTotal: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  reorderBtn: {
    backgroundColor: COLORS.accent, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  reorderBtnText: { color: '#000', fontWeight: '800', fontSize: 13 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: COLORS.muted, fontSize: 14, marginBottom: 20 },
  shopBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  shopBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
});
