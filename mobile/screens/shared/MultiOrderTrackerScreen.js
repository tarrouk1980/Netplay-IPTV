import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', danger: '#E74C3C',
  blue: '#1565C0', purple: '#7B1FA2',
};

const SERVICE_ICON = { TAXI: '🚕', SOS: '🛻', DELIVERY: '🛵', GROCERY: '🛒' };
const SERVICE_COLOR = { TAXI: COLORS.accent, SOS: COLORS.danger, DELIVERY: COLORS.green, GROCERY: COLORS.blue };

const STATUS_STEPS = {
  TAXI: [
    { key: 'PENDING', label: 'Recherche chauffeur', icon: '🔍' },
    { key: 'ACCEPTED', label: 'Chauffeur en route', icon: '🚕' },
    { key: 'ARRIVED', label: 'Chauffeur arrivé', icon: '📍' },
    { key: 'IN_PROGRESS', label: 'En course', icon: '🏃' },
    { key: 'COMPLETED', label: 'Arrivé à destination', icon: '✅' },
  ],
  SOS: [
    { key: 'PENDING', label: 'Recherche dépanneur', icon: '🔍' },
    { key: 'ACCEPTED', label: 'Dépanneur en route', icon: '🛻' },
    { key: 'ARRIVED', label: 'Dépanneur sur place', icon: '📍' },
    { key: 'IN_PROGRESS', label: 'Intervention', icon: '🔧' },
    { key: 'COMPLETED', label: 'Intervention terminée', icon: '✅' },
  ],
  DELIVERY: [
    { key: 'PENDING', label: 'Commande reçue', icon: '📋' },
    { key: 'ACCEPTED', label: 'Préparation en cours', icon: '👨‍🍳' },
    { key: 'PREPARING', label: 'Prête pour livraison', icon: '📦' },
    { key: 'PICKED_UP', label: 'Livreur en route', icon: '🛵' },
    { key: 'COMPLETED', label: 'Livraison effectuée', icon: '✅' },
  ],
  GROCERY: [
    { key: 'PENDING', label: 'Commande envoyée', icon: '📋' },
    { key: 'ACCEPTED', label: 'Achat en cours', icon: '🛒' },
    { key: 'IN_PROGRESS', label: 'Livraison en cours', icon: '🛵' },
    { key: 'COMPLETED', label: 'Livraison effectuée', icon: '✅' },
  ],
};

const MOCK_ORDERS = [
  {
    id: 'ord_taxi_1', type: 'TAXI', status: 'IN_PROGRESS',
    provider: { name: 'Mohamed B.', phone: '+216 55 123 456', vehicle: 'Volkswagen Polo · 180TU2024' },
    pickupAddress: 'Av. Habib Bourguiba, Tunis', destAddress: 'La Marsa Plage',
    eta: 8, fare: 18.5, createdAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'ord_delivery_1', type: 'DELIVERY', status: 'ACCEPTED',
    provider: { name: 'Slim M.', phone: '+216 52 987 654' },
    pickupAddress: 'Pizza Hut La Marsa', destAddress: 'Rue des Jasmins, La Marsa',
    eta: 25, fare: 32, createdAt: new Date(Date.now() - 600000).toISOString(),
  },
];

function PulsingDot({ color }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.4, duration: 700, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
      <Animated.View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, transform: [{ scale }] }} />
    </View>
  );
}

function StatusStepper({ serviceType, currentStatus }) {
  const steps = STATUS_STEPS[serviceType] || STATUS_STEPS.TAXI;
  const curIdx = steps.findIndex(s => s.key === currentStatus);
  const activeIdx = curIdx === -1 ? 0 : curIdx;

  return (
    <View style={styles.stepper}>
      {steps.map((step, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        const color = done || active ? SERVICE_COLOR[serviceType] || COLORS.accent : COLORS.border;
        return (
          <View key={step.key} style={styles.stepRow}>
            <View style={styles.stepLeft}>
              <View style={[styles.stepCircle, { borderColor: color, backgroundColor: done ? color : 'transparent' }]}>
                {active ? (
                  <PulsingDot color={color} />
                ) : (
                  <Text style={[styles.stepIcon, { opacity: done ? 1 : 0.3 }]}>{done ? '✓' : step.icon}</Text>
                )}
              </View>
              {i < steps.length - 1 && (
                <View style={[styles.stepLine, { backgroundColor: done ? color : COLORS.border }]} />
              )}
            </View>
            <Text style={[styles.stepLabel, active && { color: color, fontWeight: '700' }, done && { color: COLORS.muted }]}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function OrderCard({ order, onViewMap, onCancel }) {
  const color = SERVICE_COLOR[order.type] || COLORS.accent;
  const elapsed = Math.round((Date.now() - new Date(order.createdAt)) / 60000);

  return (
    <View style={[styles.orderCard, { borderTopColor: color }]}>
      {/* Header */}
      <View style={styles.orderHeader}>
        <View style={styles.orderTypeRow}>
          <Text style={styles.orderIcon}>{SERVICE_ICON[order.type] || '📦'}</Text>
          <Text style={[styles.orderType, { color }]}>{order.type}</Text>
          <View style={[styles.liveBadge, { backgroundColor: color + '22', borderColor: color }]}>
            <PulsingDot color={color} />
            <Text style={[styles.liveText, { color }]}>EN DIRECT</Text>
          </View>
        </View>
        <Text style={styles.orderElapsed}>{elapsed} min</Text>
      </View>

      {/* ETA */}
      {order.eta != null && (
        <View style={[styles.etaBanner, { backgroundColor: color + '15' }]}>
          <Text style={[styles.etaText, { color }]}>
            ⏱️ Temps estimé: <Text style={{ fontWeight: '800' }}>{order.eta} min</Text>
          </Text>
        </View>
      )}

      {/* Stepper */}
      <StatusStepper serviceType={order.type} currentStatus={order.status} />

      {/* Route */}
      <View style={styles.routeBox}>
        <View style={styles.routeRow}>
          <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
          <Text style={styles.routeText} numberOfLines={1}>{order.pickupAddress}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <View style={[styles.dot, { backgroundColor: COLORS.danger }]} />
          <Text style={styles.routeText} numberOfLines={1}>{order.destAddress}</Text>
        </View>
      </View>

      {/* Provider */}
      {order.provider && (
        <View style={styles.providerRow}>
          <View style={styles.providerAvatar}>
            <Text style={[styles.providerAvatarText, { color }]}>
              {(order.provider.name || '?')[0].toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.providerName}>{order.provider.name}</Text>
            {order.provider.vehicle && <Text style={styles.providerVehicle}>{order.provider.vehicle}</Text>}
          </View>
          <TouchableOpacity style={[styles.callBtn, { borderColor: color }]}>
            <Text style={[styles.callBtnText, { color }]}>📞 Appeler</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionBtn, { borderColor: color }]} onPress={() => onViewMap(order)}>
          <Text style={[styles.actionBtnText, { color }]}>🗺️ Suivre sur carte</Text>
        </TouchableOpacity>
        {['PENDING', 'ACCEPTED'].includes(order.status) && (
          <TouchableOpacity style={[styles.actionBtn, { borderColor: COLORS.danger }]} onPress={() => onCancel(order)}>
            <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>✕ Annuler</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Fare */}
      <View style={styles.fareRow}>
        <Text style={styles.fareLabel}>Montant estimé</Text>
        <Text style={[styles.fareValue, { color }]}>{order.fare} TND</Text>
      </View>
    </View>
  );
}

export default function MultiOrderTrackerScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/orders/active');
      setOrders(res.data?.orders?.length ? res.data.orders : MOCK_ORDERS);
    } catch {
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, 8000);
    return () => clearInterval(intervalRef.current);
  }, [load]);

  const handleViewMap = (order) => {
    navigation.navigate('LiveOrderMap', {
      orderId: order.id,
      serviceType: order.type,
      destinationLat: order.destLat,
      destinationLng: order.destLng,
      destinationAddress: order.destAddress,
    });
  };

  const handleCancel = (order) => {
    navigation.navigate('OrderCancel', { orderId: order.id, serviceType: order.type });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}><ActivityIndicator color={COLORS.accent} size="large" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          📡 Commandes en cours
          {orders.length > 0 && <Text style={styles.badge}> {orders.length}</Text>}
        </Text>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>

      {orders.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>📡</Text>
          <Text style={styles.emptyTitle}>Aucune commande active</Text>
          <Text style={styles.emptyText}>Vos commandes en cours apparaîtront ici automatiquement.</Text>
          <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.homeBtnText}>Commander maintenant</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, padding: 12 }}>
          <Text style={styles.sectionLabel}>Actualisation auto toutes les 8 secondes</Text>
          {orders.map(o => (
            <OrderCard
              key={o.id}
              order={o}
              onViewMap={handleViewMap}
              onCancel={handleCancel}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, alignItems: 'center' },
  backText: { color: COLORS.white, fontSize: 28 },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  badge: { color: COLORS.accent, fontSize: 17 },
  refreshBtn: { width: 36, alignItems: 'center' },
  refreshText: { color: COLORS.accent, fontSize: 24, fontWeight: '700' },
  sectionLabel: { color: COLORS.muted, fontSize: 11, textAlign: 'center', marginBottom: 12 },
  orderCard: {
    backgroundColor: COLORS.surface, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, borderTopWidth: 4, marginBottom: 12,
  },
  orderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  orderTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderIcon: { fontSize: 22 },
  orderType: { fontSize: 14, fontWeight: '800' },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1,
  },
  liveText: { fontSize: 10, fontWeight: '800' },
  orderElapsed: { color: COLORS.muted, fontSize: 12 },
  etaBanner: { borderRadius: 10, padding: 10, marginBottom: 12, alignItems: 'center' },
  etaText: { fontSize: 14 },
  stepper: { marginVertical: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0 },
  stepLeft: { alignItems: 'center', width: 28 },
  stepCircle: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  stepIcon: { fontSize: 11 },
  stepLine: { width: 2, height: 22, marginVertical: 2 },
  stepLabel: { color: COLORS.muted, fontSize: 13, marginLeft: 10, paddingTop: 2, flex: 1, lineHeight: 24 },
  routeBox: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 12, padding: 12,
    marginVertical: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  routeLine: { width: 1, height: 16, backgroundColor: COLORS.border, marginLeft: 3, marginVertical: 3 },
  routeText: { color: COLORS.white, fontSize: 12, flex: 1 },
  providerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  providerAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  providerAvatarText: { fontSize: 18, fontWeight: '700' },
  providerName: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  providerVehicle: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  callBtn: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
  callBtnText: { fontSize: 12, fontWeight: '700' },
  cardActions: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  actionBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, backgroundColor: COLORS.surfaceAlt },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  fareLabel: { color: COLORS.muted, fontSize: 13 },
  fareValue: { fontSize: 16, fontWeight: '800' },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: COLORS.muted, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  homeBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 },
  homeBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
