import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const MOCK_TRIPS = [
  {
    id: 'ST1', date: 'Demain', time: '08:30', from: 'Berges du Lac 2, Tunis',
    to: 'Aéroport Tunis-Carthage', type: 'NORMAL', fare: '14.500', status: 'CONFIRMED',
  },
  {
    id: 'ST2', date: 'Ven 06 juin', time: '14:00', from: 'Centre Urbain Nord',
    to: 'La Marsa', type: 'NORMAL', fare: '9.800', status: 'PENDING',
  },
  {
    id: 'ST3', date: 'Sam 07 juin', time: '19:30', from: 'Cité Sportive, Rades',
    to: 'Lac 1, Tunis', type: 'NORMAL', fare: '12.200', status: 'CONFIRMED',
  },
];

const STATUS = {
  CONFIRMED: { color: COLORS.green, label: 'Confirmée ✅' },
  PENDING: { color: COLORS.accent, label: 'En attente ⏳' },
  CANCELLED: { color: COLORS.red, label: 'Annulée ❌' },
};

export default function TaxiScheduledTripsScreen({ navigation }) {
  const [trips, setTrips] = useState(MOCK_TRIPS);

  const handleCancel = (trip) => {
    Alert.alert(
      'Annuler la course',
      `Annuler la course du ${trip.date} à ${trip.time} ?`,
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Annuler la course', style: 'destructive',
          onPress: () => setTrips(prev =>
            prev.map(t => t.id === trip.id ? { ...t, status: 'CANCELLED' } : t)
          ),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📅 Courses programmées</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {trips.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 48 }}>📅</Text>
            <Text style={styles.emptyText}>Aucune course programmée</Text>
            <TouchableOpacity style={styles.scheduleBtn} onPress={() => navigation.navigate('TaxiRequest', { scheduledMode: true })}>
              <Text style={styles.scheduleBtnText}>➕ Programmer une course</Text>
            </TouchableOpacity>
          </View>
        ) : (
          trips.map(trip => {
            const st = STATUS[trip.status] || STATUS.PENDING;
            const isCancelled = trip.status === 'CANCELLED';
            return (
              <View key={trip.id} style={[styles.tripCard, isCancelled && { opacity: 0.5 }]}>
                <View style={styles.tripTop}>
                  <View style={styles.dateBox}>
                    <Text style={styles.tripDate}>{trip.date}</Text>
                    <Text style={styles.tripTime}>{trip.time}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: st.color + '20' }]}>
                    <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                  </View>
                </View>

                <View style={styles.routeRow}>
                  <View style={styles.routeLine}>
                    <View style={[styles.routeDot, { backgroundColor: COLORS.green }]} />
                    <View style={styles.routeConnector} />
                    <View style={[styles.routeDot, { backgroundColor: COLORS.red }]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.routeAddr} numberOfLines={1}>{trip.from}</Text>
                    <View style={{ height: 14 }} />
                    <Text style={styles.routeAddr} numberOfLines={1}>{trip.to}</Text>
                  </View>
                  <Text style={styles.tripFare}>{trip.fare} TND</Text>
                </View>

                {!isCancelled && (
                  <View style={styles.tripActions}>
                    <TouchableOpacity
                      style={styles.modifyBtn}
                      onPress={() => navigation.navigate('TaxiRequest', { scheduledMode: true })}
                    >
                      <Text style={styles.modifyBtnText}>✏️ Modifier</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(trip)}>
                      <Text style={styles.cancelBtnText}>✕ Annuler</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}

        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => navigation.navigate('TaxiRequest', { scheduledMode: true })}
        >
          <Text style={styles.newBtnText}>📅 Programmer une nouvelle course</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, width: 36 },
  backIcon: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: COLORS.muted, fontSize: 15, marginTop: 12 },
  scheduleBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, marginTop: 20 },
  scheduleBtnText: { color: '#000', fontSize: 14, fontWeight: '900' },
  tripCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  tripTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  dateBox: {},
  tripDate: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  tripTime: { color: COLORS.accent, fontSize: 16, fontWeight: '900' },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  routeLine: { alignItems: 'center', gap: 2 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeConnector: { width: 1, height: 14, backgroundColor: COLORS.border },
  routeAddr: { color: COLORS.text, fontSize: 12 },
  tripFare: { color: COLORS.accent, fontSize: 15, fontWeight: '900', minWidth: 70, textAlign: 'right' },
  tripActions: { flexDirection: 'row', gap: 8 },
  modifyBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center',
    backgroundColor: COLORS.accent + '15', borderWidth: 1, borderColor: COLORS.accent + '40',
  },
  modifyBtnText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  cancelBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center',
    backgroundColor: COLORS.red + '15', borderWidth: 1, borderColor: COLORS.red + '40',
  },
  cancelBtnText: { color: COLORS.red, fontSize: 12, fontWeight: '700' },
  newBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  newBtnText: { color: '#000', fontSize: 14, fontWeight: '900' },
});
