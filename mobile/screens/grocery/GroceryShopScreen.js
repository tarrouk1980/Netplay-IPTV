import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const MOCK_CATEGORIES = [
  { id: 'all', label: 'Tout' },
  { id: 'fruits', label: '🍎 Fruits' },
  { id: 'legumes', label: '🥦 Légumes' },
  { id: 'boulangerie', label: '🥖 Boulangerie' },
  { id: 'laitiers', label: '🥛 Laitiers' },
  { id: 'boissons', label: '🥤 Boissons' },
];

const MOCK_PRODUCTS = [
  { id: 'P1', name: 'Pommes Golden', category: 'fruits', price: 3.500, unit: 'kg', icon: '🍎', inStock: true },
  { id: 'P2', name: 'Tomates cerises', category: 'legumes', price: 4.200, unit: 'kg', icon: '🍅', inStock: true },
  { id: 'P3', name: 'Pain complet', category: 'boulangerie', price: 1.800, unit: 'pièce', icon: '🍞', inStock: true },
  { id: 'P4', name: 'Lait entier 1L', category: 'laitiers', price: 2.100, unit: 'L', icon: '🥛', inStock: false },
  { id: 'P5', name: 'Jus d\'orange', category: 'boissons', price: 3.900, unit: 'L', icon: '🍊', inStock: true },
  { id: 'P6', name: 'Bananes', category: 'fruits', price: 2.500, unit: 'kg', icon: '🍌', inStock: true },
  { id: 'P7', name: 'Carottes', category: 'legumes', price: 1.200, unit: 'kg', icon: '🥕', inStock: true },
  { id: 'P8', name: 'Yaourt nature', category: 'laitiers', price: 0.900, unit: 'pot', icon: '🍶', inStock: true },
];

function ProductCard({ item, qty, onAdd, onRemove }) {
  return (
    <View style={[styles.productCard, !item.inStock && styles.productCardOut]}>
      <View style={styles.productIcon}>
        <Text style={{ fontSize: 30 }}>{item.icon}</Text>
        {!item.inStock && (
          <View style={styles.outBadge}><Text style={styles.outBadgeText}>Rupture</Text></View>
        )}
      </View>
      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price.toFixed(3)} TND/{item.unit}</Text>
      {item.inStock ? (
        qty > 0 ? (
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => onRemove(item)}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyVal}>{qty}</Text>
            <TouchableOpacity style={[styles.qtyBtn, styles.qtyBtnAdd]} onPress={() => onAdd(item)}>
              <Text style={[styles.qtyBtnText, { color: '#000' }]}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addBtn} onPress={() => onAdd(item)}>
            <Text style={styles.addBtnText}>+ Ajouter</Text>
          </TouchableOpacity>
        )
      ) : (
        <Text style={styles.outText}>Indisponible</Text>
      )}
    </View>
  );
}

export default function GroceryShopScreen({ navigation, route }) {
  const shopId = route?.params?.shopId || 'S1';
  const shopName = route?.params?.shopName || 'Carrefour Market';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState({});

  useEffect(() => {
    api.get(`/api/grocery/shops/${shopId}/products`)
      .then(r => setProducts(r.data.products || MOCK_PRODUCTS))
      .catch(() => setProducts(MOCK_PRODUCTS))
      .finally(() => setLoading(false));
  }, [shopId]);

  const addToCart = (item) => setCart(c => ({ ...c, [item.id]: (c[item.id] || 0) + 1 }));
  const removeFromCart = (item) => setCart(c => {
    const qty = (c[item.id] || 0) - 1;
    if (qty <= 0) { const next = { ...c }; delete next[item.id]; return next; }
    return { ...c, [item.id]: qty };
  });

  const cartTotal = products.reduce((s, p) => s + (cart[p.id] || 0) * p.price, 0);
  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchCat = category === 'all' || p.category === category;
    const matchQ = !q || p.name.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const handleCheckout = () => {
    if (cartCount === 0) { Alert.alert('Panier vide', 'Ajoutez des produits avant de commander.'); return; }
    navigation.navigate('GroceryCart', { shopId, shopName, cart, products });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 8 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{shopName}</Text>
          <Text style={styles.headerSub}>🛒 Épicerie en ligne</Text>
        </View>
        <TouchableOpacity style={styles.cartHeaderBtn} onPress={handleCheckout}>
          <Text style={{ fontSize: 22 }}>🛍️</Text>
          {cartCount > 0 && (
            <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Chercher un produit..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catsRow}>
        {MOCK_CATEGORIES.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[styles.catBtn, category === c.id && styles.catBtnActive]}
            onPress={() => setCategory(c.id)}
          >
            <Text style={[styles.catLabel, category === c.id && styles.catLabelActive]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              item={p}
              qty={cart[p.id] || 0}
              onAdd={addToCart}
              onRemove={removeFromCart}
            />
          ))}
          {filtered.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 60, width: '100%' }}>
              <Text style={{ fontSize: 40 }}>🔍</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucun produit</Text>
            </View>
          )}
          <View style={{ height: cartCount > 0 ? 90 : 20 }} />
        </ScrollView>
      )}

      {cartCount > 0 && (
        <View style={styles.cartBar}>
          <View>
            <Text style={styles.cartBarCount}>{cartCount} article{cartCount > 1 ? 's' : ''}</Text>
            <Text style={styles.cartBarTotal}>{cartTotal.toFixed(3)} TND</Text>
          </View>
          <TouchableOpacity style={styles.cartBarBtn} onPress={handleCheckout}>
            <Text style={styles.cartBarBtnText}>Voir le panier →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 16, fontWeight: '900' },
  headerSub: { color: COLORS.muted, fontSize: 11, marginTop: 1 },
  cartHeaderBtn: { width: 40, alignItems: 'flex-end', position: 'relative' },
  cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.red, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  cartBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  searchRow: { paddingHorizontal: 16, paddingVertical: 10 },
  searchInput: { backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border },
  catsRow: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  catBtn: { borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: COLORS.surface },
  catBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  catLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  catLabelActive: { color: COLORS.accent },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
  productCard: { width: '47%', backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  productCardOut: { opacity: 0.5 },
  productIcon: { width: 56, height: 56, borderRadius: 14, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderWidth: 1, borderColor: COLORS.border, position: 'relative' },
  outBadge: { position: 'absolute', bottom: -6, left: 0, right: 0, backgroundColor: COLORS.red, borderRadius: 4, alignItems: 'center' },
  outBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  productName: { color: COLORS.text, fontSize: 12, fontWeight: '700', marginBottom: 4, lineHeight: 16 },
  productPrice: { color: COLORS.accent, fontSize: 12, fontWeight: '800', marginBottom: 8 },
  addBtn: { backgroundColor: COLORS.accent, borderRadius: 8, paddingVertical: 7, alignItems: 'center' },
  addBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  qtyBtnAdd: { backgroundColor: COLORS.accent },
  qtyBtnText: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  qtyVal: { color: COLORS.text, fontSize: 15, fontWeight: '900' },
  outText: { color: COLORS.muted, fontSize: 11, textAlign: 'center' },
  cartBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  cartBarCount: { color: COLORS.muted, fontSize: 12 },
  cartBarTotal: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  cartBarBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  cartBarBtnText: { color: '#000', fontSize: 14, fontWeight: '900' },
});
