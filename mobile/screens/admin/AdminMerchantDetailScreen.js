import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const STATUS_META = {
  COMPLETED: { label: 'Terminé', color: COLORS.green },
  CANCELLED: { label: 'Annulé', color: COLORS.red },
  PENDING: { label: 'En attente', color: COLORS.orange },
  ACCEPTED: { label: 'En cours', color: COLORS.blue },
  IN_PROGRESS: { label: 'En cours', color: COLORS.blue },
};
const DOC_META = {
  valid:   { label: 'Valide', color: COLORS.green },
  warning: { label: 'Expire bientôt', color: COLORS.orange },
  expired: { label: 'Expiré', color: COLORS.red },
};

export default function AdminMerchantDetailScreen({ navigation, route }) {
  const merchantId = route?.params?.merchantId;
  const [tab, setTab] = useState('info');
  const [suspending, setSuspending] = useState(false);
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(false);

  const charger = useCallback(() => {
    if (!merchantId) { setLoading(false); setErreur(true); return; }
    setLoading(true);
    setErreur(false);
    api.get(`/api/admin/merchants/${merchantId}`)
      .then((r) => setMerchant(r.data.merchant))
      .catch(() => setErreur(true))
      .finally(() => setLoading(false));
  }, [merchantId]);

  useEffect(() => { charger(); }, [charger]);

  const suspendMerchant = async () => {
    setSuspending(true);
    try {
      await api.patch(`/api/admin/merchants/${merchant.id}/suspend`);
      Alert.alert('Succès', 'Le compte a été suspendu.');
      charger();
    } catch (err) {
      Alert.alert('Erreur', "Impossible de suspendre le compte. Réessayez.");
    } finally {
      setSuspending(false);
    }
  };

  const confirmAction = (action, label) => {
    if (action === 'suspend') {
      Alert.alert(label, `Confirmer pour ${merchant.name} ?`, [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', style: 'destructive', onPress: suspendMerchant },
      ]);
      return;
    }
    // No backend endpoint exists yet for contact / payout / commission / export actions.
    Alert.alert(label, 'Cette action n\'est pas encore disponible.');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (erreur || !merchant) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontSize: 40 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, marginTop: 12, textAlign: 'center' }}>
            Impossible de récupérer la fiche marchand.
          </Text>
          <TouchableOpacity onPress={charger} style={{ marginTop: 16, backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fiche marchand</Text>
        <View style={[styles.statusPill, { backgroundColor: merchant.status === 'active' ? COLORS.green + '22' : COLORS.red + '22' }]}>
          <Text style={{ color: merchant.status === 'active' ? COLORS.green : COLORS.red, fontSize: 11, fontWeight: '700' }}>
            {merchant.status === 'active' ? 'Actif' : 'Suspendu'}
          </Text>
        </View>
      </View>

      {/* Profile */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 34 }}>🍕</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.merchantName}>{merchant.name}</Text>
          <Text style={styles.merchantCat}>{merchant.category} · {merchant.id}</Text>
          <Text style={styles.merchantOwner}>👤 {merchant.owner} · {merchant.phone}</Text>
          <View style={styles.pillRow}>
            {merchant.verified && <View style={styles.verifiedPill}><Text style={styles.verifiedText}>✅ Vérifié</Text></View>}
            <Text style={styles.ratingText}>⭐ {merchant.rating?.toFixed(1) ?? '—'}</Text>
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
                { label: 'Commandes total', value: merchant.totalOrders.toLocaleString(), color: COLORS.white },
                { label: 'CA ce mois', value: `${merchant.revenueMonth.toLocaleString()} TND`, color: COLORS.accent },
                { label: 'CA total', value: `${(merchant.revenueTotal / 1000).toFixed(1)}k TND`, color: COLORS.blue },
                { label: 'Complétion', value: `${merchant.completionRate}%`, color: COLORS.green },
                { label: 'Produits', value: merchant.products, color: COLORS.white },
              ].map((k, i) => (
                <View key={i} style={styles.kpiCard}>
                  <Text style={[styles.kpiVal, { color: k.color }]}>{k.value}</Text>
                  <Text style={styles.kpiLabel}>{k.label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoRow}>📍 Adresse : <Text style={{ color: COLORS.white }}>{merchant.address}</Text></Text>
              <Text style={styles.infoRow}>📅 Inscrit le : <Text style={{ color: COLORS.white }}>{new Date(merchant.joinDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text></Text>
              <Text style={styles.infoRow}>✉️ Email : <Text style={{ color: COLORS.accent }}>{merchant.email || '—'}</Text></Text>
            </View>
          </>
        )}

        {tab === 'orders' && (
          <>
            {merchant.recentOrders.length === 0 && (
              <Text style={{ color: COLORS.muted, textAlign: 'center', marginTop: 24 }}>Aucune commande</Text>
            )}
            {merchant.recentOrders.map(o => {
              const meta = STATUS_META[o.status] || { label: o.status, color: COLORS.muted };
              return (
                <View key={o.id} style={styles.orderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderId}>{o.id} · {o.client}</Text>
                    <Text style={styles.orderDate}>{new Date(o.date).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
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
            {merchant.docs.length === 0 && (
              <Text style={{ color: COLORS.muted, textAlign: 'center', marginTop: 24 }}>Aucun document</Text>
            )}
            {merchant.docs.map((d, i) => {
              const meta = DOC_META[d.status] || { label: d.status || '—', color: COLORS.muted };
              return (
                <View key={d.label || i} style={[styles.docCard, { borderColor: meta.color + '55' }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docLabel}>{d.label || `Document ${i + 1}`}</Text>
                    <Text style={styles.docExpire}>Expire : {d.expires || '—'}</Text>
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
              <TouchableOpacity
                style={[styles.suspendBtn, suspending && { opacity: 0.6 }]}
                onPress={() => confirmAction('suspend', 'Suspendre')}
                disabled={suspending}
              >
                <Text style={styles.suspendBtnText}>{suspending ? 'Suspension...' : '🚫 Suspendre le compte'}</Text>
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
