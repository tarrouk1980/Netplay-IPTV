import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  surfaceLight: '#2A2A3A',
  primary: '#1565C0',
  primaryLight: '#1976D2',
  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
  border: '#2E2E40',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
};

const ROLE_ICONS = {
  chauffeur: '🚕',
  livreur: '🛵',
  depanneur: '🛻',
};

const MOCK_PAYOUTS = [
  {
    id: '1',
    providerName: 'Mehdi Ben Ali',
    role: 'chauffeur',
    amount: 245.5,
    requestDate: '2026-05-28',
    status: 'en_attente',
  },
  {
    id: '2',
    providerName: 'Sami Trabelsi',
    role: 'livreur',
    amount: 132.0,
    requestDate: '2026-05-27',
    status: 'en_attente',
  },
  {
    id: '3',
    providerName: 'Karim Mansouri',
    role: 'depanneur',
    amount: 310.75,
    requestDate: '2026-05-26',
    status: 'traite',
  },
  {
    id: '4',
    providerName: 'Ines Chaouachi',
    role: 'livreur',
    amount: 89.25,
    requestDate: '2026-05-25',
    status: 'en_attente',
  },
  {
    id: '5',
    providerName: 'Nour Hamdi',
    role: 'chauffeur',
    amount: 415.0,
    requestDate: '2026-05-24',
    status: 'traite',
  },
  {
    id: '6',
    providerName: 'Bilel Sassi',
    role: 'depanneur',
    amount: 175.5,
    requestDate: '2026-05-23',
    status: 'en_attente',
  },
];

const TABS = [
  { key: 'en_attente', label: 'EN ATTENTE' },
  { key: 'traite', label: 'TRAITÉ' },
  { key: 'tout', label: 'TOUT' },
];

export default function AdminProviderPayoutsScreen() {
  const [payouts, setPayouts] = useState(MOCK_PAYOUTS);
  const [activeTab, setActiveTab] = useState('en_attente');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filtered = payouts.filter((p) => {
    if (activeTab === 'tout') return true;
    return p.status === activeTab;
  });

  const pendingTotal = payouts
    .filter((p) => p.status === 'en_attente')
    .reduce((sum, p) => sum + p.amount, 0);

  const approveOne = (id) => {
    const payout = payouts.find((p) => p.id === id);
    Alert.alert(
      'Confirmer le virement',
      `Approuver le virement de ${payout.amount.toFixed(3)} TND pour ${payout.providerName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Approuver',
          style: 'default',
          onPress: () =>
            setPayouts((prev) =>
              prev.map((p) => (p.id === id ? { ...p, status: 'traite' } : p))
            ),
        },
      ]
    );
  };

  const approveAll = () => {
    const pending = payouts.filter((p) => p.status === 'en_attente');
    Alert.alert(
      'Tout approuver',
      `Approuver ${pending.length} virement(s) pour un total de ${pendingTotal.toFixed(3)} TND ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Approuver tout',
          style: 'default',
          onPress: () =>
            setPayouts((prev) =>
              prev.map((p) =>
                p.status === 'en_attente' ? { ...p, status: 'traite' } : p
              )
            ),
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.providerInfo}>
          <Text style={styles.roleIcon}>{ROLE_ICONS[item.role]}</Text>
          <View>
            <Text style={styles.providerName}>{item.providerName}</Text>
            <Text style={styles.roleText}>{item.role.charAt(0).toUpperCase() + item.role.slice(1)}</Text>
          </View>
        </View>
        <View style={styles.amountBlock}>
          <Text style={styles.amountText}>{item.amount.toFixed(3)} TND</Text>
          <View style={[styles.statusBadge, item.status === 'en_attente' ? styles.badgePending : styles.badgeDone]}>
            <Text style={styles.statusText}>
              {item.status === 'en_attente' ? 'En attente' : 'Traité'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.cardBottom}>
        <Text style={styles.dateText}>Demande : {item.requestDate}</Text>
        {item.status === 'en_attente' && (
          <TouchableOpacity style={styles.approveButton} onPress={() => approveOne(item.id)}>
            <Text style={styles.approveButtonText}>Approuver</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Virements Prestataires</Text>
        <View style={styles.pendingBlock}>
          <Text style={styles.pendingLabel}>En attente de virement</Text>
          <Text style={styles.pendingAmount}>{pendingTotal.toFixed(3)} TND</Text>
        </View>
      </View>

      <View style={styles.tabsRow}>
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

      {activeTab === 'en_attente' && filtered.length > 0 && (
        <TouchableOpacity style={styles.approveAllButton} onPress={approveAll}>
          <Text style={styles.approveAllText}>Tout approuver ({filtered.length})</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun virement dans cette catégorie</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  pendingBlock: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  pendingAmount: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  approveAllButton: {
    margin: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  approveAllText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  listContent: {
    padding: 12,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleIcon: {
    fontSize: 28,
  },
  providerName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  roleText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  amountBlock: {
    alignItems: 'flex-end',
  },
  amountText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgePending: {
    backgroundColor: COLORS.warning + '30',
  },
  badgeDone: {
    backgroundColor: COLORS.success + '30',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dateText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  approveButton: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
});
