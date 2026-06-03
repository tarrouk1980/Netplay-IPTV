import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapboxWebView from '../../components/MapboxWebView';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F',
  orange: '#E67E22', yellow: '#F1C40F',
};

const LEGEND = [
  { color: COLORS.green, label: 'Fluide' },
  { color: COLORS.yellow, label: 'Modéré' },
  { color: COLORS.orange, label: 'Dense' },
  { color: COLORS.red, label: 'Bloqué' },
];

const MOCK_ZONES = [
  { lat: 36.8065, lng: 10.1815, color: COLORS.red, label: 'Av. Habib Bourguiba' },
  { lat: 36.8190, lng: 10.1660, color: COLORS.orange, label: 'Bab Souika' },
  { lat: 36.7940, lng: 10.1950, color: COLORS.green, label: 'Menzah 6' },
  { lat: 36.8320, lng: 10.2100, color: COLORS.yellow, label: 'La Marsa' },
  { lat: 36.7710, lng: 10.1700, color: COLORS.red, label: 'Ben Arous' },
  { lat: 36.8010, lng: 10.2200, color: COLORS.green, label: 'Carthage' },
];

const MOCK_ALERTS = [
  { id: '1', type: '🚧', text: 'Travaux sur Av. de la République', time: '08:32', severity: 'orange' },
  { id: '2', type: '🚨', text: 'Accident RN1 direction Ariana', time: '09:05', severity: 'red' },
  { id: '3', type: '🌧️', text: 'Chaussée glissante — Lac Tunis', time: '09:18', severity: 'yellow' },
  { id: '4', type: '🐌', text: 'Ralentissements Autoroute A1', time: '09:45', severity: 'orange' },
];

export default function LiveTrafficScreen({ navigation }) {
  const [zones, setZones] = useState(MOCK_ZONES);
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [tab, setTab] = useState('map');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/traffic/live');
        if (res.data?.zones?.length) setZones(res.data.zones);
        if (res.data?.alerts?.length) setAlerts(res.data.alerts);
      } catch {}
    })();

    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🚦 Trafic en Direct</Text>
        <Text style={styles.updateLabel}>MAJ {formatTime(lastUpdate)}</Text>
      </View>

      <View style={styles.tabs}>
        {[{ key: 'map', label: '🗺️ Carte' }, { key: 'alerts', label: '⚠️ Alertes' }].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && { color: '#000' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'map' && (
        <>
          <View
            style={styles.mapContainer}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
          >
            <MapboxWebView
              style={{ flex: 1 }}
              centerCoordinate={[10.1815, 36.8065]}
              zoom={11}
              markers={[]}
              heatmapZones={zones}
            />
          </View>

          <View style={styles.legend}>
            {LEGEND.map((l) => (
              <View key={l.color} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                <Text style={styles.legendText}>{l.label}</Text>
              </View>
            ))}
          </View>

          <ScrollView style={styles.zoneList} showsVerticalScrollIndicator={false}>
            {zones.map((z, i) => (
              <View key={i} style={styles.zoneRow}>
                <View style={[styles.zoneDot, { backgroundColor: z.color }]} />
                <Text style={styles.zoneLabel}>{z.label}</Text>
              </View>
            ))}
          </ScrollView>
        </>
      )}

      {tab === 'alerts' && (
        <ScrollView contentContainerStyle={styles.alertList} showsVerticalScrollIndicator={false}>
          {alerts.length === 0 && (
            <Text style={{ color: COLORS.muted, textAlign: 'center', marginTop: 40 }}>
              Aucune alerte en ce moment ✅
            </Text>
          )}
          {alerts.map((a) => (
            <View key={a.id} style={[styles.alertCard, { borderLeftColor: COLORS[a.severity] || COLORS.muted }]}>
              <Text style={{ fontSize: 24 }}>{a.type}</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.alertText}>{a.text}</Text>
                <Text style={styles.alertTime}>{a.time}</Text>
              </View>
            </View>
          ))}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              💡 Les données trafic sont mises à jour toutes les 60 secondes via les capteurs réseau.
            </Text>
          </View>
        </ScrollView>
      )}
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
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  updateLabel: { color: COLORS.muted, fontSize: 12 },
  tabs: { flexDirection: 'row', padding: 12, gap: 8 },
  tab: {
    flex: 1, paddingVertical: 9, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  mapContainer: { height: 300, marginHorizontal: 12, borderRadius: 14, overflow: 'hidden' },
  legend: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, paddingHorizontal: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { color: COLORS.muted, fontSize: 12 },
  zoneList: { flex: 1, paddingHorizontal: 16 },
  zoneRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  zoneDot: { width: 10, height: 10, borderRadius: 5 },
  zoneLabel: { color: COLORS.white, fontSize: 13 },
  alertList: { padding: 16, gap: 10, paddingBottom: 30 },
  alertCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, borderLeftWidth: 4,
  },
  alertText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  alertTime: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  footer: { alignItems: 'center', paddingTop: 16 },
  footerText: { color: COLORS.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
