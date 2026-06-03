import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Animated, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const STEPS = [
  { id: 'pickup', label: 'Récupérer le colis', icon: '🏪', sub: 'Au point de collecte marchand' },
  { id: 'en_route', label: 'En route vers le client', icon: '🛵', sub: 'Direction la destination' },
  { id: 'nearby', label: 'À proximité', icon: '📍', sub: 'Moins de 500m' },
  { id: 'delivered', label: 'Livraison effectuée', icon: '✅', sub: 'Confirmer avec le client' },
];

const MOCK = {
  orderId: 'DEL-20240603-4421',
  clientName: 'Sana Meddeb',
  clientPhone: '+216 22 333 444',
  pickupName: 'Carrefour Market',
  pickupAddress: 'Av. Mohamed V, Tunis',
  deliveryAddress: 'Rue de Palestine, App 12, El Menzah 6',
  items: 3,
  weight: '2.4 kg',
  distance: '4.8 km',
  eta: 14,
  fee: 8.50,
  hasFragile: true,
  requiresSignature: false,
};

export default function LivreurNavigationScreen({ navigation, route }) {
  const order = route.params?.order || MOCK;
  const [stepIdx, setStepIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [eta, setEta] = useState(order.eta);
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, { toValue: -8, duration: 600, useNativeDriver: true }),
        Animated.timing(arrowAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    const t = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmtTime = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const nextStep = () => {
    if (stepIdx < STEPS.length - 1) setStepIdx(p => p + 1);
    else navigation.navigate('LivreurRating', { orderId: order.orderId });
  };

  const currentStep = STEPS[stepIdx];
  const isPickup = stepIdx === 0;
  const targetAddress = isPickup ? order.pickupAddress : order.deliveryAddress;
  const targetName = isPickup ? order.pickupName : order.clientName;

  const nextLabel = () => {
    if (stepIdx === 0) return '✅ Colis récupéré';
    if (stepIdx === 1) return '📍 Je suis proche';
    if (stepIdx === 2) return '🤝 Remettre le colis';
    return '✓ Livraison confirmée';
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.orderId}>#{order.orderId?.slice(-6)}</Text>
          <Text style={styles.itemsInfo}>{order.items} articles · {order.weight}</Text>
        </View>
        <View style={styles.timerBlock}>
          <Text style={styles.timerVal}>{fmtTime(elapsed)}</Text>
          <Text style={styles.timerLbl}>Durée</Text>
        </View>
        <View style={styles.etaBlock}>
          <Text style={styles.etaVal}>{eta}'</Text>
          <Text style={styles.etaLbl}>ETA</Text>
        </View>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapBox}>
        <Animated.Text style={[styles.mapMoto, { transform: [{ translateY: arrowAnim }] }]}>
          🛵
        </Animated.Text>
        <View style={styles.routeLine}>
          <View style={[styles.routeDot, { backgroundColor: COLORS.green }]} />
          <View style={styles.routeTrack} />
          <View style={[styles.routeDot, { backgroundColor: COLORS.red }]} />
        </View>
        <Text style={styles.mapAddr} numberOfLines={1}>{targetAddress}</Text>
        <TouchableOpacity
          style={styles.mapsBtn}
          onPress={() => Linking.openURL(`https://maps.google.com/?q=${targetAddress}`)}
        >
          <Text style={styles.mapsBtnText}>🗺 Ouvrir la navigation</Text>
        </TouchableOpacity>
      </View>

      {/* Steps Progress */}
      <View style={styles.stepsBar}>
        {STEPS.map((s, i) => (
          <View key={s.id} style={styles.stepUnit}>
            <Animated.View style={[
              styles.stepBubble,
              i < stepIdx && styles.stepBubbleDone,
              i === stepIdx && { borderColor: COLORS.accent, transform: [{ scale: pulseAnim }] },
            ]}>
              <Text style={{ fontSize: 14 }}>{i < stepIdx ? '✓' : s.icon}</Text>
            </Animated.View>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepConnector, i < stepIdx && { backgroundColor: COLORS.green }]} />
            )}
          </View>
        ))}
      </View>

      {/* Current step card */}
      <View style={styles.stepCard}>
        <Text style={styles.stepCardIcon}>{currentStep.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.stepCardLabel}>{currentStep.label}</Text>
          <Text style={styles.stepCardSub}>{currentStep.sub}</Text>
        </View>
        <View style={[styles.stepNumBadge]}>
          <Text style={styles.stepNumText}>{stepIdx + 1}/{STEPS.length}</Text>
        </View>
      </View>

      {/* Target card */}
      <View style={styles.targetCard}>
        <View style={styles.targetAvatar}>
          <Text style={{ fontSize: 24 }}>{isPickup ? '🏪' : '👤'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.targetName}>{targetName}</Text>
          <Text style={styles.targetAddr} numberOfLines={1}>{targetAddress}</Text>
        </View>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => Linking.openURL(`tel:${isPickup ? '' : order.clientPhone}`)}
        >
          <Text style={{ fontSize: 20 }}>📞</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatBtn}>
          <Text style={{ fontSize: 20 }}>💬</Text>
        </TouchableOpacity>
      </View>

      {/* Alerts */}
      <View style={styles.alertsRow}>
        {order.hasFragile && (
          <View style={styles.alertChip}>
            <Text style={styles.alertText}>⚠️ Fragile</Text>
          </View>
        )}
        {order.requiresSignature && (
          <View style={[styles.alertChip, { borderColor: COLORS.blue }]}>
            <Text style={[styles.alertText, { color: COLORS.blue }]}>✍️ Signature requise</Text>
          </View>
        )}
        <View style={[styles.alertChip, { borderColor: COLORS.green }]}>
          <Text style={[styles.alertText, { color: COLORS.green }]}>💰 {order.fee.toFixed(2)} TND</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.navigate('OrderCancel', { orderId: order.orderId })}
        >
          <Text style={styles.cancelText}>Problème</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
          <Text style={styles.nextBtnText}>{nextLabel()}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  orderId: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  itemsInfo: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginTop: 2 },
  timerBlock: { alignItems: 'center' },
  timerVal: { color: COLORS.white, fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'] },
  timerLbl: { color: COLORS.muted, fontSize: 9 },
  etaBlock: { alignItems: 'center' },
  etaVal: { color: COLORS.accent, fontSize: 18, fontWeight: '900' },
  etaLbl: { color: COLORS.muted, fontSize: 9 },
  mapBox: {
    flex: 1, margin: 12, borderRadius: 16,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  mapMoto: { fontSize: 44, marginBottom: 12 },
  routeLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  routeDot: { width: 12, height: 12, borderRadius: 6 },
  routeTrack: { width: 80, height: 3, backgroundColor: COLORS.accent, borderRadius: 2 },
  mapAddr: { color: COLORS.white, fontSize: 12, fontWeight: '600', paddingHorizontal: 16, textAlign: 'center', marginBottom: 10 },
  mapsBtn: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: COLORS.blue,
  },
  mapsBtnText: { color: COLORS.blue, fontSize: 12, fontWeight: '600' },
  stepsBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  stepUnit: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  stepBubble: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  stepBubbleDone: { backgroundColor: '#0D2E0D', borderColor: COLORS.green },
  stepConnector: { flex: 1, height: 2, backgroundColor: COLORS.border },
  stepCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 12, marginBottom: 6,
    backgroundColor: '#1A1408', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: COLORS.accent,
  },
  stepCardIcon: { fontSize: 24 },
  stepCardLabel: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  stepCardSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  stepNumBadge: {
    backgroundColor: COLORS.surface, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  stepNumText: { color: COLORS.muted, fontSize: 11, fontWeight: '700' },
  targetCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 12, marginBottom: 8,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  targetAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.accent,
  },
  targetName: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  targetAddr: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  callBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#0D2E0D', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.green,
  },
  chatBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#08141A', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.blue,
  },
  alertsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, marginBottom: 6 },
  alertChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#1A1408', borderWidth: 1, borderColor: COLORS.orange,
  },
  alertText: { color: COLORS.orange, fontSize: 12, fontWeight: '700' },
  footer: {
    flexDirection: 'row', gap: 10, padding: 12,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  cancelBtn: {
    paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  cancelText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  nextBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: COLORS.accent, alignItems: 'center',
  },
  nextBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
});
