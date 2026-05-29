import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const COLORS = {
  surface: '#1C1C28',
  surfaceDeep: '#151520',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  red: '#D32F2F',
  redLight: '#EF5350',
  amber: '#F5A623',
  border: '#2C2C3E',
  divider: '#252535',
};

/**
 * FareEstimateCard
 *
 * Props:
 *   estimate: {
 *     distanceKm: number,
 *     estimatedFare: number,
 *     breakdown: {
 *       priseEnCharge: number,
 *       tarifKmApplied: number,
 *       distanceKm: number,
 *       tarifDistance: number,
 *       supplementNuit: boolean,
 *       supplementDimanche: boolean,
 *       supplementAmount: number,
 *       total: number,
 *       tariff: 'JOUR' | 'NUIT',
 *     }
 *   }
 */
export default function FareEstimateCard({ estimate }) {
  if (!estimate || estimate.estimatedFare == null) return null;

  const { distanceKm, estimatedFare, breakdown } = estimate;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🧮</Text>
        <View>
          <Text style={styles.headerTitle}>Estimation de course</Text>
          <Text style={styles.headerSubtitle}>Tarimètre EASYWAY — Mode A</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Distance */}
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Distance estimée</Text>
        <Text style={styles.rowValue}>{(distanceKm || breakdown?.distanceKm || 0).toFixed(3)} km</Text>
      </View>

      {/* Tariff badge */}
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Tarif applicable</Text>
        <View style={[styles.tariffBadge, breakdown?.tariff === 'NUIT' ? styles.tariffNuit : styles.tariffJour]}>
          <Text style={[styles.tariffText, breakdown?.tariff === 'NUIT' ? styles.tariffNuitText : styles.tariffJourText]}>
            {breakdown?.tariff === 'NUIT' ? '🌙 Nuit' : '☀️ Jour'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Breakdown rows */}
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Prise en charge</Text>
        <Text style={styles.rowValue}>{(breakdown?.priseEnCharge ?? 0.700).toFixed(3)} TND</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>
          Tarif km ({breakdown?.tarifKmApplied?.toFixed(3)} TND/km)
        </Text>
        <Text style={styles.rowValue}>{(breakdown?.tarifDistance ?? 0).toFixed(3)} TND</Text>
      </View>

      {breakdown?.supplementNuit && (
        <View style={styles.row}>
          <Text style={styles.rowLabelSupp}>Supplément nuit</Text>
          <Text style={styles.rowValueSupp}>inclus</Text>
        </View>
      )}

      {breakdown?.supplementDimanche && (
        <View style={styles.row}>
          <Text style={styles.rowLabelSupp}>Supplément dimanche / jour férié (+25%)</Text>
          <Text style={styles.rowValueSupp}>+{(breakdown?.supplementAmount ?? 0).toFixed(3)} TND</Text>
        </View>
      )}

      <View style={styles.divider} />

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total estimé</Text>
        <Text style={styles.totalValue}>{parseFloat(estimatedFare).toFixed(3)} TND</Text>
      </View>

      {/* Legal mention */}
      <Text style={styles.legal}>
        ⚠️ Prix indicatif, peut varier selon trafic réel. Tarifs conformes au décret du
        Ministère du Transport tunisien 2019. En Mode B, le compteur physique homologué du
        véhicule fait foi.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.red + '55',
    padding: 16,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  headerIcon: { fontSize: 28 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  headerSubtitle: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  divider: { height: 1, backgroundColor: COLORS.divider, marginVertical: 4 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: { fontSize: 13, color: COLORS.textMuted, flex: 1, paddingRight: 8 },
  rowValue: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  rowLabelSupp: { fontSize: 12, color: COLORS.amber, flex: 1, paddingRight: 8 },
  rowValueSupp: { fontSize: 12, color: COLORS.amber, fontWeight: '600' },
  tariffBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tariffJour: { backgroundColor: '#FFF9C4' },
  tariffNuit: { backgroundColor: '#1A237E' },
  tariffText: { fontSize: 12, fontWeight: '600' },
  tariffJourText: { color: '#F57F17' },
  tariffNuitText: { color: '#90CAF9' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.red + '22',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  totalLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  totalValue: { fontSize: 22, fontWeight: '800', color: COLORS.redLight },
  legal: {
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 15,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
