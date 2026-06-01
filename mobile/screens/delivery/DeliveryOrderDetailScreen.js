import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  green: '#27AE60',
  orange: '#F57C00',
  accent: '#D32F2F',
  blue: '#1565C0',
};

const STEPS = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];
const STEP_LABELS = {
  PENDING: 'Commande reçue',
  ACCEPTED: 'Commande acceptée',
  IN_PROGRESS: 'En cours de livraison',
  COMPLETED: 'Livrée',
};
const STEP_ICONS = {
  PENDING: '📋',
  ACCEPTED: '🍽',
  IN_PROGRESS: '🛵',
  COMPLETED: '✅',
};
const STATUS_COLOR = {
  PENDING: COLORS.orange,
  ACCEPTED: COLORS.blue,
  IN_PROGRESS: COLORS.green,
  COMPLETED: COLORS.green,
  CANCELLED: COLORS.accent,
};

function Row({ label, value, valueColor }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, valueColor ? { color: valueColor } : null]}>{value || '—'}</Text>
    </View>
  );
}

function DeliveryTimeline({ status }) {
  if (status === 'CANCELLED') {
    return <Text style={{ color: COLORS.accent, fontWeight: '700', fontSize: 14, padding: 4 }}>❌ Commande annulée</Text>;
  }
  const idx = STEPS.indexOf(status);
  return (
    <View>
      {STEPS.map((step, i) => {
        const done = i <= idx;
        const active = i === idx;
        return (
          <View key={step} style={t.row}>
            <View style={t.left}>
              <View style={[t.dot, done && t.dotDone, active && t.dotActive]}>
                <Text style={{ fontSize: 12 }}>{done ? STEP_ICONS[step] : ' '}</Text>
              </View>
              {i < STEPS.length - 1 && <View style={[t.line, done && t.lineDone]} />}
            </View>
            <Text style={[t.label, done && t.labelDone, active && t.labelActive]}>
              {STEP_LABELS[step]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const t = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  left: { alignItems: 'center', width: 32 },
  dot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  dotDone: { backgroundColor: COLORS.green + '22', borderColor: COLORS.green },
  dotActive: { backgroundColor: COLORS.orange + '22', borderColor: COLORS.orange },
  line: { width: 2, height: 24, backgroundColor: COLORS.border, marginVertical: 1 },
  lineDone: { backgroundColor: COLORS.green },
  label: { color: COLORS.muted, fontSize: 13, marginLeft: 12, marginBottom: 18, paddingTop: 4 },
  labelDone: { color: COLORS.text },
  labelActive: { color: COLORS.orange, fontWeight: '700' },
});

export default function DeliveryOrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/orders/${orderId}`);
      setOrder(res.data.order || res.data);
    } catch {
      Alert.alert('Erreur', 'Commande introuvable.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = () => {
    Alert.alert('Annuler la commande ?', 'Cette action est irréversible.', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Annuler la commande',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await api.patch(`/api/orders/${orderId}/cancel`, { reason: 'Annulé par le client' });
            Alert.alert('Commande annulée');
            load();
          } catch (e) {
            Alert.alert('Erreur', e?.response?.data?.error || 'Impossible d\'annuler.');
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={COLORS.green} size="large" />
      </View>
    );
  }
  if (!order) return null;

  const meta = order.metadata || {};
  const isCancelled = order.status === 'CANCELLED';
  const isCompleted = order.status === 'COMPLETED';
  const isPending = order.status === 'PENDING';
  const statusColor = STATUS_COLOR[order.status] || COLORS.muted;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>🛵 Commande #{order.id.slice(-6).toUpperCase()}</Text>
          <Text style={[s.statusLine, { color: statusColor }]}>● {order.status === 'PENDING' ? 'En attente' : order.status === 'ACCEPTED' ? 'Acceptée' : order.status === 'IN_PROGRESS' ? 'En cours' : order.status === 'COMPLETED' ? 'Livrée' : 'Annulée'}</Text>
        </View>
        {!isCancelled && !isCompleted && (
          <TouchableOpacity onPress={() => navigation.navigate('DeliveryTracking', { orderId })}>
            <Text style={s.trackBtn}>📍 Suivre</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Timeline */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Suivi de commande</Text>
          <View style={s.card}>
            <DeliveryTimeline status={order.status} />
          </View>
        </View>

        {/* Merchant */}
        {order.provider && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Marchand</Text>
            <View style={s.card}>
              <Row label="Boutique" value={order.provider.name} />
              <Row label="Téléphone" value={order.provider.phone} />
            </View>
          </View>
        )}

        {/* Delivery address */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Livraison</Text>
          <View style={s.card}>
            {meta.deliveryAddress && <Row label="Adresse" value={meta.deliveryAddress} />}
            {meta.note && <Row label="Note" value={meta.note} />}
            {meta.estimatedTime && <Row label="Temps estimé" value={`~${meta.estimatedTime} min`} />}
          </View>
        </View>

        {/* Items */}
        {meta.items?.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Articles ({meta.items.length})</Text>
            <View style={s.card}>
              {meta.items.map((item, i) => (
                <View key={i} style={s.itemRow}>
                  <Text style={s.itemQty}>{item.quantity}×</Text>
                  <Text style={s.itemName}>{item.name}</Text>
                  <Text style={s.itemPrice}>{(item.lineTotal || 0).toFixed(3)} TND</Text>
                </View>
              ))}
              <View style={[s.row, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border }]}>
                <Text style={[s.rowLabel, { fontWeight: '700' }]}>Total</Text>
                <Text style={[s.rowValue, { color: COLORS.green }]}>{parseFloat(order.price || 0).toFixed(3)} TND</Text>
              </View>
            </View>
          </View>
        )}

        {/* Payment */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Paiement</Text>
          <View style={s.card}>
            <Row label="Méthode" value={meta.paymentMethod || 'Cash'} />
            <Row label="Montant total" value={`${parseFloat(order.price || 0).toFixed(3)} TND`} valueColor={COLORS.green} />
          </View>
        </View>

        {/* Actions */}
        <View style={s.actionsSection}>
          {isPending && (
            <TouchableOpacity style={s.cancelBtn} onPress={handleCancel} disabled={cancelling}>
              {cancelling ? <ActivityIndicator color={COLORS.accent} size="small" /> : <Text style={s.cancelBtnTxt}>❌ Annuler la commande</Text>}
            </TouchableOpacity>
          )}
          {isCompleted && (
            <>
              <TouchableOpacity style={s.invoiceBtn} onPress={() => navigation.navigate('Invoice', { orderId })}>
                <Text style={s.invoiceBtnTxt}>🧾 Télécharger la facture</Text>
              </TouchableOpacity>
              {!order.rating && (
                <TouchableOpacity style={s.rateBtn} onPress={() => navigation.navigate('TipAndRating', { orderId, serviceType: 'DELIVERY' })}>
                  <Text style={s.rateBtnTxt}>⭐ Évaluer cette livraison</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  statusLine: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  trackBtn: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  section: { marginHorizontal: 16, marginTop: 16 },
  sectionTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { color: COLORS.muted, fontSize: 13 },
  rowValue: { color: COLORS.text, fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3 },
  itemQty: { color: COLORS.green, fontWeight: '700', fontSize: 13, marginRight: 8, width: 24 },
  itemName: { color: COLORS.text, fontSize: 13, flex: 1 },
  itemPrice: { color: COLORS.muted, fontSize: 13 },
  actionsSection: { marginHorizontal: 16, marginTop: 16, gap: 10 },
  cancelBtn: { backgroundColor: COLORS.accent + '22', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.accent },
  cancelBtnTxt: { color: COLORS.accent, fontWeight: '700', fontSize: 14 },
  invoiceBtn: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  invoiceBtnTxt: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
  rateBtn: { backgroundColor: COLORS.green, borderRadius: 12, padding: 14, alignItems: 'center' },
  rateBtnTxt: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
