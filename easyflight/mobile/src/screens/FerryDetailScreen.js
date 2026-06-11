import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';

const COMPANY_COLORS = {
  'Corsica Ferries':  '#0066CC',
  'Brittany Ferries': '#003087',
  'SNCM':             '#E30613',
  'GNV':              '#004B87',
  'Moby Lines':       '#003DA5',
  'Grimaldi Lines':   '#1A1A6E',
  'Irish Ferries':    '#008000',
  'Stena Line':       '#003087',
};

const AMENITY_ICONS = {
  coffee:      { icon: '☕', label: 'Café/Bar' },
  restaurant:  { icon: '🍽', label: 'Restaurant' },
  cabin:       { icon: '🛏', label: 'Cabines' },
  pool:        { icon: '🏊', label: 'Piscine' },
  car:         { icon: '🚗', label: 'Véhicules' },
  cinema:      { icon: '🎬', label: 'Cinéma' },
  wifi:        { icon: '📶', label: 'Wi-Fi' },
  shop:        { icon: '🛍', label: 'Boutiques' },
  pets:        { icon: '🐾', label: 'Animaux' },
  spa:         { icon: '💆', label: 'Spa' },
};

function SectionHeader({ title }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionLine} />
    </View>
  );
}

function InfoRow({ label, value, valueColor }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={[s.infoValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

function AmenityTag({ amenityKey }) {
  const amenity = AMENITY_ICONS[amenityKey] || { icon: '✓', label: amenityKey };
  return (
    <View style={s.amenityTag}>
      <Text style={s.amenityIcon}>{amenity.icon}</Text>
      <Text style={s.amenityLabel}>{amenity.label}</Text>
    </View>
  );
}

export default function FerryDetailScreen({ navigation, route }) {
  const { ferry, search, origin, dest } = route.params || {};

  if (!ferry) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.center}>
          <Text style={s.emptyText}>Aucune donnée de traversée disponible.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const passengers = search?.passengers || 1;
  const pricePerPax = ferry.price?.passenger ?? ferry.price?.total ?? 0;
  const pricePerCar = ferry.price?.vehicle ?? null;
  const totalPrice = Math.round(
    pricePerPax * passengers + (pricePerCar ?? 0)
  );
  const currency = ferry.price?.currency || 'EUR';
  const companyColor =
    COMPANY_COLORS[ferry.company?.name] || COLORS.ferry;
  const amenities = Array.isArray(ferry.amenities) ? ferry.amenities : [];
  const seatsAvailable = ferry.availability?.passengers ?? null;
  const vehicleSpaces = ferry.availability?.vehicles ?? null;

  const handleBook = () => {
    if (!ferry.affiliateUrl) {
      Alert.alert('Indisponible', 'Le lien de réservation est indisponible pour cette traversée.');
      return;
    }
    Alert.alert(
      'Réservation',
      `Vous allez être redirigé vers ${ferry.company?.name || 'la compagnie'} pour finaliser votre réservation.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Continuer', onPress: () => Linking.openURL(ferry.affiliateUrl) },
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIconTeal}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Détail de la traversée</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View style={s.heroCard}>
          {/* Company row */}
          <View style={s.airlineRow}>
            <View style={[s.badge, { backgroundColor: companyColor }]}>
              <Text style={s.badgeText}>
                {(ferry.company?.name || 'F').slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={s.airlineName}>{ferry.company?.name || 'Compagnie inconnue'}</Text>
              <Text style={s.flightNo}>{ferry.routeNumber || ferry.route || '—'}</Text>
            </View>
          </View>

          <View style={s.divider} />

          {/* Overnight banner */}
          {ferry.isOvernight && (
            <View style={s.overnightBanner}>
              <Text style={s.overnightText}>🌙  TRAVERSÉE DE NUIT</Text>
            </View>
          )}

          {/* Timeline row */}
          <View style={s.timeline}>
            {/* Departure */}
            <View style={s.timeBlock}>
              <Text style={s.bigTime}>{ferry.departure?.time || '—'}</Text>
              <Text style={s.portCode}>{ferry.origin?.code || origin?.code || '—'}</Text>
              <Text style={s.cityName} numberOfLines={2}>
                {ferry.origin?.city || origin?.city || ''}
              </Text>
              <Text style={s.dateSmall}>{ferry.departure?.date || search?.date || ''}</Text>
            </View>

            {/* Center */}
            <View style={s.centerBlock}>
              <Text style={s.durationTxt}>{ferry.duration || '—'}</Text>
              <View style={s.lineContainer}>
                <View style={s.anchorDot}>
                  <Text style={{ fontSize: 11 }}>⚓</Text>
                </View>
                <View style={s.lineTeal} />
                <View style={s.ferryIcon}>
                  <Text style={{ fontSize: 18 }}>⛴</Text>
                </View>
                <View style={s.lineTeal} />
                <View style={s.anchorDot}>
                  <Text style={{ fontSize: 11 }}>⚓</Text>
                </View>
              </View>
              <Text style={s.ferryLabel}>
                {ferry.isOvernight ? 'Nuit à bord' : 'Traversée'}
              </Text>
            </View>

            {/* Arrival */}
            <View style={[s.timeBlock, { alignItems: 'flex-end' }]}>
              <Text style={s.bigTime}>{ferry.arrival?.time || '—'}</Text>
              <Text style={s.portCode}>{ferry.destination?.code || dest?.code || '—'}</Text>
              <Text style={[s.cityName, { textAlign: 'right' }]} numberOfLines={2}>
                {ferry.destination?.city || dest?.city || ''}
              </Text>
              <Text style={s.dateSmall}>
                {ferry.arrival?.date || (ferry.isOvernight ? 'J+1' : search?.date) || ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Price card */}
        <View style={s.priceCard}>
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>Prix par passager</Text>
            <Text style={s.pricePerPax}>{Math.round(pricePerPax)} {currency}</Text>
          </View>
          {pricePerCar !== null && (
            <View style={s.priceRow}>
              <Text style={s.priceLabel}>Véhicule</Text>
              <Text style={s.pricePerPax}>{Math.round(pricePerCar)} {currency}</Text>
            </View>
          )}
          {passengers > 1 && (
            <View style={s.priceRow}>
              <Text style={s.priceLabel}>× {passengers} passagers</Text>
              <Text style={s.priceTotal}>{totalPrice} {currency}</Text>
            </View>
          )}
          <Text style={s.priceMeta}>Taxes incluses · Prix en {currency}</Text>
        </View>

        {/* Section: Amenities */}
        {amenities.length > 0 && (
          <>
            <SectionHeader title="Équipements à bord" />
            <View style={s.amenitiesGrid}>
              {amenities.map((key) => (
                <AmenityTag key={key} amenityKey={key} />
              ))}
            </View>
          </>
        )}

        {/* Section: Disponibilité */}
        <SectionHeader title="Disponibilité" />
        <View style={s.infoCard}>
          <InfoRow
            label="Places passagers"
            value={seatsAvailable !== null
              ? `${seatsAvailable} place${seatsAvailable > 1 ? 's' : ''}`
              : 'Disponible'}
            valueColor={
              seatsAvailable !== null && seatsAvailable <= 5
                ? COLORS.danger
                : COLORS.success
            }
          />
          {vehicleSpaces !== null && (
            <InfoRow
              label="Espaces véhicules"
              value={`${vehicleSpaces} espace${vehicleSpaces > 1 ? 's' : ''}`}
              valueColor={vehicleSpaces <= 3 ? COLORS.warning : COLORS.success}
            />
          )}
        </View>

        {/* Section: Compagnie */}
        <SectionHeader title="Compagnie" />
        <View style={s.infoCard}>
          <InfoRow label="Compagnie" value={ferry.company?.name || '—'} />
          <InfoRow label="Numéro de ligne" value={ferry.routeNumber || ferry.route || '—'} />
        </View>

        {/* Bottom spacer for fixed CTA */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed CTA bar */}
      <View style={s.ctaBar}>
        <View style={s.ctaLeft}>
          <Text style={s.ctaTotalLabel}>Total</Text>
          <Text style={s.ctaPrice}>{totalPrice} {currency}</Text>
        </View>
        <TouchableOpacity style={s.bookBtn} onPress={handleBook} activeOpacity={0.85}>
          <Text style={s.bookBtnTxt}>Réserver le ferry →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: COLORS.bg },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText:      { color: COLORS.muted, fontSize: 15 },

  // Header
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn:        { padding: 4, width: 36 },
  backIconTeal:   { color: COLORS.ferry, fontSize: 22 },
  headerTitle:    { color: COLORS.text, fontSize: 17, fontWeight: '800' },

  scroll:         { flex: 1 },
  scrollContent:  { padding: 16 },

  // Hero card
  heroCard:       { backgroundColor: COLORS.surface, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  airlineRow:     { flexDirection: 'row', alignItems: 'center' },
  badge:          { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  badgeText:      { color: '#fff', fontSize: 13, fontWeight: '900' },
  airlineName:    { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  flightNo:       { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  divider:        { height: 1, backgroundColor: COLORS.border, marginVertical: 14 },

  // Overnight banner
  overnightBanner:{ backgroundColor: '#0F2244', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, marginBottom: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.ferry },
  overnightText:  { color: COLORS.ferry, fontSize: 13, fontWeight: '800', letterSpacing: 1 },

  // Timeline
  timeline:       { flexDirection: 'row', alignItems: 'center' },
  timeBlock:      { width: 74, alignItems: 'flex-start' },
  bigTime:        { color: COLORS.text, fontSize: 28, fontWeight: '900', lineHeight: 32 },
  portCode:       { color: COLORS.ferry, fontSize: 14, fontWeight: '800', marginTop: 2 },
  cityName:       { color: COLORS.muted, fontSize: 11, marginTop: 2, maxWidth: 70 },
  dateSmall:      { color: COLORS.subtle, fontSize: 10, marginTop: 3 },
  centerBlock:    { flex: 1, alignItems: 'center' },
  durationTxt:    { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  lineContainer:  { flexDirection: 'row', alignItems: 'center', width: '95%' },
  anchorDot:      { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  ferryIcon:      { marginHorizontal: 2 },
  lineTeal:       { flex: 1, height: 1.5, backgroundColor: COLORS.ferry },
  ferryLabel:     { color: COLORS.ferry, fontSize: 11, fontWeight: '700', marginTop: 5 },

  // Price card
  priceCard:      { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1.5, borderColor: COLORS.ferry },
  priceRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  priceLabel:     { color: COLORS.muted, fontSize: 13 },
  pricePerPax:    { color: COLORS.ferry, fontSize: 20, fontWeight: '800' },
  priceTotal:     { color: COLORS.text, fontSize: 22, fontWeight: '900' },
  priceMeta:      { color: COLORS.subtle, fontSize: 11, marginTop: 4 },

  // Amenities
  amenitiesGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  amenityTag:     { backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, minWidth: 72 },
  amenityIcon:    { fontSize: 20, marginBottom: 4 },
  amenityLabel:   { color: COLORS.muted, fontSize: 10, fontWeight: '600', textAlign: 'center' },

  // Section
  sectionHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 6 },
  sectionTitle:   { color: COLORS.text, fontSize: 14, fontWeight: '800', marginRight: 10 },
  sectionLine:    { flex: 1, height: 1, backgroundColor: COLORS.border },

  // Info card
  infoCard:       { backgroundColor: COLORS.surface, borderRadius: 14, paddingVertical: 4, paddingHorizontal: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  infoRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  infoLabel:      { color: COLORS.muted, fontSize: 13 },
  infoValue:      { color: COLORS.text, fontSize: 13, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },

  // CTA bar
  ctaBar:         { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.elevated, borderTopWidth: 1, borderTopColor: COLORS.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24, gap: 12 },
  ctaLeft:        { flex: 1 },
  ctaTotalLabel:  { color: COLORS.muted, fontSize: 12 },
  ctaPrice:       { color: COLORS.ferry, fontSize: 22, fontWeight: '900' },
  bookBtn:        { backgroundColor: COLORS.ferry, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 14 },
  bookBtnTxt:     { color: '#fff', fontSize: 15, fontWeight: '800' },
});
