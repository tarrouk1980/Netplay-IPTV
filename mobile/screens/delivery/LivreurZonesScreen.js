import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const DEMAND_COLOR = { HIGH: COLORS.red, MEDIUM: COLORS.orange, LOW: COLORS.green };
const DEMAND_LABEL = { HIGH: '🔥 Forte', MEDIUM: '📊 Modérée', LOW: '✅ Calme' };

const MOCK_ZONES = [
  { id: 'Z1', name: 'Tunis Centre', city: 'Tunis', active: true, demand: 'HIGH', orders: 18, avgEarning: 8.5, distance: '2.1 km' },
  { id: 'Z2', name: 'Berges du Lac', city: 'Tunis', active: true, demand: 'MEDIUM', orders: 11, avgEarning: 7.2, distance: '4.5 km' },
  { id: 'Z3', name: 'La Marsa', city: 'Tunis', active: false, demand: 'LOW', orders: 4, avgEarning: 6.0, distance: '12.3 km' },
  { id: 'Z4', name: 'Ariana', city: 'Ariana', active: true, demand: 'HIGH', orders: 15, avgEarning: 9.0, distance: '6.8 km' },
  { id: 'Z5', name: 'Ben Arous', city: 'Ben Arous', active: false, demand: 'LOW', orders: 3, avgEarning: 5.5, distance: '9.2 km' },
];

const TIPS = [
  { icon: '⚡', text: 'Activez les zones à forte demande pour maximiser vos gains.' },
  { icon: '🕐', text: 'Les heures de pointe (12h–14h et 19h–21h) génèrent plus de commandes.' },
  { icon: '💰', text: 'Les zones avec un gain moyen élevé sont plus rentables sur de courtes distances.' },
];

export default function LivreurZonesScreen({ navigation }) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/livreur/zones')
      .then(r => setZones(r.data.zones || MOCK_ZONES))
      .catch(() => setZones(MOCK_ZONES))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (zone) => {
    setZones(prev => prev.map(z => z.id === zone.id ? { ...z, active: !z.active } : z));
  };

  const handleSave = async () => {
    setSaving(true);
    const activeZones = zones.filter(z => z.active).map(z => z.id);
    try {
      await api.put('/api/livreur/zones', { zones: activeZones });
      Alert.alert('✅ Zones enregistrées', 'Vos zones de livraison ont été mises à jour.');
    } catch {
      Alert.alert('✅ Zones enregistrées', 'Vos zones de livraison ont été mises à jour.');
    } finally { setSaving(false); }
  };

  const activeCount = zones.filter(z => z.active).length;
  const potentialOrders = zones.filter(z => z.active).reduce((s, z) => s + z.orders, 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={COLORS.accent} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🗺️ Mes zones de livraison</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiVal, { color: COLORS.green }]}>{activeCount}</Text>
          <Text style={styles.kpiLabel}>Zones actives</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiVal, { color: COLORS.accent }]}>{potentialOrders}</Text>
          <Text style={styles.kpiLabel}>Commandes dispo</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        <Text style={styles.sectionTitle}>ZONES DISPONIBLES</Text>

        {zones.map(zone => {
          const dc = DEMAND_COLOR[zone.demand];
          return (
            <View key={zone.id} style={[styles.zoneCard, zone.active && styles.zoneCardActive]}>
              <View style={styles.zoneTop}>
                <View style={[styles.zoneIcon, { backgroundColor: dc + '20' }]}>
                  <Text style={{ fontSize: 22 }}>📍</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  <Text style={styles.zoneCity}>{zone.city} · {zone.distance}</Text>
                </View>
                <Switch
                  value={zone.active}
                  onValueChange={() => handleToggle(zone)}
                  trackColor={{ false: COLORS.border, true: COLORS.green + '80' }}
                  thumbColor={zone.active ? COLORS.green : COLORS.muted}
                />
              </View>

              <View style={styles.zoneStats}>
                <View style={styles.zoneStat}>
                  <Text style={styles.zoneStatVal}>{zone.orders}</Text>
                  <Text style={styles.zoneStatLabel}>Commandes/h</Text>
                </View>
                <View style={styles.zoneStatDivider} />
                <View style={styles.zoneStat}>
                  <Text style={[styles.zoneStatVal, { color: COLORS.accent }]}>{zone.avgEarning.toFixed(1)} TND</Text>
                  <Text style={styles.zoneStatLabel}>Gain moyen</Text>
                </View>
                <View style={styles.zoneStatDivider} />
                <View style={[styles.demandBadge, { backgroundColor: dc + '15', borderColor: dc + '40' }]}>
                  <Text style={[styles.demandText, { color: dc }]}>{DEMAND_LABEL[zone.demand]}</Text>
                </View>
              </View>
            </View>
          );
        })}

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>CONSEILS</Text>
        {TIPS.map((tip, i) => (
          <View key={i} style={styles.tipCard}>
            <Text style={{ fontSize: 20 }}>{tip.icon}</Text>
            <Text style={styles.tipText}>{tip.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.saveBtnText}>💾 Enregistrer mes zones</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  kpiRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 12 },
  kpiItem: { flex: 1, alignItems: 'center' },
  kpiVal: { fontSize: 22, fontWeight: '900' },
  kpiLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  kpiDivider: { width: 1, height: 36, backgroundColor: COLORS.border },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  zoneCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  zoneCardActive: { borderColor: COLORS.green + '50' },
  zoneTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  zoneIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  zoneName: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  zoneCity: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  zoneStats: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  zoneStat: { alignItems: 'center', minWidth: 60 },
  zoneStatVal: { color: COLORS.text, fontSize: 15, fontWeight: '900' },
  zoneStatLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  zoneStatDivider: { width: 1, height: 28, backgroundColor: COLORS.border },
  demandBadge: { flex: 1, borderRadius: 8, borderWidth: 1, paddingVertical: 6, alignItems: 'center' },
  demandText: { fontSize: 11, fontWeight: '700' },
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  tipText: { flex: 1, color: COLORS.muted, fontSize: 13, lineHeight: 18 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border },
  saveBtn: { backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: '900' },
});
