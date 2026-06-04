import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_PROVIDERS = [
  { id: 'P1', name: 'Mohamed A.', type: 'TAXI', status: 'BUSY', lat: 36.8185, lng: 10.1658, trip: 'Lac 1 → Menzah' },
  { id: 'P2', name: 'Sami K.', type: 'LIVREUR', status: 'ONLINE', lat: 36.8541, lng: 10.1942, trip: null },
  { id: 'P3', name: 'Nour B.', type: 'TAXI', status: 'ONLINE', lat: 36.8320, lng: 10.2100, trip: null },
  { id: 'P4', name: 'Karim M.', type: 'DEPANNEUR', status: 'BUSY', lat: 36.8600, lng: 10.1800, trip: 'Intervention A1' },
  { id: 'P5', name: 'Ahmed T.', type: 'TAXI', status: 'ONLINE', lat: 36.7950, lng: 10.1750, trip: null },
  { id: 'P6', name: 'Rim S.', type: 'LIVREUR', status: 'BUSY', lat: 36.8450, lng: 10.2050, trip: 'KFC → Lafayette' },
];

const TYPE_ICONS = { TAXI: '🚕', LIVREUR: '📦', DEPANNEUR: '🔧' };
const TYPE_FILTERS = ['Tous', 'TAXI', 'LIVREUR', 'DEPANNEUR'];
const STATUS_COLORS = { ONLINE: COLORS.green, BUSY: COLORS.orange, OFFLINE: COLORS.muted };

export default function AdminLiveMapScreen({ navigation }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tous');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    api.get('/api/admin/live/providers')
      .then(r => setProviders(r.data.providers || MOCK_PROVIDERS))
      .catch(() => setProviders(MOCK_PROVIDERS))
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 15000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = filter === 'Tous' ? providers : providers.filter(p => p.type === filter);
  const onlineCount = providers.filter(p => p.status === 'ONLINE').length;
  const busyCount = providers.filter(p => p.status === 'BUSY').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🗺️ Carte en direct</Text>
        <TouchableOpacity onPress={() => load(true)} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: COLORS.green }]} />
          <Text style={styles.statText}>{onlineCount} en ligne</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: COLORS.orange }]} />
          <Text style={styles.statText}>{busyCount} occupés</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statText}>Total : {providers.length}</Text>
        </View>
      </View>

      <View style={styles.mapPlaceholder}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>🗺️</Text>
        <Text style={styles.mapTitle}>Carte interactive</Text>
        <Text style={styles.mapSub}>Vue satellite des prestataires en temps réel</Text>
        <View style={styles.mapPins}>
          {filtered.map(p => (
            <View key={p.id} style={[styles.pin, { backgroundColor: STATUS_COLORS[p.status] + '30', borderColor: STATUS_COLORS[p.status] }]}>
              <Text style={{ fontSize: 14 }}>{TYPE_ICONS[p.type]}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.filterRow}>
        {TYPE_FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} style={{ marginTop: 20 }} />
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.map(p => (
            <View key={p.id} style={styles.providerRow}>
              <View style={[styles.providerAvatar, { backgroundColor: STATUS_COLORS[p.status] + '20' }]}>
                <Text style={{ fontSize: 18 }}>{TYPE_ICONS[p.type]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.providerName}>{p.name}</Text>
                {p.trip ? (
                  <Text style={styles.providerTrip}>🔄 {p.trip}</Text>
                ) : (
                  <Text style={[styles.providerTrip, { color: COLORS.green }]}>✓ Disponible</Text>
                )}
              </View>
              <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS[p.status] + '20', borderColor: STATUS_COLORS[p.status] + '50' }]}>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[p.status] }]} />
                <Text style={[styles.statusLabel, { color: STATUS_COLORS[p.status] }]}>
                  {p.status === 'ONLINE' ? 'Libre' : p.status === 'BUSY' ? 'Occupé' : 'Hors ligne'}
                </Text>
              </View>
            </View>
          ))}
          <View style={{ height: 20 }} />
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
  backBtn: { padding: 4 },
  backText: { color: COLORS.accent, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  refreshBtn: { padding: 8 },
  refreshText: { color: COLORS.accent, fontSize: 22, fontWeight: '700' },
  statsBar: {
    flexDirection: 'row', gap: 16, paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statDot: { width: 8, height: 8, borderRadius: 4 },
  statText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  mapPlaceholder: {
    height: 200, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  mapTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  mapSub: { color: COLORS.muted, fontSize: 12, marginBottom: 12 },
  mapPins: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  pin: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  filterRow: { flexDirection: 'row', gap: 8, padding: 12, paddingBottom: 8 },
  filterBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 7, alignItems: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  filterBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  filterText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: COLORS.accent },
  list: { flex: 1 },
  providerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  providerAvatar: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  providerName: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  providerTrip: { color: COLORS.muted, fontSize: 12 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 11, fontWeight: '700' },
});
