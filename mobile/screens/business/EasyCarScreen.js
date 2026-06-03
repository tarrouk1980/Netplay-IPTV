import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#E74C3C',
};

const CARS = [
  {
    id: '1', brand: 'Renault', model: 'Clio 5', year: 2022,
    type: 'Citadine', seats: 5, fuel: 'Essence', ac: true,
    priceDay: 65, priceWeek: 390, deposit: 500,
    available: true, emoji: '🚗',
    features: ['Climatisation', 'Bluetooth', 'GPS', 'Caméra recul'],
  },
  {
    id: '2', brand: 'Hyundai', model: 'Tucson', year: 2023,
    type: 'SUV', seats: 5, fuel: 'Diesel', ac: true,
    priceDay: 110, priceWeek: 660, deposit: 800,
    available: true, emoji: '🚙',
    features: ['Climatisation', 'Bluetooth', '4x4', 'Toit panoramique'],
  },
  {
    id: '3', brand: 'Volkswagen', model: 'Golf 8', year: 2022,
    type: 'Berline', seats: 5, fuel: 'Essence', ac: true,
    priceDay: 85, priceWeek: 510, deposit: 600,
    available: false, emoji: '🚘',
    features: ['Climatisation', 'CarPlay', 'Lane Assist'],
  },
  {
    id: '4', brand: 'Mercedes', model: 'Classe C', year: 2021,
    type: 'Berline Luxe', seats: 5, fuel: 'Diesel', ac: true,
    priceDay: 180, priceWeek: 1080, deposit: 1500,
    available: true, emoji: '🚀',
    features: ['Cuir', 'Massage', 'Ambiance LED', 'Aide au stationnement'],
  },
  {
    id: '5', brand: 'Peugeot', model: 'Partner', year: 2020,
    type: 'Utilitaire', seats: 2, fuel: 'Diesel', ac: true,
    priceDay: 75, priceWeek: 450, deposit: 700,
    available: true, emoji: '🚐',
    features: ['Grand coffre', 'Attaches de charge', 'GPS'],
  },
];

const TYPES = ['Tous', 'Citadine', 'SUV', 'Berline', 'Berline Luxe', 'Utilitaire'];

function CarCard({ car, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, !car.available && { opacity: 0.5 }]}
      onPress={onPress}
      disabled={!car.available}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.carEmoji}>{car.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.carName}>{car.brand} {car.model}</Text>
          <Text style={styles.carMeta}>{car.type} · {car.year} · {car.fuel}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: car.available ? COLORS.green : COLORS.red }]}>
          <Text style={styles.badgeText}>{car.available ? 'Dispo' : 'Réservé'}</Text>
        </View>
      </View>

      <View style={styles.features}>
        {car.features.slice(0, 3).map((f, i) => (
          <View key={i} style={styles.featureTag}>
            <Text style={styles.featureText}>✓ {f}</Text>
          </View>
        ))}
        {car.features.length > 3 && (
          <View style={styles.featureTag}>
            <Text style={styles.featureText}>+{car.features.length - 3}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.price}>{car.priceDay} TND<Text style={styles.priceSub}>/jour</Text></Text>
          <Text style={styles.priceSub}>{car.priceWeek} TND/semaine</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.seats}>👥 {car.seats} places</Text>
          <Text style={styles.deposit}>Caution: {car.deposit} TND</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function EasyCarScreen({ navigation }) {
  const [filter, setFilter] = useState('Tous');
  const [selected, setSelected] = useState(null);
  const [days, setDays] = useState(1);

  const filtered = filter === 'Tous' ? CARS : CARS.filter((c) => c.type === filter);

  const handleBook = () => {
    if (!selected) return;
    Alert.alert(
      "Réservation EasyCar",
      `${selected.brand} ${selected.model} — ${days} jour(s)\nTotal: ${selected.priceDay * days} TND + caution ${selected.deposit} TND\n\nVotre demande sera envoyée à notre équipe qui vous contactera sous 30 minutes.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => {
          Alert.alert("Réservation envoyée ✅", "Notre équipe vous contactera très bientôt.");
          setSelected(null);
        }},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>🚗 EasyCar</Text>
          <Text style={styles.subtitle}>Location de véhicule — Tunis & environs</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>🎉 -20% sur toute location de 3 jours ou plus !</Text>
        </View>

        {/* Type filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.filterBtn, filter === t && styles.filterBtnActive]}
              onPress={() => setFilter(t)}
            >
              <Text style={[styles.filterBtnText, filter === t && { color: '#000' }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Cars */}
        <View style={{ paddingHorizontal: 16, gap: 12, paddingBottom: 100 }}>
          {filtered.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              onPress={() => setSelected(selected?.id === car.id ? null : car)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Booking panel */}
      {selected && (
        <View style={styles.bookingPanel}>
          <Text style={styles.bookingTitle}>{selected.brand} {selected.model} sélectionné</Text>
          <View style={styles.daysRow}>
            <Text style={styles.bookingLabel}>Durée :</Text>
            <TouchableOpacity style={styles.daysBtn} onPress={() => setDays(Math.max(1, days - 1))}>
              <Text style={styles.daysBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.daysNum}>{days} jour{days > 1 ? 's' : ''}</Text>
            <TouchableOpacity style={styles.daysBtn} onPress={() => setDays(days + 1)}>
              <Text style={styles.daysBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bookingTotal}>
            <Text style={styles.bookingTotalLabel}>Total estimé</Text>
            <Text style={styles.bookingTotalValue}>{selected.priceDay * days} TND</Text>
          </View>
          <TouchableOpacity style={styles.bookBtn} onPress={handleBook}>
            <Text style={styles.bookBtnText}>Réserver maintenant</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.white, fontSize: 20, fontWeight: '700' },
  subtitle: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  banner: {
    backgroundColor: '#1A2A1A', margin: 16, borderRadius: 10,
    padding: 12, borderWidth: 1, borderColor: COLORS.green,
  },
  bannerText: { color: COLORS.green, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  filterRow: { marginVertical: 12 },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  filterBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  carEmoji: { fontSize: 36 },
  carName: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  carMeta: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  featureTag: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.border,
  },
  featureText: { color: COLORS.muted, fontSize: 11 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  price: { color: COLORS.accent, fontSize: 22, fontWeight: '700' },
  priceSub: { color: COLORS.muted, fontSize: 12 },
  seats: { color: COLORS.white, fontSize: 13 },
  deposit: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  bookingPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border,
    padding: 20,
  },
  bookingTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  daysRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  bookingLabel: { color: COLORS.muted, fontSize: 14 },
  daysBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  daysBtnText: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  daysNum: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  bookingTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  bookingTotalLabel: { color: COLORS.muted, fontSize: 14 },
  bookingTotalValue: { color: COLORS.accent, fontSize: 22, fontWeight: '700' },
  bookBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  bookBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
});
