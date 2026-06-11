import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { flightAPI } from '../services/api';

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function priceColor(price, min, max) {
  if (!price) return COLORS.surface;
  const range = max - min || 1;
  const ratio = (price - min) / range;
  if (ratio < 0.33) return '#065F46'; // green
  if (ratio < 0.66) return '#92400E'; // amber
  return '#7F1D1D'; // red
}

function priceTextColor(price, min, max) {
  if (!price) return COLORS.subtle;
  return '#fff';
}

export default function PriceCalendarScreen({ navigation, route }) {
  const { origin, dest, passengers = 1 } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [calData, setCalData] = useState({});
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [stats, setStats] = useState({ min: 0, avg: 0, max: 0, cheapestDay: null });

  useEffect(() => {
    if (origin && dest) loadCalendar();
  }, [origin, dest, currentMonth]);

  const loadCalendar = async () => {
    setLoading(true);
    try {
      const res = await flightAPI.calendar({ origin: origin?.code, dest: dest?.code, month: currentMonth, passengers });
      const days = res.data.days || {};
      setCalData(days);
      computeStats(days);
    } catch {
      generateFakeCalendar();
    }
    setLoading(false);
  };

  const generateFakeCalendar = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const fake = {};
    const base = 60 + Math.random() * 80;
    for (let d = 1; d <= daysInMonth; d++) {
      const day = `${currentMonth}-${String(d).padStart(2, '0')}`;
      if (Math.random() > 0.1) {
        fake[day] = { price: Math.round((base + (Math.random() - 0.5) * 40) * 10) / 10, currency: 'EUR' };
      }
    }
    setCalData(fake);
    computeStats(fake);
  };

  const computeStats = (days) => {
    const prices = Object.values(days).filter((d) => d.price).map((d) => d.price);
    if (!prices.length) return;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const cheapestDay = Object.entries(days).find(([, v]) => v.price === min)?.[0];
    setStats({ min, max, avg, cheapestDay });
  };

  const prevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
    setCurrentMonth(prev);
  };

  const nextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
    setCurrentMonth(next);
  };

  const [year, month] = currentMonth.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  const offset = (firstDay + 6) % 7; // Monday-first

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const priceList = Object.values(calData).filter((d) => d.price).map((d) => d.price);
  const minPrice = priceList.length ? Math.min(...priceList) : 0;
  const maxPrice = priceList.length ? Math.max(...priceList) : 0;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Calendrier des prix</Text>
          {origin && dest && (
            <Text style={s.headerSub}>{origin.code} → {dest.code}</Text>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Stats */}
        <View style={s.statsRow}>
          <View style={[s.statCard, { borderColor: '#065F46' }]}>
            <Text style={s.statLabel}>Min</Text>
            <Text style={[s.statValue, { color: COLORS.success }]}>{stats.min}€</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statLabel}>Moy.</Text>
            <Text style={s.statValue}>{stats.avg}€</Text>
          </View>
          <View style={[s.statCard, { borderColor: '#7F1D1D' }]}>
            <Text style={s.statLabel}>Max</Text>
            <Text style={[s.statValue, { color: COLORS.danger }]}>{stats.max}€</Text>
          </View>
        </View>

        {/* Month nav */}
        <View style={s.monthNav}>
          <TouchableOpacity style={s.navBtn} onPress={prevMonth}>
            <Text style={s.navBtnTxt}>‹</Text>
          </TouchableOpacity>
          <Text style={s.monthLabel}>{monthLabel}</Text>
          <TouchableOpacity style={s.navBtn} onPress={nextMonth}>
            <Text style={s.navBtnTxt}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={s.daysHeader}>
          {DAYS.map((d) => (
            <Text key={d} style={s.dayHeader}>{d}</Text>
          ))}
        </View>

        {/* Grid */}
        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 40 }} />
        ) : (
          <View style={s.grid}>
            {cells.map((day, i) => {
              if (!day) return <View key={`empty-${i}`} style={s.cellEmpty} />;
              const dateKey = `${currentMonth}-${String(day).padStart(2, '0')}`;
              const data = calData[dateKey];
              const isMin = data?.price === minPrice && minPrice > 0;
              const bg = data ? priceColor(data.price, minPrice, maxPrice) : COLORS.card;
              return (
                <TouchableOpacity
                  key={dateKey}
                  style={[s.cell, { backgroundColor: bg }, isMin && s.cellMin]}
                  onPress={() => {
                    if (origin && dest && data) {
                      navigation.navigate('FlightResults', {
                        outbound: [], inbound: [],
                        search: { date: dateKey, passengers },
                        origin, dest, tripType: 'ONE_WAY',
                      });
                    }
                  }}
                >
                  <Text style={[s.cellDay, data && { color: '#fff' }]}>{day}</Text>
                  {data ? (
                    <Text style={s.cellPrice}>{Math.round(data.price)}€</Text>
                  ) : (
                    <Text style={s.cellNA}>—</Text>
                  )}
                  {isMin && <Text style={s.starBadge}>★</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Legend */}
        <View style={s.legend}>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: '#065F46' }]} />
            <Text style={s.legendTxt}>Bon prix</Text>
          </View>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: '#92400E' }]} />
            <Text style={s.legendTxt}>Moyen</Text>
          </View>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: '#7F1D1D' }]} />
            <Text style={s.legendTxt}>Élevé</Text>
          </View>
          <View style={s.legendItem}>
            <Text style={s.starBadge}>★</Text>
            <Text style={s.legendTxt}>Moins cher</Text>
          </View>
        </View>

        {stats.cheapestDay && (
          <View style={s.tipCard}>
            <Text style={s.tipTitle}>💡 Meilleur jour ce mois</Text>
            <Text style={s.tipBody}>
              Le {new Date(stats.cheapestDay).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à partir de{' '}
              <Text style={{ color: COLORS.success, fontWeight: '800' }}>{stats.min}€</Text>
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const CELL_SIZE = 48;

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.bg },
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn:    { marginRight: 12, padding: 4 },
  backIcon:   { color: COLORS.accent, fontSize: 22 },
  headerTitle:{ color: COLORS.text, fontSize: 17, fontWeight: '800' },
  headerSub:  { color: COLORS.muted, fontSize: 12 },
  scroll:     { padding: 16 },
  statsRow:   { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard:   { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statLabel:  { color: COLORS.muted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  statValue:  { color: COLORS.text, fontSize: 20, fontWeight: '900' },
  monthNav:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn:     { backgroundColor: COLORS.surface, borderRadius: 10, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  navBtnTxt:  { color: COLORS.accent, fontSize: 20, fontWeight: '700' },
  monthLabel: { color: COLORS.text, fontSize: 16, fontWeight: '800', textTransform: 'capitalize' },
  daysHeader: { flexDirection: 'row', marginBottom: 8 },
  dayHeader:  { flex: 1, textAlign: 'center', color: COLORS.muted, fontSize: 12, fontWeight: '700' },
  grid:       { flexDirection: 'row', flexWrap: 'wrap' },
  cell:       { width: `${100 / 7}%`, aspectRatio: 0.85, padding: 4, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: 'transparent', position: 'relative' },
  cellMin:    { borderColor: COLORS.success, borderWidth: 1.5 },
  cellEmpty:  { width: `${100 / 7}%`, aspectRatio: 0.85 },
  cellDay:    { color: COLORS.subtle, fontSize: 11, fontWeight: '700' },
  cellPrice:  { color: '#fff', fontSize: 10, fontWeight: '800' },
  cellNA:     { color: COLORS.subtle, fontSize: 14 },
  starBadge:  { color: '#FFD700', fontSize: 11, position: 'absolute', top: 2, right: 4 },
  legend:     { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendTxt:  { color: COLORS.muted, fontSize: 12 },
  tipCard:    { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 1, borderColor: COLORS.border },
  tipTitle:   { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 6 },
  tipBody:    { color: COLORS.muted, fontSize: 13 },
});
