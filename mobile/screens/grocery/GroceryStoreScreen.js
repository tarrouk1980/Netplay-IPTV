import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C',
};

const MOCK_CATEGORIES = ['Tout', 'Fruits & Légumes', 'Produits laitiers', 'Boulangerie', 'Boissons', 'Épicerie', 'Hygiène'];

const MOCK_PRODUCTS = [
  { id: 'P001', name: 'Lait Délice entier 1L', category: 'Produits laitiers', price: 1.800, unit: 'bouteille', stock: 24, icon: '🥛' },
  { id: 'P002', name: 'Pain complet 400g', category: 'Boulangerie', price: 1.200, unit: 'pain', stock: 8, icon: '🍞' },
  { id: 'P003', name: 'Tomates 1kg', category: 'Fruits & Légumes', price: 2.500, unit: 'kg', stock: 15, icon: '🍅' },
  { id: 'P004', name: 'Eau minérale Safia 1.5L', category: 'Boissons', price: 0.900, unit: 'bouteille', stock: 48, icon: '💧' },
  { id: 'P005', name: 'Yaourt nature x4', category: 'Produits laitiers', price: 2.100, unit: 'pack', stock: 12, icon: '🥣' },
  { id: 'P006', name: 'Huile végétale 1L', category: 'Épicerie', price: 4.500, unit: 'bouteille', stock: 20, icon: '🫙' },
  { id: 'P007', name: 'Bananes 1kg', category: 'Fruits & Légumes', price: 3.200, unit: 'kg', stock: 6, icon: '🍌' },
  { id: 'P008', name: 'Savon Palmolive x3', category: 'Hygiène', price: 3.800, unit: 'pack', stock: 18, icon: '🧼' },
];

function ProductCard({ item, qty, onAdd, onRemove }) {
  return (
    <View style={styles.productCard}>
      <Text style={styles.productIcon}>{item.icon}</Text>
      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.productUnit}>{item.unit}</Text>
      <Text style={styles.productPrice}>{item.price.toFixed(3)} TND</Text>
      {item.stock <= 5 && <Text style={styles.lowStock}>⚠️ Stock bas</Text>}
      {qty > 0 ? (
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={onRemove}>
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyNum}>{qty}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={onAdd}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
          <Text style={styles.addBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function GroceryStoreScreen({ navigation, route }) {
  const { storeId, storeName = 'Épicerie' } = route.params || {};
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tout');
  const [cart, setCart] = useState({});

  const load = useCallback(() => {
    api.get('/api/grocery/stores/' + (storeId || '1') + '/products')
      .then(r => setProducts(r.data.products || MOCK_PRODUCTS))
      .catch(() => setProducts(MOCK_PRODUCTS))
      .finally(() => setLoading(false));
  }, [storeId]);

  useEffect(() => { load(); }, [load]);

  const addToCart = (id) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeFromCart = (id) => setCart(prev => {
    const next = { ...prev };
    if (next[id] > 1) next[id]--;
    else delete next[id];
    return next;
  });

  const filtered = products.filter(p => {
    const matchCat = category === 'Tout' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((s, [id, qty]) => {
    const p = products.find(p => p.id === id);
    return s + (p ? p.price * qty : 0);
  }, 0);

  const goToCheckout = () => {
    const items = Object.entries(cart).map(([id, qty]) => {
      const p = products.find(p => p.id === id);
      return { ...p, qty };
    });
    navigation.navigate('GroceryCheckout', { items, storeId, storeName });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛒 {storeName}</Text>
        <View style={{ width: 36 }} />
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher un produit..."
        placeholderTextColor={COLORS.muted}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={MOCK_CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item}
        style={styles.categoryList}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catBtn, category === item && styles.catBtnActive]}
            onPress={() => setCategory(item)}
          >
            <Text style={[styles.catText, category === item && styles.catTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              qty={cart[item.id] || 0}
              onAdd={() => addToCart(item.id)}
              onRemove={() => removeFromCart(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 36 }}>🔍</Text>
              <Text style={{ color: COLORS.muted, marginTop: 10 }}>Aucun produit trouvé</Text>
            </View>
          }
        />
      )}

      {totalItems > 0 && (
        <TouchableOpacity style={styles.cartBar} onPress={goToCheckout}>
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{totalItems}</Text>
          </View>
          <Text style={styles.cartBarText}>Voir mon panier</Text>
          <Text style={styles.cartBarPrice}>{totalPrice.toFixed(3)} TND</Text>
        </TouchableOpacity>
      )}
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
  backBtn: { padding: 4 },
  backText: { color: COLORS.accent, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  searchInput: {
    margin: 16, marginBottom: 0, backgroundColor: COLORS.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, color: COLORS.text, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  categoryList: { marginTop: 12, marginBottom: 4 },
  catBtn: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  catBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  catText: { color: COLORS.muted, fontSize: 13 },
  catTextActive: { color: COLORS.accent, fontWeight: '600' },
  list: { padding: 12, paddingBottom: 100 },
  row: { justifyContent: 'space-between' },
  productCard: {
    width: '48%', backgroundColor: COLORS.surface, borderRadius: 14, padding: 12,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  productIcon: { fontSize: 36, marginBottom: 8 },
  productName: { color: COLORS.text, fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: 3 },
  productUnit: { color: COLORS.muted, fontSize: 11, marginBottom: 6 },
  productPrice: { color: COLORS.accent, fontSize: 15, fontWeight: '800', marginBottom: 6 },
  lowStock: { color: COLORS.red, fontSize: 10, marginBottom: 6 },
  addBtn: {
    backgroundColor: COLORS.accent, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 16,
  },
  addBtnText: { color: '#000', fontSize: 13, fontWeight: '700' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: COLORS.accent + '20',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.accent,
  },
  qtyBtnText: { color: COLORS.accent, fontSize: 18, fontWeight: '700' },
  qtyNum: { color: COLORS.text, fontSize: 16, fontWeight: '800', minWidth: 20, textAlign: 'center' },
  empty: { alignItems: 'center', paddingTop: 60 },
  cartBar: {
    position: 'absolute', bottom: 20, left: 16, right: 16,
    backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 14,
    paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center',
  },
  cartBadge: {
    backgroundColor: '#000', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, marginRight: 10,
  },
  cartBadgeText: { color: COLORS.accent, fontSize: 13, fontWeight: '800' },
  cartBarText: { flex: 1, color: '#000', fontSize: 15, fontWeight: '800' },
  cartBarPrice: { color: '#000', fontSize: 15, fontWeight: '800' },
});
