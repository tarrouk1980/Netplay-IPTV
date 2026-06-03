import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
  green: '#2ECC71',
  red: '#E74C3C',
};

const ROLE_COLORS = {
  CLIENT: '#3498DB',
  CHAUFFEUR: '#F5A623',
  LIVREUR: '#2ECC71',
  DEPANNEUR: '#E67E22',
  MARCHAND: '#9B59B6',
  ADMIN: '#E74C3C',
};

const FILTERS = ['Tous', 'CLIENT', 'CHAUFFEUR', 'LIVREUR', 'DEPANNEUR', 'MARCHAND'];

const MOCK_USERS = [
  { id: '1', name: "Ahmed Ben Salah", initials: "AS", role: "CLIENT", phone: "+216 71 234 567", date: "12/01/2024", active: true },
  { id: '2', name: "Karim Bouzid", initials: "KB", role: "CHAUFFEUR", phone: "+216 98 765 432", date: "05/02/2024", active: true },
  { id: '3', name: "Yassine Dridi", initials: "YD", role: "LIVREUR", phone: "+216 55 111 222", date: "18/03/2024", active: true },
  { id: '4', name: "Mohamed Turki", initials: "MT", role: "DEPANNEUR", phone: "+216 22 333 444", date: "02/04/2024", active: false },
  { id: '5', name: "Sonia Khelifi", initials: "SK", role: "MARCHAND", phone: "+216 77 555 666", date: "09/05/2024", active: true },
  { id: '6', name: "Ines Mansouri", initials: "IM", role: "CLIENT", phone: "+216 44 777 888", date: "21/05/2024", active: true },
  { id: '7', name: "Rami Gharbi", initials: "RG", role: "CHAUFFEUR", phone: "+216 33 999 000", date: "14/06/2024", active: false },
  { id: '8', name: "Fatma Zouari", initials: "FZ", role: "CLIENT", phone: "+216 66 222 111", date: "03/07/2024", active: true },
  { id: '9', name: "Bilel Sassi", initials: "BS", role: "LIVREUR", phone: "+216 11 444 333", date: "28/07/2024", active: true },
  { id: '10', name: "Nour Hamdi", initials: "NH", role: "MARCHAND", phone: "+216 88 666 555", date: "15/08/2024", active: false },
  { id: '11', name: "Chokri Ayari", initials: "CA", role: "DEPANNEUR", phone: "+216 99 888 777", date: "20/09/2024", active: true },
  { id: '12', name: "Admin Principal", initials: "AP", role: "ADMIN", phone: "+216 50 000 001", date: "01/01/2024", active: true },
];

function UserCard({ user }) {
  const handleMenu = () => {
    Alert.alert(
      user.name,
      "Choisir une action",
      [
        { text: "Voir profil", onPress: () => {} },
        {
          text: user.active ? "Suspendre" : "Activer",
          onPress: () => {},
          style: user.active ? 'destructive' : 'default',
        },
        { text: "Supprimer", onPress: () => {}, style: 'destructive' },
        { text: "Annuler", style: 'cancel' },
      ]
    );
  };

  const roleColor = ROLE_COLORS[user.role] || COLORS.muted;

  return (
    <View style={styles.userCard}>
      <View style={styles.avatarWrapper}>
        <View style={[styles.avatarCircle, { backgroundColor: roleColor + '33' }]}>
          <Text style={[styles.avatarInitials, { color: roleColor }]}>{user.initials}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: user.active ? COLORS.green : COLORS.red }]} />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <View style={[styles.roleBadge, { backgroundColor: roleColor + '22', borderColor: roleColor }]}>
          <Text style={[styles.roleText, { color: roleColor }]}>{user.role}</Text>
        </View>
        <Text style={styles.userPhone}>{user.phone}</Text>
        <Text style={styles.userDate}>Inscrit le {user.date}</Text>
      </View>
      <TouchableOpacity style={styles.menuBtn} onPress={handleMenu}>
        <Text style={styles.menuBtnText}>···</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AdminUsersScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');

  const filtered = MOCK_USERS.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    const matchFilter = activeFilter === 'Tous' || u.role === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation && navigation.goBack()}
        >
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion utilisateurs</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un utilisateur..."
          placeholderTextColor={COLORS.muted}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersRow}
        contentContainerStyle={styles.filtersContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{filtered.length} utilisateur{filtered.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* User list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <UserCard user={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👤</Text>
            <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    paddingVertical: 11,
  },
  clearSearch: {
    color: COLORS.muted,
    fontSize: 16,
    padding: 4,
  },
  filtersRow: {
    marginTop: 10,
    maxHeight: 44,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#000',
  },
  countRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  countText: {
    color: COLORS.muted,
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontWeight: '800',
    fontSize: 15,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 3,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  userPhone: {
    color: COLORS.muted,
    fontSize: 13,
  },
  userDate: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },
  menuBtn: {
    padding: 8,
  },
  menuBtnText: {
    color: COLORS.muted,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 16,
  },
});
