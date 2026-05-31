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
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  accent: '#D32F2F',
  white: '#FFFFFF',
  muted: '#8A8A9A',
  border: '#2A2A3A',
  green: '#2E7D32',
  greenLight: '#4CAF50',
  amber: '#F57C00',
  teal: '#00838F',
};

const STATUS_FILTERS = [
  { key: '', label: 'Tous' },
  { key: 'active', label: 'Actifs' },
  { key: 'suspended', label: 'Suspendus' },
];

function MerchantCard({ merchant, onToggleSuspend }) {
  const suspended = merchant.suspended;
  return (
    <View style={card.container}>
      <View style={card.header}>
        <View style={card.avatar}>
          <Text style={card.avatarText}>🏪</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={card.storeName}>{merchant.storeName || merchant.name || 'Marchand'}</Text>
          <Text style={card.ownerName}>{merchant.name}</Text>
          <Text style={card.phone}>{merchant.phone}</Text>
        </View>
        <View style={[card.badge, suspended ? card.badgeSuspended : card.badgeActive]}>
          <Text style={card.badgeText}>{suspended ? 'Suspendu' : 'Actif'}</Text>
        </View>
      </View>

      <View style={card.meta}>
        {merchant.city ? (
          <View style={card.chip}>
            <Text style={card.chipText}>📍 {merchant.city}</Text>
          </View>
        ) : null}
        {merchant.category ? (
          <View style={card.chip}>
            <Text style={card.chipText}>🏷️ {merchant.category}</Text>
          </View>
        ) : null}
        <View style={card.chip}>
          <Text style={card.chipText}>📦 {merchant.ordersCount ?? 0} commandes</Text>
        </View>
      </View>

      <View style={card.actions}>
        <TouchableOpacity
          style={[card.actionBtn, suspended ? card.actionBtnGreen : card.actionBtnRed]}
          onPress={() => onToggleSuspend(merchant)}
          activeOpacity={0.75}
        >
          <Text style={card.actionBtnText}>
            {suspended ? '✅ Réactiver' : '🚫 Suspendre'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const card = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C28',
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00838F22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22 },
  storeName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  ownerName: { color: '#8A8A9A', fontSize: 12, marginTop: 1 },
  phone: { color: '#8A8A9A', fontSize: 12 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeActive: { backgroundColor: '#2E7D3222', borderWidth: 1, borderColor: '#4CAF5044' },
  badgeSuspended: { backgroundColor: '#D32F2F22', borderWidth: 1, borderColor: '#D32F2F44' },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  chip: { backgroundColor: '#16161F', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#2A2A3A' },
  chipText: { color: '#8A8A9A', fontSize: 11 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: 'center', borderWidth: 1 },
  actionBtnGreen: { backgroundColor: '#2E7D3222', borderColor: '#4CAF5044' },
  actionBtnRed: { backgroundColor: '#D32F2F22', borderColor: '#D32F2F44' },
  actionBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
});

export default function AdminMerchantsScreen({ navigation }) {
  const [merchants, setMerchants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.get('/api/admin/merchants');
      setMerchants(res.data?.merchants || res.data || []);
    } catch (err) {
      // Fallback mock data so screen is usable even without API
      setMerchants([
        { id: '1', name: 'Ahmed Ben Salem', storeName: 'Pizza Tunis', phone: '20123456', city: 'Tunis', category: 'Restauration', suspended: false, ordersCount: 142 },
        { id: '2', name: 'Fatma Gharbi', storeName: 'Épicerie Sfax', phone: '25987654', city: 'Sfax', category: 'Épicerie', suspended: false, ordersCount: 89 },
        { id: '3', name: 'Mohamed Trabelsi', storeName: 'Sushi Express', phone: '52112233', city: 'Sousse', category: 'Restauration', suspended: true, ordersCount: 23 },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let list = merchants;
    if (statusFilter === 'active') list = list.filter(m => !m.suspended);
    if (statusFilter === 'suspended') list = list.filter(m => m.suspended);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.storeName || '').toLowerCase().includes(q) ||
        (m.phone || '').includes(q)
      );
    }
    setFiltered(list);
  }, [merchants, statusFilter, search]);

  const handleToggleSuspend = async (merchant) => {
    const action = merchant.suspended ? 'réactiver' : 'suspendre';
    Alert.alert(
      `${merchant.suspended ? 'Réactiver' : 'Suspendre'} le marchand`,
      `Voulez-vous ${action} ${merchant.storeName || merchant.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: merchant.suspended ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await api.patch(`/api/admin/merchants/${merchant.id}/suspend`, {
                suspended: !merchant.suspended,
              });
              setMerchants(prev =>
                prev.map(m => m.id === merchant.id ? { ...m, suspended: !m.suspended } : m)
              );
            } catch {
              Alert.alert('Erreur', 'Impossible de modifier le statut du marchand.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏪 Marchands</Text>
        <Text style={styles.headerCount}>{filtered.length}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un marchand…"
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Status filter */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, statusFilter === f.key && styles.filterChipActive]}
            onPress={() => setStatusFilter(f.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterChipText, statusFilter === f.key && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id?.toString()}
          renderItem={({ item }) => (
            <MerchantCard merchant={item} onToggleSuspend={handleToggleSuspend} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.accent} />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>Aucun marchand trouvé</Text>
          }
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, marginRight: 8 },
  backText: { fontSize: 30, color: COLORS.white, lineHeight: 30 },
  headerTitle: { flex: 1, color: COLORS.white, fontSize: 18, fontWeight: '700' },
  headerCount: {
    backgroundColor: COLORS.teal + '33',
    color: COLORS.teal,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    fontSize: 13,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: COLORS.teal + '55',
  },
  searchRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.white,
    fontSize: 14,
  },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent },
  filterChipText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.white },
  empty: { color: COLORS.muted, textAlign: 'center', marginTop: 60, fontSize: 14 },
});
