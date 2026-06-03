import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Animated, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  green: '#27AE60', greenDark: '#1E8449', greenLight: '#A9DFBF',
  white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  accent: '#F5A623', red: '#E74C3C',
};

const MOCK = {
  orderId: 'GRO-20240603-8821',
  storeName: 'Carrefour Market',
  items: [
    { name: 'Lait demi-écrémé 1L', qty: 2, price: 3.80 },
    { name: 'Pain de mie complet', qty: 1, price: 2.50 },
    { name: 'Yaourt nature x6', qty: 1, price: 5.20 },
    { name: 'Jus d\'orange 1L', qty: 3, price: 9.00 },
  ],
  subtotal: 20.50,
  delivery: 1.50,
  promo: { code: 'FRESH5', discount: 1.03 },
  total: 20.97,
  deliveryTime: '30–45 min',
  address: 'Av. Habib Bourguiba, Tunis',
  paymentMethod: 'Carte bancaire',
  estimatedArrival: '14:35',
};

export default function GroceryOrderSuccessScreen({ navigation, route }) {
  const data = route.params?.order || MOCK;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Ma commande EASYWAY #${data.orderId} est confirmée !\n${data.storeName} · ${data.deliveryTime}\nTotal : ${data.total.toFixed(2)} TND`,
      });
    } catch {}
  };

  const subtotal = data.items?.reduce((s, i) => s + i.qty * i.price, 0) ?? data.subtotal;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Success Badge */}
        <View style={styles.successSection}>
          <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.successIcon}>✓</Text>
          </Animated.View>
          <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
            <Text style={styles.successTitle}>Commande confirmée !</Text>
            <Text style={styles.successSub}>Votre commande est en préparation</Text>
            <View style={styles.orderIdBadge}>
              <Text style={styles.orderIdText}>{data.orderId}</Text>
            </View>
          </Animated.View>
        </View>

        {/* ETA Card */}
        <View style={styles.etaCard}>
          <View style={styles.etaItem}>
            <Text style={styles.etaEmoji}>🛵</Text>
            <Text style={styles.etaValue}>{data.deliveryTime}</Text>
            <Text style={styles.etaLabel}>Livraison estimée</Text>
          </View>
          <View style={styles.etaDivider} />
          <View style={styles.etaItem}>
            <Text style={styles.etaEmoji}>⏰</Text>
            <Text style={styles.etaValue}>{data.estimatedArrival}</Text>
            <Text style={styles.etaLabel}>Heure d'arrivée</Text>
          </View>
          <View style={styles.etaDivider} />
          <View style={styles.etaItem}>
            <Text style={styles.etaEmoji}>📍</Text>
            <Text style={styles.etaValue} numberOfLines={1}>{data.address?.split(',')[0]}</Text>
            <Text style={styles.etaLabel}>Adresse</Text>
          </View>
        </View>

        {/* Store & Payment */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🏪 Magasin</Text>
            <Text style={styles.infoValue}>{data.storeName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>💳 Paiement</Text>
            <Text style={styles.infoValue}>{data.paymentMethod}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📍 Livraison</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{data.address}</Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛒 Articles commandés</Text>
          {(data.items || []).map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={styles.itemQtyBadge}>
                <Text style={styles.itemQty}>{item.qty}</Text>
              </View>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.itemPrice}>{(item.qty * item.price).toFixed(2)} TND</Text>
            </View>
          ))}
        </View>

        {/* Fare Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Récapitulatif</Text>
          <View style={styles.fareCard}>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Sous-total</Text>
              <Text style={styles.fareValue}>{subtotal.toFixed(2)} TND</Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Livraison</Text>
              <Text style={[styles.fareValue, data.delivery === 0 && { color: COLORS.green }]}>
                {data.delivery === 0 ? 'GRATUITE' : `${data.delivery?.toFixed(2)} TND`}
              </Text>
            </View>
            {data.promo && (
              <View style={styles.fareRow}>
                <Text style={[styles.fareLabel, { color: COLORS.green }]}>Code {data.promo.code}</Text>
                <Text style={[styles.fareValue, { color: COLORS.green }]}>-{data.promo.discount.toFixed(2)} TND</Text>
              </View>
            )}
            <View style={styles.fareDivider} />
            <View style={styles.fareRow}>
              <Text style={styles.fareTotalLabel}>Total payé</Text>
              <Text style={styles.fareTotalValue}>{data.total.toFixed(2)} TND</Text>
            </View>
          </View>
        </View>

        {/* Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Suivi de commande</Text>
          {[
            { step: 'Commande reçue', done: true, time: 'Maintenant' },
            { step: 'En préparation', done: true, time: 'En cours' },
            { step: 'Prise en charge livreur', done: false, time: '~10 min' },
            { step: 'En route vers vous', done: false, time: '~20 min' },
            { step: 'Livré !', done: false, time: data.estimatedArrival },
          ].map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepDot, s.done && styles.stepDotDone]}>
                {s.done && <Text style={{ color: COLORS.white, fontSize: 10, fontWeight: '800' }}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepLabel, s.done && { color: COLORS.white }]}>{s.step}</Text>
              </View>
              <Text style={styles.stepTime}>{s.time}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnText}>📤 Partager</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => navigation.navigate('PackageTracking', { orderId: data.orderId })}
        >
          <Text style={styles.trackBtnText}>🛵 Suivre la livraison</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  successSection: { alignItems: 'center', paddingTop: 40, paddingBottom: 24 },
  successCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#0D2E0D', borderWidth: 3, borderColor: COLORS.green,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  successIcon: { color: COLORS.green, fontSize: 44, fontWeight: '900' },
  successTitle: { color: COLORS.white, fontSize: 24, fontWeight: '800', marginBottom: 6 },
  successSub: { color: COLORS.muted, fontSize: 14 },
  orderIdBadge: {
    backgroundColor: COLORS.surface, borderRadius: 8, paddingHorizontal: 14,
    paddingVertical: 6, marginTop: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  orderIdText: { color: COLORS.accent, fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  etaCard: {
    flexDirection: 'row', marginHorizontal: 16, borderRadius: 14,
    backgroundColor: '#0D2E0D', borderWidth: 1, borderColor: COLORS.green,
    padding: 16, marginBottom: 12,
  },
  etaItem: { flex: 1, alignItems: 'center' },
  etaEmoji: { fontSize: 22, marginBottom: 4 },
  etaValue: { color: COLORS.white, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  etaLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2, textAlign: 'center' },
  etaDivider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: 8 },
  infoCard: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 14,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    padding: 14, gap: 10,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { color: COLORS.muted, fontSize: 13 },
  infoValue: { color: COLORS.white, fontSize: 13, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },
  section: { marginHorizontal: 16, marginBottom: 12 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 10,
    padding: 12, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  itemQtyBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  itemQty: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  itemName: { flex: 1, color: COLORS.white, fontSize: 13 },
  itemPrice: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  fareCard: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  fareLabel: { color: COLORS.muted, fontSize: 14 },
  fareValue: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  fareDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  fareTotalLabel: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  fareTotalValue: { color: COLORS.green, fontSize: 18, fontWeight: '900' },
  stepRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 12,
  },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotDone: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  stepLabel: { color: COLORS.muted, fontSize: 13 },
  stepTime: { color: COLORS.accent, fontSize: 12, fontWeight: '600' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10, padding: 16,
    backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  shareBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 14, alignItems: 'center', backgroundColor: COLORS.surface,
  },
  shareBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  trackBtn: {
    flex: 2, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', backgroundColor: COLORS.green,
  },
  trackBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
});
