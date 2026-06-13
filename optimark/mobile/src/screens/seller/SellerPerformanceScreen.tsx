import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api';

const METRICS = [
  { key: 'rating', label: 'Note', max: 30, icon: '⭐' },
  { key: 'reviews', label: 'Avis', max: 20, icon: '💬' },
  { key: 'products', label: 'Produits', max: 20, icon: '📦' },
  { key: 'followers', label: 'Abonnés', max: 15, icon: '👥' },
  { key: 'revenue', label: 'Revenus', max: 15, icon: '💰' },
];

export default function SellerPerformanceScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.get('/vendors/performance')
      .then(r => setData(r.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  if (loading) return <View style={s.center}><ActivityIndicator color="#9f1239" size="large" /></View>;
  if (!data) return <View style={s.center}><Text style={s.empty}>Erreur de chargement</Text></View>;

  const scoreColor = data.score >= 80 ? '#f59e0b' : data.score >= 60 ? '#9f1239' : data.score >= 40 ? '#3b82f6' : '#94a3b8';
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference * (1 - data.score / 100);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={s.title}>🏆 Mon score vendeur</Text>

      {/* Score card */}
      <View style={s.scoreCard}>
        <View style={s.scoreCircle}>
          <Text style={[s.scoreNum, { color: scoreColor }]}>{data.score}</Text>
          <Text style={s.scoreMax}>/100</Text>
        </View>
        <View style={[s.badgePill, { backgroundColor: scoreColor + '20' }]}>
          <Text style={[s.badgeText, { color: scoreColor }]}>{data.badge}</Text>
        </View>
      </View>

      {/* KPIs */}
      <View style={s.kpiGrid}>
        {[
          { label: 'Commandes livrées', value: data.stats.deliveredOrders, icon: '📦' },
          { label: 'Note moyenne', value: data.stats.avgRating > 0 ? `${data.stats.avgRating}★` : '—', icon: '⭐' },
          { label: 'Abonnés', value: data.stats.followers, icon: '👥' },
          { label: 'Produits actifs', value: data.stats.activeProducts, icon: '🛍️' },
          { label: 'Avis', value: data.stats.totalReviews, icon: '💬' },
          { label: 'Revenus', value: `${data.stats.revenue.toFixed(0)} TND`, icon: '💰' },
        ].map(({ label, value, icon }) => (
          <View key={label} style={s.kpiCard}>
            <Text style={s.kpiIcon}>{icon}</Text>
            <Text style={s.kpiValue}>{value}</Text>
            <Text style={s.kpiLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Score breakdown */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Détail du score</Text>
        {METRICS.map(({ key, label, max, icon }) => {
          const val = data.breakdown[key] || 0;
          const pct = val / max;
          const barColor = pct >= 0.8 ? '#16a34a' : pct >= 0.5 ? '#9f1239' : '#f59e0b';
          return (
            <View key={key} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={{ fontSize: 13, color: '#475569', fontWeight: '600' }}>{icon} {label}</Text>
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#0f172a' }}>{val}<Text style={{ color: '#cbd5e1', fontWeight: '400' }}>/{max}</Text></Text>
              </View>
              <View style={s.barBg}>
                <View style={[s.barFill, { width: `${pct * 100}%` as any, backgroundColor: barColor }]} />
              </View>
            </View>
          );
        })}
      </View>

      {/* Tips */}
      <View style={s.tipsCard}>
        <Text style={s.tipsTitle}>💡 Améliorations suggérées</Text>
        {data.stats.avgRating < 4 && <Text style={s.tip}>• Répondez rapidement aux questions clients</Text>}
        {data.stats.totalReviews < 10 && <Text style={s.tip}>• Demandez des avis après chaque livraison</Text>}
        {data.stats.activeProducts < 10 && <Text style={s.tip}>• Ajoutez plus de produits (objectif : 10+)</Text>}
        {data.stats.followers < 20 && <Text style={s.tip}>• Partagez votre boutique sur les réseaux</Text>}
        {data.score >= 80 && <Text style={[s.tip, { color: '#16a34a' }]}>✓ Excellent niveau ! Continuez ainsi.</Text>}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#94a3b8' },
  title: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 16 },
  scoreCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  scoreCircle: { alignItems: 'center', marginBottom: 12 },
  scoreNum: { fontSize: 56, fontWeight: '900', lineHeight: 64 },
  scoreMax: { fontSize: 14, color: '#94a3b8', marginTop: -4 },
  badgePill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 14, fontWeight: '900' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  kpiCard: { width: '30%', backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  kpiIcon: { fontSize: 22, marginBottom: 4 },
  kpiValue: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  kpiLabel: { fontSize: 9, color: '#94a3b8', fontWeight: '600', textAlign: 'center', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  cardTitle: { fontSize: 15, fontWeight: '900', color: '#0f172a', marginBottom: 16 },
  barBg: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  tipsCard: { backgroundColor: '#fff1f2', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#fecdd3' },
  tipsTitle: { fontSize: 14, fontWeight: '900', color: '#9f1239', marginBottom: 10 },
  tip: { fontSize: 13, color: '#be123c', marginBottom: 6, lineHeight: 18 },
});
