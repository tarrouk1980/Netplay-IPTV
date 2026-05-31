import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  green: '#27AE60',
  amber: '#F57C00',
  accent: '#D32F2F',
  taxi: '#F5A623',
  sos: '#E74C3C',
  delivery: '#27AE60',
};

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ';
const W = Math.round(Dimensions.get('window').width - 32);
const H = 280;

const ROLE_ICON = { CHAUFFEUR: '🚕', LIVREUR: '🛵', DEPANNEUR: '🛻' };
const ROLE_COLOR = { CHAUFFEUR: COLORS.taxi, LIVREUR: COLORS.delivery, DEPANNEUR: COLORS.sos };

// Mock active providers for demo
const MOCK_PROVIDERS = [
  { id: 'p1', name: 'Tarek Ben Ali', role: 'CHAUFFEUR', lat: 36.8065, lng: 10.1815, status: 'ONLINE', ordersToday: 4 },
  { id: 'p2', name: 'Salma Khelifi', role: 'LIVREUR', lat: 36.8190, lng: 10.1650, status: 'BUSY', ordersToday: 7 },
  { id: 'p3', name: 'Nizar Romdhane', role: 'DEPANNEUR', lat: 36.7920, lng: 10.1900, status: 'ONLINE', ordersToday: 2 },
  { id: 'p4', name: 'Ines Hamdi', role: 'CHAUFFEUR', lat: 36.8300, lng: 10.1700, status: 'ONLINE', ordersToday: 5 },
  { id: 'p5', name: 'Sofiene Touiti', role: 'LIVREUR', lat: 36.8010, lng: 10.2000, status: 'BUSY', ordersToday: 3 },
];

function buildMapUrl(providers, filter) {
  const shown = filter === 'ALL' ? providers : providers.filter(p => p.role === filter);
  if (!shown.length) {
    return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/10.1815,36.8065,11/${W}x${H}@2x?access_token=${MAPBOX_TOKEN}`;
  }

  const colorMap = { CHAUFFEUR: 'F5A623', LIVREUR: '27AE60', DEPANNEUR: 'E74C3C' };

  const pins = shown.map(p => {
    const col = colorMap[p.role] || 'FFFFFF';
    return `pin-s+${col}(${p.lng},${p.lat})`;
  }).join(',');

  // Center map on average position
  const avgLat = shown.reduce((s, p) => s + p.lat, 0) / shown.length;
  const avgLng = shown.reduce((s, p) => s + p.lng, 0) / shown.length;

  return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${pins}/${avgLng},${avgLat},12/${W}x${H}@2x?access_token=${MAPBOX_TOKEN}`;
}

export default function AdminDriverMapScreen({ navigation }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [mapError, setMapError] = useState(false);
  const [selected, setSelected] = useState(null);
  const intervalRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/providers/live');
      setProviders(res.data?.providers || MOCK_PROVIDERS);
    } catch {
      setProviders(MOCK_PROVIDERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, 15000);
    return () => clearInterval(intervalRef.current);
  }, [load]);

  const FILTERS = ['ALL', 'CHAUFFEUR', 'LIVREUR', 'DEPANNEUR'];

  const displayed = filter === 'ALL' ? providers : providers.filter(p => p.role === filter);
  const online = displayed.filter(p => p.status === 'ONLINE').length;
  const busy = displayed.filter(p => p.status === 'BUSY').length;

  const mapUrl = buildMapUrl(providers, filter);

  const { Image } = require('react-native');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🗺️ Carte des prestataires</Text>
        <View style={styles.liveChip}>
          <Text style={styles.liveChipText}>● LIVE</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statNum}>{displayed.length}</Text>
          <Text style={styles.statLbl}>Total</Text>
        </View>
        <View style={[styles.statChip, { borderColor: COLORS.green + '60' }]}>
          <Text style={[styles.statNum, { color: COLORS.green }]}>{online}</Text>
          <Text style={styles.statLbl}>En ligne</Text>
        </View>
        <View style={[styles.statChip, { borderColor: COLORS.amber + '60' }]}>
          <Text style={[styles.statNum, { color: COLORS.amber }]}>{busy}</Text>
          <Text style={styles.statLbl}>Occupés</Text>
        </View>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => { setFilter(f); setSelected(null); }}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
              {f === 'ALL' ? 'Tous' : `${ROLE_ICON[f] || ''} ${f}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.green} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Map */}
          <View style={styles.mapContainer}>
            {mapError ? (
              <View style={styles.mapFallback}>
                <Text style={styles.mapFallbackIcon}>🗺️</Text>
                <Text style={styles.mapFallbackText}>{displayed.length} prestataire(s) actif(s)</Text>
              </View>
            ) : (
              <Image
                source={{ uri: mapUrl }}
                style={styles.mapImage}
                onError={() => setMapError(true)}
                resizeMode="cover"
              />
            )}

            {/* Legend overlay */}
            <View style={styles.legendOverlay}>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.taxi }]} /><Text style={styles.legendText}>Taxi</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.delivery }]} /><Text style={styles.legendText}>Livreur</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.sos }]} /><Text style={styles.legendText}>Dépanneur</Text></View>
            </View>
          </View>

          {/* Provider list */}
          <Text style={styles.sectionLabel}>PRESTATAIRES ACTIFS</Text>
          {displayed.map(p => (
            <TouchableOpacity
              key={p.id}
              style={[styles.providerRow, selected?.id === p.id && styles.providerRowSelected]}
              onPress={() => setSelected(prev => prev?.id === p.id ? null : p)}
              activeOpacity={0.8}
            >
              <Text style={styles.providerIcon}>{ROLE_ICON[p.role] || '👤'}</Text>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{p.name}</Text>
                <Text style={styles.providerRole}>{p.role}</Text>
              </View>
              <View style={styles.providerRight}>
                <View style={[styles.statusDot, { backgroundColor: p.status === 'BUSY' ? COLORS.amber : COLORS.green }]} />
                <Text style={[styles.statusText, { color: p.status === 'BUSY' ? COLORS.amber : COLORS.green }]}>
                  {p.status === 'BUSY' ? 'Occupé' : 'En ligne'}
                </Text>
                <Text style={styles.ordersToday}>{p.ordersToday} cmd</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Selected detail */}
          {selected && (
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>{ROLE_ICON[selected.role]} {selected.name}</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Position</Text>
                <Text style={styles.detailVal}>{selected.lat?.toFixed(4)}° N, {selected.lng?.toFixed(4)}° E</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Statut</Text>
                <Text style={[styles.detailVal, { color: selected.status === 'BUSY' ? COLORS.amber : COLORS.green }]}>
                  {selected.status === 'BUSY' ? 'Occupé' : 'En ligne'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Commandes aujourd'hui</Text>
                <Text style={styles.detailVal}>{selected.ordersToday}</Text>
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
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
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  liveChip: { backgroundColor: '#0D2A1A', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  liveChipText: { color: COLORS.green, fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', padding: 12, gap: 10 },
  statChip: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 10,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statNum: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  statLbl: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 4 },
  filterChip: {
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.surface, borderColor: COLORS.text },
  filterChipText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.text },
  scroll: { padding: 16 },
  mapContainer: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, height: H },
  mapImage: { width: W, height: H },
  mapFallback: {
    height: H, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    borderRadius: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  mapFallbackIcon: { fontSize: 48, marginBottom: 8 },
  mapFallbackText: { color: COLORS.muted, fontSize: 14 },
  legendOverlay: {
    position: 'absolute', bottom: 10, left: 10,
    backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 10, padding: 8, gap: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  sectionLabel: {
    color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4,
    textTransform: 'uppercase', marginBottom: 10,
  },
  providerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  providerRowSelected: { borderColor: COLORS.text },
  providerIcon: { fontSize: 28 },
  providerInfo: { flex: 1 },
  providerName: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  providerRole: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  providerRight: { alignItems: 'flex-end', gap: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '600' },
  ordersToday: { color: COLORS.muted, fontSize: 11 },
  detailCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginTop: 8,
    borderWidth: 1.5, borderColor: COLORS.text, gap: 8,
  },
  detailTitle: { color: COLORS.text, fontSize: 15, fontWeight: '800', marginBottom: 4 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailKey: { color: COLORS.muted, fontSize: 13 },
  detailVal: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
});
