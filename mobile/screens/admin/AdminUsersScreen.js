import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', purple: '#9B59B6',
};

const ROLES = ['Tous', 'CLIENT', 'CHAUFFEUR', 'LIVREUR', 'DEPANNEUR', 'MARCHAND', 'ADMIN'];
const ROLE_COLOR = {
  CLIENT: COLORS.blue, CHAUFFEUR: COLORS.accent, LIVREUR: COLORS.green,
  DEPANNEUR: COLORS.red, MARCHAND: COLORS.purple, ADMIN: '#E74C3C',
};

const MOCK_USERS = [
  { id: '1', name: 'Nadia Khelifi', email: 'nadia@test.tn', phone: '+216 55 123 456', role: 'CLIENT', banned: false, createdAt: '2025-01-12', ordersCount: 34 },
  { id: '2', name: 'Karim Ben Salah', email: 'karim@test.tn', phone: '+216 98 765 432', role: 'CHAUFFEUR', banned: false, createdAt: '2025-02-05', ordersCount: 812 },
  { id: '3', name: 'Yassine Mejri', email: 'yassine@test.tn', phone: '+216 22 334 455', role: 'LIVREUR', banned: true, createdAt: '2025-03-20', ordersCount: 145 },
  { id: '4', name: 'Mounir Tlili', email: 'mounir@test.tn', phone: '+216 77 889 900', role: 'DEPANNEUR', banned: false, createdAt: '2025-01-30', ordersCount: 67 },
  { id: '5', name: 'Sara Mansour', email: 'sara@test.tn', phone: '+216 54 001 122', role: 'MARCHAND', banned: false, createdAt: '2025-04-10', ordersCount: 203 },
  { id: '6', name: 'Admin Principal', email: 'admin@easyway.tn', phone: '+216 70 000 000', role: 'ADMIN', banned: false, createdAt: '2025-01-01', ordersCount: 0 },
];

function UserCard({ item, onBan, onUnban, onView }) {
  return (
    <TouchableOpacity style={[styles.card, item.banned && styles.cardBanned]} onPress={() => onView(item)} activeOpacity={0.85}>
      <View style={styles.cardLeft}>
        <View style={[styles.avatar, { backgroundColor: (ROLE_COLOR[item.role] || COLORS.muted) + '30' }]}>
          <Text style={[styles.avatarText, { color: ROLE_COLOR[item.role] || COLORS.muted }]}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.userName}>{item.name}</Text>
            {item.banned && <View style={styles.bannedBadge}><Text style={styles.bannedText}>BANNI</Text></View>}
          </View>
          <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
          <Text style={styles.userPhone}>{item.phone}</Text>
        </View>
      </View>
      <View style={styles.cardRight}>
        <View style={[styles.roleBadge, { backgroundColor: (ROLE_COLOR[item.role] || COLORS.muted) + '20' }]}>
          <Text style={[styles.roleText, { color: ROLE_COLOR[item.role] || COLORS.muted }]}>{item.role}</Text>
        </View>
        <Text style={styles.ordersCount}>{item.ordersCount} cmd</Text>
        {item.role !== 'ADMIN' && (
          <TouchableOpacity
            style={[styles.banBtn, item.banned ? styles.unbanBtn : styles.banBtnRed]}
            onPress={() => item.banned ? onUnban(item) : onBan(item)}
          >
            <Text style={[styles.banBtnText, item.banned && { color: COLORS.green }]}>
              {item.banned ? 'Débannir' : 'Bannir'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function AdminUsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('Tous');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/admin/users?limit=50')
      .then(r => setUsers(r.data.users || MOCK_USERS))
      .catch(() => setUsers(MOCK_USERS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleBan = (user) => {
    Alert.alert(`Bannir ${user.name}`, 'Cet utilisateur ne pourra plus se connecter.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Bannir', style: 'destructive', onPress: async () => {
          try {
            await api.post(`/api/admin/users/${user.id}/ban`);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, banned: true } : u));
          } catch { Alert.alert('Erreur', 'Impossible de bannir.'); }
        },
      },
    ]);
  };

  const handleUnban = async (user) => {
    try {
      await api.post(`/api/admin/users/${user.id}/unban`);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, banned: false } : u));
    } catch { Alert.alert('Erreur', 'Impossible de débannir.'); }
  };

  const filtered = users.filter(u => {
    const matchRole = role === 'Tous' || u.role === role;
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
    return matchRole && matchSearch;
  });

  const stats = {
    total: users.length,
    banned: users.filter(u => u.banned).length,
    providers: users.filter(u => ['CHAUFFEUR','LIVREUR','DEPANNEUR','MARCHAND'].includes(u.role)).length,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Utilisateurs</Text>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}>
          <Text style={{ color: COLORS.accent, fontSize: 20 }}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{stats.total}</Text>
          <Text style={styles.statLabel}>total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{stats.providers}</Text>
          <Text style={styles.statLabel}>prestataires</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.red }]}>{stats.banned}</Text>
          <Text style={styles.statLabel}>bannis</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Nom, email, téléphone..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Role filter */}
      <FlatList
        horizontal
        data={ROLES}
        keyExtractor={r => r}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.roleFilter}
        renderItem={({ item: r }) => (
          <TouchableOpacity
            style={[styles.roleBtn, role === r && styles.roleBtnActive]}
            onPress={() => setRole(r)}
          >
            <Text style={[styles.roleBtnLabel, role === r && styles.roleBtnLabelActive]}>{r}</Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={u => u.id}
          renderItem={({ item }) => (
            <UserCard item={item} onBan={handleBan} onUnban={handleUnban} onView={() => {}} />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ fontSize: 40 }}>👥</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucun utilisateur trouvé</Text>
            </View>
          }
        />
      )}
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
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  refreshBtn: { width: 40, alignItems: 'flex-end' },
  statsBar: {
    flexDirection: 'row', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  statLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  searchRow: { paddingHorizontal: 16, paddingVertical: 10 },
  searchInput: {
    backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 10, color: COLORS.text, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  roleFilter: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  roleBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  roleBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  roleBtnLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  roleBtnLabelActive: { color: '#000' },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 12,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center',
  },
  cardBanned: { opacity: 0.6, borderColor: COLORS.red + '40' },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800' },
  userInfo: { flex: 1 },
  userName: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  userEmail: { color: COLORS.muted, fontSize: 11, marginTop: 1 },
  userPhone: { color: COLORS.muted, fontSize: 11, marginTop: 1 },
  bannedBadge: { backgroundColor: COLORS.red + '30', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  bannedText: { color: COLORS.red, fontSize: 9, fontWeight: '800' },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  roleBadge: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  roleText: { fontSize: 10, fontWeight: '800' },
  ordersCount: { color: COLORS.muted, fontSize: 11 },
  banBtn: {
    borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, marginTop: 2,
  },
  banBtnRed: { borderColor: COLORS.red + '60', backgroundColor: COLORS.red + '10' },
  unbanBtn: { borderColor: COLORS.green + '60', backgroundColor: COLORS.green + '10' },
  banBtnText: { color: COLORS.red, fontSize: 11, fontWeight: '700' },
});
