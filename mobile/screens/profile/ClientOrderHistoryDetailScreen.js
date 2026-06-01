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
  accent: '#D32F2F',
  green: '#27AE60',
  orange: '#F57C00',
  blue: '#1565C0',
};

const STATUS_STEPS = {
  TAXI: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'],
  DELIVERY: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'],
  SOS: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'],
  GROCERY: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'],
};

const STATUS_LABEL = {
  PENDING: 'En attente',
  ACCEPTED: 'Accepté',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
};

const SERVICE_ICON = {
  TAXI: '🚕',
  DELIVERY: '🛵',
  SOS: '🛻',
  GROCERY: '🛒',
};

function Timeline({ steps, currentStatus }) {
  const currentIdx = steps.indexOf(currentStatus);
  return (
    <View style={t.wrapper}>
      {steps.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <View key={step} style={t.row}>
            <View style={t.left}>
              <View style={[t.dot, done && t.dotDone, active && t.dotActive]} />
              {i < steps.length - 1 && <View style={[t.line, done && t.lineDone]} />}
            </View>
            <Text style={[t.label, done && t.labelDone, active && t.labelActive]}>
              {STATUS_LABEL[step] || step}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const t = StyleSheet.create({
  wrapper: { paddingLeft: 4, marginVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0 },
  left: { alignItems: 'center', width: 24 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.surfaceAlt, borderWidth: 2, borderColor: COLORS.border },
  dotDone: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  dotActive: { backgroundColor: COLORS.orange, borderColor: COLORS.orange },
  line: { width: 2, height: 28, backgroundColor: COLORS.border },
  lineDone: { backgroundColor: COLORS.green },
  label: { color: COLORS.muted, fontSize: 13, marginLeft: 10, marginBottom: 16 },
  labelDone: { color: COLORS.text },
  labelActive: { color: COLORS.orange, fontWeight: '700' },
});

function Row({ label, value, valueColor }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, valueColor ? { color: valueColor } : null]}>{value || '—'}</Text>
    </View>
  );
}

export default function ClientOrderHistoryDetailScreen({ route, navigation }) {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

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

  const handleRate = () => {
    navigation.navigate('TipAndRating', { orderId, serviceType: order?.serviceType });
  };

  const handleInvoice = () => {
    navigation.navigate('Invoice', { orderId });
  };

  const handleReorder = async () => {
    if (!order) return;
    Alert.alert('Recommander ?', 'Relancer une commande similaire ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Continuer',
        onPress: () => {
          const screen = {
            TAXI: 'TaxiHome',
            DELIVERY: 'DeliveryHome',
            SOS: 'SOSHome',
            GROCERY: 'GroceryHome',
          }[order.serviceType] || 'Home';
          navigation.navigate(screen);
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
  const steps = STATUS_STEPS[order.serviceType] || STATUS_STEPS.TAXI;
  const isCancelled = order.status === 'CANCELLED';
  const isCompleted = order.status === 'COMPLETED';

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>
            {SERVICE_ICON[order.serviceType] || '📦'} Commande #{order.id.slice(-6).toUpperCase()}
          </Text>
          <Text style={[s.statusBadge, { color: isCompleted ? COLORS.green : isCancelled ? COLORS.accent : COLORS.orange }]}>
            ● {STATUS_LABEL[order.status] || order.status}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Timeline */}
        {!isCancelled && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Progression</Text>
            <View style={s.card}>
              <Timeline steps={steps} currentStatus={order.status} />
            </View>
          </View>
        )}

        {/* Order info */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Détails</Text>
          <View style={s.card}>
            <Row label="Service" value={order.serviceType} />
            <Row label="Date" value={new Date(order.createdAt).toLocaleString('fr-TN')} />
            <Row label="Montant total" value={`${parseFloat(order.price || 0).toFixed(3)} TND`} valueColor={COLORS.green} />
            {meta.pickupAddress && <Row label="Départ" value={meta.pickupAddress} />}
            {meta.deliveryAddress && <Row label="Destination" value={meta.deliveryAddress} />}
            {meta.distance && <Row label="Distance" value={`${meta.distance} km`} />}
            {meta.duration && <Row label="Durée" value={`${meta.duration} min`} />}
            {order.tip > 0 && <Row label="Pourboire" value={`${parseFloat(order.tip).toFixed(3)} TND`} valueColor={COLORS.orange} />}
          </View>
        </View>

        {/* Provider info */}
        {order.provider && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Prestataire</Text>
            <View style={s.card}>
              <Row label="Nom" value={order.provider.name} />
              <Row label="Téléphone" value={order.provider.phone} />
              {order.provider.rating && <Row label="Note" value={`⭐ ${parseFloat(order.provider.rating).toFixed(1)}`} />}
            </View>
          </View>
        )}

        {/* Items for grocery/delivery */}
        {meta.items?.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Articles commandés</Text>
            <View style={s.card}>
              {meta.items.map((item, i) => (
                <View key={i} style={s.itemRow}>
                  <Text style={s.itemQty}>{item.quantity}×</Text>
                  <Text style={s.itemName}>{item.name}</Text>
                  <Text style={s.itemPrice}>{(item.lineTotal || 0).toFixed(3)} TND</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Payment info */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Paiement</Text>
          <View style={s.card}>
            <Row label="Méthode" value={meta.paymentMethod || 'Cash'} />
            <Row label="Statut paiement" value={order.paymentStatus || 'PAID'} valueColor={COLORS.green} />
          </View>
        </View>

        {/* Actions */}
        <View style={s.actionsSection}>
          {isCompleted && !order.rating && (
            <TouchableOpacity style={s.actionBtn} onPress={handleRate}>
              <Text style={s.actionBtnTxt}>⭐ Évaluer cette course</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[s.actionBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={handleInvoice}>
            <Text style={[s.actionBtnTxt, { color: COLORS.text }]}>🧾 Voir la facture</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, { backgroundColor: COLORS.blue + '22', borderColor: COLORS.blue }]} onPress={handleReorder}>
            <Text style={[s.actionBtnTxt, { color: COLORS.blue }]}>🔁 Commander à nouveau</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  statusBadge: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  section: { marginHorizontal: 16, marginTop: 16 },
  sectionTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { color: COLORS.muted, fontSize: 13 },
  rowValue: { color: COLORS.text, fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3 },
  itemQty: { color: COLORS.green, fontWeight: '700', fontSize: 13, marginRight: 8, width: 24 },
  itemName: { color: COLORS.text, fontSize: 13, flex: 1 },
  itemPrice: { color: COLORS.muted, fontSize: 13 },
  actionsSection: { marginHorizontal: 16, marginTop: 16, gap: 10 },
  actionBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  actionBtnTxt: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
