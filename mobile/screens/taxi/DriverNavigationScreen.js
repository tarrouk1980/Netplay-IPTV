import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapboxWebView from '../../components/MapboxWebView';
import * as Location from 'expo-location';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F', blue: '#1565C0',
};

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function DriverNavigationScreen({ route, navigation }) {
  const { orderId, clientName, destinationAddress, destinationLat, destinationLng } = route?.params || {};
  const [driverPos, setDriverPos] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const watchRef = useRef(null);

  const destLat = destinationLat || 36.82;
  const destLng = destinationLng || 10.19;

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setDriverPos({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        watchRef.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 20 },
          (l) => setDriverPos({ lat: l.coords.latitude, lng: l.coords.longitude })
        );
      } catch {}
    })();
    return () => { watchRef.current?.remove?.(); };
  }, []);

  const handleArrival = useCallback(async () => {
    if (!orderId) {
      navigation.goBack();
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/api/taxi/${orderId}/start`);
      Alert.alert(
        'Arrivée confirmée ✅',
        `Course démarrée avec ${clientName || 'le client'}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert('Erreur', e?.response?.data?.error || "Impossible de confirmer l'arrivée. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }, [orderId, clientName, navigation]);

  const distanceKm = driverPos ? haversineKm(driverPos.lat, driverPos.lng, destLat, destLng) : null;
  const etaMin = distanceKm != null ? Math.max(1, Math.round((distanceKm / 30) * 60)) : null;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Map — full screen */}
      <MapboxWebView
        style={styles.map}
        centerCoordinate={[driverPos?.lng || destLng, driverPos?.lat || destLat]}
        zoom={14}
        markers={[
          ...(driverPos ? [{ coordinates: [driverPos.lng, driverPos.lat], color: COLORS.accent, label: '🚕' }] : []),
          { coordinates: [destLng, destLat], color: COLORS.green, label: '🏁' },
        ]}
      />

      {/* Top bar */}
      <SafeAreaView style={styles.topBar} pointerEvents="box-none">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.white, fontSize: 22 }}>‹</Text>
        </TouchableOpacity>
        <View style={styles.etaBox}>
          <Text style={styles.etaNum}>{etaMin != null ? `${etaMin} min` : '—'}</Text>
          <Text style={styles.etaDist}>{distanceKm != null ? `${distanceKm.toFixed(1)} km` : 'Localisation…'}</Text>
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

      {/* Destination card */}
      <View style={styles.dirCard}>
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
          <TouchableOpacity
            style={[styles.arriveBtn, submitting && { opacity: 0.6 }]}
            onPress={handleArrival}
            disabled={submitting}
          >
            <Text style={styles.arriveBtnText}>{submitting ? 'Confirmation…' : "✅ Confirmer l'arrivée"}</Text>
          </TouchableOpacity>
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
  arriveBtn: {
    flex: 1, backgroundColor: COLORS.green, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  arriveBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});
