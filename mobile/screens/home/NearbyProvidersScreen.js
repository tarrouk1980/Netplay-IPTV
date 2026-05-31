import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, StatusBar, Dimensions, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import api from '../../services/api';
import useLocationStore from '../../store/locationStore';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  green: '#27AE60',
  accent: '#F5A623',
  error: '#E74C3C',
  info: '#3498DB',
};

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ';
const W = Math.round(Dimensions.get('window').width - 32);

const SERVICE_CONFIG = {
  TAXI: { icon: '🚕', color: '#F5A623', label: 'Taxis disponibles', pinColor: 'F5A623', navigate: 'TaxiRequest' },
  SOS: { icon: '🛻', color: '#E74C3C', label: 'Dépanneurs disponibles', pinColor: 'E74C3C', navigate: 'SOSHome' },
  DELIVERY: { icon: '🛵', color: '#27AE60', label: 'Livreurs disponibles', pinColor: '27AE60', navigate: 'DeliveryHome' },
};

const MOCK_PROVIDERS = {
  TAXI: [
    { id: 't1', name: 'Tarek B.', lat: 36.808, lng: 10.183, rating: 4.8, distance: 0.3 },
    { id: 't2', name: 'Salim K.', lat: 36.804, lng: 10.179, rating: 4.6, distance: 0.7 },
    { id: 't3', name: 'Rania M.', lat: 36.810, lng: 10.190, rating: 4.9, distance: 1.1 },
  ],
  SOS: [
    { id: 's1', name: 'Nizar R.', lat: 36.800, lng: 10.175, rating: 4.7, distance: 1.4 },
    { id: 's2', name: 'Ines H.', lat: 36.815, lng: 10.186, rating: 4.5, distance: 2.0 },
  ],
  DELIVERY: [
    { id: 'd1', name: 'Sofiene T.', lat: 36.806, lng: 10.188, rating: 4.4, distance: 0.5 },
    { id: 'd2', name: 'Amira B.', lat: 36.813, lng: 10.178, rating: 4.7, distance: 0.9 },
  ],
};

function buildMapUrl(providers, userLat, userLng, pinColor) {
  const center = userLat ? `${userLng},${userLat}` : '10.1815,36.8065';
  const userPin = userLat ? `pin-s+4A9EFF(${userLng},${userLat}),` : '';
  const provPins = providers.slice(0, 8).map(p => `pin-s+${pinColor}(${p.lng},${p.lat})`).join(',');
  const pins = userPin + provPins;
  return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${pins}/${center},13/${W}x220@2x?access_token=${MAPBOX_TOKEN}`;
}

export default function NearbyProvidersScreen({ navigation }) {
  const { location } = useLocationStore();
  const [serviceType, setServiceType] = useState('TAXI');
  const [providers, setProviders] = useState({});
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const intervalRef = useRef(null);

  const userLat = location?.latitude || 36.8065;
  const userLng = location?.longitude || 10.1815;

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/users/nearby-providers?lat=${userLat}&lng=${userLng}`);
      setProviders(res.data?.providers || MOCK_PROVIDERS);
    } catch {
      setProviders(MOCK_PROVIDERS);
    } finally {
      setLoading(false);
    }
  }, [userLat, userLng]);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, 30000);
    return () => clearInterval(intervalRef.current);
  }, [load]);

  const config = SERVICE_CONFIG[serviceType];
  const list = (providers[serviceType] || []).sort((a, b) => a.distance - b.distance);
  const mapUrl = buildMapUrl(list, userLat, userLng, config.pinColor);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prestataires disponibles</Text>
        <View style={[styles.liveDot]}>
          <Text style={styles.liveDotText}>● LIVE</Text>
        </View>
      </View>

      {/* Service tabs */}
      <View style={styles.serviceRow}>
        {Object.entries(SERVICE_CONFIG).map(([key, cfg]) => {
          const count = (providers[key] || []).length;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.serviceTab, serviceType === key && { borderColor: cfg.color, backgroundColor: cfg.color + '15' }]}
              onPress={() => { setServiceType(key); setMapError(false); }}
            >
              <Text style={styles.serviceTabIcon}>{cfg.icon}</Text>
              <Text style={[styles.serviceTabLabel, serviceType === key && { color: cfg.color }]}>{key}</Text>
              <View style={[styles.countBadge, { backgroundColor: cfg.color }]}>
                <Text style={styles.countBadgeText}>{count}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Map */}
        <View style={styles.mapContainer}>
          {mapError ? (
            <View style={styles.mapFallback}>
              <Text style={styles.mapFallbackIcon}>{config.icon}</Text>
              <Text style={styles.mapFallbackText}>{list.length} prestataire(s) à proximité</Text>
            </View>
          ) : (
            <Image
              source={{ uri: mapUrl }}
              style={styles.mapImage}
              onError={() => setMapError(true)}
              resizeMode="cover"
            />
          )}
          <View style={styles.mapLegend}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#4A9EFF' }]} /><Text style={styles.legendText}>Vous</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#' + config.pinColor }]} /><Text style={styles.legendText}>{config.label.split(' ')[0]}</Text></View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={[styles.statNum, { color: config.color }]}>{list.length}</Text>
            <Text style={styles.statLbl}>Disponibles</Text>
          </View>
          {list.length > 0 && (
            <>
              <View style={styles.statChip}>
                <Text style={styles.statNum}>{list[0].distance.toFixed(1)} km</Text>
                <Text style={styles.statLbl}>Le plus proche</Text>
              </View>
              <View style={styles.statChip}>
                <Text style={styles.statNum}>~{Math.round(list[0].distance / 0.4)} min</Text>
                <Text style={styles.statLbl}>Temps estimé</Text>
              </View>
            </>
          )}
        </View>

        {/* Provider list */}
        {loading ? (
          <ActivityIndicator color={config.color} style={{ marginTop: 20 }} />
        ) : list.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>{config.icon}</Text>
            <Text style={styles.emptyTitle}>Aucun prestataire disponible</Text>
            <Text style={styles.emptySub}>Réessayez dans quelques minutes.</Text>
          </View>
        ) : (
          list.map(p => (
            <View key={p.id} style={styles.providerRow}>
              <View style={[styles.providerAvatar, { backgroundColor: config.color + '22' }]}>
                <Text style={styles.providerAvatarText}>{config.icon}</Text>
              </View>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{p.name}</Text>
                <Text style={styles.providerMeta}>⭐ {p.rating?.toFixed(1)} · {p.distance?.toFixed(1)} km</Text>
              </View>
              <Text style={[styles.etaText, { color: config.color }]}>~{Math.round(p.distance / 0.4)} min</Text>
            </View>
          ))
        )}

        {/* CTA */}
        {list.length > 0 && (
          <TouchableOpacity
            style={[styles.orderBtn, { backgroundColor: config.color }]}
            onPress={() => navigation.navigate(config.navigate)}
            activeOpacity={0.85}
          >
            <Text style={styles.orderBtnText}>{config.icon} Commander maintenant</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  liveDot: { backgroundColor: '#0D2A1A', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  liveDotText: { color: COLORS.green, fontSize: 11, fontWeight: '700' },
  serviceRow: { flexDirection: 'row', padding: 12, gap: 8 },
  serviceTab: {
    flex: 1, alignItems: 'center', borderRadius: 12, padding: 10,
    borderWidth: 1.5, borderColor: COLORS.border, position: 'relative',
  },
  serviceTabIcon: { fontSize: 22, marginBottom: 4 },
  serviceTabLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700' },
  countBadge: {
    position: 'absolute', top: -6, right: -6,
    minWidth: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  countBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  scroll: { padding: 16 },
  mapContainer: { borderRadius: 16, overflow: 'hidden', marginBottom: 14, height: 220 },
  mapImage: { width: W, height: 220 },
  mapFallback: {
    height: 220, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  mapFallbackIcon: { fontSize: 40, marginBottom: 8 },
  mapFallbackText: { color: COLORS.muted, fontSize: 14 },
  mapLegend: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 8, padding: 6, gap: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: '#FFF', fontSize: 10, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statChip: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 10,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statNum: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  statLbl: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  emptyBox: { alignItems: 'center', paddingTop: 24 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  emptySub: { color: COLORS.muted, fontSize: 13 },
  providerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  providerAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  providerAvatarText: { fontSize: 22 },
  providerInfo: { flex: 1 },
  providerName: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  providerMeta: { color: COLORS.muted, fontSize: 12 },
  etaText: { fontSize: 13, fontWeight: '800' },
  orderBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  orderBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});
