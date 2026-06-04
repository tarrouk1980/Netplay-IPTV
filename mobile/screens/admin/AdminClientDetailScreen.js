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

const MOCK_CLIENT = {
  id: 'USR-0441', name: 'Sana Belhaj', phone: '+216 22 441 998', email: 'sana.b@gmail.com',
  joinDate: '15 mars 2024', zone: 'Tunis Centre', status: 'active', kycStatus: 'verified',
  wallet: 142.50, easypass: true, referralCode: 'SANA441', referred: 3,
  totalOrders: 47, totalSpent: 812.00, avgOrder: 17.26, cancelRate: 4.3,
  rating: 4.7, lastActive: 'Il y a 2h',
  recentOrders: [
    { id: 'TXI-7741', type: '🚕 Taxi', date: 'Auj. 14:32', amount: 16.50, status: 'completed' },
    { id: 'DEL-4421', type: '🛵 Livraison', date: 'Hier 13:10', amount: 8.50, status: 'completed' },
    { id: 'SOS-0041', type: '🔧 SOS', date: '02/06', amount: 65.00, status: 'completed' },
    { id: 'GRC-1120', type: '🍕 Épicerie', date: '01/06', amount: 22.00, status: 'cancelled' },
  ],
  flags: [],
};

const STATUS_COLOR = { completed: COLORS.green, cancelled: COLORS.red, pending: COLORS.orange };

export default function AdminClientDetailScreen({ navigation, route }) {
  const [tab, setTab] = useState('info');
  const client = MOCK_CLIENT;

  const confirmAction = (action, label) => {
    Alert.alert(label, `Confirmer : ${label} pour ${client.name} ?`, [
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
        <Text style={styles.headerTitle}>Fiche client</Text>
        <View style={[styles.statusPill, { backgroundColor: client.status === 'active' ? COLORS.green + '22' : COLORS.red + '22' }]}>
          <Text style={{ color: client.status === 'active' ? COLORS.green : COLORS.red, fontSize: 11, fontWeight: '700' }}>
            {client.status === 'active' ? 'Actif' : 'Suspendu'}
          </Text>
        </View>
      </View>

      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 36 }}>👤</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.clientName}>{client.name}</Text>
          <Text style={styles.clientId}>{client.id} · {client.phone}</Text>
          <Text style={styles.clientEmail}>{client.email}</Text>
          <View style={styles.pillRow}>
            {client.easypass && (
              <View style={styles.passPill}><Text style={styles.passText}>⭐ EasyPass</Text></View>
            )}
            <View style={[styles.kycPill, { backgroundColor: COLORS.green + '22' }]}>
              <Text style={{ color: COLORS.green, fontSize: 10, fontWeight: '700' }}>KYC vérifié</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {[['info', 'Infos'], ['orders', 'Commandes'], ['actions', 'Actions']].map(([val, lbl]) => (
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
            {/* KPI grid */}
            <View style={styles.kpiGrid}>
              {[
                { label: 'Commandes', value: client.totalOrders, color: COLORS.white },
                { label: 'Dépensé total', value: `${client.totalSpent.toFixed(0)} TND`, color: COLORS.accent },
                { label: 'Panier moyen', value: `${client.avgOrder.toFixed(2)} TND`, color: COLORS.blue },
                { label: 'Taux annul.', value: `${client.cancelRate}%`, color: client.cancelRate > 10 ? COLORS.red : COLORS.muted },
                { label: 'Note moy.', value: `⭐ ${client.rating}`, color: COLORS.accent },
                { label: 'Solde wallet', value: `${client.wallet.toFixed(2)} TND`, color: COLORS.green },
              ].map((k, i) => (
                <View key={i} style={styles.kpiCard}>
                  <Text style={[styles.kpiVal, { color: k.color }]}>{k.value}</Text>
                  <Text style={styles.kpiLabel}>{k.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoRow}>📍 Zone : <Text style={{ color: COLORS.white }}>{client.zone}</Text></Text>
              <Text style={styles.infoRow}>📅 Inscrit le : <Text style={{ color: COLORS.white }}>{client.joinDate}</Text></Text>
              <Text style={styles.infoRow}>🕐 Dernière activité : <Text style={{ color: COLORS.white }}>{client.lastActive}</Text></Text>
              <Text style={styles.infoRow}>🎁 Code parrain : <Text style={{ color: COLORS.accent }}>{client.referralCode}</Text> ({client.referred} filleuls)</Text>
            </View>
          </>
        )}

        {tab === 'orders' && (
          <>
            {client.recentOrders.map((o) => (
              <View key={o.id} style={styles.orderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderType}>{o.type} · {o.id}</Text>
                  <Text style={styles.orderDate}>{o.date}</Text>
                </View>
                <Text style={[styles.orderStatus, { color: STATUS_COLOR[o.status] }]}>
                  {o.status === 'completed' ? 'Terminé' : o.status === 'cancelled' ? 'Annulé' : 'En cours'}
                </Text>
                <Text style={styles.orderAmount}>{o.amount.toFixed(2)} TND</Text>
              </View>
            ))}
          </>
        )}

        {tab === 'actions' && (
          <>
            <View style={styles.actionsCard}>
              <Text style={styles.actionsTitle}>⚙️ Actions admin</Text>

              {[
                { icon: '✉️', label: 'Envoyer un message', action: 'message', color: COLORS.blue },
                { icon: '💰', label: 'Créditer le wallet', action: 'credit', color: COLORS.green },
                { icon: '🔄', label: 'Rembourser une commande', action: 'refund', color: COLORS.orange },
                { icon: '📋', label: 'Exporter données client', action: 'export', color: COLORS.muted },
              ].map((a) => (
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
                style={styles.suspendBtn}
                onPress={() => confirmAction('suspend', 'Suspendre le compte')}
              >
                <Text style={styles.suspendBtnText}>🚫 Suspendre le compte</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.banBtn}
                onPress={() => confirmAction('ban', 'Bannir le compte')}
              >
                <Text style={styles.banBtnText}>🔨 Bannir définitivement</Text>
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
  profileCard: {
    flexDirection: 'row', gap: 12, padding: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.border,
  },
  clientName: { color: COLORS.white, fontSize: 16, fontWeight: '800', marginBottom: 2 },
  clientId: { color: COLORS.accent, fontSize: 11, marginBottom: 2 },
  clientEmail: { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  pillRow: { flexDirection: 'row', gap: 6 },
  passPill: { backgroundColor: COLORS.accent + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  passText: { color: COLORS.accent, fontSize: 10, fontWeight: '700' },
  kycPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  tabRow: { flexDirection: 'row', gap: 8, padding: 12 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  kpiCard: { width: '31%', backgroundColor: COLORS.surface, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  kpiVal: { fontSize: 14, fontWeight: '900', marginBottom: 2 },
  kpiLabel: { color: COLORS.muted, fontSize: 10, textAlign: 'center' },
  infoCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  infoRow: { color: COLORS.muted, fontSize: 13 },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  orderType: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  orderDate: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  orderStatus: { fontSize: 12, fontWeight: '700' },
  orderAmount: { color: COLORS.accent, fontSize: 13, fontWeight: '800' },
  actionsCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  actionsTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, marginBottom: 8 },
  actionBtnText: { flex: 1, fontSize: 13, fontWeight: '600' },
  dangerZone: { backgroundColor: '#1A0808', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.red + '55' },
  dangerTitle: { color: COLORS.red, fontSize: 13, fontWeight: '700', marginBottom: 12 },
  suspendBtn: { backgroundColor: COLORS.orange + '22', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: COLORS.orange },
  suspendBtnText: { color: COLORS.orange, fontSize: 13, fontWeight: '700' },
  banBtn: { backgroundColor: COLORS.red + '22', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.red },
  banBtnText: { color: COLORS.red, fontSize: 13, fontWeight: '700' },
});
