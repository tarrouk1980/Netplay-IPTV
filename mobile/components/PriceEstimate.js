import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const COLORS = {
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  accent: '#D32F2F',
  accentLight: '#FF5252',
  white: '#FFFFFF',
  muted: '#8A8A9A',
  border: '#2A2A3A',
  green: '#4CAF50',
  grey: '#3A3A4A',
};

/**
 * Compute price estimate based on service type and distance.
 *
 * TAXI:    1.5 TND/km + 1 TND base, min 3 TND
 * DELIVERY: 2 TND/km + 1.5 TND base, min 4 TND
 * SOS:     5 TND base + 3 TND/km
 * GROCERY: fixed 3 TND delivery fee
 */
function computePrice(serviceType, distanceKm) {
  const km = Math.max(0, parseFloat(distanceKm) || 0);
  let base = 0;
  let perKm = 0;
  let min = 0;
  let isFixed = false;
  let fixedLabel = '';

  switch (serviceType) {
    case 'TAXI':
      base = 1;
      perKm = 1.5;
      min = 3;
      break;
    case 'DELIVERY':
      base = 1.5;
      perKm = 2;
      min = 4;
      break;
    case 'SOS':
      base = 5;
      perKm = 3;
      min = 0;
      break;
    case 'GROCERY':
      base = 3;
      perKm = 0;
      min = 3;
      isFixed = true;
      fixedLabel = 'Frais de livraison fixes';
      break;
    default:
      base = 1;
      perKm = 1.5;
      min = 3;
  }

  const distanceCost = perKm * km;
  const rawTotal = base + distanceCost;
  const total = Math.max(min, rawTotal);

  const MARGIN = 0.15;
  const low = Math.max(min, total * (1 - MARGIN));
  const high = total * (1 + MARGIN);

  return {
    base,
    perKm,
    distanceCost,
    total,
    low,
    high,
    isFixed,
    fixedLabel,
    min,
  };
}

const SERVICE_LABELS = {
  TAXI: '🚕 Taxi',
  DELIVERY: '📦 Livraison',
  SOS: '🚛 Dépannage SOS',
  GROCERY: '🛒 Courses',
};

/**
 * PriceEstimate
 *
 * Props:
 *   serviceType {string} — TAXI | DELIVERY | SOS | GROCERY
 *   distanceKm  {number} — estimated distance in km
 *   onConfirm   {function} — called with { price: number }
 *   onCancel    {function}
 */
export default function PriceEstimate({ serviceType, distanceKm, onConfirm, onCancel }) {
  const estimate = useMemo(
    () => computePrice(serviceType, distanceKm),
    [serviceType, distanceKm]
  );

  const serviceLabel = SERVICE_LABELS[serviceType] ?? serviceType;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.serviceLabel}>{serviceLabel}</Text>
        <Text style={styles.headerTitle}>Estimation du prix</Text>
      </View>

      {/* Main price */}
      <View style={styles.priceMain}>
        <Text style={styles.priceValue}>{estimate.total.toFixed(2)} TND</Text>
        <Text style={styles.priceRange}>
          Fourchette : {estimate.low.toFixed(2)} — {estimate.high.toFixed(2)} TND
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Breakdown */}
      <View style={styles.breakdown}>
        {estimate.isFixed ? (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{estimate.fixedLabel}</Text>
            <Text style={styles.rowValue}>{estimate.base.toFixed(2)} TND</Text>
          </View>
        ) : (
          <>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Distance</Text>
              <Text style={styles.rowValue}>{parseFloat(distanceKm || 0).toFixed(1)} km</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Prise en charge</Text>
              <Text style={styles.rowValue}>{estimate.base.toFixed(2)} TND</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>
                Tarif km ({estimate.perKm.toFixed(2)} TND/km)
              </Text>
              <Text style={styles.rowValue}>{estimate.distanceCost.toFixed(2)} TND</Text>
            </View>
            {estimate.min > 0 && estimate.total === estimate.min && (
              <View style={styles.row}>
                <Text style={styles.rowLabelNote}>Tarif minimum appliqué</Text>
                <Text style={styles.rowValueNote}>{estimate.min.toFixed(2)} TND</Text>
              </View>
            )}
          </>
        )}

        <View style={styles.divider} />

        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total estimé</Text>
          <Text style={styles.totalValue}>{estimate.total.toFixed(2)} TND</Text>
        </View>
      </View>

      {/* Note */}
      <View style={styles.noteBox}>
        <Text style={styles.noteText}>
          ℹ️ Prix final confirmé par le prestataire avant démarrage de la course.
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelBtnText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={() => onConfirm && onConfirm({ price: estimate.total })}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>Confirmer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.accent + '55',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  serviceLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  priceMain: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    alignItems: 'center',
  },
  priceValue: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.accentLight,
    letterSpacing: -1,
  },
  priceRange: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  breakdown: {
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  rowLabel: { fontSize: 13, color: COLORS.muted, flex: 1, paddingRight: 8 },
  rowValue: { fontSize: 13, color: COLORS.white, fontWeight: '500' },
  rowLabelNote: { fontSize: 11, color: COLORS.accent, flex: 1, fontStyle: 'italic' },
  rowValueNote: { fontSize: 11, color: COLORS.accent, fontWeight: '600' },
  totalRow: {
    backgroundColor: COLORS.accent + '1A',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 4,
  },
  totalLabel: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  totalValue: { fontSize: 20, fontWeight: '800', color: COLORS.accentLight },
  noteBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noteText: {
    fontSize: 11,
    color: COLORS.muted,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.grey,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.muted, fontWeight: '700', fontSize: 15 },
  confirmBtn: {
    flex: 2,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
