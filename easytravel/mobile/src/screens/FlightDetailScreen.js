import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import api from '../services/api';

const AIRLINE_COLORS = {
  VY: '#F7B731', IB: '#C00B1D', VU: '#FF6C2F', FR: '#073590',
  U2: '#FF6600', TK: '#C8102E', AF: '#002395', LH: '#05164D',
  AT: '#006233', AH: '#006B3F', TU: '#C8102E', KL: '#00A1DE',
  EK: '#C8102E', TP: '#C8102E',
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

export default function FlightDetailScreen({ navigation, route }) {
  const { flight, search, tripType, origin, dest } = route.params || {};
  const [alertSent, setAlertSent] = useState(false);

  if (!flight) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.center}>
          <Text style={s.emptyText}>Aucune donnée de vol disponible.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const passengers = search?.passengers || 1;
  const pricePerPax = flight.price?.total ?? 0;
  const totalPrice = Math.round(pricePerPax * passengers);
  const currency = flight.price?.currency || 'EUR';
  const stopsLabel =
    flight.stops === 0
      ? 'Direct'
      : `${flight.stops} escale${flight.stops > 1 ? 's' : ''}`;
  const stopsColor = flight.stops === 0 ? COLORS.success : COLORS.warning;
  const airlineColor = AIRLINE_COLORS[flight.airline?.code] || COLORS.primary;
  const seatsAvailable = flight.seats?.available ?? null;
  const seatsColor = seatsAvailable !== null && seatsAvailable <= 5 ? COLORS.danger : COLORS.success;

  const handleSetAlert = async () => {
    try {
      await api.post('/api/flights/alerts', {
        flightId: flight.id,
        origin: origin?.code,
        dest: dest?.code,
        date: search?.date,
        passengers,
        price: pricePerPax,
        currency,
      });
      setAlertSent(true);
      Alert.alert('Alerte créée', 'Vous serez notifié si le prix de ce vol change.', [
        { text: 'Voir mes alertes', onPress: () => navigation.navigate('Alerts') },
        { text: 'OK', style: 'cancel' },
      ]);
    } catch {
      Alert.alert('Erreur', "Impossible de créer l'alerte. Veuillez réessayer.", [{ text: 'OK' }]);
    }
  };

  const handleBook = () => {
    if (!flight.affiliateUrl) {
      Alert.alert('Indisponible', 'Le lien de réservation est indisponible pour ce vol.');
      return;
    }
    Alert.alert(
      'Réservation',
      `Vous allez être redirigé vers ${flight.airline?.name || 'la compagnie'} pour finaliser votre réservation.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Continuer', onPress: () => Linking.openURL(flight.affiliateUrl) },
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Détail du vol</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View style={s.heroCard}>
          {/* Airline row */}
          <View style={s.airlineRow}>
            <View style={[s.badge, { backgroundColor: airlineColor }]}>
              <Text style={s.badgeText}>{flight.airline?.code || '?'}</Text>
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={s.airlineName}>{flight.airline?.name || 'Compagnie inconnue'}</Text>
              <Text style={s.flightNo}>{flight.flightNumber || '—'}</Text>
            </View>
          </View>

          <View style={s.divider} />

          {/* Timeline row */}
          <View style={s.timeline}>
            {/* Departure */}
            <View style={s.timeBlock}>
              <Text style={s.bigTime}>{flight.departure?.time || '—'}</Text>
              <Text style={s.airportCode}>{flight.origin?.code || origin?.code || '—'}</Text>
              <Text style={s.cityName} numberOfLines={2}>{flight.origin?.city || origin?.city || ''}</Text>
              <Text style={s.dateSmall}>{flight.departure?.date || search?.date || ''}</Text>
            </View>

            {/* Center: duration + animation */}
            <View style={s.centerBlock}>
              <Text style={s.durationTxt}>{flight.duration || '—'}</Text>
              <View style={s.lineContainer}>
                <View style={s.dot} />
                <View style={s.line} />
                {flight.stops > 0 && <View style={[s.dot, { backgroundColor: COLORS.warning }]} />}
                {flight.stops > 0 && <View style={s.line} />}
                <View style={s.planeDot}>
                  <Text style={{ fontSize: 16 }}>✈</Text>
                </View>
                <View style={s.line} />
                <View style={s.dot} />
              </View>
              <Text style={[s.stopsLabel, { color: stopsColor }]}>{stopsLabel}</Text>
            </View>

            {/* Arrival */}
            <View style={[s.timeBlock, { alignItems: 'flex-end' }]}>
              <Text style={s.bigTime}>{flight.arrival?.time || '—'}</Text>
              <Text style={s.airportCode}>{flight.destination?.code || dest?.code || '—'}</Text>
              <Text style={[s.cityName, { textAlign: 'right' }]} numberOfLines={2}>
                {flight.destination?.city || dest?.city || ''}
              </Text>
              <Text style={s.dateSmall}>{flight.arrival?.date || search?.date || ''}</Text>
            </View>
          </View>
        </View>

        {/* Price card */}
        <View style={s.priceCard}>
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>Prix par passager</Text>
            <Text style={s.pricePerPax}>{Math.round(pricePerPax)} {currency}</Text>
          </View>
          {passengers > 1 && (
            <View style={s.priceRow}>
              <Text style={s.priceLabel}>× {passengers} passagers</Text>
              <Text style={s.priceTotal}>{totalPrice} {currency}</Text>
            </View>
          )}
          <Text style={s.priceMeta}>Taxes incluses · Prix en {currency}</Text>
        </View>

        {/* Section: Informations vol */}
        <SectionHeader title="Informations vol" />
        <View style={s.infoCard}>
          <InfoRow label="Numéro de vol" value={flight.flightNumber || '—'} />
          <InfoRow label="Compagnie" value={flight.airline?.name || '—'} />
          <InfoRow
            label="Départ"
            value={`${flight.departure?.date || search?.date || '—'} à ${flight.departure?.time || '—'}`}
          />
          <InfoRow
            label="Arrivée"
            value={`${flight.arrival?.date || '—'} à ${flight.arrival?.time || '—'}`}
          />
          <InfoRow label="Durée" value={flight.duration || '—'} />
          <InfoRow
            label="Escales"
            value={stopsLabel}
            valueColor={stopsColor}
          />
        </View>

        {/* Section: Bagages */}
        <SectionHeader title="Bagages inclus" />
        <View style={s.infoCard}>
          <InfoRow label="Bagage cabine" value={flight.baggage?.cabin || '10 kg'} />
          <InfoRow label="Bagage soute" value={flight.baggage?.checked || 'Non inclus'} />
        </View>

        {/* Section: Conditions */}
        <SectionHeader title="Conditions" />
        <View style={s.infoCard}>
          <InfoRow
            label="Remboursable"
            value={flight.refundable ? '✓ Oui' : '✗ Non'}
            valueColor={flight.refundable ? COLORS.success : COLORS.danger}
          />
          <InfoRow
            label="Modifiable"
            value={flight.changeable ? '✓ Oui' : '✗ Non'}
            valueColor={flight.changeable ? COLORS.success : COLORS.danger}
          />
        </View>

        {/* Section: Disponibilité */}
        <SectionHeader title="Disponibilité" />
        <View style={s.infoCard}>
          <InfoRow
            label="Places disponibles"
            value={seatsAvailable !== null ? `${seatsAvailable} place${seatsAvailable > 1 ? 's' : ''}` : 'Disponible'}
            valueColor={seatsAvailable !== null ? seatsColor : COLORS.success}
          />
        </View>

        {/* Bottom spacer for fixed CTA */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed CTA bar */}
      <View style={s.ctaBar}>
        {/* Left: total */}
        <View style={s.ctaLeft}>
          <Text style={s.ctaTotalLabel}>Total</Text>
          <Text style={s.ctaPrice}>{totalPrice} {currency}</Text>
        </View>

        {/* Middle: alert bell */}
        <TouchableOpacity
          style={[s.bellBtn, alertSent && { backgroundColor: COLORS.elevated }]}
          onPress={handleSetAlert}
          activeOpacity={0.8}
        >
          <Text style={s.bellIcon}>{alertSent ? '🔔' : '🔔'}</Text>
        </TouchableOpacity>

        {/* Right: Book */}
        <TouchableOpacity style={s.bookBtn} onPress={handleBook} activeOpacity={0.85}>
          <Text style={s.bookBtnTxt}>Réserver →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.bg },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText:    { color: COLORS.muted, fontSize: 15 },

  // Header
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn:      { padding: 4, width: 36 },
  backIcon:     { color: COLORS.accent, fontSize: 22 },
  headerTitle:  { color: COLORS.text, fontSize: 17, fontWeight: '800' },

  scroll:       { flex: 1 },
  scrollContent:{ padding: 16 },

  // Hero card
  heroCard:     { backgroundColor: COLORS.surface, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  airlineRow:   { flexDirection: 'row', alignItems: 'center' },
  badge:        { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  badgeText:    { color: '#fff', fontSize: 13, fontWeight: '900' },
  airlineName:  { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  flightNo:     { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  divider:      { height: 1, backgroundColor: COLORS.border, marginVertical: 14 },

  // Timeline
  timeline:     { flexDirection: 'row', alignItems: 'center' },
  timeBlock:    { width: 74, alignItems: 'flex-start' },
  bigTime:      { color: COLORS.text, fontSize: 28, fontWeight: '900', lineHeight: 32 },
  airportCode:  { color: COLORS.accent, fontSize: 14, fontWeight: '800', marginTop: 2 },
  cityName:     { color: COLORS.muted, fontSize: 11, marginTop: 2, maxWidth: 70 },
  dateSmall:    { color: COLORS.subtle, fontSize: 10, marginTop: 3 },
  centerBlock:  { flex: 1, alignItems: 'center' },
  durationTxt:  { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  lineContainer:{ flexDirection: 'row', alignItems: 'center', width: '95%' },
  dot:          { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.accent },
  planeDot:     { marginHorizontal: 2 },
  line:         { flex: 1, height: 1.5, backgroundColor: COLORS.border },
  stopsLabel:   { fontSize: 11, fontWeight: '700', marginTop: 5 },

  // Price card
  priceCard:    { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1.5, borderColor: COLORS.primary },
  priceRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  priceLabel:   { color: COLORS.muted, fontSize: 13 },
  pricePerPax:  { color: COLORS.accent, fontSize: 20, fontWeight: '800' },
  priceTotal:   { color: COLORS.text, fontSize: 22, fontWeight: '900' },
  priceMeta:    { color: COLORS.subtle, fontSize: 11, marginTop: 4 },

  // Section
  sectionHeader:{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 6 },
  sectionTitle: { color: COLORS.text, fontSize: 14, fontWeight: '800', marginRight: 10 },
  sectionLine:  { flex: 1, height: 1, backgroundColor: COLORS.border },

  // Info card
  infoCard:     { backgroundColor: COLORS.surface, borderRadius: 14, paddingVertical: 4, paddingHorizontal: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  infoRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  infoLabel:    { color: COLORS.muted, fontSize: 13 },
  infoValue:    { color: COLORS.text, fontSize: 13, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },

  // CTA bar
  ctaBar:       { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.elevated, borderTopWidth: 1, borderTopColor: COLORS.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24, gap: 10 },
  ctaLeft:      { flex: 1 },
  ctaTotalLabel:{ color: COLORS.muted, fontSize: 12 },
  ctaPrice:     { color: COLORS.accent, fontSize: 22, fontWeight: '900' },
  bellBtn:      { backgroundColor: COLORS.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  bellIcon:     { fontSize: 18 },
  bookBtn:      { backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 14 },
  bookBtnTxt:   { color: '#fff', fontSize: 15, fontWeight: '800' },
});
