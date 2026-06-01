import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  ScrollView,
  RefreshControl,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useCartStore from '../../store/cartStore';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  green: '#27AE60',
  orange: '#F57C00',
  accent: '#D32F2F',
};

function ProductCard({ product, onAdd, qty }) {
  return (
    <View style={p.card}>
      <View style={p.imgPlaceholder}>
        <Text style={{ fontSize: 28 }}>{product.emoji || '🛒'}</Text>
      </View>
      <Text style={p.name} numberOfLines={2}>{product.name}</Text>
      <Text style={p.price}>{parseFloat(product.price).toFixed(3)} TND</Text>
      {product.unit && <Text style={p.unit}>{product.unit}</Text>}
      {qty > 0 ? (
        <View style={p.qtyRow}>
          <TouchableOpacity style={p.qtyBtn} onPress={() => onAdd(product, -1)}>
            <Text style={p.qtyBtnTxt}>−</Text>
          </TouchableOpacity>
          <Text style={p.qty}>{qty}</Text>
          <TouchableOpacity style={[p.qtyBtn, { backgroundColor: COLORS.green }]} onPress={() => onAdd(product, 1)}>
            <Text style={p.qtyBtnTxt}>+</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={p.addBtn} onPress={() => onAdd(product, 1)}>
          <Text style={p.addBtnTxt}>+ Ajouter</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const p = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 1,
    margin: 4,
    alignItems: 'center',
  },
  imgPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  name: { color: COLORS.text, fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  price: { color: COLORS.green, fontSize: 13, fontWeight: '700', marginBottom: 2 },
  unit: { color: COLORS.muted, fontSize: 10, marginBottom: 6 },
  addBtn: { backgroundColor: COLORS.green, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14, marginTop: 4 },
  addBtnTxt: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  qtyBtnTxt: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  qty: { color: COLORS.text, fontSize: 14, fontWeight: '700', minWidth: 20, textAlign: 'center' },
});

export default function GroceryStoreDetailScreen({ route, navigation }) {
  const { merchantId, merchantName } = route.params || {};
  const { addToCart, getItemQty, cartItems, merchantId: cartMerchant } = useCartStore?.() || { addToCart: () => {}, getItemQty: () => 0, cartItems: [], merchantId: null };

  const [store, setStore] = useState(null);
  const [sections, setSections] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/merchants/${merchantId}/menu`);
      setStore(res.data.merchant);
      const cats = res.data.categories || [];
      setSections(cats);
      if (cats.length > 0 && !activeCategory) setActiveCategory(cats[0].name);
    } catch {
      setStore({ name: merchantName, isOpen: true, rating: 0, deliveryTime: 30 });
      setSections([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [merchantId]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = (product, delta) => {
    if (cartMerchant && cartMerchant !== merchantId && delta > 0) {
      Alert.alert(
        'Panier existant',
        'Vous avez déjà des articles d\'un autre marchand. Vider le panier ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Vider', style: 'destructive', onPress: () => { useCartStore.getState?.()?.clearCart?.(); handleAdd(product, delta); } },
        ]
      );
      return;
    }
    if (delta > 0) {
      addToCart?.({ ...product, merchantId });
    } else {
      useCartStore.getState?.()?.removeFromCart?.(product.id);
    }
  };

  const cartTotal = cartItems?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
  const cartCount = cartItems?.reduce((s, i) => s + i.quantity, 0) || 0;

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={COLORS.green} size="large" />
      </View>
    );
  }

  const filteredProducts = sections.find((sec) => sec.name === activeCategory)?.products || [];

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.storeName}>{store?.name || merchantName}</Text>
          <View style={s.metaRow}>
            {store?.isOpen !== false ? (
              <Text style={s.openTag}>🟢 Ouvert</Text>
            ) : (
              <Text style={s.closedTag}>🔴 Fermé</Text>
            )}
            {store?.rating > 0 && <Text style={s.rating}>⭐ {parseFloat(store.rating).toFixed(1)}</Text>}
            {store?.deliveryTime && <Text style={s.deliveryTime}>🕐 ~{store.deliveryTime} min</Text>}
          </View>
        </View>
      </View>

      {/* Category tabs */}
      {sections.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.catScroll}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 8 }}
        >
          {sections.map((sec) => (
            <TouchableOpacity
              key={sec.name}
              style={[s.catTab, activeCategory === sec.name && s.catTabActive]}
              onPress={() => setActiveCategory(sec.name)}
            >
              <Text style={[s.catTabTxt, activeCategory === sec.name && s.catTabTxtActive]}>
                {sec.emoji || ''} {sec.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Products grid */}
      {filteredProducts.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 40, marginBottom: 10 }}>🛒</Text>
          <Text style={s.emptyTitle}>Aucun produit</Text>
          <Text style={s.emptySub}>Cette catégorie est vide pour le moment.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.green} />}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              qty={getItemQty?.(item.id) || 0}
              onAdd={handleAdd}
            />
          )}
          contentContainerStyle={{ padding: 12, paddingBottom: cartCount > 0 ? 100 : 40 }}
        />
      )}

      {/* Cart FAB */}
      {cartCount > 0 && (
        <TouchableOpacity
          style={s.cartFab}
          onPress={() => navigation.navigate('GroceryCart')}
        >
          <View style={s.cartBadge}>
            <Text style={s.cartBadgeTxt}>{cartCount}</Text>
          </View>
          <Text style={s.cartFabTxt}>🛒 Voir le panier — {cartTotal.toFixed(3)} TND</Text>
          <Text style={s.cartFabArrow}>→</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  storeName: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  metaRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  openTag: { color: COLORS.green, fontSize: 12, fontWeight: '600' },
  closedTag: { color: COLORS.accent, fontSize: 12, fontWeight: '600' },
  rating: { color: '#F5A623', fontSize: 12, fontWeight: '600' },
  deliveryTime: { color: COLORS.muted, fontSize: 12 },
  catScroll: { maxHeight: 52, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  catTab: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catTabActive: { borderColor: COLORS.green, backgroundColor: COLORS.green + '22' },
  catTabTxt: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  catTabTxtActive: { color: COLORS.green },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center' },
  cartFab: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: COLORS.green,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartBadge: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeTxt: { color: COLORS.green, fontSize: 12, fontWeight: '800' },
  cartFabTxt: { color: '#FFF', fontSize: 14, fontWeight: '700', flex: 1 },
  cartFabArrow: { color: '#FFF', fontSize: 18 },
});
