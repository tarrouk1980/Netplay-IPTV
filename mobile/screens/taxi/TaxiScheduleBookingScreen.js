import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const HOURS = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

const VEHICLE_TYPES = [
  { key: 'berline', label: 'Berline', icon: '🚗', price: 1.2 },
  { key: 'van', label: 'Van', icon: '🚐', price: 1.8 },
  { key: 'premium', label: 'Premium', icon: '🚘', price: 2.5 },
];

export default function TaxiScheduleBookingScreen({ navigation, route }) {
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedHour, setSelectedHour] = useState(null);
  const [vehicleType, setVehicleType] = useState('berline');
  const [booking, setBooking] = useState(false);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const formatDate = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

  const vehicle = VEHICLE_TYPES.find(v => v.key === vehicleType);

  const handleBook = async () => {
    if (!selectedHour) {
      Alert.alert('Heure requise', 'Choisissez une heure de prise en charge.');
      return;
    }
    const date = dates[selectedDay];
    const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${selectedHour}`;
    setBooking(true);
    try {
      await api.post('/api/taxi/schedule', { datetime: dateStr, vehicleType });
    } catch {}
    setBooking(false);
    Alert.alert(
      '✅ Course planifiée',
      `Votre ${vehicle.label} sera là le ${formatDate(date)} à ${selectedHour}. Vous recevrez une confirmation.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📅 Planifier une course</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        <Text style={styles.sectionTitle}>CHOISIR LA DATE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
          {dates.map((d, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.dayBtn, selectedDay === i && styles.dayBtnActive]}
              onPress={() => setSelectedDay(i)}
            >
              <Text style={[styles.dayName, selectedDay === i && { color: '#000' }]}>{i === 0 ? 'Auj.' : DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]}</Text>
              <Text style={[styles.dayNum, selectedDay === i && { color: '#000' }]}>{d.getDate()}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>CHOISIR L'HEURE</Text>
        <View style={styles.hoursGrid}>
          {HOURS.map(h => (
            <TouchableOpacity
              key={h}
              style={[styles.hourBtn, selectedHour === h && styles.hourBtnActive]}
              onPress={() => setSelectedHour(h)}
            >
              <Text style={[styles.hourText, selectedHour === h && styles.hourTextActive]}>{h}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>TYPE DE VÉHICULE</Text>
        {VEHICLE_TYPES.map(v => (
          <TouchableOpacity
            key={v.key}
            style={[styles.vehicleBtn, vehicleType === v.key && styles.vehicleBtnActive]}
            onPress={() => setVehicleType(v.key)}
          >
            <Text style={{ fontSize: 28 }}>{v.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleLabel}>{v.label}</Text>
              <Text style={styles.vehiclePrice}>Tarif ×{v.price.toFixed(1)}</Text>
            </View>
            {vehicleType === v.key && <Text style={{ color: COLORS.accent, fontSize: 18 }}>✓</Text>}
          </TouchableOpacity>
        ))}

        {selectedHour && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📋 Récapitulatif</Text>
            <Text style={styles.summaryLine}>📅 {formatDate(dates[selectedDay])} à {selectedHour}</Text>
            <Text style={styles.summaryLine}>{vehicle.icon} {vehicle.label} — tarif ×{vehicle.price.toFixed(1)}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.bookBtn, (!selectedHour || booking) && { opacity: 0.5 }]}
          onPress={handleBook}
          disabled={!selectedHour || booking}
        >
          {booking ? <ActivityIndicator color="#000" /> : <Text style={styles.bookBtnText}>Confirmer la réservation →</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  daysScroll: { marginBottom: 20 },
  dayBtn: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, marginRight: 8, minWidth: 56 },
  dayBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  dayName: { color: COLORS.muted, fontSize: 10, fontWeight: '600' },
  dayNum: { color: COLORS.text, fontSize: 18, fontWeight: '900', marginTop: 2 },
  hoursGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  hourBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  hourBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  hourText: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  hourTextActive: { color: '#000' },
  vehicleBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  vehicleBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '10' },
  vehicleLabel: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  vehiclePrice: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  summaryCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.accent + '40' },
  summaryTitle: { color: COLORS.accent, fontSize: 13, fontWeight: '800', marginBottom: 8 },
  summaryLine: { color: COLORS.text, fontSize: 13, lineHeight: 22 },
  bookBtn: { backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  bookBtnText: { color: '#000', fontSize: 15, fontWeight: '900' },
});
