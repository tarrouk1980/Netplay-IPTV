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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useDeliveryStore from '../../store/deliveryStore';
import useLocationStore from '../../store/locationStore';
import usePassStore from '../../store/passStore';
import PassAlertBanner from '../../components/PassAlertBanner';
import StaticMap from '../../components/StaticMap';

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

export default function LivreurDashboardScreen({ navigation }) {
  const { livreurAssignments, fetchAssignments, pickupOrder, completeDelivery, currentOrder } = useDeliveryStore();
  const { location, startTracking, stopTracking, isTracking } = useLocationStore();
  const { subscription, passStatus, fetchPassStatus } = usePassStore();
  const [isOnline, setIsOnline] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0, deliveries: 0 });

  useEffect(() => {
    fetchAssignments();
    fetchPassStatus();
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const api = (await import('../../services/api')).default;
      const res = await api.get('/api/delivery/earnings').catch(() => ({ data: null }));
      if (res.data) setEarnings(res.data);
    } catch {}
  };

  const handleToggleOnline = (value) => {
    if (value) {
      startTracking('DELIVERY');
      setIsOnline(true);
    } else {
      stopTracking();
      setIsOnline(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAssignments();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handlePickup = async (orderId) => {
    setActionLoading(orderId + '_pickup');
    try {
      await pickupOrder(orderId);
      await fetchAssignments();
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de confirmer la récupération.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (orderId) => {
    Alert.alert('Confirmer la livraison', 'Avez-vous bien remis la commande au client ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui, livré !',
        onPress: async () => {
          setActionLoading(orderId + '_complete');
          try {
            await completeDelivery(orderId);
            await fetchAssignments();
          } catch (err) {
            Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de marquer comme livré.');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const renderAssignment = ({ item }) => {
    const meta = item.metadata || {};
    const isActive = item.status === 'IN_PROGRESS';
    const isPickupPending = item.status === 'ACCEPTED';

    return (
      <View style={[styles.orderCard, isActive && styles.orderCardActive]}>
        <View style={styles.orderHeader}>
          <Text style={styles.merchantName}>{meta.merchantName || 'Restaurant'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: isActive ? COLORS.green : COLORS.warning }]}>
            <Text style={styles.statusBadgeText}>{isActive ? 'EN ROUTE' : 'À RÉCUPÉRER'}</Text>
          </View>
        </View>

        {/* Mini carte de livraison */}
        {(meta.destLat || meta.clientLat) && (
          <StaticMap
            lat={meta.destLat || meta.clientLat}
            lng={meta.destLng || meta.clientLng}
            height={120}
            zoom={14}
            style={{ borderRadius: 10, marginBottom: 10 }}
          />
        )}

        <View style={styles.addressSection}>
          <View style={styles.addressRow}>
            <Text style={styles.addressIcon}>🏪</Text>
            <Text style={styles.addressText}>{meta.merchantAddress || 'Récupérer chez le marchand'}</Text>
          </View>
          <View style={styles.addressDivider} />
          <View style={styles.addressRow}>
            <Text style={styles.addressIcon}>📍</Text>
            <Text style={styles.addressText}>{meta.deliveryAddress || 'Adresse client'}</Text>
          </View>
        </View>

        <View style={styles.orderMeta}>
          <Text style={styles.orderItems}>{(meta.items || []).length} article(s)</Text>
          <Text style={styles.orderTotal}>{parseFloat(item.price || 0).toFixed(3)} TND</Text>
        </View>

        {isPickupPending && (
          <TouchableOpacity
            style={styles.pickupBtn}
            onPress={() => handlePickup(item.id)}
            disabled={actionLoading === item.id + '_pickup'}
          >
            {actionLoading === item.id + '_pickup' ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.pickupBtnText}>✓ Récupéré chez le marchand</Text>
            )}
          </TouchableOpacity>
        )}

        {isActive && (
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={() => handleComplete(item.id)}
            disabled={actionLoading === item.id + '_complete'}
          >
            {actionLoading === item.id + '_complete' ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.completeBtnText}>🎉 Marquer comme livré</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const ridesLeft = subscription?.ridesLeft;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard Livreur</Text>
        <View style={{ width: 32 }} />
      </View>

      <PassAlertBanner
        hasActivePass={passStatus?.hasActivePass ?? true}
        daysLeft={passStatus?.daysLeft ?? 99}
      />
      <View style={styles.onlineCard}>
        <View>
          <Text style={styles.onlineLabel}>{isOnline ? '🟢 En ligne' : '🔴 Hors ligne'}</Text>
          <Text style={styles.onlineSub}>
            {isOnline ? 'Vous recevez des commandes' : 'Activez pour recevoir des livraisons'}
          </Text>
        </View>
        <Switch
          value={isOnline}
          onValueChange={handleToggleOnline}
          trackColor={{ false: COLORS.border, true: COLORS.green }}
          thumbColor="#FFF"
        />
      </View>

      <View style={styles.passCard}>
        <Text style={styles.passLabel}>Pass livraisons</Text>
        {ridesLeft != null ? (
          <Text style={styles.passValue}>
            <Text style={styles.passNumber}>{ridesLeft}</Text> livraison(s) restante(s)
          </Text>
        ) : (
          <Text style={styles.passValue}>Pass illimité actif</Text>
        )}
        {ridesLeft === 0 && (
          <TouchableOpacity
            style={styles.buyPassBtn}
            onPress={() => navigation.navigate('PassScreen')}
          >
            <Text style={styles.buyPassBtnText}>Recharger le pass</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Gains */}
      <View style={styles.earningsRow}>
        <View style={styles.earningCard}>
          <Text style={styles.earningValue}>{earnings.today.toFixed(1)}</Text>
          <Text style={styles.earningLabel}>TND aujourd'hui</Text>
        </View>
        <View style={styles.earningCard}>
          <Text style={styles.earningValue}>{earnings.week.toFixed(1)}</Text>
          <Text style={styles.earningLabel}>TND cette semaine</Text>
        </View>
        <View style={styles.earningCard}>
          <Text style={[styles.earningValue, { color: COLORS.green }]}>{earnings.deliveries}</Text>
          <Text style={styles.earningLabel}>Livraisons</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mes assignations</Text>
        <Text style={styles.sectionCount}>{livreurAssignments.length}</Text>
      </View>

      <FlatList
        data={livreurAssignments}
        keyExtractor={(item) => item.id}
        renderItem={renderAssignment}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.green} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isOnline ? 'Aucune assignation pour le moment.' : 'Passez en ligne pour recevoir des commandes.'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backArrow: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.green, fontSize: 20, fontWeight: '600' },
  onlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  onlineLabel: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  onlineSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  passCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passLabel: { color: COLORS.textMuted, fontSize: 12, textTransform: 'uppercase', marginBottom: 4 },
  passValue: { color: COLORS.text, fontSize: 15 },
  passNumber: { color: COLORS.green, fontSize: 22, fontWeight: '700' },
  buyPassBtn: {
    marginTop: 10,
    backgroundColor: COLORS.green,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buyPassBtnText: { color: '#FFF', fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '600', flex: 1 },
  sectionCount: {
    color: COLORS.green,
    fontWeight: '700',
    backgroundColor: '#0D2A1A',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    fontSize: 13,
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  earningsRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 12, gap: 10 },
  earningCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center' },
  earningValue: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  earningLabel: { color: COLORS.textMuted, fontSize: 10, marginTop: 2, textAlign: 'center' },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderCardActive: { borderColor: COLORS.green },
  orderHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  merchantName: { color: COLORS.text, fontSize: 16, fontWeight: '600', flex: 1 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  addressSection: { marginBottom: 12 },
  addressRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  addressIcon: { fontSize: 16, marginRight: 8 },
  addressText: { color: COLORS.textMuted, fontSize: 13, flex: 1 },
  addressDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 4, marginLeft: 24 },
  orderMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  orderItems: { color: COLORS.textMuted, fontSize: 13 },
  orderTotal: { color: COLORS.green, fontSize: 15, fontWeight: '600' },
  pickupBtn: {
    backgroundColor: COLORS.warning,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  pickupBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  completeBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  completeBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  emptyText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 40, fontSize: 14 },
});
