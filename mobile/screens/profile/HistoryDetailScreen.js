import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Share, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { exportReceiptPDF } from '../../services/pdfExport';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  accent: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  success: '#27AE60',
  danger: '#E74C3C',
};

const STATUS_MAP = {
  PENDING:    { label: 'En attente',  color: COLORS.textMuted },
  ACCEPTED:   { label: 'Acceptée',    color: '#4A9EFF' },
  IN_PROGRESS:{ label: 'En cours',    color: COLORS.accent },
  COMPLETED:  { label: 'Terminée',    color: COLORS.success },
  CANCELLED:  { label: 'Annulée',     color: COLORS.danger },
};

const TYPE_ICON = {
  TAXI:     '🚕',
  SOS:      '🚑',
  DELIVERY: '🛵',
  GROCERY:  '🛒',
};

function Row({ label, value, valueColor }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function buildReceiptText(order) {
  const d = new Date(order.createdAt).toLocaleString('fr-TN');
  const status = STATUS_MAP[order.status]?.label || order.status;
  const lines = [
    '╔══════════════════════════════╗',
    '║         REÇU EASYWAY         ║',
    '╚══════════════════════════════╝',
    '',
    `Référence   : ${order.id?.slice(0, 12).toUpperCase() || 'N/A'}`,
    `Date        : ${d}`,
    `Service     : ${TYPE_ICON[order.type] || ''} ${order.type || ''}`,
    `Statut      : ${status}`,
    '',
    '──────────────────────────────',
    `Départ      : ${order.pickupAddress || order.pickupLat?.toFixed(4) || 'N/A'}`,
    `Arrivée     : ${order.destAddress || order.destLat?.toFixed(4) || 'N/A'}`,
    '',
    '──────────────────────────────',
    `Distance    : ${order.distance ? order.distance + ' km' : 'N/A'}`,
    `Durée       : ${order.duration ? order.duration + ' min' : 'N/A'}`,
    '',
    '──────────────────────────────',
  ];
  if (order.fareBase)    lines.push(`Base        : ${order.fareBase} TND`);
  if (order.fareDistance) lines.push(`Distance    : ${order.fareDistance} TND`);
  if (order.discount)    lines.push(`Remise      : -${order.discount} TND`);
  lines.push('──────────────────────────────');
  lines.push(`TOTAL       : ${order.price ?? order.fare ?? 'N/A'} TND`);
  lines.push(`Paiement    : ${order.paymentMethod || 'Espèces'}`);
  if (order.driver?.name) {
    lines.push('');
    lines.push('──────────────────────────────');
    lines.push(`Chauffeur   : ${order.driver.name}`);
    lines.push(`Note        : ${'★'.repeat(Math.round(order.driverRating || 0))}${'☆'.repeat(5 - Math.round(order.driverRating || 0))}`);
  }
  lines.push('');
  lines.push('         EASYWAY — www.easyway.tn');
  lines.push('     © 2025 EASYWAY. Tous droits réservés.');
  return lines.join('\n');
}

export default function HistoryDetailScreen({ route, navigation }) {
  const { orderId, orderData } = route.params || {};
  const [order, setOrder] = useState(orderData || null);
  const [loading, setLoading] = useState(!orderData);

  useEffect(() => {
    if (!orderData && orderId) {
      api.get(`/api/orders/${orderId}`)
        .then((res) => setOrder(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  const handleShareReceipt = async () => {
    if (!order) return;
    const text = buildReceiptText(order);
    try {
      await Share.share({ message: text, title: 'Reçu EASYWAY' });
    } catch {}
  };

  const handleExportPDF = async () => {
    if (!order) return;
    try {
      await exportReceiptPDF(order);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de générer le PDF.');
    }
  };

  const handleRate = () => {
    if (!order?.id) return;
    Alert.prompt(
      'Noter ce trajet',
      'Donnez une note de 1 à 5',
      async (val) => {
        const rating = parseInt(val, 10);
        if (!rating || rating < 1 || rating > 5) {
          Alert.alert('Erreur', 'Note invalide (1-5)');
          return;
        }
        try {
          await api.post(`/api/orders/${order.id}/rate`, { rating });
          Alert.alert('Merci !', 'Votre avis a été pris en compte.');
        } catch {
          Alert.alert('Erreur', 'Impossible d\'enregistrer la note.');
        }
      },
      'plain-text',
      '',
      'numeric'
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détail de la course</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Course introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: COLORS.textMuted };
  const icon = TYPE_ICON[order.type] || '🚗';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail de la course</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Receipt card */}
        <View style={styles.receipt}>
          {/* Top badge */}
          <View style={styles.receiptTop}>
            <Text style={styles.receiptIcon}>{icon}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.receiptType}>{order.type}</Text>
              <Text style={styles.receiptDate}>
                {new Date(order.createdAt).toLocaleString('fr-TN')}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '22', borderColor: statusInfo.color }]}>
              <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Reference */}
          <Row label="Référence" value={order.id?.slice(0, 12).toUpperCase() || 'N/A'} />

          {/* Route */}
          <View style={styles.routeBox}>
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.routeText} numberOfLines={2}>
                {order.pickupAddress || 'Départ'}
              </Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: COLORS.danger }]} />
              <Text style={styles.routeText} numberOfLines={2}>
                {order.destAddress || 'Arrivée'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Details */}
          {order.distance != null && <Row label="Distance" value={`${order.distance} km`} />}
          {order.duration != null && <Row label="Durée" value={`${order.duration} min`} />}

          <View style={styles.divider} />

          {/* Pricing */}
          {order.fareBase != null && <Row label="Tarif de base" value={`${order.fareBase} TND`} />}
          {order.fareDistance != null && <Row label="Distance" value={`${order.fareDistance} TND`} />}
          {order.discount != null && order.discount > 0 && (
            <Row label="Remise" value={`-${order.discount} TND`} valueColor={COLORS.success} />
          )}
          <Row
            label="Total"
            value={`${order.price ?? order.fare ?? 'N/A'} TND`}
            valueColor={COLORS.accent}
          />
          <Row label="Paiement" value={order.paymentMethod || 'Espèces'} />

          {/* Driver */}
          {order.driver && (
            <>
              <View style={styles.divider} />
              <View style={styles.driverSection}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverAvatarText}>
                    {(order.driver.name || 'C')[0].toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.driverName}>{order.driver.name}</Text>
                  {order.driverRating != null && (
                    <Text style={styles.driverRating}>
                      {'★'.repeat(Math.round(order.driverRating))}{'☆'.repeat(5 - Math.round(order.driverRating))}
                    </Text>
                  )}
                </View>
                {order.status === 'COMPLETED' && !order.driverRating && (
                  <TouchableOpacity style={styles.rateBtn} onPress={handleRate}>
                    <Text style={styles.rateBtnText}>⭐ Noter</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.shareBtn} onPress={handleExportPDF}>
            <Text style={styles.shareBtnText}>📄 Exporter en PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.shareBtn, { borderColor: '#4A4A5A' }]} onPress={handleShareReceipt}>
            <Text style={styles.shareBtnText}>📤 Partager le texte</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  backBtn: { width: 36, alignItems: 'center' },
  backText: { color: COLORS.text, fontSize: 28 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  receipt: {
    backgroundColor: COLORS.surface, margin: 16,
    borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: COLORS.border,
  },
  receiptTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  receiptIcon: { fontSize: 36 },
  receiptType: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  receiptDate: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 10, borderWidth: 1,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  detailLabel: { color: COLORS.textMuted, fontSize: 13 },
  detailValue: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  routeBox: { backgroundColor: '#12121C', borderRadius: 12, padding: 14, marginVertical: 8 },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  routeLine: { width: 1, height: 20, backgroundColor: COLORS.border, marginLeft: 4, marginVertical: 4 },
  routeText: { color: COLORS.text, fontSize: 13, flex: 1 },
  driverSection: { flexDirection: 'row', alignItems: 'center' },
  driverAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.accent + '33',
    alignItems: 'center', justifyContent: 'center',
  },
  driverAvatarText: { color: COLORS.accent, fontWeight: '700', fontSize: 18 },
  driverName: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  driverRating: { color: COLORS.accent, fontSize: 14, marginTop: 2 },
  rateBtn: {
    backgroundColor: COLORS.accent + '22', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.accent,
  },
  rateBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
  actionsRow: { marginHorizontal: 16, gap: 10 },
  shareBtn: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  shareBtnText: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
});
