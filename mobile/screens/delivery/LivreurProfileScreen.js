import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Switch, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

export default function LivreurProfileScreen({ navigation }) {
  const { user } = useAuthStore();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tab, setTab] = useState('info');
  const [today, setToday] = useState(null);
  const [month, setMonth] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/api/delivery/livreur/earnings', { params: { period: 'today' } }),
      api.get('/api/delivery/livreur/earnings', { params: { period: 'month' } }),
    ])
      .then(([t, m]) => { setToday(t.data); setMonth(m.data); })
      .catch(() => { setToday(null); setMonth(null); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon profil</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
          <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '600' }}>Modifier</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar + Name */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 40 }}>🛵</Text>
        </View>
        <Text style={styles.profileName}>{user?.name || 'Livreur'}</Text>
        <Text style={styles.profileRole}>LIVREUR</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingText}>Depuis {joinDate}</Text>
        </View>
      </View>

      {/* Today stats */}
      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="small" style={{ marginBottom: 12 }} />
      ) : (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{today?.totalDeliveries ?? '—'}</Text>
            <Text style={styles.statLbl}>Livraisons auj.</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: COLORS.accent }]}>{today ? today.totalRevenue.toFixed(2) : '—'} TND</Text>
            <Text style={styles.statLbl}>Gains auj.</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: COLORS.green }]}>{month ? month.totalRevenue.toFixed(0) : '—'} TND</Text>
            <Text style={styles.statLbl}>Ce mois</Text>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabRow}>
        {[['info', 'Infos'], ['history', 'Historique']].map(([val, lbl]) => (
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
            <View style={styles.infoCard}>
              <Text style={styles.infoRow2}>📞 Téléphone : <Text style={{ color: COLORS.white }}>{user?.phone || '—'}</Text></Text>
              <Text style={styles.infoRow2}>🟢 Statut : <Text style={{ color: user?.isOnline ? COLORS.green : COLORS.muted }}>{user?.isOnline ? 'En ligne' : 'Hors ligne'}</Text></Text>
            </View>

            <Text style={styles.sectionTitle}>🔔 Préférences notifications</Text>
            <View style={styles.toggleCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Notifications push</Text>
                <Switch value={notifEnabled} onValueChange={setNotifEnabled} trackColor={{ true: COLORS.accent }} />
              </View>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Son pour nouvelles commandes</Text>
                <Switch value={soundEnabled} onValueChange={setSoundEnabled} trackColor={{ true: COLORS.accent }} />
              </View>
            </View>

            <Text style={styles.sectionTitle}>⚡ Actions rapides</Text>
            <View style={styles.actionsGrid}>
              {[
                { icon: '💰', label: 'Gains', screen: 'LivreurEarnings' },
                { icon: '📋', label: 'Commandes', screen: 'LivreurHistory' },
                { icon: '📞', label: 'Support', screen: 'Support' },
                { icon: '⚙️', label: 'Paramètres', screen: 'Settings' },
              ].map(a => (
                <TouchableOpacity
                  key={a.screen}
                  style={styles.actionCard}
                  onPress={() => navigation.navigate(a.screen)}
                >
                  <Text style={{ fontSize: 24 }}>{a.icon}</Text>
                  <Text style={styles.actionLabel}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {tab === 'history' && (
          <>
            {(month?.orders || []).slice(0, 5).map((d) => (
              <View key={d.id} style={styles.delivRow}>
                <Text style={styles.delivTime}>{new Date(d.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</Text>
                <Text style={styles.delivMerchant} numberOfLines={1}>{d.client?.name || 'Client'}</Text>
                <View style={{ flex: 1 }} />
                <Text style={styles.delivFare}>{Number(d.price || 0).toFixed(2)} TND</Text>
              </View>
            ))}
            {(!month || month.orders.length === 0) && (
              <Text style={{ color: COLORS.muted, textAlign: 'center', marginTop: 10 }}>Aucune livraison récente</Text>
            )}
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => navigation.navigate('LivreurHistory')}
            >
              <Text style={styles.seeAllText}>Voir tout l'historique ›</Text>
            </TouchableOpacity>
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
  profileCard: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.accent, marginBottom: 12,
  },
  profileName: { color: COLORS.white, fontSize: 20, fontWeight: '900', marginBottom: 4 },
  profileRole: { color: COLORS.muted, fontSize: 12, marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  ratingText: { color: COLORS.muted, fontSize: 12 },
  ratingDot: { color: COLORS.border },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.border },
  badgeText: { color: COLORS.accent, fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, gap: 8 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statNum: { color: COLORS.white, fontSize: 16, fontWeight: '900', marginBottom: 2 },
  statLbl: { color: COLORS.muted, fontSize: 10 },
  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  sectionTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 10, marginTop: 8 },
  infoCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16, gap: 8 },
  infoRow2: { color: COLORS.muted, fontSize: 13 },
  toggleCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  toggleLabel: { color: COLORS.white, fontSize: 13 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionCard: { width: '22%', backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, gap: 6 },
  actionLabel: { color: COLORS.muted, fontSize: 10, textAlign: 'center' },
  delivRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  delivTime: { color: COLORS.muted, fontSize: 12, width: 40 },
  delivMerchant: { color: COLORS.white, fontSize: 13, fontWeight: '600', maxWidth: 120 },
  delivFare: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  seeAllBtn: { alignItems: 'center', paddingVertical: 14 },
  seeAllText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
});
