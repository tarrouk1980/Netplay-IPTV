import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
} from 'react-native';
import AdBanner from '../../components/AdBanner';
import SponsoredCard from '../../components/SponsoredCard';
import { useGroceryStore } from '../../store/groceryStore';

const VIOLET = '#8E44AD';
const GOLD = '#F5A623';
const BG = '#0A0A0F';
const CARD_BG = '#16161E';
const TEXT = '#FFFFFF';
const SUBTEXT = '#9B9BAA';

const SCHEDULE_OPTIONS = [
  { label: 'Maintenant', value: null },
  { label: 'Dans 30 min', value: 30 },
  { label: 'Dans 1h', value: 60 },
  { label: 'Dans 2h', value: 120 },
];

export default function GroceryHomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const { setMode: storeSetMode } = useGroceryStore();

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    storeSetMode(selectedMode);
    navigation.navigate('GroceryCart', { mode: selectedMode, scheduledMinutes: schedule });
  };

  const merchants = [
    { id: '1', name: 'Monoprix Tunis', category: 'Supermarché', isBoosted: true, rating: 4.8 },
    { id: '2', name: 'Carrefour Market', category: 'Supermarché', isBoosted: false, rating: 4.5 },
    { id: '3', name: 'Bio Organic', category: 'Bio & Naturel', isBoosted: false, rating: 4.7 },
  ];

  const filtered = merchants.filter(
    (m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🛒 Grocery</Text>
          <Text style={styles.headerSub}>Courses livrées chez vous</Text>
        </View>

        <AdBanner placement="GROCERY" style={styles.topBanner} />

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher produits ou marchands..."
            placeholderTextColor={SUBTEXT}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <Text style={styles.sectionTitle}>🕐 Livraison</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scheduleRow}>
          {SCHEDULE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.label}
              style={[styles.scheduleChip, schedule === opt.value && styles.scheduleChipActive]}
              onPress={() => setSchedule(opt.value)}
            >
              <Text style={[styles.scheduleChipText, schedule === opt.value && styles.scheduleChipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Comment voulez-vous commander ?</Text>
        <View style={styles.modeRow}>
          <TouchableOpacity style={styles.modeCard} onPress={() => handleModeSelect('MERCHANT')}>
            <Text style={styles.modeIcon}>🛒</Text>
            <Text style={styles.modeTitle}>Chez un marchand</Text>
            <Text style={styles.modeSub}>Choisissez parmi nos supermarchés partenaires</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modeCard} onPress={() => handleModeSelect('CUSTOM')}>
            <Text style={styles.modeIcon}>📝</Text>
            <Text style={styles.modeTitle}>Liste personnalisée</Text>
            <Text style={styles.modeSub}>Le livreur fait les courses à votre place</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>🔥 Offres du moment</Text>
        <AdBanner placement="GROCERY" style={styles.inlineBanner} />

        <Text style={styles.sectionTitle}>Marchands partenaires</Text>
        {filtered.map((merchant) =>
          merchant.isBoosted ? (
            <SponsoredCard
              key={merchant.id}
              merchant={merchant}
              onPress={() => navigation.navigate('GroceryCart', { mode: 'MERCHANT', merchantId: merchant.id, scheduledMinutes: schedule })}
            />
          ) : (
            <TouchableOpacity
              key={merchant.id}
              style={styles.merchantCard}
              onPress={() => navigation.navigate('GroceryCart', { mode: 'MERCHANT', merchantId: merchant.id, scheduledMinutes: schedule })}
            >
              <View style={styles.merchantInfo}>
                <Text style={styles.merchantName}>{merchant.name}</Text>
                <Text style={styles.merchantCategory}>{merchant.category}</Text>
                <Text style={styles.merchantRating}>⭐ {merchant.rating}</Text>
              </View>
            </TouchableOpacity>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, backgroundColor: BG },
  header: {
    backgroundColor: VIOLET,
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: { color: TEXT, fontSize: 28, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  topBanner: { marginHorizontal: 16, marginTop: 16 },
  searchContainer: { margin: 16 },
  searchInput: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: TEXT,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  sectionTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  scheduleRow: { paddingLeft: 16 },
  scheduleChip: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  scheduleChipActive: { backgroundColor: VIOLET, borderColor: VIOLET },
  scheduleChipText: { color: SUBTEXT, fontSize: 14 },
  scheduleChipTextActive: { color: TEXT, fontWeight: '600' },
  modeRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  modeCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A3A',
    alignItems: 'center',
  },
  modeIcon: { fontSize: 32, marginBottom: 8 },
  modeTitle: { color: TEXT, fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  modeSub: { color: SUBTEXT, fontSize: 12, textAlign: 'center' },
  inlineBanner: { marginHorizontal: 16, marginBottom: 8 },
  merchantCard: {
    backgroundColor: CARD_BG,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  merchantInfo: {},
  merchantName: { color: TEXT, fontSize: 16, fontWeight: '700' },
  merchantCategory: { color: SUBTEXT, fontSize: 13, marginTop: 2 },
  merchantRating: { color: GOLD, fontSize: 13, marginTop: 4 },
});
