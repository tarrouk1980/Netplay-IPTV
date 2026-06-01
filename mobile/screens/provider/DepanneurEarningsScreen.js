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
  orange: '#F57C00',
  green: '#27AE60',
  accent: '#D32F2F',
  teal: '#00838F',
  gold: '#FFD700',
};

const PERIODS = [
  { key: 'today', label: "Auj." },
  { key: 'week', label: '7j' },
  { key: 'month', label: '30j' },
  { key: 'year', label: '1an' },
];

const MOCK_DATA = {
  today: { totalEarned: 85, interventions: 3, avgTicket: 28.3, commission: 0, netEarned: 85, topService: 'Crevaison', pendingPayout: 0 },
  week: { totalEarned: 420, interventions: 17, avgTicket: 24.7, commission: 0, netEarned: 420, topService: 'Batterie déchargée', pendingPayout: 120 },
  month: { totalEarned: 1840, interventions: 72, avgTicket: 25.5, commission: 0, netEarned: 1840, topService: 'Crevaison', pendingPayout: 340 },
  year: { totalEarned: 18200, interventions: 680, avgTicket: 26.7, commission: 0, netEarned: 18200, topService: 'Panne moteur', pendingPayout: 0 },
};

const MOCK_INTERVENTIONS = [
  { id: 'i1', clientName: 'Sami B.', serviceType: 'Crevaison', amount: 35, date: new Date(Date.now() - 2 * 3600000).toISOString(), status: 'PAID', city: 'Tunis' },
  { id: 'i2', clientName: 'Leila M.', serviceType: 'Batterie déchargée', amount: 25, date: new Date(Date.now() - 5 * 3600000).toISOString(), status: 'PAID', city: 'Ariana' },
  { id: 'i3', clientName: 'Ahmed T.', serviceType: 'Panne moteur', amount: 60, date: new Date(Date.now() - 26 * 3600000).toISOString(), status: 'PAID', city: 'La Marsa' },
  { id: 'i4', clientName: 'Karim Z.', serviceType: 'Clé perdue', amount: 40, date: new Date(Date.now() - 48 * 3600000).toISOString(), status: 'PENDING', city: 'Ben Arous' },
];

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <View style={{ height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden', flex: 1 }}>
      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 2 }} />
    </View>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Il y a moins d\'1h';
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

export default function DepanneurEarningsScreen({ navigation }) {
  const [period, setPeriod] = useState('week');
  const [stats, setStats] = useState(null);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    try {
      const [sRes, iRes] = await Promise.all([
        api.get(`/api/provider/depanneur/earnings?period=${period}`),
        api.get('/api/provider/depanneur/interventions?limit=10'),
      ]);
      setStats(sRes.data.stats);
      setInterventions(iRes.data.interventions || []);
    } catch {
      if (!silent) {
        setStats(MOCK_DATA[period]);
        setInterventions(MOCK_INTERVENTIONS);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const currentStats = stats || MOCK_DATA[period];

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.orange} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>🛻 Mes revenus</Text>
      </View>

      {/* Zero commission banner */}
      <View style={s.zeroBanner}>
        <Text style={s.zeroBannerTxt}>✅ Commission EasyWay : 0% — Vous gardez 100% de vos gains</Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={COLORS.orange} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Period tabs */}
        <View style={s.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[s.periodTab, period === p.key && s.periodTabActive]}
              onPress={() => { setPeriod(p.key); setLoading(true); }}
            >
              <Text style={[s.periodTxt, period === p.key && s.periodTxtActive]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main earnings card */}
        <View style={s.mainCard}>
          <Text style={s.mainLabel}>Revenus nets</Text>
          <Text style={s.mainValue}>{currentStats.netEarned.toFixed(2)} TND</Text>
          <View style={s.mainRow}>
            <View style={s.mainStat}>
              <Text style={s.mainStatVal}>{currentStats.interventions}</Text>
              <Text style={s.mainStatLabel}>Interventions</Text>
            </View>
            <View style={s.mainDivider} />
            <View style={s.mainStat}>
              <Text style={s.mainStatVal}>{currentStats.avgTicket.toFixed(1)} TND</Text>
              <Text style={s.mainStatLabel}>Ticket moyen</Text>
            </View>
            <View style={s.mainDivider} />
            <View style={s.mainStat}>
              <Text style={[s.mainStatVal, { color: COLORS.green }]}>0%</Text>
              <Text style={s.mainStatLabel}>Commission</Text>
            </View>
          </View>
        </View>

        {/* Pending payout */}
        {currentStats.pendingPayout > 0 && (
          <View style={s.pendingCard}>
            <View style={{ flex: 1 }}>
              <Text style={s.pendingTitle}>💳 Versement en attente</Text>
              <Text style={s.pendingAmt}>{currentStats.pendingPayout.toFixed(2)} TND</Text>
            </View>
            <TouchableOpacity style={s.withdrawBtn}>
              <Text style={s.withdrawBtnTxt}>Retirer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Top service */}
        <View style={s.topCard}>
          <Text style={s.topLabel}>🏆 Service le plus demandé</Text>
          <Text style={s.topValue}>{currentStats.topService}</Text>
        </View>

        {/* Weekly bars */}
        <View style={s.sectionCard}>
          <Text style={s.sectionTitle}>Répartition par type</Text>
          {[
            { label: 'Crevaison', val: 35 },
            { label: 'Batterie', val: 28 },
            { label: 'Panne moteur', val: 20 },
            { label: 'Remorquage', val: 12 },
            { label: 'Autre', val: 5 },
          ].map((item) => (
            <View key={item.label} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={s.barLabel}>{item.label}</Text>
                <Text style={s.barPct}>{item.val}%</Text>
              </View>
              <MiniBar value={item.val} max={100} color={COLORS.orange} />
            </View>
          ))}
        </View>

        {/* Recent interventions */}
        <Text style={s.listTitle}>Dernières interventions</Text>
        {interventions.map((item) => (
          <View key={item.id} style={s.interventionCard}>
            <View style={{ flex: 1 }}>
              <Text style={s.iClientName}>{item.clientName}</Text>
              <Text style={s.iService}>{item.serviceType} · {item.city}</Text>
              <Text style={s.iDate}>{formatDate(item.date)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.iAmount}>{item.amount} TND</Text>
              <View style={[s.statusBadge, { backgroundColor: item.status === 'PAID' ? COLORS.green + '22' : COLORS.gold + '22', borderColor: item.status === 'PAID' ? COLORS.green : COLORS.gold }]}>
                <Text style={[s.statusTxt, { color: item.status === 'PAID' ? COLORS.green : COLORS.gold }]}>
                  {item.status === 'PAID' ? '✅ Payé' : '⏳ En attente'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', flex: 1 },
  zeroBanner: { backgroundColor: COLORS.green + '15', borderBottomWidth: 1, borderBottomColor: COLORS.green + '33', paddingHorizontal: 16, paddingVertical: 8 },
  zeroBannerTxt: { color: COLORS.green, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  periodRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, marginBottom: 12, backgroundColor: COLORS.surface, borderRadius: 12, padding: 4, gap: 4 },
  periodTab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  periodTabActive: { backgroundColor: COLORS.orange },
  periodTxt: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },
  periodTxtActive: { color: '#FFF' },
  mainCard: { backgroundColor: COLORS.surface, borderRadius: 16, marginHorizontal: 16, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  mainLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600', marginBottom: 6 },
  mainValue: { color: COLORS.orange, fontSize: 40, fontWeight: '800', marginBottom: 16 },
  mainRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  mainStat: { flex: 1, alignItems: 'center' },
  mainStatVal: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  mainStatLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  mainDivider: { width: 1, backgroundColor: COLORS.border },
  pendingCard: { backgroundColor: COLORS.gold + '11', borderRadius: 14, marginHorizontal: 16, marginBottom: 12, padding: 16, borderWidth: 1, borderColor: COLORS.gold + '44', flexDirection: 'row', alignItems: 'center' },
  pendingTitle: { color: COLORS.text, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  pendingAmt: { color: COLORS.gold, fontSize: 22, fontWeight: '800' },
  withdrawBtn: { backgroundColor: COLORS.gold, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  withdrawBtnTxt: { color: COLORS.bg, fontSize: 13, fontWeight: '800' },
  topCard: { backgroundColor: COLORS.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  topValue: { color: COLORS.orange, fontSize: 13, fontWeight: '700' },
  sectionCard: { backgroundColor: COLORS.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { color: COLORS.text, fontSize: 13, fontWeight: '700', marginBottom: 14 },
  barLabel: { color: COLORS.muted, fontSize: 12 },
  barPct: { color: COLORS.orange, fontSize: 12, fontWeight: '700' },
  listTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginHorizontal: 16, marginBottom: 8 },
  interventionCard: { backgroundColor: COLORS.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 8, padding: 14, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center' },
  iClientName: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  iService: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  iDate: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  iAmount: { color: COLORS.orange, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  statusTxt: { fontSize: 10, fontWeight: '700' },
});
