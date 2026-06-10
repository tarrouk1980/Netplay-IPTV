import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ATTRACTIONS_DB = {
  'Tunis': [
    { name: 'Médina de Tunis', category: 'monument', icon: 'business', distance: '0.8 km' },
    { name: 'Musée du Bardo', category: 'museum', icon: 'library', distance: '3.2 km' },
    { name: 'Carthage', category: 'monument', icon: 'telescope', distance: '15 km' },
    { name: 'Sidi Bou Saïd', category: 'village', icon: 'home', distance: '18 km' },
    { name: 'Avenue Habib Bourguiba', category: 'shopping', icon: 'bag', distance: '1.2 km' },
    { name: 'Parc du Belvédère', category: 'nature', icon: 'leaf', distance: '2.5 km' },
  ],
  'Djerba': [
    { name: 'El Ghriba Synagogue', category: 'monument', icon: 'business', distance: '2.1 km' },
    { name: 'Plage de Sidi Mahrez', category: 'beach', icon: 'sunny', distance: '0.5 km' },
    { name: 'Houmt Souk', category: 'shopping', icon: 'bag', distance: '4.3 km' },
    { name: 'Borj el Kastil', category: 'monument', icon: 'shield', distance: '6.2 km' },
    { name: 'Plage de Seguia', category: 'beach', icon: 'sunny', distance: '3.5 km' },
    { name: 'Village de potiers Guellala', category: 'culture', icon: 'color-palette', distance: '8 km' },
  ],
  'Hammamet': [
    { name: 'Médina de Hammamet', category: 'monument', icon: 'business', distance: '1.2 km' },
    { name: 'Plage de Hammamet', category: 'beach', icon: 'sunny', distance: '0.3 km' },
    { name: 'Yasmine Hammamet', category: 'resort', icon: 'star', distance: '5 km' },
    { name: 'Centre culturel international', category: 'culture', icon: 'musical-notes', distance: '2 km' },
    { name: 'Aquapark Hammamet', category: 'leisure', icon: 'water', distance: '4.5 km' },
  ],
  'Paris': [
    { name: 'Tour Eiffel', category: 'monument', icon: 'business', distance: '2.5 km' },
    { name: 'Musée du Louvre', category: 'museum', icon: 'library', distance: '1.8 km' },
    { name: 'Champs-Élysées', category: 'shopping', icon: 'bag', distance: '0.8 km' },
    { name: 'Notre-Dame de Paris', category: 'monument', icon: 'church', distance: '3 km' },
    { name: 'Montmartre', category: 'village', icon: 'images', distance: '4.2 km' },
    { name: 'Musée d\'Orsay', category: 'museum', icon: 'library', distance: '2.1 km' },
  ],
  'Dubai': [
    { name: 'Burj Khalifa', category: 'monument', icon: 'business', distance: '1.5 km' },
    { name: 'Dubai Mall', category: 'shopping', icon: 'bag', distance: '1.8 km' },
    { name: 'Palm Jumeirah', category: 'beach', icon: 'sunny', distance: '5 km' },
    { name: 'Dubai Creek', category: 'culture', icon: 'boat', distance: '8 km' },
    { name: 'Gold Souk', category: 'shopping', icon: 'diamond', distance: '9 km' },
    { name: 'Desert Safari', category: 'adventure', icon: 'compass', distance: '35 km' },
  ],
};

const CATEGORY_COLORS = {
  monument: '#004E89', museum: '#553C9A', beach: '#2B6CB0',
  shopping: '#C05621', nature: '#276749', culture: '#D69E2E',
  village: '#FF6B35', resort: '#E53E3E', leisure: '#2C7A7B',
  adventure: '#744210',
};

const DEFAULT_ATTRACTIONS = [
  { name: 'Centre-ville', category: 'monument', icon: 'business', distance: '1 km' },
  { name: 'Marché local', category: 'shopping', icon: 'bag', distance: '0.5 km' },
  { name: 'Plage principale', category: 'beach', icon: 'sunny', distance: '2 km' },
  { name: 'Restaurant typique', category: 'culture', icon: 'restaurant', distance: '0.3 km' },
];

export default function NearbyAttractions({ city = 'Tunis' }) {
  const attractions = useMemo(() => ATTRACTIONS_DB[city] || DEFAULT_ATTRACTIONS, [city]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="map-outline" size={18} color="#FF6B35" />
        <Text style={styles.title}>Attraits à proximité</Text>
        <Text style={styles.cityTag}>{city}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingRight: 8 }}
      >
        {attractions.map((attr, i) => {
          const color = CATEGORY_COLORS[attr.category] || '#718096';
          return (
            <TouchableOpacity key={i} style={styles.card} activeOpacity={0.8}>
              <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
                <Ionicons name={attr.icon + '-outline'} size={22} color={color} />
              </View>
              <Text style={styles.attrName} numberOfLines={2}>{attr.name}</Text>
              <View style={styles.distanceRow}>
                <Ionicons name="location-outline" size={11} color="#A0AEC0" />
                <Text style={styles.distance}>{attr.distance}</Text>
              </View>
              <View style={[styles.categoryBadge, { backgroundColor: color + '15' }]}>
                <Text style={[styles.categoryText, { color }]}>{attr.category}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 4 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '800', color: '#1A202C', flex: 1 },
  cityTag: { backgroundColor: '#FFF5F0', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, fontSize: 12, fontWeight: '700', color: '#FF6B35' },
  card: {
    width: 110, backgroundColor: '#F7FAFC', borderRadius: 14,
    padding: 12, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: '#EDF2F7',
  },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  attrName: { fontSize: 11, fontWeight: '700', color: '#2D3748', textAlign: 'center', lineHeight: 14 },
  distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  distance: { fontSize: 10, color: '#A0AEC0', fontWeight: '600' },
  categoryBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  categoryText: { fontSize: 9, fontWeight: '700', textTransform: 'capitalize' },
});
