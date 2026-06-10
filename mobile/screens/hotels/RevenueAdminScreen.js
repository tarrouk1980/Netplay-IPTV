import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated, RefreshControl, Dimensions, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Polyline, Circle, G, Text as SvgText, Line } from 'react-native-svg';
import api from '../../services/api';

const { width } = Dimensions.get('window');

const PROVIDER_COLORS_MAP = {
  'Booking.com': '#003580',
  'Booking': '#003580',
  'Expedia': '#FFC72C',
  'Hotels.com': '#CC0000',
  'Airbnb': '#FF5A5F',
  'Direct': '#28A745',
};

function getProviderColor(name) {
  for (const [k, v] of Object.entries(PROVIDER_COLORS_MAP)) {
    if (name && name.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return '#8884d8';
}

const MOCK_DAILY = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  revenue: 80 + Math.round(Math.sin(i * 0.4) * 40 + Math.random() * 50),
}));

const MOCK_ADVERTISERS = [
  { name: 'Booking.com', clicks: 1240, cpc: 1.20, totalSpent: 1488, status: 'Actif' },
  { name: 'Expedia', clicks: 830, cpc: 0.95, totalSpent: 788.5, status: 'Actif' },
  { name: 'Hotels.com', clicks: 610, cpc: 1.10, totalSpent: 671, status: 'Actif' },
  { name: 'Airbnb', clicks: 320, cpc: 0.80, totalSpent: 256, status: 'Pause' },
  { name: 'Direct', clicks: 150, cpc: 0.50, totalSpent: 75, status: 'Actif' },
];

const MOCK_TOP_HOTELS = [
  { name: 'Hôtel El Mouradi Hammamet', revenue: 520, medals: '🥇' },
  { name: 'Radisson Blu Tunis', revenue: 410, medals: '🥈' },
  { name: 'Riu Tikida Palmeraie', revenue: 380, medals: '🥉' },
  { name: 'Four Seasons Tunis', revenue: 310, medals: '4️⃣' },
  { name: 'Concorde Green Park', revenue: 280, medals: '5️⃣' },
];

const PERIODS = ['Cette semaine', 'Ce mois', 'Cette année'];

function AnimatedCounter({ target, duration = 1200, prefix = '', suffix = '' }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: target, duration, useNativeDriver: false }).start();
    const listener = anim.addListener(({ value }) => {
      setDisplay(Math.round(value).toLocaleString('fr-FR'));
    });
    return () => anim.removeListener(listener);
  }, [target]);

  return <Text style={styles.kpiValue}>{prefix}{display}{suffix}</Text>;
}

function LineChart({ data, color = '#FF6B35', height = 120 }) {
  const chartWidth = width - 64;
  const maxVal = Math.max(...data.map(d => d.revenue), 1);
  const minVal = Math.min(...data.map(d => d.revenue));
  const range = maxVal - minVal || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * chartWidth;
    const y = height - ((d.revenue - minVal) / range) * (height - 20) - 10;
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  // Create a filled path
  const firstPt = pts[0].split(',');
  const lastPt = pts[pts.length - 1].split(',');
  const areaPath = `M${pts[0]} ${pts.map(p => 'L' + p).join(' ')} L${lastPt[0]},${height} L${firstPt[0]},${height} Z`;

  return (
    <Svg width={chartWidth} height={height + 10}>
      <Path d={areaPath} fill={color + '22'} />
      <Polyline points={polyline} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => {
        if (i % 6 !== 0 && i !== data.length - 1) return null;
        const [x, y] = pts[i].split(',');
        return <Circle key={i} cx={x} cy={y} r={3} fill={color} />;
      })}
    </Svg>
  );
}

function DonutChart({ slices, size = 150 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 20;
  const total = slices.reduce((s, sl) => s + sl.value, 0) || 1;
  let angle = -Math.PI / 2;
  const paths = slices.map((sl, i) => {
    const sweep = (sl.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    return <Path key={i} d={d} fill={sl.color} opacity={0.9} />;
  });
  return (
    <Svg width={size} height={size}>
      {paths}
      <Circle cx={cx} cy={cy} r={r * 0.55} fill="#fff" />
    </Svg>
  );
}

export default function RevenueAdminScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [advertisers, setAdvertisers] = useState(MOCK_ADVERTISERS);
  const [period, setPeriod] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState(MOCK_DAILY);

  useEffect(() => { loadData(); }, [period]);

  async function loadData() {
    setLoading(true);
    try {
      const [statsRes, advRes] = await Promise.allSettled([
        api.get('/api/cpc/stats'),
        api.get('/api/cpc/advertisers'),
      ]);
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value?.data?.data || null);
        if (statsRes.value?.data?.data?.daily) setDailyData(statsRes.value.data.data.daily);
      }
      if (advRes.status === 'fulfilled' && advRes.value?.data?.data?.length) {
        setAdvertisers(advRes.value.data.data);
      }
    } catch {}
    setLoading(false);
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [period]);

  const totalRevenue = stats?.totalRevenue ?? 3278.5;
  const totalClicks = stats?.totalClicks ?? 3150;
  const avgCpc = stats?.avgCpc ?? 1.04;
  const ctr = stats?.ctr ?? 4.2;

  const donutSlices = advertisers.slice(0, 5).map(a => ({
    value: a.totalSpent,
    color: getProviderColor(a.name),
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4F8' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35']} />}
      >
        {/* Header */}
        <LinearGradient colors={['#004E89', '#FF6B35']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Tableau de Bord Revenus</Text>
            <Text style={styles.headerSub}>EasyHotels · Monétisation CPC</Text>
          </View>
          <View style={{ width: 38 }} />
        </LinearGradient>

        {/* Period toggle */}
        <View style={styles.periodRow}>
          {PERIODS.map((p, i) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodChip, period === i && styles.periodChipActive]}
              onPress={() => setPeriod(i)}
            >
              <Text style={[styles.periodText, period === i && styles.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KPI cards */}
        <View style={styles.kpiGrid}>
          {[
            { label: 'Revenus Total', value: totalRevenue, suffix: ' TND', icon: 'cash', color: '#FF6B35' },
            { label: 'Clics Total', value: totalClicks, suffix: '', icon: 'finger-print', color: '#004E89' },
            { label: 'CPC Moyen', value: avgCpc * 100, suffix: ' m', prefix: '', icon: 'trending-up', color: '#38A169' },
            { label: 'CTR', value: ctr * 10, suffix: '%', icon: 'stats-chart', color: '#805AD5' },
          ].map((kpi, i) => (
            <View key={i} style={styles.kpiCard}>
              <View style={[styles.kpiIcon, { backgroundColor: kpi.color + '20' }]}>
                <Ionicons name={kpi.icon + '-outline'} size={20} color={kpi.color} />
              </View>
              <AnimatedCounter target={kpi.value} prefix={kpi.prefix || ''} suffix={kpi.suffix} />
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        {/* Revenue trend chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tendance des revenus (30 jours)</Text>
          <LineChart data={dailyData} color="#FF6B35" height={130} />
          <View style={styles.chartLegend}>
            <View style={[styles.legendDot, { backgroundColor: '#FF6B35' }]} />
            <Text style={styles.legendText}>Revenus journaliers (TND)</Text>
          </View>
        </View>

        {/* Donut chart by provider */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Revenus par partenaire</Text>
          <View style={styles.donutRow}>
            <DonutChart slices={donutSlices} size={160} />
            <View style={styles.donutLegend}>
              {advertisers.slice(0, 5).map((a, i) => (
                <View key={i} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: getProviderColor(a.name) }]} />
                  <View>
                    <Text style={styles.legendName}>{a.name}</Text>
                    <Text style={styles.legendAmt}>{a.totalSpent.toFixed(0)} TND</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Top 5 hotels */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top 5 Hôtels Générateurs</Text>
          {MOCK_TOP_HOTELS.map((h, i) => (
            <View key={i} style={styles.topHotelRow}>
              <Text style={styles.hotelMedal}>{h.medals}</Text>
              <Text style={styles.topHotelName} numberOfLines={1}>{h.name}</Text>
              <Text style={styles.topHotelRevenue}>{h.revenue} TND</Text>
            </View>
          ))}
        </View>

        {/* Advertisers table */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Annonceurs</Text>
          {/* Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Partenaire</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Clics</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>CPC</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Dépenses</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Statut</Text>
          </View>
          {advertisers.map((a, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
              <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.providerDot, { backgroundColor: getProviderColor(a.name) }]} />
                <Text style={styles.tableCell} numberOfLines={1}>{a.name}</Text>
              </View>
              <Text style={styles.tableCell}>{a.clicks.toLocaleString('fr-FR')}</Text>
              <Text style={styles.tableCell}>{a.cpc?.toFixed(2)} TND</Text>
              <Text style={styles.tableCell}>{a.totalSpent?.toFixed(0)} TND</Text>
              <View style={[styles.statusChip, { backgroundColor: a.status === 'Actif' ? '#C6F6D5' : '#FED7D7' }]}>
                <Text style={[styles.statusText, { color: a.status === 'Actif' ? '#276749' : '#C53030' }]}>{a.status}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 54, paddingBottom: 20, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900', textAlign: 'center' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2, textAlign: 'center' },
  periodRow: { flexDirection: 'row', margin: 16, gap: 8 },
  periodChip: { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  periodChipActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  periodText: { fontSize: 12, fontWeight: '700', color: '#718096' },
  periodTextActive: { color: '#fff' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  kpiCard: { width: (width - 40) / 2, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  kpiIcon: { borderRadius: 10, padding: 8, marginBottom: 8 },
  kpiValue: { fontSize: 22, fontWeight: '900', color: '#1A202C', marginBottom: 4 },
  kpiLabel: { fontSize: 12, color: '#718096', fontWeight: '600' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: '#1A202C', marginBottom: 14 },
  chartLegend: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: '#718096' },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  donutLegend: { flex: 1, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendName: { fontSize: 12, fontWeight: '700', color: '#2D3748' },
  legendAmt: { fontSize: 11, color: '#718096' },
  topHotelRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F7FAFC' },
  hotelMedal: { fontSize: 20, width: 32 },
  topHotelName: { flex: 1, fontSize: 13, fontWeight: '700', color: '#2D3748' },
  topHotelRevenue: { fontSize: 14, fontWeight: '900', color: '#FF6B35' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 4 },
  tableRowAlt: { backgroundColor: '#F7FAFC', borderRadius: 6 },
  tableHeader: { borderBottomWidth: 2, borderBottomColor: '#E2E8F0', marginBottom: 4 },
  tableHeaderText: { fontWeight: '800', color: '#718096', fontSize: 11 },
  tableCell: { flex: 1, fontSize: 12, color: '#2D3748', fontWeight: '600' },
  providerDot: { width: 8, height: 8, borderRadius: 4 },
  statusChip: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: '800' },
});
