import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F',
};

const PAYMENT_METHODS = [
  { key: 'wallet',  label: 'Portefeuille EASYWAY', emoji: '💳', balance: 34.5 },
  { key: 'cash',    label: 'Espèces à la livraison', emoji: '💵' },
  { key: 'card',    label: 'Carte bancaire', emoji: '🏦' },
  { key: 'konnect', label: 'Konnect', emoji: '📱' },
];

const SLOTS = ['08:00–10:00', '10:00–12:00', '12:00–14:00', '14:00–16:00', '16:00–18:00', '18:00–20:00'];

export default function GroceryCheckoutScreen({ navigation, route }) {
  const items = route?.params?.items || [];
  const storeName = route?.params?.storeName || 'Votre magasin';

  const subtotal = items.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);
  const deliveryFee = subtotal >= 30 ? 0 : 3.5;
  const total = subtotal + deliveryFee;

  const [address, setAddress] = useState('');
  const [slot, setSlot] = useState('');
  const [payment, setPayment] = useState('wallet');
  const [promoCode, setPromoCode] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canOrder = address.trim() && slot;

  const handleOrder = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/api/grocery/orders', {
        items, address, slot, payment, promoCode, notes,
        subtotal, deliveryFee, total,
      });
      navigation.replace('GroceryCheckoutSuccess', {
        orderId: res.data?.orderId || `GRC-${Date.now().toString().slice(-6)}`,
        storeName, total,
      });
    } catch {
      Alert.alert('Erreur', 'Commande impossible. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🛒 Finaliser la commande</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Store */}
        <View style={styles.storeRow}>
          <Text style={{ fontSize: 24 }}>🏪</Text>
          <Text style={styles.storeName}>{storeName}</Text>
          <Text style={styles.itemCount}>{items.length} article(s)</Text>
        </View>

        {/* Items summary */}
        <Text style={styles.label}>Récapitulatif</Text>
        {items.slice(0, 4).map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={{ fontSize: 20 }}>{item.emoji || '📦'}</Text>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemQty}>×{item.qty || 1}</Text>
            <Text style={styles.itemPrice}>{((item.price) * (item.qty || 1)).toFixed(3)}</Text>
          </View>
        ))}
        {items.length > 4 && (
          <Text style={styles.moreItems}>+ {items.length - 4} article(s) supplémentaire(s)</Text>
        )}

        {/* Address */}
        <Text style={styles.label}>Adresse de livraison</Text>
        <TextInput
          style={styles.input}
          value={address} onChangeText={setAddress}
          placeholder="Votre adresse complète..."
          placeholderTextColor={COLORS.muted}
          multiline textAlignVertical="top"
          style={[styles.input, { minHeight: 60 }]}
        />

        {/* Slot */}
        <Text style={styles.label}>Créneau de livraison</Text>
        <View style={styles.slotGrid}>
          {SLOTS.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.slotBtn, slot === s && styles.slotBtnActive]}
              onPress={() => setSlot(s)}
            >
              <Text style={[styles.slotText, slot === s && { color: '#000' }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment */}
        <Text style={styles.label}>Paiement</Text>
        {PAYMENT_METHODS.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[styles.payRow, payment === m.key && styles.payRowActive]}
            onPress={() => setPayment(m.key)}
          >
            <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.payLabel, payment === m.key && { color: COLORS.white }]}>{m.label}</Text>
              {m.balance !== undefined && <Text style={styles.payBalance}>Solde : {m.balance.toFixed(3)} TND</Text>}
            </View>
            <View style={[styles.radio, payment === m.key && styles.radioActive]}>
              {payment === m.key && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Promo */}
        <Text style={styles.label}>Code promo (optionnel)</Text>
        <TextInput
          style={styles.input}
          value={promoCode} onChangeText={setPromoCode}
          placeholder="CODEPROMO" placeholderTextColor={COLORS.muted}
          autoCapitalize="characters" maxLength={16}
        />

        {/* Notes */}
        <Text style={styles.label}>Instructions (optionnel)</Text>
        <TextInput
          style={[styles.input, { minHeight: 60 }]}
          value={notes} onChangeText={setNotes}
          placeholder="Ex : Laisser devant la porte..." placeholderTextColor={COLORS.muted}
          multiline textAlignVertical="top"
        />

        {/* Total */}
        <View style={styles.totalCard}>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Sous-total</Text><Text style={styles.totalValue}>{subtotal.toFixed(3)} TND</Text></View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Livraison</Text>
            <Text style={[styles.totalValue, deliveryFee === 0 && { color: COLORS.green }]}>
              {deliveryFee === 0 ? 'Gratuite 🎉' : `${deliveryFee.toFixed(3)} TND`}
            </Text>
          </View>
          {deliveryFee === 0 && <Text style={styles.freeNote}>Livraison gratuite pour toute commande ≥ 30 TND</Text>}
          <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, marginTop: 4 }]}>
            <Text style={styles.totalFinal}>Total</Text>
            <Text style={styles.totalFinalValue}>{total.toFixed(3)} TND</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.orderBtn, !canOrder && { opacity: 0.4 }]}
          onPress={handleOrder}
          disabled={!canOrder || submitting}
        >
          {submitting
            ? <ActivityIndicator color="#000" size="small" />
            : <Text style={styles.orderBtnText}>✅ Passer la commande — {total.toFixed(3)} TND</Text>}
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  scroll: { padding: 16 },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  storeName: { flex: 1, color: COLORS.white, fontWeight: '700', fontSize: 14 },
  itemCount: { color: COLORS.muted, fontSize: 12 },
  label: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 14 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemName: { flex: 1, color: COLORS.white, fontSize: 13 },
  itemQty: { color: COLORS.muted, fontSize: 12 },
  itemPrice: { color: COLORS.accent, fontSize: 13, fontWeight: '700', minWidth: 60, textAlign: 'right' },
  moreItems: { color: COLORS.muted, fontSize: 12, marginTop: 6 },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, color: COLORS.white, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotBtn: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  slotBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  slotText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  payRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 8 },
  payRowActive: { borderColor: COLORS.accent, backgroundColor: '#1A1200' },
  payLabel: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
  payBalance: { color: COLORS.green, fontSize: 11, marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.muted, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent },
  totalCard: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginTop: 14 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalLabel: { color: COLORS.muted, fontSize: 14 },
  totalValue: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  freeNote: { color: COLORS.green, fontSize: 11, marginBottom: 6 },
  totalFinal: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  totalFinalValue: { color: COLORS.accent, fontSize: 18, fontWeight: '900' },
  orderBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  orderBtnText: { color: '#000', fontWeight: '900', fontSize: 15 },
});
