import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F', orange: '#E67E22',
};

const STEPS = [
  { key: 'searching',  label: 'Recherche d\'un dépanneur…', icon: '🔍' },
  { key: 'found',      label: 'Dépanneur trouvé !',         icon: '✅' },
  { key: 'en_route',   label: 'En route vers vous',         icon: '🛻' },
  { key: 'arrived',    label: 'Dépanneur arrivé',           icon: '📍' },
  { key: 'in_progress',label: 'Intervention en cours',      icon: '🔧' },
  { key: 'done',       label: 'Intervention terminée',      icon: '🎉' },
];

const MOCK_DRIVER = { name: 'Slim Dridi', phone: '+216 55 321 654', eta: 12, rating: 4.9 };

export default function SOSTrackingScreen({ navigation, route }) {
  const { requestId, sosType, address } = route?.params || {};
  const [stepIdx, setStepIdx] = useState(0);
  const [driver, setDriver] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    // Simulate progression
    const timers = [
      setTimeout(() => { setStepIdx(1); setDriver(MOCK_DRIVER); }, 4000),
      setTimeout(() => setStepIdx(2), 8000),
      setTimeout(() => setStepIdx(3), 15000),
    ];

    const tick = setInterval(() => setElapsed(e => e + 1), 1000);

    // Poll real status
    const poll = setInterval(async () => {
      try {
        const res = await api.get(`/api/sos/request/${requestId}/status`);
        if (res.data?.stepIdx !== undefined) setStepIdx(res.data.stepIdx);
        if (res.data?.driver) setDriver(res.data.driver);
      } catch {}
    }, 10000);

    return () => { timers.forEach(clearTimeout); clearInterval(tick); clearInterval(poll); };
  }, []);

  const currentStep = STEPS[stepIdx];
  const isDone = stepIdx === STEPS.length - 1;

  const handleCancel = () => {
    if (stepIdx >= 2) {
      Alert.alert('Annulation impossible', 'Le dépanneur est déjà en route. Contactez-le directement.');
      return;
    }
    Alert.alert('Annuler la demande SOS ?', '', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui, annuler', style: 'destructive', onPress: () => navigation.navigate('Home') },
    ]);
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.title}>🛻 SOS en cours</Text>
        <Text style={styles.timer}>{fmt(elapsed)}</Text>
      </View>

      {/* Status pulse */}
      <View style={styles.statusSection}>
        <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }], backgroundColor: isDone ? COLORS.green : COLORS.red }]} />
        <Text style={styles.stepIcon}>{currentStep.icon}</Text>
        <Text style={styles.stepLabel}>{currentStep.label}</Text>
        {requestId && <Text style={styles.requestId}>Demande #{requestId}</Text>}
      </View>

      {/* Progress dots */}
      <View style={styles.progressDots}>
        {STEPS.map((s, i) => (
          <View key={s.key} style={{ alignItems: 'center' }}>
            <View style={[styles.dot, i <= stepIdx && styles.dotActive, i === stepIdx && styles.dotCurrent]} />
            {i < STEPS.length - 1 && <View style={[styles.line, i < stepIdx && styles.lineActive]} />}
          </View>
        ))}
      </View>

      {/* Driver card */}
      {driver && (
        <View style={styles.driverCard}>
          <View style={styles.driverAvatar}><Text style={{ fontSize: 32 }}>🧔</Text></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.driverName}>{driver.name}</Text>
            <Text style={styles.driverRating}>⭐ {driver.rating} · Dépanneur certifié</Text>
            {driver.eta && stepIdx === 2 && (
              <Text style={styles.driverEta}>🕐 Arrive dans ≈ {driver.eta} min</Text>
            )}
          </View>
          <TouchableOpacity style={styles.callBtn}>
            <Text style={{ fontSize: 24 }}>📞</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Address */}
      <View style={styles.addressBox}>
        <Text style={styles.addressLabel}>📍 Votre position</Text>
        <Text style={styles.addressValue}>{address || 'Position GPS en cours…'}</Text>
      </View>

      <View style={styles.bottomActions}>
        {isDone ? (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.green }]}
            onPress={() => navigation.navigate('SOSHistory')}
          >
            <Text style={styles.actionBtnText}>Voir le récapitulatif</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.red }]}
            onPress={handleCancel}
          >
            <Text style={[styles.actionBtnText, { color: COLORS.red }]}>Annuler la demande</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  timer: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
  statusSection: { alignItems: 'center', paddingVertical: 32 },
  pulseDot: { width: 16, height: 16, borderRadius: 8, marginBottom: 16 },
  stepIcon: { fontSize: 56, marginBottom: 12 },
  stepLabel: { color: COLORS.white, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  requestId: { color: COLORS.muted, fontSize: 12, marginTop: 6 },
  progressDots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 0, paddingHorizontal: 20, marginBottom: 20 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.green },
  dotCurrent: { backgroundColor: COLORS.red, width: 18, height: 18, borderRadius: 9 },
  line: { width: 30, height: 3, backgroundColor: COLORS.border, marginTop: 5 },
  lineActive: { backgroundColor: COLORS.green },
  driverCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 12 },
  driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.accent + '22', alignItems: 'center', justifyContent: 'center' },
  driverName: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  driverRating: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  driverEta: { color: COLORS.orange, fontSize: 12, fontWeight: '600', marginTop: 3 },
  callBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.green + '22', alignItems: 'center', justifyContent: 'center' },
  addressBox: { backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 12 },
  addressLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  addressValue: { color: COLORS.white, fontSize: 13 },
  bottomActions: { position: 'absolute', bottom: 24, left: 16, right: 16 },
  actionBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  actionBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
});
