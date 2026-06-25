import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Share, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const SERVICE_ICON = { TAXI: '🚕', DELIVERY: '🛵', GROCERY: '🛒', SOS: '🔧' };

const STATUS_LABEL = {
  COMPLETED: { label: '✅ Terminée', color: COLORS.green },
  CANCELLED: { label: '❌ Annulée', color: COLORS.red },
  PENDING: { label: '⏳ En attente', color: COLORS.accent },
  ACCEPTED: { label: '🚗 Acceptée', color: COLORS.blue },
  IN_PROGRESS: { label: '🚗 En cours', color: COLORS.blue },
  DISPUTED: { label: '⚠️ En litige', color: COLORS.red },
};

export default function ClientTripDetailScreen({ navigation, route }) {
  const orderId = route?.params?.orderId || route?.params?.trip?.id;
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError(true);
      setLoading(false);
      return;
    }
    Promise.all([
      api.get(`/api/orders/${orderId}`),
      api.get(`/api/orders/${orderId}/invoice`).catch(() => null),
    ])
      .then(([orderRes, invoiceRes]) => {
        const o = orderRes.data.order;
        const invoice = invoiceRes?.data || null;
        setTrip({
          id: o.id,
          service: o.serviceType,
          status: o.status,
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
          driver: o.provider ? { name: o.provider.name, rating: null, vehicle: '' } : null,
          origin: o.originAddress || '—',
          destination: o.destinationAddress || null,
          fare: Number(o.price || 0),
          total: Number(o.finalPrice ?? o.price ?? 0),
          paymentMethod: invoice?.paymentMethod || 'N/A',
          invoiceRef: invoice?.invoiceId || `ORD-${o.id.slice(-8).toUpperCase()}`,
        });
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleShare = async () => {
    if (!trip) return;
    try {
      await Share.share({ message: `Reçu EasyWay — ${trip.invoiceRef}\nDate : ${trip.date}\nTotal : ${trip.total.toFixed(3)} TND` });
    } catch {}
  };

  const handleDispute = () => {
    navigation.navigate('Dispute', { orderId: trip.id, orderType: trip.service });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={COLORS.accent} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (error || !trip) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détail de la course</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 30 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, fontSize: 14, textAlign: 'center' }}>
            Impossible de charger les détails de cette course.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const st = STATUS_LABEL[trip.status] || { label: trip.status, color: COLORS.muted };

  const rows = [
    { label: 'Réf. commande', value: trip.invoiceRef },
    { label: 'Date', value: trip.date },
    { label: 'Service', value: trip.service },
    { label: 'Paiement', value: trip.paymentMethod },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail de la course</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={{ fontSize: 20 }}>↗️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero status */}
        <View style={styles.heroCard}>
          <Text style={{ fontSize: 48 }}>{SERVICE_ICON[trip.service] || '📦'}</Text>
          <View style={[styles.heroBadge, { backgroundColor: st.color + '20', borderColor: st.color + '40' }]}>
            <Text style={[styles.heroBadgeText, { color: st.color }]}>{st.label}</Text>
          </View>
          <Text style={styles.heroRef}>{trip.invoiceRef}</Text>
          <Text style={styles.heroDate}>{trip.date}</Text>
        </View>

        {/* Route */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRAJET</Text>
          <View style={styles.routeCard}>
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: COLORS.green }]} />
              <Text style={styles.routeText}>{trip.origin}</Text>
            </View>
            {trip.destination && (
              <>
                <View style={styles.routeLine} />
                <View style={styles.routeRow}>
                  <View style={[styles.routeDot, { backgroundColor: COLORS.accent }]} />
                  <Text style={styles.routeText}>{trip.destination}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Driver */}
        {trip.driver && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PRESTATAIRE</Text>
            <View style={styles.driverCard}>
              <View style={styles.driverAvatar}>
                <Text style={{ fontSize: 26 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.driverName}>{trip.driver.name}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS</Text>
          <View style={styles.infoCard}>
            {rows.map(r => (
              <View key={r.label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{r.label}</Text>
                <Text style={styles.infoValue}>{r.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Fare breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DÉTAIL DU PRIX</Text>
          <View style={styles.fareCard}>
            <View style={[styles.fareRow, styles.fareTotalRow]}>
              <Text style={styles.fareTotalLabel}>Total payé</Text>
              <Text style={styles.fareTotalValue}>{trip.total.toFixed(3)} TND</Text>
            </View>
            <View style={styles.commissionNote}>
              <Text style={styles.commissionText}>✅ 0% de commission EasyWay — prestataire garde 100%</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.disputeBtn} onPress={handleDispute}>
            <Text style={styles.disputeBtnText}>⚠️ Signaler un problème</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.invoiceBtn} onPress={handleShare}>
            <Text style={styles.invoiceBtnText}>📄 Télécharger le reçu</Text>
          </TouchableOpacity>
        </View>

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
  headerTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  shareBtn: { width: 40, alignItems: 'flex-end' },
  heroCard: {
    alignItems: 'center', padding: 24,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  heroBadge: {
    borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 5, marginTop: 10, borderWidth: 1,
  },
  heroBadgeText: { fontSize: 13, fontWeight: '700' },
  heroRef: { color: COLORS.text, fontSize: 16, fontWeight: '800', marginTop: 10 },
  heroDate: { color: COLORS.muted, fontSize: 13, marginTop: 4 },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  routeCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeText: { color: COLORS.text, fontSize: 14, fontWeight: '600', flex: 1 },
  routeLine: { width: 1, height: 16, backgroundColor: COLORS.border, marginLeft: 4, marginVertical: 4 },
  driverCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  driverAvatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  driverName: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  driverVehicle: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  driverRating: { color: COLORS.accent, fontSize: 12, marginTop: 4 },
  infoCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  infoLabel: { color: COLORS.muted, fontSize: 13 },
  infoValue: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  fareCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  fareRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  fareLabel: { color: COLORS.muted, fontSize: 14 },
  fareValue: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  fareTotalRow: { borderBottomWidth: 0, paddingTop: 12 },
  fareTotalLabel: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  fareTotalValue: { color: COLORS.accent, fontSize: 20, fontWeight: '900' },
  commissionNote: {
    backgroundColor: COLORS.green + '10', borderRadius: 10, padding: 10, marginTop: 10,
    borderWidth: 1, borderColor: COLORS.green + '30',
  },
  commissionText: { color: COLORS.green, fontSize: 11, fontWeight: '600' },
  actions: { padding: 16, gap: 10 },
  disputeBtn: {
    borderRadius: 14, borderWidth: 1, borderColor: COLORS.red + '50',
    paddingVertical: 14, alignItems: 'center', backgroundColor: COLORS.red + '10',
  },
  disputeBtnText: { color: COLORS.red, fontSize: 14, fontWeight: '700' },
  invoiceBtn: {
    borderRadius: 14, backgroundColor: COLORS.accent, paddingVertical: 14, alignItems: 'center',
  },
  invoiceBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
});
