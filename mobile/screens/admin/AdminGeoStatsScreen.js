import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  accent: '#D32F2F',
  green: '#2E7D32',
  amber: '#F57C00',
  blue: '#1565C0',
};

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ';

const SERVICE_FILTERS = [
  { key: 'ALL',      label: 'Tout',       color: COLORS.muted },
  { key: 'TAXI',     label: 'Taxi',       color: '#F5A623' },
  { key: 'SOS',      label: 'SOS',        color: '#E74C3C' },
  { key: 'DELIVERY', label: 'Livraison',  color: '#27AE60' },
  { key: 'GROCERY',  label: 'Courses',    color: '#3498DB' },
];

const PIN_COLORS = { TAXI: 'F5A623', SOS: 'E74C3C', DELIVERY: '27AE60', GROCERY: '3498DB', ALL: 'D32F2F' };

// Tunisian zones with approximate centers
const ZONES = [
  { key: 'tunis_center', label: 'Tunis Centre',    lat: 36.8065, lng: 10.1815 },
  { key: 'lac',          label: 'Les Berges du Lac', lat: 36.833, lng: 10.237 },
  { key: 'ariana',       label: 'Ariana',           lat: 36.860, lng: 10.193 },
  { key: 'soukra',       label: 'La Soukra',        lat: 36.878, lng: 10.176 },
  { key: 'manouba',      label: 'Manouba',          lat: 36.808, lng: 10.098 },
  { key: 'ben_arous',    label: 'Ben Arous',        lat: 36.753, lng: 10.222 },
  { key: 'hammam_lif',   label: 'Hammam-Lif',       lat: 36.726, lng: 10.333 },
  { key: 'ennasr',       label: 'Ennasr',           lat: 36.877, lng: 10.216 },
];

const MOCK_ZONES = ZONES.map((z, i) => ({
  ...z,
  orders: Math.floor(Math.random() * 80 + 10),
  revenue: Math.floor(Math.random() * 500 + 50),
  taxi: Math.floor(Math.random() * 40),
  sos: Math.floor(Math.random() * 10),
  delivery: Math.floor(Math.random() * 20),
  grocery: Math.floor(Math.random() * 15),
}));

function buildMapUrl(zones, serviceFilter) {
  const pinColor = PIN_COLORS[serviceFilter] || PIN_COLORS.ALL;
  const pins = zones.slice(0, 8).map(z => `pin-s+${pinColor}(${z.lng},${z.lat})`).join(',');
  return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${pins}/10.1815,36.8065,10/340x220@2x?access_token=${MAPBOX_TOKEN}`;
}

function ZoneBar({ zone, maxOrders, serviceFilter }) {
  const val = serviceFilter === 'ALL' ? zone.orders
    : serviceFilter === 'TAXI' ? zone.taxi
    : serviceFilter === 'SOS' ? zone.sos
    : serviceFilter === 'DELIVERY' ? zone.delivery
    : zone.grocery;
  const pct = maxOrders > 0 ? Math.max(4, (val / maxOrders) * 100) : 4;
  const cfg = SERVICE_FILTERS.find(f => f.key === serviceFilter) || SERVICE_FILTERS[0];
  const color = serviceFilter === 'ALL' ? COLORS.accent : cfg.color;

  return (
    <View style={styles.zoneRow}>
      <Text style={styles.zoneLabel} numberOfLines={1}>{zone.label}</Text>
      <View style={styles.zoneBarTrack}>
        <View style={[styles.zoneBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.zoneCount, { color }]}>{val}</Text>
    </View>
  );
}

export default function AdminGeoStatsScreen({ navigation }) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [mapError, setMapError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/stats/geo');
      setZones(res.data?.zones || MOCK_ZONES);
    } catch {
      setZones(MOCK_ZONES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const sortedZones = [...zones].sort((a, b) => {
    const valA = serviceFilter === 'ALL' ? a.orders : serviceFilter === 'TAXI' ? a.taxi : serviceFilter === 'SOS' ? a.sos : serviceFilter === 'DELIVERY' ? a.delivery : a.grocery;
    const valB = serviceFilter === 'ALL' ? b.orders : serviceFilter === 'TAXI' ? b.taxi : serviceFilter === 'SOS' ? b.sos : serviceFilter === 'DELIVERY' ? b.delivery : b.grocery;
    return valB - valA;
  });

  const maxOrders = sortedZones.length > 0
    ? Math.max(...sortedZones.map(z => serviceFilter === 'ALL' ? z.orders : serviceFilter === 'TAXI' ? z.taxi : serviceFilter === 'SOS' ? z.sos : serviceFilter === 'DELIVERY' ? z.delivery : z.grocery))
    : 1;

  const totalOrders = zones.reduce((s, z) => s + z.orders, 0);
  const totalRevenue = zones.reduce((s, z) => s + z.revenue, 0);
  const topZone = sortedZones[0];

  const mapUrl = !mapError ? buildMapUrl(sortedZones, serviceFilter) : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🗺️ Statistiques géo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.accent} />}
      >
        {/* KPI Row */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiNum}>{totalOrders}</Text>
            <Text style={styles.kpiLabel}>Commandes totales</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiNum, { color: COLORS.green }]}>{totalRevenue.toFixed(0)} TND</Text>
            <Text style={styles.kpiLabel}>Revenus</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiNum, { color: COLORS.amber }]}>{zones.length}</Text>
            <Text style={styles.kpiLabel}>Zones actives</Text>
          </View>
        </View>

        {/* Top zone banner */}
        {topZone && (
          <View style={styles.topZoneBanner}>
            <Text style={styles.topZoneIcon}>🏆</Text>
            <View>
              <Text style={styles.topZoneTitle}>Zone la plus active</Text>
              <Text style={styles.topZoneName}>{topZone.label}</Text>
              <Text style={styles.topZoneSub}>{topZone.orders} commandes · {topZone.revenue} TND</Text>
            </View>
          </View>
        )}

        {/* Map */}
        <View style={styles.mapContainer}>
          {mapUrl ? (
            <Image source={{ uri: mapUrl }} style={styles.mapImage} onError={() => setMapError(true)} resizeMode="cover" />
          ) : (
            <View style={styles.mapFallback}>
              <Text style={{ fontSize: 40 }}>🗺️</Text>
              <Text style={{ color: COLORS.muted, marginTop: 8 }}>Carte des zones</Text>
            </View>
          )}
        </View>

        {/* Service filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {SERVICE_FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, serviceFilter === f.key && { borderColor: f.color, backgroundColor: f.color + '18' }]}
              onPress={() => { setServiceFilter(f.key); setMapError(false); }}
            >
              <Text style={[styles.filterChipText, serviceFilter === f.key && { color: f.color }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Zone bars */}
        <View style={styles.zonesCard}>
          <Text style={styles.zonesTitle}>
            Classement par zone — {SERVICE_FILTERS.find(f => f.key === serviceFilter)?.label}
          </Text>
          {loading ? (
            <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 20 }} />
          ) : (
            sortedZones.map(zone => (
              <ZoneBar key={zone.key} zone={zone} maxOrders={maxOrders} serviceFilter={serviceFilter} />
            ))
          )}
        </View>

        {/* Breakdown table */}
        <View style={styles.tableCard}>
          <Text style={styles.zonesTitle}>Détail par service</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Zone</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>🚕</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>🛻</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>🛵</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>🛒</Text>
          </View>
          {sortedZones.map(z => (
            <View key={z.key} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, color: COLORS.text, fontSize: 12 }]} numberOfLines={1}>{z.label}</Text>
              <Text style={[styles.tableCell, { color: '#F5A623' }]}>{z.taxi}</Text>
              <Text style={[styles.tableCell, { color: '#E74C3C' }]}>{z.sos}</Text>
              <Text style={[styles.tableCell, { color: '#27AE60' }]}>{z.delivery}</Text>
              <Text style={[styles.tableCell, { color: '#3498DB' }]}>{z.grocery}</Text>
            </View>
          ))}
        </View>

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
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  scroll: { padding: 16 },
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  kpiCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  kpiNum: { color: COLORS.text, fontSize: 20, fontWeight: '900' },
  kpiLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2, textAlign: 'center' },
  topZoneBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.amber, marginBottom: 14,
  },
  topZoneIcon: { fontSize: 28 },
  topZoneTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  topZoneName: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  topZoneSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  mapContainer: { borderRadius: 14, overflow: 'hidden', height: 220, marginBottom: 14 },
  mapImage: { width: '100%', height: 220 },
  mapFallback: { height: 220, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1, borderColor: COLORS.border },
  filterScroll: { marginBottom: 14 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, marginRight: 8,
  },
  filterChipText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  zonesCard: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 14 },
  zonesTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  zoneLabel: { color: COLORS.text, fontSize: 12, width: 90 },
  zoneBarTrack: { flex: 1, height: 10, backgroundColor: COLORS.border, borderRadius: 5, overflow: 'hidden' },
  zoneBarFill: { height: 10, borderRadius: 5 },
  zoneCount: { fontSize: 12, fontWeight: '700', width: 28, textAlign: 'right' },
  tableCard: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 14 },
  tableHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 6 },
  tableHeaderText: { color: COLORS.muted, fontSize: 11, fontWeight: '700' },
  tableRow: { flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: COLORS.border + '88' },
  tableCell: { flex: 1, fontSize: 12, fontWeight: '600', color: COLORS.muted, textAlign: 'center' },
});
