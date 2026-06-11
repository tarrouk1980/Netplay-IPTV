import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ScrollView, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import CompareLinks from '../components/CompareLinks';

const SORT_OPTIONS = [
  { key: 'price',     label: 'Prix ↑' },
  { key: 'duration',  label: 'Durée' },
  { key: 'departure', label: 'Départ' },
];

const AIRLINE_COLORS = {
  VY: '#F7B731', IB: '#C00B1D', VU: '#FF6C2F', FR: '#073590',
  U2: '#FF6600', TK: '#C8102E', AF: '#002395', LH: '#05164D',
  AT: '#006233', AH: '#006B3F', TU: '#C8102E', KL: '#00A1DE',
  EK: '#C8102E', TP: '#C8102E',
};

function AirlineBadge({ code }) {
  return (
    <View style={[s.badge, { backgroundColor: AIRLINE_COLORS[code] || COLORS.primary }]}>
      <Text style={s.badgeText}>{code}</Text>
    </View>
  );
}

function PriceTag({ price, currency }) {
  return (
    <View style={s.priceTag}>
      <Text style={s.priceAmount}>{Math.round(price)}</Text>
      <Text style={s.priceCurrency}>{currency}</Text>
    </View>
  );
}

function FlightCard({ flight, onPress }) {
  const isLowCost = ['VY', 'FR', 'U2', 'TO', '3O'].includes(flight.airline.code);
  const stopsColor = flight.stops === 0 ? COLORS.success : COLORS.warning;
  const stopsLabel = flight.stops === 0 ? 'Direct' : `${flight.stops} escale${flight.stops > 1 ? 's' : ''}`;

  const openBook = () => {
    if (flight.affiliateUrl) {
      Alert.alert(
        'Réservation',
        `Vous allez être redirigé vers ${flight.airline.name} pour finaliser votre réservation.`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Continuer', onPress: () => Linking.openURL(flight.affiliateUrl) },
        ]
      );
    }
  };

  return (
    <TouchableOpacity style={s.card} onPress={() => onPress(flight)} activeOpacity={0.85}>
      {isLowCost && (
        <View style={s.lowCostBadge}>
          <Text style={s.lowCostText}>LOW COST</Text>
        </View>
      )}
      <View style={s.cardTop}>
        <View style={s.airlineRow}>
          <AirlineBadge code={flight.airline.code} />
          <View style={{ marginLeft: 10 }}>
            <Text style={s.airlineName}>{flight.airline.name}</Text>
            <Text style={s.flightNo}>{flight.flightNumber}</Text>
          </View>
        </View>
        <PriceTag price={flight.price.total} currency={flight.price.currency} />
      </View>

      <View style={s.timeline}>
        <View style={s.timeBlock}>
          <Text style={s.timeText}>{flight.departure.time}</Text>
          <Text style={s.airportCode}>{flight.origin.code}</Text>
          <Text style={s.cityName} numberOfLines={1}>{flight.origin.city}</Text>
        </View>

        <View style={s.centerBlock}>
          <Text style={s.durationTxt}>{flight.duration}</Text>
          <View style={s.lineContainer}>
            <View style={s.dot} />
            <View style={s.line} />
            {flight.stops > 0 && <View style={[s.dot, { backgroundColor: COLORS.warning }]} />}
            {flight.stops > 0 && <View style={s.line} />}
            <View style={s.planeDot}>
              <Text style={{ fontSize: 12 }}>✈</Text>
            </View>
            <View style={s.line} />
            <View style={s.dot} />
          </View>
          <Text style={[s.stopsLabel, { color: stopsColor }]}>{stopsLabel}</Text>
        </View>

        <View style={[s.timeBlock, { alignItems: 'flex-end' }]}>
          <Text style={s.timeText}>{flight.arrival.time}</Text>
          <Text style={s.airportCode}>{flight.destination.code}</Text>
          <Text style={s.cityName} numberOfLines={1}>{flight.destination.city}</Text>
        </View>
      </View>

      <View style={s.cardFooter}>
        <Text style={s.footerTag}>💼 {flight.baggage?.cabin || '10 kg'}</Text>
        {flight.refundable && <Text style={s.footerTag}>✓ Remb.</Text>}
        {flight.seats?.available <= 5 && (
          <Text style={[s.footerTag, { color: COLORS.danger }]}>
            ⚠ {flight.seats.available} places
          </Text>
        )}
        <TouchableOpacity style={s.bookBtn} onPress={openBook}>
          <Text style={s.bookBtnTxt}>Réserver →</Text>
        </TouchableOpacity>
      </View>
      <CompareLinks
        origin={flight.origin.code}
        dest={flight.destination.code}
        date={flight.departure.date}
        passengers={1}
      />
    </TouchableOpacity>
  );
}

export default function FlightResultsScreen({ navigation, route }) {
  const { outbound = [], inbound = [], search, origin, dest, tripType } = route.params || {};
  const [sortBy, setSortBy] = useState('price');
  const [filterDirect, setFilterDirect] = useState(false);

  const sortFlights = useCallback((list) => {
    const filtered = filterDirect ? list.filter((f) => f.stops === 0) : list;
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price')     return a.price.total - b.price.total;
      if (sortBy === 'duration')  return a.durationMins - b.durationMins;
      if (sortBy === 'departure') return a.departure.time.localeCompare(b.departure.time);
      return 0;
    });
  }, [sortBy, filterDirect]);

  const sorted = sortFlights(outbound);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerRoute}>{origin?.code} → {dest?.code}</Text>
          <Text style={s.headerSub}>
            {search?.date} · {search?.passengers} pax
            {tripType === 'ROUND_TRIP' ? ` · A/R ${search?.returnDate}` : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={s.calBtn}
          onPress={() => navigation.navigate('Calendar', { origin, dest, passengers: search?.passengers })}
        >
          <Text style={{ fontSize: 18 }}>📅</Text>
        </TouchableOpacity>
      </View>

      <View style={s.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[s.chip, filterDirect && s.chipActive]}
            onPress={() => setFilterDirect(!filterDirect)}
          >
            <Text style={[s.chipTxt, filterDirect && s.chipTxtActive]}>✈ Direct</Text>
          </TouchableOpacity>
          {SORT_OPTIONS.map((o) => (
            <TouchableOpacity
              key={o.key}
              style={[s.chip, sortBy === o.key && s.chipActive]}
              onPress={() => setSortBy(o.key)}
            >
              <Text style={[s.chipTxt, sortBy === o.key && s.chipTxtActive]}>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text style={s.count}>
        {sorted.length} vol{sorted.length !== 1 ? 's' : ''} trouvé{sorted.length !== 1 ? 's' : ''}
      </Text>

      <FlatList
        data={sorted}
        keyExtractor={(f) => f.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <FlightCard
            flight={item}
            onPress={(f) => navigation.navigate('FlightDetail', { flight: f, search, tripType, origin, dest })}
          />
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 52, marginBottom: 16 }}>✈</Text>
            <Text style={s.emptyTitle}>Aucun vol trouvé</Text>
            <Text style={s.emptySub}>Essayez d'autres dates</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.bg },
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn:    { marginRight: 12, padding: 4 },
  backIcon:   { color: COLORS.accent, fontSize: 22 },
  headerRoute:{ color: COLORS.text, fontSize: 17, fontWeight: '900' },
  headerSub:  { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  calBtn:     { backgroundColor: COLORS.surface, borderRadius: 10, padding: 8, borderWidth: 1, borderColor: COLORS.border },
  filterBar:  { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  chip:       { backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipTxt:    { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  chipTxtActive: { color: '#fff' },
  count:      { color: COLORS.muted, fontSize: 12, paddingHorizontal: 16, paddingVertical: 8 },
  list:       { padding: 12, paddingBottom: 32 },
  card:       { backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  lowCostBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.warning, paddingHorizontal: 8, paddingVertical: 3, borderBottomLeftRadius: 10 },
  lowCostText:{ color: '#000', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  cardTop:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  airlineRow: { flexDirection: 'row', alignItems: 'center' },
  badge:      { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badgeText:  { color: '#fff', fontSize: 12, fontWeight: '900' },
  airlineName:{ color: COLORS.text, fontWeight: '700', fontSize: 13 },
  flightNo:   { color: COLORS.muted, fontSize: 11 },
  priceTag:   { alignItems: 'flex-end' },
  priceAmount:{ color: COLORS.accent, fontSize: 26, fontWeight: '900', lineHeight: 30 },
  priceCurrency: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  timeline:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  timeBlock:  { width: 68, alignItems: 'flex-start' },
  timeText:   { color: COLORS.text, fontSize: 22, fontWeight: '900' },
  airportCode:{ color: COLORS.accent, fontSize: 14, fontWeight: '800' },
  cityName:   { color: COLORS.muted, fontSize: 11, maxWidth: 65 },
  centerBlock:{ flex: 1, alignItems: 'center' },
  durationTxt:{ color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  lineContainer: { flexDirection: 'row', alignItems: 'center', width: '95%' },
  dot:        { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.accent },
  planeDot:   { marginHorizontal: 2 },
  line:       { flex: 1, height: 1.5, backgroundColor: COLORS.border },
  stopsLabel: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  cardFooter: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  footerTag:  { color: COLORS.muted, fontSize: 11, backgroundColor: COLORS.card, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  bookBtn:    { marginLeft: 'auto', backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  bookBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  empty:      { alignItems: 'center', marginTop: 80 },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub:   { color: COLORS.muted, fontSize: 13 },
});
