import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const ZONES = [
  { id: 'Z1', name: 'Grand Tunis', cities: ['Tunis', 'Ariana', 'Ben Arous', 'Manouba'], active: true, drivers: 124, orders: 892, coverage: 98 },
  { id: 'Z2', name: 'Sfax', cities: ['Sfax Ville', 'Sakiet Ezzit', 'El Aïn'], active: true, drivers: 42, orders: 214, coverage: 85 },
  { id: 'Z3', name: 'Sousse', cities: ['Sousse', 'Hammam Sousse', 'Monastir'], active: true, drivers: 38, orders: 176, coverage: 80 },
  { id: 'Z4', name: 'Bizerte', cities: ['Bizerte', 'Menzel Bourguiba'], active: false, drivers: 8, orders: 21, coverage: 40 },
  { id: 'Z5', name: 'Nabeul', cities: ['Nabeul', 'Hammamet', 'Kelibia'], active: true, drivers: 19, orders: 88, coverage: 65 },
  { id: 'Z6', name: 'Gabès', cities: ['Gabès', 'El Hamma'], active: false, drivers: 3, orders: 5, coverage: 20 },
];

export default function AdminZonesScreen({ navigation }) {
  const [zones, setZones] = useState(ZONES);

  const toggleZone = (id) => {
    const zone = zones.find(z => z.id === id);
    Alert.alert(
      zone.active ? 'Désactiver la zone' : 'Activer la zone',
      `${zone.active ? 'Désactiver' : 'Activer'} la zone "${zone.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => setZones(prev => prev.map(z => z.id === id ? { ...z, active: !z.active } : z)) },
      ]
    );
  };

  const activeZones = zones.filter(z => z.active).length;
  const totalDrivers = zones.reduce((s, z) => s + z.drivers, 0);
  const totalOrders = zones.reduce((s, z) => s + z.orders, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🗺️ Zones de couverture</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.kpiRow}>
          {[
            { label: 'Zones actives', value: `${activeZones}/${zones.length}`, color: COLORS.green },
            { label: 'Chauffeurs', value: totalDrivers, color: COLORS.accent },
            { label: 'Commandes/mois', value: totalOrders, color: COLORS.blue },
          ].map(k => (
            <View key={k.label} style={styles.kpiBox}>
              <Text style={[styles.kpiVal, { color: k.color }]}>{k.value}</Text>
              <Text style={styles.kpiLabel}>{k.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>TOUTES LES ZONES</Text>
        {zones.map(z => (
          <View key={z.id} style={[styles.zoneCard, !z.active && { opacity: 0.6 }]}>
            <View style={styles.zoneTop}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.zoneName}>{z.name}</Text>
                  <View style={[styles.zoneBadge, { backgroundColor: z.active ? COLORS.green + '20' : COLORS.red + '20' }]}>
                    <Text style={[styles.zoneBadgeText, { color: z.active ? COLORS.green : COLORS.red }]}>
                      {z.active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.zoneCities}>{z.cities.join(' · ')}</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleBtn, { backgroundColor: z.active ? COLORS.red + '15' : COLORS.green + '15', borderColor: z.active ? COLORS.red + '40' : COLORS.green + '40' }]}
                onPress={() => toggleZone(z.id)}
              >
                <Text style={{ color: z.active ? COLORS.red : COLORS.green, fontSize: 12, fontWeight: '700' }}>
                  {z.active ? '⏸ Pause' : '▶ Activer'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.zoneStats}>
              <Text style={styles.zoneStat}>🚗 {z.drivers} chauffeurs</Text>
              <Text style={styles.zoneStat}>📦 {z.orders} commandes</Text>
            </View>

            <View style={styles.coverageRow}>
              <View style={styles.coverageBg}>
                <View style={[styles.coverageFill, { width: `${z.coverage}%`, backgroundColor: z.coverage > 70 ? COLORS.green : z.coverage > 40 ? COLORS.orange : COLORS.red }]} />
              </View>
              <Text style={styles.coverageLabel}>{z.coverage}% couverture</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4, width: 36 },
  backIcon: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  kpiBox: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  kpiVal: { fontSize: 18, fontWeight: '900' },
  kpiLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  zoneCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  zoneTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  zoneName: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  zoneBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  zoneBadgeText: { fontSize: 10, fontWeight: '700' },
  zoneCities: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  toggleBtn: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
  zoneStats: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  zoneStat: { color: COLORS.muted, fontSize: 12 },
  coverageRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  coverageBg: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  coverageFill: { height: 6, borderRadius: 3 },
  coverageLabel: { color: COLORS.muted, fontSize: 11, width: 80 },
});
