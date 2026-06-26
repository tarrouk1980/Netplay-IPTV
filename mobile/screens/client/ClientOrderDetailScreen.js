import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const STATUS_STEPS = [
  { key: 'confirmed', icon: '✅', label: 'Confirmée' },
  { key: 'preparing', icon: '👨‍🍳', label: 'Préparation' },
  { key: 'delivering', icon: '🛵', label: 'En livraison' },
  { key: 'delivered', icon: '🎉', label: 'Livrée' },
];

const STATUS_TO_STEP = { PENDING: 'confirmed', ACCEPTED: 'confirmed', IN_PROGRESS: 'delivering', COMPLETED: 'delivered', CANCELLED: 'delivered', DISPUTED: 'delivered' };

function fmtDateParts(iso) {
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch {
    return { date: '', time: '' };
  }
}

export default function ClientOrderDetailScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId) { setError(true); setLoading(false); return; }
    api.get(`/api/orders/${orderId}`)
      .then(r => {
        const o = r.data.order;
        const { date, time } = fmtDateParts(o.completedAt || o.createdAt);
        setOrder({
          id: o.id,
          status: STATUS_TO_STEP[o.status] || 'confirmed',
          merchant: { name: o.originAddress || 'Adresse de départ' },
          provider: o.provider ? { name: o.provider.name, phone: o.provider.phone, rating: o.provider.avgRating } : null,
          deliveryAddress: o.destinationAddress,
          total: o.finalPrice ?? o.price ?? 0,
          paymentMethod: o.metadata?.payment?.method || null,
          date,
          placedAt: time,
        });
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleShare = async () => {
    if (!order) return;
    try {
      await Share.share({ message: `Ma commande EasyWay ${order.id} — ${order.total.toFixed(3)} TND chez ${order.merchant.name}` });
    } catch {}
  };

  const submitDispute = async (disputeType) => {
    if (!order) return;
    try {
      await api.post(`/api/orders/${order.id}/dispute`, {
        disputeType,
        urgency: 'low',
        description: `${disputeType} — signalé depuis l'application mobile pour la commande ${order.id}.`,
      });
      Alert.alert('✅ Signalement envoyé', 'Notre équipe va examiner votre commande sous peu.');
    } catch (err) {
      console.error('[ClientOrderDetailScreen] dispute submission failed', err);
      Alert.alert('Erreur', "Impossible d'envoyer votre signalement pour le moment. Réessayez.");
    }
  };

  const handleDispute = () => {
    Alert.alert('Signaler un problème', 'Quel est le problème avec cette commande ?', [
      { text: 'Commande incomplète', onPress: () => submitDispute('incomplete_order') },
      { text: 'Mauvaise commande', onPress: () => submitDispute('wrong_order') },
      { text: 'Qualité insatisfaisante', onPress: () => submitDispute('quality_issue') },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const currentStepIdx = order ? STATUS_STEPS.findIndex(s => s.key === order.status) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📦 Commande</Text>
        <TouchableOpacity onPress={handleShare} style={{ width: 40, alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 20 }}>📤</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : error || !order ? (
        <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 30 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
            Impossible de charger cette commande.
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Retour</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

          {/* Order ref + ETA */}
          <View style={styles.refCard}>
            <View>
              <Text style={styles.refId}>{order.id}</Text>
              <Text style={styles.refDate}>{order.date} à {order.placedAt}</Text>
            </View>
            {order.status === 'delivering' && order.eta && (
              <View style={styles.etaBadge}>
                <Text style={styles.etaText}>🛵 {order.eta}</Text>
              </View>
            )}
          </View>

          {/* Progress tracker */}
          <View style={styles.progressCard}>
            {STATUS_STEPS.map((step, i) => {
              const done = i < currentStepIdx;
              const active = i === currentStepIdx;
              return (
                <View key={step.key} style={styles.stepRow}>
                  <View style={styles.stepLeft}>
                    <View style={[styles.stepCircle,
                      done && { backgroundColor: COLORS.green },
                      active && { backgroundColor: COLORS.accent },
                    ]}>
                      <Text style={{ fontSize: 12 }}>{done ? '✓' : step.icon}</Text>
                    </View>
                    {i < STATUS_STEPS.length - 1 && (
                      <View style={[styles.stepLine, done && { backgroundColor: COLORS.green }]} />
                    )}
                  </View>
                  <Text style={[styles.stepLabel,
                    active && { color: COLORS.accent, fontWeight: '800' },
                    done && { color: COLORS.green },
                  ]}>
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Provider */}
          {(order.status === 'delivering' || order.status === 'delivered') && order.provider && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PRESTATAIRE</Text>
              <View style={styles.livreurCard}>
                <View style={styles.livreurAvatar}><Text style={{ fontSize: 22 }}>🛵</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.livreurName}>{order.provider.name}</Text>
                  {!!order.provider.rating && <Text style={styles.livreurRating}>⭐ {order.provider.rating.toFixed?.(1) ?? order.provider.rating}</Text>}
                </View>
              </View>
            </View>
          )}

          {/* Addresses */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ADRESSES</Text>
            <View style={styles.infoCard}>
              <Text style={styles.merchantName}>📍 {order.merchant.name}</Text>
              {!!order.deliveryAddress && <Text style={styles.merchantAddr}>🏁 {order.deliveryAddress}</Text>}
            </View>
          </View>

          {/* Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RÉCAPITULATIF</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={styles.totalVal}>{order.total.toFixed(3)} TND</Text>
              </View>
              {!!order.paymentMethod && <Text style={styles.paymentMethod}>💳 {order.paymentMethod}</Text>}
            </View>
          </View>

          {/* Actions */}
          {order.status === 'delivered' && (
            <TouchableOpacity style={styles.disputeBtn} onPress={handleDispute}>
              <Text style={styles.disputeBtnText}>⚠️ Signaler un problème</Text>
            </TouchableOpacity>
          )}

          <View style={styles.commissionNote}>
            <Text style={styles.commissionText}>✅ EasyWay 0% commission — prix identiques au restaurant</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  refCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  refId: { color: COLORS.accent, fontSize: 14, fontWeight: '800' },
  refDate: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  etaBadge: { backgroundColor: COLORS.orange + '20', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.orange + '50' },
  etaText: { color: COLORS.orange, fontSize: 13, fontWeight: '800' },
  progressCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepLeft: { alignItems: 'center', width: 28 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  stepLine: { width: 2, height: 22, backgroundColor: COLORS.border, marginVertical: 3 },
  stepLabel: { color: COLORS.muted, fontSize: 13, paddingTop: 5 },
  section: { marginBottom: 16 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 },
  livreurCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  livreurAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  livreurName: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  livreurRating: { color: COLORS.accent, fontSize: 12, marginTop: 2 },
  callBtn: { padding: 8 },
  infoCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  merchantName: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  merchantAddr: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  itemsCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  itemRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemQty: { color: COLORS.accent, fontSize: 13, fontWeight: '800', width: 28 },
  itemName: { color: COLORS.text, fontSize: 13, flex: 1 },
  itemPrice: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  noteRow: { paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 4 },
  noteText: { color: COLORS.orange, fontSize: 12 },
  summaryCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: COLORS.muted, fontSize: 13 },
  summaryVal: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  summaryDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  totalLabel: { color: COLORS.text, fontSize: 15, fontWeight: '900' },
  totalVal: { color: COLORS.accent, fontSize: 18, fontWeight: '900' },
  paymentMethod: { color: COLORS.muted, fontSize: 12, marginTop: 8 },
  disputeBtn: { borderRadius: 14, borderWidth: 1, borderColor: COLORS.red + '50', paddingVertical: 13, alignItems: 'center', marginBottom: 14 },
  disputeBtnText: { color: COLORS.red, fontSize: 13, fontWeight: '700' },
  commissionNote: { backgroundColor: COLORS.green + '10', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.green + '30' },
  commissionText: { color: COLORS.green, fontSize: 12, textAlign: 'center' },
});
