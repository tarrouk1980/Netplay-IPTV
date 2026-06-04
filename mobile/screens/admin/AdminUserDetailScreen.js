import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_USER = {
  id: 'U001', name: 'Sami Ben Ali', phone: '+21623456789', role: 'CLIENT',
  status: 'ACTIVE', createdAt: '12 jan. 2025', lastActive: 'Il y a 2h',
  totalOrders: 47, totalSpent: 342.500, rating: 4.7,
  email: 'sami.benali@email.com',
  documents: [{ key: 'cin', label: 'CIN', status: 'VERIFIED' }],
  recentOrders: [
    { id: 'O1', type: '🚕 Taxi', date: '03 juin', amount: 8.500, status: 'Terminée' },
    { id: 'O2', type: '🛵 Livraison', date: '01 juin', amount: 4.200, status: 'Terminée' },
    { id: 'O3', type: '🚕 Taxi', date: '29 mai', amount: 11.000, status: 'Terminée' },
  ],
};

const ROLE_COLORS = { CLIENT: COLORS.blue, CHAUFFEUR: COLORS.accent, LIVREUR: COLORS.green, DEPANNEUR: COLORS.orange, ADMIN: COLORS.red };

export default function AdminUserDetailScreen({ route, navigation }) {
  const { userId } = route.params || {};
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    api.get(`/api/admin/users/${userId}`)
      .then(r => setUser(r.data?.user || MOCK_USER))
      .catch(() => setUser(MOCK_USER))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleBan = () => {
    Alert.alert(
      user?.status === 'BANNED' ? 'Débloquer l\'utilisateur' : 'Bloquer l\'utilisateur',
      user?.status === 'BANNED'
        ? `Rétablir l'accès de ${user?.name} ?`
        : `Bloquer ${user?.name} ? Il ne pourra plus utiliser l'application.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: user?.status === 'BANNED' ? 'Débloquer' : 'Bloquer',
          style: 'destructive',
          onPress: async () => {
            setActing(true);
            const newStatus = user.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
            try {
              await api.patch(`/api/admin/users/${userId}/status`, { status: newStatus });
            } catch {}
            setUser(u => ({ ...u, status: newStatus }));
            setActing(false);
          },
        },
      ]
    );
  };

  const handleContact = () => {
    Alert.alert('Contacter', `Envoyer un message à ${user?.name} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'SMS', onPress: () => Alert.alert('SMS envoyé') },
      { text: 'Notification push', onPress: () => Alert.alert('Notification envoyée') },
    ]);
  };

  if (loading) return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
    </SafeAreaView>
  );

  const roleColor = ROLE_COLORS[user?.role] || COLORS.muted;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail utilisateur</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar + infos */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userPhone}>{user?.phone}</Text>
            <View style={styles.badgesRow}>
              <View style={[styles.roleBadge, { backgroundColor: roleColor + '20' }]}>
                <Text style={[styles.roleBadgeText, { color: roleColor }]}>{user?.role}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: user?.status === 'ACTIVE' ? COLORS.green + '20' : COLORS.red + '20' }]}>
                <Text style={[styles.statusBadgeText, { color: user?.status === 'ACTIVE' ? COLORS.green : COLORS.red }]}>
                  {user?.status === 'ACTIVE' ? '✅ Actif' : '🔴 Bloqué'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Commandes', value: user?.totalOrders },
            { label: 'Total dépensé', value: `${user?.totalSpent?.toFixed(3)} TND` },
            { label: 'Note', value: `⭐ ${user?.rating}` },
          ].map(s => (
            <View key={s.label} style={styles.statBox}>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Meta */}
        <View style={styles.metaCard}>
          {[
            { label: 'Email', value: user?.email },
            { label: 'Inscrit le', value: user?.createdAt },
            { label: 'Dernière activité', value: user?.lastActive },
          ].map(m => (
            <View key={m.label} style={styles.metaRow}>
              <Text style={styles.metaLabel}>{m.label}</Text>
              <Text style={styles.metaValue}>{m.value}</Text>
            </View>
          ))}
        </View>

        {/* Recent orders */}
        <Text style={styles.sectionTitle}>DERNIÈRES COMMANDES</Text>
        {user?.recentOrders?.map(o => (
          <View key={o.id} style={styles.orderRow}>
            <Text style={styles.orderType}>{o.type}</Text>
            <Text style={styles.orderDate}>{o.date}</Text>
            <Text style={styles.orderAmount}>{o.amount.toFixed(3)} TND</Text>
            <View style={styles.orderStatus}><Text style={styles.orderStatusText}>{o.status}</Text></View>
          </View>
        ))}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.contactBtn} onPress={handleContact}>
            <Text style={styles.contactBtnText}>💬 Contacter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.banBtn, user?.status === 'BANNED' && styles.unbanBtn, acting && { opacity: 0.5 }]}
            onPress={handleBan}
            disabled={acting}
          >
            {acting ? <ActivityIndicator color="#fff" size="small" /> : (
              <Text style={[styles.banBtnText, user?.status === 'BANNED' && { color: COLORS.green }]}>
                {user?.status === 'BANNED' ? '✅ Débloquer' : '🚫 Bloquer'}
              </Text>
            )}
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
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, width: 36 },
  backIcon: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.accent + '30', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.accent + '50',
  },
  avatarText: { color: COLORS.accent, fontSize: 22, fontWeight: '900' },
  userName: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  userPhone: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  badgesRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  roleBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  roleBadgeText: { fontSize: 11, fontWeight: '700' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statBox: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statVal: { color: COLORS.text, fontSize: 15, fontWeight: '900' },
  statLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  metaCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 16,
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: COLORS.border + '60' },
  metaLabel: { color: COLORS.muted, fontSize: 13 },
  metaValue: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  orderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, marginBottom: 6,
    borderWidth: 1, borderColor: COLORS.border,
  },
  orderType: { color: COLORS.text, fontSize: 13, flex: 1 },
  orderDate: { color: COLORS.muted, fontSize: 11 },
  orderAmount: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  orderStatus: { backgroundColor: COLORS.green + '20', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  orderStatusText: { color: COLORS.green, fontSize: 10, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  contactBtn: {
    flex: 1, backgroundColor: COLORS.blue + '20', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.blue + '40',
  },
  contactBtnText: { color: COLORS.blue, fontSize: 14, fontWeight: '700' },
  banBtn: {
    flex: 1, backgroundColor: COLORS.red + '20', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.red + '40',
  },
  unbanBtn: { backgroundColor: COLORS.green + '15', borderColor: COLORS.green + '40' },
  banBtnText: { color: COLORS.red, fontSize: 14, fontWeight: '700' },
});
