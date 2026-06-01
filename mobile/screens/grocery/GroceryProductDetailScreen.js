import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, FlatList, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2A2A3A',
  text: '#FFFFFF', muted: '#8A8A9A', orange: '#F57C00',
  green: '#27AE60', teal: '#00838F', gold: '#FFD700', accent: '#D32F2F',
};

const MOCK_PRODUCT = {
  id: 'p1', emoji: '🥛', name: 'Lait Vache Noire entier', brand: 'Vache Noire',
  category: 'Produits laitiers', description: 'Lait entier pasteurisé de haute qualité, riche en calcium et en protéines. Idéal pour toute la famille.',
  price: 1.850, oldPrice: 2.100, unit: '1L', inStock: true,
  ratings: { avg: 4.6, total: 248, distribution: [3, 5, 18, 62, 160] },
};

const MOCK_SIMILAR = [
  { id: 's1', emoji: '🥛', name: 'Lait Délice 1L', price: 1.750 },
  { id: 's2', emoji: '🥛', name: 'Lait Candia 1L', price: 1.900 },
  { id: 's3', emoji: '🧀', name: 'Yaourt nature', price: 0.850 },
  { id: 's4', emoji: '🧈', name: 'Beurre 250g', price: 3.200 },
];

function Stars({ rating, size = 14 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1,2,3,4,5].map((i) => (
        <Text key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? COLORS.gold : COLORS.border }}>★</Text>
      ))}
    </View>
  );
}

export default function GroceryProductDetailScreen({ navigation, route }) {
  const product = route?.params?.product || MOCK_PRODUCT;
  const [qty, setQty] = useState(1);

  const totalRatings = product.ratings.distribution.reduce((a, b) => a + b, 0) || 1;

  const handleAddToCart = () => {
    Alert.alert('✅ Ajouté !', `${qty}× ${product.name} ajouté au panier.`);
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{product.name}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={s.imagePlaceholder}>
          <Text style={{ fontSize: 80 }}>{product.emoji}</Text>
          {product.oldPrice && (
            <View style={s.promoBadge}>
              <Text style={s.promoBadgeTxt}>PROMO</Text>
            </View>
          )}
        </View>

        <View style={s.infoSection}>
          <Text style={s.brand}>{product.brand} · {product.category}</Text>
          <Text style={s.productName}>{product.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
            <Text style={s.price}>{product.price.toFixed(3)} TND</Text>
            {product.oldPrice && <Text style={s.oldPrice}>{product.oldPrice.toFixed(3)} TND</Text>}
            <Text style={s.unit}>/ {product.unit}</Text>
          </View>
          <Text style={s.description}>{product.description}</Text>
        </View>

        <View style={s.ratingSection}>
          <Text style={s.sectionTitle}>Avis clients</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={s.ratingAvg}>{product.ratings.avg.toFixed(1)}</Text>
              <Stars rating={product.ratings.avg} size={16} />
              <Text style={s.ratingCount}>{product.ratings.total} avis</Text>
            </View>
            <View style={{ flex: 1 }}>
              {[5,4,3,2,1].map((star) => {
                const count = product.ratings.distribution[star - 1] || 0;
                const pct = Math.round((count / totalRatings) * 100);
                return (
                  <View key={star} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Text style={{ color: COLORS.muted, fontSize: 11, width: 14 }}>{star}★</Text>
                    <View style={{ flex: 1, height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' }}>
                      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: COLORS.gold, borderRadius: 2 }} />
                    </View>
                    <Text style={{ color: COLORS.muted, fontSize: 10, width: 28, textAlign: 'right' }}>{pct}%</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={s.similarSection}>
          <Text style={s.sectionTitle}>Produits similaires</Text>
          <FlatList
            horizontal
            data={MOCK_SIMILAR}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.similarCard}>
                <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 4 }}>{item.emoji}</Text>
                <Text style={s.similarName} numberOfLines={2}>{item.name}</Text>
                <Text style={s.similarPrice}>{item.price.toFixed(3)} TND</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>

      <View style={s.footer}>
        <View style={s.qtyRow}>
          <TouchableOpacity style={s.qtyBtn} onPress={() => setQty(Math.max(1, qty - 1))}>
            <Text style={s.qtyBtnTxt}>−</Text>
          </TouchableOpacity>
          <Text style={s.qtyVal}>{qty}</Text>
          <TouchableOpacity style={s.qtyBtn} onPress={() => setQty(qty + 1)}>
            <Text style={s.qtyBtnTxt}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={handleAddToCart}>
          <Text style={s.addBtnTxt}>🛒 Ajouter — {(product.price * qty).toFixed(3)} TND</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700', flex: 1 },
  imagePlaceholder: { backgroundColor: COLORS.surface, height: 200, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  promoBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: COLORS.accent, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  promoBadgeTxt: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  infoSection: { padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  brand: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  productName: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  price: { color: COLORS.teal, fontSize: 24, fontWeight: '900' },
  oldPrice: { color: COLORS.muted, fontSize: 16, textDecorationLine: 'line-through' },
  unit: { color: COLORS.muted, fontSize: 12 },
  description: { color: COLORS.muted, fontSize: 13, marginTop: 10, lineHeight: 20 },
  ratingSection: { padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sectionTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  ratingAvg: { color: COLORS.gold, fontSize: 36, fontWeight: '900' },
  ratingCount: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  similarSection: { paddingTop: 16 },
  similarCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, width: 110, borderWidth: 1, borderColor: COLORS.border },
  similarName: { color: COLORS.text, fontSize: 11, fontWeight: '600', marginBottom: 4, textAlign: 'center' },
  similarPrice: { color: COLORS.teal, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border, padding: 16, flexDirection: 'row', gap: 12 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  qtyBtn: { width: 40, height: 48, alignItems: 'center', justifyContent: 'center' },
  qtyBtnTxt: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  qtyVal: { color: COLORS.text, fontSize: 16, fontWeight: '800', paddingHorizontal: 12 },
  addBtn: { flex: 1, backgroundColor: COLORS.teal, borderRadius: 12, padding: 14, alignItems: 'center', justifyContent: 'center' },
  addBtnTxt: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
