import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  orange: '#F57C00',
  green: '#27AE60',
  accent: '#D32F2F',
  blue: '#1565C0',
  teal: '#00838F',
};

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ';

const ROLE_ICONS = {
  CHAUFFEUR: { icon: '🚕', color: COLORS.orange },
  LIVREUR: { icon: '🛵', color: COLORS.green },
  DEPANNEUR: { icon: '🛻', color: COLORS.accent },
};

function PulseDot({ color, size = 10 }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.5, duration: 700, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, transform: [{ scale }] }} />;
}

export default function AdminMapOverviewScreen({ navigation }) {
  const [providers, setProviders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(false);

  const load = useCallback(async (silent = false) => {
    try {
      const [pRes, oRes] = await Promise.all([
        api.get('/api/admin/providers/online'),
        api.get('/api/admin/orders/live'),
      ]);
      setProviders(pRes.data.providers || []);
      setOrders(oRes.data.orders || []);
      setLastUpdated(new Date());
      setError(false);
    } catch {
      if (!silent) setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(() => load(true), 10000);
    return () => clearInterval(iv);
  }, [load]);

  const onlineProviders = providers.filter((p) => p.status !== 'OFFLINE');
  const busyProviders = providers.filter((p) => p.status === 'BUSY');
  const filteredProviders = filter === 'ALL' ? providers : providers.filter((p) => p.role === filter);

  // Build Mapbox static map with provider pins
  const pinParts = [
    ...providers.slice(0, 8).map((p) => {
      const colorHex = ROLE_ICONS[p.role]?.color?.replace('#', '') || 'f57c00';
      return `pin-s+${colorHex}(${p.lng},${p.lat})`;
    }),
    ...orders.slice(0, 4).map((o) => `pin-s+ffffff(${o.lng},${o.lat})`),
  ].join(',');

  const centerLng = 10.18;
  const centerLat = 36.82;
  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${pinParts}/${centerLng},${centerLat},10/700x320@2x?access_token=${MAPBOX_TOKEN}`;

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.green} size="large" /></View>;

  if (error) {
    return (
      <SafeAreaView style={[s.root, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ color: COLORS.muted, textAlign: 'center', marginBottom: 16 }}>
          Impossible de charger la carte globale. Réessayez.
        </Text>
        <TouchableOpacity onPress={() => load(false)} style={{ backgroundColor: COLORS.orange, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 }}>
          <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <PulseDot color={COLORS.green} size={8} />
            <Text style={s.title}>Vue carte globale</Text>
          </View>
          <Text style={s.sub}>{lastUpdated ? `MàJ ${lastUpdated.toLocaleTimeString('fr-TN')}` : '...'}</Text>
        </View>
        <TouchableOpacity onPress={() => load(false)}>
          <Text style={s.refresh}>↺</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <PulseDot color={COLORS.green} size={8} />
            <Text style={[s.statVal, { color: COLORS.green }]}>{onlineProviders.length}</Text>
            <Text style={s.statLbl}>En ligne</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statVal, { color: COLORS.orange }]}>{busyProviders.length}</Text>
            <Text style={s.statLbl}>En course</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statVal, { color: COLORS.accent }]}>{orders.filter((o) => o.status === 'PENDING').length}</Text>
            <Text style={s.statLbl}>En attente</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statVal, { color: COLORS.blue }]}>{orders.length}</Text>
            <Text style={s.statLbl}>Commandes</Text>
          </View>
        </View>

        {/* Map image */}
        <View style={s.mapContainer}>
          <Animated.Image
            source={{ uri: mapUrl }}
            style={s.map}
            resizeMode="cover"
          />
          <View style={s.mapLegend}>
            {Object.entries(ROLE_ICONS).map(([role, cfg]) => (
              <View key={role} style={s.legendItem}>
                <Text style={{ fontSize: 12 }}>{cfg.icon}</Text>
                <Text style={[s.legendTxt, { color: cfg.color }]}>{role.charAt(0) + role.slice(1).toLowerCase()}</Text>
              </View>
            ))}
            <View style={s.legendItem}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFF' }} />
              <Text style={s.legendTxt}>Commande</Text>
            </View>
          </View>
        </View>

        {/* Role filter */}
        <View style={s.filterRow}>
          {['ALL', 'CHAUFFEUR', 'LIVREUR', 'DEPANNEUR'].map((f) => {
            const cfg = ROLE_ICONS[f];
            const count = f === 'ALL' ? providers.length : providers.filter((p) => p.role === f).length;
            return (
              <TouchableOpacity
                key={f}
                style={[s.filterTab, filter === f && s.filterTabActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[s.filterTxt, filter === f && { color: COLORS.orange }]}>
                  {cfg ? cfg.icon : '👥'} {count}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Provider list */}
        <View style={{ paddingHorizontal: 16 }}>
          {filteredProviders.map((p) => {
            const cfg = ROLE_ICONS[p.role] || { icon: '👤', color: COLORS.muted };
            const statusColor = p.status === 'ONLINE' ? COLORS.green : p.status === 'BUSY' ? COLORS.orange : COLORS.muted;
            return (
              <View key={p.id} style={s.providerRow}>
                <Text style={{ fontSize: 18 }}>{cfg.icon}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.providerName}>{p.name}</Text>
                  <Text style={[s.providerStatus, { color: statusColor }]}>
                    ● {p.status === 'ONLINE' ? 'Disponible' : p.status === 'BUSY' ? 'En course' : 'Hors ligne'}
                  </Text>
                </View>
                <View style={[s.roleBadge, { borderColor: cfg.color }]}>
                  <Text style={[s.roleTxt, { color: cfg.color }]}>{p.role.charAt(0) + p.role.slice(1).toLowerCase()}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  sub: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  refresh: { color: COLORS.orange, fontSize: 22 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, padding: 10, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: COLORS.border },
  statVal: { fontSize: 18, fontWeight: '800' },
  statLbl: { color: COLORS.muted, fontSize: 9, textAlign: 'center' },
  mapContainer: { height: 260, marginHorizontal: 16, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  map: { width: '100%', height: '100%' },
  mapLegend: { position: 'absolute', bottom: 10, left: 10, flexDirection: 'row', gap: 10, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendTxt: { color: COLORS.muted, fontSize: 9, fontWeight: '600' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10, gap: 6 },
  filterTab: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  filterTabActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orange + '22' },
  filterTxt: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  providerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  providerName: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  providerStatus: { fontSize: 11, marginTop: 2 },
  roleBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  roleTxt: { fontSize: 10, fontWeight: '700' },
});
