import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
  orange: '#E67E22', purple: '#9B59B6',
};

const SERVICES = ['Tous', 'TAXI', 'DELIVERY', 'GROCERY', 'SOS'];
const STATUS_COLOR = {
  PENDING: COLORS.accent, ACCEPTED: COLORS.blue, IN_PROGRESS: COLORS.orange,
  COMPLETED: COLORS.green, CANCELLED: COLORS.red,
};
const STATUS_LABEL = {
  PENDING: 'En attente', ACCEPTED: 'Accepté', IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé', CANCELLED: 'Annulé',
};
const SERVICE_ICON = { TAXI: '🚕', DELIVERY: '📦', GROCERY: '🛒', SOS: '🔧' };

const MOCK_ORDERS = [
  { id: 'ORD001', service: 'TAXI', status: 'IN_PROGRESS', client: 'Nadia K.', provider: 'Karim B.', amount: 18.500, createdAt: '14:32' },
  { id: 'ORD002', service: 'DELIVERY', status: 'PENDING', client: 'Ahmed B.', provider: null, amount: 5.000, createdAt: '14:30' },
  { id: 'ORD003', service: 'GROCERY', status: 'COMPLETED', client: 'Meriem T.', provider: 'Sara M.', amount: 34.750, createdAt: '13:45' },
  { id: 'ORD004', service: 'SOS', status: 'ACCEPTED', client: 'Sami R.', provider: 'Mounir T.', amount: 45.000, createdAt: '13:20' },
  { id: 'ORD005', service: 'TAXI', status: 'CANCELLED', client: 'Leila A.', provider: null, amount: 0, createdAt: '12:55' },
  { id: 'ORD006', service: 'DELIVERY', status: 'COMPLETED', client: 'Yassine M.', provider: 'Aymen K.', amount: 3.500, createdAt: '12:10' },
];

function OrderRow({ item }) {
  const sc = STATUS_COLOR[item.status] || COLORS.muted;
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowIcon}>{SERVICE_ICON[item.service] || '📋'}</Text>
        <View style={styles.rowInfo}>
          <Text style={styles.rowId}>#{item.id}</Text>
          <Text style={styles.rowClient}>{item.client}</Text>
          {item.provider && <Text style={styles.rowProvider}>↳ {item.provider}</Text>}
        </View>
      </View>
      <View style={styles.rowRight}>
        <View style={[styles.statusDot, { backgroundColor: sc + '20', borderColor: sc + '60' }]}>
          <Text style={[styles.statusText, { color: sc }]}>{STATUS_LABEL[item.status] || item.status}</Text>
        </View>
        <Text style={styles.rowAmount}>{item.amount > 0 ? `${item.amount.toFixed(3)} TND` : '—'}</Text>
        <Text style={styles.rowTime}>{item.createdAt}</Text>
      </View>
    </View>
  );
}

export default function AdminOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState('Tous');
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/admin/orders?limit=100')
      .then(r => setOrders(r.data.orders || MOCK_ORDERS))
      .catch(() => setOrders(MOCK_ORDERS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter(o => {
    const matchService = service === 'Tous' || o.service === service;
    const q = search.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q)
      || o.client.toLowerCase().includes(q)
      || (o.provider || '').toLowerCase().includes(q);
    return matchService && matchSearch;
  });

  const stats = {
    total: orders.length,
    active: orders.filter(o => ['PENDING','ACCEPTED','IN_PROGRESS'].includes(o.status)).length,
    revenue: orders.filter(o => o.status === 'COMPLETED').reduce((s, o) => s + o.amount, 0),
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Toutes les commandes</Text>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}>
          <Text style={{ color: COLORS.accent, fontSize: 20 }}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{stats.total}</Text>
          <Text style={styles.statLabel}>total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.orange }]}>{stats.active}</Text>
          <Text style={styles.statLabel}>actives</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.accent }]}>{stats.revenue.toFixed(3)}</Text>
          <Text style={styles.statLabel}>TND CA</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="ID, client, prestataire..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        horizontal
        data={SERVICES}
        keyExtractor={s => s}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.serviceFilter}
        renderItem={({ item: s }) => (
          <TouchableOpacity
            style={[styles.svcBtn, service === s && styles.svcBtnActive]}
            onPress={() => setService(s)}
          >
            <Text style={[styles.svcLabel, service === s && styles.svcLabelActive]}>
              {s !== 'Tous' ? SERVICE_ICON[s] + ' ' : ''}{s}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={o => o.id}
          renderItem={({ item }) => <OrderRow item={item} />}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ fontSize: 40 }}>📋</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucune commande trouvée</Text>
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
  refreshBtn: { width: 40, alignItems: 'flex-end' },
  statsBar: {
    flexDirection: 'row', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  statLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  searchRow: { paddingHorizontal: 16, paddingVertical: 10 },
  searchInput: {
    backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 10, color: COLORS.text, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  serviceFilter: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  svcBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  svcBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  svcLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  svcLabelActive: { color: '#000' },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
  },
  rowLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  rowIcon: { fontSize: 22, marginTop: 2 },
  rowInfo: {},
  rowId: { color: COLORS.muted, fontSize: 11 },
  rowClient: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  rowProvider: { color: COLORS.muted, fontSize: 12, marginTop: 1 },
  rowRight: { alignItems: 'flex-end', gap: 3 },
  statusDot: {
    borderRadius: 6, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  rowAmount: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  rowTime: { color: COLORS.muted, fontSize: 11 },
  separator: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 16 },
});
