import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  orange: '#F57C00',
  green: '#27AE60',
  accent: '#D32F2F',
  blue: '#1565C0',
  gold: '#FFD700',
};

const PERIODS = ['Aujourd\'hui', 'Semaine', 'Mois', 'Année'];

const MOCK = {
  today: {
    trips: 8, revenue: 142, distance: 87, hours: 6.5, rating: 4.9,
    acceptance: 92, cancellation: 4, peak: '18h–21h',
    hourly: [0,0,0,0,0,0,2,8,14,10,6,4,12,8,6,10,16,22,20,14,8,4,2,0],
  },
  week: {
    trips: 47, revenue: 820, distance: 512, hours: 38, rating: 4.8,
    acceptance: 89, cancellation: 6, peak: 'Vendredi soir',
    daily: [120, 95, 110, 145, 180, 95, 75],
  },
  month: {
    trips: 198, revenue: 3450, distance: 2140, hours: 162, rating: 4.8,
    acceptance: 88, cancellation: 7, peak: 'Week-end',
  },
  year: {
    trips: 2240, revenue: 39800, distance: 24600, hours: 1840, rating: 4.8,
    acceptance: 87, cancellation: 8, peak: 'Été',
  },
};

function RadialStat({ value, max, color, label, unit }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <View style={r.wrap}>
      <View style={[r.ring, { borderColor: COLORS.border }]}>
        <View style={[r.fill, {
          borderColor: color,
          transform: [{ rotate: `${(pct / 100) * 360}deg` }],
        }]} />
        <View style={r.inner}>
          <Text style={[r.val, { color }]}>{value}{unit}</Text>
        </View>
      </View>
      <Text style={r.label}>{label}</Text>
    </View>
  );
}

const r = StyleSheet.create({
  wrap: { alignItems: 'center', flex: 1 },
  ring: { width: 72, height: 72, borderRadius: 36, borderWidth: 6, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  fill: { position: 'absolute', width: 72, height: 72, borderRadius: 36, borderWidth: 6, borderColor: 'transparent' },
  inner: { alignItems: 'center' },
  val: { fontSize: 14, fontWeight: '800' },
  label: { color: COLORS.muted, fontSize: 10, fontWeight: '600', textAlign: 'center' },
});

function HourBar({ data, color }) {
  const max = Math.max(...data, 1);
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 50, gap: 1 }}>
        {data.map((v, i) => (
          <View key={i} style={{
            flex: 1, height: Math.max((v / max) * 50, v > 0 ? 3 : 1),
            backgroundColor: v > 0 ? (i >= 17 && i <= 21 ? color : color + '66') : COLORS.border,
            borderRadius: 2,
          }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
        {[0, 6, 12, 18, 23].map((h) => (
          <Text key={h} style={{ color: COLORS.muted, fontSize: 8 }}>{h}h</Text>
        ))}
      </View>
    </View>
  );
}

function DayBar({ data, color }) {
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const max = Math.max(...data, 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 60, gap: 4 }}>
      {data.map((v, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center' }}>
          <View style={{
            width: '100%', height: (v / max) * 50,
            backgroundColor: i === new Date().getDay() - 1 ? color : color + '55',
            borderRadius: 3, marginBottom: 4,
          }} />
          <Text style={{ color: COLORS.muted, fontSize: 9 }}>{days[i]}</Text>
        </View>
      ))}
    </View>
  );
}

export default function TaxiDriverStatsScreen({ navigation }) {
  const [periodIdx, setPeriodIdx] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const period = ['today', 'week', 'month', 'year'][periodIdx];
      const res = await api.get(`/api/taxi/driver/stats?period=${period}`);
      setStats(res.data.stats || MOCK[period]);
    } catch {
      const period = ['today', 'week', 'month', 'year'][periodIdx];
      setStats(MOCK[period]);
    } finally {
      setLoading(false);
    }
  }, [periodIdx]);

  useEffect(() => { load(); }, [load]);

  const d = stats || {};

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>📊 Mes statistiques</Text>
      </View>

      {/* Period selector */}
      <View style={s.periodRow}>
        {PERIODS.map((p, i) => (
          <TouchableOpacity
            key={p}
            style={[s.periodTab, periodIdx === i && s.periodTabActive]}
            onPress={() => setPeriodIdx(i)}
          >
            <Text style={[s.periodTxt, periodIdx === i && s.periodTxtActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.centered}><ActivityIndicator color={COLORS.orange} size="large" /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

          {/* Main KPIs */}
          <View style={s.kpiGrid}>
            {[
              { label: 'Courses', value: d.trips, color: COLORS.orange, unit: '' },
              { label: 'Revenus', value: `${d.revenue}`, color: COLORS.green, unit: ' TND' },
              { label: 'Distance', value: d.distance, color: COLORS.blue, unit: ' km' },
              { label: 'Heures', value: d.hours, color: COLORS.gold, unit: 'h' },
            ].map((kpi) => (
              <View key={kpi.label} style={s.kpiCard}>
                <Text style={[s.kpiVal, { color: kpi.color }]}>{kpi.value}{kpi.unit}</Text>
                <Text style={s.kpiLbl}>{kpi.label}</Text>
              </View>
            ))}
          </View>

          {/* Performance radials */}
          <View style={s.sectionCard}>
            <Text style={s.sectionTitle}>Performance</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 }}>
              <RadialStat value={d.acceptance} max={100} color={COLORS.green} label="Taux\nacceptation" unit="%" />
              <RadialStat value={d.rating} max={5} color={COLORS.gold} label="Note\nmoyenne" unit="" />
              <RadialStat value={d.cancellation} max={20} color={COLORS.accent} label="Taux\nannulation" unit="%" />
            </View>
          </View>

          {/* Activity chart */}
          {periodIdx === 0 && d.hourly && (
            <View style={s.sectionCard}>
              <Text style={s.sectionTitle}>Activité par heure</Text>
              <HourBar data={d.hourly} color={COLORS.orange} />
              <Text style={[s.peakLabel]}>🔥 Heure de pointe : <Text style={{ color: COLORS.orange }}>{d.peak}</Text></Text>
            </View>
          )}

          {periodIdx === 1 && d.daily && (
            <View style={s.sectionCard}>
              <Text style={s.sectionTitle}>Revenus par jour</Text>
              <DayBar data={d.daily} color={COLORS.orange} />
              <Text style={s.peakLabel}>🔥 Meilleur jour : <Text style={{ color: COLORS.orange }}>{d.peak}</Text></Text>
            </View>
          )}

          {/* Tips */}
          <View style={s.tipsCard}>
            <Text style={s.sectionTitle}>💡 Conseils pour gagner plus</Text>
            <Text style={s.tipTxt}>• Soyez connecté entre 17h et 22h — heures de forte demande</Text>
            <Text style={s.tipTxt}>• Le vendredi soir génère +35% de revenus en moyenne</Text>
            <Text style={s.tipTxt}>• Un taux d'acceptation &gt;90% améliore votre priorité dans les assignations</Text>
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', flex: 1 },
  periodRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  periodTab: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  periodTabActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orange + '22' },
  periodTxt: { color: COLORS.muted, fontSize: 10, fontWeight: '600' },
  periodTxtActive: { color: COLORS.orange },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  kpiCard: { width: '47%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  kpiVal: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  kpiLbl: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  sectionCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  peakLabel: { color: COLORS.muted, fontSize: 11, marginTop: 8 },
  tipsCard: { backgroundColor: COLORS.blue + '11', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.blue + '33' },
  tipTxt: { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
});
