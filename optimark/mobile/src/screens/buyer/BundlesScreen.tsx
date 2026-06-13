import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
  Alert, ScrollView, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCart } from '../../contexts/CartContext';
import api from '../../api';

export default function BundlesScreen() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.get('/bundles')
      .then(r => setBundles(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const addBundleToCart = (bundle: any) => {
    let count = 0;
    for (const item of bundle.items || []) {
      if (!item.product) continue;
      const p = item.product;
      addItem({
        id: p.id,
        title: p.title,
        price: p.promoPrice ?? p.price,
        seller: bundle.seller?.name || 'Vendeur',
        image: p.images?.[0],
        quantity: 1,
      });
      count++;
    }
    Alert.alert('✅ Ajouté !', `${count} produit${count > 1 ? 's' : ''} ajouté${count > 1 ? 's' : ''} au panier`);
  };

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator size="large" color="#9f1239" />
    </View>
  );

  if (bundles.length === 0) return (
    <View style={s.center}>
      <Text style={s.emptyIcon}>🎁</Text>
      <Text style={s.emptyTitle}>Aucune offre groupée</Text>
      <Text style={s.emptySubtitle}>Revenez bientôt pour découvrir des bundles exclusifs</Text>
    </View>
  );

  return (
    <FlatList
      data={bundles}
      keyExtractor={b => b.id}
      contentContainerStyle={s.list}
      renderItem={({ item: bundle }) => {
        const originalTotal = bundle.items?.reduce((sum: number, i: any) =>
          sum + (i.product?.price || 0), 0) || 0;
        const discounted = originalTotal * (1 - (bundle.discount || 0) / 100);

        return (
          <View style={s.card}>
            {/* Header */}
            <View style={s.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{bundle.title}</Text>
                {bundle.seller && <Text style={s.cardSeller}>par {bundle.seller.name}</Text>}
                {bundle.description && <Text style={s.cardDesc}>{bundle.description}</Text>}
              </View>
              <View style={s.discountBadge}>
                <Text style={s.discountText}>-{bundle.discount}%</Text>
              </View>
            </View>

            {/* Products */}
            <View style={s.productsRow}>
              {(bundle.items || []).slice(0, 4).map((item: any, i: number) => (
                <View key={item.id || i} style={s.productChip}>
                  {item.product?.images?.[0] ? (
                    <Image source={{ uri: item.product.images[0] }} style={s.productImg} />
                  ) : (
                    <View style={[s.productImg, s.productImgPlaceholder]}>
                      <Text style={{ fontSize: 16 }}>📦</Text>
                    </View>
                  )}
                  <Text style={s.productChipName} numberOfLines={2}>{item.product?.title}</Text>
                  <Text style={s.productChipPrice}>{Number(item.product?.price || 0).toFixed(2)} TND</Text>
                </View>
              ))}
              {bundle.items?.length > 4 && (
                <View style={[s.productChip, s.moreChip]}>
                  <Text style={s.moreText}>+{bundle.items.length - 4}</Text>
                </View>
              )}
            </View>

            {/* Pricing */}
            <View style={s.pricingRow}>
              <View>
                <Text style={s.originalPrice}>{originalTotal.toFixed(2)} TND</Text>
                <Text style={s.bundlePrice}>{discounted.toFixed(2)} TND</Text>
                <Text style={s.savings}>Économisez {(originalTotal - discounted).toFixed(2)} TND</Text>
              </View>
              <TouchableOpacity style={s.addBtn} onPress={() => addBundleToCart(bundle)}>
                <Text style={s.addBtnText}>Ajouter au panier</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#334155', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#94a3b8', textAlign: 'center' },
  list: { padding: 16, gap: 16 },
  card: { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  cardHeader: { backgroundColor: '#9f1239', padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardTitle: { color: '#fff', fontWeight: '900', fontSize: 16, marginBottom: 2 },
  cardSeller: { color: '#fecdd3', fontSize: 12 },
  cardDesc: { color: '#fca5a5', fontSize: 12, marginTop: 4 },
  discountBadge: { backgroundColor: '#fff', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  discountText: { color: '#9f1239', fontWeight: '900', fontSize: 14 },
  productsRow: { flexDirection: 'row', padding: 12, gap: 8, flexWrap: 'wrap' },
  productChip: { width: 76, alignItems: 'center' },
  productImg: { width: 56, height: 56, borderRadius: 10, marginBottom: 4, backgroundColor: '#f1f5f9' },
  productImgPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  productChipName: { fontSize: 10, color: '#475569', textAlign: 'center', fontWeight: '600' },
  productChipPrice: { fontSize: 10, color: '#9f1239', fontWeight: '800', marginTop: 1 },
  moreChip: { justifyContent: 'center', backgroundColor: '#f1f5f9', borderRadius: 10, width: 56, height: 56 },
  moreText: { fontSize: 14, fontWeight: '800', color: '#64748b', textAlign: 'center' },
  pricingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  originalPrice: { fontSize: 12, color: '#94a3b8', textDecorationLine: 'line-through' },
  bundlePrice: { fontSize: 20, fontWeight: '900', color: '#9f1239' },
  savings: { fontSize: 11, color: '#15803d', fontWeight: '700', marginTop: 1 },
  addBtn: { backgroundColor: '#9f1239', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
