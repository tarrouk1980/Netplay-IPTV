import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useGroceryStore } from '../../store/groceryStore';

const VIOLET = '#8E44AD';
const BG = '#0A0A0F';
const SURFACE = '#1C1C28';
const TEXT = '#FFFFFF';
const SUBTEXT = '#9B9BAA';
const BORDER = '#2C2C3E';
const GREEN = '#27AE60';

const SCHEDULE_OPTIONS = [
  { label: 'Maintenant', value: null },
  { label: 'Dans 30 min', value: 30 },
  { label: 'Dans 1h', value: 60 },
  { label: 'Dans 2h', value: 120 },
];

// Frais calculés seulement quand le panier n'est pas vide
const BASE_FEE = 4;
const PER_KM = 3;
const EST_KM = 3;

export default function GroceryCartScreen({ navigation, route }) {
  const { merchantName } = route.params || {};
  const { cart, addItem, removeItem, requestGrocery } = useGroceryStore();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [scheduleMinutes, setScheduleMinutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');

  const hasItems = cart.items.length > 0;
  const deliveryFee = hasItems ? parseFloat((BASE_FEE + EST_KM * PER_KM).toFixed(3)) : 0;
  const subtotal = cart.items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  const total = parseFloat((subtotal + deliveryFee).toFixed(3));

  const handleAddItem = () => {
    const name = newItemName.trim();
    if (!name) return;
    addItem({ name, quantity: parseInt(newItemQty, 10) || 1 });
    setNewItemName('');
    setNewItemQty('1');
  };

  const handleOrder = async () => {
    if (!hasItems) {
      Alert.alert('Liste vide', 'Ajoutez au moins un article à votre liste de courses.');
      return;
    }
    if (!deliveryAddress.trim()) {
      Alert.alert('Adresse manquante', 'Veuillez entrer votre adresse de livraison.');
      return;
    }

    setLoading(true);
    try {
      const scheduledAt = scheduleMinutes
        ? new Date(Date.now() + scheduleMinutes * 60 * 1000).toISOString()
        : null;

      const order = await requestGrocery({
        items: cart.items,
        merchantIds: cart.merchantId ? [cart.merchantId] : [],
        deliveryLat: 36.8065,
        deliveryLng: 10.1815,
        deliveryAddress: deliveryAddress.trim(),
        scheduledAt,
      });

      navigation.replace('GroceryTracking', { orderId: order.id });
    } catch (err) {
      Alert.alert('Erreur', err?.message || 'Impossible de passer la commande.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {merchantName ? `🛒 ${merchantName}` : '🛒 Ma liste de courses'}
        </Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Explanation banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerIcon}>💡</Text>
          <Text style={styles.infoBannerText}>
            Écrivez votre liste de courses. Notre livreur se charge d'acheter vos articles et de vous les livrer.
          </Text>
        </View>

        {/* Add item */}
        <Text style={styles.sectionTitle}>Votre liste de courses</Text>
        <View style={styles.addItemRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Ex: Lait entier 1L, Pain..."
            placeholderTextColor={SUBTEXT}
            value={newItemName}
            onChangeText={setNewItemName}
            onSubmitEditing={handleAddItem}
            returnKeyType="done"
          />
          <TextInput
            style={[styles.input, styles.qtyInput]}
            placeholder="Qté"
            placeholderTextColor={SUBTEXT}
            value={newItemQty}
            onChangeText={setNewItemQty}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddItem}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Items list */}
        {!hasItems ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>Liste vide</Text>
            <Text style={styles.emptyText}>Ajoutez vos articles ci-dessus</Text>
          </View>
        ) : (
          <View style={styles.itemsList}>
            {cart.items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemBullet}>•</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>×{item.quantity}</Text>
                <TouchableOpacity onPress={() => removeItem(idx)} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.itemsCount}>
              <Text style={styles.itemsCountText}>{cart.items.length} article{cart.items.length > 1 ? 's' : ''}</Text>
            </View>
          </View>
        )}

        {/* Delivery address */}
        <Text style={styles.sectionTitle}>Adresse de livraison</Text>
        <TextInput
          style={[styles.input, styles.addressInput]}
          placeholder="Rue, numéro, ville, gouvernorat..."
          placeholderTextColor={SUBTEXT}
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          multiline
        />

        {/* Schedule */}
        <Text style={styles.sectionTitle}>Quand ?</Text>
        <View style={styles.scheduleRow}>
          {SCHEDULE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.label}
              style={[styles.scheduleChip, scheduleMinutes === opt.value && styles.scheduleChipActive]}
              onPress={() => setScheduleMinutes(opt.value)}
            >
              <Text style={[styles.scheduleText, scheduleMinutes === opt.value && styles.scheduleTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary — only if has items */}
        {hasItems && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Résumé</Text>
            {subtotal > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Produits estimés</Text>
                <Text style={styles.summaryValue}>{subtotal.toFixed(3)} TND</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de livraison</Text>
              <Text style={styles.summaryValue}>{deliveryFee.toFixed(3)} TND</Text>
            </View>
            {subtotal > 0 && (
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total estimé</Text>
                <Text style={styles.totalValue}>{total.toFixed(3)} TND</Text>
              </View>
            )}
            <Text style={styles.summaryNote}>
              * Le prix final des produits est réglé directement avec le livreur selon les prix du magasin.
            </Text>
          </View>
        )}

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Order button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.orderBtn, !hasItems && styles.orderBtnDisabled]}
          onPress={handleOrder}
          disabled={loading || !hasItems}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.orderBtnText}>
              {hasItems
                ? `Commander — ${deliveryFee.toFixed(3)} TND livraison`
                : 'Ajoutez des articles pour commander'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { marginRight: 12, padding: 4 },
  backArrow: { color: VIOLET, fontSize: 32, lineHeight: 32, marginTop: -4 },
  headerTitle: { color: TEXT, fontSize: 18, fontWeight: '700', flex: 1 },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 20 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: VIOLET + '22',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: VIOLET + '55',
  },
  infoBannerIcon: { fontSize: 18 },
  infoBannerText: { flex: 1, color: '#C9A0DC', fontSize: 13, lineHeight: 20 },
  sectionTitle: { color: TEXT, fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 10 },
  addItemRow: { flexDirection: 'row', gap: 8, marginBottom: 12, alignItems: 'center' },
  input: {
    backgroundColor: SURFACE,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: TEXT,
    fontSize: 15,
    borderWidth: 1,
    borderColor: BORDER,
  },
  addressInput: { marginBottom: 8, minHeight: 60, textAlignVertical: 'top' },
  qtyInput: { width: 56, textAlign: 'center' },
  addBtn: {
    backgroundColor: VIOLET,
    borderRadius: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: TEXT, fontSize: 24, fontWeight: '700', lineHeight: 28 },
  emptyBox: {
    backgroundColor: SURFACE,
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 8,
  },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyTitle: { color: TEXT, fontWeight: '700', fontSize: 15, marginBottom: 4 },
  emptyText: { color: SUBTEXT, fontSize: 13 },
  itemsList: {
    backgroundColor: SURFACE,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    gap: 8,
  },
  itemBullet: { color: VIOLET, fontSize: 18 },
  itemName: { flex: 1, color: TEXT, fontSize: 14 },
  itemQty: { color: SUBTEXT, fontSize: 13, fontWeight: '600' },
  removeBtn: { padding: 4 },
  removeBtnText: { color: '#E74C3C', fontSize: 14, fontWeight: '700' },
  itemsCount: { paddingTop: 10, alignItems: 'flex-end' },
  itemsCountText: { color: VIOLET, fontSize: 12, fontWeight: '700' },
  scheduleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  scheduleChip: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  scheduleChipActive: { backgroundColor: VIOLET, borderColor: VIOLET },
  scheduleText: { color: SUBTEXT, fontSize: 13 },
  scheduleTextActive: { color: TEXT, fontWeight: '600' },
  summary: {
    backgroundColor: SURFACE,
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  summaryTitle: { color: TEXT, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: SUBTEXT, fontSize: 14 },
  summaryValue: { color: TEXT, fontSize: 14 },
  totalRow: { borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 10, marginTop: 4 },
  totalLabel: { color: TEXT, fontSize: 15, fontWeight: '700' },
  totalValue: { color: VIOLET, fontSize: 17, fontWeight: '800' },
  summaryNote: { color: SUBTEXT, fontSize: 11, marginTop: 12, lineHeight: 16, fontStyle: 'italic' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  orderBtn: { backgroundColor: VIOLET, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  orderBtnDisabled: { backgroundColor: '#3A2A4A', opacity: 0.7 },
  orderBtnText: { color: TEXT, fontSize: 15, fontWeight: '700' },
});
