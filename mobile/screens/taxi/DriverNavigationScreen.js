import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapboxWebView from '../../components/MapboxWebView';
import * as Location from 'expo-location';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F', blue: '#1565C0',
};

const MOCK_STEPS = [
  { dist: '0 m', instr: 'Démarrer sur Avenue Habib Bourguiba', dir: '↑' },
  { dist: '350 m', instr: 'Tourner à droite sur Rue de Rome', dir: '→' },
  { dist: '1.2 km', instr: 'Continuer tout droit', dir: '↑' },
  { dist: '200 m', instr: 'Tourner à gauche sur Avenue de Paris', dir: '←' },
  { dist: '80 m', instr: 'Arrivée à destination à droite', dir: '🏁' },
];

export default function DriverNavigationScreen({ route, navigation }) {
  const { orderId, clientName, destinationAddress, destinationLat, destinationLng } = route?.params || {};
  const [currentStep, setCurrentStep] = useState(0);
  const [eta, setEta] = useState(14);
  const [distance, setDistance] = useState(3.2);
  const [driverPos, setDriverPos] = useState({ lat: 36.8065, lng: 10.1815 });
  const [arrived, setArrived] = useState(false);
  const etaTimer = useRef(null);

  useEffect(() => {
    // Simulate ETA countdown
    etaTimer.current = setInterval(() => {
      setEta((e) => Math.max(0, e - 1));
      setDistance((d) => Math.max(0, +(d - 0.05).toFixed(2)));
    }, 15000);
    return () => clearInterval(etaTimer.current);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setDriverPos({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        }
      } catch {}
    })();
  }, []);

  const nextStep = () => {
    if (currentStep >= MOCK_STEPS.length - 1) {
      setArrived(true);
      return;
    }
    setCurrentStep((s) => s + 1);
  };

  const handleArrival = () => {
    clearInterval(etaTimer.current);
    Alert.alert(
      "Arrivée confirmée ✅",
      `Vous êtes arrivé chez ${clientName || 'le client'}.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const destLat = destinationLat || 36.82;
  const destLng = destinationLng || 10.19;

  const step = MOCK_STEPS[currentStep];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Map — full screen */}
      <MapboxWebView
        style={styles.map}
        centerCoordinate={[driverPos.lng, driverPos.lat]}
        zoom={14}
        markers={[
          { coordinates: [driverPos.lng, driverPos.lat], color: COLORS.accent, label: '🚕' },
          { coordinates: [destLng, destLat], color: COLORS.green, label: '🏁' },
        ]}
        route={[
          [driverPos.lng, driverPos.lat],
          [(driverPos.lng + destLng) / 2, (driverPos.lat + destLat) / 2 + 0.01],
          [destLng, destLat],
        ]}
      />

      {/* Top bar */}
      <SafeAreaView style={styles.topBar} pointerEvents="box-none">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.white, fontSize: 22 }}>‹</Text>
        </TouchableOpacity>
        <View style={styles.etaBox}>
          <Text style={styles.etaNum}>{eta} min</Text>
          <Text style={styles.etaDist}>{distance} km</Text>
        </View>
        <TouchableOpacity
          style={styles.sosBtn}
          onPress={() => Alert.alert('SOS', 'Contacter le support d\'urgence ?', [
            { text: 'Annuler' },
            { text: 'Appeler', style: 'destructive' },
          ])}
        >
          <Text style={{ color: COLORS.white, fontSize: 13, fontWeight: '700' }}>SOS</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Direction card */}
      <View style={styles.dirCard}>
        <View style={styles.dirRow}>
          <View style={styles.dirIcon}>
            <Text style={styles.dirArrow}>{step.dir}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.dirInstr}>{step.instr}</Text>
            <Text style={styles.dirDist}>{step.dist} · Étape {currentStep + 1}/{MOCK_STEPS.length}</Text>
          </View>
        </View>

        {/* Destination */}
        <View style={styles.destRow}>
          <Text style={styles.destLabel}>🏁 Destination</Text>
          <Text style={styles.destAddr} numberOfLines={1}>
            {destinationAddress || "Avenue de la Liberté, Tunis"}
          </Text>
        </View>

        {/* Client info */}
        {clientName && (
          <View style={styles.clientRow}>
            <Text style={styles.clientLabel}>👤 Client</Text>
            <Text style={styles.clientName}>{clientName}</Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          {arrived ? (
            <TouchableOpacity style={styles.arriveBtn} onPress={handleArrival}>
              <Text style={styles.arriveBtnText}>✅ Confirmer l'arrivée</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
                <Text style={styles.nextBtnText}>Étape suivante →</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.arrivedBtn}
                onPress={() => { setArrived(true); clearInterval(etaTimer.current); }}
              >
                <Text style={styles.arrivedBtnText}>🏁 Arrivé</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  map: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 0, height: '100%' },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 10,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  etaBox: {
    backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center',
  },
  etaNum: { color: COLORS.accent, fontSize: 22, fontWeight: '900' },
  etaDist: { color: COLORS.muted, fontSize: 12 },
  sosBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.red,
    alignItems: 'center', justifyContent: 'center',
  },
  dirCard: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  dirRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  dirIcon: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
  },
  dirArrow: { fontSize: 26 },
  dirInstr: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  dirDist: { color: COLORS.muted, fontSize: 13, marginTop: 3 },
  destRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.surfaceAlt, borderRadius: 10,
    padding: 10, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  destLabel: { color: COLORS.muted, fontSize: 12, minWidth: 80 },
  destAddr: { flex: 1, color: COLORS.white, fontSize: 13, fontWeight: '600' },
  clientRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.surfaceAlt, borderRadius: 10,
    padding: 10, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  clientLabel: { color: COLORS.muted, fontSize: 12, minWidth: 80 },
  clientName: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10 },
  nextBtn: {
    flex: 1, backgroundColor: COLORS.blue, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  nextBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  arrivedBtn: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 12, borderWidth: 1, borderColor: COLORS.green,
    paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center',
  },
  arrivedBtnText: { color: COLORS.green, fontSize: 14, fontWeight: '700' },
  arriveBtn: {
    flex: 1, backgroundColor: COLORS.green, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  arriveBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});
