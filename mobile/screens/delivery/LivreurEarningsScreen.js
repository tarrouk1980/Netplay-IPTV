import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

const PERIODS = [
  { key: 'today', label: "Aujourd'hui" },
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
];

export default function LivreurEarningsScreen({ navigation }) {
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/delivery/livreur/earnings', { params: { period } })
      .then(r => { setData(r.data); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes gains livraison</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 60 }} />
      ) : error ? (
        <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 30 }}>
          <Text style={{ fontSize: 40 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, marginTop: 12, textAlign: 'center' }}>
            Impossible de charger vos gains.
          </Text>
          <TouchableOpacity onPress={load} style={{ marginTop: 14, backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Period Tabs */}
          <View style={styles.tabsRow}>
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p.key}
                style={[styles.tab, period === p.key && styles.tabActive]}
                onPress={() => setPeriod(p.key)}
              >
                <Text style={[styles.tabText, period === p.key && styles.tabTextActive]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Revenu</Text>
              <Text style={styles.summaryValue}>{data.totalRevenue.toFixed(2)}</Text>
              <Text style={styles.summaryUnit}>TND</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Pourboires</Text>
              <Text style={styles.summaryValue}>{data.totalTips.toFixed(2)}</Text>
              <Text style={styles.summaryUnit}>TND</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Moy./livraison</Text>
              <Text style={styles.summaryValue}>{data.avgPerDelivery.toFixed(2)}</Text>
              <Text style={styles.summaryUnit}>TND</Text>
            </View>
          </View>

          {/* Performance Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>📦</Text>
              <Text style={styles.statValue}>{data.totalDeliveries}</Text>
              <Text style={styles.statLabel}>Livraisons réussies</Text>
            </View>
          </View>

          {/* Deliveries List */}
          <Text style={styles.sectionTitle}>Livraisons récentes</Text>
          {data.orders.length === 0 ? (
            <Text style={{ color: COLORS.muted, textAlign: 'center', marginTop: 10 }}>Aucune livraison sur cette période</Text>
          ) : data.orders.map((o) => (
            <View key={o.id} style={styles.deliveryCard}>
              <View style={styles.deliveryLeft}>
                <Text style={styles.deliveryTime}>{new Date(o.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</Text>
                <Text style={styles.deliveryRoute}>{o.client?.name || 'Client'}</Text>
                <Text style={styles.deliveryAddress} numberOfLines={1}>{o.destinationAddress || o.originAddress || ''}</Text>
              </View>
              <View style={styles.deliveryRight}>
                <Text style={styles.deliveryAmount}>{Number(o.finalPrice ?? o.price ?? 0).toFixed(2)}</Text>
                <Text style={styles.deliveryAmountUnit}>TND</Text>
                {o.tips && o.tips.length > 0 && (
                  <View style={styles.bonusBadge}>
                    <Text style={styles.bonusBadgeText}>+{o.tips.reduce((s, t) => s + Number(t.amount || 0), 0).toFixed(2)} pourboire</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backArrow: { color: COLORS.text, fontSize: 22 },
  headerTitle: { flex: 1, color: COLORS.text, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  headerRight: { width: 36 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryLabel: { color: COLORS.muted, fontSize: 11, marginBottom: 4, textAlign: 'center' },
  summaryValue: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  summaryUnit: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statEmoji: { fontSize: 20, marginBottom: 6 },
  statValue: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  statLabel: { color: COLORS.muted, fontSize: 10, textAlign: 'center' },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#000000' },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  deliveryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deliveryLeft: { flex: 1, marginRight: 8 },
  deliveryTime: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  deliveryRoute: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  deliveryAddress: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  deliveryMeta: { color: COLORS.muted, fontSize: 12 },
  deliveryRight: { alignItems: 'flex-end' },
  deliveryAmount: { color: COLORS.primary, fontSize: 18, fontWeight: '700' },
  deliveryAmountUnit: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  bonusBadge: {
    backgroundColor: '#1A3A1A',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#2ECC71',
  },
  bonusBadgeText: { color: '#2ECC71', fontSize: 10, fontWeight: '600' },
});
