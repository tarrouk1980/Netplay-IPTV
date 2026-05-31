import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  green: '#27AE60',
  accent: '#D32F2F',
  amber: '#F57C00',
  info: '#3498DB',
};

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ';

const STATUS_COLORS = {
  PENDING: COLORS.amber,
  ACCEPTED: COLORS.info,
  IN_PROGRESS: COLORS.accent,
  COMPLETED: COLORS.green,
  CANCELLED: COLORS.muted,
};

const STATUS_LABELS = {
  PENDING: 'En attente',
  ACCEPTED: 'Acceptée',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
};

const SERVICE_ICON = { TAXI: '🚕', SOS: '🛻', DELIVERY: '🛵', GROCERY: '🛒' };

const MOCK_ORDER = {
  id: 'ord_demo_001',
  type: 'TAXI',
  status: 'COMPLETED',
  price: 8.500,
  createdAt: new Date(Date.now() - 7200000).toISOString(),
  completedAt: new Date(Date.now() - 3600000).toISOString(),
  originAddress: 'Avenue Habib Bourguiba, Tunis',
  destinationAddress: 'Aéroport Tunis-Carthage',
  originLat: 36.8065, originLng: 10.1815,
  destLat: 36.8510, destLng: 10.2275,
  client: { id: 'c1', name: 'Sonia Trabelsi', phone: '+216 98 765 432', rating: 4.5 },
  provider: { id: 'p1', name: 'Tarek Ben Ali', phone: '+216 55 123 456', rating: 4.8, vehicle: 'Peugeot 301 · TU-1234' },
  timeline: [
    { status: 'PENDING', at: new Date(Date.now() - 7200000).toISOString(), label: 'Commande créée' },
    { status: 'ACCEPTED', at: new Date(Date.now() - 6900000).toISOString(), label: 'Acceptée par Tarek' },
    { status: 'IN_PROGRESS', at: new Date(Date.now() - 6600000).toISOString(), label: 'Course démarrée' },
    { status: 'COMPLETED', at: new Date(Date.now() - 3600000).toISOString(), label: 'Course terminée' },
  ],
  rating: 5,
  ratingComment: 'Chauffeur très ponctuel et aimable.',
  cancelledBy: null,
  cancelReason: null,
};

function TimelineItem({ item, isLast }) {
  const color = STATUS_COLORS[item.status] || COLORS.muted;
  const time = new Date(item.at).toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' });
  return (
    <View style={styles.tlItem}>
      <View style={styles.tlLeft}>
        <View style={[styles.tlDot, { backgroundColor: color }]} />
        {!isLast && <View style={styles.tlLine} />}
      </View>
      <View style={styles.tlRight}>
        <Text style={styles.tlLabel}>{item.label}</Text>
        <Text style={styles.tlTime}>{time}</Text>
      </View>
    </View>
  );
}

export default function AdminOrderDetailScreen({ navigation, route }) {
  const { orderId } = route?.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    if (!orderId) { setOrder(MOCK_ORDER); setLoading(false); return; }
    api.get(`/api/admin/orders/${orderId}`)
      .then(r => setOrder(r.data?.order || MOCK_ORDER))
      .catch(() => setOrder(MOCK_ORDER))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleForceCancel = () => {
    Alert.alert('Annuler la commande', 'Forcer l\'annulation de cette commande ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Annuler', style: 'destructive',
        onPress: async () => {
          setActioning(true);
          try {
            await api.post(`/api/admin/orders/${order.id}/cancel`, { reason: 'Annulation admin' });
            setOrder(o => ({ ...o, status: 'CANCELLED' }));
          } catch (err) {
            Alert.alert('Erreur', err?.response?.data?.error || 'Action impossible.');
          } finally {
            setActioning(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (!order) return null;

  const statusColor = STATUS_COLORS[order.status] || COLORS.muted;
  const duration = order.completedAt && order.createdAt
    ? Math.round((new Date(order.completedAt) - new Date(order.createdAt)) / 60000)
    : null;

  // Map URL (origin → destination)
  const mapUrl = order.originLat
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+4A9EFF(${order.originLng},${order.originLat}),pin-s+27AE60(${order.destLng || order.originLng},${order.destLat || order.originLat})/${((order.originLng + (order.destLng || order.originLng)) / 2).toFixed(4)},${((order.originLat + (order.destLat || order.originLat)) / 2).toFixed(4)},12/360x180@2x?access_token=${MAPBOX_TOKEN}`
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail commande</Text>
        {['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(order.status) && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleForceCancel} disabled={actioning}>
            {actioning ? <ActivityIndicator color={COLORS.accent} size="small" /> : <Text style={styles.cancelBtnText}>Annuler</Text>}
          </TouchableOpacity>
        )}
        {!['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(order.status) && <View style={{ width: 60 }} />}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroIcon}>{SERVICE_ICON[order.type] || '📦'}</Text>
          <View style={styles.heroInfo}>
            <Text style={styles.heroId}>#{order.id?.slice(-8)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>{STATUS_LABELS[order.status]}</Text>
            </View>
          </View>
          <Text style={styles.heroPrice}>{Number(order.price || 0).toFixed(3)} TND</Text>
        </View>

        {/* Map */}
        {mapUrl && !mapError && (
          <View style={styles.mapBox}>
            <Image source={{ uri: mapUrl }} style={styles.mapImg} resizeMode="cover" onError={() => setMapError(true)} />
          </View>
        )}

        {/* Addresses */}
        {order.originAddress && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📍 Trajet</Text>
            <View style={styles.addrRow}>
              <View style={[styles.addrDot, { backgroundColor: COLORS.info }]} />
              <Text style={styles.addrText}>{order.originAddress}</Text>
            </View>
            {order.destinationAddress && (
              <>
                <View style={styles.addrStem} />
                <View style={styles.addrRow}>
                  <View style={[styles.addrDot, { backgroundColor: COLORS.green }]} />
                  <Text style={styles.addrText}>{order.destinationAddress}</Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statNum}>{new Date(order.createdAt).toLocaleDateString('fr-TN', { day: '2-digit', month: 'short' })}</Text>
            <Text style={styles.statLbl}>Date</Text>
          </View>
          {duration && (
            <View style={styles.statChip}>
              <Text style={styles.statNum}>{duration} min</Text>
              <Text style={styles.statLbl}>Durée</Text>
            </View>
          )}
          <View style={styles.statChip}>
            <Text style={[styles.statNum, { color: statusColor }]}>{STATUS_LABELS[order.status]}</Text>
            <Text style={styles.statLbl}>Statut</Text>
          </View>
        </View>

        {/* Client */}
        {order.client && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>👤 Client</Text>
            <View style={styles.personRow}>
              <View style={styles.personAvatar}><Text style={styles.personAvatarText}>👤</Text></View>
              <View style={styles.personInfo}>
                <Text style={styles.personName}>{order.client.name}</Text>
                <Text style={styles.personPhone}>{order.client.phone}</Text>
                {order.client.rating && <Text style={styles.personRating}>⭐ {order.client.rating?.toFixed(1)}</Text>}
              </View>
            </View>
          </View>
        )}

        {/* Provider */}
        {order.provider && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{SERVICE_ICON[order.type] || '🛠'} Prestataire</Text>
            <View style={styles.personRow}>
              <View style={[styles.personAvatar, { backgroundColor: COLORS.accent + '22' }]}><Text style={styles.personAvatarText}>{SERVICE_ICON[order.type] || '🛠'}</Text></View>
              <View style={styles.personInfo}>
                <Text style={styles.personName}>{order.provider.name}</Text>
                <Text style={styles.personPhone}>{order.provider.phone}</Text>
                {order.provider.vehicle && <Text style={styles.personRating}>🚗 {order.provider.vehicle}</Text>}
                {order.provider.rating && <Text style={styles.personRating}>⭐ {order.provider.rating?.toFixed(1)}</Text>}
              </View>
            </View>
          </View>
        )}

        {/* Timeline */}
        {order.timeline?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 Timeline</Text>
            {order.timeline.map((t, i) => (
              <TimelineItem key={i} item={t} isLast={i === order.timeline.length - 1} />
            ))}
          </View>
        )}

        {/* Rating */}
        {order.rating && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⭐ Évaluation client</Text>
            <Text style={styles.ratingStars}>{'★'.repeat(order.rating)}{'☆'.repeat(5 - order.rating)}</Text>
            {order.ratingComment && <Text style={styles.ratingComment}>"{order.ratingComment}"</Text>}
          </View>
        )}

        {/* Cancellation */}
        {order.status === 'CANCELLED' && order.cancelReason && (
          <View style={[styles.card, { borderColor: COLORS.accent + '60' }]}>
            <Text style={[styles.cardTitle, { color: COLORS.accent }]}>❌ Annulation</Text>
            <Text style={styles.cancelReason}>{order.cancelReason}</Text>
            {order.cancelledBy && <Text style={styles.cancelledBy}>Par: {order.cancelledBy}</Text>}
          </View>
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
  cancelBtn: { backgroundColor: COLORS.accent + '22', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  cancelBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  scroll: { padding: 16 },
  heroCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  heroIcon: { fontSize: 36 },
  heroInfo: { flex: 1, gap: 6 },
  heroId: { color: COLORS.muted, fontSize: 13, fontFamily: 'monospace' },
  statusBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  heroPrice: { color: COLORS.green, fontSize: 22, fontWeight: '900' },
  mapBox: { borderRadius: 14, overflow: 'hidden', marginBottom: 14, height: 180 },
  mapImg: { width: '100%', height: 180 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 12 },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  addrDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  addrStem: { width: 2, height: 16, backgroundColor: COLORS.border, marginLeft: 4, marginBottom: 4 },
  addrText: { color: COLORS.text, fontSize: 13, flex: 1, lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statChip: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 10,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statNum: { color: COLORS.text, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  statLbl: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  personAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  personAvatarText: { fontSize: 22 },
  personInfo: { flex: 1 },
  personName: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  personPhone: { color: COLORS.muted, fontSize: 12, marginBottom: 2 },
  personRating: { color: COLORS.muted, fontSize: 12 },
  tlItem: { flexDirection: 'row', gap: 12, minHeight: 44 },
  tlLeft: { width: 20, alignItems: 'center' },
  tlDot: { width: 12, height: 12, borderRadius: 6, marginTop: 2 },
  tlLine: { flex: 1, width: 2, backgroundColor: COLORS.border, marginTop: 4 },
  tlRight: { flex: 1, paddingBottom: 12 },
  tlLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  tlTime: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  ratingStars: { color: '#FFD700', fontSize: 24, marginBottom: 6 },
  ratingComment: { color: COLORS.muted, fontSize: 13, fontStyle: 'italic', lineHeight: 18 },
  cancelReason: { color: COLORS.text, fontSize: 13, lineHeight: 18 },
  cancelledBy: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
});
