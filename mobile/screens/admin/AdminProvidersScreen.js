import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  accent: '#D32F2F',
  accentLight: '#FF5252',
  white: '#FFFFFF',
  muted: '#8A8A9A',
  border: '#2A2A3A',
  green: '#2E7D32',
  greenLight: '#4CAF50',
  amber: '#F57C00',
  blue: '#1565C0',
};

const TABS = [
  { key: 'PENDING_KYC', label: 'En attente KYC' },
  { key: 'ACTIVE', label: 'Actifs' },
  { key: 'SUSPENDED', label: 'Suspendus' },
];

const ROLE_LABELS = {
  CHAUFFEUR: 'Chauffeur',
  LIVREUR: 'Livreur',
  DEPANNEUR: 'Dépanneur',
  MARCHAND: 'Marchand',
};

const STATUS_META = {
  PENDING_KYC: { color: COLORS.amber, label: 'KYC en attente' },
  ACTIVE: { color: COLORS.greenLight, label: 'Actif' },
  SUSPENDED: { color: COLORS.accent, label: 'Suspendu' },
};

function ProviderCard({ provider, onActivate, onSuspend, onView }) {
  const registeredDate = new Date(provider.createdAt).toLocaleDateString('fr-TN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const kycMeta = STATUS_META[
    provider.suspended
      ? 'SUSPENDED'
      : provider.subscriptionActive
      ? 'ACTIVE'
      : 'PENDING_KYC'
  ] || STATUS_META.PENDING_KYC;

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.topRow}>
        <View style={cardStyles.info}>
          <Text style={cardStyles.name} numberOfLines={1}>{provider.name}</Text>
          <Text style={cardStyles.role}>{ROLE_LABELS[provider.role] ?? provider.role}</Text>
          <Text style={cardStyles.date}>Inscrit le {registeredDate}</Text>
          {provider.avgRating != null && (
            <Text style={cardStyles.rating}>⭐ {parseFloat(provider.avgRating).toFixed(1)}</Text>
          )}
        </View>
        <View style={[cardStyles.statusBadge, { borderColor: kycMeta.color }]}>
          <Text style={[cardStyles.statusText, { color: kycMeta.color }]}>{kycMeta.label}</Text>
        </View>
      </View>

      <View style={cardStyles.actions}>
        <TouchableOpacity
          style={[cardStyles.btn, { borderColor: COLORS.greenLight }]}
          onPress={() => onActivate(provider)}
          activeOpacity={0.8}
        >
          <Text style={[cardStyles.btnText, { color: COLORS.greenLight }]}>Activer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[cardStyles.btn, { borderColor: COLORS.accent }]}
          onPress={() => onSuspend(provider)}
          activeOpacity={0.8}
        >
          <Text style={[cardStyles.btnText, { color: COLORS.accent }]}>Suspendre</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[cardStyles.btn, cardStyles.btnFilled]}
          onPress={() => onView(provider)}
          activeOpacity={0.8}
        >
          <Text style={[cardStyles.btnText, { color: COLORS.white }]}>Voir profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  info: { flex: 1, paddingRight: 10 },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.white, marginBottom: 2 },
  role: { fontSize: 12, color: COLORS.muted, marginBottom: 2 },
  date: { fontSize: 11, color: COLORS.muted },
  rating: { fontSize: 12, color: COLORS.amber, marginTop: 2 },
  statusBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8 },
  btn: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  btnFilled: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  btnText: { fontSize: 12, fontWeight: '600' },
});

export default function AdminProvidersScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('PENDING_KYC');
  const [search, setSearch] = useState('');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchProviders = useCallback(async (tab = activeTab) => {
    try {
      const res = await api.get(`/admin/providers?status=${tab}&limit=50`);
      const data = res.data?.providers ?? res.data ?? [];
      setProviders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('[AdminProviders] fetch error:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    setProviders([]);
    fetchProviders(activeTab);
  }, [activeTab]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProviders(activeTab);
  }, [activeTab, fetchProviders]);

  const handleActivate = useCallback(async (provider) => {
    Alert.alert(
      'Activer le prestataire',
      `Activer le compte de ${provider.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Activer',
          onPress: async () => {
            setActionLoading(provider.id);
            try {
              await api.patch(`/admin/users/${provider.id}/reactivate`);
              setProviders((prev) => prev.filter((p) => p.id !== provider.id));
            } catch (err) {
              Alert.alert('Erreur', 'Impossible d\'activer ce prestataire.');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  }, []);

  const handleSuspend = useCallback(async (provider) => {
    Alert.alert(
      'Suspendre le prestataire',
      `Suspendre le compte de ${provider.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Suspendre',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(provider.id);
            try {
              await api.patch(`/admin/users/${provider.id}/suspend`);
              setProviders((prev) => prev.filter((p) => p.id !== provider.id));
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de suspendre ce prestataire.');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  }, []);

  const handleView = useCallback((provider) => {
    navigation.navigate('AdminUserDetail', { userId: provider.id });
  }, [navigation]);

  const filtered = providers.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.includes(q)
    );
  });

  const renderItem = ({ item }) => (
    actionLoading === item.id ? (
      <View style={[cardStyles.card, { justifyContent: 'center', alignItems: 'center', paddingVertical: 24 }]}>
        <ActivityIndicator color={COLORS.accent} />
      </View>
    ) : (
      <ProviderCard
        provider={item}
        onActivate={handleActivate}
        onSuspend={handleSuspend}
        onView={handleView}
      />
    )
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gérer les prestataires</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom, email, téléphone…"
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={styles.emptyText}>Aucun prestataire trouvé</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: { paddingVertical: 4 },
  backText: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
  },
  tabText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: COLORS.white },
  searchContainer: {
    padding: 12,
    backgroundColor: COLORS.surfaceAlt,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.white,
    fontSize: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 40,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
    gap: 12,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: { color: COLORS.muted, fontSize: 15 },
});
