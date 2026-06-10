import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
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
  danger: '#E74C3C',
  border: '#2E2E3F',
};

function BookingCard({ booking, onCancel }) {
  const passengers = Array.isArray(booking.passengers)
    ? booking.passengers
    : JSON.parse(booking.passengers || '[]');

  const isCancelled = booking.status === 'CANCELLED';

  return (
    <View style={[styles.card, isCancelled && styles.cardCancelled]}>
      <View style={styles.cardHeader}>
        <Text style={styles.refCode}>{booking.bookingRef}</Text>
        <View style={[styles.statusBadge, { backgroundColor: isCancelled ? COLORS.danger : COLORS.success }]}>
          <Text style={styles.statusText}>{isCancelled ? 'Annulé' : 'Confirmé'}</Text>
        </View>
      </View>

      <Text style={styles.route}>{booking.origin} → {booking.dest}</Text>
      <Text style={styles.detail}>
        {booking.airline} · {booking.flightNumber}
      </Text>
      <Text style={styles.detail}>
        {new Date(booking.departureDate).toLocaleDateString('fr-FR')} · {booking.departureTime} → {booking.arrivalTime}
      </Text>
      <Text style={styles.passengers}>
        {passengers.length} passager{passengers.length > 1 ? 's' : ''} : {passengers.map((p) => `${p.firstName} ${p.lastName}`).join(', ')}
      </Text>
      <Text style={styles.price}>{booking.totalPrice.toFixed(2)} TND</Text>

      {!isCancelled && (
        <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel(booking.bookingRef)}>
          <Text style={styles.cancelBtnText}>Annuler la réservation</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function FlightBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await api.get('/api/flights/bookings');
      setBookings(res.data.bookings || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    fetchBookings();
  }, [fetchBookings]));

  const handleCancel = async (ref) => {
    try {
      await api.delete(`/api/flights/bookings/${ref}`);
      fetchBookings();
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes réservations</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} tintColor={COLORS.accent} />}
        renderItem={({ item }) => (
          <BookingCard booking={item} onCancel={handleCancel} />
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>✈️</Text>
              <Text style={styles.emptyTitle}>Aucune réservation</Text>
              <Text style={styles.emptyText}>Vos vols réservés apparaîtront ici</Text>
              <TouchableOpacity
                style={styles.searchBtn}
                onPress={() => navigation.navigate('EasyFlightHome')}
              >
                <Text style={styles.searchBtnText}>Rechercher un vol</Text>
              </TouchableOpacity>
            </View>
          )
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
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  list: { padding: 16 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardCancelled: { opacity: 0.6, borderColor: COLORS.danger },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  refCode: { color: COLORS.accent, fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: COLORS.text, fontSize: 11, fontWeight: '700' },
  route: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  detail: { color: COLORS.muted, fontSize: 13, marginBottom: 2 },
  passengers: { color: COLORS.muted, fontSize: 12, marginTop: 4, marginBottom: 4 },
  price: { color: COLORS.accent, fontSize: 18, fontWeight: '900', marginTop: 6 },
  cancelBtn: {
    marginTop: 12, padding: 10, borderRadius: 10, borderWidth: 1,
    borderColor: COLORS.danger, alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.danger, fontWeight: '700', fontSize: 13 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { color: COLORS.text, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: COLORS.muted, fontSize: 14, marginBottom: 24 },
  searchBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 },
  searchBtnText: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
});
