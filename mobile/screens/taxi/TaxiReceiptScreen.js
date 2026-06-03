import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Share, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F',
};

const MOCK = {
  rideId: 'TAXI-4821',
  date: '15 Janvier 2025, 09:32',
  driver: { name: 'Karim Bejaoui', rating: 4.9, vehicle: 'Peugeot 308 · TU-248-443' },
  from: 'Menzah 6, Tunis',
  to: 'Aéroport Tunis-Carthage',
  distance: '12.4 km',
  duration: '23 min',
  breakdown: [
    { label: 'Prise en charge', amount: 1.200 },
    { label: 'Distance (12.4 km × 0.800)', amount: 9.920 },
    { label: 'Attente (2 min)', amount: 0.600 },
  ],
  subtotal: 11.720,
  promoDiscount: -2.000,
  promoCode: 'FLASH30',
  total: 9.720,
  payment: 'Portefeuille EASYWAY',
  txId: 'TXN-00482-2025',
};

function Row({ label, value, bold, color }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && { color: COLORS.white, fontWeight: '700' }]}>{label}</Text>
      <Text style={[styles.rowValue, bold && { fontWeight: '900' }, color && { color }]}>{value}</Text>
    </View>
  );
}

export default function TaxiReceiptScreen({ navigation, route }) {
  const receipt = route?.params?.receipt || MOCK;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Reçu EASYWAY — Course du ${receipt.date}\nDe : ${receipt.from}\nVers : ${receipt.to}\nTotal : ${receipt.total.toFixed(3)} TND\nRéf : ${receipt.txId}`,
        title: 'Reçu de course EASYWAY',
      });
    } catch {}
  };

  const handleDispute = () => {
    navigation.navigate('Dispute', { orderId: receipt.rideId, orderType: 'Course taxi' });
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🧾 Reçu de course</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text style={{ fontSize: 20 }}>↗️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Status */}
        <View style={styles.successBadge}>
          <Text style={{ fontSize: 36 }}>✅</Text>
          <Text style={styles.successText}>Paiement confirmé</Text>
          <Text style={styles.successDate}>{receipt.date}</Text>
        </View>

        {/* Logo */}
        <View style={styles.logoRow}>
          <Text style={styles.logo}>EASY<Text style={{ color: COLORS.red }}>WAY</Text></Text>
          <Text style={styles.receiptRef}>{receipt.txId}</Text>
        </View>

        {/* Trip */}
        <Text style={styles.sectionLabel}>Trajet</Text>
        <View style={styles.tripCard}>
          <View style={styles.tripRow}>
            <View style={styles.tripDot} />
            <Text style={styles.tripAddr}>{receipt.from}</Text>
          </View>
          <View style={styles.tripLine} />
          <View style={styles.tripRow}>
            <View style={[styles.tripDot, { backgroundColor: COLORS.red }]} />
            <Text style={styles.tripAddr}>{receipt.to}</Text>
          </View>
          <View style={styles.tripMeta}>
            <Text style={styles.metaChip}>📏 {receipt.distance}</Text>
            <Text style={styles.metaChip}>⏱ {receipt.duration}</Text>
          </View>
        </View>

        {/* Driver */}
        <Text style={styles.sectionLabel}>Chauffeur</Text>
        <View style={styles.driverCard}>
          <Text style={{ fontSize: 28 }}>🧔</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.driverName}>{receipt.driver.name}</Text>
            <Text style={styles.driverVehicle}>{receipt.driver.vehicle}</Text>
          </View>
          <Text style={styles.driverRating}>⭐ {receipt.driver.rating}</Text>
        </View>

        {/* Breakdown */}
        <Text style={styles.sectionLabel}>Détail du tarif</Text>
        <View style={styles.breakdownCard}>
          {receipt.breakdown.map((b, i) => (
            <Row key={i} label={b.label} value={`${b.amount.toFixed(3)} TND`} />
          ))}
          <View style={styles.divider} />
          <Row label="Sous-total" value={`${receipt.subtotal.toFixed(3)} TND`} />
          {receipt.promoDiscount < 0 && (
            <Row label={`Code promo (${receipt.promoCode})`} value={`${receipt.promoDiscount.toFixed(3)} TND`} color={COLORS.green} />
          )}
          <View style={styles.divider} />
          <Row label="TOTAL PAYÉ" value={`${receipt.total.toFixed(3)} TND`} bold color={COLORS.accent} />
          <Row label="Méthode de paiement" value={receipt.payment} />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('TaxiRating', { rideId: receipt.rideId, driverName: receipt.driver.name })}>
            <Text style={styles.actionBtnText}>⭐ Évaluer la course</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOutline]} onPress={handleDispute}>
            <Text style={[styles.actionBtnText, { color: COLORS.red }]}>⚠️ Signaler un problème</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  scroll: { padding: 16 },
  successBadge: { alignItems: 'center', backgroundColor: '#0A1A0A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.green, marginBottom: 16 },
  successText: { color: COLORS.green, fontSize: 18, fontWeight: '800', marginTop: 8 },
  successDate: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  logoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  logo: { color: COLORS.white, fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  receiptRef: { color: COLORS.muted, fontSize: 11 },
  sectionLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  tripCard: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 14 },
  tripRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tripDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.green },
  tripAddr: { flex: 1, color: COLORS.white, fontSize: 14 },
  tripLine: { width: 2, height: 20, backgroundColor: COLORS.border, marginLeft: 4, marginVertical: 4 },
  tripMeta: { flexDirection: 'row', gap: 10, marginTop: 10 },
  metaChip: { backgroundColor: COLORS.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, color: COLORS.muted, fontSize: 12 },
  driverCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 14 },
  driverName: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  driverVehicle: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  driverRating: { color: COLORS.accent, fontWeight: '800' },
  breakdownCard: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabel: { color: COLORS.muted, fontSize: 13 },
  rowValue: { color: COLORS.white, fontSize: 13 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  actions: { gap: 10 },
  actionBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  actionBtnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.red },
  actionBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
});
