import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../lib/api';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente', CONFIRMED: 'Confirmée', SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée', CANCELLED: 'Annulée',
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b', CONFIRMED: '#3b82f6', SHIPPED: '#8b5cf6',
  DELIVERED: '#22c55e', CANCELLED: '#f43f5e',
};

export default function SellerAnalyticsScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.get('/vendors/analytics')
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  if (loading) return (
    <View style={styles.center}><ActivityIndicator color="#9f1239" size="large" /></View>
  );

  if (!data) return (
    <View style={styles.center}><Text style={styles.empty}>Erreur de chargement</Text></View>
  );

  const maxWeek = Math.max(...(data.weeklyOrders?.map((w: any) => w.count) || [1]), 1);
  const maxCat = Math.max(...(data.byCategory?.map((c: any) => c.revenue) || [1]), 1);
  const statusEntries: [string, number][] = Object.entries(data.statusBreakdown || {}) as [string, number][];
  const totalOrders = statusEntries.reduce((s, [, v]) => s + v, 0);
  const maxRating = Math.max(...(data.ratingDist?.map((d: any) => d.count) || [1]), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>📊 Analytiques</Text>

      {/* KPIs */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Vues</Text>
          <Text style={styles.kpiValue}>{data.totalViews}</Text>
          <Text style={styles.kpiSub}>{data.viewsLast30} (30j)</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Commandes</Text>
          <Text style={styles.kpiValue}>{totalOrders}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Note moy.</Text>
          <Text style={[styles.kpiValue, { color: '#f59e0b' }]}>{data.avgRating > 0 ? `${data.avgRating}★` : '—'}</Text>
          <Text style={styles.kpiSub}>{data.totalReviews} avis</Text>
        </View>
      </View>

      {/* Weekly orders bar chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Commandes par semaine</Text>
        {data.weeklyOrders?.length === 0 ? (
          <Text style={styles.empty}>Pas de données</Text>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 4 }}>
            {data.weeklyOrders?.map((w: any) => (
              <View key={w.week} style={{ flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <Text style={{ fontSize: 9, color: '#9f1239', fontWeight: '900', marginBottom: 2 }}>{w.count}</Text>
                <View style={{ width: '100%', height: Math.max(4, (w.count / maxWeek) * 72), backgroundColor: '#9f1239', borderRadius: 4 }} />
                <Text style={{ fontSize: 8, color: '#94a3b8', marginTop: 3 }}>{w.week.slice(5)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Status breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Répartition des statuts</Text>
        {statusEntries.map(([status, count]) => (
          <View key={status} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 13, color: '#334155', fontWeight: '600' }}>{STATUS_LABELS[status] || status}</Text>
              <Text style={{ fontSize: 13, color: '#0f172a', fontWeight: '900' }}>{count} ({totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0}%)</Text>
            </View>
            <View style={{ height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
              <View style={{ height: '100%', borderRadius: 4, width: `${totalOrders > 0 ? (count / totalOrders) * 100 : 0}%`, backgroundColor: STATUS_COLORS[status] || '#94a3b8' }} />
            </View>
          </View>
        ))}
      </View>

      {/* Top products */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top 5 produits</Text>
        {data.topProducts?.length === 0 ? (
          <Text style={styles.empty}>Pas de ventes encore</Text>
        ) : data.topProducts?.map((p: any, i: number) => (
          <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f8fafc', gap: 10 }}>
            <Text style={{ fontSize: 14, fontWeight: '900', color: '#94a3b8', width: 24 }}>#{i + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }} numberOfLines={1}>{p.title}</Text>
              <Text style={{ fontSize: 11, color: '#94a3b8' }}>{p.quantity} ventes</Text>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '900', color: '#9f1239' }}>{p.revenue.toFixed(2)} TND</Text>
          </View>
        ))}
      </View>

      {/* Revenue by category */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Revenus par catégorie</Text>
        {data.byCategory?.map((c: any) => (
          <View key={c.category} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 13, color: '#334155', fontWeight: '600' }}>{c.category}</Text>
              <Text style={{ fontSize: 13, color: '#9f1239', fontWeight: '900' }}>{c.revenue.toFixed(2)} TND</Text>
            </View>
            <View style={{ height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
              <View style={{ height: '100%', borderRadius: 4, width: `${(c.revenue / maxCat) * 100}%`, backgroundColor: '#9f1239' }} />
            </View>
          </View>
        ))}
      </View>

      {/* Rating distribution */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Distribution des notes</Text>
        {data.totalReviews === 0 ? (
          <Text style={styles.empty}>Pas d'avis encore</Text>
        ) : [5, 4, 3, 2, 1].map(r => {
          const entry = data.ratingDist?.find((d: any) => d.rating === r);
          const count = entry?.count || 0;
          return (
            <View key={r} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
              <Text style={{ color: '#f59e0b', fontWeight: '900', width: 52, fontSize: 11 }}>{'★'.repeat(r)}</Text>
              <View style={{ flex: 1, height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ height: '100%', borderRadius: 4, width: `${maxRating > 0 ? (count / maxRating) * 100 : 0}%`, backgroundColor: '#f59e0b' }} />
              </View>
              <Text style={{ color: '#94a3b8', fontSize: 12, width: 20, textAlign: 'right' }}>{count}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: '#0f172a', marginBottom: 16 },
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  kpiCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  kpiLabel: { fontSize: 10, color: '#94a3b8', marginBottom: 2 },
  kpiValue: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  kpiSub: { fontSize: 9, color: '#94a3b8', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  cardTitle: { fontSize: 15, fontWeight: '900', color: '#0f172a', marginBottom: 14 },
  empty: { color: '#94a3b8', textAlign: 'center', paddingVertical: 20 },
});
