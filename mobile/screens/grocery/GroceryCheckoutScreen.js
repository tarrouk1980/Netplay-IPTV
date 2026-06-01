import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useLocationStore from '../../store/locationStore';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  accent: '#27AE60',
  orange: '#F5A623',
  red: '#E74C3C',
  blue: '#3498DB',
};

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ';

const PAYMENT_METHODS = [
  { key: 'WALLET',   icon: '💳', label: 'Wallet EASYWAY', sub: 'Solde disponible' },
  { key: 'CASH',     icon: '💵', label: 'Espèces',        sub: 'Payer à la livraison' },
  { key: 'CARD',     icon: '🏦', label: 'Carte bancaire', sub: 'Visa / Mastercard' },
];

function buildSlots() {
  const slots = [];
  const now = new Date();
  for (let d = 0; d < 3; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() + d);
    const dayLabel = d === 0 ? "Aujourd'hui" : d === 1 ? 'Demain' : day.toLocaleDateString('fr-FR', { weekday: 'long' });
    const hours = d === 0
      ? [10, 12, 14, 16, 18, 20].filter(h => h > now.getHours() + 1)
      : [9, 11, 13, 15, 17, 19, 21];
    hours.forEach(h => {
      slots.push({
        key: `${day.toISOString().slice(0, 10)}_${h}`,
        dayLabel,
        time: `${String(h).padStart(2, '0')}:00 – ${String(h + 1).padStart(2, '0')}:00`,
        date: day.toISOString().slice(0, 10),
        hour: h,
      });
    });
  }
  return slots;
}

async function geocode(query) {
  if (!query || query.length < 3) return [];
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=TN&language=fr&limit=4&access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.features || []).map(f => ({ name: f.place_name, lat: f.center[1], lng: f.center[0] }));
  } catch { return []; }
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function GroceryCheckoutScreen({ route, navigation }) {
  const { cart = [], merchantId, merchantName, deliveryFee = 2.0 } = route.params || {};
  const { location } = useLocationStore();

  const SLOTS = buildSlots();

  const [step, setStep] = useState(1); // 1=slot, 2=address, 3=payment, 4=confirm
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [address, setAddress] = useState('');
  const [addressQuery, setAddressQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [addressCoords, setAddressCoords] = useState(null);
  const [addrTimer, setAddrTimer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('WALLET');
  const [walletBalance, setWalletBalance] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((s, item) => s + item.price * item.quantity, 0);
  const total = subtotal + deliveryFee;

  useEffect(() => {
    api.get('/api/wallet/balance').then(r => setWalletBalance(r.data?.balance)).catch(() => {});
  }, []);

  const handleAddressInput = text => {
    setAddressQuery(text);
    clearTimeout(addrTimer);
    setAddrTimer(setTimeout(async () => {
      const results = await geocode(text);
      setSuggestions(results);
    }, 400));
  };

  const handleBook = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/grocery/orders', {
        merchantId,
        items: cart.map(i => ({ productId: i.id, name: i.name, quantity: i.quantity, price: i.price })),
        deliveryAddress: address,
        deliveryLat: addressCoords?.lat,
        deliveryLng: addressCoords?.lng,
        deliverySlot: `${selectedSlot?.date}T${String(selectedSlot?.hour).padStart(2, '0')}:00:00`,
        paymentMethod,
        note,
        totalAmount: total,
      });
      navigation.replace('GroceryTracking', { orderId: res.data?.order?.id });
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Commande échouée');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Créneau', 'Adresse', 'Paiement', 'Confirmer'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(s => s - 1) : navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛒 Commander</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Step bar */}
      <View style={styles.stepBar}>
        {steps.map((s, i) => (
          <View key={i} style={styles.stepBarItem}>
            <View style={[styles.stepBarCircle, step > i + 1 && styles.stepDone, step === i + 1 && styles.stepActive]}>
              <Text style={[styles.stepBarNum, step >= i + 1 && { color: step === i + 1 ? COLORS.orange : COLORS.accent }]}>
                {step > i + 1 ? '✓' : i + 1}
              </Text>
            </View>
            <Text style={[styles.stepBarLabel, step === i + 1 && { color: COLORS.orange }]}>{s}</Text>
            {i < steps.length - 1 && <View style={[styles.stepBarLine, step > i + 1 && styles.stepBarLineDone]} />}
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Step 1: Delivery slot */}
        {step === 1 && (
          <Section title="Choisir un créneau de livraison">
            {(() => {
              let lastDay = '';
              return SLOTS.map(slot => {
                const showDay = slot.dayLabel !== lastDay;
                lastDay = slot.dayLabel;
                return (
                  <React.Fragment key={slot.key}>
                    {showDay && <Text style={styles.dayHeader}>{slot.dayLabel}</Text>}
                    <TouchableOpacity
                      style={[styles.slotChip, selectedSlot?.key === slot.key && styles.slotChipActive]}
                      onPress={() => setSelectedSlot(slot)}
                    >
                      <Text style={[styles.slotIcon, selectedSlot?.key === slot.key && { color: COLORS.accent }]}>🕐</Text>
                      <Text style={[styles.slotText, selectedSlot?.key === slot.key && { color: COLORS.accent, fontWeight: '700' }]}>
                        {slot.time}
                      </Text>
                      {selectedSlot?.key === slot.key && <Text style={styles.slotCheck}>✓</Text>}
                    </TouchableOpacity>
                  </React.Fragment>
                );
              });
            })()}
            <TouchableOpacity
              style={[styles.nextBtn, !selectedSlot && styles.nextBtnDisabled]}
              disabled={!selectedSlot}
              onPress={() => setStep(2)}
            >
              <Text style={styles.nextBtnText}>Suivant → Adresse</Text>
            </TouchableOpacity>
          </Section>
        )}

        {/* Step 2: Address */}
        {step === 2 && (
          <Section title="Adresse de livraison">
            <TextInput
              style={styles.addrInput}
              value={addressQuery}
              onChangeText={handleAddressInput}
              placeholder="Chercher votre adresse en Tunisie…"
              placeholderTextColor={COLORS.muted}
            />
            {suggestions.length > 0 && (
              <View style={styles.suggestions}>
                {suggestions.map((s, i) => (
                  <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => {
                    setAddress(s.name);
                    setAddressQuery(s.name);
                    setAddressCoords({ lat: s.lat, lng: s.lng });
                    setSuggestions([]);
                  }}>
                    <Text style={styles.suggestionText} numberOfLines={1}>📍 {s.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {address ? (
              <View style={styles.selectedAddr}>
                <Text style={styles.selectedAddrLabel}>✅ Adresse sélectionnée</Text>
                <Text style={styles.selectedAddrText} numberOfLines={2}>{address}</Text>
              </View>
            ) : null}
            <Text style={styles.inputLabel}>Instructions supplémentaires (optionnel)</Text>
            <TextInput
              style={[styles.addrInput, { height: 70 }]}
              value={note}
              onChangeText={setNote}
              placeholder="Ex: 3ème étage, code portail 1234..."
              placeholderTextColor={COLORS.muted}
              multiline
            />
            <TouchableOpacity
              style={[styles.nextBtn, !address && styles.nextBtnDisabled]}
              disabled={!address}
              onPress={() => setStep(3)}
            >
              <Text style={styles.nextBtnText}>Suivant → Paiement</Text>
            </TouchableOpacity>
          </Section>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <Section title="Mode de paiement">
            {PAYMENT_METHODS.map(pm => (
              <TouchableOpacity
                key={pm.key}
                style={[styles.payRow, paymentMethod === pm.key && styles.payRowActive]}
                onPress={() => setPaymentMethod(pm.key)}
              >
                <Text style={styles.payIcon}>{pm.icon}</Text>
                <View style={styles.payInfo}>
                  <Text style={[styles.payLabel, paymentMethod === pm.key && { color: COLORS.accent }]}>{pm.label}</Text>
                  <Text style={styles.paySub}>
                    {pm.key === 'WALLET' && walletBalance !== null
                      ? `Solde: ${walletBalance.toFixed(3)} TND`
                      : pm.sub}
                  </Text>
                </View>
                <View style={[styles.radio, paymentMethod === pm.key && styles.radioActive]}>
                  {paymentMethod === pm.key && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
            {paymentMethod === 'WALLET' && walletBalance !== null && walletBalance < total && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>⚠️ Solde insuffisant ({walletBalance.toFixed(3)} TND). Veuillez recharger votre wallet.</Text>
              </View>
            )}
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(4)}>
              <Text style={styles.nextBtnText}>Suivant → Confirmer</Text>
            </TouchableOpacity>
          </Section>
        )}

        {/* Step 4: Summary */}
        {step === 4 && (
          <>
            <Section title="Récapitulatif de la commande">
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>📦 Marchand</Text><Text style={styles.summaryVal}>{merchantName || '—'}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>🕐 Créneau</Text><Text style={styles.summaryVal}>{selectedSlot?.dayLabel} {selectedSlot?.time}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>📍 Adresse</Text><Text style={styles.summaryVal} numberOfLines={2}>{address}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>💳 Paiement</Text><Text style={styles.summaryVal}>{PAYMENT_METHODS.find(p => p.key === paymentMethod)?.label}</Text></View>
            </Section>

            <Section title="Articles">
              {cart.map((item, i) => (
                <View key={i} style={styles.cartRow}>
                  <Text style={styles.cartQty}>{item.quantity}×</Text>
                  <Text style={styles.cartName}>{item.name}</Text>
                  <Text style={styles.cartPrice}>{(item.price * item.quantity).toFixed(3)} TND</Text>
                </View>
              ))}
              <View style={styles.divider} />
              <View style={styles.cartRow}><Text style={styles.cartName}>Sous-total</Text><Text style={styles.cartPrice}>{subtotal.toFixed(3)} TND</Text></View>
              <View style={styles.cartRow}><Text style={styles.cartName}>🛵 Livraison</Text><Text style={styles.cartPrice}>{deliveryFee.toFixed(3)} TND</Text></View>
              <View style={[styles.cartRow, { marginTop: 8 }]}>
                <Text style={[styles.cartName, { fontWeight: '900', color: COLORS.text, fontSize: 15 }]}>Total</Text>
                <Text style={[styles.cartPrice, { color: COLORS.orange, fontWeight: '900', fontSize: 16 }]}>{total.toFixed(3)} TND</Text>
              </View>
            </Section>

            <TouchableOpacity
              style={[styles.bookBtn, loading && styles.bookBtnLoading]}
              onPress={handleBook}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.bookBtnText}>✅ Confirmer la commande</Text>}
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  stepBar: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  stepBarItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  stepBarCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.bg, borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepDone: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '22' },
  stepActive: { borderColor: COLORS.orange },
  stepBarNum: { color: COLORS.muted, fontSize: 11, fontWeight: '700' },
  stepBarLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', marginLeft: 4 },
  stepBarLine: { flex: 1, height: 1.5, backgroundColor: COLORS.border, marginHorizontal: 4 },
  stepBarLineDone: { backgroundColor: COLORS.accent },
  scroll: { padding: 16 },
  section: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 14 },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  dayHeader: { color: COLORS.orange, fontSize: 12, fontWeight: '700', marginTop: 10, marginBottom: 6 },
  slotChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.bg, marginBottom: 6,
  },
  slotChipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '12' },
  slotIcon: { fontSize: 16, color: COLORS.muted },
  slotText: { flex: 1, color: COLORS.text, fontSize: 13 },
  slotCheck: { color: COLORS.accent, fontWeight: '800' },
  nextBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginTop: 12,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  addrInput: {
    backgroundColor: COLORS.bg, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.text, fontSize: 14, padding: 12, marginBottom: 6,
  },
  suggestions: { backgroundColor: COLORS.bg, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  suggestionText: { color: COLORS.text, fontSize: 13 },
  selectedAddr: { backgroundColor: COLORS.accent + '12', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.accent },
  selectedAddrLabel: { color: COLORS.accent, fontSize: 11, fontWeight: '700', marginBottom: 4 },
  selectedAddrText: { color: COLORS.text, fontSize: 13 },
  inputLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 4 },
  payRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.bg, marginBottom: 8,
  },
  payRowActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '08' },
  payIcon: { fontSize: 24 },
  payInfo: { flex: 1 },
  payLabel: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  paySub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent },
  warningBox: { backgroundColor: '#2A1A0A', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: COLORS.orange, marginBottom: 8 },
  warningText: { color: COLORS.orange, fontSize: 12 },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  summaryLabel: { color: COLORS.muted, fontSize: 13 },
  summaryVal: { color: COLORS.text, fontSize: 13, fontWeight: '600', flex: 1, textAlign: 'right' },
  cartRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  cartQty: { color: COLORS.accent, fontWeight: '700', width: 28, fontSize: 13 },
  cartName: { flex: 1, color: COLORS.muted, fontSize: 13 },
  cartPrice: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  bookBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  bookBtnLoading: { opacity: 0.7 },
  bookBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});
