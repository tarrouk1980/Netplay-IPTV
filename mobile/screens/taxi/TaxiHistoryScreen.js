import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

const MOCK_RIDES = [
  {
    id: '1',
    date: '03 Jun 2026',
    heure: '14:32',
    depart: "Avenue Habib Bourguiba",
    arrivee: "Aéroport Tunis-Carthage",
    distance: '18.4 km',
    duree: '28 min',
    montant: 24.50,
    statut: 'Complétée',
    chauffeur: 'Mohamed Ali B.',
    rating: 4.8,
  },
  {
    id: '2',
    date: '01 Jun 2026',
    heure: '09:15',
    depart: "La Marsa",
    arrivee: "Centre-ville Tunis",
    distance: '12.1 km',
    duree: '22 min',
    montant: 16.00,
    statut: 'Complétée',
    chauffeur: 'Karim T.',
    rating: 5.0,
  },
  {
    id: '3',
    date: '29 Mai 2026',
    heure: '18:45',
    depart: "Lac 2",
    arrivee: "Ariana Ville",
    distance: '8.7 km',
    duree: '15 min',
    montant: 11.50,
    statut: 'Annulée',
    chauffeur: '-',
    rating: null,
  },
  {
    id: '4',
    date: '27 Mai 2026',
    heure: '11:00',
    depart: "Menzah 6",
    arrivee: "Bab Bhar",
    distance: '14.3 km',
    duree: '25 min',
    montant: 19.00,
    statut: 'Complétée',
    chauffeur: 'Sami R.',
    rating: 4.5,
  },
  {
    id: '5',
    date: '25 Mai 2026',
    heure: '07:30',
    depart: "Rades",
    arrivee: "El Manar",
    distance: '22.0 km',
    duree: '38 min',
    montant: 30.00,
    statut: 'Complétée',
    chauffeur: 'Youssef M.',
    rating: 4.9,
  },
  {
    id: '6',
    date: '22 Mai 2026',
    heure: '20:10',
    depart: "Gammarth",
    arrivee: "Ennasr",
    distance: '9.5 km',
    duree: '18 min',
    montant: 13.50,
    statut: 'Annulée',
    chauffeur: '-',
    rating: null,
  },
  {
    id: '7',
    date: '20 Mai 2026',
    heure: '13:55',
    depart: "Bardo",
    arrivee: "El Omrane",
    distance: '5.2 km',
    duree: '12 min',
    montant: 7.50,
    statut: 'Complétée',
    chauffeur: 'Fares B.',
    rating: 4.7,
  },
  {
    id: '8',
    date: '18 Mai 2026',
    heure: '16:20',
    depart: "Soukra",
    arrivee: "Tunis Carthage",
    distance: '16.8 km',
    duree: '30 min',
    montant: 22.00,
    statut: 'Complétée',
    chauffeur: 'Nizar K.',
    rating: 4.6,
  },
  {
    id: '9',
    date: '15 Mai 2026',
    heure: '08:05',
    depart: "Hammam Lif",
    arrivee: "Montplaisir",
    distance: '19.6 km',
    duree: '35 min',
    montant: 26.50,
    statut: 'Annulée',
    chauffeur: '-',
    rating: null,
  },
  {
    id: '10',
    date: '12 Mai 2026',
    heure: '19:40',
    depart: "Cité Olympique",
    arrivee: "La Goulette",
    distance: '11.3 km',
    duree: '20 min',
    montant: 15.00,
    statut: 'Complétée',
    chauffeur: 'Walid S.',
    rating: 5.0,
  },
];

const FILTERS = ['Toutes', 'Complétées', 'Annulées'];

export default function TaxiHistoryScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('Toutes');

  const filteredRides = MOCK_RIDES.filter((r) => {
    if (activeFilter === 'Toutes') return true;
    if (activeFilter === 'Complétées') return r.statut === 'Complétée';
    if (activeFilter === 'Annulées') return r.statut === 'Annulée';
    return true;
  });

  const totalCourses = MOCK_RIDES.filter((r) => r.statut === 'Complétée').length;
  const totalDepense = MOCK_RIDES
    .filter((r) => r.statut === 'Complétée')
    .reduce((sum, r) => sum + r.montant, 0)
    .toFixed(2);
  const ratings = MOCK_RIDES.filter((r) => r.rating !== null).map((r) => r.rating);
  const noteMoyenne =
    ratings.length > 0
      ? (ratings.reduce((s, v) => s + v, 0) / ratings.length).toFixed(1)
      : '—';

  const showDetails = (ride) => {
    Alert.alert(
      "Détails de la course",
      `Date: ${ride.date} à ${ride.heure}\n` +
        `Départ: ${ride.depart}\n` +
        `Arrivée: ${ride.arrivee}\n` +
        `Distance: ${ride.distance}\n` +
        `Durée: ${ride.duree}\n` +
        `Montant: ${ride.montant.toFixed(2)} TND\n` +
        `Statut: ${ride.statut}\n` +
        `Chauffeur: ${ride.chauffeur}\n` +
        (ride.rating ? `Note chauffeur: ${ride.rating} ⭐` : ''),
      [{ text: 'Fermer' }]
    );
  };

  const renderRide = ({ item }) => {
    const isCompleted = item.statut === 'Complétée';
    return (
      <TouchableOpacity style={styles.card} onPress={() => showDetails(item)} activeOpacity={0.8}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardDate}>{item.date} · {item.heure}</Text>
          <Text style={styles.cardMontant}>{item.montant.toFixed(2)} TND</Text>
        </View>
        <View style={styles.routeRow}>
          <Text style={styles.routeText} numberOfLines={1}>{item.depart}</Text>
          <Text style={styles.arrow}> → </Text>
          <Text style={styles.routeText} numberOfLines={1}>{item.arrivee}</Text>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.cardMeta}>
            <Text style={styles.metaText}>{item.distance}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{item.duree}</Text>
          </View>
          <View style={[styles.badge, isCompleted ? styles.badgeCompleted : styles.badgeCancelled]}>
            <Text style={[styles.badgeText, isCompleted ? styles.badgeTextCompleted : styles.badgeTextCancelled]}>
              {item.statut}
            </Text>
          </View>
        </View>
        {item.chauffeur !== '-' && (
          <View style={styles.driverRow}>
            <Text style={styles.driverName}>{item.chauffeur}</Text>
            {item.rating !== null && (
              <Text style={styles.driverRating}>⭐ {item.rating}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes courses</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Summary Row */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalCourses}</Text>
          <Text style={styles.summaryLabel}>Courses</Text>
        </View>
        <View style={styles.summarySep} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalDepense}</Text>
          <Text style={styles.summaryLabel}>TND dépensés</Text>
        </View>
        <View style={styles.summarySep} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>⭐ {noteMoyenne}</Text>
          <Text style={styles.summaryLabel}>Note moy.</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, activeFilter === f && styles.filterTabActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterTabText, activeFilter === f && styles.filterTabTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredRides}
        keyExtractor={(item) => item.id}
        renderItem={renderRide}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune course trouvée</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: 4 },
  backArrow: { fontSize: 22, color: COLORS.text },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: COLORS.text },
  headerSpacer: { width: 30 },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  summaryLabel: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  summarySep: { width: 1, backgroundColor: COLORS.border },
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterTabActive: { backgroundColor: COLORS.primary },
  filterTabText: { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  filterTabTextActive: { color: '#000' },
  listContent: { padding: 16, paddingTop: 12 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardDate: { fontSize: 12, color: COLORS.muted },
  cardMontant: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  routeText: { flex: 1, fontSize: 13, color: COLORS.text },
  arrow: { fontSize: 13, color: COLORS.muted },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: COLORS.muted },
  metaDot: { fontSize: 12, color: COLORS.muted },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeCompleted: { backgroundColor: 'rgba(74, 222, 128, 0.15)' },
  badgeCancelled: { backgroundColor: 'rgba(248, 113, 113, 0.15)' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeTextCompleted: { color: '#4ADE80' },
  badgeTextCancelled: { color: '#F87171' },
  driverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  driverName: { fontSize: 12, color: COLORS.muted },
  driverRating: { fontSize: 12, color: COLORS.muted },
  emptyText: { textAlign: 'center', color: COLORS.muted, marginTop: 40, fontSize: 15 },
});
