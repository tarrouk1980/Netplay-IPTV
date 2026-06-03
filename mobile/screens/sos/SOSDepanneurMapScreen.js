import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Animated, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK = {
  sosId: 'SOS-20240603-0041',
  depanneurName: 'Mohamed Khelifa',
  depanneurPhone: '+216 20 555 666',
  depanneurRating: 4.8,
  vehicle: 'Dépanneuse lourde · TN-1122',
  eta: 12,
  breakdownType: 'Panne moteur',
  clientAddress: 'Route de la Soukra, Km 5, Ariana',
  distanceKm: 3.2,
  price: 85.00,
};

const SOS_STEPS = [
  { id: 'requested', label: 'Demande envoyée', done: true },
  { id: 'accepted', label: 'Dépanneur accepté', done: true },
  { id: 'en_route', label: 'Dépanneur en route', done: true },
  { id: 'arrived', label: 'Dépanneur arrivé', done: false },
  { id: 'repair', label: 'Réparation en cours', done: false },
  { id: 'done', label: 'Intervention terminée', done: false },
];

export default function SOSDepanneurMapScreen({ navigation, route }) {
  const data = route.params?.sos || MOCK;
  const [eta, setEta] = useState(data.eta);
  const [currentStep, setCurrentStep] = useState(2);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sosAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.timing(sosAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
    ).start();

    const t = setInterval(() => {
      setEta(prev => Math.max(0, prev - 1));
    }, 60000);
    return () => clearInterval(t);
  }, []);

  const cancelSOS = () => {
    Alert.alert(
      'Annuler l\'intervention',
      'Êtes-vous sûr de vouloir annuler ? Des frais d\'annulation peuvent s\'appliquer.',
      [
        { text: 'Non', style: 'cancel' },
        { text: 'Oui, annuler', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🔧 Dépanneur en route</Text>
          <Text style={styles.headerSub}>#{data.sosId?.slice(-6)}</Text>
        </View>
        <Animated.View style={[styles.sosDot, { transform: [{ scale: pulseAnim }] }]} />
      </View>

      {/* Map placeholder */}
      <View style={styles.mapBox}>
        <View style={styles.mapContent}>
          <Animated.Text
            style={[styles.truckEmoji, {
              transform: [{
                translateX: sosAnim.interpolate({ inputRange: [0, 1], outputRange: [-60, 60] })
              }]
            }]}
          >
            🚛
          </Animated.Text>
          <View style={styles.mapLine} />
          <Text style={styles.mapPin}>📍</Text>
        </View>
        <Text style={styles.mapLabel}>{data.clientAddress}</Text>
        <TouchableOpacity
          style={styles.openMapsBtn}
          onPress={() => Linking.openURL(`https://maps.google.com/?q=${data.clientAddress}`)}
        >
          <Text style={styles.openMapsText}>📍 Voir sur Maps</Text>
        </TouchableOpacity>
      </View>

      {/* ETA Banner */}
      <View style={[styles.etaBanner, eta <= 3 && { borderColor: COLORS.green }]}>
        <Text style={styles.etaEmoji}>{eta === 0 ? '🏁' : '🚛'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.etaTitle}>
            {eta === 0 ? 'Le dépanneur est arrivé !' : `Arrivée dans ${eta} min`}
          </Text>
          <Text style={styles.etaSub}>{data.breakdownType} · {data.distanceKm} km</Text>
        </View>
        <Text style={[styles.etaNum, { color: eta <= 3 ? COLORS.green : COLORS.accent }]}>
          {eta === 0 ? '✓' : `${eta}'`}
        </Text>
      </View>

      {/* Depanneur Card */}
      <View style={styles.depanneurCard}>
        <View style={styles.depanneurAvatar}>
          <Text style={{ fontSize: 28 }}>🔧</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.depanneurName}>{data.depanneurName}</Text>
          <Text style={styles.depanneurVehicle}>{data.vehicle}</Text>
          <Text style={styles.depanneurRating}>⭐ {data.depanneurRating} · Spécialiste certifié</Text>
        </View>
        <View style={styles.depActions}>
          <TouchableOpacity
            style={styles.depActionBtn}
            onPress={() => Linking.openURL(`tel:${data.depanneurPhone}`)}
          >
            <Text style={{ fontSize: 20 }}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.depActionBtn, { borderColor: COLORS.blue }]}>
            <Text style={{ fontSize: 20 }}>💬</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Steps */}
      <View style={styles.stepsCard}>
        {SOS_STEPS.map((s, i) => {
          const done = i <= currentStep;
          const active = i === currentStep;
          return (
            <View key={s.id} style={styles.stepRow}>
              <View style={[styles.stepDot, done && styles.stepDotDone, active && styles.stepDotActive]}>
                <Text style={{ color: COLORS.white, fontSize: 9, fontWeight: '900' }}>{done ? '✓' : ''}</Text>
              </View>
              {i < SOS_STEPS.length - 1 && (
                <View style={[styles.stepLine, done && { backgroundColor: COLORS.green }]} />
              )}
              <Text style={[styles.stepLabel, done && { color: COLORS.white }, active && { color: COLORS.accent, fontWeight: '700' }]}>
                {s.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.priceInfo}>
          <Text style={styles.priceLabel}>Intervention estimée</Text>
          <Text style={styles.priceValue}>{data.price?.toFixed(2)} TND</Text>
        </View>
        <TouchableOpacity style={styles.cancelBtn} onPress={cancelSOS}>
          <Text style={styles.cancelBtnText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => navigation.navigate('EmergencyContact')}
        >
          <Text style={styles.shareBtnText}>📤 Partager</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  headerSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  sosDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.red },
  mapBox: {
    height: 160, margin: 12, borderRadius: 16,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  mapContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  truckEmoji: { fontSize: 32 },
  mapLine: { width: 60, height: 3, backgroundColor: COLORS.accent, borderRadius: 2, marginHorizontal: 8 },
  mapPin: { fontSize: 28 },
  mapLabel: { color: COLORS.muted, fontSize: 11, textAlign: 'center', paddingHorizontal: 20, marginBottom: 8 },
  openMapsBtn: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: COLORS.blue,
  },
  openMapsText: { color: COLORS.blue, fontSize: 12, fontWeight: '600' },
  etaBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 12, marginBottom: 8, backgroundColor: '#1A0A0A',
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.red,
  },
  etaEmoji: { fontSize: 28 },
  etaTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  etaSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  etaNum: { fontSize: 22, fontWeight: '900' },
  depanneurCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 12, marginBottom: 8, backgroundColor: COLORS.surface,
    borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  depanneurAvatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#1A1408', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.accent,
  },
  depanneurName: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  depanneurVehicle: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  depanneurRating: { color: COLORS.accent, fontSize: 11, marginTop: 2 },
  depActions: { flexDirection: 'column', gap: 6 },
  depActionBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.green,
  },
  stepsCard: {
    marginHorizontal: 12, backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4, position: 'relative' },
  stepDot: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: COLORS.surfaceAlt, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  stepDotDone: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  stepDotActive: { borderColor: COLORS.accent },
  stepLine: {
    position: 'absolute', left: 10, top: 22, width: 2, height: 18,
    backgroundColor: COLORS.border, zIndex: 0,
  },
  stepLabel: { color: COLORS.muted, fontSize: 12 },
  footer: {
    flexDirection: 'row', gap: 8, padding: 12,
    borderTopWidth: 1, borderTopColor: COLORS.border, alignItems: 'center',
  },
  priceInfo: { flex: 1 },
  priceLabel: { color: COLORS.muted, fontSize: 11 },
  priceValue: { color: COLORS.accent, fontSize: 18, fontWeight: '900' },
  cancelBtn: {
    paddingVertical: 13, paddingHorizontal: 16, borderRadius: 12,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  cancelBtnText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  shareBtn: {
    paddingVertical: 13, paddingHorizontal: 16, borderRadius: 12,
    backgroundColor: COLORS.blue,
  },
  shareBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
});
