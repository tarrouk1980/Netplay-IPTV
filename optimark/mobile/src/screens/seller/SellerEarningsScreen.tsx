import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../lib/api';

const PLAN_COLORS: Record<string, string> = { FREE: '#94a3b8', PRO: '#9f1239', BUSINESS: '#7c3aed' };

export default function SellerEarningsScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    api.get('/vendors/earnings')
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  if (loading) return <View style={s.center}><ActivityIndicator color="#9f1239" size="large" /></View>;
  if (!data) return <View style={s.center}><Text style={s.empty}>Erreur de chargement</Text></View>;

  const monthly = [...(data.monthly || [])].reverse();
  const maxGross = Math.max(...monthly.map((m: any) => m.gross), 1);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={s.title}>💰 Revenus</Text>

      {/* Plan badge */}
      <View style={[s.planBadge, { backgroundColor: PLAN_COLORS[data.subscriptionPlan] + '22' }]}>
        <Text style={[s.planText, { color: PLAN_COLORS[data.subscriptionPlan] }]}>
          Plan {data.subscriptionPlan} — Commission {data.commissionRate}%
        </Text>
      </View>

      {/* Summary cards */}
      <View style={s.summaryRow}>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Brut total</Text>
          <Text style={s.summaryValue}>{data.totalGross.toFixed(2)}</Text>
          <Text style={s.summaryUnit}>TND</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Commission</Text>
          <Text style={[s.summaryValue, { color: '#f59e0b' }]}>{data.totalCommission.toFixed(2)}</Text>
          <Text style={s.summaryUnit}>TND</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Net reçu</Text>
          <Text style={[s.summaryValue, { color: '#22c55e' }]}>{data.totalNet.toFixed(2)}</Text>
          <Text style={s.summaryUnit}>TND</Text>
        </View>
      </View>

      {/* Bar chart */}
      {monthly.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Revenus mensuels (6 derniers mois)</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 6, marginTop: 8 }}>
            {monthly.map((m: any) => (
              <View key={m.month} style={{ flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <Text style={{ fontSize: 8, color: '#9f1239', fontWeight: '900', marginBottom: 2 }}>
                  {m.net > 0 ? m.net.toFixed(0) : ''}
                </Text>
                <View style={{ width: '100%', backgroundColor: '#9f1239', borderRadius: 4, height: Math.max(4, (m.gross / maxGross) * 72) }} />
                <Text style={{ fontSize: 8, color: '#94a3b8', marginTop: 3 }}>{m.month.slice(5)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Monthly breakdown */}
      {monthly.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Détail mensuel</Text>
          {monthly.map((m: any) => (
            <View key={m.month} style={s.tableRow}>
              <Text style={s.tableMonth}>{m.month}</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.tableGross}>{m.gross.toFixed(2)} TND</Text>
                <Text style={s.tableNet}>Net : {m.net.toFixed(2)} TND</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {monthly.length === 0 && (
        <Text style={s.empty}>Aucune vente pour l&apos;instant</Text>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: '#0f172a', marginBottom: 12 },
  planBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 16 },
  planText: { fontWeight: '900', fontSize: 13 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  summaryLabel: { fontSize: 10, color: '#94a3b8', marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  summaryUnit: { fontSize: 10, color: '#94a3b8' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#f1f5f9' },
  cardTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  tableMonth: { fontSize: 13, color: '#475569', fontWeight: '600' },
  tableGross: { fontSize: 13, fontWeight: '900', color: '#0f172a' },
  tableNet: { fontSize: 11, color: '#22c55e', marginTop: 2 },
  empty: { color: '#94a3b8', textAlign: 'center', paddingVertical: 30 },
});
