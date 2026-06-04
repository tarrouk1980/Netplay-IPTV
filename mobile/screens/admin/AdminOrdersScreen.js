import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const TYPE_ICONS = { TAXI: '🚕', DELIVERY: '📦', GROCERY: '🛒', SOS: '🔧' };
const STATUS_COLORS = {
  COMPLETED: COLORS.green, CANCELLED: COLORS.red,
  IN_PROGRESS: COLORS.blue, PENDING: COLORS.orange, ASSIGNED: COLORS.accent,
};
const STATUS_LABELS = {
  COMPLETED: 'Terminé', CANCELLED: 'Annulé',
  IN_PROGRESS: 'En cours', PENDING: 'En attente', ASSIGNED: 'Assigné',
};

const MOCK = [
  { id: 'ORD-001', type: 'TAXI', client: 'Nadia K.', provider: 'Mohamed A.', amount: 8.500, status: 'COMPLETED', date: '03/06 15:40', from: 'Lac 1', to: 'Berges Lac 2' },
  { id: 'ORD-002', type: 'DELIVERY', client: 'Ahmed B.', provider: 'Sami K.', amount: 12.800, status: 'IN_PROGRESS', date: '03/06 16:10', from: 'Pizza Roma', to: 'Menzah 6' },
  { id: 'ORD-003', type: 'GROCERY', client: 'Lina M.', provider: null, amount: 34.500, status: 'PENDING', date: '03/06 16:25', from: 'Monoprix', to: 'Ariana' },
  { id: 'ORD-004', type: 'SOS', client: 'Youssef T.', provider: 'Karim M.', amount: 45.000, status: 'ASSIGNED', date: '03/06 15:50', from: 'A1 km42', to: null },
  { id: 'ORD-005', type: 'TAXI', client: 'Rim S.', provider: 'Nour B.', amount: 18.000, status: 'COMPLETED', date: '03/06 14:30', from: 'Tunis Centre', to: 'Carthage' },
  { id: 'ORD-006', type: 'DELIVERY', client: 'Slim A.', provider: null, amount: 7.500, status: 'CANCELLED', date: '03/06 13:10', from: 'KFC', to: 'Lafayette' },
];

const STATUSES = ['Tous', 'PENDING', 'IN_PROGRESS', 'ASSIGNED', 'COMPLETED', 'CANCELLED'];

function OrderRow({ item, onPress }) {
  const sc = STATUS_COLORS[item.status] || COLORS.muted;
  return (
    <TouchableOpacity style={styles.row} onPress={() => onPress(item)} activeOpacity={0.8}>
      <View style={[styles.typeBox, { backgroundColor: sc + '15' }]}>
        <Text style={{ fontSize: 20 }}>{TYPE_ICONS[item.type] || '📋'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.rowTop}>
          <Text style={styles.orderId}>#{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: sc + '20', borderColor: sc + '40' }]}>
            <Text style={[styles.statusText, { color: sc }]}>{STATUS_LABELS[item.status]}</Text>
          </View>
        </View>
        <Text style={styles.rowClient}>{item.client} → {item.provider || 'Sans prestataire'}</Text>
        <View style={styles.rowBottom}>
          <Text style={styles.rowDate}>{item.date}</Text>
          <Text style={styles.rowAmount}>{item.amount.toFixed(3)} TND</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function AdminOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');

  const load = useCallback(() => {
    api.get('/api/admin/orders')
      .then(r => setOrders(r.data.orders || MOCK))
      .catch(() => setOrders(MOCK))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'Tous' || o.status === statusFilter;
    const matchSearch = o.id.includes(search) ||
      o.client.toLowerCase().includes(search.toLowerCase()) ||
      (o.provider || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {};
  STATUSES.slice(1).forEach(s => { counts[s] = orders.filter(o => o.status === s).length; });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📋 Commandes</Text>
        <Text style={styles.totalCount}>{filtered.length}</Text>
      </View>

      <View style={styles.alertRow}>
        {counts['PENDING'] > 0 && (
          <TouchableOpacity style={styles.alertBadge} onPress={() => setStatusFilter('PENDING')}>
            <Text style={styles.alertText}>⏳ {counts['PENDING']} en attente</Text>
          </TouchableOpacity>
        )}
        {counts['IN_PROGRESS'] > 0 && (
          <View style={styles.infoBadge}>
            <Text style={styles.infoText}>🔵 {counts['IN_PROGRESS']} en cours</Text>
          </View>
        )}
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="ID, client, prestataire..."
        placeholderTextColor={COLORS.muted}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={STATUSES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={s => s}
        style={{ maxHeight: 44 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterBtn, statusFilter === item && styles.filterBtnActive]}
            onPress={() => setStatusFilter(item)}
          >
            <Text style={[styles.filterText, statusFilter === item && styles.filterTextActive]}>
              {item === 'Tous' ? 'Tous' : STATUS_LABELS[item]}
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
          renderItem={({ item }) => (
            <OrderRow item={item} onPress={o => navigation.navigate('AdminOrderDetail', { orderId: o.id })} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 36 }}>📋</Text>
              <Text style={{ color: COLORS.muted, marginTop: 10 }}>Aucune commande</Text>
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
  totalCount: {
    color: COLORS.accent, fontSize: 13, fontWeight: '700',
    backgroundColor: COLORS.accent + '20', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3,
  },
  alertRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 10 },
  alertBadge: {
    backgroundColor: COLORS.red + '15', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: COLORS.red + '40',
  },
  alertText: { color: COLORS.red, fontSize: 12, fontWeight: '700' },
  infoBadge: {
    backgroundColor: COLORS.blue + '15', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: COLORS.blue + '40',
  },
  infoText: { color: COLORS.blue, fontSize: 12, fontWeight: '700' },
  searchInput: {
    margin: 16, marginBottom: 8, backgroundColor: COLORS.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, color: COLORS.text, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterBtn: {
    borderRadius: 20, paddingHorizontal: 13, paddingVertical: 7,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  filterBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  filterText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: COLORS.accent },
  list: { padding: 16 },
  row: {
    flexDirection: 'row', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 12,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  typeBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderId: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  statusBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
  statusText: { fontSize: 10, fontWeight: '700' },
  rowClient: { color: COLORS.text, fontSize: 13, marginBottom: 4 },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  rowDate: { color: COLORS.muted, fontSize: 11 },
  rowAmount: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60 },
});
