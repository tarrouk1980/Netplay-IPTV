import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const STEPS = [
  { key: 'SEARCHING', icon: '🔍', label: 'Recherche d\'un chauffeur' },
  { key: 'ACCEPTED', icon: '✅', label: 'Chauffeur trouvé' },
  { key: 'ARRIVING', icon: '🚕', label: 'En route vers vous' },
  { key: 'PICKED_UP', icon: '🚗', label: 'En course' },
  { key: 'COMPLETED', icon: '🎉', label: 'Arrivé à destination' },
];

const MOCK = {
  orderId: 'TAXI-4821',
  status: 'ARRIVING',
  driver: { name: 'Mohamed Ali', rating: 4.8, trips: 312, vehicle: 'VW Golf Grise', plate: '123 TN 4567', phone: '+216 22 111 222' },
  eta: '4 min',
  from: 'Lac 1, Tunis',
  to: 'Berges du Lac 2',
  fare: { estimated: 8.500, currency: 'TND' },
};

export default function TaxiTrackingScreen2({ navigation, route }) {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(() => {
    api.get('/api/taxi/orders/' + (orderId || 'TAXI-4821'))
      .then(r => setOrder(r.data || MOCK))
      .catch(() => setOrder(MOCK))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (order?.status === 'COMPLETED') {
      const timer = setTimeout(() => {
        navigation.replace('TaxiRating', { orderId: order.orderId, driverName: order.driver?.name });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [order?.status]);

  const cancel = () => {
    Alert.alert('Annuler la course ?', 'Des frais peuvent s\'appliquer si le chauffeur est déjà en route.', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui, annuler', style: 'destructive', onPress: async () => {
          setCancelling(true);
          try {
            await api.post('/api/taxi/orders/' + order.orderId + '/cancel');
            navigation.goBack();
          } catch {
            Alert.alert('Erreur', 'Impossible d\'annuler pour l\'instant.');
          } finally { setCancelling(false); }
        }
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  const o = order || MOCK;
  const currentStepIdx = STEPS.findIndex(s => s.key === o.status);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚕 Votre course</Text>
        <Text style={styles.orderId}>#{o.orderId}</Text>
      </View>

      <View style={styles.mapPlaceholder}>
        <Text style={{ fontSize: 52 }}>🗺️</Text>
        <Text style={styles.mapEta}>
          {o.status === 'SEARCHING' ? 'Recherche en cours...' : `⏱ ${o.eta || '—'} min`}
        </Text>
        <Text style={styles.mapSub}>
          {o.status === 'ARRIVING' ? 'Votre chauffeur arrive' :
           o.status === 'PICKED_UP' ? 'En route vers destination' : ''}
        </Text>
      </View>

      <View style={styles.stepsRow}>
        {STEPS.map((step, i) => {
          const done = i <= currentStepIdx;
          return (
            <View key={step.key} style={styles.stepItem}>
              <View style={[styles.stepCircle, done && styles.stepCircleDone]}>
                <Text style={styles.stepIcon}>{done ? step.icon : '○'}</Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={[styles.stepConnector, i < currentStepIdx && styles.stepConnectorDone]} />
              )}
            </View>
          );
        })}
      </View>
      <Text style={styles.currentStepLabel}>
        {STEPS[currentStepIdx]?.label || ''}
      </Text>

      {o.driver && o.status !== 'SEARCHING' && (
        <View style={styles.driverCard}>
          <View style={styles.driverLeft}>
            <View style={styles.driverAvatar}>
              <Text style={{ fontSize: 28 }}>👤</Text>
            </View>
            <View>
              <Text style={styles.driverName}>{o.driver.name}</Text>
              <Text style={styles.driverRating}>★ {o.driver.rating} · {o.driver.trips} courses</Text>
              <Text style={styles.driverVehicle}>{o.driver.vehicle} · {o.driver.plate}</Text>
            </View>
          </View>
          <View style={styles.driverActions}>
            <TouchableOpacity style={styles.callBtn}>
              <Text style={{ fontSize: 20 }}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chatBtn}>
              <Text style={{ fontSize: 20 }}>💬</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.routeCard}>
        <View style={styles.routeRow}>
          <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
          <Text style={styles.routeText} numberOfLines={1}>{o.from}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <View style={[styles.dot, { backgroundColor: COLORS.accent }]} />
          <Text style={styles.routeText} numberOfLines={1}>{o.to}</Text>
        </View>
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Tarif estimé</Text>
          <Text style={styles.fareValue}>{o.fare.estimated.toFixed(3)} TND</Text>
        </View>
      </View>

      {['SEARCHING', 'ACCEPTED', 'ARRIVING'].includes(o.status) && (
        <TouchableOpacity
          style={[styles.cancelBtn, cancelling && { opacity: 0.5 }]}
          onPress={cancel}
          disabled={cancelling}
        >
          <Text style={styles.cancelBtnText}>{cancelling ? 'Annulation...' : '✗ Annuler la course'}</Text>
        </TouchableOpacity>
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
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  orderId: { color: COLORS.muted, fontSize: 13 },
  mapPlaceholder: {
    height: 180, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  mapEta: { color: COLORS.accent, fontSize: 20, fontWeight: '800', marginTop: 8 },
  mapSub: { color: COLORS.muted, fontSize: 13, marginTop: 4 },
  stepsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  stepItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.surface,
    borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  stepCircleDone: { borderColor: COLORS.green, backgroundColor: COLORS.green + '20' },
  stepIcon: { fontSize: 14 },
  stepConnector: { flex: 1, height: 2, backgroundColor: COLORS.border },
  stepConnectorDone: { backgroundColor: COLORS.green },
  currentStepLabel: { color: COLORS.text, fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  driverCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: 16, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  driverLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  driverAvatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.accent + '40',
  },
  driverName: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  driverRating: { color: COLORS.accent, fontSize: 12, marginBottom: 2 },
  driverVehicle: { color: COLORS.muted, fontSize: 11 },
  driverActions: { flexDirection: 'row', gap: 8 },
  callBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.green + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  chatBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.blue + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  routeCard: {
    marginHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  routeLine: { width: 2, height: 14, backgroundColor: COLORS.border, marginLeft: 4, marginVertical: 3 },
  routeText: { flex: 1, color: COLORS.text, fontSize: 13 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  fareLabel: { color: COLORS.muted, fontSize: 13 },
  fareValue: { color: COLORS.accent, fontSize: 15, fontWeight: '800' },
  cancelBtn: {
    marginHorizontal: 16, backgroundColor: COLORS.red + '15', borderRadius: 14,
    paddingVertical: 13, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.red + '40',
  },
  cancelBtnText: { color: COLORS.red, fontSize: 14, fontWeight: '700' },
});
