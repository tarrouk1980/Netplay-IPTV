import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  orange: '#F57C00',
  green: '#27AE60',
  accent: '#D32F2F',
  blue: '#1565C0',
};

const ROLE_ICONS = {
  CLIENT: '👤', CHAUFFEUR: '🚕', LIVREUR: '🛵', DEPANNEUR: '🛻', MARCHAND: '🏪', ADMIN: '🛡',
};

const MOCK_SESSIONS = [
  { id: 's1', userId: 'u1', userName: 'Sami Ben Ali', userRole: 'CLIENT', device: 'iPhone 14 Pro', platform: 'iOS', ip: '41.228.x.x', city: 'Tunis', lastActive: new Date(Date.now() - 5 * 60000).toISOString(), isOnline: true, sessionDuration: 1240 },
  { id: 's2', userId: 'u2', userName: 'Karim Bouzid', userRole: 'CHAUFFEUR', device: 'Samsung Galaxy S23', platform: 'Android', ip: '197.0.x.x', city: 'Sfax', lastActive: new Date(Date.now() - 2 * 60000).toISOString(), isOnline: true, sessionDuration: 3600 },
  { id: 's3', userId: 'u3', userName: 'Leila Mansour', userRole: 'CLIENT', device: 'Xiaomi 12', platform: 'Android', ip: '41.230.x.x', city: 'Sousse', lastActive: new Date(Date.now() - 30 * 60000).toISOString(), isOnline: false, sessionDuration: 420 },
  { id: 's4', userId: 'u4', userName: 'Ahmed Trabelsi', userRole: 'MARCHAND', device: 'iPad Pro', platform: 'iOS', ip: '41.229.x.x', city: 'Nabeul', lastActive: new Date(Date.now() - 1 * 60000).toISOString(), isOnline: true, sessionDuration: 7200 },
];

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
  return `${Math.floor(seconds / 3600)}h${Math.floor((seconds % 3600) / 60) > 0 ? Math.floor((seconds % 3600) / 60) + 'min' : ''}`;
}

function formatLastActive(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
  return `Il y a ${Math.floor(diff / 3600)}h`;
}

export default function AdminUserSessionsScreen({ navigation }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const load = useCallback(async (silent = false) => {
    try {
      const res = await api.get('/api/admin/sessions');
      setSessions(res.data.sessions || []);
    } catch {
      if (!silent) setSessions(MOCK_SESSIONS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(() => load(true), 15000);
    return () => clearInterval(iv);
  }, [load]);

  const handleForceLogout = (session) => {
    Alert.alert(
      'Déconnecter l\'utilisateur',
      `Voulez-vous forcer la déconnexion de ${session.userName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/api/admin/sessions/${session.userId}/logout`);
              load(true);
            } catch {
              Alert.alert('Erreur', 'Impossible de déconnecter cet utilisateur.');
            }
          },
        },
      ]
    );
  };

  const onlineCount = sessions.filter((s) => s.isOnline).length;
  const roles = ['ALL', 'CLIENT', 'CHAUFFEUR', 'LIVREUR', 'DEPANNEUR', 'MARCHAND'];
  const filtered = filter === 'ALL' ? sessions : sessions.filter((s) => s.userRole === filter);

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.blue} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>📱 Sessions actives</Text>
          <Text style={s.sub}>{onlineCount} connecté{onlineCount !== 1 ? 's' : ''} en ce moment</Text>
        </View>
        <View style={[s.badge, { backgroundColor: onlineCount > 0 ? COLORS.green : COLORS.muted }]}>
          <Text style={s.badgeTxt}>{onlineCount}</Text>
        </View>
      </View>

      {/* Role filter */}
      <FlatList
        horizontal
        data={roles}
        keyExtractor={(r) => r}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
        renderItem={({ item: role }) => {
          const count = role === 'ALL' ? sessions.length : sessions.filter((s) => s.userRole === role).length;
          return (
            <TouchableOpacity
              style={[s.filterTab, filter === role && s.filterTabActive]}
              onPress={() => setFilter(role)}
            >
              <Text style={[s.filterTxt, filter === role && s.filterTxtActive]}>
                {ROLE_ICONS[role] || '👥'} {count}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <FlatList
        data={filtered.sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0))}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={COLORS.blue} />}
        renderItem={({ item }) => (
          <View style={[s.card, item.isOnline && s.cardOnline]}>
            <View style={s.cardTop}>
              <View style={[s.avatar, { backgroundColor: item.isOnline ? COLORS.green + '22' : COLORS.muted + '11' }]}>
                <Text style={{ fontSize: 20 }}>{ROLE_ICONS[item.userRole] || '👤'}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={s.userName}>{item.userName}</Text>
                  <View style={[s.onlineDot, { backgroundColor: item.isOnline ? COLORS.green : COLORS.muted }]} />
                </View>
                <Text style={s.userRole}>{item.userRole} · {item.city}</Text>
                <Text style={s.device}>📱 {item.device} ({item.platform})</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                <Text style={s.lastActive}>{formatLastActive(item.lastActive)}</Text>
                <Text style={s.duration}>⏱ {formatDuration(item.sessionDuration)}</Text>
                <Text style={s.ip}>{item.ip}</Text>
              </View>
            </View>
            {item.isOnline && (
              <TouchableOpacity style={s.logoutBtn} onPress={() => handleForceLogout(item)}>
                <Text style={s.logoutBtnTxt}>🔌 Forcer déconnexion</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📱</Text>
            <Text style={s.emptyTitle}>Aucune session</Text>
            <Text style={s.emptySub}>Aucun utilisateur connecté pour le moment.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  sub: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  badge: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTxt: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  filterTab: { backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  filterTabActive: { borderColor: COLORS.blue, backgroundColor: COLORS.blue + '22' },
  filterTxt: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  filterTxtActive: { color: COLORS.blue },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 8, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  cardOnline: { borderColor: COLORS.green + '44' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  userName: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  onlineDot: { width: 7, height: 7, borderRadius: 4 },
  userRole: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  device: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  lastActive: { color: COLORS.muted, fontSize: 10 },
  duration: { color: COLORS.orange, fontSize: 10 },
  ip: { color: COLORS.muted, fontSize: 9 },
  logoutBtn: { backgroundColor: COLORS.accent + '11', borderRadius: 8, padding: 8, marginTop: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.accent + '44' },
  logoutBtnTxt: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center' },
});
