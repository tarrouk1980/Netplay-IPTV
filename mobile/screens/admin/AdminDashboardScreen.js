import React, { useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import useAdminStore from '../../store/adminStore';

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
  amber: '#F57C00',
};

// ── Mini bar chart (pure RN) ────────────────────────────────────────────────
function MiniBarChart({ data = [], labels = [] }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const displayData = data.slice(-7);
  const displayLabels = labels.slice(-7);

  return (
    <View style={chart.container}>
      <Text style={chart.title}>Commandes — 7 derniers jours</Text>
      <View style={chart.barsRow}>
        {displayData.map((val, i) => {
          const height = Math.max(4, Math.round((val / max) * 80));
          return (
            <View key={i} style={chart.barWrapper}>
              <Text style={chart.barValue}>{val}</Text>
              <View style={[chart.bar, { height }]} />
              <Text style={chart.barLabel}>
                {displayLabels[i] ? displayLabels[i].slice(5) : ''}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const chart = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: { color: COLORS.muted, fontSize: 12, marginBottom: 12, fontWeight: '600' },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 110 },
  barWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 3 },
  bar: { width: '80%', backgroundColor: COLORS.accent, borderRadius: 3 },
  barValue: { color: COLORS.white, fontSize: 10, marginBottom: 4 },
  barLabel: { color: COLORS.muted, fontSize: 9, marginTop: 6 },
});

// ── KPI Card ────────────────────────────────────────────────────────────────
function KPICard({ emoji, label, value, sub, accentColor }) {
  return (
    <View style={[kpi.card, { borderTopColor: accentColor || COLORS.accent }]}>
      <Text style={kpi.emoji}>{emoji}</Text>
      <Text style={kpi.value}>{value ?? '—'}</Text>
      <Text style={kpi.label}>{label}</Text>
      {sub ? <Text style={kpi.sub}>{sub}</Text> : null}
    </View>
  );
}

const kpi = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    margin: 6,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 110,
    justifyContent: 'center',
  },
  emoji: { fontSize: 22, marginBottom: 6 },
  value: { color: COLORS.white, fontSize: 24, fontWeight: '700', marginBottom: 4 },
  label: { color: COLORS.muted, fontSize: 12, fontWeight: '500' },
  sub: { color: COLORS.accentLight, fontSize: 11, marginTop: 4 },
});

// ── Nav Button ──────────────────────────────────────────────────────────────
function NavButton({ emoji, label, onPress, badge }) {
  return (
    <TouchableOpacity style={nav.btn} onPress={onPress} activeOpacity={0.75}>
      <View style={nav.inner}>
        <Text style={nav.emoji}>{emoji}</Text>
        <Text style={nav.label}>{label}</Text>
        {badge ? (
          <View style={nav.badge}>
            <Text style={nav.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const nav = StyleSheet.create({
  btn: {
    flex: 1,
    margin: 6,
    minWidth: '28%',
  },
  inner: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emoji: { fontSize: 26, marginBottom: 8 },
  label: { color: COLORS.white, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
});

// ── Screen ──────────────────────────────────────────────────────────────────
export default function AdminDashboardScreen({ navigation }) {
  const { stats, ordersChart, isLoading, fetchStats, fetchOrdersChart, pendingKYCCount, fetchPendingKYC } =
    useAdminStore();

  const load = useCallback(async () => {
    await Promise.all([fetchStats(), fetchOrdersChart(), fetchPendingKYC()]);
  }, [fetchStats, fetchOrdersChart, fetchPendingKYC]);

  const intervalRef = useRef(null);

  useEffect(() => {
    load();
    // Auto-refresh every 30 seconds
    intervalRef.current = setInterval(load, 30000);
    return () => clearInterval(intervalRef.current);
  }, [load]);

  const kycCount = pendingKYCCount || stats?.users?.pendingKYC || 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Administration EASYWAY</Text>
        <Text style={styles.headerSub}>Supervision complète · <Text style={{ color: '#4CAF50' }}>● LIVE</Text></Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={load} tintColor={COLORS.accent} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading && !stats?.users ? (
          <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* KPI Grid */}
            <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
            <View style={styles.kpiGrid}>
              <KPICard
                emoji="👥"
                label="Utilisateurs"
                value={stats?.users?.total ?? 0}
                sub={`${stats?.users?.chauffeurs ?? 0} chauffeurs`}
                accentColor="#1565C0"
              />
              <KPICard
                emoji="📦"
                label="Commandes aujourd'hui"
                value={stats?.orders?.today ?? 0}
                sub={`${stats?.orders?.pending ?? 0} en attente`}
                accentColor={COLORS.accent}
              />
            </View>
            <View style={styles.kpiGrid}>
              <KPICard
                emoji="💰"
                label="Revenus du mois"
                value={`${(stats?.revenue?.monthTND ?? 0).toFixed(0)} TND`}
                sub={`Aujourd'hui: ${(stats?.revenue?.todayTND ?? 0).toFixed(0)} TND`}
                accentColor={COLORS.green}
              />
              <KPICard
                emoji="⏳"
                label="KYC en attente"
                value={kycCount}
                sub={kycCount > 0 ? 'Action requise' : 'À jour'}
                accentColor={kycCount > 0 ? COLORS.amber : COLORS.muted}
              />
            </View>

            {/* Mini chart */}
            {ordersChart ? (
              <MiniBarChart data={ordersChart.data} labels={ordersChart.labels} />
            ) : null}

            {/* Stats secondaires */}
            <View style={styles.statsRow}>
              <View style={styles.statChip}>
                <Text style={styles.statChipNum}>{stats?.orders?.completed ?? 0}</Text>
                <Text style={styles.statChipLbl}>Complétées</Text>
              </View>
              <View style={styles.statChip}>
                <Text style={styles.statChipNum}>{stats?.orders?.cancelled ?? 0}</Text>
                <Text style={styles.statChipLbl}>Annulées</Text>
              </View>
              <View style={styles.statChip}>
                <Text style={styles.statChipNum}>{stats?.subscriptions?.active ?? 0}</Text>
                <Text style={styles.statChipLbl}>Abonnements</Text>
              </View>
              <View style={styles.statChip}>
                <Text style={styles.statChipNum}>{stats?.ads?.active ?? 0}</Text>
                <Text style={styles.statChipLbl}>Pubs actives</Text>
              </View>
            </View>

            {/* Navigation */}
            <Text style={styles.sectionTitle}>Navigation</Text>
            <View style={styles.navGrid}>
              <NavButton
                emoji="👤"
                label="Utilisateurs"
                onPress={() => navigation.navigate('AdminUsers')}
              />
              <NavButton
                emoji="📋"
                label="Commandes"
                onPress={() => navigation.navigate('AdminOrders')}
              />
              <NavButton
                emoji="🏪"
                label="Marchands"
                onPress={() => navigation.navigate('AdminMerchants')}
              />
              <NavButton
                emoji="⚠️"
                label="Disputes"
                onPress={() => navigation.navigate('AdminDisputes')}
              />
              <NavButton
                emoji="🔖"
                label="KYC"
                badge={kycCount > 0 ? kycCount : null}
                onPress={() => navigation.navigate('AdminKYC')}
              />
              <NavButton
                emoji="📊"
                label="Rapports"
                onPress={() => navigation.navigate('AdminReports')}
              />
              <NavButton
                emoji="🕐"
                label="Chronologie"
                onPress={() => navigation.navigate('AdminActivity')}
              />
              <NavButton
                emoji="🚨"
                label="Anti-fraude"
                onPress={() => navigation.navigate('AdminFraud')}
              />
              <NavButton
                emoji="📊"
                label="Analytics"
                onPress={() => navigation.navigate('AdminAnalytics')}
              />
              <NavButton
                emoji="💼"
                label="Wallets"
                onPress={() => navigation.navigate('AdminWallet')}
              />
              <NavButton
                emoji="🗺️"
                label="Carte live"
                onPress={() => navigation.navigate('AdminDriverMap')}
              />
              <NavButton
                emoji="🏷️"
                label="Codes promo"
                onPress={() => navigation.navigate('AdminPromoCodes')}
              />
              <NavButton
                emoji="🎫"
                label="Support"
                onPress={() => navigation.navigate('AdminSupport')}
              />
              <NavButton
                emoji="📣"
                label="Broadcast"
                onPress={() => navigation.navigate('AdminBroadcast')}
              />
            </View>

            {/* Revenue total */}
            <View style={styles.revenueCard}>
              <Text style={styles.revenueLabel}>Revenus totaux</Text>
              <Text style={styles.revenueValue}>
                {(stats?.revenue?.totalTND ?? 0).toFixed(2)} TND
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: '700' },
  headerSub: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  sectionTitle: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  kpiGrid: { flexDirection: 'row', paddingHorizontal: 10 },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 4,
    gap: 8,
  },
  statChip: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statChipNum: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  statChipLbl: { color: COLORS.muted, fontSize: 10, marginTop: 2, textAlign: 'center' },
  navGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
  revenueCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  revenueLabel: { color: COLORS.muted, fontSize: 13 },
  revenueValue: { color: COLORS.accent, fontSize: 28, fontWeight: '700', marginTop: 4 },
});
