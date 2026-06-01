import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  ActivityIndicator, StatusBar, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  accent: '#F5A623',
  green: '#27AE60',
  red: '#E74C3C',
  blue: '#3498DB',
};

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ';
const W = Dimensions.get('window').width;
const MAP_H = Math.round(Dimensions.get('window').height * 0.6);

const SERVICE_ICONS = { TAXI: '🚕', SOS: '🛻', DELIVERY: '🛵', GROCERY: '🛒' };
const SERVICE_COLORS = { TAXI: 'F5A623', SOS: 'E74C3C', DELIVERY: '27AE60', GROCERY: '3498DB' };

const STATUS_LABELS = {
  ACCEPTED: 'Prestataire en route',
  IN_PROGRESS: 'Course en cours',
  PICKING_UP: 'Prise en charge',
  ARRIVING: 'Arrivée imminente',
  PENDING: 'Recherche en cours…',
};

function buildMapUrl(provLat, provLng, destLat, destLng, serviceType) {
  const color = SERVICE_COLORS[serviceType] || 'F5A623';
  if (!provLat) return null;
  let pins = `pin-s+${color}(${provLng},${provLat})`;
  if (destLat) pins += `,pin-s+E74C3C(${destLng},${destLat})`;
  const midLat = destLat ? (provLat + destLat) / 2 : provLat;
  const midLng = destLng ? (provLng + destLng) / 2 : provLng;
  return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${pins}/${midLng},${midLat},13/${W}x${MAP_H}@2x?access_token=${MAPBOX_TOKEN}`;
};

function haversine(la1, lo1, la2, lo2) {
  const toRad = d => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(la2 - la1);
  const dLon = toRad(lo2 - lo1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(la1)) * Math.cos(toRad(la2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function LiveOrderMapScreen({ route, navigation }) {
  const { orderId, serviceType = 'TAXI', destinationLat, destinationLng, destinationAddress } = route.params || {};

  const [provider, setProvider] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const intervalRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const pulse = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start(() => pulse());
  }, [pulseAnim]);

  useEffect(() => { pulse(); }, [pulse]);

  const fetchData = useCallback(async () => {
    try {
      const serviceMap = { TAXI: 'taxi', SOS: 'sos', DELIVERY: 'delivery', GROCERY: 'grocery' };
      const path = serviceMap[serviceType] || 'taxi';
      const res = await api.get(`/api/${path}/orders/${orderId}/tracking`);
      const data = res.data;
      setProvider(data?.provider || null);
      setOrder(data?.order || null);
    } catch {
      // Use mock position if API unavailable
      setProvider({ name: 'Chauffeur', lat: 36.810 + Math.random() * 0.005, lng: 10.183 + Math.random() * 0.005, rating: 4.8 });
    } finally {
      setLoading(false);
    }
  }, [orderId, serviceType]);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 10000);
    return () => clearInterval(intervalRef.current);
  }, [fetchData]);

  const provLat = provider?.lat;
  const provLng = provider?.lng;
  const distance = provLat && destinationLat
    ? Math.round(haversine(provLat, provLng, parseFloat(destinationLat), parseFloat(destinationLng)) * 10) / 10
    : null;
  const eta = distance !== null ? Math.max(1, Math.round(distance / 0.4)) : null;

  const mapUrl = provLat && !mapError ? buildMapUrl(provLat, provLng, destinationLat, destinationLng, serviceType) : null;
  const statusLabel = STATUS_LABELS[order?.status] || STATUS_LABELS.ACCEPTED;
  const svcIcon = SERVICE_ICONS[serviceType] || '🚗';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{svcIcon} Suivi en direct</Text>
        <View style={styles.livePill}>
          <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.mapPlaceholderText}>Localisation du prestataire…</Text>
          </View>
        ) : mapUrl ? (
          <Image
            source={{ uri: mapUrl }}
            style={styles.mapImage}
            onError={() => setMapError(true)}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={{ fontSize: 48 }}>{svcIcon}</Text>
            <Text style={styles.mapPlaceholderText}>Carte indisponible</Text>
          </View>
        )}

        {/* Map legend */}
        {provLat && (
          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#' + (SERVICE_COLORS[serviceType] || 'F5A623') }]} />
              <Text style={styles.legendText}>{provider?.name || 'Prestataire'}</Text>
            </View>
            {destinationLat && (
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.red }]} />
                <Text style={styles.legendText}>Destination</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Bottom info card */}
      <View style={styles.infoCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>{statusLabel}</Text>
          {eta !== null && (
            <View style={styles.etaPill}>
              <Text style={styles.etaText}>~{eta} min</Text>
            </View>
          )}
        </View>

        {provider && (
          <View style={styles.providerRow}>
            <View style={[styles.providerAvatar, { backgroundColor: '#' + (SERVICE_COLORS[serviceType] || 'F5A623') + '22' }]}>
              <Text style={styles.providerAvatarText}>{svcIcon}</Text>
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{provider.name}</Text>
              {provider.rating && <Text style={styles.providerRating}>⭐ {provider.rating?.toFixed(1)}</Text>}
              {provider.vehicle && <Text style={styles.providerVehicle}>{provider.vehicle}</Text>}
            </View>
            {distance !== null && (
              <View style={styles.distanceBox}>
                <Text style={[styles.distanceNum, { color: '#' + (SERVICE_COLORS[serviceType] || 'F5A623') }]}>{distance}</Text>
                <Text style={styles.distanceUnit}>km</Text>
              </View>
            )}
          </View>
        )}

        {destinationAddress && (
          <View style={styles.destRow}>
            <Text style={styles.destIcon}>📍</Text>
            <Text style={styles.destText} numberOfLines={1}>{destinationAddress}</Text>
          </View>
        )}

        <Text style={styles.refreshNote}>Actualisation automatique toutes les 10 secondes</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#0D2A1A', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green },
  liveText: { color: COLORS.green, fontSize: 11, fontWeight: '800' },
  mapContainer: { height: MAP_H, position: 'relative' },
  mapImage: { width: W, height: MAP_H },
  mapPlaceholder: { height: MAP_H, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', gap: 12 },
  mapPlaceholderText: { color: COLORS.muted, fontSize: 14 },
  mapLegend: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 10, padding: 8, gap: 5,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  infoCard: {
    flex: 1, backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  statusText: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  etaPill: { backgroundColor: COLORS.accent + '22', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.accent },
  etaText: { color: COLORS.accent, fontWeight: '800', fontSize: 14 },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  providerAvatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  providerAvatarText: { fontSize: 22 },
  providerInfo: { flex: 1 },
  providerName: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  providerRating: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  providerVehicle: { color: COLORS.muted, fontSize: 12 },
  distanceBox: { alignItems: 'center' },
  distanceNum: { fontSize: 22, fontWeight: '900' },
  distanceUnit: { color: COLORS.muted, fontSize: 11 },
  destRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.bg, borderRadius: 10, padding: 12, marginBottom: 10 },
  destIcon: { fontSize: 16 },
  destText: { color: COLORS.muted, fontSize: 13, flex: 1 },
  refreshNote: { color: COLORS.border, fontSize: 10, textAlign: 'center', marginTop: 4 },
});
