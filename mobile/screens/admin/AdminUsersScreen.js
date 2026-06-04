import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', purple: '#9B59B6',
};

const ROLE_COLORS = {
  CLIENT: COLORS.blue, CHAUFFEUR: COLORS.accent, LIVREUR: COLORS.green,
  DEPANNEUR: COLORS.red, MARCHAND: COLORS.purple, ADMIN: COLORS.muted,
};
const ROLE_ICONS = { CLIENT: '👤', CHAUFFEUR: '🚕', LIVREUR: '📦', DEPANNEUR: '🔧', MARCHAND: '🏪', ADMIN: '⚙️' };

const MOCK_USERS = [
  { id: 'U001', name: 'Nadia Khelil', phone: '+216 55 111 222', role: 'CLIENT', active: true, joined: '15/01/2026', orders: 34 },
  { id: 'U002', name: 'Mohamed Ali Trabelsi', phone: '+216 22 333 444', role: 'CHAUFFEUR', active: true, joined: '10/12/2025', orders: 312 },
  { id: 'U003', name: 'Sami Karoui', phone: '+216 98 555 666', role: 'LIVREUR', active: true, joined: '05/02/2026', orders: 187 },
  { id: 'U004', name: 'Rim Sassi', phone: '+216 50 777 888', role: 'CLIENT', active: false, joined: '20/03/2026', orders: 8 },
  { id: 'U005', name: 'Karim Mansouri', phone: '+216 71 999 000', role: 'DEPANNEUR', active: true, joined: '01/11/2025', orders: 94 },
  { id: 'U006', name: 'Pizza Roma Lac 1', phone: '+216 71 234 567', role: 'MARCHAND', active: true, joined: '15/09/2025', orders: 1240 },
];

const ROLES = ['Tous', 'CLIENT', 'CHAUFFEUR', 'LIVREUR', 'DEPANNEUR', 'MARCHAND'];

function UserRow({ item, onPress }) {
  const rc = ROLE_COLORS[item.role] || COLORS.muted;
  return (
    <TouchableOpacity style={styles.userRow} onPress={() => onPress(item)} activeOpacity={0.8}>
      <View style={[styles.userAvatar, { backgroundColor: rc + '20' }]}>
        <Text style={{ fontSize: 20 }}>{ROLE_ICONS[item.role] || '👤'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.userTopRow}>
          <Text style={styles.userName}>{item.name}</Text>
          <View style={[styles.activeDot, { backgroundColor: item.active ? COLORS.green : COLORS.red }]} />
        </View>
        <Text style={styles.userPhone}>{item.phone}</Text>
      </View>
      <View style={styles.userRight}>
        <View style={[styles.roleBadge, { borderColor: rc + '40', backgroundColor: rc + '15' }]}>
          <Text style={[styles.roleText, { color: rc }]}>{item.role}</Text>
        </View>
        <Text style={styles.userOrders}>{item.orders} actions</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AdminUsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tous');

  const load = useCallback(() => {
    api.get('/api/admin/users')
      .then(r => setUsers(r.data.users || MOCK_USERS))
      .catch(() => setUsers(MOCK_USERS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'Tous' || u.role === roleFilter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    return matchRole && matchSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👥 Utilisateurs</Text>
        <Text style={styles.headerCount}>{filtered.length}</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Nom ou téléphone..."
        placeholderTextColor={COLORS.muted}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={ROLES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={r => r}
        style={{ maxHeight: 44 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.roleBtn, roleFilter === item && styles.roleBtnActive]}
            onPress={() => setRoleFilter(item)}
          >
            <Text style={[styles.roleBtnText, roleFilter === item && styles.roleBtnTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <UserRow item={item} onPress={() => navigation.navigate('AdminUserDetail', { userId: item.id })} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 36 }}>🔍</Text>
              <Text style={{ color: COLORS.muted, marginTop: 10 }}>Aucun utilisateur trouvé</Text>
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
  backBtn: { padding: 4 },
  backText: { color: COLORS.accent, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  headerCount: {
    color: COLORS.accent, fontSize: 13, fontWeight: '700',
    backgroundColor: COLORS.accent + '20', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  searchInput: {
    margin: 16, marginBottom: 8, backgroundColor: COLORS.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, color: COLORS.text, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  roleBtn: {
    borderRadius: 20, paddingHorizontal: 13, paddingVertical: 7,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  roleBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  roleBtnText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  roleBtnTextActive: { color: COLORS.accent },
  list: { padding: 16 },
  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 12,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  userAvatar: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  userTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  userName: { color: COLORS.text, fontSize: 14, fontWeight: '700', flex: 1 },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  userPhone: { color: COLORS.muted, fontSize: 12 },
  userRight: { alignItems: 'flex-end', gap: 5 },
  roleBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
  roleText: { fontSize: 10, fontWeight: '700' },
  userOrders: { color: COLORS.muted, fontSize: 10 },
  empty: { alignItems: 'center', paddingTop: 60 },
});
