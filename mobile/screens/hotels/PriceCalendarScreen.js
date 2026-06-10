import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, ActivityIndicator, StatusBar, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import hotelAPI from '../../services/hotelService';

const { width } = Dimensions.get('window');
const CELL_SIZE = Math.floor((width - 40) / 7);

const MONTH_NAMES = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAY_NAMES = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

function getPriceColor(price, min, max) {
  if (!price) return '#E2E8F0';
  const ratio = (price - min) / (max - min + 1);
  if (ratio < 0.33) return '#38A169';
  if (ratio < 0.66) return '#D69E2E';
  return '#E53E3E';
}

export default function PriceCalendarScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { hotelId, guests = 2, hotelName = '' } = route.params || {};
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [cheapestMonth, setCheapestMonth] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => { loadCalendar(viewYear, viewMonth); }, [viewYear, viewMonth]);
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.04, duration: 900, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  async function loadCalendar(year, month) {
    setLoading(true);
    try {
      const res = await hotelAPI.getPriceCalendar(hotelId, month + 1, year, guests);
      const data = res.data?.data || [];
      const map = {};
      data.forEach(d => { map[d.date] = d; });
      setCalendarData(prev => ({ ...prev, ...map }));

      // Determine cheapest month from loaded data
      const prices = data.filter(d => d.price && d.availability).map(d => d.price);
      if (prices.length) {
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        setCheapestMonth(MONTH_NAMES[month] + ' (moy. ' + Math.round(avg) + ' TND)');
      }
    } catch {}
    setLoading(false);
  }

  function handleDayPress(dateStr, dayData) {
    if (!dayData?.availability) return;
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut(null);
    } else {
      if (dateStr <= checkIn) {
        setCheckIn(dateStr);
        setCheckOut(null);
      } else {
        setCheckOut(dateStr);
      }
    }
  }

  function handleSelect() {
    if (checkIn && checkOut) {
      navigation.navigate('HotelResults', { checkIn, checkOut, guests });
    }
  }

  function renderMonth(year, month) {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;

    const todayStr = today.toISOString().split('T')[0];
    const allPrices = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (calendarData[ds]?.price) allPrices.push(calendarData[ds].price);
    }
    const minP = Math.min(...allPrices) || 0;
    const maxP = Math.max(...allPrices) || 0;

    const cells = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, dateStr: ds, data: calendarData[ds] || null });
    }

    return (
      <View key={`${year}-${month}`} style={styles.monthContainer}>
        <Text style={styles.monthTitle}>{MONTH_NAMES[month]} {year}</Text>
        <View style={styles.dayNamesRow}>
          {DAY_NAMES.map(n => <Text key={n} style={styles.dayName}>{n}</Text>)}
        </View>
        <View style={styles.calGrid}>
          {cells.map((cell, idx) => {
            if (!cell) return <View key={`empty-${idx}`} style={styles.emptyCell} />;
            const { day, dateStr, data } = cell;
            const isPast = dateStr < todayStr;
            const isCheckIn = dateStr === checkIn;
            const isCheckOut = dateStr === checkOut;
            const isInRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;
            const bgColor = (isCheckIn || isCheckOut) ? '#FF6B35' : isInRange ? '#FFE4DA' : '#fff';
            const priceColor = data?.price ? getPriceColor(data.price, minP, maxP) : '#E2E8F0';

            return (
              <TouchableOpacity
                key={dateStr}
                style={[styles.dayCell, { backgroundColor: bgColor }, isPast && styles.dayCellPast]}
                onPress={() => !isPast && handleDayPress(dateStr, data)}
                disabled={isPast || !data?.availability}
              >
                <Text style={[styles.dayNum, (isCheckIn || isCheckOut) && { color: '#fff' }, isPast && { color: '#CBD5E0' }]}>{day}</Text>
                {data?.price && !isPast ? (
                  <View style={[styles.priceTag, { backgroundColor: priceColor }]}>
                    <Text style={styles.priceTagText}>{data.price}</Text>
                  </View>
                ) : (
                  <Text style={styles.noPrice}>{isPast ? '' : '—'}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }
  const nextMonth2 = viewMonth === 11 ? 0 : viewMonth + 1;
  const nextYear2 = viewMonth === 11 ? viewYear + 1 : viewYear;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#004E89', '#1a6eac']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Calendrier des prix</Text>
          {hotelName ? <Text style={styles.headerSub} numberOfLines={1}>{hotelName}</Text> : null}
        </View>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Cheapest month banner */}
      {cheapestMonth ? (
        <Animated.View style={[styles.cheapBanner, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="trending-down" size={16} color="#276749" />
          <Text style={styles.cheapBannerText}>Mois le moins cher: {cheapestMonth}</Text>
        </Animated.View>
      ) : null}

      {loading ? (
        <View style={styles.loadingOverlay}>
          {[...Array(14)].map((_, i) => <View key={i} style={styles.skeleton} />)}
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          {renderMonth(viewYear, viewMonth)}
          {renderMonth(nextYear2, nextMonth2)}

          {/* Legend */}
          <View style={styles.legendCard}>
            <Text style={styles.legendTitle}>Légende des prix</Text>
            <View style={styles.legendRow}>
              {[
                { color: '#38A169', label: 'Prix bas' },
                { color: '#D69E2E', label: 'Prix moyen' },
                { color: '#E53E3E', label: 'Prix élevé' },
                { color: '#E2E8F0', label: 'Indisponible' },
              ].map(item => (
                <View key={item.label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Bottom select bar */}
      {checkIn && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.dateDisplay}>
            <View style={styles.dateDisplayItem}>
              <Text style={styles.dateDisplayLabel}>Arrivée</Text>
              <Text style={styles.dateDisplayValue}>{checkIn}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color="#A0AEC0" />
            <View style={styles.dateDisplayItem}>
              <Text style={styles.dateDisplayLabel}>Départ</Text>
              <Text style={[styles.dateDisplayValue, !checkOut && { color: '#A0AEC0' }]}>{checkOut || 'Sélectionner'}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.selectBtn, !checkOut && styles.selectBtnDisabled]}
            onPress={handleSelect}
            disabled={!checkOut}
          >
            <Text style={styles.selectBtnText}>Sélectionner</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  monthNav: { flexDirection: 'row', gap: 4 },
  navBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 6 },
  cheapBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0FFF4', borderRadius: 10, marginHorizontal: 16, marginTop: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#9AE6B4' },
  cheapBannerText: { fontSize: 13, fontWeight: '700', color: '#276749', flex: 1 },
  loadingOverlay: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 6 },
  skeleton: { width: CELL_SIZE - 4, height: CELL_SIZE + 4, borderRadius: 8, backgroundColor: '#EDF2F7' },
  monthContainer: { marginBottom: 24, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  monthTitle: { fontSize: 16, fontWeight: '800', color: '#1A202C', marginBottom: 12, textAlign: 'center' },
  dayNamesRow: { flexDirection: 'row', marginBottom: 8 },
  dayName: { width: CELL_SIZE, textAlign: 'center', fontSize: 10, fontWeight: '700', color: '#A0AEC0' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  emptyCell: { width: CELL_SIZE, height: CELL_SIZE + 14 },
  dayCell: { width: CELL_SIZE, height: CELL_SIZE + 14, alignItems: 'center', justifyContent: 'center', borderRadius: 8, marginBottom: 2 },
  dayCellPast: { opacity: 0.4 },
  dayNum: { fontSize: 13, fontWeight: '700', color: '#2D3748', marginBottom: 2 },
  priceTag: { borderRadius: 4, paddingHorizontal: 2, paddingVertical: 1 },
  priceTagText: { fontSize: 8, fontWeight: '700', color: '#fff' },
  noPrice: { fontSize: 8, color: '#CBD5E0' },
  legendCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  legendTitle: { fontSize: 14, fontWeight: '700', color: '#1A202C', marginBottom: 10 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 14, height: 14, borderRadius: 7 },
  legendLabel: { fontSize: 12, color: '#4A5568', fontWeight: '500' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EDF2F7', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  dateDisplay: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  dateDisplayItem: {},
  dateDisplayLabel: { fontSize: 10, color: '#A0AEC0', fontWeight: '600' },
  dateDisplayValue: { fontSize: 14, fontWeight: '700', color: '#1A202C' },
  selectBtn: { backgroundColor: '#FF6B35', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  selectBtnDisabled: { backgroundColor: '#CBD5E0' },
  selectBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
