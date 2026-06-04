import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', blue: '#3498DB',
};

const STEPS = [
  { key: 'CONFIRMED', icon: '✅', label: 'Commande confirmée', sub: 'Le magasin a accepté votre commande' },
  { key: 'PREPARING', icon: '🛒', label: 'En préparation', sub: 'On rassemble vos articles' },
  { key: 'READY', icon: '📦', label: 'Prête pour la livraison', sub: 'Un livreur va être assigné' },
  { key: 'PICKED_UP', icon: '🚴', label: 'En route', sub: 'Votre livreur est parti' },
  { key: 'DELIVERED', icon: '🎉', label: 'Livré !', sub: 'Commande remise avec succès' },
];

const MOCK_ORDER = {
  id: 'GRO-4821',
  status: 'PICKED_UP',
  storeName: 'Monoprix El Manar',
  livreurName: 'Sami K.',
  eta: '12 min',
  items: [
    { name: 'Lait Délice 1L', qty: 2, price: 3.600 },
    { name: 'Pain de mie', qty: 1, price: 2.800 },
    { name: 'Eau minérale 1.5L x6', qty: 1, price: 5.400 },
    { name: 'Yaourt nature x4', qty: 1, price: 4.200 },
  ],
  deliveryFee: 2.500,
  total: 18.500,
};

export default function GroceryOrderTrackingScreen({ navigation, route }) {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api.get('/api/grocery/orders/' + (orderId || 'GRO-4821'))
      .then(r => setOrder(r.data || MOCK_ORDER))
      .catch(() => setOrder(MOCK_ORDER))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const currentStepIdx = order ? STEPS.findIndex(s => s.key === order.status) : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  const o = order || MOCK_ORDER;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛒 Suivi commande</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.orderId}>#{o.id}</Text>
          <Text style={styles.storeName}>{o.storeName}</Text>
          {o.status === 'PICKED_UP' && o.eta && (
            <View style={styles.etaBadge}>
              <Text style={styles.etaText}>⏱ Livraison estimée : {o.eta}</Text>
            </View>
          )}
        </View>

        {o.livreurName && o.status !== 'DELIVERED' && (
          <View style={styles.livreurCard}>
            <Text style={{ fontSize: 32 }}>🚴</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.livreurName}>{o.livreurName}</Text>
              <Text style={styles.livreurSub}>Votre livreur</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Text style={styles.callBtnText}>📞 Appeler</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.stepsCard}>
          {STEPS.map((step, i) => {
            const done = i <= currentStepIdx;
            const current = i === currentStepIdx;
            return (
              <View key={step.key} style={styles.stepRow}>
                <View style={{ alignItems: 'center', width: 36 }}>
                  <View style={[styles.stepCircle, done && styles.stepCircleDone, current && styles.stepCircleCurrent]}>
                    <Text style={styles.stepIcon}>{done ? step.icon : '○'}</Text>
                  </View>
                  {i < STEPS.length - 1 && (
                    <View style={[styles.stepLine, i < currentStepIdx && styles.stepLineDone]} />
                  )}
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepLabel, !done && { color: COLORS.muted }]}>{step.label}</Text>
                  {current && <Text style={styles.stepSub}>{step.sub}</Text>}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>ARTICLES ({o.items.length})</Text>
          {o.items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemQty}>{item.qty}×</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{(item.qty * item.price).toFixed(3)} TND</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={[styles.itemName, { color: COLORS.muted }]}>Frais de livraison</Text>
            <Text style={styles.itemPrice}>{o.deliveryFee.toFixed(3)} TND</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={[styles.itemName, { fontWeight: '800' }]}>Total</Text>
            <Text style={[styles.itemPrice, { color: COLORS.accent, fontSize: 16 }]}>{o.total.toFixed(3)} TND</Text>
          </View>
        </View>

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
  backBtn: { padding: 4 },
  backText: { color: COLORS.accent, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  scroll: { padding: 16 },
  heroCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 20,
    alignItems: 'center', marginBottom: 12,
    borderWidth: 1.5, borderColor: COLORS.accent + '40',
  },
  orderId: { color: COLORS.muted, fontSize: 13, marginBottom: 4 },
  storeName: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 10 },
  etaBadge: { backgroundColor: COLORS.green + '20', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  etaText: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  livreurCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  livreurName: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  livreurSub: { color: COLORS.muted, fontSize: 12 },
  callBtn: { backgroundColor: COLORS.accent + '20', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  callBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  stepsCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  stepRow: { flexDirection: 'row', gap: 12, minHeight: 52 },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.bg, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepCircleDone: { borderColor: COLORS.green, backgroundColor: COLORS.green + '20' },
  stepCircleCurrent: { borderColor: COLORS.accent },
  stepIcon: { fontSize: 14 },
  stepLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginVertical: 2 },
  stepLineDone: { backgroundColor: COLORS.green },
  stepContent: { flex: 1, paddingTop: 6, paddingBottom: 8 },
  stepLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  stepSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  itemQty: { color: COLORS.accent, fontSize: 13, fontWeight: '700', width: 28 },
  itemName: { flex: 1, color: COLORS.text, fontSize: 13 },
  itemPrice: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
});
