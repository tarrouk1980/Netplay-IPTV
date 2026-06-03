import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
  green: '#4CAF50',
  red: '#F44336',
  orange: '#FF9800',
  blue: '#2196F3',
};

const TABS = ['Toutes', 'En cours', 'Terminées', 'Annulées'];

const INTERVENTIONS = [
  {
    id: 'SOS001',
    type: '🔋',
    typeLabel: 'Batterie déchargée',
    client: 'Ali B.',
    depanneur: 'Karim Maaloul',
    adresse: 'Av. Habib Bourguiba, Tunis',
    heure: '14:32',
    duree: '28 min',
    montant: '45.00',
    status: 'En cours',
  },
  {
    id: 'SOS002',
    type: '🔧',
    typeLabel: 'Panne mécanique',
    client: 'Sara K.',
    depanneur: 'Nabil Trabelsi',
    adresse: 'Route de Sousse, Hammam-Lif',
    heure: '13:15',
    duree: '52 min',
    montant: '80.00',
    status: 'Terminée',
  },
  {
    id: 'SOS003',
    type: '🚗',
    typeLabel: 'Remorquage',
    client: 'Mohamed A.',
    depanneur: 'Hassen Jebali',
    adresse: 'Autoroute A1, PK 42',
    heure: '12:50',
    duree: '1h 10 min',
    montant: '120.00',
    status: 'Terminée',
  },
  {
    id: 'SOS004',
    type: '⛽',
    typeLabel: 'Panne de carburant',
    client: 'Ines M.',
    depanneur: 'Walid Gharbi',
    adresse: "Rue de l'Indépendance, Sfax",
    heure: '11:05',
    duree: '18 min',
    montant: '30.00',
    status: 'Terminée',
  },
  {
    id: 'SOS005',
    type: '🛞',
    typeLabel: 'Crevaison',
    client: 'Youssef T.',
    depanneur: 'Amine Khelil',
    adresse: 'Bd du 7 Novembre, Nabeul',
    heure: '10:30',
    duree: '22 min',
    montant: '35.00',
    status: 'En cours',
  },
  {
    id: 'SOS006',
    type: '🔑',
    typeLabel: 'Clés enfermées',
    client: 'Rania B.',
    depanneur: 'Sami Ferjani',
    adresse: 'Centre commercial Azur, La Marsa',
    heure: '09:45',
    duree: '15 min',
    montant: '25.00',
    status: 'Annulée',
  },
  {
    id: 'SOS007',
    type: '🔋',
    typeLabel: 'Batterie déchargée',
    client: 'Omar S.',
    depanneur: 'Lotfi Ben Amor',
    adresse: 'Av. de Carthage, Ariana',
    heure: '08:20',
    duree: '30 min',
    montant: '45.00',
    status: 'Terminée',
  },
  {
    id: 'SOS008',
    type: '🚗',
    typeLabel: 'Remorquage',
    client: 'Fatma C.',
    depanneur: 'Tarek Mansour',
    adresse: 'Route de Bizerte, Mateur',
    heure: '07:55',
    duree: '45 min',
    montant: '95.00',
    status: 'Annulée',
  },
];

function getStatusColor(status) {
  switch (status) {
    case 'En cours': return COLORS.orange;
    case 'Terminée': return COLORS.green;
    case 'Annulée': return COLORS.red;
    default: return COLORS.muted;
  }
}

export default function AdminSOSScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Toutes');

  const filtered =
    activeTab === 'Toutes'
      ? INTERVENTIONS
      : INTERVENTIONS.filter((i) => {
          if (activeTab === 'En cours') return i.status === 'En cours';
          if (activeTab === 'Terminées') return i.status === 'Terminée';
          if (activeTab === 'Annulées') return i.status === 'Annulée';
          return true;
        });

  const enCours = INTERVENTIONS.filter((i) => i.status === 'En cours').length;
  const aujourdhui = INTERVENTIONS.filter((i) => i.status !== 'Annulée').length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interventions SOS</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statBadge, { backgroundColor: COLORS.red + '22' }]}>
              <Text style={[styles.statBadgeText, { color: COLORS.red }]}>{enCours}</Text>
            </View>
            <Text style={styles.statLabel}>En cours</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{aujourdhui}</Text>
            <Text style={styles.statLabel}>{"Aujourd'hui"}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>142</Text>
            <Text style={styles.statLabel}>Ce mois</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1 847</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapIcon}>🗺️</Text>
          <Text style={styles.mapLabel}>Vue carte des interventions</Text>
          <Text style={styles.mapSub}>{enCours} interventions actives</Text>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsContent}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Intervention List */}
        <View style={styles.listSection}>
          {filtered.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTypeRow}>
                  <Text style={styles.typeEmoji}>{item.type}</Text>
                  <Text style={styles.typeLabel}>{item.typeLabel}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '22' }]}>
                  <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.cardRow}>
                <Text style={styles.cardIcon}>👤</Text>
                <Text style={styles.cardValue}>{item.client}</Text>
                <Text style={styles.cardSep}>·</Text>
                <Text style={styles.cardIcon}>🛻</Text>
                <Text style={styles.cardValue}>{item.depanneur}</Text>
              </View>

              <View style={styles.cardRow}>
                <Text style={styles.cardIcon}>📍</Text>
                <Text style={[styles.cardValue, { flex: 1 }]}>{item.adresse}</Text>
                <Text style={styles.cardTime}>{item.heure}</Text>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.cardMeta}>
                  <Text style={styles.metaItem}>⏱ {item.duree}</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={[styles.metaItem, { color: COLORS.primary, fontWeight: '700' }]}>
                    {item.montant} TND
                  </Text>
                </View>
                <TouchableOpacity style={styles.detailBtn}>
                  <Text style={styles.detailBtnText}>Voir détails</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { color: COLORS.text, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  statBadgeText: { fontSize: 16, fontWeight: '800' },
  statNumber: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: COLORS.muted, fontSize: 11, textAlign: 'center' },
  mapPlaceholder: {
    marginHorizontal: 16,
    height: 200,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mapIcon: { fontSize: 40, marginBottom: 8 },
  mapLabel: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  mapSub: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  tabsScroll: { marginBottom: 12 },
  tabsContent: { paddingHorizontal: 16, gap: 8 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#000' },
  listSection: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeEmoji: { fontSize: 18 },
  typeLabel: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  cardIcon: { fontSize: 13 },
  cardValue: { color: COLORS.muted, fontSize: 13 },
  cardSep: { color: COLORS.border, marginHorizontal: 4 },
  cardTime: { color: COLORS.muted, fontSize: 12, marginLeft: 8 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaItem: { color: COLORS.muted, fontSize: 13 },
  metaDot: { color: COLORS.border },
  detailBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  detailBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
});
