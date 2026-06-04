import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK = {
  id: 'MRC-0041', name: 'Pizza Roma', category: '🍕 Restauration', owner: 'Hamdi Belkacem',
  phone: '+216 71 441 200', email: 'contact@pizzaroma.tn',
  address: '12 Rue de Carthage, Tunis', zone: 'Tunis Centre',
  status: 'active', verified: true, joinDate: '10 janvier 2024',
  rating: 4.6, totalOrders: 2841, completionRate: 96.2,
  revenueMonth: 18400, revenueTotal: 142000,
  products: 34, avgDelivery: '28 min',
  docs: [
    { label: 'Patente commerciale', status: 'valid', expires: '12/2026' },
    { label: 'Registre de commerce', status: 'valid', expires: '—' },
    { label: 'Certificat sanitaire', status: 'warning', expires: '30/07/2026' },
  ],
  recentOrders: [
    { id: 'ORD-4441', client: 'Sana B.', amount: 24.50, status: 'completed', date: 'Auj. 15:02' },
    { id: 'ORD-4440', client: 'Karim L.', amount: 38.00, status: 'completed', date: 'Auj. 14:20' },
    { id: 'ORD-4439', client: 'Ines M.', amount: 14.00, status: 'cancelled', date: 'Hier 20:10' },
  ],
};

const STATUS_META = {
  completed: { label: 'Terminé', color: COLORS.green },
  cancelled:  { label: 'Annulé', color: COLORS.red },
};
const DOC_META = {
  valid:   { label: 'Valide', color: COLORS.green },
  warning: { label: 'Expire bientôt', color: COLORS.orange },
  expired: { label: 'Expiré', color: COLORS.red },
};

export default function AdminMerchantDetailScreen({ navigation }) {
  const [tab, setTab] = useState('info');

  const confirmAction = (action, label) => {
    Alert.alert(label, `Confirmer pour ${MOCK.name} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', style: action === 'ban' ? 'destructive' : 'default', onPress: () => {} },
    ]);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fiche marchand</Text>
        <View style={[styles.statusPill, { backgroundColor: MOCK.status === 'active' ? COLORS.green + '22' : COLORS.red + '22' }]}>
          <Text style={{ color: MOCK.status === 'active' ? COLORS.green : COLORS.red, fontSize: 11, fontWeight: '700' }}>
            {MOCK.status === 'active' ? 'Actif' : 'Suspendu'}
          </Text>
        </View>
      </View>

      {/* Profile */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 34 }}>🍕</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.merchantName}>{MOCK.name}</Text>
          <Text style={styles.merchantCat}>{MOCK.category} · {MOCK.id}</Text>
          <Text style={styles.merchantOwner}>👤 {MOCK.owner} · {MOCK.phone}</Text>
          <View style={styles.pillRow}>
            {MOCK.verified && <View style={styles.verifiedPill}><Text style={styles.verifiedText}>✅ Vérifié</Text></View>}
            <Text style={styles.ratingText}>⭐ {MOCK.rating}</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {[['info', 'Infos'], ['orders', 'Commandes'], ['docs', 'Docs'], ['actions', 'Actions']].map(([val, lbl]) => (
          <TouchableOpacity
            key={val}
            style={[styles.tab, tab === val && styles.tabActive]}
            onPress={() => setTab(val)}
          >
            <Text style={[styles.tabText, tab === val && { color: '#000' }]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {tab === 'info' && (
          <>
            <View style={styles.kpiGrid}>
              {[
                { label: 'Commandes total', value: MOCK.totalOrders.toLocaleString(), color: COLORS.white },
                { label: 'CA ce mois', value: `${MOCK.revenueMonth.toLocaleString()} TND`, color: COLORS.accent },
                { label: 'CA total', value: `${(MOCK.revenueTotal / 1000).toFixed(0)}k TND`, color: COLORS.blue },
                { label: 'Complétion', value: `${MOCK.completionRate}%`, color: COLORS.green },
                { label: 'Produits', value: MOCK.products, color: COLORS.white },
                { label: 'Livraison moy.', value: MOCK.avgDelivery, color: COLORS.muted },
              ].map((k, i) => (
                <View key={i} style={styles.kpiCard}>
                  <Text style={[styles.kpiVal, { color: k.color }]}>{k.value}</Text>
                  <Text style={styles.kpiLabel}>{k.label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoRow}>📍 Adresse : <Text style={{ color: COLORS.white }}>{MOCK.address}</Text></Text>
              <Text style={styles.infoRow}>🗺️ Zone : <Text style={{ color: COLORS.white }}>{MOCK.zone}</Text></Text>
              <Text style={styles.infoRow}>📅 Inscrit le : <Text style={{ color: COLORS.white }}>{MOCK.joinDate}</Text></Text>
              <Text style={styles.infoRow}>✉️ Email : <Text style={{ color: COLORS.accent }}>{MOCK.email}</Text></Text>
            </View>
          </>
        )}

        {tab === 'orders' && (
          <>
            {MOCK.recentOrders.map(o => {
              const meta = STATUS_META[o.status];
              return (
                <View key={o.id} style={styles.orderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderId}>{o.id} · {o.client}</Text>
                    <Text style={styles.orderDate}>{o.date}</Text>
                  </View>
                  <Text style={[styles.orderStatus, { color: meta.color }]}>{meta.label}</Text>
                  <Text style={styles.orderAmount}>{o.amount.toFixed(2)} TND</Text>
                </View>
              );
            })}
          </>
        )}

        {tab === 'docs' && (
          <>
            {MOCK.docs.map(d => {
              const meta = DOC_META[d.status];
              return (
                <View key={d.label} style={[styles.docCard, { borderColor: meta.color + '55' }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docLabel}>{d.label}</Text>
                    <Text style={styles.docExpire}>Expire : {d.expires}</Text>
                  </View>
                  <View style={[styles.docBadge, { backgroundColor: meta.color + '22' }]}>
                    <Text style={{ color: meta.color, fontSize: 12, fontWeight: '700' }}>{meta.label}</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {tab === 'actions' && (
          <>
            <View style={styles.actionsCard}>
              <Text style={styles.actionsTitle}>⚙️ Actions admin</Text>
              {[
                { icon: '✉️', label: 'Contacter le marchand', action: 'contact', color: COLORS.blue },
                { icon: '💰', label: 'Déclencher un versement', action: 'payout', color: COLORS.green },
                { icon: '🏷️', label: 'Modifier commission', action: 'commission', color: COLORS.accent },
                { icon: '📋', label: 'Exporter les données', action: 'export', color: COLORS.muted },
              ].map(a => (
                <TouchableOpacity
                  key={a.action}
                  style={[styles.actionBtn, { borderColor: a.color + '55' }]}
                  onPress={() => confirmAction(a.action, a.label)}
                >
                  <Text style={{ fontSize: 20 }}>{a.icon}</Text>
                  <Text style={[styles.actionBtnText, { color: a.color }]}>{a.label}</Text>
                  <Text style={{ color: COLORS.muted, fontSize: 16 }}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.dangerZone}>
              <Text style={styles.dangerTitle}>⚠️ Zone de danger</Text>
              <TouchableOpacity style={styles.suspendBtn} onPress={() => confirmAction('suspend', 'Suspendre')}>
                <Text style={styles.suspendBtnText}>🚫 Suspendre le compte</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  profileCard: { flexDirection: 'row', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.border },
  merchantName: { color: COLORS.white, fontSize: 16, fontWeight: '800', marginBottom: 2 },
  merchantCat: { color: COLORS.muted, fontSize: 12, marginBottom: 2 },
  merchantOwner: { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  verifiedPill: { backgroundColor: COLORS.green + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  verifiedText: { color: COLORS.green, fontSize: 10, fontWeight: '700' },
  ratingText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  tabRow: { flexDirection: 'row', gap: 6, padding: 10 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  kpiCard: { width: '31%', backgroundColor: COLORS.surface, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  kpiVal: { fontSize: 14, fontWeight: '900', marginBottom: 2 },
  kpiLabel: { color: COLORS.muted, fontSize: 10, textAlign: 'center' },
  infoCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  infoRow: { color: COLORS.muted, fontSize: 13 },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  orderId: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  orderDate: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  orderStatus: { fontSize: 12, fontWeight: '700' },
  orderAmount: { color: COLORS.accent, fontSize: 13, fontWeight: '800' },
  docCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 8 },
  docLabel: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  docExpire: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  docBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  actionsCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  actionsTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, marginBottom: 8 },
  actionBtnText: { flex: 1, fontSize: 13, fontWeight: '600' },
  dangerZone: { backgroundColor: '#1A0808', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.red + '55' },
  dangerTitle: { color: COLORS.red, fontSize: 13, fontWeight: '700', marginBottom: 12 },
  suspendBtn: { backgroundColor: COLORS.red + '22', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.red },
  suspendBtnText: { color: COLORS.red, fontSize: 13, fontWeight: '700' },
});
