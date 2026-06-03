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
};

const CATEGORIES = [
  { id: 'all', label: 'Tout' },
  { id: 'fruits', label: 'Fruits & Légumes' },
  { id: 'dairy', label: 'Produits laitiers' },
  { id: 'bakery', label: 'Boulangerie' },
  { id: 'grocery', label: 'Épicerie' },
  { id: 'drinks', label: 'Boissons' },
  { id: 'hygiene', label: 'Hygiène' },
];

const PRODUCTS = [
  { id: '1', emoji: '🍎', name: 'Pommes', weight: '1 kg', price: 3.5, category: 'fruits' },
  { id: '2', emoji: '🍌', name: 'Bananes', weight: '1 kg', price: 2.8, category: 'fruits' },
  { id: '3', emoji: '🍅', name: 'Tomates', weight: '500 g', price: 1.9, category: 'fruits' },
  { id: '4', emoji: '🥕', name: 'Carottes', weight: '1 kg', price: 1.5, category: 'fruits' },
  { id: '5', emoji: '🥛', name: 'Lait entier', weight: '1 L', price: 1.8, category: 'dairy' },
  { id: '6', emoji: '🧀', name: 'Fromage Gouda', weight: '200 g', price: 4.2, category: 'dairy' },
  { id: '7', emoji: '🥚', name: 'Oeufs frais', weight: 'x6', price: 2.5, category: 'dairy' },
  { id: '8', emoji: '🧈', name: 'Beurre', weight: '250 g', price: 3.1, category: 'dairy' },
  { id: '9', emoji: '🍞', name: 'Pain de mie', weight: '500 g', price: 1.4, category: 'bakery' },
  { id: '10', emoji: '🥖', name: 'Baguette', weight: '250 g', price: 0.9, category: 'bakery' },
  { id: '11', emoji: '🍚', name: 'Riz basmati', weight: '1 kg', price: 3.8, category: 'grocery' },
  { id: '12', emoji: '🫒', name: "Huile d'olive", weight: '500 ml', price: 8.5, category: 'grocery' },
  { id: '13', emoji: '💧', name: 'Eau minérale', weight: '1.5 L', price: 0.7, category: 'drinks' },
  { id: '14', emoji: '🧃', name: "Jus d'orange", weight: '1 L', price: 2.3, category: 'drinks' },
  { id: '15', emoji: '🧴', name: 'Shampoing', weight: '400 ml', price: 5.9, category: 'hygiene' },
  { id: '16', emoji: '🧼', name: 'Savon liquide', weight: '300 ml', price: 3.2, category: 'hygiene' },
];

const STORE = {
  name: "Marché Frais El Menzah",
  rating: 4.7,
  deliveryTime: '25-35 min',
  minOrder: '15.00 TND',
};

export default function GroceryStoreScreen({ navigation, route }) {
  const storeName = route?.params?.storeName || STORE.name;
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState({});

  const filteredProducts =
    selectedCategory === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === selectedCategory);

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = PRODUCTS.reduce((sum, p) => sum + (cart[p.id] || 0) * p.price, 0);

  const addToCart = (productId) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[productId] > 1) {
        next[productId] -= 1;
      } else {
        delete next[productId];
      }
      return next;
    });
  };

  const renderProduct = ({ item }) => {
    const qty = cart[item.id] || 0;
    return (
      <View style={styles.productCard}>
        <Text style={styles.productEmoji}>{item.emoji}</Text>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productWeight}>{item.weight}</Text>
        <Text style={styles.productPrice}>{item.price.toFixed(2)} TND</Text>
        {qty === 0 ? (
          <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item.id)}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item.id)}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyCount}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(item.id)}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{storeName}</Text>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('GroceryCart', { cart })}>
          <Text style={styles.cartIcon}>🛒</Text>
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Store info bar */}
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>⭐ {STORE.rating}</Text>
        <Text style={styles.infoDivider}>|</Text>
        <Text style={styles.infoText}>🕐 {STORE.deliveryTime}</Text>
        <Text style={styles.infoDivider}>|</Text>
        <Text style={styles.infoText}>Min. {STORE.minOrder}</Text>
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={[styles.chipText, selectedCategory === cat.id && styles.chipTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom bar */}
      {totalItems > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.viewCartBtn}
            onPress={() => navigation.navigate('GroceryCart', { cart })}
          >
            <Text style={styles.viewCartText}>
              {"Voir le panier (" + totalItems + " articles) — " + totalPrice.toFixed(2) + " TND"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, marginRight: 8 },
  backIcon: { fontSize: 22, color: COLORS.text },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: COLORS.text },
  cartBtn: { padding: 4, marginLeft: 8, position: 'relative' },
  cartIcon: { fontSize: 24 },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#000' },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
  },
  infoText: { fontSize: 13, color: COLORS.muted },
  infoDivider: { marginHorizontal: 8, color: COLORS.border },
  categoryScroll: { maxHeight: 48 },
  categoryContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '22' },
  chipText: { fontSize: 13, color: COLORS.muted },
  chipTextActive: { color: COLORS.primary, fontWeight: '600' },
  grid: { padding: 10, paddingBottom: 100 },
  row: { justifyContent: 'space-between' },
  productCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productEmoji: { fontSize: 40, marginBottom: 6 },
  productName: { fontSize: 14, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginBottom: 2 },
  productWeight: { fontSize: 12, color: COLORS.muted, marginBottom: 6 },
  productPrice: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginBottom: 10 },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { fontSize: 22, color: '#000', fontWeight: '700', lineHeight: 26 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 18, color: '#000', fontWeight: '700', lineHeight: 22 },
  qtyCount: { fontSize: 15, fontWeight: '700', color: COLORS.text, minWidth: 20, textAlign: 'center' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  viewCartBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  viewCartText: { fontSize: 15, fontWeight: '700', color: '#000' },
});
