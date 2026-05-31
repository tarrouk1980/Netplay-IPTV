import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AdBanner from '../../components/AdBanner';
import { useGroceryStore } from '../../store/groceryStore';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  violet: '#8E44AD',
  violetLight: '#A855F7',
  gold: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#9B9BAA',
  border: '#2C2C3E',
  green: '#27AE60',
};

const CATEGORIES = [
  { key: '', label: 'Tous', emoji: '🛒' },
  { key: 'Légumes', label: 'Légumes', emoji: '🥦' },
  { key: 'Fruits', label: 'Fruits', emoji: '🍎' },
  { key: 'Viande', label: 'Viande & Poisson', emoji: '🥩' },
  { key: 'Crémerie', label: 'Crémerie', emoji: '🧀' },
  { key: 'Boulangerie', label: 'Boulangerie', emoji: '🥐' },
  { key: 'Hygiène', label: 'Hygiène', emoji: '🧴' },
  { key: 'Maison', label: 'Maison', emoji: '🏠' },
  { key: 'Épicerie', label: 'Épicerie', emoji: '🍜' },
];

const MODES = [
  { key: 'LIST', label: '📝 Liste personnalisée', desc: 'Dictez votre liste, nous achetons' },
  { key: 'MARKET', label: '🏪 Supermarché', desc: 'Choisissez votre enseigne' },
  { key: 'QUICK', label: '⚡ Commande rapide', desc: 'Produits populaires en 1 tap' },
];

const MERCHANTS = [
  { id: '1', name: 'Monoprix Tunis', category: ['Légumes','Fruits','Viande','Crémerie','Épicerie'], isBoosted: true, rating: 4.8, deliveryMin: 25, minOrder: 15, emoji: '🏬' },
  { id: '2', name: 'Carrefour Market', category: ['Légumes','Fruits','Crémerie','Hygiène','Maison','Épicerie'], isBoosted: false, rating: 4.5, deliveryMin: 35, minOrder: 20, emoji: '🛍️' },
  { id: '3', name: 'Bio Organic', category: ['Légumes','Fruits'], isBoosted: false, rating: 4.7, deliveryMin: 30, minOrder: 10, emoji: '🌿' },
  { id: '4', name: 'Boucherie El Amal', category: ['Viande'], isBoosted: false, rating: 4.6, deliveryMin: 20, minOrder: 8, emoji: '🥩' },
  { id: '5', name: 'Fromagerie Sana', category: ['Crémerie'], isBoosted: false, rating: 4.9, deliveryMin: 20, minOrder: 5, emoji: '🧀' },
  { id: '6', name: 'Boulangerie La Mie', category: ['Boulangerie'], isBoosted: true, rating: 4.8, deliveryMin: 15, minOrder: 3, emoji: '🥐' },
  { id: '7', name: 'Pharmacie & Hygiène', category: ['Hygiène','Maison'], isBoosted: false, rating: 4.4, deliveryMin: 30, minOrder: 10, emoji: '🧴' },
  { id: '8', name: 'Épicerie 24h', category: ['Épicerie','Hygiène'], isBoosted: false, rating: 4.3, deliveryMin: 10, minOrder: 2, emoji: '🏪' },
];

const POPULAR_ITEMS = [
  { id: 'p1', name: 'Lait Vache Noire 1L', price: 2.3, emoji: '🥛', category: 'Crémerie' },
  { id: 'p2', name: 'Pain de mie', price: 1.8, emoji: '🍞', category: 'Boulangerie' },
  { id: 'p3', name: 'Tomates 1kg', price: 1.5, emoji: '🍅', category: 'Légumes' },
  { id: 'p4', name: 'Poulet entier', price: 8.5, emoji: '🍗', category: 'Viande' },
  { id: 'p5', name: 'Fromage fondu', price: 3.2, emoji: '🧀', category: 'Crémerie' },
  { id: 'p6', name: 'Bananes 1kg', price: 2.0, emoji: '🍌', category: 'Fruits' },
];

function MerchantCard({ merchant, onPress }) {
  return (
    <TouchableOpacity style={mcard.container} onPress={() => onPress(merchant)} activeOpacity={0.8}>
      <View style={mcard.header}>
        <View style={mcard.avatar}>
          <Text style={mcard.avatarEmoji}>{merchant.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={mcard.name}>{merchant.name}</Text>
            {merchant.isBoosted && (
              <View style={mcard.boostBadge}>
                <Text style={mcard.boostText}>⭐ Top</Text>
              </View>
            )}
          </View>
          <View style={mcard.metaRow}>
            <Text style={mcard.rating}>⭐ {merchant.rating}</Text>
            <Text style={mcard.dot}>·</Text>
            <Text style={mcard.deliveryTime}>🕐 {merchant.deliveryMin} min</Text>
            <Text style={mcard.dot}>·</Text>
            <Text style={mcard.minOrder}>Min. {merchant.minOrder} TND</Text>
          </View>
        </View>
        <Text style={mcard.arrow}>›</Text>
      </View>
      <View style={mcard.categoryRow}>
        {merchant.category.slice(0, 4).map(c => (
          <View key={c} style={mcard.catChip}>
            <Text style={mcard.catChipText}>{CATEGORIES.find(x => x.key === c)?.emoji || '•'} {c}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const mcard = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C28',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2C2C3E',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#8E44AD22', alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 24 },
  name: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  boostBadge: { backgroundColor: '#F5A62322', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: '#F5A62344' },
  boostText: { color: '#F5A623', fontSize: 10, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  rating: { color: '#F5A623', fontSize: 12 },
  dot: { color: '#9B9BAA', fontSize: 12 },
  deliveryTime: { color: '#9B9BAA', fontSize: 12 },
  minOrder: { color: '#9B9BAA', fontSize: 12 },
  arrow: { color: '#9B9BAA', fontSize: 22 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catChip: { backgroundColor: '#16161F', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#2C2C3E' },
  catChipText: { color: '#9B9BAA', fontSize: 10 },
});

export default function GroceryHomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMode, setSelectedMode] = useState(null);
  const { setMode: storeSetMode } = useGroceryStore();

  const handleModeSelect = (modeKey) => {
    setSelectedMode(modeKey);
    storeSetMode(modeKey);
    navigation.navigate('GroceryCart', { mode: modeKey });
  };

  const handleMerchantPress = (merchant) => {
    storeSetMode('MARKET');
    navigation.navigate('GroceryCart', { mode: 'MARKET', merchantId: merchant.id, merchantName: merchant.name });
  };

  const filteredMerchants = MERCHANTS.filter(m => {
    const matchesSearch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || m.category.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const filteredPopular = selectedCategory
    ? POPULAR_ITEMS.filter(p => p.category === selectedCategory)
    : POPULAR_ITEMS;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🛒 EasyCourses</Text>
          <Text style={styles.headerSub}>Courses livrées chez vous en moins de 45 min</Text>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit ou magasin…"
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryChip, selectedCategory === cat.key && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(selectedCategory === cat.key ? '' : cat.key)}
              activeOpacity={0.75}
            >
              <Text style={styles.categoryChipEmoji}>{cat.emoji}</Text>
              <Text style={[styles.categoryChipText, selectedCategory === cat.key && styles.categoryChipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quick order modes */}
        <Text style={styles.sectionTitle}>Comment souhaitez-vous commander ?</Text>
        <View style={styles.modesRow}>
          {MODES.map(m => (
            <TouchableOpacity
              key={m.key}
              style={[styles.modeCard, selectedMode === m.key && styles.modeCardActive]}
              onPress={() => handleModeSelect(m.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.modeLabel}>{m.label}</Text>
              <Text style={styles.modeDesc}>{m.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular items (if category selected) */}
        {filteredPopular.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              {selectedCategory ? `${CATEGORIES.find(c => c.key === selectedCategory)?.emoji} ${selectedCategory}` : '⚡ Populaires'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
              {filteredPopular.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.popularCard}
                  onPress={() => handleModeSelect('QUICK')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.popularEmoji}>{item.emoji}</Text>
                  <Text style={styles.popularName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.popularPrice}>{item.price.toFixed(2)} TND</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Merchants */}
        <Text style={styles.sectionTitle}>
          {selectedCategory
            ? `Magasins · ${selectedCategory}`
            : search
            ? `Résultats pour "${search}"`
            : '🏪 Nos enseignes partenaires'}
        </Text>
        <View style={styles.merchantsList}>
          {filteredMerchants.length > 0
            ? filteredMerchants.map(m => (
                <MerchantCard key={m.id} merchant={m} onPress={handleMerchantPress} />
              ))
            : <Text style={styles.emptyText}>Aucun magasin pour cette catégorie</Text>
          }
        </View>

        <AdBanner />
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1 },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  headerSub: { color: COLORS.textMuted, fontSize: 13, marginTop: 4 },
  searchRow: { paddingHorizontal: 16, paddingTop: 14 },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 14,
  },
  categoryScroll: { flexGrow: 0 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: { backgroundColor: COLORS.violet + '22', borderColor: COLORS.violet },
  categoryChipEmoji: { fontSize: 14 },
  categoryChipText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  categoryChipTextActive: { color: COLORS.violetLight },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  modesRow: { paddingHorizontal: 16, gap: 8 },
  modeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 8,
  },
  modeCardActive: { borderColor: COLORS.violet, backgroundColor: COLORS.violet + '11' },
  modeLabel: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  modeDesc: { color: COLORS.textMuted, fontSize: 12, marginTop: 3 },
  popularCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    width: 110,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  popularEmoji: { fontSize: 30, marginBottom: 6 },
  popularName: { color: COLORS.text, fontSize: 11, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  popularPrice: { color: COLORS.gold, fontSize: 12, fontWeight: '700' },
  merchantsList: { paddingHorizontal: 16 },
  emptyText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 20, fontSize: 13 },
});
