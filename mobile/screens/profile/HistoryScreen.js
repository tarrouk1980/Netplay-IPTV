import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  green: '#27AE60',
  red: '#E74C3C',
  blue: '#2196F3',
  orange: '#F39C12',
};

const SERVICE_META = {
  TAXI: { label: 'EasyTaxy', emoji: '🚕', color: COLORS.primary },
  SOS: { label: 'SOS Remorquage', emoji: '🚛', color: COLORS.red },
  DELIVERY: { label: 'Livraison', emoji: '🛵', color: COLORS.green },
  GROCERY: { label: 'Courses', emoji: '🛒', color: COLORS.blue },
};

const STATUS_LABELS = {
  PENDING: { label: 'En attente', color: COLORS.orange },
  ACCEPTED: { label: 'Acceptée', color: COLORS.blue },
  IN_PROGRESS: { label: 'En cours', color: COLORS.blue },
  COMPLETED: { label: 'Terminée', color: COLORS.green },
  CANCELLED: { label: 'Annulée', color: COLORS.red },
  DISPUTED: { label: 'Litige', color: COLORS.red },
};

const TABS = ['Tout', 'Taxi', 'SOS', 'Livraison'];
const TAB_SERVICE_MAP = {
  'Tout': null,
  'Taxi': 'TAXI',
  'SOS': 'SOS',
  'Livraison': 'DELIVERY',
};

function OrderItem({ item, onPress }) {
  const meta = SERVICE_META[item.serviceType] || { label: item.serviceType, emoji: '📦', color: COLORS.textMuted };
  const statusCfg = STATUS_LABELS[item.status] || { label: item.status, color: COLORS.textMuted };
  const price = item.finalPrice ?? item.price;

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.itemHeader}>
        <Text style={[styles.itemEmoji]}>{meta.emoji}</Text>
        <View style={styles.itemHeaderInfo}>
          <Text style={styles.itemLabel}>{meta.label}</Text>
          <Text style={styles.itemDate}>
            {new Date(item.createdAt).toLocaleDateString('fr-TN', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.color + '22', borderColor: statusCfg.color }]}>
          <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        </View>
      </View>
      {(item.originAddress || item.destinationAddress) && (
        <View style={styles.routeRow}>
          {item.originAddress && (
            <Text style={styles.routeText} numberOfLines={1}>📍 {item.originAddress}</Text>
          )}
          {item.destinationAddress && (
            <Text style={styles.routeText} numberOfLines={1}>🏁 {item.destinationAddress}</Text>
          )}
        </View>
      )}
      {price != null && (
        <Text style={styles.itemPrice}>{parseFloat(price).toFixed(3)} TND</Text>
      )}
      <Text style={{ color: '#4A4A5A', fontSize: 11, textAlign: 'right', marginTop: 4 }}>Voir détails ›</Text>
    </TouchableOpacity>
  );
}

export default function HistoryScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Tout');

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/api/users/me/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.warn('[HistoryScreen] Failed to fetch orders:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const serviceFilter = TAB_SERVICE_MAP[activeTab];
  const filtered = serviceFilter
    ? orders.filter((o) => o.serviceType === serviceFilter)
    : orders;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📋 Historique</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderItem
              item={item}
              onPress={() => navigation.navigate('HistoryDetail', { orderId: item.id, orderData: item })}
            />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>Aucune commande</Text>
              <Text style={styles.emptyText}>Vos courses apparaîtront ici.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: 'space-between',
  },
  backBtn: { padding: 4 },
  backTxt: { color: COLORS.text, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#252535',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#000' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  item: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  itemEmoji: { fontSize: 28 },
  itemHeaderInfo: { flex: 1 },
  itemLabel: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  itemDate: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  routeRow: { gap: 3, marginBottom: 8 },
  routeText: { color: COLORS.textMuted, fontSize: 12 },
  itemPrice: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyEmoji: { fontSize: 52, marginBottom: 8 },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
});
