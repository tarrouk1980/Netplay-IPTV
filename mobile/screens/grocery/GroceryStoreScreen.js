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

const STORE = {
  name: "Monoprix Lac",
  rating: 4.7,
  deliveryTime: "25-35 min",
  minOrder: "15.00 TND",
};

const CATEGORIES = [
  "Tout",
  "Fruits & Légumes",
  "Produits laitiers",
  "Boulangerie",
  "Épicerie",
  "Boissons",
  "Hygiène",
];

const PRODUCTS = [
  { id: "1", emoji: "🍎", name: "Pommes Rouges", weight: "1 kg", price: 3.50, category: "Fruits & Légumes" },
  { id: "2", emoji: "🍌", name: "Bananes", weight: "1 kg", price: 2.80, category: "Fruits & Légumes" },
  { id: "3", emoji: "🥕", name: "Carottes", weight: "500 g", price: 1.20, category: "Fruits & Légumes" },
  { id: "4", emoji: "🍅", name: "Tomates", weight: "1 kg", price: 2.50, category: "Fruits & Légumes" },
  { id: "5", emoji: "🥛", name: "Lait Entier", weight: "1 L", price: 1.80, category: "Produits laitiers" },
  { id: "6", emoji: "🧀", name: "Fromage Gouda", weight: "200 g", price: 4.50, category: "Produits laitiers" },
  { id: "7", emoji: "🥚", name: "Oeufs Frais", weight: "x12", price: 3.20, category: "Produits laitiers" },
  { id: "8", emoji: "🍞", name: "Pain de Mie", weight: "500 g", price: 2.10, category: "Boulangerie" },
  { id: "9", emoji: "🥐", name: "Croissants", weight: "x4", price: 3.80, category: "Boulangerie" },
  { id: "10", emoji: "🫙", name: "Confiture Fraise", weight: "370 g", price: 4.20, category: "Épicerie" },
  { id: "11", emoji: "🍝", name: "Pâtes Spaghetti", weight: "500 g", price: 1.90, category: "Épicerie" },
  { id: "12", emoji: "🫒", name: "Huile Olive", weight: "750 mL", price: 8.50, category: "Épicerie" },
  { id: "13", emoji: "🧃", name: "Jus Orange", weight: "1 L", price: 3.10, category: "Boissons" },
  { id: "14", emoji: "💧", name: "Eau Minérale", weight: "1.5 L", price: 0.90, category: "Boissons" },
  { id: "15", emoji: "🧴", name: "Shampooing", weight: "400 mL", price: 6.50, category: "Hygiène" },
  { id: "16", emoji: "🪥", name: "Brosse à Dents", weight: "x2", price: 4.80, category: "Hygiène" },
];

export default function GroceryStoreScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [cart, setCart] = useState({});

  const filteredProducts = selectedCategory === "Tout"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === selectedCategory);

  const addToCart = (productId) => {
    setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = PRODUCTS.reduce((sum, p) => sum + (cart[p.id] || 0) * p.price, 0);

  const renderProduct = ({ item }) => {
    const qty = cart[item.id] || 0;
    return (
      <View style={styles.productCard}>
        <Text style={styles.productEmoji}>{item.emoji}</Text>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productWeight}>{item.weight}</Text>
        <Text style={styles.productPrice}>{item.price.toFixed(2)} TND</Text>
        <TouchableOpacity
          style={[styles.addButton, qty > 0 && styles.addButtonActive]}
          onPress={() => addToCart(item.id)}
        >
          <Text style={styles.addButtonText}>{qty > 0 ? `+${qty}` : "+"}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{STORE.name}</Text>
        <TouchableOpacity style={styles.cartIcon}>
          <Text style={styles.cartEmoji}>🛒</Text>
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Store Info */}
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{STORE.name}</Text>
        <View style={styles.storeMetaRow}>
          <Text style={styles.storeMeta}>⭐ {STORE.rating}</Text>
          <Text style={styles.storeMetaSep}>•</Text>
          <Text style={styles.storeMeta}>🕐 {STORE.deliveryTime}</Text>
          <Text style={styles.storeMetaSep}>•</Text>
          <Text style={styles.storeMeta}>Min. {STORE.minOrder}</Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Cart Bar */}
      {totalItems > 0 && (
        <TouchableOpacity style={styles.cartBar}>
          <Text style={styles.cartBarText}>
            {"Voir le panier ("}{totalItems}{" articles) — "}{totalPrice.toFixed(2)}{" TND"}
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  backIcon: {
    color: COLORS.text,
    fontSize: 22,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  cartIcon: {
    position: 'relative',
    padding: 4,
  },
  cartEmoji: {
    fontSize: 24,
  },
  cartBadge: {
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
  cartBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
  },
  storeInfo: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  storeName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  storeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeMeta: {
    color: COLORS.muted,
    fontSize: 13,
  },
  storeMetaSep: {
    color: COLORS.border,
    marginHorizontal: 6,
  },
  categoryScroll: {
    maxHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.muted,
    fontSize: 13,
  },
  categoryChipTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  productList: {
    padding: 12,
    paddingBottom: 100,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  productCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  productName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  productWeight: {
    color: COLORS.muted,
    fontSize: 11,
    marginBottom: 4,
  },
  productPrice: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonActive: {
    backgroundColor: '#c47d0e',
  },
  addButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  cartBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cartBarText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
});
