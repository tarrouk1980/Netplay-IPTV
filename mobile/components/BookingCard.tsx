import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Booking } from '@/lib/api';

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: '#FEF3C7', text: '#92400E', label: 'En attente' },
  confirmed: { bg: '#D1FAE5', text: '#065F46', label: 'Confirmée' },
  completed: { bg: '#DBEAFE', text: '#1E40AF', label: 'Terminée' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B', label: 'Annulée' },
};

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const status = STATUS_CONFIG[booking.status] ?? { bg: '#F3F4F6', text: '#374151', label: booking.status };
  const date = new Date(booking.slot_datetime_start);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/dashboard/bookings/${booking.id}` as any)}
      activeOpacity={0.9}
    >
      <View style={styles.row}>
        <View style={styles.leftContent}>
          <Text style={styles.expertName}>{booking.expert?.user?.name ?? 'Expert'}</Text>
          <Text style={styles.date}>
            {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
            {' à '}
            {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text style={styles.price}>{booking.price} €</Text>
        </View>
        <View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leftContent: { flex: 1, marginRight: 12 },
  expertName: { fontSize: 15, fontWeight: '700', color: '#1E1B4B', marginBottom: 4 },
  date: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  price: { fontSize: 14, fontWeight: '600', color: '#4F46E5' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  statusText: { fontSize: 12, fontWeight: '600' },
});
