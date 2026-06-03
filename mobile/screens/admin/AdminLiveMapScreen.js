import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapboxWebView from '../../components/MapboxWebView';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
  green: '#2ECC71',
  red: '#E74C3C',
  yellow: '#F1C40F',
  blue: '#3498DB',
};

const MOCK_PROVIDERS = [
  { id: '1', name: 'Ahmed Ben Ali',    role: '🚕', type: 'taxi',      status: 'En ligne',   position: 'Lac 1, Tunis',        coords: [10.2245, 36.8320], lastUpdate: 'Il y a 1 min' },
  { id: '2', name: 'Mohamed Trabelsi', role: '🛻', type: 'depanneur', status: 'Disponible', position: 'Ariana Centre',       coords: [10.1933, 36.8665], lastUpdate: 'Il y a 2 min' },
  { id: '3', name: 'Sami Gharbi',      role: '🛵', type: 'livreur',   status: 'En livraison', position: "Bab El Bhar",       coords: [10.1720, 36.7990], lastUpdate: 'Il y a 30 s'  },
  { id: '4', name: 'Youssef Maalej',   role: '🚕', type: 'taxi',      status: 'En course',  position: 'Les Berges du Lac',   coords: [10.2390, 36.8417], lastUpdate: 'Il y a 3 min' },
  { id: '5', name: 'Khalil Ayari',     role: '🛻', type: 'depanneur', status: 'En intervention', position: 'Manouba',       coords: [10.0997, 36.8098], lastUpdate: 'Il y a 5 min' },
  { id: '6', name: 'Rami Chaabane',    role: '🛵', type: 'livreur',   status: 'En ligne',   position: 'La Marsa',            coords: [10.3227, 36.8876], lastUpdate: 'Il y a 1 min' },
  { id: '7', name: 'Nizar Bouaziz',    role: '🚕', type: 'taxi',      status: 'En ligne',   position: 'Tunis Centre',        coords: [10.1815, 36.8065], lastUpdate: 'Il y a 4 min' },
  { id: '8', name: 'Fathi Khelil',     role: '🛻', type: 'depanneur', status: 'Disponible', position: 'Ben Arous',           coords: [10.2261, 36.7530], lastUpdate: 'Il y a 2 min' },
];

const MARKERS = MOCK_PROVIDERS.map((p) => ({
  coordinates: p.coords,
  title: p.name,
  emoji: p.role,
}));

const FILTERS = [
  { key: 'all',       label: 'Tous' },
  { key: 'taxi',      label: 'Taxis' },
  { key: 'livreur',   label: 'Livreurs' },
  { key: 'depanneur', label: "Dépanneurs" },
  { key: 'sos',       label: 'SOS actifs' },
];

function getStatusColor(status) {
  if (status === 'En ligne' || status === 'Disponible') return COLORS.green;
  if (status === 'En course' || status === 'En livraison' || status === 'En intervention') return COLORS.yellow;
  return COLORS.muted;
}

export default function AdminLiveMapScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const taxis      = MOCK_PROVIDERS.filter((p) => p.type === 'taxi').length;
  const livreurs   = MOCK_PROVIDERS.filter((p) => p.type === 'livreur').length;
  const depanneurs = MOCK_PROVIDERS.filter((p) => p.type === 'depanneur').length;

  const filteredProviders = activeFilter === 'all' || activeFilter === 'sos'
    ? MOCK_PROVIDERS
    : MOCK_PROVIDERS.filter((p) => p.type === activeFilter);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carte en direct</Text>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stats Overlay */}
        <View style={styles.statsOverlay}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🚕</Text>
            <Text style={styles.statValue}>{taxis}</Text>
            <Text style={styles.statLabel}>Taxis</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🛵</Text>
            <Text style={styles.statValue}>{livreurs}</Text>
            <Text style={styles.statLabel}>Livreurs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🛻</Text>
            <Text style={styles.statValue}>{depanneurs}</Text>
            <Text style={styles.statLabel}>Dépanneurs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>📍</Text>
            <Text style={styles.statValue}>{MOCK_PROVIDERS.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapboxWebView
            centerCoordinate={[10.1815, 36.8065]}
            zoom={12}
            markers={MARKERS}
            style={styles.map}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text style={[styles.filterChipText, activeFilter === f.key && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Providers List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Prestataires actifs</Text>
          <Text style={styles.sectionCount}>{filteredProviders.length}</Text>
        </View>

        {filteredProviders.map((provider) => (
          <View key={provider.id} style={styles.providerCard}>
            <View style={styles.providerLeft}>
              <Text style={styles.providerEmoji}>{provider.role}</Text>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{provider.name}</Text>
                <Text style={styles.providerPosition}>📍 {provider.position}</Text>
                <Text style={styles.providerUpdate}>Mis à jour: {provider.lastUpdate}</Text>
              </View>
            </View>
            <View style={styles.providerRight}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(provider.status) + '22' }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(provider.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(provider.status) }]}>
                  {provider.status}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backArrow: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.red + '22',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.red,
    marginRight: 4,
  },
  liveText: {
    color: COLORS.red,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  statsOverlay: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  mapContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    height: 280,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  map: {
    flex: 1,
  },
  filtersRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionCount: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  providerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  providerPosition: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 2,
  },
  providerUpdate: {
    color: COLORS.muted,
    fontSize: 11,
  },
  providerRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
