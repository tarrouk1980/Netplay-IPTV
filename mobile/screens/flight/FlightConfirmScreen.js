import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Share,
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
  border: '#2E2E3F',
};

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function FlightConfirmScreen({ navigation, route }) {
  const { booking, flight } = route.params || {};

  if (!booking) return null;

  const passengers = Array.isArray(booking.passengers)
    ? booking.passengers
    : JSON.parse(booking.passengers || '[]');

  const handleShare = async () => {
    try {
      await Share.share({
        message: `✈️ Réservation EasyFlight confirmée !\n\nRéf : ${booking.bookingRef}\nVol : ${booking.flightNumber} (${booking.airline})\n${booking.origin} → ${booking.dest}\nDépart : ${booking.departureTime} · Arrivée : ${booking.arrivalTime}\nTotal : ${booking.totalPrice.toFixed(2)} TND`,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Success header */}
        <View style={styles.successHeader}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Réservation confirmée !</Text>
          <Text style={styles.successSub}>
            Un email de confirmation a été envoyé à {booking.contactEmail}
          </Text>
        </View>

        {/* Booking ref */}
        <View style={styles.refCard}>
          <Text style={styles.refLabel}>Référence de réservation</Text>
          <Text style={styles.refCode}>{booking.bookingRef}</Text>
          <Text style={styles.refNote}>Présentez cette référence à l'aéroport</Text>
        </View>

        {/* Flight info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails du vol</Text>
          <View style={styles.sectionBody}>
            <InfoRow label="Compagnie" value={booking.airline} />
            <InfoRow label="N° de vol" value={booking.flightNumber} />
            <InfoRow label="Itinéraire" value={`${booking.origin} → ${booking.dest}`} />
            <InfoRow label="Départ" value={`${new Date(booking.departureDate).toLocaleDateString('fr-FR')} à ${booking.departureTime}`} />
            <InfoRow label="Arrivée" value={booking.arrivalTime} />
            <InfoRow label="Type" value={booking.tripType === 'ROUND_TRIP' ? 'Aller-retour' : 'Aller simple'} />
          </View>
        </View>

        {/* Passengers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Passagers</Text>
          <View style={styles.sectionBody}>
            {passengers.map((p, i) => (
              <InfoRow
                key={i}
                label={`Passager ${i + 1}`}
                value={`${p.firstName} ${p.lastName}`}
              />
            ))}
          </View>
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Montant</Text>
          <View style={styles.sectionBody}>
            <InfoRow label="Prix par passager" value={`${booking.pricePerPax.toFixed(2)} TND`} />
            <InfoRow label="Total payé" value={`${booking.totalPrice.toFixed(2)} TND`} />
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnText}>📤  Partager la confirmation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookingsBtn}
          onPress={() => navigation.navigate('FlightBookings')}
        >
          <Text style={styles.bookingsBtnText}>📋  Voir mes réservations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('EasyFlightHome')}
        >
          <Text style={styles.homeBtnText}>✈️  Nouveau vol</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16 },
  successHeader: { alignItems: 'center', paddingVertical: 32 },
  checkCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.success,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  checkIcon: { color: COLORS.text, fontSize: 40, fontWeight: '900' },
  successTitle: { color: COLORS.text, fontSize: 24, fontWeight: '900', marginBottom: 8 },
  successSub: { color: COLORS.muted, fontSize: 13, textAlign: 'center', paddingHorizontal: 20 },
  refCard: {
    backgroundColor: COLORS.primary, borderRadius: 16, padding: 20,
    alignItems: 'center', marginBottom: 20,
  },
  refLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 8 },
  refCode: { color: COLORS.text, fontSize: 28, fontWeight: '900', letterSpacing: 4 },
  refNote: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 8 },
  section: { marginBottom: 12 },
  sectionTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  sectionBody: { backgroundColor: COLORS.surface, borderRadius: 14, overflow: 'hidden' },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  infoLabel: { color: COLORS.muted, fontSize: 14 },
  infoValue: { color: COLORS.text, fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'right', marginLeft: 12 },
  shareBtn: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  shareBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 15 },
  bookingsBtn: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  bookingsBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 15 },
  homeBtn: {
    backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, alignItems: 'center',
  },
  homeBtnText: { color: COLORS.text, fontWeight: '800', fontSize: 15 },
});
