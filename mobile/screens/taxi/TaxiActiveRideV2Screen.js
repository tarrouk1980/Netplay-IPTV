import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const STEPS = [
  { id: 'requested', label: 'Course demandée', icon: '📍', done: true },
  { id: 'accepted', label: 'Chauffeur trouvé', icon: '✅', done: true },
  { id: 'arriving', label: 'Chauffeur en approche', icon: '🚕', done: true },
  { id: 'onboard', label: 'En route', icon: '🛣️', done: true },
  { id: 'arrived', label: 'Destination atteinte', icon: '🏁', done: false },
];

const MOCK = {
  rideId: 'TXI-20240603-7741',
  driverName: 'Achraf B.',
  driverRating: 4.9,
  vehicle: 'Clio 5 Grise · TUN-2234',
  from: 'Av. Habib Bourguiba, Tunis',
  to: 'Aéroport Tunis-Carthage',
  distance: '12.4 km',
  duration: '18 min',
  fare: 16.50,
  status: 'onboard',
  eta: '6 min',
};

export default function TaxiActiveRideV2Screen({ navigation, route }) {
  const data = route.params?.ride || MOCK;
  const [eta, setEta] = useState(parseInt(data.eta) || 6);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const carAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(carAnim, { toValue: 8, duration: 1200, useNativeDriver: true }),
        Animated.timing(carAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    const t = setInterval(() => {
      setEta(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const currentStepIdx = STEPS.findIndex(s => s.id === data.status) + 1;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Course en cours</Text>
          <Text style={styles.rideId}>#{data.rideId?.slice(-6)}</Text>
        </View>
        <Animated.View style={[styles.liveBadge, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.liveText}>● EN ROUTE</Text>
        </Animated.View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <Animated.Text style={[styles.mapCar, { transform: [{ translateY: carAnim }] }]}>🚕</Animated.Text>
          <View style={styles.mapRoute}>
            <View style={styles.mapDot} />
            <View style={styles.mapLine} />
            <View style={[styles.mapDot, { backgroundColor: COLORS.red }]} />
          </View>
          <Text style={styles.mapLabel}>Carte en temps réel</Text>
        </View>

        {/* ETA + Fare */}
        <View style={styles.etaCard}>
          <View style={styles.etaItem}>
            <Text style={styles.etaNum}>{eta === 0 ? 'Arrivé !' : `${eta} min`}</Text>
            <Text style={styles.etaLabel}>Temps restant</Text>
          </View>
          <View style={styles.etaDivider} />
          <View style={styles.etaItem}>
            <Text style={styles.etaNum}>{data.distance}</Text>
            <Text style={styles.etaLabel}>Distance</Text>
          </View>
          <View style={styles.etaDivider} />
          <View style={styles.etaItem}>
            <Text style={[styles.etaNum, { color: COLORS.accent }]}>{data.fare?.toFixed(2)} TND</Text>
            <Text style={styles.etaLabel}>Tarif estimé</Text>
          </View>
        </View>

        {/* Driver Card */}
        <View style={styles.driverCard}>
          <View style={styles.driverAvatar}>
            <Text style={{ fontSize: 30 }}>🧔</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.driverName}>{data.driverName}</Text>
            <Text style={styles.driverVehicle}>{data.vehicle}</Text>
            <View style={styles.driverRatingRow}>
              <Text style={styles.driverRating}>⭐ {data.driverRating}</Text>
            </View>
          </View>
          <View style={styles.driverActions}>
            <TouchableOpacity style={styles.driverActionBtn}>
              <Text style={{ fontSize: 20 }}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.driverActionBtn}>
              <Text style={{ fontSize: 20 }}>💬</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trip Info */}
        <View style={styles.tripCard}>
          <View style={styles.tripRow}>
            <View style={styles.tripDotGreen} />
            <View style={{ flex: 1 }}>
              <Text style={styles.tripLabel}>Départ</Text>
              <Text style={styles.tripValue} numberOfLines={1}>{data.from}</Text>
            </View>
          </View>
          <View style={styles.tripConnector} />
          <View style={styles.tripRow}>
            <View style={styles.tripDotRed} />
            <View style={{ flex: 1 }}>
              <Text style={styles.tripLabel}>Destination</Text>
              <Text style={styles.tripValue} numberOfLines={1}>{data.to}</Text>
            </View>
          </View>
        </View>

        {/* Progress Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Progression</Text>
          {STEPS.map((step, i) => {
            const done = i < currentStepIdx;
            const active = i === currentStepIdx - 1;
            return (
              <View key={step.id} style={styles.stepRow}>
                <View style={[styles.stepCircle, done && styles.stepCircleDone, active && styles.stepCircleActive]}>
                  <Text style={{ fontSize: 14 }}>{done ? '✓' : step.icon}</Text>
                </View>
                {i < STEPS.length - 1 && (
                  <View style={[styles.stepLine, done && styles.stepLineDone]} />
                )}
                <Text style={[styles.stepLabel, done && { color: COLORS.white }, active && { color: COLORS.accent, fontWeight: '700' }]}>
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.sosBtn}
          onPress={() => navigation.navigate('SOSHome')}
        >
          <Text style={styles.sosBtnText}>🆘 SOS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.navigate('OrderCancel', { rideId: data.rideId })}
        >
          <Text style={styles.cancelBtnText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => navigation.navigate('EmergencyContact')}
        >
          <Text style={styles.shareBtnText}>📍 Partager</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerLeft: {},
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  rideId: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  liveBadge: {
    backgroundColor: '#0D2E0D', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: COLORS.green,
  },
  liveText: { color: COLORS.green, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  mapPlaceholder: {
    height: 180, margin: 16, borderRadius: 16,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  mapCar: { fontSize: 42, marginBottom: 12 },
  mapRoute: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mapDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.green },
  mapLine: { width: 80, height: 2, backgroundColor: COLORS.accent },
  mapLabel: { color: COLORS.muted, fontSize: 11, position: 'absolute', bottom: 12 },
  etaCard: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  etaItem: { flex: 1, alignItems: 'center' },
  etaNum: { color: COLORS.white, fontSize: 20, fontWeight: '900' },
  etaLabel: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  etaDivider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: 8 },
  driverCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, marginBottom: 12, backgroundColor: COLORS.surface,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  driverAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.accent,
  },
  driverName: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  driverVehicle: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  driverRatingRow: { flexDirection: 'row', marginTop: 4 },
  driverRating: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  driverActions: { flexDirection: 'column', gap: 8 },
  driverActionBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  tripCard: {
    marginHorizontal: 16, marginBottom: 12, backgroundColor: COLORS.surface,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  tripRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tripDotGreen: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.green },
  tripDotRed: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.red },
  tripConnector: { width: 1, height: 20, backgroundColor: COLORS.border, marginLeft: 6, marginVertical: 4 },
  tripLabel: { color: COLORS.muted, fontSize: 11 },
  tripValue: { color: COLORS.white, fontSize: 13, fontWeight: '600', marginTop: 1 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4, position: 'relative' },
  stepCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  stepCircleDone: { backgroundColor: '#0D2E0D', borderColor: COLORS.green },
  stepCircleActive: { borderColor: COLORS.accent, backgroundColor: '#2A1E0A' },
  stepLine: {
    position: 'absolute', left: 17, top: 36, width: 2, height: 20,
    backgroundColor: COLORS.border, zIndex: 0,
  },
  stepLineDone: { backgroundColor: COLORS.green },
  stepLabel: { color: COLORS.muted, fontSize: 14 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 8, padding: 16,
    backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  sosBtn: {
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12,
    backgroundColor: COLORS.red, alignItems: 'center',
  },
  sosBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
  shareBtn: {
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12,
    backgroundColor: COLORS.blue, alignItems: 'center',
  },
  shareBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
});
