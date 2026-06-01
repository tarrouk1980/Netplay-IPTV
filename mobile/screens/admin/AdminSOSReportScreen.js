import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  accent: '#D32F2F',
  orange: '#F57C00',
  green: '#27AE60',
  blue: '#1565C0',
};

const TN_ZONES = [
  'Tunis', 'Sfax', 'Sousse', 'Bizerte', 'Kairouan',
  'Gabès', 'Gafsa', 'Ariana', 'Nabeul', 'Monastir',
  'Kasserine', 'Jendouba', 'Médenine', 'Sidi Bouzid', 'Béja',
  'Mahdia', 'Tozeur', 'Kébili', 'Tataouine', 'Siliana', 'Zaghouan',
  'Le Kef', 'Manouba', 'Ben Arous',
];

function intensityColor(count, max) {
  if (max === 0) return '#1C1C28';
  const pct = count / max;
  if (pct > 0.7) return '#B71C1C';
  if (pct > 0.4) return '#E53935';
  if (pct > 0.15) return '#EF9A9A';
  if (pct > 0) return '#FFCDD2';
  return '#1C1C28';
}

function HeatmapGrid({ zones }) {
  const max = Math.max(...zones.map((z) => z.count), 1);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {zones.map((z) => (
        <View
          key={z.name}
          style={{
            backgroundColor: intensityColor(z.count, max),
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: z.count > 0 ? '#E5393533' : COLORS.border,
          }}
        >
          <Text style={{ color: z.count > 0 ? COLORS.text : COLORS.muted, fontSize: 11, fontWeight: '600' }}>
            {z.name}
          </Text>
          <Text style={{ color: z.count > 0 ? '#FFCDD2' : COLORS.muted, fontSize: 10, textAlign: 'center' }}>
            {z.count}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function AdminSOSReportScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/sos/report');
      setData(res.data);
    } catch {
      setData({
        totalSOSToday: 0,
        totalSOSMonth: 0,
        avgResponseMin: 0,
        resolvedRate: 0,
        zones: TN_ZONES.map((name) => ({ name, count: 0 })),
        topDepanneurs: [],
        problemTypes: [],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>🛻 Rapport SOS/Dépannage</Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.accent} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* KPIs */}
        <View style={s.kpiGrid}>
          {[
            { label: "Interventions\naujourd'hui", value: data?.totalSOSToday ?? 0, color: COLORS.accent },
            { label: 'Interventions\nce mois', value: data?.totalSOSMonth ?? 0 },
            { label: 'Temps réponse\nmoyen', value: `${(data?.avgResponseMin ?? 0).toFixed(1)} min`, color: COLORS.orange },
            { label: 'Taux\nrésolution', value: `${(data?.resolvedRate ?? 0).toFixed(0)}%`, color: COLORS.green },
          ].map((k, i) => (
            <View key={i} style={s.kpiCard}>
              <Text style={[s.kpiValue, { color: k.color || COLORS.text }]}>{k.value}</Text>
              <Text style={s.kpiLabel}>{k.label}</Text>
            </View>
          ))}
        </View>

        {/* Zone heatmap */}
        <View style={s.card}>
          <Text style={s.cardTitle}>🗺 Carte thermique par région</Text>
          <View style={s.legendRow}>
            {[
              { color: '#1C1C28', label: 'Aucun' },
              { color: '#FFCDD2', label: 'Faible' },
              { color: '#EF9A9A', label: 'Moyen' },
              { color: '#E53935', label: 'Élevé' },
              { color: '#B71C1C', label: 'Critique' },
            ].map((l) => (
              <View key={l.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: l.color }} />
                <Text style={{ color: COLORS.muted, fontSize: 9 }}>{l.label}</Text>
              </View>
            ))}
          </View>
          <HeatmapGrid zones={data?.zones || []} />
        </View>

        {/* Problem types */}
        {data?.problemTypes?.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>🔧 Types de pannes</Text>
            {data.problemTypes.map((pt, i) => {
              const max = data.problemTypes[0]?.count || 1;
              const pct = pt.count / max;
              return (
                <View key={i} style={s.barRow}>
                  <Text style={s.barLabel}>{pt.type}</Text>
                  <View style={s.barTrack}>
                    <View style={[s.barFill, { width: `${pct * 100}%`, backgroundColor: COLORS.orange }]} />
                  </View>
                  <Text style={s.barCount}>{pt.count}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Top depanneurs */}
        <View style={s.card}>
          <Text style={s.cardTitle}>🏆 Top Dépanneurs</Text>
          {!data?.topDepanneurs?.length ? (
            <Text style={s.emptyTxt}>Aucune donnée disponible.</Text>
          ) : (
            data.topDepanneurs.map((d, i) => (
              <TouchableOpacity
                key={d.id}
                style={s.depanneurRow}
                onPress={() => navigation.navigate('AdminUserDetail', { userId: d.id })}
              >
                <View style={s.rankBadge}>
                  <Text style={s.rankTxt}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.depanneurName}>{d.name}</Text>
                  <Text style={s.depanneurMeta}>{d.interventions} interventions · ⭐ {(d.rating ?? 0).toFixed(1)}</Text>
                </View>
                <Text style={s.depanneurRevenue}>{(d.revenue ?? 0).toFixed(0)} TND</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginTop: 16, marginBottom: 4 },
  kpiCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  kpiValue: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  kpiLabel: { color: COLORS.muted, fontSize: 11, textAlign: 'center', lineHeight: 15 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  legendRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginBottom: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  barLabel: { color: COLORS.muted, fontSize: 12, width: 100 },
  barTrack: { flex: 1, height: 8, backgroundColor: COLORS.surfaceAlt, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barCount: { color: COLORS.text, fontSize: 12, fontWeight: '700', width: 30, textAlign: 'right' },
  depanneurRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  rankBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  rankTxt: { color: COLORS.orange, fontSize: 13, fontWeight: '700' },
  depanneurName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  depanneurMeta: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  depanneurRevenue: { color: COLORS.green, fontSize: 14, fontWeight: '700' },
  emptyTxt: { color: COLORS.muted, textAlign: 'center', fontSize: 13, paddingVertical: 8 },
});
