import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceLight: '#2A2A3A',
  primary: '#6C63FF',
  success: '#00C896',
  warning: '#FFB020',
  danger: '#FF4D4D',
  text: '#FFFFFF',
  textSecondary: '#9999BB',
  border: '#2E2E42',
};

const MOCK_DATA = {
  today: {
    revenue: 1240.5,
    orders: 34,
    avgCart: 36.5,
    cancellationRate: 5.9,
    topProducts: [
      { name: 'Lait 1L', sold: 48, max: 48 },
      { name: 'Pain de mie', sold: 37, max: 48 },
      { name: 'Eau minérale 1.5L', sold: 29, max: 48 },
      { name: 'Yaourt nature', sold: 22, max: 48 },
      { name: 'Jus d\'orange', sold: 18, max: 48 },
    ],
    peakHours: [0,0,0,0,0,1,3,8,12,9,7,10,14,11,8,6,9,13,15,12,7,4,2,1],
  },
  week: {
    revenue: 8730.0,
    orders: 214,
    avgCart: 40.8,
    cancellationRate: 4.2,
    topProducts: [
      { name: 'Lait 1L', sold: 310, max: 310 },
      { name: 'Eau minérale 1.5L', sold: 278, max: 310 },
      { name: 'Pain de mie', sold: 245, max: 310 },
      { name: 'Yaourt nature', sold: 198, max: 310 },
      { name: 'Jus d\'orange', sold: 167, max: 310 },
    ],
    peakHours: [0,0,0,0,1,2,5,14,22,18,15,19,28,24,17,13,18,25,30,22,14,8,4,2],
  },
  month: {
    revenue: 34520.0,
    orders: 890,
    avgCart: 38.8,
    cancellationRate: 3.7,
    topProducts: [
      { name: 'Lait 1L', sold: 1240, max: 1240 },
      { name: 'Eau minérale 1.5L', sold: 1100, max: 1240 },
      { name: 'Pain de mie', sold: 980, max: 1240 },
      { name: 'Yaourt nature', sold: 820, max: 1240 },
      { name: 'Jus d\'orange', sold: 670, max: 1240 },
    ],
    peakHours: [1,0,0,0,1,3,8,22,40,35,28,36,52,45,32,24,34,48,56,42,26,15,8,3],
  },
};

export default function GroceryStoreAnalyticsScreen({ navigation }) {
  const [period, setPeriod] = useState('today');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (selectedPeriod) => {
    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 400));
      setData(MOCK_DATA[selectedPeriod]);
    } catch {
      setData(MOCK_DATA[selectedPeriod]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(period);
  }, [period]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(period);
    setRefreshing(false);
  };

  const periodLabels = { today: 'Aujourd\'hui', week: '7 jours', month: '30 jours' };

  const maxPeak = data ? Math.max(...data.peakHours, 1) : 1;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytique boutique</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.commissionBanner}>
        <Text style={styles.commissionText}>✓ Commission EasyWay : 0% — Vous gardez 100% de vos ventes</Text>
      </View>

      <View style={styles.periodRow}>
        {Object.entries(periodLabels).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.periodBtn, period === key && styles.periodBtnActive]}
            onPress={() => setPeriod(key)}
          >
            <Text style={[styles.periodBtnText, period === key && styles.periodBtnTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        >
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{data.revenue.toFixed(1)} TND</Text>
              <Text style={styles.kpiLabel}>Chiffre d'affaires</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{data.orders}</Text>
              <Text style={styles.kpiLabel}>Commandes</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{data.avgCart.toFixed(1)} TND</Text>
              <Text style={styles.kpiLabel}>Panier moyen</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={[styles.kpiValue, { color: data.cancellationRate > 8 ? COLORS.danger : COLORS.warning }]}>
                {data.cancellationRate}%
              </Text>
              <Text style={styles.kpiLabel}>Taux d'annulation</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top 5 produits vendus</Text>
            {data.topProducts.map((p, i) => (
              <View key={i} style={styles.productRow}>
                <Text style={styles.productRank}>#{i + 1}</Text>
                <View style={styles.productInfo}>
                  <View style={styles.productNameRow}>
                    <Text style={styles.productName}>{p.name}</Text>
                    <Text style={styles.productSold}>{p.sold} vendus</Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${(p.sold / p.max) * 100}%` }]} />
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Heures de pointe</Text>
            <View style={styles.peakChart}>
              {data.peakHours.map((val, h) => (
                <View key={h} style={styles.peakBarWrapper}>
                  <View style={styles.peakBarOuter}>
                    <View
                      style={[
                        styles.peakBarFill,
                        { height: `${(val / maxPeak) * 100}%` },
                      ]}
                    />
                  </View>
                  {h % 4 === 0 && (
                    <Text style={styles.peakLabel}>{h}h</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { fontSize: 22, color: COLORS.text },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  commissionBanner: {
    backgroundColor: COLORS.success + '22',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  commissionText: { color: COLORS.success, fontSize: 12, fontWeight: '600' },
  periodRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 4,
  },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  periodBtnActive: { backgroundColor: COLORS.primary },
  periodBtnText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  periodBtnTextActive: { color: COLORS.text },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40 },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12,
    marginBottom: 8,
  },
  kpiCard: {
    width: '47%',
    margin: '1.5%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  kpiValue: { fontSize: 22, fontWeight: '800', color: COLORS.primary, marginBottom: 4 },
  kpiLabel: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  productRank: { width: 28, fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  productInfo: { flex: 1 },
  productNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  productName: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  productSold: { fontSize: 12, color: COLORS.textSecondary },
  progressBg: { height: 6, backgroundColor: COLORS.surfaceLight, borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 3 },
  peakChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: 2,
  },
  peakBarWrapper: { flex: 1, alignItems: 'center', height: '100%' },
  peakBarOuter: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 2,
  },
  peakBarFill: { backgroundColor: COLORS.primary, borderRadius: 2, width: '100%' },
  peakLabel: { fontSize: 9, color: COLORS.textSecondary, marginTop: 2 },
});
