import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  accent: '#F5A623',
  green: '#27AE60',
  red: '#E74C3C',
};

const SERVICE_CONFIG = {
  TAXI:     { label: 'Course Taxi',      icon: '🚕', color: '#F5A623' },
  SOS:      { label: 'Dépannage SOS',    icon: '🛻', color: '#E74C3C' },
  DELIVERY: { label: 'Livraison',        icon: '🛵', color: '#27AE60' },
  GROCERY:  { label: 'Courses à domicile', icon: '🛒', color: '#3498DB' },
};

const MOCK_ORDER = {
  id: 'ord_inv01',
  serviceType: 'TAXI',
  status: 'COMPLETED',
  totalAmount: 7.35,
  price: 7.35,
  createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  completedAt: new Date(Date.now() - 2 * 86400000 + 25 * 60000).toISOString(),
  originAddress: '12 Avenue Habib Bourguiba, Tunis',
  destinationAddress: 'Aéroport Tunis-Carthage, Ariana',
  provider: { name: 'Tarek Ben Salah', phone: '+21699001122' },
  client: { name: 'Salim Baccar', phone: '+21622334455' },
  distance: 9.2,
  duration: 24,
  tip: 1.0,
};

function InvoiceRow({ label, value, bold, color }) {
  return (
    <View style={[inv.row, bold && { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 6, paddingTop: 10 }]}>
      <Text style={[inv.label, bold && { fontWeight: '700', color: COLORS.text }]}>{label}</Text>
      <Text style={[inv.value, bold && { fontWeight: '900', fontSize: 16 }, color && { color }]}>{value}</Text>
    </View>
  );
}

const inv = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  label: { color: COLORS.muted, fontSize: 13 },
  value: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
});

function buildInvoiceHtml(order, user, svcCfg) {
  const date = new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const invNum = `INV-${String(order.id).slice(-8).toUpperCase()}`;
  const base = order.totalAmount - (order.tip || 0);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #1A1A2E; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
  .logo { font-size: 28px; font-weight: 900; color: #FFFFFF; }
  .logo span { color: #D32F2F; }
  .inv-num { font-size: 14px; color: #666; margin-top: 4px; }
  .badge { display: inline-block; background: ${svcCfg.color}22; color: ${svcCfg.color}; border: 1px solid ${svcCfg.color}; border-radius: 20px; padding: 4px 14px; font-size: 13px; font-weight: 700; }
  .section { margin: 20px 0; }
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 8px 0; font-size: 13px; vertical-align: top; }
  td:last-child { text-align: right; font-weight: 600; }
  .divider { border: none; border-top: 1px solid #E5E5E5; margin: 8px 0; }
  .total-row td { font-size: 16px; font-weight: 900; color: #F5A623; padding-top: 10px; border-top: 2px solid #E5E5E5; }
  .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; }
  .paid-stamp { text-align: right; color: #27AE60; font-size: 20px; font-weight: 900; border: 3px solid #27AE60; display: inline-block; padding: 6px 18px; border-radius: 8px; transform: rotate(-5deg); margin-top: -20px; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">EASY<span>WAY</span></div>
      <div class="inv-num">${invNum}</div>
      <div style="margin-top: 8px">${date}</div>
    </div>
    <div>
      <div class="badge">${svcCfg.icon} ${svcCfg.label}</div>
      <div class="paid-stamp">✓ PAYÉ</div>
    </div>
  </div>

  <div style="display:flex; gap:40px; margin-bottom:24px;">
    <div class="section" style="flex:1">
      <div class="section-title">Client</div>
      <div>${order.client?.name || user?.name || '—'}</div>
      <div style="color:#666; font-size:12px">${order.client?.phone || user?.phone || ''}</div>
    </div>
    ${order.provider ? `<div class="section" style="flex:1">
      <div class="section-title">Prestataire</div>
      <div>${order.provider.name}</div>
      <div style="color:#666; font-size:12px">${order.provider.phone || ''}</div>
    </div>` : ''}
  </div>

  ${order.originAddress ? `<div class="section">
    <div class="section-title">Trajet</div>
    <table>
      <tr><td>🟢 Départ</td><td>${order.originAddress}</td></tr>
      ${order.destinationAddress ? `<tr><td>🔴 Arrivée</td><td>${order.destinationAddress}</td></tr>` : ''}
      ${order.distance ? `<tr><td>📏 Distance</td><td>${order.distance} km</td></tr>` : ''}
      ${order.duration ? `<tr><td>⏱️ Durée</td><td>${order.duration} min</td></tr>` : ''}
    </table>
  </div>` : ''}

  <div class="section">
    <div class="section-title">Détail de la facture</div>
    <table>
      <tr><td>Course de base</td><td>${base.toFixed(3)} TND</td></tr>
      ${order.tip > 0 ? `<tr><td>💰 Pourboire</td><td>${order.tip.toFixed(3)} TND</td></tr>` : ''}
      <tr class="divider"><td colspan="2"><hr class="divider"></td></tr>
      <tr class="total-row"><td>Total réglé</td><td>${(order.totalAmount || order.price || 0).toFixed(3)} TND</td></tr>
    </table>
  </div>

  <div class="footer">
    EASYWAY Tunisia SAS · contact@easyway.tn · Tunis, Tunisie<br>
    Matricule fiscal : 123456T/A/M/000 — Ce document tient lieu de facture.
  </div>
</body>
</html>`;
}

export default function InvoiceScreen({ route, navigation }) {
  const { orderId } = route.params || {};
  const { user } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/orders/${orderId}`);
      setOrder(res.data?.order || res.data);
    } catch {
      setOrder(MOCK_ORDER);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  const handleExport = async () => {
    if (!order) return;
    setExporting(true);
    try {
      const svcCfg = SERVICE_CONFIG[order.serviceType] || SERVICE_CONFIG.TAXI;
      const html = buildInvoiceHtml(order, user, svcCfg);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Partager la facture' });
      } else {
        Alert.alert('PDF créé', uri);
      }
    } catch (err) {
      Alert.alert('Erreur', "Impossible de générer le PDF");
    } finally {
      setExporting(false);
    }
  };

  if (loading) return (
    <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.accent} /></View>
  );
  if (!order) return null;

  const svcCfg = SERVICE_CONFIG[order.serviceType] || SERVICE_CONFIG.TAXI;
  const invNum = `INV-${String(order.id).slice(-8).toUpperCase()}`;
  const date = new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const base = (order.totalAmount || order.price || 0) - (order.tip || 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Facture</Text>
        <TouchableOpacity onPress={handleExport} disabled={exporting} style={styles.exportBtn}>
          {exporting ? <ActivityIndicator color={COLORS.accent} size="small" /> : <Text style={styles.exportText}>PDF ↓</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Invoice hero */}
        <View style={styles.invCard}>
          <View style={styles.invCardTop}>
            <View>
              <Text style={styles.logoText}>EASY<Text style={{ color: '#D32F2F' }}>WAY</Text></Text>
              <Text style={styles.invNum}>{invNum}</Text>
            </View>
            <View style={styles.paidStamp}>
              <Text style={styles.paidText}>✓ PAYÉ</Text>
            </View>
          </View>

          <View style={[styles.svcBadge, { backgroundColor: svcCfg.color + '22', borderColor: svcCfg.color }]}>
            <Text style={[styles.svcBadgeText, { color: svcCfg.color }]}>{svcCfg.icon} {svcCfg.label}</Text>
          </View>

          <Text style={styles.invDate}>{date} à {time}</Text>
        </View>

        {/* Parties */}
        <View style={styles.partiesRow}>
          <View style={styles.partyCard}>
            <Text style={styles.partyLabel}>Client</Text>
            <Text style={styles.partyName}>{order.client?.name || user?.name}</Text>
            <Text style={styles.partyPhone}>{order.client?.phone || user?.phone}</Text>
          </View>
          {order.provider && (
            <View style={styles.partyCard}>
              <Text style={styles.partyLabel}>Prestataire</Text>
              <Text style={styles.partyName}>{order.provider.name}</Text>
              <Text style={styles.partyPhone}>{order.provider.phone}</Text>
            </View>
          )}
        </View>

        {/* Trip details */}
        {order.originAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trajet</Text>
            <View style={styles.addrRow}><Text style={styles.addrIcon}>🟢</Text><Text style={styles.addrText}>{order.originAddress}</Text></View>
            {order.destinationAddress && <View style={styles.addrRow}><Text style={styles.addrIcon}>🔴</Text><Text style={styles.addrText}>{order.destinationAddress}</Text></View>}
            <View style={styles.tripStats}>
              {order.distance && <View style={styles.tripStat}><Text style={styles.tripStatNum}>{order.distance} km</Text><Text style={styles.tripStatLbl}>Distance</Text></View>}
              {order.duration && <View style={styles.tripStat}><Text style={styles.tripStatNum}>{order.duration} min</Text><Text style={styles.tripStatLbl}>Durée</Text></View>}
            </View>
          </View>
        )}

        {/* Price breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détail des montants</Text>
          <InvoiceRow label="Course de base" value={`${base.toFixed(3)} TND`} />
          {order.tip > 0 && <InvoiceRow label="💰 Pourboire" value={`${order.tip.toFixed(3)} TND`} color={COLORS.green} />}
          <InvoiceRow label="Total réglé" value={`${(order.totalAmount || order.price || 0).toFixed(3)} TND`} bold color={COLORS.accent} />
        </View>

        {/* Legal footer */}
        <View style={styles.legalBox}>
          <Text style={styles.legalText}>
            EASYWAY Tunisia SAS · contact@easyway.tn{'\n'}
            Matricule fiscal : 123456T/A/M/000{'\n'}
            Ce document tient lieu de facture.
          </Text>
        </View>

        <TouchableOpacity style={styles.pdfBtn} onPress={handleExport} disabled={exporting} activeOpacity={0.85}>
          {exporting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.pdfBtnText}>📄 Télécharger en PDF</Text>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loading: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  exportBtn: { backgroundColor: COLORS.accent + '22', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.accent },
  exportText: { color: COLORS.accent, fontWeight: '700', fontSize: 12 },
  scroll: { padding: 16 },
  invCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 20,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  invCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  logoText: { color: COLORS.text, fontSize: 22, fontWeight: '900' },
  invNum: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  paidStamp: { backgroundColor: COLORS.green + '18', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1.5, borderColor: COLORS.green },
  paidText: { color: COLORS.green, fontWeight: '900', fontSize: 13 },
  svcBadge: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, marginBottom: 8 },
  svcBadgeText: { fontSize: 13, fontWeight: '700' },
  invDate: { color: COLORS.muted, fontSize: 12 },
  partiesRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  partyCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  partyLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  partyName: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  partyPhone: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  section: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 12 },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  addrRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 8 },
  addrIcon: { fontSize: 14 },
  addrText: { color: COLORS.text, fontSize: 13, flex: 1 },
  tripStats: { flexDirection: 'row', gap: 12, marginTop: 8 },
  tripStat: { backgroundColor: COLORS.bg, borderRadius: 10, padding: 10, alignItems: 'center', flex: 1 },
  tripStatNum: { color: COLORS.accent, fontSize: 16, fontWeight: '800' },
  tripStatLbl: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  legalBox: { backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  legalText: { color: COLORS.muted, fontSize: 11, textAlign: 'center', lineHeight: 18 },
  pdfBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  pdfBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
