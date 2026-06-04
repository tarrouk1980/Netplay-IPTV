import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_ORDERS = [
  { id: 'GO1', shopName: 'Carrefour Market', items: 5, total: 18.400, status: 'delivered', date: 'Aujourd\'hui 14:22', eta: null },
  { id: 'GO2', shopName: 'Monoprix Lac', items: 3, total: 9.200, status: 'delivering', date: 'Aujourd\'hui 13:05', eta: '8 min' },
  { id: 'GO3', shopName: 'Aziza Supermarché', items: 8, total: 31.750, status: 'preparing', date: 'Aujourd\'hui 12:40', eta: '20 min' },
  { id: 'GO4', shopName: 'Géant Casino', items: 12, total: 54.200, status: 'delivered', date: 'Hier 18:30', eta: null },
  { id: 'GO5', shopName: 'Carrefour Market', items: 2, total: 6.800, status: 'cancelled', date: 'Il y a 3j', eta: null },
];

const STATUS_CONFIG = {
  pending: { color: COLORS.muted, icon: '⏳', label: 'En attente' },
  preparing: { color: COLORS.blue, icon: '👨‍🍳', label: 'Préparation' },
  delivering: { color: COLORS.orange, icon: '🛵', label: 'En livraison' },
  delivered: { color: COLORS.green, icon: '✅', label: 'Livré' },
  cancelled: { color: COLORS.red, icon: '❌', label: 'Annulé' },
};

function OrderCard({ item, onPress }) {
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <View style={styles.shopIcon}><Text style={{ fontSize: 22 }}>🛒</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.shopName}>{item.shopName}</Text>
          <Text style={styles.orderMeta}>{item.items} article{item.items > 1 ? 's' : ''} · {item.date}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.orderTotal}>{item.total.toFixed(3)} TND</Text>
          <View style={[styles.statusBadge, { backgroundColor: cfg.color + '20' }]}>
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.icon} {cfg.label}</Text>
          </View>
        </View>
      </View>
      {item.eta && (
        <View style={styles.etaRow}>
          <Text style={styles.etaText}>🛵 Livraison estimée dans <Text style={{ color: COLORS.accent, fontWeight: '800' }}>{item.eta}</Text></Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function GroceryOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/grocery/orders')
      .then(r => setOrders(r.data.orders || MOCK_ORDERS))
      .catch(() => setOrders(MOCK_ORDERS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchQ = !q || o.shopName.toLowerCase().includes(q);
    const matchF = filter === 'all' || o.status === filter;
    return matchQ && matchF;
  });

  const active = orders.filter(o => ['pending', 'preparing', 'delivering'].includes(o.status)).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛒 Mes commandes</Text>
        <TouchableOpacity onPress={load} style={{ width: 40, alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 18 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      {active > 0 && (
        <View style={styles.activeBanner}>
          <Text style={styles.activeBannerText}>🛵 {active} commande{active > 1 ? 's' : ''} en cours</Text>
        </View>
      )}

      <View style={styles.searchRow}>
        <TextInput style={styles.searchInput} placeholder="Chercher une commande..." placeholderTextColor={COLORS.muted} value={search} onChangeText={setSearch} />
      </View>

      <View style={styles.filterRow}>
        {[{ k: 'all', l: 'Toutes' }, { k: 'delivering', l: '🛵 En cours' }, { k: 'delivered', l: '✅ Livrées' }, { k: 'cancelled', l: '❌ Annulées' }].map(f => (
          <TouchableOpacity key={f.k} style={[styles.filterBtn, filter === f.k && styles.filterBtnActive]} onPress={() => setFilter(f.k)}>
            <Text style={[styles.filterLabel, filter === f.k && styles.filterLabelActive]}>{f.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : (
        <FlatList
          data={filtered}
          keyExtractor={o => o.id}
          renderItem={({ item }) => (
            <OrderCard item={item} onPress={() => navigation.navigate('GroceryOrderDetail', { orderId: item.id })} />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 40 }}>🛒</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucune commande</Text>
              <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('GroceryHome')}>
                <Text style={styles.shopBtnText}>Faire une course →</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  activeBanner: { backgroundColor: COLORS.orange + '20', borderBottomWidth: 1, borderBottomColor: COLORS.orange + '40', paddingHorizontal: 16, paddingVertical: 10 },
  activeBannerText: { color: COLORS.orange, fontSize: 13, fontWeight: '700' },
  searchRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchInput: { backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  filterBtn: { borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.surface },
  filterBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  filterLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  filterLabelActive: { color: COLORS.accent },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shopIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  shopName: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  orderMeta: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  orderTotal: { color: COLORS.accent, fontSize: 14, fontWeight: '900', marginBottom: 4 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  etaRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  etaText: { color: COLORS.muted, fontSize: 12 },
  shopBtn: { marginTop: 16, backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 11 },
  shopBtnText: { color: '#000', fontSize: 13, fontWeight: '800' },
});
