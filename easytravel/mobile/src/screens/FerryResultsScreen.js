import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ScrollView, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';

const COMPANY_COLORS = {
  BALEARIA: '#003087', FRS: '#E30613', TRASMED: '#005BAC', ACCIONA: '#00B451',
  CTM: '#C8102E', SNCM: '#0055A4', GNV: '#003F87', GRANDI: '#D4001A',
  CMN_FERRY: '#006233', INTERSHIPPING: '#FF8000', ALGERIE_FERRIES: '#006B3F',
};

const SORT_OPTIONS = [
  { key: 'price',     label: 'Prix ↑' },
  { key: 'duration',  label: 'Durée' },
  { key: 'departure', label: 'Départ' },
];

function amenityIcon(a) {
  const map = {
    'cafétéria': '☕', 'restaurant': '🍽', 'cabines': '🛏',
    'piscine': '🏊', 'voitures': '🚗', 'divertissement': '🎬',
  };
  return map[a] || '•';
}

function CompanyBadge({ code }) {
  return (
    <View style={[s.badge, { backgroundColor: COMPANY_COLORS[code] || COLORS.ferry }]}>
      <Text style={s.badgeText}>{code.substring(0, 3)}</Text>
    </View>
  );
}

function FerryCard({ ferry, onPress }) {
  const openBook = () => {
    if (ferry.affiliateUrl) {
      Alert.alert(
        'Réservation ferry',
        `Vous allez être redirigé vers ${ferry.company.name}.`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Continuer', onPress: () => Linking.openURL(ferry.affiliateUrl) },
        ]
      );
    }
  };

  return (
    <TouchableOpacity style={s.card} onPress={() => onPress(ferry)} activeOpacity={0.85}>
      {ferry.isOvernight && (
        <View style={s.overnightBadge}>
          <Text style={s.overnightText}>🌙 NUIT</Text>
        </View>
      )}

      <View style={s.cardTop}>
        <View style={s.companyRow}>
          <CompanyBadge code={ferry.company.code} />
          <View style={{ marginLeft: 10 }}>
            <Text style={s.companyName}>{ferry.company.name}</Text>
            <Text style={s.routeNo}>Route {ferry.routeNumber}</Text>
          </View>
        </View>
        <View style={s.priceCol}>
          <Text style={s.priceAmt}>{Math.round(ferry.price.perPax)}</Text>
          <Text style={s.priceCur}>{ferry.price.currency} / pax</Text>
          {ferry.vehicleSpaces?.available > 0 && (
            <Text style={s.carPrice}>🚗 +{Math.round(ferry.price.car)}€</Text>
          )}
        </View>
      </View>

      <View style={s.timeline}>
        <View style={s.timeBlock}>
          <Text style={s.timeText}>{ferry.departure.time}</Text>
          <Text style={s.portCode}>{ferry.origin.code.replace('_PORT','').replace('_ES','')}</Text>
          <Text style={s.cityName} numberOfLines={1}>{ferry.origin.city}</Text>
          <Text style={s.dateSmall}>{ferry.departure.date}</Text>
        </View>

        <View style={s.centerBlock}>
          <Text style={s.durationTxt}>{ferry.duration}</Text>
          <View style={s.lineRow}>
            <View style={s.anchDot}>
              <Text style={{ fontSize: 10 }}>⚓</Text>
            </View>
            <View style={s.line} />
            <View style={s.shipIcon}>
              <Text style={{ fontSize: 14 }}>⛴</Text>
            </View>
            <View style={s.line} />
            <View style={s.anchDot}>
              <Text style={{ fontSize: 10 }}>⚓</Text>
            </View>
          </View>
          <Text style={s.seaLabel}>Traversée maritime</Text>
        </View>

        <View style={[s.timeBlock, { alignItems: 'flex-end' }]}>
          <Text style={s.timeText}>{ferry.arrival.time}</Text>
          <Text style={s.portCode}>{ferry.destination.code.replace('_PORT','').replace('_ES','')}</Text>
          <Text style={s.cityName} numberOfLines={1}>{ferry.destination.city}</Text>
          <Text style={s.dateSmall}>{ferry.arrival.date}</Text>
        </View>
      </View>

      {/* Amenities */}
      {ferry.amenities?.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.amenRow}>
          {ferry.amenities.map((a) => (
            <View key={a} style={s.amenTag}>
              <Text style={s.amenText}>{amenityIcon(a)} {a}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={s.cardFooter}>
        <Text style={s.seatsLeft}>
          {ferry.vehicleSpaces?.available > 0
            ? `${ferry.vehicleSpaces.available} places voiture`
            : `${ferry.seats?.available} places passager`}
        </Text>
        <TouchableOpacity style={s.bookBtn} onPress={openBook}>
          <Text style={s.bookBtnTxt}>Réserver →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function FerryResultsScreen({ navigation, route }) {
  const { ferries = [], search, origin, dest } = route.params || {};
  const [sortBy, setSortBy] = useState('price');

  const sorted = [...ferries].sort((a, b) => {
    if (sortBy === 'price')     return a.price.total - b.price.total;
    if (sortBy === 'duration')  return a.durationMins - b.durationMins;
    if (sortBy === 'departure') return a.departure.time.localeCompare(b.departure.time);
    return 0;
  });

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerRoute}>⛴ {origin?.city} → {dest?.city}</Text>
          <Text style={s.headerSub}>
            {search?.date} · {search?.passengers} passager{search?.passengers > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View style={s.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
        {sorted.length} traversée{sorted.length !== 1 ? 's' : ''} disponible{sorted.length !== 1 ? 's' : ''}
      </Text>

      <FlatList
        data={sorted}
        keyExtractor={(f) => f.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <FerryCard
            ferry={item}
            onPress={(f) => navigation.navigate('FerryDetail', { ferry: f, search, origin, dest })}
          />
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 52, marginBottom: 16 }}>⛴</Text>
            <Text style={s.emptyTitle}>Aucune traversée trouvée</Text>
            <Text style={s.emptySub}>Essayez d'autres dates ou ports</Text>
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
  backIcon:   { color: COLORS.ferry, fontSize: 22 },
  headerRoute:{ color: COLORS.text, fontSize: 17, fontWeight: '900' },
  headerSub:  { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  filterBar:  { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  chip:       { backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.ferry, borderColor: COLORS.ferry },
  chipTxt:    { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  chipTxtActive: { color: '#fff' },
  count:      { color: COLORS.muted, fontSize: 12, paddingHorizontal: 16, paddingVertical: 8 },
  list:       { padding: 12, paddingBottom: 32 },
  card:       { backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  overnightBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#1A237E', paddingHorizontal: 10, paddingVertical: 3, borderBottomLeftRadius: 10 },
  overnightText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  cardTop:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  companyRow: { flexDirection: 'row', alignItems: 'center' },
  badge:      { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badgeText:  { color: '#fff', fontSize: 11, fontWeight: '900' },
  companyName:{ color: COLORS.text, fontWeight: '700', fontSize: 13 },
  routeNo:    { color: COLORS.muted, fontSize: 11 },
  priceCol:   { alignItems: 'flex-end' },
  priceAmt:   { color: COLORS.ferry, fontSize: 26, fontWeight: '900', lineHeight: 30 },
  priceCur:   { color: COLORS.muted, fontSize: 11 },
  carPrice:   { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  timeline:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  timeBlock:  { width: 72, alignItems: 'flex-start' },
  timeText:   { color: COLORS.text, fontSize: 22, fontWeight: '900' },
  portCode:   { color: COLORS.ferry, fontSize: 13, fontWeight: '800' },
  cityName:   { color: COLORS.muted, fontSize: 11, maxWidth: 68 },
  dateSmall:  { color: COLORS.subtle, fontSize: 10, marginTop: 2 },
  centerBlock:{ flex: 1, alignItems: 'center' },
  durationTxt:{ color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  lineRow:    { flexDirection: 'row', alignItems: 'center', width: '100%' },
  anchDot:    { width: 20, height: 20, backgroundColor: COLORS.card, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  line:       { flex: 1, height: 1.5, backgroundColor: COLORS.border },
  shipIcon:   { marginHorizontal: 4 },
  seaLabel:   { color: COLORS.subtle, fontSize: 10, marginTop: 4 },
  amenRow:    { marginBottom: 10 },
  amenTag:    { backgroundColor: COLORS.card, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6 },
  amenText:   { color: COLORS.muted, fontSize: 11 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seatsLeft:  { color: COLORS.subtle, fontSize: 12 },
  bookBtn:    { backgroundColor: COLORS.ferry, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  bookBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
  empty:      { alignItems: 'center', marginTop: 80 },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub:   { color: COLORS.muted, fontSize: 13 },
});
