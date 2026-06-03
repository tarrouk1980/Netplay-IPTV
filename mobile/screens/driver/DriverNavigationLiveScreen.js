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

const MOCK_RIDE = {
  rideId: 'TXI-20240603-7741',
  clientName: 'Tarek T.',
  clientPhone: '+216 20 000 000',
  pickupAddress: 'Av. Habib Bourguiba, Tunis Centre',
  dropAddress: 'Aéroport Tunis-Carthage, Terminal 1',
  distance: '12.4 km',
  duration: '18 min',
  fare: 16.50,
  taxiType: 'STANDARD',
  status: 'picking_up',
};

const STEPS_PICKUP = [
  { id: 'en_route', label: 'En route vers le client', icon: '🚕' },
  { id: 'arrived', label: 'Arrivé au point de prise en charge', icon: '📍' },
  { id: 'onboard', label: 'Client à bord', icon: '👤' },
  { id: 'drop', label: 'En route vers la destination', icon: '🛣️' },
  { id: 'done', label: 'Course terminée', icon: '🏁' },
];

export default function DriverNavigationLiveScreen({ navigation, route }) {
  const ride = route.params?.ride || MOCK_RIDE;
  const [stepIdx, setStepIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, { toValue: 6, duration: 700, useNativeDriver: true }),
        Animated.timing(arrowAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    ).start();
    const t = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmtElapsed = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const nextStep = () => {
    if (stepIdx < STEPS_PICKUP.length - 1) {
      setStepIdx(p => p + 1);
    } else {
      navigation.navigate('TaxiRating', { rideId: ride.rideId });
    }
  };

  const currentStep = STEPS_PICKUP[stepIdx];
  const isPickup = stepIdx < 3;
  const isLastStep = stepIdx === STEPS_PICKUP.length - 1;

  const nextBtnLabel = () => {
    if (stepIdx === 0) return '📍 Je suis arrivé';
    if (stepIdx === 1) return '👤 Client à bord';
    if (stepIdx === 2) return '🛣️ Démarrer le trajet';
    if (stepIdx === 3) return '🏁 Terminer la course';
    return '⭐ Évaluer le client';
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header strip */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.rideId}>#{ride.rideId?.slice(-6)}</Text>
          <View style={[styles.typeBadge, { backgroundColor: ride.taxiType === 'EASYLADY' ? '#1A0A12' : '#1A1408' }]}>
            <Text style={[styles.typeText, { color: ride.taxiType === 'EASYLADY' ? '#E91E8C' : COLORS.accent }]}>
              {ride.taxiType}
            </Text>
          </View>
        </View>
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>⏱ {fmtElapsed(elapsed)}</Text>
        </View>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <Animated.Text style={[styles.mapArrow, { transform: [{ translateY: arrowAnim }] }]}>
          ↑
        </Animated.Text>
        <Animated.Text style={[styles.mapCar, { transform: [{ scale: pulseAnim }] }]}>🚕</Animated.Text>
        <Text style={styles.mapAddress} numberOfLines={1}>
          {isPickup ? ride.pickupAddress : ride.dropAddress}
        </Text>
        <TouchableOpacity
          style={styles.openMapsBtn}
          onPress={() => Linking.openURL(`https://maps.google.com/?q=${isPickup ? ride.pickupAddress : ride.dropAddress}`)}
        >
          <Text style={styles.openMapsText}>Ouvrir dans Maps</Text>
        </TouchableOpacity>
      </View>

      {/* Step Progress */}
      <View style={styles.stepsRow}>
        {STEPS_PICKUP.map((s, i) => (
          <View key={s.id} style={styles.miniStep}>
            <View style={[
              styles.miniDot,
              i < stepIdx && { backgroundColor: COLORS.green },
              i === stepIdx && { backgroundColor: COLORS.accent },
            ]} />
            {i < STEPS_PICKUP.length - 1 && (
              <View style={[styles.miniLine, i < stepIdx && { backgroundColor: COLORS.green }]} />
            )}
          </View>
        ))}
      </View>

      {/* Current step info */}
      <View style={styles.stepCard}>
        <Text style={styles.stepIcon}>{currentStep.icon}</Text>
        <Text style={styles.stepLabel}>{currentStep.label}</Text>
      </View>

      {/* Client Card */}
      <View style={styles.clientCard}>
        <View style={styles.clientAvatar}>
          <Text style={{ fontSize: 26 }}>👤</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.clientName}>{ride.clientName}</Text>
          <Text style={styles.clientAddr} numberOfLines={1}>
            {isPickup ? `📍 ${ride.pickupAddress}` : `🏁 ${ride.dropAddress}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => Linking.openURL(`tel:${ride.clientPhone}`)}
        >
          <Text style={{ fontSize: 20 }}>📞</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatBtn}>
          <Text style={{ fontSize: 20 }}>💬</Text>
        </TouchableOpacity>
      </View>

      {/* Trip info bar */}
      <View style={styles.infoBar}>
        <View style={styles.infoItem}>
          <Text style={styles.infoValue}>{ride.distance}</Text>
          <Text style={styles.infoLabel}>Distance</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Text style={styles.infoValue}>{ride.duration}</Text>
          <Text style={styles.infoLabel}>Durée estimée</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Text style={[styles.infoValue, { color: COLORS.accent }]}>{ride.fare?.toFixed(2)} TND</Text>
          <Text style={styles.infoLabel}>Tarif estimé</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.navigate('OrderCancel', { rideId: ride.rideId })}
        >
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextBtn, isLastStep && { backgroundColor: COLORS.green }]}
          onPress={nextStep}
        >
          <Text style={styles.nextBtnText}>{nextBtnLabel()}</Text>
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rideId: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeText: { fontSize: 11, fontWeight: '700' },
  timerBadge: {
    backgroundColor: COLORS.surface, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: COLORS.border,
  },
  timerText: { color: COLORS.white, fontSize: 14, fontWeight: '800', fontVariant: ['tabular-nums'] },
  mapPlaceholder: {
    flex: 1, backgroundColor: COLORS.surface, margin: 12, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  mapArrow: { color: COLORS.accent, fontSize: 36, fontWeight: '900', marginBottom: 4 },
  mapCar: { fontSize: 52, marginBottom: 12 },
  mapAddress: {
    color: COLORS.white, fontSize: 13, fontWeight: '600',
    paddingHorizontal: 20, textAlign: 'center', marginBottom: 10,
  },
  openMapsBtn: {
    backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: COLORS.blue,
  },
  openMapsText: { color: COLORS.blue, fontSize: 12, fontWeight: '600' },
  stepsRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8,
  },
  miniStep: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  miniDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.border },
  miniLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginHorizontal: 2 },
  stepCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 12, backgroundColor: '#1A1408', borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: COLORS.accent, marginBottom: 8,
  },
  stepIcon: { fontSize: 22 },
  stepLabel: { color: COLORS.white, fontSize: 14, fontWeight: '700', flex: 1 },
  clientCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 12, backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8,
  },
  clientAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.accent,
  },
  clientName: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  clientAddr: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  callBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#0D2E0D', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.green,
  },
  chatBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#08141A', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.blue,
  },
  infoBar: {
    flexDirection: 'row', marginHorizontal: 12, backgroundColor: COLORS.surface,
    borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8,
  },
  infoItem: { flex: 1, alignItems: 'center' },
  infoValue: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  infoLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  infoDivider: { width: 1, backgroundColor: COLORS.border },
  footer: {
    flexDirection: 'row', gap: 10, padding: 12,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  cancelBtn: {
    paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  cancelText: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
  nextBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: COLORS.accent, alignItems: 'center',
  },
  nextBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
});
