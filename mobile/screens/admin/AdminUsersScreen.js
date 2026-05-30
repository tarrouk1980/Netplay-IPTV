import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import useAdminStore from '../../store/adminStore';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  accent: '#D32F2F',
  white: '#FFFFFF',
  muted: '#8A8A9A',
  border: '#2A2A3A',
  green: '#2E7D32',
  amber: '#F57C00',
  blue: '#1565C0',
};

const ROLE_FILTERS = [
  { key: '', label: 'Tous' },
  { key: 'CLIENT', label: 'Clients' },
  { key: 'CHAUFFEUR', label: 'Chauffeurs' },
  { key: 'LIVREUR', label: 'Livreurs' },
  { key: 'DEPANNEUR', label: 'Dépanneurs' },
  { key: 'MARCHAND', label: 'Marchands' },
];

const KYC_FILTERS = [
  { key: '', label: 'Tout' },
  { key: 'PENDING', label: 'En attente' },
  { key: 'APPROVED', label: 'Approuvé' },
  { key: 'REJECTED', label: 'Rejeté' },
];

const ROLE_COLORS = {
  CLIENT: '#1565C0',
  CHAUFFEUR: '#2E7D32',
  LIVREUR: '#F57C00',
  DEPANNEUR: '#6A1B9A',
  MARCHAND: '#00838F',
  ADMIN: '#D32F2F',
};

const KYC_COLORS = {
  PENDING: '#F57C00',
  APPROVED: '#2E7D32',
  REJECTED: '#D32F2F',
  NOT_REQUIRED: '#8A8A9A',
};

function ChipBar({ options, selected, onSelect }) {
  return (
    <View style={chips.row}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          style={[chips.chip, selected === opt.key && chips.chipActive]}
          onPress={() => onSelect(opt.key)}
          activeOpacity={0.8}
        >
          <Text style={[chips.label, selected === opt.key && chips.labelActive]}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const chips = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  label: { color: COLORS.muted, fontSize: 12, fontWeight: '500' },
  labelActive: { color: COLORS.white },
});

function InitialsAvatar({ name, role }) {
  const initials = (name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const color = ROLE_COLORS[role] || COLORS.muted;
  return (
    <View style={[avatar.circle, { backgroundColor: color + '33', borderColor: color }]}>
      <Text style={[avatar.text, { color }]}>{initials}</Text>
    </View>
  );
}

const avatar = StyleSheet.create({
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  text: { fontSize: 15, fontWeight: '700' },
});

function UserItem({ user, onSuspend, onReactivate, onDetail }) {
  const kycColor = KYC_COLORS[user.kycStatus] || COLORS.muted;
  const roleColor = ROLE_COLORS[user.role] || COLORS.muted;
  const isSuspended = user.kycStatus === 'REJECTED';

  return (
    <TouchableOpacity style={item.card} onPress={() => onDetail(user)} activeOpacity={0.85}>
      <InitialsAvatar name={user.name} role={user.role} />
      <View style={item.info}>
        <Text style={item.name} numberOfLines={1}>{user.name}</Text>
        <Text style={item.phone}>{user.phone}</Text>
        <View style={item.badges}>
          <View style={[item.badge, { backgroundColor: roleColor + '22', borderColor: roleColor }]}>
            <Text style={[item.badgeText, { color: roleColor }]}>{user.role}</Text>
          </View>
          <View style={[item.badge, { backgroundColor: kycColor + '22', borderColor: kycColor }]}>
            <Text style={[item.badgeText, { color: kycColor }]}>{user.kycStatus}</Text>
          </View>
        </View>
      </View>
      <View style={item.actions}>
        {isSuspended ? (
          <TouchableOpacity style={[item.actionBtn, { backgroundColor: COLORS.green + '22' }]} onPress={() => onReactivate(user)}>
            <Text style={[item.actionTxt, { color: COLORS.green }]}>✓</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[item.actionBtn, { backgroundColor: COLORS.accent + '22' }]} onPress={() => onSuspend(user)}>
            <Text style={[item.actionTxt, { color: COLORS.accent }]}>⏸</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const item = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 14,
    marginVertical: 5,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  info: { flex: 1, gap: 4 },
  name: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  phone: { color: COLORS.muted, fontSize: 12 },
  badges: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  actions: { gap: 8 },
  actionBtn: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  actionTxt: { fontSize: 16, fontWeight: '700' },
});

export default function AdminUsersScreen({ navigation }) {
  const { users, usersTotal, usersTotalPages, isLoading, fetchUsers, suspendUser, reactivateUser } =
    useAdminStore();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(
    (pg = 1) => {
      const filters = { page: pg, limit: 20 };
      if (roleFilter) filters.role = roleFilter;
      if (kycFilter) filters.kycStatus = kycFilter;
      if (search.trim()) filters.search = search.trim();
      fetchUsers(filters);
      setPage(pg);
    },
    [roleFilter, kycFilter, search, fetchUsers]
  );

  useEffect(() => {
    load(1);
  }, [roleFilter, kycFilter]);

  const handleSearch = () => load(1);

  const handleSuspend = (user) => {
    Alert.alert('Suspendre', `Suspendre ${user.name} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Suspendre',
        style: 'destructive',
        onPress: async () => {
          try {
            await suspendUser(user.id);
            Alert.alert('Fait', 'Compte suspendu.');
          } catch (e) {
            Alert.alert('Erreur', e.message);
          }
        },
      },
    ]);
  };

  const handleReactivate = (user) => {
    Alert.alert('Réactiver', `Réactiver ${user.name} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Réactiver',
        onPress: async () => {
          try {
            await reactivateUser(user.id);
            Alert.alert('Fait', 'Compte réactivé.');
          } catch (e) {
            Alert.alert('Erreur', e.message);
          }
        },
      },
    ]);
  };

  const handleDetail = (user) => {
    navigation.navigate('AdminUserDetail', { userId: user.id });
  };

  const renderFooter = () => {
    if (!isLoading || users.length === 0) return null;
    return <ActivityIndicator color={COLORS.accent} style={{ margin: 16 }} />;
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>👤 Utilisateurs</Text>
          <Text style={styles.headerSub}>{usersTotal} utilisateurs</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Nom, téléphone, email..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnTxt}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Role chips */}
      <ChipBar options={ROLE_FILTERS} selected={roleFilter} onSelect={setRoleFilter} />

      {/* KYC chips */}
      <ChipBar options={KYC_FILTERS} selected={kycFilter} onSelect={setKycFilter} />

      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        renderItem={({ item: user }) => (
          <UserItem
            user={user}
            onSuspend={handleSuspend}
            onReactivate={handleReactivate}
            onDetail={handleDetail}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isLoading && users.length === 0} onRefresh={() => load(1)} tintColor={COLORS.accent} />
        }
        ListFooterComponent={renderFooter}
        onEndReached={() => {
          if (page < usersTotalPages && !isLoading) load(page + 1);
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.empty}>Aucun utilisateur trouvé</Text>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 14,
  },
  backBtn: { padding: 4 },
  backTxt: { color: COLORS.white, fontSize: 22 },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  headerSub: { color: COLORS.muted, fontSize: 12, marginTop: 1 },
  searchRow: {
    flexDirection: 'row',
    marginHorizontal: 14,
    marginTop: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.white,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnTxt: { fontSize: 18 },
  empty: { color: COLORS.muted, textAlign: 'center', marginTop: 40, fontSize: 14 },
});
