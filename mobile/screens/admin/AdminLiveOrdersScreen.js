import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  accent: '#D32F2F',
  green: '#27AE60',
  orange: '#F57C00',
  blue: '#1565C0',
};

const SERVICE_CONFIG = {
  TAXI: { icon: '🚕', color: COLORS.orange, label: 'Taxi' },
  DELIVERY: { icon: '🛵', color: COLORS.green, label: 'Livraison' },
  SOS: { icon: '🛻', color: COLORS.accent, label: 'SOS' },
  GROCERY: { icon: '🛒', color: '#00838F', label: 'Épicerie' },
};

const STATUS_COLOR = {
  PENDING: COLORS.orange,
  ACCEPTED: COLORS.blue,
  IN_PROGRESS: COLORS.green,
};

const STATUS_LABEL = {
  PENDING: 'En attente',
  ACCEPTED: 'Accepté',
  IN_PROGRESS: 'En cours',
};

const FILTERS = ['ALL', 'TAXI', 'DELIVERY', 'SOS', 'GROCERY'];

function LiveDot() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return <Animated.View style={[ld.dot, { opacity }]} />;
}

const ld = StyleSheet.create({
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green },
});

export default function AdminLiveOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async (silent = false) => {
    try {
      const res = await api.get('/api/admin/orders/live');
      setOrders(res.data.orders || []);
      setLastUpdated(new Date());
    } catch {
      if (!silent) setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(() => load(true), 5000);
    return () => clearInterval(iv);
  }, [load]);

  const filtered = filter === 'ALL' ? orders : orders.filter((o) => o.serviceType === filter);

  const countByService = (type) => orders.filter((o) => o.serviceType === type).length;

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.green} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <LiveDot />
            <Text style={s.title}>Commandes en direct</Text>
          </View>
          <Text style={s.lastUpdated}>
            {lastUpdated ? `Mis à jour ${lastUpdated.toLocaleTimeString('fr-TN')}` : 'Chargement...'}
          </Text>
        </View>
        <View style={s.totalBadge}>
          <Text style={s.totalBadgeTxt}>{orders.length}</Text>
        </View>
      </View>

      {/* Service summary */}
      <View style={s.summaryRow}>
        {Object.entries(SERVICE_CONFIG).map(([key, cfg]) => (
          <View key={key} style={[s.summaryCard, { borderColor: cfg.color + '44' }]}>
            <Text style={{ fontSize: 16 }}>{cfg.icon}</Text>
            <Text style={[s.summaryCount, { color: cfg.color }]}>{countByService(key)}</Text>
            <Text style={s.summaryLabel}>{cfg.label}</Text>
          </View>
        ))}
      </View>

      {/* Filter tabs */}
      <View style={s.filterScroll}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[s.filterTab, filter === f && s.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.filterTxt, filter === f && s.filterTxtActive]}>
              {f === 'ALL' ? `Tous (${orders.length})` : `${SERVICE_CONFIG[f]?.icon} ${SERVICE_CONFIG[f]?.label} (${countByService(f)})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.green} />}
        renderItem={({ item }) => {
          const cfg = SERVICE_CONFIG[item.serviceType] || SERVICE_CONFIG.TAXI;
          const statusColor = STATUS_COLOR[item.status] || COLORS.muted;
          const elapsed = Math.floor((Date.now() - new Date(item.createdAt)) / 60000);
          return (
            <TouchableOpacity
              style={[s.orderCard, { borderLeftColor: cfg.color }]}
              onPress={() => navigation.navigate('AdminOrderDetail', { orderId: item.id })}
            >
              <View style={s.orderTop}>
                <Text style={{ fontSize: 20 }}>{cfg.icon}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={s.orderId}>#{item.id.slice(-6).toUpperCase()}</Text>
                    <View style={[s.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
                      <Text style={[s.statusBadgeTxt, { color: statusColor }]}>{STATUS_LABEL[item.status] || item.status}</Text>
                    </View>
                  </View>
                  <Text style={s.clientName}>{item.client?.name || 'Client'}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.amount, { color: cfg.color }]}>{parseFloat(item.price || 0).toFixed(0)} TND</Text>
                  <Text style={[s.elapsed, elapsed > 15 ? { color: COLORS.accent } : null]}>⏱ {elapsed}min</Text>
                </View>
              </View>

              {item.provider ? (
                <Text style={s.providerName}>🚗 {item.provider.name}</Text>
              ) : (
                <Text style={[s.providerName, { color: COLORS.orange }]}>⚠️ Aucun prestataire assigné</Text>
              )}

              {item.metadata?.pickupAddress && (
                <Text style={s.address} numberOfLines={1}>📍 {item.metadata.pickupAddress}</Text>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>✅</Text>
            <Text style={s.emptyTitle}>Aucune commande active</Text>
            <Text style={s.emptySub}>Toutes les commandes sont terminées ou annulées.</Text>
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
  lastUpdated: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  totalBadge: { backgroundColor: COLORS.green, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  totalBadgeTxt: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, paddingVertical: 10 },
  summaryCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, padding: 8, alignItems: 'center', borderWidth: 1, gap: 2 },
  summaryCount: { fontSize: 16, fontWeight: '800' },
  summaryLabel: { color: COLORS.muted, fontSize: 9, textAlign: 'center' },
  filterScroll: { flexDirection: 'row', paddingHorizontal: 16, gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  filterTab: { backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  filterTabActive: { borderColor: COLORS.green, backgroundColor: COLORS.green + '22' },
  filterTxt: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  filterTxtActive: { color: COLORS.green },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
  },
  orderTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  orderId: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  statusBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1 },
  statusBadgeTxt: { fontSize: 10, fontWeight: '700' },
  clientName: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '700' },
  elapsed: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  providerName: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  address: { color: COLORS.muted, fontSize: 11 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center' },
});
