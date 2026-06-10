import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  card: '#22223A',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  primary: '#1565C0',
  accent: '#42A5F5',
  success: '#27AE60',
  warning: '#F5A623',
  border: '#2E2E3F',
};

const SORT_OPTIONS = [
  { key: 'price', label: 'Prix ↑' },
  { key: 'duration', label: 'Durée' },
  { key: 'departure', label: 'Départ' },
];

function AirlineBadge({ code }) {
  const colors = {
    TU: '#C8102E', BJ: '#FF6B00', AF: '#002395', LH: '#05164D',
    TK: '#C8102E', IB: '#C00B1D', KL: '#00A1DE', EK: '#C8102E',
    MS: '#1A3A6B', AT: '#006233', VY: '#B8860B', PC: '#F26522',
  };
  return (
    <View style={[styles.airlineBadge, { backgroundColor: colors[code] || COLORS.primary }]}>
      <Text style={styles.airlineBadgeText}>{code}</Text>
    </View>
  );
}

function FlightCard({ flight, onPress }) {
  const stops = flight.stops === 0 ? 'Direct' : `${flight.stops} escale${flight.stops > 1 ? 's' : ''}`;
  const stopsColor = flight.stops === 0 ? COLORS.success : COLORS.warning;

  return (
    <TouchableOpacity style={styles.flightCard} onPress={() => onPress(flight)}>
      <View style={styles.cardTop}>
        <View style={styles.airlineRow}>
          <AirlineBadge code={flight.airline.code} />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.airlineName}>{flight.airline.name}</Text>
            <Text style={styles.flightNum}>{flight.flightNumber}</Text>
          </View>
        </View>
        <View style={styles.priceBlock}>
          <Text style={styles.price}>{flight.price.total.toFixed(0)} TND</Text>
          <Text style={styles.priceSub}>/ {flight.price.perPax.toFixed(0)} TND×pax</Text>
        </View>
      </View>

      <View style={styles.timeline}>
        <View style={styles.timeBlock}>
          <Text style={styles.time}>{flight.departure.time}</Text>
          <Text style={styles.airport}>{flight.origin.code}</Text>
          <Text style={styles.city} numberOfLines={1}>{flight.origin.city}</Text>
        </View>

        <View style={styles.durationBlock}>
          <Text style={styles.duration}>{flight.duration}</Text>
          <View style={styles.durationLine}>
            <View style={styles.dot} />
            <View style={styles.line} />
            {flight.stops > 0 && <View style={[styles.dot, { backgroundColor: COLORS.warning }]} />}
            {flight.stops > 0 && <View style={styles.line} />}
            <View style={styles.dot} />
          </View>
          <Text style={[styles.stopsLabel, { color: stopsColor }]}>{stops}</Text>
        </View>

        <View style={[styles.timeBlock, { alignItems: 'flex-end' }]}>
          <Text style={styles.time}>{flight.arrival.time}</Text>
          <Text style={styles.airport}>{flight.destination.code}</Text>
          <Text style={styles.city} numberOfLines={1}>{flight.destination.city}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.footerTag}>
          {flight.baggage.cabin} cabine · {flight.baggage.checked} soute
        </Text>
        {flight.refundable && <Text style={styles.footerTag}>✓ Remboursable</Text>}
        {flight.seats.available <= 5 && (
          <Text style={[styles.footerTag, { color: '#E74C3C' }]}>
            {flight.seats.available} places restantes
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function FlightResultsScreen({ navigation, route }) {
  const { outbound = [], inbound = [], search, origin, dest, tripType } = route.params || {};
  const [sortBy, setSortBy] = useState('price');
  const [filterDirect, setFilterDirect] = useState(false);

  function sortFlights(list) {
    const filtered = filterDirect ? list.filter((f) => f.stops === 0) : list;
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price') return a.price.total - b.price.total;
      if (sortBy === 'duration') return a.durationMins - b.durationMins;
      if (sortBy === 'departure') return a.departure.time.localeCompare(b.departure.time);
      return 0;
    });
  }

  const sorted = sortFlights(outbound);

  const handleSelectFlight = (flight) => {
    navigation.navigate('FlightDetail', {
      flight,
      search,
      tripType,
      origin,
      dest,
      inboundFlights: inbound,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerRoute}>
            {origin?.code} → {dest?.code}
          </Text>
          <Text style={styles.headerSub}>
            {search?.date} · {search?.passengers} passager{search?.passengers > 1 ? 's' : ''}
            {tripType === 'ROUND_TRIP' ? ` · A/R ${search?.returnDate}` : ' · Aller simple'}
          </Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, filterDirect && styles.filterChipActive]}
            onPress={() => setFilterDirect(!filterDirect)}
          >
            <Text style={[styles.filterChipText, filterDirect && styles.filterChipTextActive]}>
              Direct seulement
            </Text>
          </TouchableOpacity>

          {SORT_OPTIONS.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.filterChip, sortBy === s.key && styles.filterChipActive]}
              onPress={() => setSortBy(s.key)}
            >
              <Text style={[styles.filterChipText, sortBy === s.key && styles.filterChipTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results count */}
      <Text style={styles.resultsCount}>
        {sorted.length} vol{sorted.length !== 1 ? 's' : ''} trouvé{sorted.length !== 1 ? 's' : ''}
      </Text>

      <FlatList
        data={sorted}
        keyExtractor={(f) => f.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <FlightCard flight={item} onPress={handleSelectFlight} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✈️</Text>
            <Text style={styles.emptyText}>Aucun vol disponible</Text>
            <Text style={styles.emptySubText}>
              Essayez d'autres dates ou d'autres aéroports
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, marginRight: 12 },
  backIcon: { color: COLORS.accent, fontSize: 22 },
  headerInfo: {},
  headerRoute: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  headerSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  filters: {
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  filterChip: {
    backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 14,
    paddingVertical: 7, marginRight: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.text },
  resultsCount: { color: COLORS.muted, fontSize: 12, paddingHorizontal: 16, paddingVertical: 8 },
  list: { padding: 12 },
  flightCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  airlineRow: { flexDirection: 'row', alignItems: 'center' },
  airlineBadge: {
    width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  airlineBadgeText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  airlineName: { color: COLORS.text, fontWeight: '700', fontSize: 13 },
  flightNum: { color: COLORS.muted, fontSize: 11 },
  priceBlock: { alignItems: 'flex-end' },
  price: { color: COLORS.accent, fontSize: 22, fontWeight: '900' },
  priceSub: { color: COLORS.muted, fontSize: 11 },
  timeline: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  timeBlock: { alignItems: 'flex-start', width: 70 },
  time: { color: COLORS.text, fontSize: 20, fontWeight: '900' },
  airport: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
  city: { color: COLORS.muted, fontSize: 11, maxWidth: 65 },
  durationBlock: { flex: 1, alignItems: 'center' },
  duration: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  durationLine: { flexDirection: 'row', alignItems: 'center', width: '90%' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent },
  line: { flex: 1, height: 1.5, backgroundColor: COLORS.border },
  stopsLabel: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  cardFooter: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  footerTag: { color: COLORS.muted, fontSize: 11, backgroundColor: COLORS.card, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  emptySubText: { color: COLORS.muted, fontSize: 13, marginTop: 6, textAlign: 'center' },
});
