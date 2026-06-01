import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';

import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', danger: '#E74C3C',
  blue: '#1565C0', purple: '#7B1FA2',
};

const PERIODS = [
  { key: 'today', label: "Auj." },
  { key: 'week', label: '7j' },
  { key: 'month', label: '30j' },
];

const MOCK = {
  today: {
    revenue: 340, orders: 17, avgOrder: 20, rating: 4.7,
    growth: +8.2, newCustomers: 5, repeatCustomers: 12,
    topProducts: [
      { name: 'Pizza Margherita', qty: 8, revenue: 96, emoji: '🍕' },
      { name: 'Burger Classic', qty: 6, revenue: 78, emoji: '🍔' },
      { name: 'Salade César', qty: 5, revenue: 45, emoji: '🥗' },
      { name: 'Tiramisu', qty: 4, revenue: 36, emoji: '🍮' },
    ],
    hourlyChart: [0, 0, 0, 0, 0, 2, 8, 12, 15, 18, 22, 25, 28, 24, 20, 18, 22, 28, 32, 30, 25, 18, 10, 4],
    reviews: [
      { name: 'Mohamed B.', stars: 5, text: 'Excellent ! Livraison rapide et plats délicieux.' },
      { name: 'Sana G.', stars: 4, text: 'Très bien, un peu de retard mais qualité au rendez-vous.' },
    ],
    statusBreakdown: { COMPLETED: 14, CANCELLED: 2, PENDING: 1 },
  },
  week: {
    revenue: 2100, orders: 105, avgOrder: 20, rating: 4.6,
    growth: +12.5, newCustomers: 28, repeatCustomers: 77,
    topProducts: [
      { name: 'Pizza Margherita', qty: 52, revenue: 624, emoji: '🍕' },
      { name: 'Burger Classic', qty: 38, revenue: 494, emoji: '🍔' },
      { name: 'Salade César', qty: 29, revenue: 261, emoji: '🥗' },
      { name: 'Tiramisu', qty: 22, revenue: 198, emoji: '🍮' },
      { name: 'Jus Frais', qty: 35, revenue: 175, emoji: '🥤' },
    ],
    hourlyChart: [10, 8, 5, 3, 2, 15, 60, 85, 100, 120, 145, 160, 175, 155, 130, 110, 145, 180, 210, 195, 160, 110, 65, 25],
    reviews: [
      { name: 'Mohamed B.', stars: 5, text: 'Excellent ! Toujours fidèle à cette adresse.' },
      { name: 'Lina D.', stars: 5, text: 'La meilleure pizza de Tunis sans hésiter !' },
      { name: 'Karim S.', stars: 3, text: 'Bonne qualité mais commande incomplète cette fois.' },
    ],
    statusBreakdown: { COMPLETED: 96, CANCELLED: 7, PENDING: 2 },
  },
  month: {
    revenue: 8400, orders: 420, avgOrder: 20, rating: 4.7,
    growth: +18.9, newCustomers: 95, repeatCustomers: 325,
    topProducts: [
      { name: 'Pizza Margherita', qty: 205, revenue: 2460, emoji: '🍕' },
      { name: 'Burger Classic', qty: 148, revenue: 1924, emoji: '🍔' },
      { name: 'Salade César', qty: 112, revenue: 1008, emoji: '🥗' },
      { name: 'Tiramisu', qty: 89, revenue: 801, emoji: '🍮' },
      { name: 'Jus Frais', qty: 136, revenue: 680, emoji: '🥤' },
    ],
    hourlyChart: [30, 20, 10, 8, 5, 50, 220, 310, 380, 440, 520, 590, 640, 570, 490, 420, 520, 640, 750, 700, 580, 400, 240, 90],
    reviews: [
      { name: 'Mohamed B.', stars: 5, text: 'Toujours excellent !' },
      { name: 'Asma K.', stars: 5, text: 'Meilleur resto de livraison.' },
      { name: 'Omar C.', stars: 4, text: 'Très bon mais parfois un peu lent.' },
      { name: 'Ines F.', stars: 2, text: 'Commande arrivée froide cette fois.' },
    ],
    statusBreakdown: { COMPLETED: 385, CANCELLED: 28, PENDING: 7 },
  },
};

function MiniBarChart({ data, color, max: maxOverride }) {
  const show = data.slice(6, 22);
  const max = maxOverride || Math.max(...show, 1);
  const labels = ['06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'];
  return (
    <View style={chart.row}>
      {show.map((v, i) => {
        const h = Math.max(3, Math.round((v / max) * 60));
        return (
          <View key={i} style={chart.col}>
            <View style={[chart.bar, { height: h, backgroundColor: color }]} />
            {i % 3 === 0 && <Text style={chart.label}>{labels[i]}</Text>}
          </View>
        );
      })}
    </View>
  );
}
const chart = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', height: 72, gap: 3 },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 2 },
  label: { color: COLORS.muted, fontSize: 8, marginTop: 3 },
});

function Stars({ count }) {
  return (
    <Text style={{ color: COLORS.accent, fontSize: 13 }}>
      {'★'.repeat(Math.round(count))}{'☆'.repeat(5 - Math.round(count))}
    </Text>
  );
}

export default function MerchantStatsScreen({ navigation }) {
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState(MOCK.week);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (p) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/delivery/merchant/stats?period=${p}`);
      setData(res.data);
    } catch {
      setData(MOCK[p] || MOCK.week);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(period); }, [period]);

  const exportCSV = async () => {
    const rows = [
      `Période,${period}`,
      `Revenus TND,${data.revenue}`,
      `Commandes,${data.orders}`,
      `Panier moyen,${data.avgOrder}`,
      `Note moyenne,${data.rating}`,
      '',
      'Produit,Quantité,Revenus TND',
      ...(data.topProducts || []).map(p => `${p.name},${p.qty},${p.revenue}`),
    ];
    const path = FileSystem.documentDirectory + `merchant_stats_${period}_${Date.now()}.csv`;
    await FileSystem.writeAsStringAsync(path, rows.join('\n'), { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Exporter les statistiques' });
  };

  const totalReviews = data.reviews?.length || 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📊 Statistiques</Text>
        <TouchableOpacity onPress={exportCSV} style={styles.exportBtn}>
          <Text style={styles.exportBtnText}>CSV</Text>
        </TouchableOpacity>
      </View>

      {/* Period tabs */}
      <View style={styles.periodRow}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p.key}
            style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[styles.periodLabel, period === p.key && styles.periodLabelActive]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={COLORS.accent} size="large" /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* KPI grid */}
          <View style={styles.kpiGrid}>
            {[
              { emoji: '💰', value: `${data.revenue} TND`, label: 'Revenus', color: COLORS.accent },
              { emoji: '📦', value: data.orders, label: 'Commandes', color: COLORS.blue },
              { emoji: '🛒', value: `${data.avgOrder} TND`, label: 'Panier moyen', color: COLORS.green },
              { emoji: '⭐', value: data.rating?.toFixed(1), label: 'Note moy.', color: '#FFD700' },
            ].map(k => (
              <View key={k.label} style={styles.kpiCard}>
                <Text style={styles.kpiEmoji}>{k.emoji}</Text>
                <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
                <Text style={styles.kpiLabel}>{k.label}</Text>
              </View>
            ))}
          </View>

          {/* Growth + customers */}
          <View style={styles.growthRow}>
            <View style={[styles.growthChip, { borderColor: (data.growth || 0) >= 0 ? COLORS.green : COLORS.danger }]}>
              <Text style={[styles.growthValue, { color: (data.growth || 0) >= 0 ? COLORS.green : COLORS.danger }]}>
                {(data.growth || 0) >= 0 ? '↑' : '↓'} {Math.abs(data.growth || 0)}%
              </Text>
              <Text style={styles.growthLabel}>vs période préc.</Text>
            </View>
            <View style={styles.customerChip}>
              <Text style={styles.custNum}>{data.newCustomers}</Text>
              <Text style={styles.custLabel}>nouveaux clients</Text>
            </View>
            <View style={styles.customerChip}>
              <Text style={styles.custNum}>{data.repeatCustomers}</Text>
              <Text style={styles.custLabel}>fidèles</Text>
            </View>
          </View>

          {/* Orders status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statut des commandes</Text>
            <View style={styles.statusRow}>
              {Object.entries(data.statusBreakdown || {}).map(([s, v]) => {
                const cfg = { COMPLETED: { c: COLORS.green, l: 'Terminées' }, CANCELLED: { c: COLORS.danger, l: 'Annulées' }, PENDING: { c: COLORS.accent, l: 'En attente' } }[s] || { c: COLORS.muted, l: s };
                return (
                  <View key={s} style={[styles.statusCard, { borderTopColor: cfg.c }]}>
                    <Text style={[styles.statusNum, { color: cfg.c }]}>{v}</Text>
                    <Text style={styles.statusLabel}>{cfg.l}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Hourly chart */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activité par heure (06h–21h)</Text>
            <MiniBarChart data={data.hourlyChart || []} color={COLORS.accent} />
          </View>

          {/* Top products */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top produits</Text>
            {(data.topProducts || []).map((p, i) => {
              const maxRev = data.topProducts[0]?.revenue || 1;
              return (
                <View key={i} style={styles.productRow}>
                  <Text style={styles.productRank}>{i + 1}</Text>
                  <Text style={styles.productEmoji}>{p.emoji}</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={styles.productTop}>
                      <Text style={styles.productName}>{p.name}</Text>
                      <Text style={styles.productRevenue}>{p.revenue} TND</Text>
                    </View>
                    <View style={styles.productBar}>
                      <View style={[styles.productFill, { width: `${(p.revenue / maxRev) * 100}%` }]} />
                    </View>
                    <Text style={styles.productQty}>{p.qty} vendus</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avis récents · {totalReviews} évaluation{totalReviews > 1 ? 's' : ''}</Text>
            {(data.reviews || []).map((r, i) => (
              <View key={i} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>{(r.name || '?')[0]}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.reviewName}>{r.name}</Text>
                    <Stars count={r.stars} />
                  </View>
                </View>
                <Text style={styles.reviewText}>{r.text}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, alignItems: 'center' },
  backText: { color: COLORS.white, fontSize: 28 },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  exportBtn: { backgroundColor: COLORS.surface, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.accent },
  exportBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
  periodRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  periodBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  periodBtnActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  periodLabel: { color: COLORS.muted, fontSize: 14 },
  periodLabelActive: { color: COLORS.accent, fontWeight: '700' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 0 },
  kpiCard: {
    width: '48%', margin: '1%', backgroundColor: COLORS.surface,
    borderRadius: 14, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  kpiEmoji: { fontSize: 24, marginBottom: 6 },
  kpiValue: { fontSize: 22, fontWeight: '800', marginBottom: 3 },
  kpiLabel: { color: COLORS.muted, fontSize: 12 },
  growthRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  growthChip: {
    flex: 1.5, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1,
  },
  growthValue: { fontSize: 18, fontWeight: '800' },
  growthLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  customerChip: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  custNum: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
  custLabel: { color: COLORS.muted, fontSize: 10, textAlign: 'center', marginTop: 2 },
  section: {
    backgroundColor: COLORS.surface, margin: 12, marginTop: 0, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8,
  },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusCard: {
    flex: 1, backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 12,
    alignItems: 'center', borderTopWidth: 3, borderWidth: 1, borderColor: COLORS.border,
  },
  statusNum: { fontSize: 20, fontWeight: '800', marginBottom: 3 },
  statusLabel: { color: COLORS.muted, fontSize: 11, textAlign: 'center' },
  productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  productRank: { color: COLORS.muted, fontSize: 14, fontWeight: '700', width: 18 },
  productEmoji: { fontSize: 22 },
  productTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  productName: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  productRevenue: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  productBar: { height: 5, backgroundColor: COLORS.border, borderRadius: 3, marginBottom: 3 },
  productFill: { height: 5, backgroundColor: COLORS.accent, borderRadius: 3 },
  productQty: { color: COLORS.muted, fontSize: 11 },
  reviewCard: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 8,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accent + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  reviewAvatarText: { color: COLORS.accent, fontWeight: '700', fontSize: 15 },
  reviewName: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  reviewText: { color: COLORS.muted, fontSize: 13, lineHeight: 18 },
});
