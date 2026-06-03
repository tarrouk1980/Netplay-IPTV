import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F',
};

const MOCK = {
  id: 'PRD001',
  name: 'Huile d\'olive extra vierge 750ml',
  emoji: '🫒',
  price: 12.500,
  oldPrice: 15.000,
  rating: 4.7,
  reviews: 143,
  store: 'Carrefour Berges du Lac',
  category: 'Épicerie',
  description: 'Huile d\'olive extra vierge de première pression à froid. Produit tunisien 100% naturel, idéal pour la cuisine et les salades.',
  tags: ['Bio', 'Tunisien', '1ère pression', 'Sans additifs'],
  details: [
    { label: 'Marque', value: 'Zaytoun' },
    { label: 'Contenance', value: '750 ml' },
    { label: 'Origine', value: 'Sfax, Tunisie' },
    { label: 'Conservation', value: 'À l\'abri de la lumière' },
    { label: 'DLC', value: '12/2026' },
  ],
  related: [
    { id: 'R1', name: 'Vinaigre balsamique 500ml', emoji: '🍾', price: 8.5 },
    { id: 'R2', name: 'Sel de mer fin 1kg', emoji: '🧂', price: 2.1 },
    { id: 'R3', name: 'Citrons filet 1kg', emoji: '🍋', price: 3.4 },
  ],
};

export default function GroceryProductDetailScreen({ navigation, route }) {
  const product = route?.params?.product || MOCK;
  const [qty, setQty] = useState(1);
  const [inCart, setInCart] = useState(false);

  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    setInCart(true);
    Alert.alert('🛒 Ajouté !', `${qty}× ${product.name} ajouté au panier.`);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('GroceryCart')}>
          <Text style={{ fontSize: 22 }}>🛒</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={{ fontSize: 90 }}>{product.emoji}</Text>
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}
        </View>

        {/* Title & price */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.storeName}>🏪 {product.store}</Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{product.price.toFixed(3)} TND</Text>
          {product.oldPrice && (
            <Text style={styles.oldPrice}>{product.oldPrice.toFixed(3)}</Text>
          )}
          <View style={styles.ratingBadge}>
            <Text style={{ color: COLORS.accent, fontSize: 13 }}>⭐ {product.rating}</Text>
            <Text style={{ color: COLORS.muted, fontSize: 11 }}> ({product.reviews})</Text>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.tagRow}>
          {product.tags.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <Text style={styles.sectionLabel}>Description</Text>
        <Text style={styles.description}>{product.description}</Text>

        {/* Details */}
        <Text style={styles.sectionLabel}>Détails du produit</Text>
        <View style={styles.detailsCard}>
          {product.details.map((d, i) => (
            <View key={d.label} style={[styles.detailRow, i === product.details.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.detailLabel}>{d.label}</Text>
              <Text style={styles.detailValue}>{d.value}</Text>
            </View>
          ))}
        </View>

        {/* Related */}
        {product.related?.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Produits associés</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 10, paddingBottom: 4 }}>
                {product.related.map((r) => (
                  <View key={r.id} style={styles.relatedCard}>
                    <Text style={{ fontSize: 36 }}>{r.emoji}</Text>
                    <Text style={styles.relatedName} numberOfLines={2}>{r.name}</Text>
                    <Text style={styles.relatedPrice}>{r.price.toFixed(3)} TND</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty((q) => Math.max(1, q - 1))}>
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{qty}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty((q) => q + 1)}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, inCart && { backgroundColor: COLORS.green }]}
          onPress={handleAddToCart}
        >
          <Text style={styles.addBtnText}>
            {inCart ? '✓ Dans le panier' : `🛒 Ajouter — ${(product.price * qty).toFixed(3)} TND`}
          </Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: { flex: 1, color: COLORS.white, fontSize: 15, fontWeight: '700', marginHorizontal: 12 },
  scroll: { padding: 16 },
  hero: {
    alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 20, paddingVertical: 30, marginBottom: 16, position: 'relative',
  },
  discountBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: COLORS.red, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  discountText: { color: COLORS.white, fontSize: 13, fontWeight: '900' },
  titleRow: { flexDirection: 'row', marginBottom: 10 },
  productName: { color: COLORS.white, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  storeName: { color: COLORS.muted, fontSize: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  price: { color: COLORS.accent, fontSize: 24, fontWeight: '900' },
  oldPrice: { color: COLORS.muted, fontSize: 16, textDecorationLine: 'line-through' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag: { backgroundColor: COLORS.accent + '22', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { color: COLORS.accent, fontSize: 11, fontWeight: '600' },
  sectionLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  description: { color: COLORS.white, fontSize: 14, lineHeight: 21, marginBottom: 16 },
  detailsCard: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16, overflow: 'hidden' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  detailLabel: { color: COLORS.muted, fontSize: 13 },
  detailValue: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  relatedCard: { width: 120, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 12, alignItems: 'center' },
  relatedName: { color: COLORS.white, fontSize: 11, textAlign: 'center', marginTop: 6 },
  relatedPrice: { color: COLORS.accent, fontSize: 12, fontWeight: '700', marginTop: 4 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12,
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 0, backgroundColor: COLORS.surface, borderRadius: 10, overflow: 'hidden' },
  qtyBtn: { paddingHorizontal: 14, paddingVertical: 12 },
  qtyBtnText: { color: COLORS.accent, fontSize: 20, fontWeight: '700' },
  qtyValue: { color: COLORS.white, fontSize: 16, fontWeight: '800', minWidth: 28, textAlign: 'center' },
  addBtn: { flex: 1, backgroundColor: COLORS.accent, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  addBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
});
