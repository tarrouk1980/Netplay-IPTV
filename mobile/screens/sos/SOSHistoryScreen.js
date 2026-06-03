import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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
  blue: '#3B82F6',
};

const MOCK_INTERVENTIONS = [
  {
    id: 'INT001',
    date: '02/06/2026',
    heure: '09:10',
    typeEmoji: '🔋',
    typeLabel: 'Batterie',
    client: "M. ****",
    adresse: "Avenue Habib Bourguiba, Tunis",
    montant: 45.00,
    duree: '30 min',
    statut: 'Terminée',
  },
  {
    id: 'INT002',
    date: '01/06/2026',
    heure: '14:45',
    typeEmoji: '🛞',
    typeLabel: 'Pneu crevé',
    client: "M. ****",
    adresse: "Route de La Marsa, Carthage",
    montant: 35.00,
    duree: '25 min',
    statut: 'Terminée',
  },
  {
    id: 'INT003',
    date: '01/06/2026',
    heure: '18:30',
    typeEmoji: '⚙️',
    typeLabel: 'Panne moteur',
    client: "M. ****",
    adresse: "Autoroute A1, Km 24",
    montant: 80.00,
    duree: '55 min',
    statut: 'En cours',
  },
  {
    id: 'INT004',
    date: '31/05/2026',
    heure: '11:00',
    typeEmoji: '🚨',
    typeLabel: 'Accident',
    client: "M. ****",
    adresse: "Carrefour Bardo, Tunis",
    montant: 0,
    duree: '0 min',
    statut: 'Annulée',
  },
  {
    id: 'INT005',
    date: '30/05/2026',
    heure: '07:20',
    typeEmoji: '⛽',
    typeLabel: 'Carburant',
    client: "M. ****",
    adresse: "Route Nationale 1, Mégrine",
    montant: 20.00,
    duree: '15 min',
    statut: 'Terminée',
  },
  {
    id: 'INT006',
    date: '29/05/2026',
    heure: '16:55',
    typeEmoji: '🔋',
    typeLabel: 'Batterie',
    client: "M. ****",
    adresse: "Cité El Khadra, Tunis",
    montant: 45.00,
    duree: '28 min',
    statut: 'Terminée',
  },
  {
    id: 'INT007',
    date: '28/05/2026',
    heure: '10:30',
    typeEmoji: '🛞',
    typeLabel: 'Pneu crevé',
    client: "M. ****",
    adresse: "Avenue de la Liberté, Sfax",
    montant: 35.00,
    duree: '20 min',
    statut: 'Terminée',
  },
  {
    id: 'INT008',
    date: '27/05/2026',
    heure: '20:15',
    typeEmoji: '⚙️',
    typeLabel: 'Panne moteur',
    client: "M. ****",
    adresse: "Route de Bizerte, Ariana",
    montant: 0,
    duree: '0 min',
    statut: 'Annulée',
  },
  {
    id: 'INT009',
    date: '26/05/2026',
    heure: '13:40',
    typeEmoji: '🚨',
    typeLabel: 'Accident',
    client: "M. ****",
    adresse: "Boulevard 7 novembre, Sousse",
    montant: 95.00,
    duree: '70 min',
    statut: 'Terminée',
  },
  {
    id: 'INT010',
    date: '25/05/2026',
    heure: '08:05',
    typeEmoji: '⛽',
    typeLabel: 'Carburant',
    client: "M. ****",
    adresse: "Route de Hammamet, Nabeul",
    montant: 20.00,
    duree: '12 min',
    statut: 'Terminée',
  },
];

const FILTERS = ['Tout', 'En cours', 'Terminées', 'Annulées'];

function getStatusColor(statut) {
  if (statut === 'En cours') return COLORS.blue;
  if (statut === 'Terminée') return COLORS.green;
  if (statut === 'Annulée') return COLORS.red;
  return COLORS.muted;
}

export default function SOSHistoryScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('Tout');

  const filtered = MOCK_INTERVENTIONS.filter((item) => {
    if (activeFilter === 'Tout') return true;
    if (activeFilter === 'En cours') return item.statut === 'En cours';
    if (activeFilter === 'Terminées') return item.statut === 'Terminée';
    if (activeFilter === 'Annulées') return item.statut === 'Annulée';
    return true;
  });

  const totalEarned = MOCK_INTERVENTIONS.filter((i) => i.statut === 'Terminée').reduce((sum, i) => sum + i.montant, 0);

  const renderItem = ({ item }) => {
    const color = getStatusColor(item.statut);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <Text style={styles.typeEmoji}>{item.typeEmoji}</Text>
            <View>
              <Text style={styles.typeLabel}>{item.typeLabel}</Text>
              <Text style={styles.cardDate}>{item.date} — {item.heure}</Text>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: color + '22' }]}>
            <Text style={[styles.badgeText, { color }]}>{item.statut}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Text style={styles.adresse} numberOfLines={1}>📍 {item.adresse}</Text>
        <Text style={styles.clientName}>👤 {item.client}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.metaText}>⏱ {item.duree}</Text>
          <Text style={styles.montant}>{item.montant.toFixed(2)} TND</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Historique interventions</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Summary bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{MOCK_INTERVENTIONS.length}</Text>
          <Text style={styles.summaryLabel}>Interventions</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLORS.primary }]}>{totalEarned.toFixed(2)} TND</Text>
          <Text style={styles.summaryLabel}>Total gagné</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Dépanneur</Text>
          <Text style={styles.depanneurEmoji}>🛻</Text>
        </View>
      </View>

      {/* Filter tabs */}
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
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucune intervention trouvée</Text>
          </View>
        }
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
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  summaryLabel: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },
  depanneurEmoji: {
    fontSize: 22,
    marginTop: 2,
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
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.muted,
    fontSize: 11,
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
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typeEmoji: {
    fontSize: 26,
  },
  typeLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  cardDate: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
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
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 10,
  },
  adresse: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  clientName: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metaText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  montant: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 15,
  },
});
