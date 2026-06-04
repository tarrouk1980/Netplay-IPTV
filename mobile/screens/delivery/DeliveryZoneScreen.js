import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const ZONES = [
  {
    id: 'tunis_centre', name: 'Tunis Centre', demand: 'high', active: true,
    deliveries: 412, avgFare: 7.20, surgeActive: false, surgeMultiplier: 1.0,
    merchants: 28,
  },
  {
    id: 'la_marsa', name: 'La Marsa', demand: 'medium', active: true,
    deliveries: 287, avgFare: 9.50, surgeActive: true, surgeMultiplier: 1.3,
    merchants: 19,
  },
  {
    id: 'ariana', name: 'Ariana', demand: 'high', active: true,
    deliveries: 341, avgFare: 6.80, surgeActive: false, surgeMultiplier: 1.0,
    merchants: 22,
  },
  {
    id: 'ben_arous', name: 'Ben Arous', demand: 'low', active: false,
    deliveries: 98, avgFare: 8.00, surgeActive: false, surgeMultiplier: 1.0,
    merchants: 11,
  },
  {
    id: 'soukra', name: 'Route de Soukra', demand: 'medium', active: true,
    deliveries: 178, avgFare: 7.90, surgeActive: false, surgeMultiplier: 1.0,
    merchants: 14,
  },
];

const DEMAND_META = {
  high:   { label: 'Forte demande', color: COLORS.green },
  medium: { label: 'Demande modérée', color: COLORS.orange },
  low:    { label: 'Faible demande', color: COLORS.muted },
};

export default function DeliveryZoneScreen({ navigation }) {
  const [zones, setZones] = useState(ZONES);
  const [selected, setSelected] = useState(null);

  const toggleZone = (id) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, active: !z.active } : z));
  };

  const toggleSurge = (id) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, surgeActive: !z.surgeActive } : z));
  };

  const totalDeliveries = zones.filter(z => z.active).reduce((s, z) => s + z.deliveries, 0);
  const activeZones = zones.filter(z => z.active).length;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Zones de livraison</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryVal, { color: COLORS.green }]}>{activeZones}</Text>
          <Text style={styles.summaryLbl}>Zones actives</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryVal, { color: COLORS.accent }]}>{totalDeliveries.toLocaleString()}</Text>
          <Text style={styles.summaryLbl}>Livraisons (7j)</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryVal, { color: COLORS.orange }]}>{zones.filter(z => z.surgeActive).length}</Text>
          <Text style={styles.summaryLbl}>En surge</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {zones.map(z => {
          const demandMeta = DEMAND_META[z.demand];
          const isSelected = selected === z.id;
          return (
            <TouchableOpacity
              key={z.id}
              style={[styles.zoneCard, !z.active && { opacity: 0.6 }, z.surgeActive && { borderColor: COLORS.orange + '88' }]}
              onPress={() => setSelected(isSelected ? null : z.id)}
              activeOpacity={0.85}
            >
              <View style={styles.zoneTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.zoneName}>{z.name}</Text>
                  <View style={styles.demandRow}>
                    <View style={[styles.demandDot, { backgroundColor: demandMeta.color }]} />
                    <Text style={[styles.demandText, { color: demandMeta.color }]}>{demandMeta.label}</Text>
                    {z.surgeActive && (
                      <View style={styles.surgePill}>
                        <Text style={styles.surgeText}>⚡ x{z.surgeMultiplier.toFixed(1)}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Switch
                  value={z.active}
                  onValueChange={() => toggleZone(z.id)}
                  trackColor={{ true: COLORS.green }}
                />
              </View>

              <View style={styles.zoneStats}>
                <Text style={styles.zoneStat}>📦 {z.deliveries} livraisons</Text>
                <Text style={styles.zoneStat}>💰 {z.avgFare.toFixed(2)} TND moy.</Text>
                <Text style={styles.zoneStat}>🍕 {z.merchants} marchands</Text>
              </View>

              {isSelected && z.active && (
                <View style={styles.zoneDetail}>
                  <View style={styles.surgeRow}>
                    <View>
                      <Text style={styles.surgeLabel}>Mode Surge</Text>
                      <Text style={styles.surgeSub}>Majoration tarifaire en période de forte demande</Text>
                    </View>
                    <Switch
                      value={z.surgeActive}
                      onValueChange={() => toggleSurge(z.id)}
                      trackColor={{ true: COLORS.orange }}
                    />
                  </View>
                  {z.surgeActive && (
                    <View style={styles.multiplierRow}>
                      {[1.2, 1.3, 1.5, 2.0].map(m => (
                        <TouchableOpacity
                          key={m}
                          style={[styles.multChip, z.surgeMultiplier === m && styles.multChipActive]}
                          onPress={() => setZones(prev => prev.map(zz => zz.id === z.id ? { ...zz, surgeMultiplier: m } : zz))}
                        >
                          <Text style={[styles.multText, z.surgeMultiplier === m && { color: '#000' }]}>x{m.toFixed(1)}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
  summaryRow: { flexDirection: 'row', gap: 8, padding: 16 },
  summaryCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  summaryVal: { fontSize: 20, fontWeight: '900', marginBottom: 2 },
  summaryLbl: { color: COLORS.muted, fontSize: 10 },
  zoneCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  zoneTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  zoneName: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  demandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  demandDot: { width: 7, height: 7, borderRadius: 3.5 },
  demandText: { fontSize: 12, fontWeight: '600' },
  surgePill: { backgroundColor: COLORS.orange + '22', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: COLORS.orange },
  surgeText: { color: COLORS.orange, fontSize: 10, fontWeight: '800' },
  zoneStats: { flexDirection: 'row', gap: 12 },
  zoneStat: { color: COLORS.muted, fontSize: 12 },
  zoneDetail: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  surgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  surgeLabel: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  surgeSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  multiplierRow: { flexDirection: 'row', gap: 8 },
  multChip: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border },
  multChipActive: { backgroundColor: COLORS.orange, borderColor: COLORS.orange },
  multText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
});
