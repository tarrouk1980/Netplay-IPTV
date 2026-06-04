import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C',
};

const MOCK_ITEMS = [
  { id: '1', name: 'Tomates (1 kg)', price: 1.800, qty: 2, image: '🍅' },
  { id: '2', name: 'Pain de mie', price: 2.500, qty: 1, image: '🍞' },
  { id: '3', name: 'Lait demi-écrémé (1L)', price: 1.200, qty: 3, image: '🥛' },
  { id: '4', name: 'Œufs (×12)', price: 4.800, qty: 1, image: '🥚' },
  { id: '5', name: 'Huile végétale (1L)', price: 3.400, qty: 1, image: '🫙' },
];

const DELIVERY_FEE = 2.500;

function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  return (
    <View style={styles.item}>
      <Text style={styles.itemEmoji}>{item.image}</Text>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price.toFixed(3)} TND</Text>
      </View>
      <View style={styles.qtyControl}>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => item.qty === 1 ? onRemove(item.id) : onDecrement(item.id)}
        >
          <Text style={styles.qtyBtnText}>{item.qty === 1 ? '🗑️' : '−'}</Text>
        </TouchableOpacity>
        <Text style={styles.qtyNum}>{item.qty}</Text>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => onIncrement(item.id)}>
          <Text style={styles.qtyBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function GroceryCartScreen({ navigation, route }) {
  const { shopId } = route?.params || {};
  const [items, setItems] = useState(MOCK_ITEMS);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoApplied, setPromoApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + DELIVERY_FEE - discount;

  const increment = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i));
  const decrement = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty - 1) } : i));
  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const res = await api.post('/api/promos/validate', { code: promoCode.trim(), service: 'GROCERY' });
      const disc = res.data.discount || 0;
      setDiscount(disc);
      setPromoApplied(true);
    } catch {
      setDiscount(0);
      setPromoApplied(false);
      Alert.alert('Code invalide', 'Ce code promo est incorrect ou expiré.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleOrder = async () => {
    if (items.length === 0) { Alert.alert('Panier vide', 'Ajoutez des articles avant de commander.'); return; }
    setSubmitting(true);
    try {
      const body = {
        shopId,
        items: items.map(i => ({ id: i.id, qty: i.qty })),
        promoCode: promoApplied ? promoCode : undefined,
      };
      const res = await api.post('/api/grocery/order', body);
      const orderId = res.data?.order?.id;
      navigation.replace('GroceryOrderTracking', { orderId });
    } catch {
      Alert.alert('Erreur', 'Impossible de passer la commande. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon panier ({items.length})</Text>
        <TouchableOpacity onPress={() => Alert.alert('Vider', 'Vider le panier ?', [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Vider', style: 'destructive', onPress: () => setItems([]) },
        ])}>
          <Text style={{ color: COLORS.red, fontSize: 13 }}>Vider</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <CartItem item={item} onIncrement={increment} onDecrement={decrement} onRemove={remove} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <Text style={{ fontSize: 48 }}>🛒</Text>
            <Text style={{ color: COLORS.muted, marginTop: 12 }}>Votre panier est vide</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.shopBtnText}>Continuer les achats</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
      />

      {items.length > 0 && (
        <View style={styles.footer}>
          {/* Promo */}
          <View style={styles.promoRow}>
            <TextInput
              style={[styles.promoInput, promoApplied && styles.promoInputApplied]}
              value={promoCode}
              onChangeText={v => { setPromoCode(v.toUpperCase()); setPromoApplied(false); setDiscount(0); }}
              placeholder="Code promo"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="characters"
              editable={!promoApplied}
            />
            <TouchableOpacity
              style={[styles.promoBtn, promoApplied && styles.promoBtnApplied]}
              onPress={promoApplied ? () => { setPromoApplied(false); setDiscount(0); setPromoCode(''); } : applyPromo}
              disabled={promoLoading}
            >
              {promoLoading
                ? <ActivityIndicator color="#000" size="small" />
                : <Text style={styles.promoBtnText}>{promoApplied ? '✕' : 'Appliquer'}</Text>
              }
            </TouchableOpacity>
          </View>
          {promoApplied && (
            <Text style={styles.promoSaved}>✓ Réduction de {discount.toFixed(3)} TND appliquée</Text>
          )}

          {/* Summary */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total</Text>
              <Text style={styles.summaryValue}>{subtotal.toFixed(3)} TND</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Livraison</Text>
              <Text style={styles.summaryValue}>{DELIVERY_FEE.toFixed(3)} TND</Text>
            </View>
            {discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: COLORS.green }]}>Remise</Text>
                <Text style={[styles.summaryValue, { color: COLORS.green }]}>−{discount.toFixed(3)} TND</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{total.toFixed(3)} TND</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.orderBtn, submitting && { opacity: 0.6 }]}
            onPress={handleOrder}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color="#000" />
              : <Text style={styles.orderBtnText}>Commander — {total.toFixed(3)} TND</Text>
            }
          </TouchableOpacity>
        </View>
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
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  item: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  itemEmoji: { fontSize: 30 },
  itemInfo: { flex: 1 },
  itemName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  itemPrice: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  qtyBtnText: { color: COLORS.text, fontSize: 14 },
  qtyNum: { color: COLORS.text, fontSize: 15, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  separator: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 16 },
  shopBtn: { marginTop: 20, backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  shopBtnText: { color: '#000', fontSize: 14, fontWeight: '700' },
  footer: {
    borderTopWidth: 1, borderTopColor: COLORS.border,
    padding: 16, backgroundColor: COLORS.bg,
  },
  promoRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  promoInput: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 9, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  promoInputApplied: { borderColor: COLORS.green },
  promoBtn: {
    backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 9, justifyContent: 'center', alignItems: 'center',
  },
  promoBtnApplied: { backgroundColor: COLORS.green },
  promoBtnText: { color: '#000', fontSize: 13, fontWeight: '700' },
  promoSaved: { color: COLORS.green, fontSize: 12, marginBottom: 8 },
  summaryBox: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryLabel: { color: COLORS.muted, fontSize: 13 },
  summaryValue: { color: COLORS.text, fontSize: 13 },
  summaryTotal: { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 6, paddingTop: 10 },
  totalLabel: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  totalValue: { color: COLORS.accent, fontSize: 15, fontWeight: '900' },
  orderBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 15, alignItems: 'center',
  },
  orderBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
});
