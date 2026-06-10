import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
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
  danger: '#E74C3C',
};

function Row({ label, value, valueColor }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export default function FlightDetailScreen({ navigation, route }) {
  const { flight, search, tripType, origin, dest, inboundFlights = [] } = route.params || {};

  if (!flight) return null;

  const stops = flight.stops === 0 ? 'Direct' : `${flight.stops} escale${flight.stops > 1 ? 's' : ''}`;

  const handleBook = () => {
    navigation.navigate('FlightBooking', { flight, search, tripType, origin, dest, inboundFlights });
  };

  const handleSetAlert = () => {
    navigation.navigate('FlightAlerts');
    // Inline: create alert via API then go to alerts list
    const api = require('../../services/api').default;
    api.post('/api/flights/alerts', {
      origin: flight.origin.code,
      dest: flight.destination.code,
      date: flight.departure.date,
      passengers: search?.passengers || 1,
      targetPrice: Math.round(flight.price.total * 0.9 * 10) / 10,
      currency: flight.price.currency,
    }).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail du vol</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroAirline}>
            <View style={styles.airlineBadge}>
              <Text style={styles.airlineBadgeText}>{flight.airline.code}</Text>
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.airlineName}>{flight.airline.name}</Text>
              <Text style={styles.flightNum}>Vol {flight.flightNumber}</Text>
            </View>
          </View>

          <View style={styles.heroTimeline}>
            <View style={styles.heroTimeBlock}>
              <Text style={styles.heroTime}>{flight.departure.time}</Text>
              <Text style={styles.heroCode}>{flight.origin.code}</Text>
              <Text style={styles.heroCity}>{flight.origin.city}</Text>
              <Text style={styles.heroDate}>{flight.departure.date}</Text>
            </View>

            <View style={styles.heroDuration}>
              <Text style={styles.heroDurationText}>{flight.duration}</Text>
              <View style={styles.heroLine}>
                <View style={styles.heroDot} />
                <View style={styles.heroLineBody} />
                <View style={styles.heroPlane}>
                  <Text style={{ fontSize: 18 }}>✈</Text>
                </View>
                <View style={styles.heroLineBody} />
                <View style={styles.heroDot} />
              </View>
              <Text style={[
                styles.heroStops,
                { color: flight.stops === 0 ? COLORS.success : COLORS.warning },
              ]}>
                {stops}
              </Text>
            </View>

            <View style={[styles.heroTimeBlock, { alignItems: 'flex-end' }]}>
              <Text style={styles.heroTime}>{flight.arrival.time}</Text>
              <Text style={styles.heroCode}>{flight.destination.code}</Text>
              <Text style={styles.heroCity}>{flight.destination.city}</Text>
              <Text style={styles.heroDate}>{flight.arrival.date}</Text>
            </View>
          </View>
        </View>

        {/* Price Summary */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Prix par passager</Text>
            <Text style={styles.priceValue}>{flight.price.perPax.toFixed(2)} TND</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              × {search?.passengers || 1} passager{(search?.passengers || 1) > 1 ? 's' : ''}
            </Text>
            <Text style={styles.priceTotalLabel}>= {flight.price.total.toFixed(2)} TND</Text>
          </View>
          <Text style={styles.priceNote}>Taxes et frais inclus · Paiement en TND</Text>
        </View>

        {/* Flight Details */}
        <Section title="Informations vol">
          <Row label="Numéro de vol" value={flight.flightNumber} />
          <Row label="Compagnie" value={flight.airline.name} />
          <Row label="Départ" value={`${flight.departure.date} à ${flight.departure.time}`} />
          <Row label="Arrivée" value={`${flight.arrival.date} à ${flight.arrival.time}`} />
          <Row label="Durée" value={flight.duration} />
          <Row
            label="Escales"
            value={stops}
            valueColor={flight.stops === 0 ? COLORS.success : COLORS.warning}
          />
          {flight.stops > 0 && flight.stopAirports.map((s) => (
            <Row key={s.code} label="Escale" value={`${s.city || s.code} (${s.code})`} />
          ))}
        </Section>

        {/* Baggage */}
        <Section title="Bagages inclus">
          <Row label="Bagage cabine" value={flight.baggage.cabin} />
          <Row label="Bagage en soute" value={flight.baggage.checked} />
        </Section>

        {/* Conditions */}
        <Section title="Conditions">
          <Row
            label="Remboursable"
            value={flight.refundable ? 'Oui' : 'Non'}
            valueColor={flight.refundable ? COLORS.success : COLORS.danger}
          />
          <Row
            label="Modifiable"
            value={flight.changeable ? 'Oui' : 'Non'}
            valueColor={flight.changeable ? COLORS.success : COLORS.danger}
          />
        </Section>

        {/* Seats */}
        <Section title="Disponibilité">
          <Row
            label="Places disponibles"
            value={`${flight.seats.available} places`}
            valueColor={flight.seats.available <= 5 ? COLORS.danger : COLORS.success}
          />
        </Section>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* CTA */}
      <View style={styles.cta}>
        <View style={styles.ctaPrice}>
          <Text style={styles.ctaTotalLabel}>Total</Text>
          <Text style={styles.ctaTotal}>{flight.price.total.toFixed(2)} {flight.price.currency || 'TND'}</Text>
        </View>
        <TouchableOpacity style={styles.ctaAlertBtn} onPress={handleSetAlert}>
          <Text style={styles.ctaAlertText}>🔔</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctaBtn} onPress={handleBook}>
          <Text style={styles.ctaBtnText}>Réserver</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  scroll: { padding: 16 },
  heroCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, marginBottom: 12,
  },
  heroAirline: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  airlineBadge: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  airlineBadgeText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  airlineName: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  flightNum: { color: COLORS.muted, fontSize: 13 },
  heroTimeline: { flexDirection: 'row', alignItems: 'center' },
  heroTimeBlock: { alignItems: 'flex-start', width: 80 },
  heroTime: { color: COLORS.text, fontSize: 28, fontWeight: '900' },
  heroCode: { color: COLORS.accent, fontSize: 16, fontWeight: '800' },
  heroCity: { color: COLORS.muted, fontSize: 12 },
  heroDate: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  heroDuration: { flex: 1, alignItems: 'center' },
  heroDurationText: { color: COLORS.muted, fontSize: 13, marginBottom: 6 },
  heroLine: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  heroDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent },
  heroLineBody: { flex: 1, height: 1.5, backgroundColor: COLORS.border },
  heroPlane: { marginHorizontal: 4 },
  heroStops: { fontSize: 12, fontWeight: '700', marginTop: 6 },
  priceCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.primary,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  priceLabel: { color: COLORS.muted, fontSize: 14 },
  priceValue: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  priceTotalLabel: { color: COLORS.accent, fontSize: 20, fontWeight: '900' },
  priceNote: { color: COLORS.muted, fontSize: 11, marginTop: 8 },
  section: { marginBottom: 12 },
  sectionTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  sectionBody: { backgroundColor: COLORS.surface, borderRadius: 14, overflow: 'hidden' },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  detailLabel: { color: COLORS.muted, fontSize: 14 },
  detailValue: { color: COLORS.text, fontSize: 14, fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 12 },
  cta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface, flexDirection: 'row', alignItems: 'center',
    padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  ctaPrice: { flex: 1 },
  ctaTotalLabel: { color: COLORS.muted, fontSize: 12 },
  ctaTotal: { color: COLORS.accent, fontSize: 22, fontWeight: '900' },
  ctaAlertBtn: {
    backgroundColor: COLORS.surface, borderRadius: 14, width: 48, height: 48,
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  ctaAlertText: { fontSize: 20 },
  ctaBtn: {
    backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 24,
    paddingVertical: 14,
  },
  ctaBtnText: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
});
