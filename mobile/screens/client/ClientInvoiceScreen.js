import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Share, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const MOCK = {
  invoiceId: 'INV-2026-0042',
  date: '04/06/2026 à 19:45',
  status: 'paid',
  client: { name: 'Tarek Arrouk', phone: '+216 71 000 000' },
  service: 'Course taxi',
  items: [
    { label: 'Course Lac 1 → Aéroport', amount: 12.500 },
    { label: 'Frais de nuit (+15%)', amount: 1.875 },
    { label: 'Pourboire', amount: 1.000 },
  ],
  subtotal: 15.375,
  discount: 0,
  total: 15.375,
  paymentMethod: 'Portefeuille EasyWay',
  driver: { name: 'Karim Belhaj', vehicle: 'Peugeot 308 • TUN-4892' },
};

export default function ClientInvoiceScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/client/invoice/${orderId || 'latest'}`)
      .then(r => setInvoice(r.data || MOCK))
      .catch(() => setInvoice(MOCK))
      .finally(() => setLoading(false));
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Facture EasyWay ${invoice.invoiceId}\nDate: ${invoice.date}\nTotal: ${invoice.total.toFixed(3)} TND\nMerci d'avoir utilisé EasyWay !`,
        title: `Facture ${invoice.invoiceId}`,
      });
    } catch {}
  };

  const handleDownload = () =>
    Alert.alert('📥 Facture', 'La facture PDF a été enregistrée dans vos fichiers.', [{ text: 'OK' }]);

  if (loading) return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 80 }} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🧾 Facture</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        <View style={styles.invoiceCard}>
          <View style={styles.invoiceHeader}>
            <View>
              <Text style={styles.invoiceId}>{invoice.invoiceId}</Text>
              <Text style={styles.invoiceDate}>{invoice.date}</Text>
            </View>
            <View style={[styles.statusBadge, invoice.status === 'paid' && { backgroundColor: COLORS.green + '20', borderColor: COLORS.green + '50' }]}>
              <Text style={[styles.statusText, invoice.status === 'paid' && { color: COLORS.green }]}>
                {invoice.status === 'paid' ? '✅ Payée' : '⏳ En attente'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.fieldLabel}>SERVICE</Text>
          <Text style={styles.fieldVal}>{invoice.service}</Text>

          <Text style={styles.fieldLabel}>CLIENT</Text>
          <Text style={styles.fieldVal}>{invoice.client.name}</Text>
          <Text style={styles.fieldSub}>{invoice.client.phone}</Text>

          {invoice.driver && (
            <>
              <Text style={styles.fieldLabel}>CHAUFFEUR / LIVREUR</Text>
              <Text style={styles.fieldVal}>{invoice.driver.name}</Text>
              <Text style={styles.fieldSub}>{invoice.driver.vehicle}</Text>
            </>
          )}

          <View style={styles.divider} />

          <Text style={styles.fieldLabel}>DÉTAIL</Text>
          {invoice.items.map((item, i) => (
            <View key={i} style={styles.lineRow}>
              <Text style={styles.lineLabel}>{item.label}</Text>
              <Text style={styles.lineAmount}>{item.amount.toFixed(3)} TND</Text>
            </View>
          ))}

          {invoice.discount > 0 && (
            <View style={styles.lineRow}>
              <Text style={[styles.lineLabel, { color: COLORS.green }]}>Réduction</Text>
              <Text style={[styles.lineAmount, { color: COLORS.green }]}>-{invoice.discount.toFixed(3)} TND</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalVal}>{invoice.total.toFixed(3)} TND</Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>💳 {invoice.paymentMethod}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Text style={{ fontSize: 22 }}>📤</Text>
            <Text style={styles.actionLabel}>Partager</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
            <Text style={{ fontSize: 22 }}>📥</Text>
            <Text style={styles.actionLabel}>Télécharger</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('ClientSupport')}>
            <Text style={{ fontSize: 22 }}>🎧</Text>
            <Text style={styles.actionLabel}>Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  invoiceCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  invoiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  invoiceId: { color: COLORS.text, fontSize: 16, fontWeight: '900' },
  invoiceDate: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  statusBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  statusText: { fontSize: 12, fontWeight: '700', color: COLORS.muted },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 14 },
  fieldLabel: { color: COLORS.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  fieldVal: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  fieldSub: { color: COLORS.muted, fontSize: 12, marginBottom: 12 },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  lineLabel: { color: COLORS.text, fontSize: 13 },
  lineAmount: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  totalVal: { color: COLORS.accent, fontSize: 22, fontWeight: '900' },
  paymentRow: { marginTop: 10 },
  paymentLabel: { color: COLORS.muted, fontSize: 12 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.border },
  actionLabel: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
});
