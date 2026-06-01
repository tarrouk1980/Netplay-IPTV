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
  accent: '#D32F2F',
  green: '#27AE60',
  orange: '#F57C00',
};

const PROBLEM_ICONS = {
  FLAT_TIRE: '🔧',
  BATTERY: '🔋',
  ENGINE: '⚙️',
  ACCIDENT: '💥',
  FUEL: '⛽',
  LOCKOUT: '🔑',
  OTHER: '🛻',
};

const STATUS_CONFIG = {
  PENDING: { color: COLORS.orange, label: 'En attente' },
  ACCEPTED: { color: '#1565C0', label: 'Accepté' },
  IN_PROGRESS: { color: '#00838F', label: 'En cours' },
  COMPLETED: { color: COLORS.green, label: 'Terminé' },
  CANCELLED: { color: COLORS.muted, label: 'Annulé' },
};

const MOCK_ORDERS = [
  {
    id: 'sos-001',
    problemType: 'FLAT_TIRE',
    status: 'COMPLETED',
    price: 45,
    createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    provider: { name: 'Karim B.' },
    address: 'Autoroute A1, Km 42, Tunis',
  },
  {
    id: 'sos-002',
    problemType: 'BATTERY',
    status: 'COMPLETED',
    price: 30,
    createdAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    provider: { name: 'Mohamed S.' },
    address: 'Route de la Marsa, Ariana',
  },
  {
    id: 'sos-003',
    problemType: 'ACCIDENT',
    status: 'CANCELLED',
    price: 0,
    createdAt: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
    provider: null,
    address: 'Rue Ibn Khaldoun, Sfax',
  },
];

export default function ClientSOSHistoryScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    try {
      const res = await api.get('/api/sos/client/history');
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
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + (parseFloat(o.price) || 0), 0);

  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.accent} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>🛻 Historique SOS</Text>
        <View style={s.countBadge}>
          <Text style={s.countBadgeTxt}>{orders.length}</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={s.summaryRow}>
        <View style={s.summaryCard}>
          <Text style={[s.summaryVal, { color: COLORS.accent }]}>{orders.length}</Text>
          <Text style={s.summaryLbl}>Demandes</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={[s.summaryVal, { color: COLORS.green }]}>{completedCount}</Text>
          <Text style={s.summaryLbl}>Terminées</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={[s.summaryVal, { color: COLORS.orange }]}>{totalSpent.toFixed(0)} TND</Text>
          <Text style={s.summaryLbl}>Dépensé</Text>
        </View>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(true); }}
            tintColor={COLORS.accent}
          />
        }
        renderItem={({ item }) => {
          const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
          const icon = PROBLEM_ICONS[item.problemType] || PROBLEM_ICONS.OTHER;
          const date = new Date(item.createdAt).toLocaleDateString('fr-TN', {
            day: '2-digit', month: 'short', year: 'numeric',
          });
          return (
            <TouchableOpacity
              style={[s.card, { borderLeftColor: st.color }]}
              onPress={() => navigation.navigate('SOSOrderDetail', { orderId: item.id })}
            >
              <View style={s.cardTop}>
                <Text style={{ fontSize: 22 }}>{icon}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={s.orderId}>#{item.id.slice(-6).toUpperCase()}</Text>
                    <View style={[s.statusBadge, { backgroundColor: st.color + '22', borderColor: st.color }]}>
                      <Text style={[s.statusTxt, { color: st.color }]}>{st.label}</Text>
                    </View>
                  </View>
                  <Text style={s.date}>{date}</Text>
                </View>
                <Text style={[s.price, item.status === 'COMPLETED' ? { color: COLORS.accent } : { color: COLORS.muted }]}>
                  {item.status === 'COMPLETED' ? `${parseFloat(item.price || 0).toFixed(0)} TND` : '—'}
                </Text>
              </View>

              {item.address ? (
                <Text style={s.address} numberOfLines={1}>📍 {item.address}</Text>
              ) : null}

              {item.provider ? (
                <Text style={s.provider}>🛻 {item.provider.name}</Text>
              ) : item.status !== 'CANCELLED' ? (
                <Text style={[s.provider, { color: COLORS.orange }]}>⚠️ Aucun dépanneur assigné</Text>
              ) : null}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🛻</Text>
            <Text style={s.emptyTitle}>Aucune demande SOS</Text>
            <Text style={s.emptySub}>Vos demandes d'assistance routière apparaîtront ici.</Text>
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
  countBadge: { backgroundColor: COLORS.accent, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  countBadgeTxt: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', padding: 16, gap: 8 },
  summaryCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  summaryVal: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  summaryLbl: { color: COLORS.muted, fontSize: 10, fontWeight: '600' },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  orderId: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  statusBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1 },
  statusTxt: { fontSize: 10, fontWeight: '700' },
  date: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  price: { fontSize: 14, fontWeight: '700' },
  address: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  provider: { color: COLORS.muted, fontSize: 12 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center' },
});
