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
  Image,
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
  orange: '#F57C00',
  green: '#27AE60',
  accent: '#D32F2F',
  blue: '#1565C0',
};

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ';

const STEPS = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];
const STEP_ICONS = { PENDING: '📋', ACCEPTED: '🚕', IN_PROGRESS: '🏎', COMPLETED: '🏁' };
const STEP_LABELS = { PENDING: 'Demande envoyée', ACCEPTED: 'Chauffeur en route', IN_PROGRESS: 'En course', COMPLETED: 'Arrivé' };
const STATUS_COLOR = { PENDING: COLORS.orange, ACCEPTED: COLORS.blue, IN_PROGRESS: COLORS.green, COMPLETED: COLORS.green, CANCELLED: COLORS.accent };

function Row({ label, value, valueColor }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, valueColor ? { color: valueColor } : null]}>{value || '—'}</Text>
    </View>
  );
}

function TripTimeline({ status }) {
  if (status === 'CANCELLED') return <Text style={{ color: COLORS.accent, fontWeight: '700', fontSize: 14 }}>❌ Course annulée</Text>;
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
                <Text style={{ fontSize: 11 }}>{done ? STEP_ICONS[step] : ' '}</Text>
              </View>
              {i < STEPS.length - 1 && <View style={[t.line, done && t.lineDone]} />}
            </View>
            <Text style={[t.label, done && t.labelDone, active && t.labelActive]}>{STEP_LABELS[step]}</Text>
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
  dotDone: { backgroundColor: COLORS.orange + '22', borderColor: COLORS.orange },
  dotActive: { backgroundColor: COLORS.orange, borderColor: COLORS.orange },
  line: { width: 2, height: 22, backgroundColor: COLORS.border, marginVertical: 1 },
  lineDone: { backgroundColor: COLORS.orange },
  label: { color: COLORS.muted, fontSize: 13, marginLeft: 12, marginBottom: 16, paddingTop: 4 },
  labelDone: { color: COLORS.text },
  labelActive: { color: COLORS.orange, fontWeight: '700' },
});

export default function TaxiOrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/orders/${orderId}`);
      setOrder(res.data.order || res.data);
    } catch {
      Alert.alert('Erreur', 'Course introuvable.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = () => {
    Alert.alert('Annuler la course ?', null, [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Annuler', style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await api.patch(`/api/orders/${orderId}/cancel`, { reason: 'Annulé par le client' });
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

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.orange} size="large" /></View>;
  if (!order) return null;

  const meta = order.metadata || {};
  const isCancelled = order.status === 'CANCELLED';
  const isCompleted = order.status === 'COMPLETED';
  const statusColor = STATUS_COLOR[order.status] || COLORS.muted;

  // Build Mapbox static map URL
  let mapUrl = null;
  if (meta.pickupLng && meta.pickupLat && meta.destinationLng && meta.destinationLat) {
    const pins = `pin-s+F57C00(${meta.pickupLng},${meta.pickupLat}),pin-s+27AE60(${meta.destinationLng},${meta.destinationLat})`;
    const bounds = `[${Math.min(meta.pickupLng, meta.destinationLng) - 0.01},${Math.min(meta.pickupLat, meta.destinationLat) - 0.01},${Math.max(meta.pickupLng, meta.destinationLng) + 0.01},${Math.max(meta.pickupLat, meta.destinationLat) + 0.01}]`;
    mapUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${pins}/auto/360x160?padding=40&access_token=${MAPBOX_TOKEN}`;
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>🚕 Course #{order.id.slice(-6).toUpperCase()}</Text>
          <Text style={[s.statusLine, { color: statusColor }]}>● {STEP_LABELS[order.status] || order.status}</Text>
        </View>
        {!isCancelled && !isCompleted && (
          <TouchableOpacity onPress={() => navigation.navigate('TaxiTracking', { orderId })}>
            <Text style={s.trackBtn}>📍 Carte</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Map preview */}
        {mapUrl && (
          <Image source={{ uri: mapUrl }} style={s.mapPreview} resizeMode="cover" />
        )}

        {/* Route */}
        <View style={s.routeCard}>
          <View style={s.routeRow}>
            <View style={[s.routeDot, { backgroundColor: COLORS.orange }]} />
            <View style={{ flex: 1 }}>
              <Text style={s.routeLabel}>Départ</Text>
              <Text style={s.routeAddress}>{meta.pickupAddress || '—'}</Text>
            </View>
          </View>
          <View style={s.routeLine} />
          <View style={s.routeRow}>
            <View style={[s.routeDot, { backgroundColor: COLORS.green }]} />
            <View style={{ flex: 1 }}>
              <Text style={s.routeLabel}>Destination</Text>
              <Text style={s.routeAddress}>{meta.deliveryAddress || meta.destination || '—'}</Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Progression</Text>
          <View style={s.card}><TripTimeline status={order.status} /></View>
        </View>

        {/* Driver */}
        {order.provider && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Chauffeur</Text>
            <View style={s.card}>
              <Row label="Nom" value={order.provider.name} />
              <Row label="Téléphone" value={order.provider.phone} />
              {order.provider.vehicleModel && <Row label="Véhicule" value={order.provider.vehicleModel} />}
              {order.provider.licensePlate && <Row label="Immatriculation" value={order.provider.licensePlate} />}
              {order.provider.rating && <Row label="Note" value={`⭐ ${parseFloat(order.provider.rating).toFixed(1)}`} />}
            </View>
          </View>
        )}

        {/* Fare breakdown */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Détail du tarif</Text>
          <View style={s.card}>
            {meta.baseFare != null && <Row label="Tarif de base" value={`${parseFloat(meta.baseFare).toFixed(3)} TND`} />}
            {meta.distanceFare != null && <Row label="Distance ({meta.distance} km)" value={`${parseFloat(meta.distanceFare).toFixed(3)} TND`} />}
            {meta.timeFare != null && <Row label="Durée ({meta.duration} min)" value={`${parseFloat(meta.timeFare).toFixed(3)} TND`} />}
            {meta.surge != null && meta.surge > 1 && <Row label="Multiplicateur surge" value={`×${meta.surge}`} valueColor={COLORS.orange} />}
            {order.tip > 0 && <Row label="Pourboire" value={`${parseFloat(order.tip).toFixed(3)} TND`} valueColor={COLORS.orange} />}
            <View style={[s.row, { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: COLORS.border }]}>
              <Text style={[s.rowLabel, { fontWeight: '700', color: COLORS.text }]}>Total</Text>
              <Text style={[s.rowValue, { color: COLORS.green, fontSize: 16 }]}>{parseFloat(order.price || 0).toFixed(3)} TND</Text>
            </View>
          </View>
        </View>

        {/* Payment */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Paiement</Text>
          <View style={s.card}>
            <Row label="Méthode" value={meta.paymentMethod || 'Cash'} />
            <Row label="Date" value={new Date(order.createdAt).toLocaleString('fr-TN')} />
          </View>
        </View>

        {/* Actions */}
        <View style={s.actionsSection}>
          {order.status === 'PENDING' && (
            <TouchableOpacity style={s.cancelBtn} onPress={handleCancel} disabled={cancelling}>
              {cancelling ? <ActivityIndicator color={COLORS.accent} size="small" /> : <Text style={s.cancelBtnTxt}>❌ Annuler la course</Text>}
            </TouchableOpacity>
          )}
          {isCompleted && (
            <>
              {!order.rating && (
                <TouchableOpacity style={s.rateBtn} onPress={() => navigation.navigate('TipAndRating', { orderId, serviceType: 'TAXI' })}>
                  <Text style={s.rateBtnTxt}>⭐ Évaluer le chauffeur</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={s.invoiceBtn} onPress={() => navigation.navigate('Invoice', { orderId })}>
                <Text style={s.invoiceBtnTxt}>🧾 Télécharger la facture</Text>
              </TouchableOpacity>
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
  trackBtn: { color: COLORS.orange, fontSize: 13, fontWeight: '700' },
  mapPreview: { width: '100%', height: 160, backgroundColor: COLORS.surfaceAlt },
  routeCard: { backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 16, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  routeDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  routeLine: { width: 2, height: 20, backgroundColor: COLORS.border, marginLeft: 5, marginVertical: 4 },
  routeLabel: { color: COLORS.muted, fontSize: 11, marginBottom: 2 },
  routeAddress: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
  section: { marginHorizontal: 16, marginTop: 16 },
  sectionTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { color: COLORS.muted, fontSize: 13 },
  rowValue: { color: COLORS.text, fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  actionsSection: { marginHorizontal: 16, marginTop: 16, gap: 10 },
  cancelBtn: { backgroundColor: COLORS.accent + '22', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.accent },
  cancelBtnTxt: { color: COLORS.accent, fontWeight: '700', fontSize: 14 },
  rateBtn: { backgroundColor: COLORS.orange, borderRadius: 12, padding: 14, alignItems: 'center' },
  rateBtnTxt: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  invoiceBtn: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  invoiceBtnTxt: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
});
