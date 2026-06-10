import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, KeyboardAvoidingView, Platform,
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
  success: '#27AE60',
  border: '#2E2E3F',
  danger: '#E74C3C',
};

function PassengerForm({ index, data, onChange }) {
  return (
    <View style={styles.passengerCard}>
      <Text style={styles.passengerTitle}>Passager {index + 1}</Text>
      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>Prénom *</Text>
          <TextInput
            style={styles.input}
            value={data.firstName}
            onChangeText={(v) => onChange({ ...data, firstName: v })}
            placeholder="Prénom"
            placeholderTextColor={COLORS.muted}
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>Nom *</Text>
          <TextInput
            style={styles.input}
            value={data.lastName}
            onChangeText={(v) => onChange({ ...data, lastName: v })}
            placeholder="Nom"
            placeholderTextColor={COLORS.muted}
          />
        </View>
      </View>
      <Text style={styles.inputLabel}>N° Passeport / CIN</Text>
      <TextInput
        style={styles.input}
        value={data.passport}
        onChangeText={(v) => onChange({ ...data, passport: v })}
        placeholder="Ex: TN123456"
        placeholderTextColor={COLORS.muted}
        autoCapitalize="characters"
      />
      <Text style={styles.inputLabel}>Nationalité</Text>
      <TextInput
        style={styles.input}
        value={data.nationality}
        onChangeText={(v) => onChange({ ...data, nationality: v })}
        placeholder="Ex: Tunisienne"
        placeholderTextColor={COLORS.muted}
      />
    </View>
  );
}

export default function FlightBookingScreen({ navigation, route }) {
  const { flight, search, tripType } = route.params || {};
  const passengersCount = search?.passengers || 1;

  const [passengers, setPassengers] = useState(
    Array.from({ length: passengersCount }, () => ({
      firstName: '', lastName: '', passport: '', nationality: 'Tunisienne',
    })),
  );
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updatePassenger = (i, data) => {
    setPassengers((prev) => prev.map((p, idx) => idx === i ? data : p));
  };

  const validate = () => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.firstName.trim()) return `Passager ${i + 1} : prénom requis`;
      if (!p.lastName.trim()) return `Passager ${i + 1} : nom requis`;
    }
    if (!contactEmail.trim()) return 'Email de contact requis';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) return 'Email invalide';
    if (!contactPhone.trim()) return 'Téléphone de contact requis';
    return null;
  };

  const handleConfirm = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/flights/bookings', {
        flightId: flight.id,
        flightNumber: flight.flightNumber,
        origin: flight.origin.code,
        dest: flight.destination.code,
        departureDate: flight.departure.datetime,
        departureTime: flight.departure.time,
        arrivalTime: flight.arrival.time,
        airline: flight.airline.name,
        pricePerPax: flight.price.perPax,
        totalPrice: flight.price.total,
        passengers,
        contactEmail,
        contactPhone,
        tripType: tripType || 'ONE_WAY',
      });
      navigation.replace('FlightConfirm', { booking: res.data.booking, flight });
    } catch (e) {
      setError(e?.response?.data?.error || 'Erreur lors de la réservation. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  if (!flight) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Réservation</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Flight summary mini */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryRoute}>
              {flight.origin.code} → {flight.destination.code}
            </Text>
            <Text style={styles.summaryDetail}>
              {flight.airline.name} · {flight.flightNumber} · {flight.departure.date}
            </Text>
            <Text style={styles.summaryDetail}>
              {flight.departure.time} → {flight.arrival.time} · {flight.duration}
            </Text>
            <Text style={styles.summaryPrice}>Total : {flight.price.total.toFixed(2)} TND</Text>
          </View>

          {/* Passengers */}
          <Text style={styles.sectionTitle}>Informations passagers</Text>
          {passengers.map((p, i) => (
            <PassengerForm
              key={i}
              index={i}
              data={p}
              onChange={(d) => updatePassenger(i, d)}
            />
          ))}

          {/* Contact */}
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.passengerCard}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={styles.input}
              value={contactEmail}
              onChangeText={setContactEmail}
              placeholder="votre@email.com"
              placeholderTextColor={COLORS.muted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.inputLabel}>Téléphone *</Text>
            <TextInput
              style={styles.input}
              value={contactPhone}
              onChangeText={setContactPhone}
              placeholder="+216 XX XXX XXX"
              placeholderTextColor={COLORS.muted}
              keyboardType="phone-pad"
            />
          </View>

          {/* Info notice */}
          <View style={styles.notice}>
            <Text style={styles.noticeIcon}>ℹ️</Text>
            <Text style={styles.noticeText}>
              Vos informations sont transmises à la compagnie aérienne pour émettre votre billet.
              EasyFlight ne stocke pas vos données de paiement.
            </Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
            onPress={handleConfirm}
            disabled={loading}
          >
            <Text style={styles.confirmBtnText}>
              {loading ? 'Confirmation...' : `✅  Confirmer — ${flight.price.total.toFixed(2)} TND`}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  summaryCard: {
    backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, marginBottom: 20,
  },
  summaryRoute: { color: COLORS.text, fontSize: 18, fontWeight: '900', marginBottom: 4 },
  summaryDetail: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 2 },
  summaryPrice: { color: COLORS.text, fontSize: 16, fontWeight: '800', marginTop: 8 },
  sectionTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  passengerCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 12,
  },
  passengerTitle: { color: COLORS.accent, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 10 },
  halfInput: { flex: 1 },
  inputLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: COLORS.card, color: COLORS.text, fontSize: 15,
    padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  notice: {
    flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, marginBottom: 16, gap: 10, alignItems: 'flex-start',
  },
  noticeIcon: { fontSize: 16 },
  noticeText: { color: COLORS.muted, fontSize: 12, flex: 1, lineHeight: 18 },
  error: { color: COLORS.danger, textAlign: 'center', marginBottom: 12, fontSize: 13 },
  confirmBtn: {
    backgroundColor: COLORS.success, borderRadius: 14, padding: 18, alignItems: 'center',
  },
  confirmBtnText: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
});
