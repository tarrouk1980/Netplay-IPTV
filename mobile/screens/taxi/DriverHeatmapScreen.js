import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapboxWebView from '../../components/MapboxWebView';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  accent: '#F5A623',
  green: '#27AE60',
  red: '#E74C3C',
  blue: '#3498DB',
};

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const HOUR_BUCKETS = [6, 8, 10, 12, 14, 16, 18, 20, 22];
const HOURS_LABELS = HOUR_BUCKETS.map(h => `${h}h`);

function bucketDemand(demand24) {
  return demand24.map(row =>
    HOUR_BUCKETS.map(h => (row[h] || 0) + (row[h + 1] || 0))
  );
}

function heatColor(val) {
  if (val >= 8) return '#E74C3C';
  if (val >= 6) return '#E67E22';
  if (val >= 4) return '#F39C12';
  if (val >= 2) return '#27AE60';
  return '#1C2C1C';
}

function HeatCell({ value }) {
  return (
    <View style={[cell.box, { backgroundColor: heatColor(value) }]}>
      {value >= 7 && <Text style={cell.fire}>🔥</Text>}
    </View>
  );
}

const cell = StyleSheet.create({
  box: { flex: 1, height: 28, borderRadius: 4, margin: 1.5, alignItems: 'center', justifyContent: 'center' },
  fire: { fontSize: 9 },
});

const DEMAND_COLORS = {
  'Très élevée': '#E74C3C',
  'Élevée': '#F39C12',
  'Moyenne': '#27AE60',
  'Faible': '#3498DB',
};

export default function DriverHeatmapScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [tab, setTab] = useState('heatmap'); // heatmap | zones | tips

  const load = useCallback(async () => {
    setError(false);
    try {
      const res = await api.get('/api/provider/demand-heatmap');
      setData(res.data);
    } catch (err) {
      console.error('[DriverHeatmap] Failed to load demand heatmap:', err?.response?.data || err.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const demand = data ? bucketDemand(data.demand) : [];
  const hotZones = data?.hotZones || [];

  // Best hour = highest average across all days
  const hourlyAvg = HOURS_LABELS.map((_, hi) => ({
    label: HOURS_LABELS[hi],
    avg: demand.length ? demand.reduce((s, day) => s + (day[hi] || 0), 0) / demand.length : 0,
  }));
  const bestHour = hourlyAvg.reduce((best, h) => h.avg > best.avg ? h : best, hourlyAvg[0]);
  const dayTotals = demand.map(row => row.reduce((s, v) => s + v, 0));
  const bestDay = demand.length ? DAYS[dayTotals.indexOf(Math.max(...dayTotals))] : '—';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📊 Zones de demande</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {[['heatmap', '🗓️ Horaires'], ['zones', '📍 Zones'], ['tips', '💡 Conseils']].map(([k, l]) => (
          <TouchableOpacity key={k} style={[styles.tab, tab === k && styles.tabActive]} onPress={() => setTab(k)}>
            <Text style={[styles.tabText, tab === k && styles.tabTextActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !data ? (
        <View style={styles.centered}><ActivityIndicator color={COLORS.accent} size="large" /></View>
      ) : error && !data ? (
        <View style={styles.centered}>
          <Text style={{ color: COLORS.muted, marginBottom: 14 }}>⚠️ Impossible de charger les zones de demande.</Text>
          <TouchableOpacity style={styles.zoneCard} onPress={load}>
            <Text style={[styles.zoneName, { color: COLORS.accent }]}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.accent} />}
      >

        {/* Best time banner */}
        <View style={styles.bestBanner}>
          <View style={styles.bestItem}>
            <Text style={styles.bestIcon}>⚡</Text>
            <Text style={styles.bestLabel}>Meilleure heure</Text>
            <Text style={[styles.bestValue, { color: COLORS.accent }]}>{bestHour.label}</Text>
          </View>
          <View style={styles.bestDivider} />
          <View style={styles.bestItem}>
            <Text style={styles.bestIcon}>📅</Text>
            <Text style={styles.bestLabel}>Meilleur jour</Text>
            <Text style={[styles.bestValue, { color: COLORS.green }]}>{bestDay}</Text>
          </View>
          <View style={styles.bestDivider} />
          <View style={styles.bestItem}>
            <Text style={styles.bestIcon}>🔥</Text>
            <Text style={styles.bestLabel}>Zone top</Text>
            <Text style={[styles.bestValue, { color: COLORS.red }]} numberOfLines={1}>{hotZones[0]?.name}</Text>
          </View>
        </View>

        {/* Heatmap tab */}
        {tab === 'heatmap' && (
          <>
            <Text style={styles.sectionTitle}>Demande par jour & heure</Text>
            <View style={styles.heatmapCard}>
              {/* Hour labels */}
              <View style={styles.heatRow}>
                <View style={{ width: 30 }} />
                {HOURS_LABELS.map(h => <Text key={h} style={styles.heatHourLabel}>{h}</Text>)}
              </View>
              {demand.map((row, di) => (
                <View key={di} style={styles.heatRow}>
                  <Text style={styles.heatDayLabel}>{DAYS[di]}</Text>
                  {row.map((val, hi) => <HeatCell key={hi} value={val} />)}
                </View>
              ))}
              {/* Legend */}
              <View style={styles.legend}>
                {[['Faible', '#1C2C1C'], ['Moyen', '#27AE60'], ['Élevé', '#F39C12'], ['Très élevé', '#E74C3C']].map(([l, c]) => (
                  <View key={l} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: c }]} />
                    <Text style={styles.legendText}>{l}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Hourly bar */}
            <Text style={styles.sectionTitle}>Demande moyenne par heure</Text>
            <View style={styles.hourlyCard}>
              <View style={styles.hourlyBars}>
                {hourlyAvg.map((h, i) => {
                  const pct = Math.max(4, Math.round((h.avg / 10) * 80));
                  return (
                    <View key={i} style={styles.hourlyBarWrapper}>
                      <Text style={styles.hourlyVal}>{h.avg.toFixed(1)}</Text>
                      <View style={[styles.hourlyBar, { height: pct, backgroundColor: heatColor(h.avg) }]} />
                      <Text style={styles.hourlyLabel}>{h.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* Zones tab */}
        {tab === 'zones' && (
          <>
            <View style={styles.mapContainer}>
              <MapboxWebView
                style={{ height: 180 }}
                centerCoordinate={[10.24, 36.84]}
                zoom={10}
                heatmapZones={hotZones.map((z) => ({
                  lat: z.lat,
                  lng: z.lng,
                  color: DEMAND_COLORS[z.demand] || '#E74C3C',
                  label: `${z.icon} ${z.name} — ${z.demand}`,
                }))}
              />
            </View>
            <Text style={styles.sectionTitle}>Zones les plus actives</Text>
            {hotZones.map((z, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.zoneCard, selectedZone === i && styles.zoneCardActive]}
                onPress={() => setSelectedZone(selectedZone === i ? null : i)}
              >
                <Text style={styles.zoneDemandIcon}>{z.icon}</Text>
                <View style={styles.zoneInfo}>
                  <Text style={styles.zoneName}>{z.name}</Text>
                  <Text style={styles.zoneDemand}>Demande {z.demand}</Text>
                  {selectedZone === i && <Text style={styles.zoneTip}>💡 {z.tip}</Text>}
                </View>
                <Text style={[styles.zoneChevron, selectedZone === i && { color: COLORS.accent }]}>
                  {selectedZone === i ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Tips tab */}
        {tab === 'tips' && (
          <>
            <Text style={styles.sectionTitle}>Stratégies pour maximiser vos revenus</Text>
            {[
              { icon: '🌅', title: 'Heures de pointe matin', body: 'Entre 7h-9h, la demande est maximale vers les zones de bureaux (Lac 1, Ennasr). Positionnez-vous 15 min avant.' },
              { icon: '🌆', title: 'Retours du travail', body: 'De 17h30 à 19h30, les courses vers les quartiers résidentiels (Menzah, Ain Zaghouan) sont très demandées.' },
              { icon: '🌙', title: 'Soirées week-end', body: 'Vendredi et samedi soir de 21h à 2h, la zone de La Marsa et les restaurants de La Soukra génèrent un taux d\'acceptation élevé.' },
              { icon: '🏖️', title: 'Saison estivale', body: 'De juin à septembre, Hammamet et La Marsa voient leur demande augmenter de +180%. Envisagez de déplacer votre zone de travail.' },
              { icon: '✈️', title: 'Aéroport Tunis-Carthage', body: 'Les départs du matin (5h30-8h) et les arrivées du soir (20h-23h) génèrent des courses longues et bien rémunérées.' },
              { icon: '📅', title: 'Planifiez vos horaires', body: 'Utilisez l\'outil "Mes disponibilités" pour vous positionner sur les créneaux identifiés comme les plus profitables.' },
            ].map((tip, i) => (
              <View key={i} style={styles.tipCard}>
                <Text style={styles.tipIcon}>{tip.icon}</Text>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipBody}>{tip.body}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  tabRow: { flexDirection: 'row', backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  tabText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: COLORS.accent },
  scroll: { padding: 16 },
  bestBanner: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 16 },
  bestItem: { flex: 1, alignItems: 'center' },
  bestIcon: { fontSize: 18, marginBottom: 4 },
  bestLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', marginBottom: 2 },
  bestValue: { fontSize: 14, fontWeight: '900' },
  bestDivider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: 4 },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  heatmapCard: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 12, marginBottom: 16 },
  heatRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  heatDayLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', width: 30 },
  heatHourLabel: { flex: 1, color: COLORS.muted, fontSize: 8, textAlign: 'center' },
  legend: { flexDirection: 'row', gap: 10, marginTop: 10, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { color: COLORS.muted, fontSize: 10 },
  hourlyCard: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 12, marginBottom: 16 },
  hourlyBars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100 },
  hourlyBarWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  hourlyBar: { width: '70%', borderRadius: 3 },
  hourlyVal: { color: COLORS.muted, fontSize: 8, marginBottom: 2 },
  hourlyLabel: { color: COLORS.muted, fontSize: 8, marginTop: 4 },
  mapContainer: { borderRadius: 14, overflow: 'hidden', height: 180, marginBottom: 14 },
  zoneCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 8 },
  zoneCardActive: { borderColor: COLORS.accent },
  zoneDemandIcon: { fontSize: 22 },
  zoneInfo: { flex: 1 },
  zoneName: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  zoneDemand: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  zoneTip: { color: COLORS.accent, fontSize: 12, marginTop: 6, lineHeight: 18 },
  zoneChevron: { color: COLORS.muted, fontSize: 12 },
  tipCard: { flexDirection: 'row', gap: 12, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 10 },
  tipIcon: { fontSize: 26, marginTop: 2 },
  tipContent: { flex: 1 },
  tipTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 6 },
  tipBody: { color: COLORS.muted, fontSize: 13, lineHeight: 19 },
});
