import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#8E44AD', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', orange: '#E67E22', blue: '#3498DB',
};

const STEPS = [
  { key: 'CONFIRMED', label: 'Commande confirmée', icon: '✅', desc: 'Votre commande a été reçue' },
  { key: 'PREPARING', label: 'Préparation en cours', icon: '🛒', desc: 'Un coursier prépare vos articles' },
  { key: 'PICKED_UP', label: 'Articles récupérés', icon: '📦', desc: 'Le livreur est en route' },
  { key: 'DELIVERING', label: 'En livraison', icon: '🛵', desc: 'Votre commande arrive' },
  { key: 'DELIVERED', label: 'Livré !', icon: '🎉', desc: 'Profitez de vos courses !' },
];

const MOCK_ORDER = {
  id: 'GRO-5521',
  status: 'DELIVERING',
  store: 'Monoprix La Marsa',
  items: [
    { name: 'Eau minérale 6x1.5L', qty: 1, price: 4.2 },
    { name: 'Pain de mie', qty: 2, price: 3.8 },
    { name: 'Yaourt nature x4', qty: 1, price: 5.5 },
    { name: 'Tomates 1kg', qty: 1, price: 2.1 },
  ],
  livreur: { name: 'Sami T.', phone: '+216 22 345 678', rating: 4.8 },
  total: 15.6,
  deliveryFee: 2.0,
  eta: '8 min',
  address: '12 Rue de la Paix, La Marsa',
};

export default function GroceryOrderTrackingScreen({ navigation, route }) {
  const { orderId } = route?.params || {};
  const [order, setOrder] = useState(MOCK_ORDER);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);

  useEffect(() => {
    if (orderId) fetchOrder();
    intervalRef.current = setInterval(() => { if (orderId) fetchOrder(); }, 15000);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
    return () => clearInterval(intervalRef.current);
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/api/grocery/orders/${orderId}`);
      if (res.data?.order) setOrder(res.data.order);
    } catch {}
  };

  const currentStepIdx = STEPS.findIndex(s => s.key === order.status);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suivi commande</Text>
        <Text style={styles.orderId}>{order.id}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* ETA hero */}
        {order.status !== 'DELIVERED' && (
          <View style={styles.etaCard}>
            <Animated.Text style={[styles.etaIcon, { transform: [{ scale: pulseAnim }] }]}>🛵</Animated.Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.etaLabel}>Livraison estimée dans</Text>
              <Text style={styles.etaTime}>{order.eta}</Text>
              <Text style={styles.etaAddr} numberOfLines={1}>📍 {order.address}</Text>
            </View>
          </View>
        )}

        {/* Steps */}
        <View style={styles.stepsCard}>
          {STEPS.map((step, i) => {
            const done = i <= currentStepIdx;
            const current = i === currentStepIdx;
            return (
              <View key={step.key} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <View style={[styles.stepDot, done && { backgroundColor: COLORS.accent }, current && { borderColor: COLORS.accent }]}>
                    {done && <Text style={{ fontSize: 10 }}>{step.icon}</Text>}
                  </View>
                  {i < STEPS.length - 1 && <View style={[styles.stepLine, done && { backgroundColor: COLORS.accent }]} />}
                </View>
                <View style={[styles.stepContent, i < STEPS.length - 1 && { paddingBottom: 20 }]}>
                  <Text style={[styles.stepLabel, !done && { color: COLORS.muted }]}>{step.label}</Text>
                  {current && <Text style={styles.stepDesc}>{step.desc}</Text>}
                </View>
              </View>
            );
          })}
        </View>

        {/* Livreur */}
        {order.livreur && order.status !== 'CONFIRMED' && order.status !== 'PREPARING' && (
          <View style={styles.livreurCard}>
            <View style={styles.livreurAvatar}>
              <Text style={{ fontSize: 24 }}>🛵</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.livreurName}>{order.livreur.name}</Text>
              <Text style={styles.livreurRating}>⭐ {order.livreur.rating} · Livreur</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Text style={{ fontSize: 20 }}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chatBtn}>
              <Text style={{ fontSize: 20 }}>💬</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Order summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>🛒 {order.store}</Text>
          {order.items?.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemQty}>{item.qty}x</Text>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.itemPrice}>{(item.price * item.qty).toFixed(2)} TND</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <View style={styles.divider} />
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>Livraison</Text>
              <Text style={styles.totalVal}>{order.deliveryFee?.toFixed(2)} TND</Text>
            </View>
            <View style={styles.totalLine}>
              <Text style={[styles.totalLabel, { color: COLORS.white, fontWeight: '700' }]}>Total</Text>
              <Text style={[styles.totalVal, { color: COLORS.accent, fontSize: 16, fontWeight: '900' }]}>
                {(order.total + order.deliveryFee).toFixed(2)} TND
              </Text>
            </View>
          </View>
        </View>

        {order.status === 'DELIVERED' && (
          <TouchableOpacity style={styles.rateBtn} onPress={() => navigation.navigate('GroceryHome')}>
            <Text style={styles.rateBtnText}>⭐ Noter la livraison</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  orderId: { color: COLORS.muted, fontSize: 12 },
  etaCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.accent + '18', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.accent + '44' },
  etaIcon: { fontSize: 36 },
  etaLabel: { color: COLORS.muted, fontSize: 12 },
  etaTime: { color: COLORS.accent, fontSize: 28, fontWeight: '900' },
  etaAddr: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  stepsCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  stepRow: { flexDirection: 'row', gap: 12 },
  stepLeft: { alignItems: 'center', width: 28 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surfaceAlt, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  stepLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginTop: 4 },
  stepContent: { flex: 1, paddingTop: 4 },
  stepLabel: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  stepDesc: { color: COLORS.accent, fontSize: 11, marginTop: 2 },
  livreurCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  livreurAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.accent + '22', alignItems: 'center', justifyContent: 'center' },
  livreurName: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  livreurRating: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  callBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.green + '22', alignItems: 'center', justifyContent: 'center' },
  chatBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.blue + '22', alignItems: 'center', justifyContent: 'center' },
  summaryCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  summaryTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  itemQty: { color: COLORS.accent, fontSize: 12, fontWeight: '700', width: 24 },
  itemName: { color: COLORS.white, fontSize: 13, flex: 1 },
  itemPrice: { color: COLORS.muted, fontSize: 12 },
  totalRow: { marginTop: 8 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  totalLabel: { color: COLORS.muted, fontSize: 13 },
  totalVal: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  rateBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  rateBtnText: { color: '#FFF', fontSize: 15, fontWeight: '900' },
});
