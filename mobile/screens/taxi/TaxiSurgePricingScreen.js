import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_SURGE = {
  currentMultiplier: 1.3,
  zone: 'Tunis Centre',
  activeDrivers: 8,
  pendingRequests: 14,
  estimatedWait: '4 min',
  history: [
    { time: '14:00', multiplier: 1.0 },
    { time: '15:00', multiplier: 1.1 },
    { time: '16:00', multiplier: 1.2 },
    { time: '17:00', multiplier: 1.3 },
    { time: '18:00', multiplier: 1.5 },
    { time: '19:00', multiplier: 1.4 },
    { time: '20:00', multiplier: 1.2 },
  ],
  zones: [
    { name: 'Tunis Centre', multiplier: 1.3, demand: 'HIGH' },
    { name: 'Berges du Lac', multiplier: 1.0, demand: 'MEDIUM' },
    { name: 'La Marsa', multiplier: 1.0, demand: 'LOW' },
    { name: 'Ariana', multiplier: 1.2, demand: 'HIGH' },
    { name: 'Ben Arous', multiplier: 1.0, demand: 'LOW' },
  ],
};

const DEMAND_COLOR = { HIGH: COLORS.red, MEDIUM: COLORS.orange, LOW: COLORS.green };
const DEMAND_LABEL = { HIGH: 'Forte', MEDIUM: 'Modérée', LOW: 'Faible' };

function MultiplierBadge({ value }) {
  const color = value >= 1.4 ? COLORS.red : value >= 1.2 ? COLORS.orange : value > 1.0 ? COLORS.accent : COLORS.green;
  return (
    <View style={[styles.multiplierBadge, { backgroundColor: color + '20', borderColor: color + '50' }]}>
      <Text style={[styles.multiplierText, { color }]}>x{value.toFixed(1)}</Text>
    </View>
  );
}

export default function TaxiSurgePricingScreen({ navigation, route }) {
  const zone = route?.params?.zone || 'Tunis Centre';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/taxi/surge?zone=${encodeURIComponent(zone)}`)
      .then(r => setData(r.data || MOCK_SURGE))
      .catch(() => setData(MOCK_SURGE))
      .finally(() => setLoading(false));
  }, [zone]);

  const maxBar = data ? Math.max(...data.history.map(h => h.multiplier)) : 2;

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
        <Text style={styles.headerTitle}>⚡ Tarification dynamique</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Current surge hero */}
        <View style={[styles.heroCard, {
          borderColor: data.currentMultiplier >= 1.3 ? COLORS.orange + '50' : COLORS.border,
        }]}>
          <Text style={styles.heroZone}>📍 {data.zone}</Text>
          <Text style={[styles.heroMultiplier, {
            color: data.currentMultiplier >= 1.4 ? COLORS.red : data.currentMultiplier >= 1.2 ? COLORS.orange : COLORS.accent,
          }]}>
            x{data.currentMultiplier.toFixed(1)}
          </Text>
          <Text style={styles.heroLabel}>Multiplicateur actuel</Text>

          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatVal, { color: COLORS.green }]}>{data.activeDrivers}</Text>
              <Text style={styles.heroStatLabel}>Chauffeurs dispo</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatVal, { color: COLORS.red }]}>{data.pendingRequests}</Text>
              <Text style={styles.heroStatLabel}>Demandes en attente</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatVal, { color: COLORS.blue }]}>{data.estimatedWait}</Text>
              <Text style={styles.heroStatLabel}>Attente estimée</Text>
            </View>
          </View>
        </View>

        {/* Info banner */}
        {data.currentMultiplier > 1.0 && (
          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>
              ⚡ Forte demande dans votre zone. Les prix sont temporairement majorés de {Math.round((data.currentMultiplier - 1) * 100)}%. Attendez quelques minutes pour des tarifs normaux.
            </Text>
          </View>
        )}

        {/* Hourly chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ÉVOLUTION DU JOUR</Text>
          <View style={styles.chartCard}>
            <View style={styles.chart}>
              {data.history.map((h, i) => (
                <View key={i} style={styles.barWrapper}>
                  <View style={styles.barContainer}>
                    <View style={[styles.bar, {
                      height: `${(h.multiplier / maxBar) * 100}%`,
                      backgroundColor: h.multiplier >= 1.3 ? COLORS.orange : h.multiplier >= 1.1 ? COLORS.accent : COLORS.green,
                    }]} />
                  </View>
                  <Text style={styles.barLabel}>{h.time.slice(0, 2)}h</Text>
                </View>
              ))}
            </View>
            <View style={styles.chartLegend}>
              {[{ color: COLORS.green, label: 'Normal' }, { color: COLORS.accent, label: 'Modéré' }, { color: COLORS.orange, label: 'Élevé' }].map(l => (
                <View key={l.label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                  <Text style={styles.legendLabel}>{l.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* All zones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TOUTES LES ZONES</Text>
          {data.zones.map((z, i) => (
            <View key={i} style={styles.zoneRow}>
              <View>
                <Text style={styles.zoneName}>{z.name}</Text>
                <Text style={[styles.zoneDemand, { color: DEMAND_COLOR[z.demand] }]}>
                  {DEMAND_LABEL[z.demand]} demande
                </Text>
              </View>
              <MultiplierBadge value={z.multiplier} />
            </View>
          ))}
        </View>

        {/* Note 0% commission */}
        <View style={styles.commissionNote}>
          <Text style={styles.commissionIcon}>✅</Text>
          <Text style={styles.commissionText}>
            EasyWay ne prélève aucune commission. Le multiplicateur bénéficie directement aux chauffeurs.
          </Text>
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
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  heroCard: {
    margin: 16, backgroundColor: COLORS.surface, borderRadius: 20,
    padding: 24, alignItems: 'center', borderWidth: 1.5,
  },
  heroZone: { color: COLORS.muted, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  heroMultiplier: { fontSize: 64, fontWeight: '900' },
  heroLabel: { color: COLORS.muted, fontSize: 13, marginTop: 4, marginBottom: 20 },
  heroStats: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  heroStatItem: { flex: 1, alignItems: 'center' },
  heroStatVal: { fontSize: 20, fontWeight: '900' },
  heroStatLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', marginTop: 3, textAlign: 'center' },
  heroStatDivider: { width: 1, height: 36, backgroundColor: COLORS.border },
  infoBanner: {
    marginHorizontal: 16, marginBottom: 4, backgroundColor: COLORS.orange + '15',
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.orange + '30',
  },
  infoText: { color: COLORS.orange, fontSize: 13, lineHeight: 18 },
  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  chartCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 6 },
  barWrapper: { flex: 1, alignItems: 'center', gap: 4 },
  barContainer: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4, minHeight: 4 },
  barLabel: { color: COLORS.muted, fontSize: 9 },
  chartLegend: { flexDirection: 'row', gap: 12, marginTop: 12, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { color: COLORS.muted, fontSize: 11 },
  zoneRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  zoneName: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  zoneDemand: { fontSize: 11, fontWeight: '600', marginTop: 3 },
  multiplierBadge: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  multiplierText: { fontSize: 16, fontWeight: '900' },
  commissionNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    margin: 16, backgroundColor: COLORS.green + '10', borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: COLORS.green + '30',
  },
  commissionIcon: { fontSize: 18 },
  commissionText: { flex: 1, color: COLORS.green, fontSize: 13, lineHeight: 18 },
});
