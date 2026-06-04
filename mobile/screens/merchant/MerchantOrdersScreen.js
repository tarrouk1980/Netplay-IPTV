import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const STATUS_COLORS = { PENDING: COLORS.orange, CONFIRMED: COLORS.blue, READY: COLORS.accent, DELIVERED: COLORS.green, CANCELLED: COLORS.red };
const STATUS_LABELS = { PENDING: 'Nouvelle', CONFIRMED: 'En préparation', READY: 'Prête', DELIVERED: 'Livrée', CANCELLED: 'Annulée' };
const NEXT_STATUS = { PENDING: 'CONFIRMED', CONFIRMED: 'READY', READY: 'DELIVERED' };
const NEXT_LABELS = { PENDING: 'Accepter', CONFIRMED: 'Prête', READY: 'Remise au livreur' };

const MOCK = [
  { id: 'CMD-001', clientName: 'Nadia K.', items: [{ name: 'Kafteji', qty: 2 }, { name: 'Brik', qty: 1 }], total: 18.500, status: 'PENDING', createdAt: '16:42', address: 'Berges du Lac 2' },
  { id: 'CMD-002', clientName: 'Ahmed B.', items: [{ name: 'Sandwich Tunisien', qty: 3 }], total: 12.000, status: 'CONFIRMED', createdAt: '16:28', address: 'Menzah 6' },
  { id: 'CMD-003', clientName: 'Lina M.', items: [{ name: 'Lablabi', qty: 2 }, { name: 'Thé', qty: 2 }], total: 14.800, status: 'READY', createdAt: '15:55', address: 'Ariana Centre' },
  { id: 'CMD-004', clientName: 'Youssef T.', items: [{ name: 'Couscous complet', qty: 1 }], total: 22.000, status: 'DELIVERED', createdAt: '15:10', address: 'Lafayette' },
];

const TABS = ['Toutes', 'PENDING', 'CONFIRMED', 'READY', 'DELIVERED'];

function OrderCard({ item, onAction }) {
  const sc = STATUS_COLORS[item.status] || COLORS.muted;
  const nextStatus = NEXT_STATUS[item.status];

  return (
    <View style={[styles.card, item.status === 'PENDING' && styles.cardUrgent]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardId}>#{item.id}</Text>
        <Text style={styles.cardTime}>{item.createdAt}</Text>
        <View style={[styles.statusBadge, { backgroundColor: sc + '20', borderColor: sc + '40' }]}>
          <Text style={[styles.statusText, { color: sc }]}>{STATUS_LABELS[item.status]}</Text>
        </View>
      </View>

      <Text style={styles.clientName}>{item.clientName}</Text>
      <Text style={styles.address}>📍 {item.address}</Text>

      <View style={styles.itemsList}>
        {item.items.map((it, i) => (
          <Text key={i} style={styles.itemText}>{it.qty}× {it.name}</Text>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.total}>{item.total.toFixed(3)} TND</Text>
        {nextStatus && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: STATUS_COLORS[nextStatus] || COLORS.accent }]}
            onPress={() => onAction(item, nextStatus)}
          >
            <Text style={styles.actionBtnText}>{NEXT_LABELS[item.status]}</Text>
          </TouchableOpacity>
        )}
        {item.status === 'PENDING' && (
          <TouchableOpacity style={styles.rejectBtn} onPress={() => onAction(item, 'CANCELLED')}>
            <Text style={styles.rejectBtnText}>✗</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function MerchantOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Toutes');

  const load = useCallback(() => {
    api.get('/api/merchant/orders')
      .then(r => setOrders(r.data.orders || MOCK))
      .catch(() => setOrders(MOCK))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const handleAction = async (order, newStatus) => {
    if (newStatus === 'CANCELLED') {
      Alert.alert('Refuser la commande ?', '', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Refuser', style: 'destructive', onPress: () => updateStatus(order, newStatus) },
      ]);
    } else {
      updateStatus(order, newStatus);
    }
  };

  const updateStatus = async (order, newStatus) => {
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
    api.put('/api/merchant/orders/' + order.id + '/status', { status: newStatus }).catch(() => {});
  };

  const filtered = tab === 'Toutes' ? orders : orders.filter(o => o.status === tab);
  const pendingCount = orders.filter(o => o.status === 'PENDING').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📋 Commandes</Text>
        {pendingCount > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pendingCount} nouvelles</Text>
          </View>
        )}
      </View>

      <FlatList
        data={TABS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={t => t}
        style={{ maxHeight: 46, marginTop: 10 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.tabBtn, tab === item && styles.tabBtnActive]}
            onPress={() => setTab(item)}
          >
            <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>
              {item === 'Toutes' ? 'Toutes' : STATUS_LABELS[item]}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <OrderCard item={item} onAction={handleAction} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 40 }}>📭</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucune commande</Text>
            </View>
          }
        />
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
  backBtn: { padding: 4 },
  backText: { color: COLORS.accent, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  pendingBadge: { backgroundColor: COLORS.red, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  pendingBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  tabBtn: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  tabBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  tabText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: COLORS.accent },
  list: { padding: 16 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  cardUrgent: { borderColor: COLORS.orange + '60', backgroundColor: COLORS.orange + '08' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  cardId: { color: COLORS.muted, fontSize: 12, fontWeight: '600', flex: 1 },
  cardTime: { color: COLORS.muted, fontSize: 12 },
  statusBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
  statusText: { fontSize: 11, fontWeight: '700' },
  clientName: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 3 },
  address: { color: COLORS.muted, fontSize: 12, marginBottom: 8 },
  itemsList: { marginBottom: 10 },
  itemText: { color: COLORS.text, fontSize: 13, marginBottom: 2 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  total: { color: COLORS.accent, fontSize: 15, fontWeight: '800', flex: 1 },
  actionBtn: { borderRadius: 10, paddingVertical: 9, paddingHorizontal: 16, alignItems: 'center' },
  actionBtnText: { color: '#000', fontSize: 13, fontWeight: '800' },
  rejectBtn: {
    backgroundColor: COLORS.red + '20', borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12,
    borderWidth: 1, borderColor: COLORS.red + '40',
  },
  rejectBtnText: { color: COLORS.red, fontSize: 14, fontWeight: '800' },
  empty: { alignItems: 'center', paddingVertical: 60 },
});
