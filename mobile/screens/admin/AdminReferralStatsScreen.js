import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, RefreshControl, Alert, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2A2A3A',
  text: '#FFFFFF', muted: '#8A8A9A', orange: '#F57C00',
  green: '#27AE60', purple: '#7B1FA2', gold: '#FFD700',
};

const MOCK_STATS = {
  total: 1842, thisMonth: 134, conversionRate: 68, revenue: 9210,
  monthly: [42,65,88,110,95,120,140,115,130,160,134,0],
  topReferrers: [
    { id: 'r1', name: 'Sami Ben Ali', count: 48, earned: 240 },
    { id: 'r2', name: 'Leila Mansour', count: 35, earned: 175 },
    { id: 'r3', name: 'Karim Bouzid', count: 29, earned: 145 },
    { id: 'r4', name: 'Ahmed Trabelsi', count: 22, earned: 110 },
    { id: 'r5', name: 'Fatma Chaari', count: 18, earned: 90 },
    { id: 'r6', name: 'Yassine Dhouib', count: 15, earned: 75 },
    { id: 'r7', name: 'Rim Jebali', count: 12, earned: 60 },
    { id: 'r8', name: 'Nour Hamdi', count: 10, earned: 50 },
    { id: 'r9', name: 'Tarek Saidi', count: 8, earned: 40 },
    { id: 'r10', name: 'Ines Mrabet', count: 6, earned: 30 },
  ],
};

const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

export default function AdminReferralStatsScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    try {
      const res = await api.get('/api/admin/referral/stats');
      setData(res.data);
    } catch {
      if (!silent) setData(MOCK_STATS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const d = data || MOCK_STATS;
  const maxBar = Math.max(...d.monthly, 1);

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.purple} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>🎁 Statistiques parrainage</Text>
        <TouchableOpacity onPress={() => Alert.alert('Export CSV', 'Fonctionnalité disponible prochainement.')}>
          <Text style={s.exportBtn}>📥 CSV</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={COLORS.purple} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={s.kpiGrid}>
          {[
            { val: d.total.toLocaleString('fr-FR'), label: 'Total parrainages', color: COLORS.purple },
            { val: d.thisMonth, label: 'Ce mois-ci', color: COLORS.orange },
            { val: `${d.conversionRate}%`, label: 'Taux conversion', color: COLORS.green },
            { val: `${d.revenue} TND`, label: 'Revenu généré', color: COLORS.gold },
          ].map((k, i) => (
            <View key={i} style={s.kpiCard}>
              <Text style={[s.kpiVal, { color: k.color }]}>{k.val}</Text>
              <Text style={s.kpiLabel}>{k.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.chartCard}>
          <Text style={s.sectionTitle}>Évolution mensuelle</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 3, marginTop: 8 }}>
            {d.monthly.map((val, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <View style={{
                  width: '100%',
                  height: Math.max((val / maxBar) * 80, 2),
                  backgroundColor: val === Math.max(...d.monthly) ? COLORS.purple : COLORS.purple + '66',
                  borderRadius: 3,
                }} />
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            {MONTHS.map((m) => <Text key={m} style={{ color: COLORS.muted, fontSize: 8 }}>{m}</Text>)}
          </View>
        </View>

        <Text style={s.listTitle}>🏆 Top parrains</Text>
        {d.topReferrers.map((item, i) => (
          <View key={item.id} style={s.referrerCard}>
            <View style={[s.rankBadge, { backgroundColor: i < 3 ? COLORS.gold + '22' : COLORS.surface }]}>
              <Text style={[s.rankTxt, { color: i < 3 ? COLORS.gold : COLORS.muted }]}>#{i + 1}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={s.referrerName}>{item.name}</Text>
              <Text style={s.referrerSub}>{item.count} filleuls</Text>
            </View>
            <Text style={s.referrerEarned}>{item.earned} TND</Text>
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
  title: { color: COLORS.text, fontSize: 16, fontWeight: '700', flex: 1 },
  exportBtn: { color: COLORS.purple, fontSize: 13, fontWeight: '700' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, marginTop: 16, marginBottom: 12, gap: 10 },
  kpiCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, width: '47%', borderWidth: 1, borderColor: COLORS.border },
  kpiVal: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  kpiLabel: { color: COLORS.muted, fontSize: 11 },
  chartCard: { backgroundColor: COLORS.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  listTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginHorizontal: 16, marginBottom: 8 },
  referrerCard: { backgroundColor: COLORS.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 8, padding: 14, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center' },
  rankBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rankTxt: { fontSize: 12, fontWeight: '800' },
  referrerName: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  referrerSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  referrerEarned: { color: COLORS.purple, fontSize: 14, fontWeight: '800' },
});
