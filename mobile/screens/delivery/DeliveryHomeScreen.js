import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useDeliveryStore from '../../store/deliveryStore';
import useLocationStore from '../../store/locationStore';
import AdBanner from '../../components/AdBanner';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  green: '#27AE60',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2A2A3A',
  badge: '#E74C3C',
};

const CATEGORIES = [
  { key: null, emoji: '🔥', label: 'Promos', promo: true },
  { key: 'RESTAURANT', emoji: '🍕', label: 'Restaurants' },
  { key: 'PHARMACY', emoji: '💊', label: 'Pharmacies' },
  { key: 'SUPERMARKET', emoji: '🛒', label: 'Supermarchés' },
  { key: 'BEAUTY', emoji: '💄', label: 'Beauty' },
  { key: 'PETS', emoji: '🐾', label: 'Pets' },
  { key: 'HIGHTECH', emoji: '💻', label: 'High Tech' },
  { key: 'ELECTRO', emoji: '⚡', label: 'Électro' },
  { key: 'OTHER', emoji: '📦', label: 'Autres' },
];

function estimateDeliveryTime(distanceKm) {
  const minutes = Math.round(10 + distanceKm * 3);
  return `${minutes} min`;
}

export default function DeliveryHomeScreen({ navigation }) {
  const { merchants, fetchMerchants, isLoading } = useDeliveryStore();
  const { location } = useLocationStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const load = useCallback(() => {
    const filters = {};
    if (selectedCategory) filters.category = selectedCategory;
    if (location?.lat) {
      filters.lat = location.lat;
      filters.lng = location.lng;
      filters.radius = 15;
    }
    fetchMerchants(filters);
  }, [selectedCategory, location]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = merchants.filter((m) => {
    if (!search) return true;
    return (
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
    );
  });

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.key && styles.categoryCardActive,
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item.key ? null : item.key)}
    >
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      <Text style={[styles.categoryLabel, selectedCategory === item.key && styles.categoryLabelActive]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderMerchant = ({ item }) => (
    <TouchableOpacity
      style={styles.merchantCard}
      onPress={() => navigation.navigate('Merchant', { merchantId: item.id })}
      activeOpacity={0.85}
    >
      <View style={styles.merchantInfo}>
        <View style={styles.merchantHeader}>
          <Text style={styles.merchantName}>{item.name}</Text>
          {!item.isOpen && (
            <View style={styles.closedBadge}>
              <Text style={styles.closedBadgeText}>FERMÉ</Text>
            </View>
          )}
        </View>
        <Text style={styles.merchantCategory}>{item.category}</Text>
        <View style={styles.merchantMeta}>
          {item.distanceKm != null && (
            <Text style={styles.merchantMetaText}>📍 {item.distanceKm.toFixed(1)} km</Text>
          )}
          {item.distanceKm != null && (
            <Text style={styles.merchantMetaText}>⏱ {estimateDeliveryTime(item.distanceKm)}</Text>
          )}
        </View>
      </View>
      {item.isOpen && (
        <View style={styles.openIndicator} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Livraison</Text>
        <View style={{ width: 32 }} />
      </View>

      <AdBanner placement="DELIVERY" style={{ marginHorizontal: 16, marginBottom: 12 }} />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un restaurant, pharmacie..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderCategory}
        contentContainerStyle={styles.categoriesList}
        style={styles.categoriesContainer}
      />

      {isLoading ? (
        <ActivityIndicator color={COLORS.green} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderMerchant}
          contentContainerStyle={styles.merchantsList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun marchand trouvé dans votre zone.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backArrow: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.green, fontSize: 20, fontFamily: 'Poppins-SemiBold', fontWeight: '600' },
  searchContainer: { paddingHorizontal: 20, marginBottom: 12 },
  searchInput: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoriesContainer: { maxHeight: 90 },
  categoriesList: { paddingHorizontal: 16, paddingBottom: 8 },
  categoryCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryCardActive: { borderColor: COLORS.green, backgroundColor: '#0D2A1A' },
  categoryEmoji: { fontSize: 24, marginBottom: 4 },
  categoryLabel: { color: COLORS.textMuted, fontSize: 11 },
  categoryLabelActive: { color: COLORS.green },
  merchantsList: { padding: 16 },
  merchantCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  merchantInfo: { flex: 1 },
  merchantHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  merchantName: { color: COLORS.text, fontSize: 16, fontWeight: '600', flex: 1 },
  closedBadge: {
    backgroundColor: COLORS.badge,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  closedBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  merchantCategory: { color: COLORS.textMuted, fontSize: 12, marginBottom: 8 },
  merchantMeta: { flexDirection: 'row', gap: 12 },
  merchantMetaText: { color: COLORS.textMuted, fontSize: 12 },
  openIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.green,
    marginLeft: 12,
  },
  emptyText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 40, fontSize: 14 },
});
