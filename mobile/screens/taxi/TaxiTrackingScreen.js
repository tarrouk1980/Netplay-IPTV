import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  Animated, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useTaxiStore from '../../store/taxiStore';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const STEPS = [
  { key: 'SEARCHING', label: 'Recherche chauffeur', icon: '🔍' },
  { key: 'ACCEPTED', label: 'Chauffeur en route', icon: '🚕' },
  { key: 'ARRIVED', label: 'Chauffeur arrivé', icon: '📍' },
  { key: 'IN_PROGRESS', label: 'Course en cours', icon: '🛣️' },
  { key: 'COMPLETED', label: 'Course terminée', icon: '✅' },
];

function StepBar({ currentStatus }) {
  const idx = STEPS.findIndex(s => s.key === currentStatus);
  const active = idx === -1 ? 0 : idx;
  return (
    <View style={styles.stepBar}>
      {STEPS.slice(0, 4).map((s, i) => (
        <React.Fragment key={s.key}>
          <View style={styles.stepItem}>
            <View style={[styles.stepDot, i <= active && styles.stepDotActive]}>
              <Text style={{ fontSize: 12 }}>{i <= active ? s.icon : '·'}</Text>
            </View>
            <Text style={[styles.stepLabel, i <= active && styles.stepLabelActive]} numberOfLines={2}>
              {s.label}
            </Text>
          </View>
          {i < 3 && <View style={[styles.stepLine, i < active && styles.stepLineActive]} />}
        </React.Fragment>
      ))}
    </View>
  );
}

export default function TaxiTrackingScreen({ navigation, route }) {
  const { orderId } = route?.params || {};
  const { currentOrder, fetchOrder, cancelOrder, confirmArrival } = useTaxiStore();
  const [order, setOrder] = useState(currentOrder);
  const [eta, setEta] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const pulse = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start(() => pulse());
  }, [pulseAnim]);

  useEffect(() => { pulse(); }, [pulse]);

  useEffect(() => {
    if (!orderId && !currentOrder?.id) return;
    const id = orderId || currentOrder?.id;
    const interval = setInterval(async () => {
      try {
        const updated = await fetchOrder(id);
        setOrder(updated);
        if (updated?.eta) setEta(updated.eta);
        if (updated?.status === 'COMPLETED') {
          clearInterval(interval);
          navigation.replace('TaxiRating', { orderId: id });
        }
      } catch {}
    }, 8000);
    fetchOrder(id).then(o => { setOrder(o); if (o?.eta) setEta(o.eta); }).catch(() => {});
    return () => clearInterval(interval);
  }, [orderId, currentOrder?.id]);

  const handleCancel = () => {
    Alert.alert('Annuler la course ?', 'Des frais peuvent s\'appliquer.', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Annuler', style: 'destructive', onPress: async () => {
          try {
            await cancelOrder(order?.id || orderId, 'Annulé par le client');
            navigation.replace('Home');
          } catch { Alert.alert('Erreur', "Impossible d'annuler."); }
        },
      },
    ]);
  };

  const handleCall = () => {
    const phone = order?.driver?.phone;
    if (phone) Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  const handleConfirmArrival = async () => {
    try {
      await confirmArrival(order?.id || orderId);
    } catch { Alert.alert('Erreur', 'Impossible de confirmer.'); }
  };

  const status = order?.status || 'SEARCHING';
  const driver = order?.driver;
  const isSearching = status === 'SEARCHING' || status === 'PENDING';
  const canCancel = ['SEARCHING', 'PENDING', 'ACCEPTED'].includes(status);
  const canConfirm = status === 'IN_PROGRESS';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suivi de course</Text>
        <View style={{ width: 40 }} />
      </View>

      <StepBar currentStatus={status} />

      {/* Map placeholder */}
      <View style={styles.mapPlaceholder}>
        <Animated.Text style={[styles.mapEmoji, { transform: [{ scale: pulseAnim }] }]}>
          {isSearching ? '🔍' : '🚕'}
        </Animated.Text>
        <Text style={styles.mapLabel}>
          {isSearching ? 'Recherche du chauffeur le plus proche...' : 'Chauffeur en route vers vous'}
        </Text>
        {eta && <Text style={styles.etaText}>Arrivée estimée : {eta} min</Text>}
      </View>

      {/* Driver card */}
      {driver && !isSearching && (
        <View style={styles.driverCard}>
          <View style={styles.driverAvatar}>
            <Text style={{ fontSize: 24 }}>👤</Text>
          </View>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{driver.name || 'Chauffeur'}</Text>
            <View style={styles.driverMeta}>
              <Text style={styles.driverRating}>★ {driver.rating || '4.8'}</Text>
              <Text style={styles.driverCar}>{driver.car || 'Véhicule'}</Text>
              {driver.plate && <Text style={styles.driverPlate}>{driver.plate}</Text>}
            </View>
          </View>
          <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
            <Text style={{ fontSize: 20 }}>📞</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Route info */}
      {order && (
        <View style={styles.routeCard}>
          <View style={styles.routeRow}>
            <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
            <Text style={styles.routeText} numberOfLines={1}>
              {order.originAddress || 'Départ'}
            </Text>
          </View>
          {order.destinationAddress && (
            <>
              <View style={styles.routeLine} />
              <View style={styles.routeRow}>
                <View style={[styles.dot, { backgroundColor: COLORS.accent }]} />
                <Text style={styles.routeText} numberOfLines={1}>{order.destinationAddress}</Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {canCancel && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>✕ Annuler</Text>
          </TouchableOpacity>
        )}
        {canConfirm && (
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmArrival}>
            <Text style={styles.confirmBtnText}>✓ Confirmer l'arrivée</Text>
          </TouchableOpacity>
        )}
      </View>
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
  stepBar: {
    flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16,
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  stepItem: { alignItems: 'center', width: 60 },
  stepDot: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  stepDotActive: { backgroundColor: COLORS.accent + '30', borderColor: COLORS.accent },
  stepLabel: { color: COLORS.muted, fontSize: 9, textAlign: 'center', marginTop: 4, lineHeight: 12 },
  stepLabelActive: { color: COLORS.accent },
  stepLine: { flex: 1, height: 1, backgroundColor: COLORS.border, marginTop: 16 },
  stepLineActive: { backgroundColor: COLORS.accent },
  mapPlaceholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0D0D18',
  },
  mapEmoji: { fontSize: 64, marginBottom: 16 },
  mapLabel: { color: COLORS.muted, fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
  etaText: { color: COLORS.accent, fontSize: 16, fontWeight: '700', marginTop: 10 },
  driverCard: {
    flexDirection: 'row', alignItems: 'center', margin: 16,
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, gap: 12,
  },
  driverAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.accent + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  driverInfo: { flex: 1 },
  driverName: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  driverMeta: { flexDirection: 'row', gap: 8, marginTop: 3 },
  driverRating: { color: COLORS.accent, fontSize: 12 },
  driverCar: { color: COLORS.muted, fontSize: 12 },
  driverPlate: {
    color: COLORS.text, fontSize: 11, fontWeight: '700',
    backgroundColor: COLORS.bg, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1,
  },
  callBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.green + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  routeCard: {
    marginHorizontal: 16, marginBottom: 16, backgroundColor: COLORS.surface,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  routeLine: { width: 1, height: 12, backgroundColor: COLORS.border, marginLeft: 3.5, marginVertical: 3 },
  routeText: { flex: 1, color: COLORS.text, fontSize: 13 },
  actions: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  cancelBtn: {
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.red,
    paddingVertical: 12, alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.red, fontSize: 14, fontWeight: '700' },
  confirmBtn: {
    borderRadius: 12, backgroundColor: COLORS.green,
    paddingVertical: 14, alignItems: 'center',
  },
  confirmBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
