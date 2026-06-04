import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const STATUS_META = {
  new:        { label: 'Nouvelle',     color: COLORS.blue,   bg: '#0A1A2E' },
  preparing:  { label: 'En préparation', color: COLORS.orange, bg: '#1A100A' },
  ready:      { label: 'Prête',        color: COLORS.green,  bg: '#0D2E0D' },
  picked:     { label: 'Récupérée',    color: COLORS.muted,  bg: COLORS.surface },
};

const MOCK_ORDERS = [
  {
    id: 'CMD-0441', client: 'Sana B.', items: ['Pizza Margherita x1', 'Coca x2'],
    total: 24.50, eta: '22 min', status: 'new', time: '14:32', address: '12 Rue de la Liberté, Tunis',
  },
  {
    id: 'CMD-0440', client: 'Karim L.', items: ['Burger double x2', 'Frites x2', 'Jus x1'],
    total: 38.00, eta: '18 min', status: 'preparing', time: '14:20', address: 'Av. Mohamed V, La Marsa',
  },
  {
    id: 'CMD-0439', client: 'Ines M.', items: ['Salade César x1', 'Eau x1'],
    total: 14.00, eta: '5 min', status: 'ready', time: '14:05', address: 'Route de Soukra',
  },
  {
    id: 'CMD-0438', client: 'Youssef T.', items: ['Couscous x1'],
    total: 18.00, eta: '—', status: 'picked', time: '13:50', address: 'Carthage',
  },
];

const NEXT_STATUS = { new: 'preparing', preparing: 'ready', ready: 'picked' };
const NEXT_LABEL  = { new: 'Commencer', preparing: 'Prête', ready: 'Livreur notifié', ready_done: 'Récupérée' };

export default function MerchantLiveOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [filter, setFilter] = useState('all');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const advance = (id) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next = NEXT_STATUS[o.status];
      if (!next) return o;
      return { ...o, status: next };
    }));
  };

  const cancelOrder = (id) => {
    Alert.alert('Annuler la commande ?', 'Le client sera remboursé.', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui, annuler', style: 'destructive', onPress: () => setOrders(prev => prev.filter(o => o.id !== id)) },
    ]);
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const newCount = orders.filter(o => o.status === 'new').length;

  const renderOrder = ({ item: o }) => {
    const meta = STATUS_META[o.status];
    const nextStatus = NEXT_STATUS[o.status];
    return (
      <View style={[styles.card, { backgroundColor: meta.bg, borderColor: meta.color + '55' }]}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.orderId}>{o.id}</Text>
            <Text style={styles.orderClient}>👤 {o.client}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: meta.color + '22' }]}>
            <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>
        <View style={styles.itemsList}>
          {o.items.map((it, i) => (
            <Text key={i} style={styles.itemLine}>· {it}</Text>
          ))}
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>🕐 {o.time}</Text>
          <Text style={styles.metaText}>⏱ {o.eta}</Text>
          <Text style={[styles.totalText]}>{o.total.toFixed(2)} TND</Text>
        </View>
        <Text style={styles.addressText} numberOfLines={1}>📍 {o.address}</Text>
        {nextStatus && (
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelOrder(o.id)}>
              <Text style={styles.cancelBtnText}>✕ Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.advanceBtn, { backgroundColor: meta.color }]}
              onPress={() => advance(o.id)}
            >
              <Text style={styles.advanceBtnText}>
                {o.status === 'new' ? '▶ Commencer' : o.status === 'preparing' ? '✓ Prête' : '📦 Livreur arrivé'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.headerTitle}>Commandes live</Text>
          {newCount > 0 && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>{newCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.liveDot} />
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        {[['all', 'Toutes'], ['new', 'Nouvelles'], ['preparing', 'En cours'], ['ready', 'Prêtes']].map(([val, lbl]) => (
          <TouchableOpacity
            key={val}
            style={[styles.filterChip, filter === val && styles.filterChipActive]}
            onPress={() => setFilter(val)}
          >
            <Text style={[styles.filterText, filter === val && { color: '#000' }]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={o => o.id}
        renderItem={renderOrder}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🍽️</Text>
            <Text style={styles.emptyText}>Aucune commande en cours</Text>
          </View>
        }
      />
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
  newBadge: {
    backgroundColor: COLORS.blue, borderRadius: 10, minWidth: 20, height: 20,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  newBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  liveDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.green,
  },
  filtersRow: { flexDirection: 'row', gap: 8, padding: 12 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  card: {
    borderRadius: 14, padding: 14, borderWidth: 1,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderId: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  orderClient: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  itemsList: { marginBottom: 10 },
  itemLine: { color: COLORS.muted, fontSize: 12, marginBottom: 2 },
  cardMeta: { flexDirection: 'row', gap: 12, marginBottom: 6, alignItems: 'center' },
  metaText: { color: COLORS.muted, fontSize: 12 },
  totalText: { color: COLORS.accent, fontSize: 14, fontWeight: '800', marginLeft: 'auto' },
  addressText: { color: COLORS.muted, fontSize: 11, marginBottom: 10 },
  cardActions: { flexDirection: 'row', gap: 8 },
  cancelBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border,
  },
  cancelBtnText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  advanceBtn: {
    flex: 2, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
  },
  advanceBtnText: { color: '#000', fontSize: 13, fontWeight: '800' },
  emptyBox: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: COLORS.muted, fontSize: 15 },
});
