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
} from 'react-native';
import { useGroceryStore } from '../../store/groceryStore';

const VIOLET = '#8E44AD';
const BG = '#0A0A0F';
const CARD_BG = '#16161E';
const TEXT = '#FFFFFF';
const SUBTEXT = '#9B9BAA';
const BORDER = '#2A2A3A';

const SCHEDULE_OPTIONS = [
  { label: 'Maintenant', value: null },
  { label: 'Dans 30 min', value: 30 },
  { label: 'Dans 1h', value: 60 },
  { label: 'Dans 2h', value: 120 },
];

const GROCERY_BASE_FEE = 4;
const GROCERY_PER_KM = 3;

export default function GroceryCartScreen({ navigation, route }) {
  const { mode } = route.params || {};
  const { cart, addItem, removeItem, updateItem, requestGrocery } = useGroceryStore();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [scheduleMinutes, setScheduleMinutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');

  const estimatedDistanceKm = 3;
  const deliveryFee = parseFloat((GROCERY_BASE_FEE + estimatedDistanceKm * GROCERY_PER_KM).toFixed(3));
  const subtotal = cart.items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  const total = parseFloat((subtotal + deliveryFee).toFixed(3));

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    addItem({ name: newItemName.trim(), quantity: parseInt(newItemQty, 10) || 1 });
    setNewItemName('');
    setNewItemQty('1');
  };

  const handleOrder = async () => {
    if (!deliveryAddress.trim()) {
      Alert.alert('Adresse manquante', 'Veuillez entrer votre adresse de livraison.');
      return;
    }
    if (cart.items.length === 0) {
      Alert.alert('Panier vide', 'Ajoutez des articles avant de commander.');
      return;
    }

    setLoading(true);
    try {
      let scheduledAt = null;
      if (scheduleMinutes) {
        scheduledAt = new Date(Date.now() + scheduleMinutes * 60 * 1000).toISOString();
      }

      const order = await requestGrocery({
        items: cart.items,
        merchantIds: cart.merchantId ? [cart.merchantId] : [],
        deliveryLat: 36.8065,
        deliveryLng: 10.1815,
        deliveryAddress,
        scheduledAt,
      });

      navigation.replace('GroceryTracking', { orderId: order.id });
    } catch (err) {
      Alert.alert('Erreur', err.message || 'Impossible de passer la commande.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon panier</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Articles</Text>

        {mode === 'CUSTOM' && (
          <View style={styles.addItemRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Nom de l'article..."
              placeholderTextColor={SUBTEXT}
              value={newItemName}
              onChangeText={setNewItemName}
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
        )}

        {cart.items.length === 0 ? (
          <Text style={styles.emptyText}>Aucun article dans le panier</Text>
        ) : (
          cart.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.price && <Text style={styles.itemPrice}>{item.price} TND</Text>}
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => removeItem(idx)} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.itemQty}>×{item.quantity}</Text>
              </View>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Adresse de livraison</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez votre adresse complète..."
          placeholderTextColor={SUBTEXT}
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          multiline
        />

        <Text style={styles.sectionTitle}>Créneau de livraison</Text>
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

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Résumé</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>{subtotal.toFixed(3)} TND</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Frais de livraison</Text>
            <Text style={styles.summaryValue}>{deliveryFee.toFixed(3)} TND</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{total.toFixed(3)} TND</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.orderBtn} onPress={handleOrder} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.orderBtnText}>Commander — {total.toFixed(3)} TND</Text>
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
    backgroundColor: VIOLET,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { marginRight: 12 },
  backText: { color: TEXT, fontSize: 22 },
  headerTitle: { color: TEXT, fontSize: 20, fontWeight: '700' },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  sectionTitle: { color: TEXT, fontSize: 17, fontWeight: '700', marginTop: 20, marginBottom: 10 },
  addItemRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: {
    backgroundColor: CARD_BG,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: TEXT,
    fontSize: 15,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 8,
  },
  qtyInput: { width: 60 },
  addBtn: {
    backgroundColor: VIOLET,
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  addBtnText: { color: TEXT, fontSize: 22, fontWeight: '700' },
  emptyText: { color: SUBTEXT, textAlign: 'center', marginVertical: 20 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  itemInfo: { flex: 1 },
  itemName: { color: TEXT, fontSize: 15 },
  itemPrice: { color: SUBTEXT, fontSize: 13, marginTop: 2 },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  removeBtn: { padding: 4 },
  removeBtnText: { color: '#E74C3C', fontSize: 14 },
  itemQty: { color: SUBTEXT, fontSize: 14 },
  scheduleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  scheduleChip: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  scheduleChipActive: { backgroundColor: VIOLET, borderColor: VIOLET },
  scheduleText: { color: SUBTEXT, fontSize: 14 },
  scheduleTextActive: { color: TEXT, fontWeight: '600' },
  summary: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  summaryTitle: { color: TEXT, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: SUBTEXT, fontSize: 14 },
  summaryValue: { color: TEXT, fontSize: 14 },
  totalRow: { borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 10, marginTop: 4 },
  totalLabel: { color: TEXT, fontSize: 16, fontWeight: '700' },
  totalValue: { color: VIOLET, fontSize: 18, fontWeight: '700' },
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
  orderBtn: {
    backgroundColor: VIOLET,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  orderBtnText: { color: TEXT, fontSize: 16, fontWeight: '700' },
});
