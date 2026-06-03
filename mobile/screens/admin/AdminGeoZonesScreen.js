import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22', purple: '#9B59B6',
};

const MOCK_ZONES = [
  { id: 1, name: 'Tunis Centre', color: '#27AE60', active: true, surgeActive: false, surgeMultiplier: 1.0, driversOnline: 42, activeRides: 18, coverage: 'Médina, Bab Bhar, Lafayette' },
  { id: 2, name: 'La Marsa', color: '#3498DB', active: true, surgeActive: true, surgeMultiplier: 1.5, driversOnline: 14, activeRides: 6, coverage: 'Sidi Bou Saïd, Gammarth' },
  { id: 3, name: 'Ariana', color: '#9B59B6', active: true, surgeActive: false, surgeMultiplier: 1.0, driversOnline: 22, activeRides: 9, coverage: 'Menzah, Soukra, Raoued' },
  { id: 4, name: 'Ben Arous', color: '#E67E22', active: true, surgeActive: false, surgeMultiplier: 1.0, driversOnline: 18, activeRides: 7, coverage: 'Hammam Lif, Radès, Mégrine' },
  { id: 5, name: 'Manouba', color: '#E74C3C', active: false, surgeActive: false, surgeMultiplier: 1.0, driversOnline: 5, activeRides: 1, coverage: 'Oued Ellil, Denden' },
  { id: 6, name: 'Carthage / Aéroport', color: '#F5A623', active: true, surgeActive: true, surgeMultiplier: 2.0, driversOnline: 8, activeRides: 3, coverage: 'Aéroport, Cité Mahrajène' },
];

export default function AdminGeoZonesScreen({ navigation }) {
  const [zones, setZones] = useState(MOCK_ZONES);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const toggleZone = (id) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, active: !z.active } : z));
  };

  const toggleSurge = (id) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, surgeActive: !z.surgeActive } : z));
  };

  const setSurge = (id, val) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 1 && n <= 5) {
      setZones(prev => prev.map(z => z.id === id ? { ...z, surgeMultiplier: n } : z));
    }
  };

  const filtered = zones.filter(z =>
    !search || z.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = zones.filter(z => z.active).length;
  const surgeCount = zones.filter(z => z.surgeActive).length;
  const totalDrivers = zones.reduce((s, z) => s + z.driversOnline, 0);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion des zones</Text>
        <TouchableOpacity onPress={() => Alert.alert('Exporter', 'Export zones en CSV bientôt disponible.')}>
          <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '600' }}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Global KPIs */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiNum}>{activeCount}</Text>
          <Text style={styles.kpiLbl}>Zones actives</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiNum, { color: COLORS.orange }]}>{surgeCount}</Text>
          <Text style={styles.kpiLbl}>En surcharge</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiNum, { color: COLORS.green }]}>{totalDrivers}</Text>
          <Text style={styles.kpiLbl}>Chauf. en ligne</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Text style={{ color: COLORS.muted, fontSize: 16 }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une zone..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapBox}>
        <Text style={{ fontSize: 36, marginBottom: 8 }}>🗺️</Text>
        <Text style={styles.mapLabel}>Carte des zones EASYWAY</Text>
        <View style={styles.mapLegend}>
          {zones.filter(z => z.active).slice(0, 4).map(z => (
            <View key={z.id} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: z.color }]} />
              <Text style={styles.legendText}>{z.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.zoneList}>
          {filtered.map((zone) => {
            const isSelected = selected === zone.id;
            return (
              <View key={zone.id}>
                <TouchableOpacity
                  style={[styles.zoneCard, !zone.active && styles.zoneCardInactive, isSelected && { borderColor: zone.color }]}
                  onPress={() => setSelected(isSelected ? null : zone.id)}
                >
                  <View style={[styles.zoneColorDot, { backgroundColor: zone.color }]} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.zoneHeader}>
                      <Text style={styles.zoneName}>{zone.name}</Text>
                      {zone.surgeActive && (
                        <View style={styles.surgeBadge}>
                          <Text style={styles.surgeText}>⚡ x{zone.surgeMultiplier.toFixed(1)}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.zoneCoverage} numberOfLines={1}>{zone.coverage}</Text>
                    <View style={styles.zoneStats}>
                      <Text style={styles.zoneStatItem}>👤 {zone.driversOnline} en ligne</Text>
                      <Text style={styles.zoneStatItem}>🚕 {zone.activeRides} courses</Text>
                    </View>
                  </View>
                  <View style={[styles.zoneToggle, zone.active && styles.zoneToggleOn]}>
                    <View style={[styles.zoneThumb, zone.active && styles.zoneThumbOn]} />
                  </View>
                </TouchableOpacity>

                {/* Expanded controls */}
                {isSelected && (
                  <View style={[styles.expandedPanel, { borderColor: zone.color + '55' }]}>
                    <View style={styles.expandedRow}>
                      <Text style={styles.expandedLabel}>Zone active</Text>
                      <TouchableOpacity
                        style={[styles.miniToggle, zone.active && styles.miniToggleOn]}
                        onPress={() => toggleZone(zone.id)}
                      >
                        <View style={[styles.miniThumb, zone.active && styles.miniThumbOn]} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.expandedRow}>
                      <Text style={styles.expandedLabel}>Mode surge</Text>
                      <TouchableOpacity
                        style={[styles.miniToggle, zone.surgeActive && { backgroundColor: COLORS.orange }]}
                        onPress={() => toggleSurge(zone.id)}
                      >
                        <View style={[styles.miniThumb, zone.surgeActive && styles.miniThumbOn]} />
                      </TouchableOpacity>
                    </View>
                    {zone.surgeActive && (
                      <View style={styles.expandedRow}>
                        <Text style={styles.expandedLabel}>Multiplicateur surge</Text>
                        <View style={styles.multiplierRow}>
                          {[1.0, 1.5, 2.0, 2.5, 3.0].map((m) => (
                            <TouchableOpacity
                              key={m}
                              style={[styles.multiplierChip, zone.surgeMultiplier === m && { backgroundColor: COLORS.orange, borderColor: COLORS.orange }]}
                              onPress={() => setSurge(zone.id, m)}
                            >
                              <Text style={[styles.multiplierText, zone.surgeMultiplier === m && { color: '#000' }]}>x{m.toFixed(1)}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.notifyBtn}
                      onPress={() => Alert.alert('Notification envoyée', `Les chauffeurs de ${zone.name} ont été notifiés.`)}
                    >
                      <Text style={styles.notifyBtnText}>🔔 Notifier les chauffeurs de cette zone</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  kpiRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  kpiCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  kpiNum: { color: COLORS.white, fontSize: 22, fontWeight: '900' },
  kpiLbl: { color: COLORS.muted, fontSize: 10, marginTop: 3, textAlign: 'center' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 8, backgroundColor: COLORS.surface,
    borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 8,
  },
  searchInput: { flex: 1, color: COLORS.white, fontSize: 14 },
  mapBox: {
    height: 140, marginHorizontal: 16, marginBottom: 12, borderRadius: 14,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  mapLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 10 },
  mapLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: COLORS.muted, fontSize: 10 },
  zoneList: { paddingHorizontal: 16, gap: 8 },
  zoneCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  zoneCardInactive: { opacity: 0.6 },
  zoneColorDot: { width: 12, height: 12, borderRadius: 6 },
  zoneHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  zoneName: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  surgeBadge: {
    backgroundColor: '#2A1A08', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: COLORS.orange,
  },
  surgeText: { color: COLORS.orange, fontSize: 10, fontWeight: '800' },
  zoneCoverage: { color: COLORS.muted, fontSize: 11, marginBottom: 4 },
  zoneStats: { flexDirection: 'row', gap: 12 },
  zoneStatItem: { color: COLORS.muted, fontSize: 11 },
  zoneToggle: { width: 42, height: 24, borderRadius: 12, backgroundColor: COLORS.border, padding: 2 },
  zoneToggleOn: { backgroundColor: COLORS.green },
  zoneThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.white },
  zoneThumbOn: { alignSelf: 'flex-end' },
  expandedPanel: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 14,
    marginTop: -4, marginBottom: 4, borderWidth: 1, borderColor: COLORS.border,
  },
  expandedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  expandedLabel: { color: COLORS.white, fontSize: 13 },
  miniToggle: { width: 40, height: 22, borderRadius: 11, backgroundColor: COLORS.border, padding: 2 },
  miniToggleOn: { backgroundColor: COLORS.green },
  miniThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.white },
  miniThumbOn: { alignSelf: 'flex-end' },
  multiplierRow: { flexDirection: 'row', gap: 6 },
  multiplierChip: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  multiplierText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  notifyBtn: {
    backgroundColor: COLORS.surface, borderRadius: 10, paddingVertical: 10,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.blue, marginTop: 4,
  },
  notifyBtnText: { color: COLORS.blue, fontSize: 13, fontWeight: '600' },
});
