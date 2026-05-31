import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

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
};

const ROLE_LABELS = {
  CHAUFFEUR: 'Chauffeur',
  LIVREUR: 'Livreur',
  DEPANNEUR: 'Dépanneur',
};

const SERVICE_TYPE_LABELS = {
  TAXI: '🚕 Taxi',
  DELIVERY: '📦 Livraison',
  SOS: '🚛 Dépannage',
  GROCERY: '🛒 Courses',
};

const STATUS_COLORS = {
  COMPLETED: COLORS.greenLight,
  CANCELLED: COLORS.accent,
  PENDING: COLORS.amber,
  IN_PROGRESS: '#2196F3',
};

function StatCard({ label, value, emoji }) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.emoji}>{emoji}</Text>
      <Text style={statStyles.value}>{value ?? '—'}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 4,
  },
  emoji: { fontSize: 20, marginBottom: 6 },
  value: { fontSize: 20, fontWeight: '800', color: COLORS.white, marginBottom: 2 },
  label: { fontSize: 10, color: COLORS.muted, textAlign: 'center', fontWeight: '500' },
});

function OrderRow({ order }) {
  const dt = new Date(order.createdAt);
  const dateStr = dt.toLocaleDateString('fr-TN', { day: '2-digit', month: 'short' });
  const timeStr = dt.toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' });
  const statusColor = STATUS_COLORS[order.status] || COLORS.muted;

  return (
    <View style={orderStyles.row}>
      <View style={orderStyles.left}>
        <Text style={orderStyles.dateText}>{dateStr} {timeStr}</Text>
        <Text style={orderStyles.type}>{SERVICE_TYPE_LABELS[order.serviceType] || order.serviceType}</Text>
      </View>
      <View style={orderStyles.right}>
        <Text style={orderStyles.amount}>{parseFloat(order.price || 0).toFixed(2)} TND</Text>
        <View style={[orderStyles.statusBadge, { borderColor: statusColor }]}>
          <Text style={[orderStyles.statusText, { color: statusColor }]}>{order.status}</Text>
        </View>
      </View>
    </View>
  );
}

const orderStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  left: { flex: 1 },
  right: { alignItems: 'flex-end', gap: 6 },
  dateText: { fontSize: 11, color: COLORS.muted, marginBottom: 2 },
  type: { fontSize: 13, color: COLORS.white, fontWeight: '600' },
  amount: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  statusBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: { fontSize: 10, fontWeight: '600' },
});

export default function ProviderDashboardScreen({ navigation }) {
  const { user, logout } = useAuthStore();

  const [isOnline, setIsOnline] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [balance, setBalance] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({ rides: 0, earnings: 0, rating: null });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [profileRes, walletRes, ordersRes] = await Promise.all([
        api.get('/users/me').catch(() => null),
        api.get('/wallet/balance').catch(() => null),
        api.get('/users/me/orders?limit=5').catch(() => null),
      ]);

      if (profileRes?.data) {
        setIsOnline(profileRes.data.online ?? false);
      }

      if (walletRes?.data) {
        setBalance(walletRes.data.balance ?? walletRes.data.balanceTND ?? 0);
      }

      if (ordersRes?.data) {
        const orders = ordersRes.data.orders ?? ordersRes.data ?? [];
        setRecentOrders(Array.isArray(orders) ? orders : []);

        // Compute today stats from recent orders
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = orders.filter(
          (o) => new Date(o.createdAt) >= today && o.status === 'COMPLETED'
        );
        const totalEarnings = todayOrders.reduce(
          (sum, o) => sum + parseFloat(o.price || 0),
          0
        );
        const ratings = orders.filter((o) => o.rating != null).map((o) => o.rating);
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((s, r) => s + r, 0) / ratings.length
            : null;

        setStats({
          rides: todayOrders.length,
          earnings: totalEarnings,
          rating: avgRating,
        });
      }
    } catch (err) {
      console.warn('[ProviderDashboard] loadData error:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleToggleOnline = async (value) => {
    setToggling(true);
    try {
      await api.post('/users/me/status', { online: value });
      setIsOnline(value);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de changer le statut. Veuillez réessayer.');
    } finally {
      setToggling(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const providerRole = user?.role ?? 'CHAUFFEUR';
  const roleLabel = ROLE_LABELS[providerRole] ?? providerRole;

  // Wallet warning: days left until suspension (arbitrary formula)
  const walletLow = balance !== null && balance < 3;
  const daysLeft = balance !== null ? Math.max(0, Math.floor(balance)) : 0;

  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerName}>{user?.name ?? 'Prestataire'}</Text>
          <Text style={styles.headerRole}>{roleLabel}</Text>
        </View>
        <View style={styles.headerRight}>
          {toggling ? (
            <ActivityIndicator color={isOnline ? COLORS.greenLight : COLORS.muted} />
          ) : (
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              trackColor={{ false: COLORS.border, true: COLORS.green }}
              thumbColor={isOnline ? COLORS.greenLight : COLORS.muted}
              style={styles.bigSwitch}
            />
          )}
          <Text style={[styles.onlineLabel, { color: isOnline ? COLORS.greenLight : COLORS.muted }]}>
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats du jour */}
        <Text style={styles.sectionTitle}>Statistiques du jour</Text>
        <View style={styles.statsRow}>
          <StatCard emoji="🚗" label="Courses" value={stats.rides} />
          <StatCard emoji="💰" label="Gains (TND)" value={stats.earnings.toFixed(2)} />
          <StatCard
            emoji="⭐"
            label="Note moy."
            value={stats.rating !== null ? stats.rating.toFixed(1) : 'N/A'}
          />
        </View>

        {/* Solde wallet */}
        <Text style={styles.sectionTitle}>Mon solde</Text>
        <View style={[styles.walletCard, walletLow && styles.walletCardWarn]}>
          <View style={styles.walletTop}>
            <View>
              <Text style={styles.walletLabel}>Solde actuel</Text>
              <Text style={[styles.walletBalance, walletLow && { color: COLORS.accentLight }]}>
                {balance !== null ? balance.toFixed(2) : '—'} TND
              </Text>
            </View>
            <TouchableOpacity
              style={styles.rechargeBtn}
              onPress={() => navigation.navigate('Wallet')}
              activeOpacity={0.8}
            >
              <Text style={styles.rechargeBtnText}>Recharger</Text>
            </TouchableOpacity>
          </View>

          {walletLow && (
            <View style={styles.walletWarning}>
              <Text style={styles.walletWarningText}>
                ⚠️ Solde insuffisant — votre compte sera suspendu dans {daysLeft} jour{daysLeft !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Dernières courses */}
        <Text style={styles.sectionTitle}>5 dernières courses</Text>
        <View style={styles.ordersCard}>
          {recentOrders.length === 0 ? (
            <View style={styles.emptyOrders}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyText}>Aucune course pour le moment</Text>
            </View>
          ) : (
            recentOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))
          )}
        </View>

        {/* Déconnexion */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutBtnText}>🚪 Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: { flex: 1 },
  headerName: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  headerRole: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  headerRight: { alignItems: 'center', gap: 4 },
  bigSwitch: { transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] },
  onlineLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  sectionTitle: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  walletCard: {
    marginHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  walletCardWarn: {
    borderColor: COLORS.accent,
  },
  walletTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  walletBalance: { color: COLORS.white, fontSize: 28, fontWeight: '800' },
  rechargeBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  rechargeBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  walletWarning: {
    marginTop: 12,
    backgroundColor: COLORS.accent + '22',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  walletWarningText: { color: COLORS.accentLight, fontSize: 12, fontWeight: '600', lineHeight: 18 },
  ordersCard: {
    marginHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyOrders: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyEmoji: { fontSize: 32 },
  emptyText: { color: COLORS.muted, fontSize: 14 },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 15 },
});
