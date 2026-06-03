import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
  green: '#22C55E',
  red: '#EF4444',
};

const MOCK_RIDES = [
  { id: '1', date: '02/06/2026', heure: '08:15', depart: "Avenue Habib Bourguiba", arrivee: "Aéroport Tunis-Carthage", duree: '28 min', distance: '12.4 km', montant: 18.50, statut: 'Complétée' },
  { id: '2', date: '01/06/2026', heure: '14:30', depart: "Centre Ville Tunis", arrivee: "La Marsa", duree: '35 min', distance: '16.2 km', montant: 22.00, statut: 'Complétée' },
  { id: '3', date: '31/05/2026', heure: '09:45', depart: "Lac 2", arrivee: "Bardo", duree: '0 min', distance: '0 km', montant: 0, statut: 'Annulée' },
  { id: '4', date: '30/05/2026', heure: '17:20', depart: "Ariana", arrivee: "El Menzah 6", duree: '22 min', distance: '8.7 km', montant: 13.00, statut: 'Complétée' },
  { id: '5', date: '29/05/2026', heure: '11:00', depart: "Cité Olympique", arrivee: "Ennasr 2", duree: '18 min', distance: '7.1 km', montant: 11.50, statut: 'Complétée' },
  { id: '6', date: '28/05/2026', heure: '20:05', depart: "Charguia 1", arrivee: "Soukra", duree: '0 min', distance: '0 km', montant: 0, statut: 'Annulée' },
  { id: '7', date: '27/05/2026', heure: '07:30', depart: "Montplaisir", arrivee: "Mégrine", duree: '40 min', distance: '18.5 km', montant: 26.00, statut: 'Complétée' },
  { id: '8', date: '26/05/2026', heure: '13:15', depart: "Ben Arous", arrivee: "Hammam Lif", duree: '32 min', distance: '14.0 km', montant: 19.50, statut: 'Complétée' },
  { id: '9', date: '25/05/2026', heure: '16:50', depart: "Sfax Centre", arrivee: "Aéroport Sfax", duree: '25 min', distance: '10.3 km', montant: 15.00, statut: 'Complétée' },
  { id: '10', date: '24/05/2026', heure: '10:20', depart: "Sousse Centre", arrivee: "Hammam Sousse", duree: '0 min', distance: '0 km', montant: 0, statut: 'Annulée' },
  { id: '11', date: '23/05/2026', heure: '19:40', depart: "Nabeul", arrivee: "Hammamet", duree: '20 min', distance: '9.2 km', montant: 14.00, statut: 'Complétée' },
  { id: '12', date: '22/05/2026', heure: '08:55', depart: "Bizerte Centre", arrivee: "Port de Bizerte", duree: '15 min', distance: '5.8 km', montant: 9.00, statut: 'Complétée' },
];

const FILTERS = ['Tout', 'Complétées', 'Annulées'];

export default function DriverRideHistoryScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('Tout');

  const filteredRides = MOCK_RIDES.filter((ride) => {
    if (activeFilter === 'Tout') return true;
    if (activeFilter === 'Complétées') return ride.statut === 'Complétée';
    if (activeFilter === 'Annulées') return ride.statut === 'Annulée';
    return true;
  });

  const handleCardPress = (ride) => {
    Alert.alert(
      "Détail de la course",
      `Date : ${ride.date} à ${ride.heure}\nDépart : ${ride.depart}\nArrivée : ${ride.arrivee}\nDurée : ${ride.duree}\nDistance : ${ride.distance}\nMontant : ${ride.montant.toFixed(2)} TND\nStatut : ${ride.statut}`,
      [{ text: 'Fermer', style: 'cancel' }]
    );
  };

  const renderRide = ({ item }) => {
    const isCompleted = item.statut === 'Complétée';
    return (
      <TouchableOpacity style={styles.card} onPress={() => handleCardPress(item)} activeOpacity={0.8}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardDate}>{item.date} — {item.heure}</Text>
          <View style={[styles.badge, { backgroundColor: isCompleted ? COLORS.green + '22' : COLORS.red + '22' }]}>
            <Text style={[styles.badgeText, { color: isCompleted ? COLORS.green : COLORS.red }]}>{item.statut}</Text>
          </View>
        </View>
        <View style={styles.trajet}>
          <View style={styles.trajetRow}>
            <Text style={styles.dotGreen}>●</Text>
            <Text style={styles.trajetText} numberOfLines={1}>{item.depart}</Text>
          </View>
          <View style={styles.trajetLine} />
          <View style={styles.trajetRow}>
            <Text style={styles.dotOrange}>▼</Text>
            <Text style={styles.trajetText} numberOfLines={1}>{item.arrivee}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.metaText}>⏱ {item.duree}</Text>
          <Text style={styles.metaText}>📍 {item.distance}</Text>
          <Text style={styles.montant}>{item.montant.toFixed(2)} TND</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Historique des courses</Text>
        <View style={styles.backBtn} />
      </View>

      <Text style={styles.totalCount}>{filteredRides.length} courses au total</Text>

      <View style={styles.tabs}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.tab, activeFilter === f && styles.tabActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.tabText, activeFilter === f && styles.tabTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredRides}
        keyExtractor={(item) => item.id}
        renderItem={renderRide}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: COLORS.text,
    fontSize: 28,
    lineHeight: 32,
  },
  title: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  totalCount: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#000',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardDate: {
    color: COLORS.muted,
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  trajet: {
    marginBottom: 10,
  },
  trajetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotGreen: {
    fontSize: 10,
    color: COLORS.green,
    width: 14,
    textAlign: 'center',
  },
  dotOrange: {
    fontSize: 10,
    color: COLORS.primary,
    width: 14,
    textAlign: 'center',
  },
  trajetText: {
    color: COLORS.text,
    fontSize: 13,
    flex: 1,
  },
  trajetLine: {
    width: 1,
    height: 8,
    backgroundColor: COLORS.border,
    marginLeft: 6,
    marginVertical: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metaText: {
    color: COLORS.muted,
    fontSize: 12,
    flex: 1,
  },
  montant: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
