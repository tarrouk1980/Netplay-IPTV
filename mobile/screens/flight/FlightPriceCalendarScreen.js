import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  card: '#22223A',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  primary: '#1565C0',
  accent: '#42A5F5',
  low: '#27AE60',
  medium: '#F5A623',
  high: '#E74C3C',
  border: '#2E2E3F',
  disabled: '#2E2E3F',
};

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function getFirstDayOfWeek(year, month) {
  const d = new Date(year, month - 1, 1).getDay();
  return d === 0 ? 6 : d - 1; // Monday = 0
}

export default function FlightPriceCalendarScreen({ navigation, route }) {
  const { origin, dest, passengers = 1, onSelectDate } = route.params || {};

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [stats, setStats] = useState(null);

  const loadCalendar = useCallback(async () => {
    if (!origin || !dest) return;
    setLoading(true);
    try {
      const res = await api.get('/api/flights/calendar', {
        params: {
          origin: origin.code,
          dest: dest.code,
          month: `${year}-${String(month).padStart(2, '0')}`,
          passengers,
        },
      });
      setCalendar(res.data.calendar || []);
      const prices = res.data.calendar.filter((d) => d.available).map((d) => d.price);
      if (prices.length) {
        setStats({
          min: Math.min(...prices),
          max: Math.max(...prices),
          avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length * 10) / 10,
          currency: res.data.calendar.find((d) => d.available)?.currency || 'TND',
        });
      }
    } catch {
      setCalendar([]);
    } finally {
      setLoading(false);
    }
  }, [origin, dest, year, month, passengers]);

  useEffect(() => { loadCalendar(); }, [loadCalendar]);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const isPast = year < now.getFullYear() || (year === now.getFullYear() && month <= now.getMonth());

  const firstDow = getFirstDayOfWeek(year, month);
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = Array(firstDow).fill(null).concat(calendar);

  const handleSelect = (day) => {
    if (!day || !day.available) return;
    setSelected(day.date);
    if (onSelectDate) {
      onSelectDate(day.date);
      navigation.goBack();
    } else {
      navigation.navigate('FlightResults', {
        search: { origin: origin.code, dest: dest.code, date: day.date, passengers, tripType: 'ONE_WAY' },
        origin, dest, tripType: 'ONE_WAY',
      });
    }
  };

  const getCellColor = (day) => {
    if (!day || !day.available) return COLORS.disabled;
    if (day.level === 'low') return COLORS.low;
    if (day.level === 'high') return COLORS.high;
    return COLORS.medium;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Calendrier des prix</Text>
          {origin && dest && (
            <Text style={styles.headerSub}>{origin.code} → {dest.code} · {passengers} pax</Text>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Month nav */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} disabled={isPast} style={styles.monthBtn}>
            <Text style={[styles.monthBtnText, isPast && styles.disabled]}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{MONTHS_FR[month - 1]} {year}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.monthBtn}>
            <Text style={styles.monthBtnText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.low }]} /><Text style={styles.legendText}>Bas prix</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.medium }]} /><Text style={styles.legendText}>Prix moyen</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.high }]} /><Text style={styles.legendText}>Prix élevé</Text></View>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.accent} style={{ marginTop: 60 }} size="large" />
        ) : (
          <>
            {/* Day names */}
            <View style={styles.dayRow}>
              {DAYS.map((d) => <Text key={d} style={styles.dayName}>{d}</Text>)}
            </View>

            {/* Calendar grid */}
            <View style={styles.grid}>
              {cells.map((day, idx) => {
                if (!day) return <View key={`e-${idx}`} style={styles.cell} />;
                const dayNum = parseInt(day.date.slice(-2), 10);
                const isSelected = selected === day.date;
                const isLowest = day.isLowest;
                const cellColor = getCellColor(day);

                return (
                  <TouchableOpacity
                    key={day.date}
                    style={[
                      styles.cell,
                      day.available && { backgroundColor: cellColor + '22', borderColor: cellColor + '66' },
                      isSelected && { backgroundColor: cellColor, borderColor: cellColor },
                    ]}
                    onPress={() => handleSelect(day)}
                    disabled={!day.available}
                  >
                    <Text style={[styles.cellDay, !day.available && styles.cellDayDisabled, isSelected && { color: '#fff' }]}>
                      {dayNum}
                    </Text>
                    {day.available && (
                      <Text style={[styles.cellPrice, { color: isSelected ? '#fff' : cellColor }]} numberOfLines={1}>
                        {day.price >= 1000
                          ? `${(day.price / 1000).toFixed(1)}k`
                          : Math.round(day.price)}
                      </Text>
                    )}
                    {isLowest && day.available && (
                      <View style={styles.lowestBadge}>
                        <Text style={styles.lowestText}>★</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Stats */}
            {stats && (
              <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Ce mois-ci</Text>
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={[styles.statVal, { color: COLORS.low }]}>{stats.min} {stats.currency}</Text>
                    <Text style={styles.statLabel}>Meilleur prix</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statVal}>{stats.avg} {stats.currency}</Text>
                    <Text style={styles.statLabel}>Prix moyen</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={[styles.statVal, { color: COLORS.high }]}>{stats.max} {stats.currency}</Text>
                    <Text style={styles.statLabel}>Prix max</Text>
                  </View>
                </View>
                <Text style={styles.statsHint}>★ = Meilleur prix du mois · Tapez une date pour voir les vols</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const CELL_SIZE = 48;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4, marginRight: 12 },
  backIcon: { color: COLORS.accent, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  headerSub: { color: COLORS.muted, fontSize: 12 },
  scroll: { padding: 16, paddingBottom: 40 },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  monthBtn: { padding: 8 },
  monthBtnText: { color: COLORS.accent, fontSize: 28, fontWeight: '300', lineHeight: 32 },
  monthLabel: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  disabled: { opacity: 0.3 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: COLORS.muted, fontSize: 12 },
  dayRow: { flexDirection: 'row', marginBottom: 4 },
  dayName: { flex: 1, textAlign: 'center', color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`, aspectRatio: 0.85,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, borderWidth: 1, borderColor: 'transparent',
    padding: 2, marginVertical: 2,
    position: 'relative',
  },
  cellDay: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  cellDayDisabled: { color: COLORS.border },
  cellPrice: { fontSize: 9, fontWeight: '700', marginTop: 1 },
  lowestBadge: { position: 'absolute', top: 2, right: 2 },
  lowestText: { color: '#FFD700', fontSize: 8 },
  statsCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginTop: 16 },
  statsTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  stat: { alignItems: 'center' },
  statVal: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  statLabel: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  statsHint: { color: COLORS.muted, fontSize: 11, textAlign: 'center' },
});
