import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useCartStore from '../../store/cartStore';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const CATEGORY_ICON = {
  fruits: '🥦', dairy: '🥛', meat: '🥩', bakery: '🥖', drinks: '🧃', snacks: '🍿',
};

export default function GroceryBrowseScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('default');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const cartItems = useCartStore((s) => s.items);
  const cartMerchantId = useCartStore((s) => s.merchantId);
  const storeAddItem = useCartStore((s) => s.addItem);
  const storeUpdateQty = useCartStore((s) => s.updateQty);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/merchants', { params: { category: 'SUPERMARKET' } })
      .then((r) => {
        const merchants = r.data.merchants || [];
        const list = merchants.flatMap((m) => (m.products || []).map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: Number(p.price),
          unit: '',
          stock: (p.stock ?? 0) > 0,
          promo: !!(p.metadata && p.metadata.promoPrice),
          promoPrice: p.metadata?.promoPrice ? Number(p.metadata.promoPrice) : null,
          merchantId: m.id,
          merchantName: m.name,
        })));
        setProducts(list);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || p.category === category;
    return matchSearch && matchCat;
  }).sort((a, b) => {
    if (sort === 'price_asc') return (a.promoPrice || a.price) - (b.promoPrice || b.price);
    if (sort === 'price_desc') return (b.promoPrice || b.price) - (a.promoPrice || a.price);
    return 0;
  });

  const cartQty = (id) => cartItems.find((i) => i.id === id)?.qty || 0;
  const addToCart = (p) => storeAddItem({ id: p.id, name: p.name, price: p.promoPrice || p.price }, p.merchantId);
  const removeFromCart = (id) => storeUpdateQty(id, cartQty(id) - 1);

  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  if (loading) {
    return (
      <SafeAreaView style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.root, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ color: COLORS.muted, textAlign: 'center', marginBottom: 16 }}>
          Impossible de charger les produits.
        </Text>
        <TouchableOpacity onPress={load} style={{ backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 }}>
          <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Épicerie</Text>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => navigation.navigate('GroceryCart')}
        >
          <Text style={{ fontSize: 22 }}>🛒</Text>
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search + sort */}
      <View style={styles.searchRow}>
        <Text style={{ color: COLORS.muted }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: COLORS.muted }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sort */}
      <View style={styles.sortRow}>
        {[['default', 'Pertinence'], ['price_asc', 'Prix ↑'], ['price_desc', 'Prix ↓']].map(([val, lbl]) => (
          <TouchableOpacity
            key={val}
            style={[styles.sortChip, sort === val && styles.sortChipActive]}
            onPress={() => setSort(val)}
          >
            <Text style={[styles.sortText, sort === val && { color: '#000' }]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {categories.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.catChip, category === c && styles.catChipActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={{ fontSize: 16 }}>{c === 'all' ? '🛒' : (CATEGORY_ICON[c] || '🛍️')}</Text>
            <Text style={[styles.catText, category === c && { color: '#000' }]}>{c === 'all' ? 'Tout' : c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products grid */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: cartCount > 0 ? 100 : 40 }}>
        <View style={styles.grid}>
          {filtered.length === 0 && (
            <View style={{ width: '100%', alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ color: COLORS.muted }}>Aucun produit trouvé</Text>
            </View>
          )}
          {filtered.map(p => {
            const qty = cartMerchantId && cartMerchantId !== p.merchantId ? 0 : cartQty(p.id);
            return (
              <View key={p.id} style={[styles.productCard, !p.stock && { opacity: 0.5 }]}>
                <View style={styles.productImgWrap}>
                  <Text style={{ fontSize: 36 }}>{CATEGORY_ICON[p.category] || '🛍️'}</Text>
                  {p.promo && <View style={styles.promoBadge}><Text style={styles.promoText}>PROMO</Text></View>}
                  {!p.stock && <View style={styles.outOfStockBadge}><Text style={styles.outOfStockText}>Indispo.</Text></View>}
                </View>
                <Text style={styles.productName} numberOfLines={2}>{p.name}</Text>
                <Text style={styles.productUnit}>{p.merchantName}</Text>
                <View style={styles.priceRow}>
                  {p.promo ? (
                    <>
                      <Text style={styles.pricePromo}>{p.promoPrice?.toFixed(2)} TND</Text>
                      <Text style={styles.priceOld}>{p.price.toFixed(2)}</Text>
                    </>
                  ) : (
                    <Text style={styles.priceNormal}>{p.price.toFixed(2)} TND</Text>
                  )}
                </View>
                {p.stock && (
                  qty > 0 ? (
                    <View style={styles.qtyRow}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(p.id)}>
                        <Text style={styles.qtyBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyNum}>{qty}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(p)}>
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(p)}>
                      <Text style={styles.addBtnText}>+ Ajouter</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Cart CTA */}
      {cartCount > 0 && (
        <View style={styles.cartCTA}>
          <TouchableOpacity style={styles.cartCTABtn} onPress={() => navigation.navigate('GroceryCart')}>
            <Text style={styles.cartCTAText}>🛒 Voir le panier ({cartCount}) · {cartTotal.toFixed(2)} TND</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  cartBtn: { position: 'relative', padding: 4 },
  cartBadge: {
    position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.accent,
    borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { color: '#000', fontSize: 9, fontWeight: '900' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, color: COLORS.white, fontSize: 14 },
  sortRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingVertical: 10 },
  sortChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  sortChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  sortText: { color: COLORS.white, fontSize: 11, fontWeight: '600' },
  catScroll: { maxHeight: 52, marginBottom: 4 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  catChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  catText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  productCard: { width: '47%', backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  productImgWrap: { alignItems: 'center', marginBottom: 8, position: 'relative', height: 56, justifyContent: 'center' },
  promoBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.red, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  promoText: { color: COLORS.white, fontSize: 8, fontWeight: '900' },
  outOfStockBadge: { position: 'absolute', top: 0, left: 0, backgroundColor: COLORS.muted + '99', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  outOfStockText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },
  productName: { color: COLORS.white, fontSize: 12, fontWeight: '700', marginBottom: 2, minHeight: 32 },
  productUnit: { color: COLORS.muted, fontSize: 10, marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  priceNormal: { color: COLORS.white, fontSize: 14, fontWeight: '900' },
  pricePromo: { color: COLORS.red, fontSize: 14, fontWeight: '900' },
  priceOld: { color: COLORS.muted, fontSize: 11, textDecorationLine: 'line-through' },
  addBtn: { backgroundColor: COLORS.accent, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  addBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surfaceAlt, borderRadius: 8, paddingHorizontal: 4 },
  qtyBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: COLORS.accent, fontSize: 20, fontWeight: '900' },
  qtyNum: { color: COLORS.white, fontSize: 15, fontWeight: '900' },
  cartCTA: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border },
  cartCTABtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  cartCTAText: { color: '#000', fontSize: 15, fontWeight: '800' },
});
