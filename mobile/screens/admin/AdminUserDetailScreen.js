import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F', orange: '#E67E22', blue: '#1565C0',
};

const MOCK_USER = {
  id: 'USR-0042',
  name: 'Sonia Mansour',
  email: 'sonia.mansour@email.com',
  phone: '+216 55 234 567',
  role: 'CLIENT',
  status: 'ACTIVE',
  joinedAt: '12/03/2024',
  lastSeen: 'il y a 2h',
  avatar: '👩',
  stats: { orders: 34, totalSpent: 287.5, disputes: 1, referrals: 5 },
  wallet: { balance: 18.5, totalCredited: 150.0 },
  recentOrders: [
    { id: 'ORD001', type: 'Taxi', date: '15/01', amount: 8.5, status: 'done' },
    { id: 'ORD002', type: 'Épicerie', date: '13/01', amount: 42.0, status: 'done' },
    { id: 'ORD003', type: 'SOS', date: '10/01', amount: 55.0, status: 'done' },
  ],
  flags: [],
};

const STATUS_COLORS = { ACTIVE: COLORS.green, SUSPENDED: COLORS.red, PENDING: COLORS.orange, BANNED: '#333' };
const ROLE_COLORS = { CLIENT: COLORS.blue, CHAUFFEUR: COLORS.accent, LIVREUR: COLORS.purple, ADMIN: COLORS.red };

export default function AdminUserDetailScreen({ navigation, route }) {
  const userId = route?.params?.userId || MOCK_USER.id;
  const [user, setUser] = useState(MOCK_USER);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('profil');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/admin/users/${userId}`);
        if (res.data?.user) setUser(res.data.user);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const handleAction = (action) => {
    const labels = {
      suspend: 'Suspendre le compte',
      ban: 'Bannir définitivement',
      reset_password: 'Réinitialiser le mot de passe',
      add_credit: 'Créditer le portefeuille',
    };
    Alert.alert(labels[action], `Confirmer : ${labels[action]} pour ${user.name} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Confirmer', style: action === 'ban' ? 'destructive' : 'default',
        onPress: async () => {
          try {
            await api.post(`/api/admin/users/${userId}/action`, { action });
            Alert.alert('Fait', `${labels[action]} appliqué.`);
          } catch {
            Alert.alert('Erreur', 'Action impossible.');
          }
        },
      },
    ]);
  };

  if (loading) return <SafeAreaView style={styles.root}><ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>👤 Détail Utilisateur</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* User card */}
      <View style={styles.userCard}>
        <Text style={{ fontSize: 48 }}>{user.avatar}</Text>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userId}>{user.id}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: (STATUS_COLORS[user.status] || COLORS.muted) + '22' }]}>
              <Text style={[styles.badgeText, { color: STATUS_COLORS[user.status] || COLORS.muted }]}>{user.status}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: (ROLE_COLORS[user.role] || COLORS.muted) + '22' }]}>
              <Text style={[styles.badgeText, { color: ROLE_COLORS[user.role] || COLORS.muted }]}>{user.role}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[{ key: 'profil', label: 'Profil' }, { key: 'commandes', label: 'Commandes' }, { key: 'actions', label: 'Actions' }].map((t) => (
          <TouchableOpacity key={t.key} style={[styles.tab, tab === t.key && styles.tabActive]} onPress={() => setTab(t.key)}>
            <Text style={[styles.tabText, tab === t.key && { color: '#000' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {tab === 'profil' && (
          <>
            {[
              { label: 'Email', value: user.email },
              { label: 'Téléphone', value: user.phone },
              { label: 'Inscrit le', value: user.joinedAt },
              { label: 'Dernière activité', value: user.lastSeen },
            ].map((r) => (
              <View key={r.label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{r.label}</Text>
                <Text style={styles.infoValue}>{r.value}</Text>
              </View>
            ))}

            <Text style={styles.sectionLabel}>Statistiques</Text>
            <View style={styles.statsGrid}>
              {[
                { label: 'Commandes', value: user.stats.orders, color: COLORS.blue },
                { label: 'Dépenses', value: `${user.stats.totalSpent} TND`, color: COLORS.accent },
                { label: 'Litiges', value: user.stats.disputes, color: COLORS.red },
                { label: 'Parrainages', value: user.stats.referrals, color: COLORS.green },
              ].map((s) => (
                <View key={s.label} style={styles.statBox}>
                  <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLbl}>{s.label}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Portefeuille</Text>
            <View style={styles.walletCard}>
              <Text style={styles.walletBalance}>{user.wallet.balance.toFixed(3)} TND</Text>
              <Text style={styles.walletSub}>Total crédité : {user.wallet.totalCredited.toFixed(3)} TND</Text>
            </View>
          </>
        )}

        {tab === 'commandes' && user.recentOrders.map((o) => (
          <View key={o.id} style={styles.orderRow}>
            <Text style={styles.orderType}>{o.type}</Text>
            <Text style={styles.orderDate}>{o.date}</Text>
            <Text style={[styles.orderAmount, { color: COLORS.accent }]}>{o.amount.toFixed(3)} TND</Text>
            <View style={[styles.orderStatus, { backgroundColor: COLORS.green + '22' }]}>
              <Text style={{ color: COLORS.green, fontSize: 11, fontWeight: '700' }}>✓</Text>
            </View>
          </View>
        ))}

        {tab === 'actions' && (
          <View style={styles.actionsBox}>
            {[
              { action: 'reset_password', label: '🔑 Réinitialiser mot de passe', color: COLORS.blue },
              { action: 'add_credit',     label: '💳 Créditer le portefeuille',  color: COLORS.green },
              { action: 'suspend',        label: '⏸ Suspendre le compte',        color: COLORS.orange },
              { action: 'ban',            label: '🚫 Bannir définitivement',     color: COLORS.red },
            ].map((a) => (
              <TouchableOpacity
                key={a.action}
                style={[styles.actionBtn, { borderColor: a.color }]}
                onPress={() => handleAction(a.action)}
              >
                <Text style={[styles.actionBtnText, { color: a.color }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 24 }} />
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
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  userCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, margin: 16, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, padding: 16,
  },
  userName: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
  userId: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  tab: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  infoLabel: { color: COLORS.muted, fontSize: 13 },
  infoValue: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  sectionLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 10 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statBox: { width: '47%', backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14, alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '900' },
  statLbl: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  walletCard: {
    backgroundColor: '#1A1200', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: COLORS.accent, alignItems: 'center',
  },
  walletBalance: { color: COLORS.accent, fontSize: 28, fontWeight: '900' },
  walletSub: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  orderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  orderType: { flex: 1, color: COLORS.white, fontSize: 14, fontWeight: '600' },
  orderDate: { color: COLORS.muted, fontSize: 12 },
  orderAmount: { fontSize: 14, fontWeight: '800', minWidth: 70, textAlign: 'right' },
  orderStatus: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionsBox: { gap: 12, paddingTop: 8 },
  actionBtn: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1.5, padding: 16, alignItems: 'center',
  },
  actionBtnText: { fontSize: 14, fontWeight: '700' },
});
