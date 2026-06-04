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

const TABS = ['En attente', 'En cours', 'Terminées'];
const STATUS_MAP = {
  PENDING: 0, ACCEPTED: 1, PREPARING: 1, READY: 1,
  PICKED_UP: 1, DELIVERING: 1, DELIVERED: 2, CANCELLED: 2,
};

const MOCK_ORDERS = [
  {
    id: 'ORD001', clientName: 'Nadia K.', status: 'PENDING', createdAt: '14:32',
    items: [{ name: 'Kafteji', qty: 2, price: 5.500 }, { name: 'Lablabi', qty: 1, price: 3.000 }],
    total: 14.000, note: 'Sans piment svp',
  },
  {
    id: 'ORD002', clientName: 'Ahmed B.', status: 'PREPARING', createdAt: '14:18',
    items: [{ name: 'Sandwich Tunisien', qty: 3, price: 4.000 }, { name: "Jus d'orange", qty: 3, price: 2.500 }],
    total: 19.500, note: '',
  },
  {
    id: 'ORD003', clientName: 'Meriem T.', status: 'DELIVERED', createdAt: '12:05',
    items: [{ name: 'Couscous poulet', qty: 2, price: 9.000 }],
    total: 18.000, note: '',
  },
];

const statusColor = (s) => {
  if (s === 'PENDING') return COLORS.accent;
  if (['ACCEPTED', 'PREPARING', 'READY'].includes(s)) return COLORS.blue;
  if (['PICKED_UP', 'DELIVERING'].includes(s)) return COLORS.orange;
  if (s === 'DELIVERED') return COLORS.green;
  return COLORS.red;
};
const statusLabel = (s) => ({
  PENDING: 'Nouveau', ACCEPTED: 'Accepté', PREPARING: 'En préparation',
  READY: 'Prêt', PICKED_UP: 'Récupéré', DELIVERING: 'En livraison',
  DELIVERED: 'Livré', CANCELLED: 'Annulé',
}[s] || s);

function OrderCard({ item, onAccept, onReject, onReady }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderId}>#{item.id}</Text>
          <Text style={styles.clientName}>{item.clientName}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.orderTime}>{item.createdAt}</Text>
          <View style={[styles.statusBadge, {
            borderColor: statusColor(item.status) + '60',
            backgroundColor: statusColor(item.status) + '15',
          }]}>
            <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{statusLabel(item.status)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.itemsList}>
        {item.items.map((it, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemQty}>{it.qty}×</Text>
            <Text style={styles.itemName}>{it.name}</Text>
            <Text style={styles.itemPrice}>{(it.qty * it.price).toFixed(3)}</Text>
          </View>
        ))}
      </View>

      {!!item.note && (
        <View style={styles.noteRow}>
          <Text style={styles.noteIcon}>📝</Text>
          <Text style={styles.noteText}>{item.note}</Text>
        </View>
      )}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>{item.total.toFixed(3)} TND</Text>
      </View>

      {item.status === 'PENDING' && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.rejectBtn} onPress={() => onReject(item.id)}>
            <Text style={styles.rejectBtnText}>✕ Refuser</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptBtn} onPress={() => onAccept(item.id)}>
            <Text style={styles.acceptBtnText}>✓ Accepter</Text>
          </TouchableOpacity>
        </View>
      )}
      {item.status === 'PREPARING' && (
        <TouchableOpacity style={styles.readyBtn} onPress={() => onReady(item.id)}>
          <Text style={styles.readyBtnText}>✓ Marquer comme prêt</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function MerchantOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/merchant/orders')
      .then(r => setOrders(r.data.orders || MOCK_ORDERS))
      .catch(() => setOrders(MOCK_ORDERS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAccept = async (id) => {
    try {
      await api.post(`/api/merchant/orders/${id}/accept`);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'PREPARING' } : o));
    } catch { Alert.alert('Erreur', "Impossible d'accepter la commande."); }
  };

  const handleReject = (id) => {
    Alert.alert('Refuser la commande', 'Êtes-vous sûr ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Refuser', style: 'destructive', onPress: async () => {
          try {
            await api.post(`/api/merchant/orders/${id}/cancel`);
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'CANCELLED' } : o));
          } catch { Alert.alert('Erreur', 'Impossible de refuser.'); }
        },
      },
    ]);
  };

  const handleReady = async (id) => {
    try {
      await api.post(`/api/merchant/orders/${id}/ready`);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'READY' } : o));
    } catch { Alert.alert('Erreur', 'Impossible de marquer comme prêt.'); }
  };

  const filtered = orders.filter(o => (STATUS_MAP[o.status] ?? 0) === tab);
  const pendingCount = orders.filter(o => o.status === 'PENDING').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.headerTitle}>Commandes</Text>
          {pendingCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}>
          <Text style={{ color: COLORS.accent, fontSize: 20 }}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={i} style={[styles.tabBtn, tab === i && styles.tabBtnActive]} onPress={() => setTab(i)}>
            <Text style={[styles.tabLabel, tab === i && styles.tabLabelActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <OrderCard item={item} onAccept={handleAccept} onReject={handleReject} onReady={handleReady} />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ fontSize: 40 }}>📋</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucune commande ici</Text>
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
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  badge: { backgroundColor: COLORS.red, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  refreshBtn: { width: 40, alignItems: 'flex-end' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  tabLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tabLabelActive: { color: COLORS.accent },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  orderId: { color: COLORS.muted, fontSize: 11 },
  clientName: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginTop: 2 },
  headerRight: { alignItems: 'flex-end', gap: 4 },
  orderTime: { color: COLORS.muted, fontSize: 12 },
  statusBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  itemsList: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, marginBottom: 10, gap: 6 },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  itemQty: { color: COLORS.accent, fontSize: 13, fontWeight: '700', width: 28 },
  itemName: { flex: 1, color: COLORS.text, fontSize: 13 },
  itemPrice: { color: COLORS.muted, fontSize: 13 },
  noteRow: {
    flexDirection: 'row', backgroundColor: '#F5A62310', borderRadius: 8, padding: 8,
    marginBottom: 10, gap: 6, borderWidth: 1, borderColor: '#F5A62330',
  },
  noteIcon: { fontSize: 12 },
  noteText: { color: COLORS.accent, fontSize: 12, flex: 1 },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10,
  },
  totalLabel: { color: COLORS.muted, fontSize: 13 },
  totalAmount: { color: COLORS.text, fontSize: 16, fontWeight: '900' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  rejectBtn: {
    flex: 1, borderRadius: 10, borderWidth: 1, borderColor: COLORS.red,
    paddingVertical: 10, alignItems: 'center',
  },
  rejectBtnText: { color: COLORS.red, fontSize: 14, fontWeight: '700' },
  acceptBtn: {
    flex: 2, borderRadius: 10, backgroundColor: COLORS.green,
    paddingVertical: 10, alignItems: 'center',
  },
  acceptBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  readyBtn: {
    marginTop: 12, borderRadius: 10, backgroundColor: COLORS.blue,
    paddingVertical: 10, alignItems: 'center',
  },
  readyBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
