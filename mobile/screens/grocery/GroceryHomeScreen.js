import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, TextInput, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const CATEGORIES = [
  { id: 'all', label: 'Tout', icon: '🛒' },
  { id: 'fruits', label: 'Fruits', icon: '🍎' },
  { id: 'legumes', label: 'Légumes', icon: '🥦' },
  { id: 'boulangerie', label: 'Boulangerie', icon: '🥖' },
  { id: 'produits_laitiers', label: 'Laitiers', icon: '🥛' },
  { id: 'viandes', label: 'Viandes', icon: '🥩' },
  { id: 'boissons', label: 'Boissons', icon: '🥤' },
];

const MOCK_SHOPS = [
  { id: 'S1', name: 'Carrefour Market', category: 'Supermarché', rating: 4.8, deliveryTime: '25-35 min', minOrder: 10, deliveryFee: 2.5, promoted: true, open: true, tag: '🔥 Populaire' },
  { id: 'S2', name: 'Monoprix Berges du Lac', category: 'Supermarché', rating: 4.6, deliveryTime: '30-45 min', minOrder: 15, deliveryFee: 3.0, promoted: false, open: true, tag: null },
  { id: 'S3', name: 'Boulangerie Tunisoise', category: 'Boulangerie', rating: 4.9, deliveryTime: '15-25 min', minOrder: 5, deliveryFee: 1.5, promoted: false, open: true, tag: '⚡ Rapide' },
  { id: 'S4', name: 'Marché Bio Sidi Bou Said', category: 'Bio', rating: 4.7, deliveryTime: '35-50 min', minOrder: 20, deliveryFee: 2.0, promoted: false, open: false, tag: null },
  { id: 'S5', name: 'Épicerie El Amal', category: 'Épicerie', rating: 4.5, deliveryTime: '20-30 min', minOrder: 8, deliveryFee: 2.5, promoted: true, open: true, tag: '🆕 Nouveau' },
];

const BANNERS = [
  { id: 'B1', title: 'Livraison offerte', subtitle: 'Dès 30 TND de commande', color: COLORS.green, icon: '🚴' },
  { id: 'B2', title: '-20% sur les fruits', subtitle: 'Jusqu\'au 10 juin', color: COLORS.blue, icon: '🍎' },
  { id: 'B3', title: 'Nouveau : Bio disponible', subtitle: 'Produits biologiques locaux', color: '#9B59B6', icon: '🌱' },
];

function ShopCard({ item, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.shopCard, !item.open && styles.shopCardClosed]}
      onPress={() => onPress(item)}
      activeOpacity={0.85}
    >
      {item.tag && (
        <View style={styles.shopTag}>
          <Text style={styles.shopTagText}>{item.tag}</Text>
        </View>
      )}
      {!item.open && (
        <View style={styles.closedOverlay}>
          <Text style={styles.closedText}>Fermé</Text>
        </View>
      )}
      <View style={styles.shopAvatar}>
        <Text style={{ fontSize: 28 }}>🏪</Text>
      </View>
      <Text style={styles.shopName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.shopCategory}>{item.category}</Text>
      <View style={styles.shopMeta}>
        <Text style={styles.shopRating}>★ {item.rating}</Text>
        <Text style={styles.shopDot}>·</Text>
        <Text style={styles.shopTime}>{item.deliveryTime}</Text>
      </View>
      <Text style={styles.shopMin}>Min. {item.minOrder} TND · Livr. {item.deliveryFee.toFixed(1)} TND</Text>
    </TouchableOpacity>
  );
}

export default function GroceryHomeScreen({ navigation }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    api.get('/api/grocery/shops')
      .then(r => setShops(r.data.shops || MOCK_SHOPS))
      .catch(() => setShops(MOCK_SHOPS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = shops.filter(s => {
    const q = search.toLowerCase();
    return (!q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛒 Épicerie</Text>
        <TouchableOpacity onPress={() => navigation.navigate('GroceryCart')} style={styles.cartBtn}>
          <Text style={{ fontSize: 22 }}>🛍️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Search */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Chercher un produit ou magasin..."
            placeholderTextColor={COLORS.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Promo banners */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bannersRow}>
          {BANNERS.map(b => (
            <View key={b.id} style={[styles.banner, { backgroundColor: b.color + '25', borderColor: b.color + '50' }]}>
              <Text style={{ fontSize: 28 }}>{b.icon}</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.bannerTitle, { color: b.color }]}>{b.title}</Text>
                <Text style={styles.bannerSub}>{b.subtitle}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catsRow}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.catBtn, category === c.id && styles.catBtnActive]}
              onPress={() => setCategory(c.id)}
            >
              <Text style={{ fontSize: 18 }}>{c.icon}</Text>
              <Text style={[styles.catLabel, category === c.id && styles.catLabelActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MAGASINS DISPONIBLES</Text>
          <Text style={styles.sectionCount}>{filtered.length} résultats</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.shopsGrid}>
            {filtered.map(s => (
              <ShopCard
                key={s.id}
                item={s}
                onPress={shop => navigation.navigate('GroceryShop', { shopId: shop.id, shopName: shop.name })}
              />
            ))}
            {filtered.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 60, width: '100%' }}>
                <Text style={{ fontSize: 40 }}>🔍</Text>
                <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucun résultat</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  cartBtn: { width: 40, alignItems: 'flex-end' },
  searchRow: { paddingHorizontal: 16, paddingVertical: 12 },
  searchInput: {
    backgroundColor: COLORS.surface, borderRadius: 14, paddingHorizontal: 16,
    paddingVertical: 12, color: COLORS.text, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  bannersRow: { paddingHorizontal: 16, gap: 10, paddingBottom: 4 },
  banner: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14,
    padding: 14, width: 240, borderWidth: 1,
  },
  bannerTitle: { fontSize: 14, fontWeight: '800' },
  bannerSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  catsRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  catBtn: {
    alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 14, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border, gap: 4,
  },
  catBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  catLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600' },
  catLabelActive: { color: COLORS.accent },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, marginBottom: 12,
  },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4 },
  sectionCount: { color: COLORS.muted, fontSize: 12 },
  shopsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
  shopCard: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  shopCardClosed: { opacity: 0.5 },
  shopTag: {
    backgroundColor: COLORS.accent + '25', borderRadius: 8, paddingHorizontal: 7,
    paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8,
  },
  shopTagText: { color: COLORS.accent, fontSize: 10, fontWeight: '700' },
  closedOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  closedText: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  shopAvatar: {
    width: 50, height: 50, borderRadius: 14, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  shopName: { color: COLORS.text, fontSize: 13, fontWeight: '700', marginBottom: 2 },
  shopCategory: { color: COLORS.muted, fontSize: 11, marginBottom: 6 },
  shopMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  shopRating: { color: COLORS.accent, fontSize: 11, fontWeight: '700' },
  shopDot: { color: COLORS.muted, fontSize: 11 },
  shopTime: { color: COLORS.muted, fontSize: 11 },
  shopMin: { color: COLORS.muted, fontSize: 10 },
});
