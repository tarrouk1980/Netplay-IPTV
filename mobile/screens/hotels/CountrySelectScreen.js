import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, TextInput,
  StyleSheet, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COUNTRIES = [
  {
    flag: '🇹🇳', name: 'Tunisie', country: 'Tunisie', currency: 'TND', hotels: 20,
    tagline: 'Plages + Thalasso', colors: ['#E8272A', '#e0a010'], desc: 'Méditerranée & Désert',
  },
  {
    flag: '🇲🇦', name: 'Maroc', country: 'Maroc', currency: 'MAD', hotels: 8,
    tagline: 'Riads + Désert', colors: ['#006233', '#c1272d'], desc: 'Riads & Atlas',
  },
  {
    flag: '🇩🇿', name: 'Algérie', country: 'Algérie', currency: 'DZD', hotels: 5,
    tagline: 'Casbah + Sahara', colors: ['#006233', '#fff'], desc: 'Casbah & Sahara',
  },
  {
    flag: '🇪🇬', name: 'Égypte', country: 'Égypte', currency: 'EGP', hotels: 10,
    tagline: 'Pyramides + Mer Rouge', colors: ['#CE1126', '#C09300'], desc: 'Pyramides & Mer Rouge',
  },
  {
    flag: '🇲🇷', name: 'Mauritanie', country: 'Mauritanie', currency: 'MRU', hotels: 4,
    tagline: 'Désert + Oasis', colors: ['#006233', '#ffc400'], desc: 'Désert & Oasis',
  },
  {
    flag: '🇫🇷', name: 'France', country: 'France', currency: 'EUR', hotels: 3,
    tagline: 'Paris + Culture', colors: ['#002395', '#ED2939'], desc: 'Paris & Culture',
  },
  {
    flag: '🇦🇪', name: 'Émirats Arabes Unis', country: 'Émirats Arabes Unis', currency: 'EUR', hotels: 2,
    tagline: 'Dubai + Luxe', colors: ['#00732F', '#FF0000'], desc: 'Dubai & Luxe',
  },
];

export default function CountrySelectScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { checkIn = '', checkOut = '', guests = 2 } = route.params || {};
  const [search, setSearch] = useState('');

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.tagline.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(item) {
    navigation.navigate('HotelResults', {
      destination: '',
      checkIn,
      checkOut,
      guests,
      country: item.country,
    });
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)} activeOpacity={0.85}>
      <LinearGradient
        colors={[item.colors[0] + 'CC', item.colors[1] + '99', '#00000030']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.cardGrad}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.flag}>{item.flag}</Text>
        </View>
        <View style={styles.cardMiddle}>
          <Text style={styles.countryName}>{item.name}</Text>
          <Text style={styles.tagline}>{item.tagline}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Ionicons name="bed-outline" size={11} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statText}>{item.hotels} hôtels</Text>
            </View>
            <View style={styles.statBadge}>
              <Ionicons name="cash-outline" size={11} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statText}>{item.currency}</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#004E89', '#1a6eac']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choisir une destination</Text>
      </LinearGradient>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#A0AEC0" style={{ marginLeft: 12 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un pays..."
          placeholderTextColor="#A0AEC0"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={{ marginRight: 12 }}>
            <Ionicons name="close-circle" size={18} color="#A0AEC0" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.country}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, margin: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  searchInput: { flex: 1, fontSize: 15, color: '#2D3748', paddingVertical: 12, paddingHorizontal: 10 },
  card: { borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  cardGrad: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  cardLeft: {},
  flag: { fontSize: 42 },
  cardMiddle: { flex: 1 },
  countryName: { fontSize: 18, fontWeight: '800', color: '#fff' },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  statBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statText: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  cardRight: {},
});
