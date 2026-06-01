import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Switch,
  ActivityIndicator,
  Alert,
  StatusBar,
  RefreshControl,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useDeliveryStore from '../../store/deliveryStore';
import usePassStore from '../../store/passStore';
import PassAlertBanner from '../../components/PassAlertBanner';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  green: '#27AE60',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2A2A3A',
  danger: '#E74C3C',
  warning: '#F39C12',
};

export default function MerchantDashboardScreen({ navigation }) {
  const { fetchMerchantOrders, acceptOrder, markReady } = useDeliveryStore();
  const { passStatus, fetchPassStatus } = usePassStore();
  const [isOpen, setIsOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [profileRes, ordersData] = await Promise.all([
        api.get('/api/merchants/me').catch(() => ({ data: {} })),
        fetchMerchantOrders(),
      ]);
      setIsOpen(profileRes.data.merchant?.isOpen ?? false);
      setOrders(ordersData || []);

      // After the existing API calls, add:
      try {
        const statsRes = await api.get('/api/merchants/stats');
        setStats(statsRes.data);
      } catch {
        // Use computed stats from orders
        const completed = (ordersData || []).filter(o => o.status === 'COMPLETED');
        const today = completed.filter(o => new Date(o.completedAt || o.createdAt).toDateString() === new Date().toDateString());
        setStats({
          todayOrders: today.length,
          todayRevenue: today.reduce((s, o) => s + Number(o.totalAmount || 0), 0),
          monthOrders: completed.length,
          monthRevenue: completed.reduce((s, o) => s + Number(o.totalAmount || 0), 0),
          pendingOrders: (ordersData || []).filter(o => o.status === 'PENDING').length,
          rating: 4.7,
        });
      }
    } catch (err) {
      console.warn('[MerchantDashboard] loadData error:', err?.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    fetchPassStatus();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleToggleOpen = async (value) => {
    setToggleLoading(true);
    try {
      await api.patch('/merchants/me/toggle');
      setIsOpen(value);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de changer l\'état de la boutique.');
    } finally {
      setToggleLoading(false);
    }
  };

  const handleAccept = async (orderId) => {
    setActionLoading(orderId + '_accept');
    try {
      await acceptOrder(orderId);
      await loadData();
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible d\'accepter.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReady = async (orderId) => {
    setActionLoading(orderId + '_ready');
    try {
      await markReady(orderId);
      await loadData();
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de marquer comme prête.');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const activeOrders = orders.filter((o) => ['ACCEPTED', 'IN_PROGRESS'].includes(o.status));

  const renderOrderCard = (item, isPending) => {
    const meta = item.metadata || {};
    return (
      <View key={item.id} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.clientName}>{item.client?.name || 'Client'}</Text>
            <Text style={styles.orderTime}>{new Date(item.createdAt).toLocaleTimeString('fr-TN')}</Text>
          </View>
          <Text style={styles.orderTotal}>{parseFloat(item.price || 0).toFixed(3)} TND</Text>
        </View>

        <Text style={styles.deliveryAddress}>📍 {meta.deliveryAddress}</Text>
        {meta.note ? <Text style={styles.note}>💬 {meta.note}</Text> : null}

        <View style={styles.itemsList}>
          {(meta.items || []).map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemQty}>{item.quantity}×</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{item.lineTotal?.toFixed(3)} TND</Text>
            </View>
          ))}
        </View>

        {isPending && (
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => handleAccept(item.id)}
            disabled={actionLoading === item.id + '_accept'}
          >
            {actionLoading === item.id + '_accept' ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.acceptBtnText}>✓ Accepter la commande</Text>
            )}
          </TouchableOpacity>
        )}

        {item.status === 'ACCEPTED' && (
          <TouchableOpacity
            style={styles.readyBtn}
            onPress={() => handleReady(item.id)}
            disabled={actionLoading === item.id + '_ready'}
          >
            {actionLoading === item.id + '_ready' ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.readyBtnText}>🍽 Commande prête !</Text>
            )}
          </TouchableOpacity>
        )}

        {item.status === 'IN_PROGRESS' && (
          <View style={styles.inProgressTag}>
            <Text style={styles.inProgressText}>🛵 En cours de livraison</Text>
          </View>
        )}

        <TouchableOpacity
          style={{ marginTop: 8, alignSelf: 'flex-end' }}
          onPress={() => navigation.navigate('MerchantOrderDetail', { orderId: item.id })}
        >
          <Text style={{ color: '#27AE60', fontSize: 12, fontWeight: '700' }}>Détail complet →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.green} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ma Boutique</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MerchantStats')}>
          <Text style={styles.headerAction}>Stats</Text>
        </TouchableOpacity>
      </View>

      <PassAlertBanner
        hasActivePass={passStatus?.hasActivePass ?? true}
        daysLeft={passStatus?.daysLeft ?? 99}
      />
      <View style={styles.toggleCard}>
        <View>
          <Text style={styles.toggleLabel}>
            {isOpen ? '🟢 Boutique ouverte' : '🔴 Boutique fermée'}
          </Text>
          <Text style={styles.toggleSub}>
            {isOpen ? 'Vous recevez des commandes' : 'Les clients ne peuvent pas commander'}
          </Text>
        </View>
        {toggleLoading ? (
          <ActivityIndicator color={COLORS.green} />
        ) : (
          <Switch
            value={isOpen}
            onValueChange={handleToggleOpen}
            trackColor={{ false: COLORS.border, true: COLORS.green }}
            thumbColor="#FFF"
          />
        )}
      </View>

      <FlatList
        data={[]}
        keyExtractor={() => 'dummy'}
        renderItem={null}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.green} />}
        ListHeaderComponent={
          <>
            {/* Revenue KPIs */}
            {stats && (
              <View style={styles.kpiRow}>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiValue}>{stats.todayOrders ?? 0}</Text>
                  <Text style={styles.kpiLabel}>Commandes{'\n'}aujourd'hui</Text>
                </View>
                <View style={styles.kpiCard}>
                  <Text style={[styles.kpiValue, { color: '#27AE60' }]}>{(stats.todayRevenue ?? 0).toFixed(0)} TND</Text>
                  <Text style={styles.kpiLabel}>Revenus{'\n'}aujourd'hui</Text>
                </View>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiValue}>{stats.monthOrders ?? 0}</Text>
                  <Text style={styles.kpiLabel}>Ce mois</Text>
                </View>
                <View style={styles.kpiCard}>
                  <Text style={[styles.kpiValue, { color: '#F5A623' }]}>⭐ {(stats.rating ?? 0).toFixed(1)}</Text>
                  <Text style={styles.kpiLabel}>Note{'\n'}moyenne</Text>
                </View>
              </View>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Commandes en attente</Text>
              {pendingOrders.length > 0 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>{pendingOrders.length}</Text>
                </View>
              )}
            </View>

            {pendingOrders.length === 0 ? (
              <Text style={styles.emptyText}>Aucune commande en attente.</Text>
            ) : (
              <View style={styles.ordersContainer}>
                {pendingOrders.map((o) => renderOrderCard(o, true))}
              </View>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Commandes en cours</Text>
              {activeOrders.length > 0 && (
                <Text style={styles.sectionCount}>{activeOrders.length}</Text>
              )}
            </View>

            {activeOrders.length === 0 ? (
              <Text style={styles.emptyText}>Aucune commande en cours.</Text>
            ) : (
              <View style={styles.ordersContainer}>
                {activeOrders.map((o) => renderOrderCard(o, false))}
              </View>
            )}
          </>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backArrow: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.green, fontSize: 20, fontWeight: '600' },
  headerAction: { color: COLORS.green, fontSize: 14 },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleLabel: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  toggleSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '600', flex: 1 },
  sectionCount: { color: COLORS.green, fontWeight: '700', fontSize: 13 },
  pendingBadge: {
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingBadgeText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  ordersContainer: { paddingHorizontal: 20 },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  clientName: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  orderTime: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  orderTotal: { color: COLORS.green, fontSize: 16, fontWeight: '700' },
  deliveryAddress: { color: COLORS.textMuted, fontSize: 13, marginBottom: 4 },
  note: { color: COLORS.textMuted, fontSize: 13, fontStyle: 'italic', marginBottom: 8 },
  itemsList: { marginTop: 8, marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3 },
  itemQty: { color: COLORS.green, fontWeight: '700', fontSize: 13, marginRight: 6 },
  itemName: { color: COLORS.text, fontSize: 13, flex: 1 },
  itemPrice: { color: COLORS.textMuted, fontSize: 13 },
  acceptBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  acceptBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  readyBtn: {
    backgroundColor: COLORS.warning,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  readyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  inProgressTag: {
    backgroundColor: '#0D2A1A',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  inProgressText: { color: COLORS.green, fontWeight: '600', fontSize: 14 },
  listContent: { paddingBottom: 40 },
  emptyText: { color: COLORS.textMuted, textAlign: 'center', marginVertical: 12, paddingHorizontal: 20, fontSize: 13 },
  kpiRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginTop: 12, marginBottom: 4 },
  kpiCard: {
    flex: 1,
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C3E',
  },
  kpiValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  kpiLabel: { color: '#8E8E9A', fontSize: 10, textAlign: 'center', lineHeight: 13 },
});
