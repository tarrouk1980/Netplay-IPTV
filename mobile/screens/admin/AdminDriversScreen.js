import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
  green: '#2ECC71',
  grey: '#555566',
  orange: '#F5A623',
};

const MOCK_DRIVERS = [
  { id: '1', name: "Sami Ben Ali", role: "chauffeur", phone: "+216 22 111 001", courses: 142, rating: 4.8, earnings: 1240.00, status: "online" },
  { id: '2', name: "Rania Tlili", role: "livreur", phone: "+216 55 222 002", courses: 89, rating: 4.5, earnings: 680.50, status: "busy" },
  { id: '3', name: "Khalil Mansour", role: "depanneur", phone: "+216 99 333 003", courses: 34, rating: 4.7, earnings: 920.00, status: "offline" },
  { id: '4', name: "Nour Chebbi", role: "chauffeur", phone: "+216 22 444 004", courses: 210, rating: 4.9, earnings: 1850.00, status: "online" },
  { id: '5', name: "Amine Dridi", role: "livreur", phone: "+216 55 555 005", courses: 67, rating: 4.2, earnings: 530.00, status: "online" },
  { id: '6', name: "Fatma Haddad", role: "chauffeur", phone: "+216 22 666 006", courses: 98, rating: 4.6, earnings: 870.00, status: "offline" },
  { id: '7', name: "Malek Jomni", role: "depanneur", phone: "+216 99 777 007", courses: 51, rating: 4.4, earnings: 1100.00, status: "busy" },
  { id: '8', name: "Youssef Karray", role: "livreur", phone: "+216 55 888 008", courses: 115, rating: 4.7, earnings: 760.00, status: "online" },
  { id: '9', name: "Sirine Gharbi", role: "chauffeur", phone: "+216 22 999 009", courses: 73, rating: 4.3, earnings: 640.00, status: "offline" },
  { id: '10', name: "Bilel Nasri", role: "depanneur", phone: "+216 99 000 010", courses: 28, rating: 4.1, earnings: 580.00, status: "online" },
];

const TABS = [
  { key: "all", label: "Tous" },
  { key: "chauffeur", label: "Chauffeurs 🚕" },
  { key: "livreur", label: "Livreurs 🛵" },
  { key: "depanneur", label: "Dépanneurs 🛻" },
];

const ROLE_LABELS = {
  chauffeur: "Chauffeur 🚕",
  livreur: "Livreur 🛵",
  depanneur: "Dépanneur 🛻",
};

const STATUS_CONFIG = {
  online: { label: "En ligne", color: '#2ECC71' },
  offline: { label: "Hors ligne", color: '#8E8E9A' },
  busy: { label: "En course", color: '#F5A623' },
};

function getStats(drivers) {
  return {
    online: drivers.filter((d) => d.status === 'online').length,
    offline: drivers.filter((d) => d.status === 'offline').length,
    busy: drivers.filter((d) => d.status === 'busy').length,
  };
}

export default function AdminDriversScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = MOCK_DRIVERS.filter((d) => {
    const matchTab = activeTab === "all" || d.role === activeTab;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search);
    return matchTab && matchSearch;
  });

  const stats = getStats(MOCK_DRIVERS);

  function renderDriver({ item }) {
    const sc = STATUS_CONFIG[item.status];
    const initials = item.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => Alert.alert(item.name, `Téléphone: ${item.phone}\nRole: ${ROLE_LABELS[item.role]}\nStatut: ${sc.label}`)}
      >
        <View style={styles.cardLeft}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: sc.color }]} />
          </View>
        </View>
        <View style={styles.cardCenter}>
          <View style={styles.nameRow}>
            <Text style={styles.driverName}>{item.name}</Text>
            <View style={[styles.roleBadge, { backgroundColor: COLORS.surface }]}>
              <Text style={styles.roleBadgeText}>{ROLE_LABELS[item.role]}</Text>
            </View>
          </View>
          <Text style={styles.phone}>{item.phone}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.stat}>{item.courses} courses</Text>
            <Text style={styles.stat}>⭐ {item.rating}</Text>
            <Text style={styles.stat}>{item.earnings.toFixed(0)} TND/mois</Text>
          </View>
          <View style={[styles.statusChip, { borderColor: sc.color }]}>
            <View style={[styles.chipDot, { backgroundColor: sc.color }]} />
            <Text style={[styles.chipText, { color: sc.color }]}>{sc.label}</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.chevron}>›</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion conducteurs</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un conducteur..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Stats row */}
      <View style={styles.statsBar}>
        <View style={styles.statBadge}>
          <View style={[styles.statDot, { backgroundColor: '#2ECC71' }]} />
          <Text style={styles.statBadgeText}>En ligne: {stats.online}</Text>
        </View>
        <View style={styles.statBadge}>
          <View style={[styles.statDot, { backgroundColor: '#8E8E9A' }]} />
          <Text style={styles.statBadgeText}>Hors ligne: {stats.offline}</Text>
        </View>
        <View style={styles.statBadge}>
          <View style={[styles.statDot, { backgroundColor: '#F5A623' }]} />
          <Text style={styles.statBadgeText}>En course: {stats.busy}</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderDriver}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun conducteur trouvé.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  backText: { fontSize: 28, color: COLORS.text, lineHeight: 32 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: COLORS.text },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10 },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  statBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statDot: { width: 8, height: 8, borderRadius: 4 },
  statBadgeText: { fontSize: 12, color: COLORS.muted },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 6,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: { fontSize: 12, color: COLORS.muted },
  tabTextActive: { color: '#000', fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cardLeft: { marginRight: 12 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#000' },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  cardCenter: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 2 },
  driverName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleBadgeText: { fontSize: 11, color: COLORS.muted },
  phone: { fontSize: 12, color: COLORS.muted, marginBottom: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  stat: { fontSize: 11, color: COLORS.muted },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontSize: 11, fontWeight: '600' },
  cardRight: { paddingLeft: 8 },
  chevron: { fontSize: 24, color: COLORS.muted },
  empty: { textAlign: 'center', color: COLORS.muted, marginTop: 40 },
});
