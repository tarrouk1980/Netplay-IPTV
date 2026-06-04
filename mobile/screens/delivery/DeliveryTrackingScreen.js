import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  Animated, Alert, Linking, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const STEPS = [
  { key: 'CONFIRMED', label: 'Confirmée', icon: '✅' },
  { key: 'PREPARING', label: 'Préparation', icon: '👨‍🍳' },
  { key: 'READY', label: 'Prête', icon: '📦' },
  { key: 'PICKED_UP', label: 'Récupérée', icon: '🛵' },
  { key: 'DELIVERED', label: 'Livrée', icon: '🏠' },
];

const STATUS_IDX = {
  CONFIRMED: 0, ACCEPTED: 0, PREPARING: 1, READY: 2,
  PICKED_UP: 3, DELIVERING: 3, DELIVERED: 4,
};

function ProgressSteps({ status }) {
  const idx = STATUS_IDX[status] ?? 0;
  return (
    <View style={styles.stepsRow}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s.key}>
          <View style={styles.stepCol}>
            <View style={[styles.stepCircle, i <= idx && styles.stepCircleActive]}>
              <Text style={{ fontSize: 14 }}>{i <= idx ? s.icon : '·'}</Text>
            </View>
            <Text style={[styles.stepLabel, i <= idx && styles.stepLabelActive]} numberOfLines={1}>
              {s.label}
            </Text>
          </View>
          {i < STEPS.length - 1 && (
            <View style={[styles.stepConnector, i < idx && styles.stepConnectorActive]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

export default function DeliveryTrackingScreen({ navigation, route }) {
  const { orderId } = route?.params || {};
  const [order, setOrder] = useState(null);
  const [eta, setEta] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const animatePulse = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start(() => animatePulse());
  }, [pulseAnim]);

  useEffect(() => { animatePulse(); }, [animatePulse]);

  useEffect(() => {
    if (!orderId) return;
    const poll = setInterval(async () => {
      try {
        const res = await api.get(`/api/delivery/orders/${orderId}`);
        setOrder(res.data.order || res.data);
        if (res.data.order?.eta) setEta(res.data.order.eta);
        if (res.data.order?.status === 'DELIVERED') {
          clearInterval(poll);
          setTimeout(() => navigation.replace('Home'), 3000);
        }
      } catch {}
    }, 8000);
    api.get(`/api/delivery/orders/${orderId}`)
      .then(r => { setOrder(r.data.order || r.data); if (r.data.order?.eta) setEta(r.data.order.eta); })
      .catch(() => {});
    return () => clearInterval(poll);
  }, [orderId]);

  const status = order?.status || 'CONFIRMED';
  const livreur = order?.livreur;
  const isDelivered = status === 'DELIVERED';

  const handleCallLivreur = () => {
    const phone = livreur?.phone;
    if (phone) Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  const handleCancel = () => {
    if (['PICKED_UP', 'DELIVERING', 'DELIVERED'].includes(status)) {
      Alert.alert('Annulation impossible', 'La livraison est déjà en route.');
      return;
    }
    Alert.alert('Annuler la commande ?', '', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Annuler', style: 'destructive', onPress: async () => {
          try {
            await api.post(`/api/delivery/orders/${orderId}/cancel`);
            navigation.replace('Home');
          } catch { Alert.alert('Erreur', "Impossible d'annuler."); }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suivi de livraison</Text>
        <View style={{ width: 40 }} />
      </View>

      <ProgressSteps status={status} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Status hero */}
        <View style={styles.statusHero}>
          <Animated.Text style={[styles.statusEmoji, { transform: [{ scale: isDelivered ? 1 : pulseAnim }] }]}>
            {isDelivered ? '🎉' : STATUS_IDX[status] >= 3 ? '🛵' : STATUS_IDX[status] >= 2 ? '📦' : '👨‍🍳'}
          </Animated.Text>
          <Text style={styles.statusText}>
            {isDelivered ? 'Livraison effectuée !' :
              STATUS_IDX[status] >= 3 ? 'Livreur en route vers vous' :
              STATUS_IDX[status] >= 2 ? 'Commande prête, récupération en cours' :
              'Votre commande est en préparation'}
          </Text>
          {eta && !isDelivered && (
            <Text style={styles.etaText}>⏱ Arrivée estimée dans {eta} min</Text>
          )}
        </View>

        {/* Livreur card */}
        {livreur && STATUS_IDX[status] >= 3 && (
          <View style={styles.livreurCard}>
            <View style={[styles.livreurAvatar, { backgroundColor: COLORS.blue + '25' }]}>
              <Text style={{ fontSize: 22 }}>🛵</Text>
            </View>
            <View style={styles.livreurInfo}>
              <Text style={styles.livreurName}>{livreur.name || 'Livreur'}</Text>
              <Text style={styles.livreurRating}>★ {livreur.rating || '4.8'} · {livreur.totalDeliveries || 0} livraisons</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} onPress={handleCallLivreur}>
              <Text style={{ fontSize: 20 }}>📞</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Order summary */}
        {order?.items && (
          <View style={styles.orderCard}>
            <Text style={styles.orderCardTitle}>VOTRE COMMANDE</Text>
            {order.items.map((item, i) => (
              <View key={i} style={styles.orderItem}>
                <Text style={styles.orderItemQty}>{item.qty}×</Text>
                <Text style={styles.orderItemName}>{item.name}</Text>
                <Text style={styles.orderItemPrice}>{(item.qty * item.price).toFixed(3)} TND</Text>
              </View>
            ))}
            <View style={styles.orderTotal}>
              <Text style={styles.orderTotalLabel}>Total payé</Text>
              <Text style={styles.orderTotalValue}>{order.total?.toFixed(3) || '—'} TND</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        {!isDelivered && !['PICKED_UP', 'DELIVERING'].includes(status) && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>✕ Annuler la commande</Text>
          </TouchableOpacity>
        )}

        {isDelivered && (
          <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.replace('Home')}>
            <Text style={styles.homeBtnText}>Retour à l'accueil</Text>
          </TouchableOpacity>
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
  stepsRow: {
    flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  stepCol: { alignItems: 'center', width: 52 },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  stepCircleActive: { backgroundColor: COLORS.accent + '30', borderColor: COLORS.accent },
  stepLabel: { color: COLORS.muted, fontSize: 9, textAlign: 'center', marginTop: 4 },
  stepLabelActive: { color: COLORS.accent },
  stepConnector: { flex: 1, height: 1, backgroundColor: COLORS.border, marginTop: 16 },
  stepConnectorActive: { backgroundColor: COLORS.accent },
  scroll: { padding: 16 },
  statusHero: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 28,
    alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  statusEmoji: { fontSize: 52, marginBottom: 12 },
  statusText: { color: COLORS.text, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  etaText: { color: COLORS.accent, fontSize: 14, fontWeight: '700', marginTop: 8 },
  livreurCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 14,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  livreurAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  livreurInfo: { flex: 1 },
  livreurName: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  livreurRating: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  callBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.green + '20', alignItems: 'center', justifyContent: 'center',
  },
  orderCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  orderCardTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  orderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 8 },
  orderItemQty: { color: COLORS.accent, fontSize: 13, fontWeight: '700', width: 24 },
  orderItemName: { flex: 1, color: COLORS.text, fontSize: 13 },
  orderItemPrice: { color: COLORS.muted, fontSize: 13 },
  orderTotal: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 8, paddingTop: 10,
  },
  orderTotalLabel: { color: COLORS.muted, fontSize: 13 },
  orderTotalValue: { color: COLORS.accent, fontSize: 14, fontWeight: '800' },
  cancelBtn: {
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.red,
    paddingVertical: 12, alignItems: 'center', marginBottom: 8,
  },
  cancelBtnText: { color: COLORS.red, fontSize: 14, fontWeight: '700' },
  homeBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  homeBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
});
