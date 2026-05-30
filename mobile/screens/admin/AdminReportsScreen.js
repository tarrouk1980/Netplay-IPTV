import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  ActivityIndicator,
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
  purple: '#6A1B9A',
  teal: '#00838F',
};

const PLAN_LABELS = {
  DECOUVERTE: 'Découverte',
  SEMAINE: 'Semaine',
  MENSUEL: 'Mensuel',
  PRO: 'Pro',
};

const PLAN_COLORS = {
  DECOUVERTE: COLORS.muted,
  SEMAINE: COLORS.blue,
  MENSUEL: COLORS.amber,
  PRO: COLORS.accent,
};

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ emoji, title, count }) {
  return (
    <View style={sec.header}>
      <Text style={sec.emoji}>{emoji}</Text>
      <Text style={sec.title}>{title}</Text>
      {count !== undefined ? (
        <View style={sec.badge}>
          <Text style={sec.badgeTxt}>{count}</Text>
        </View>
      ) : null}
    </View>
  );
}

const sec = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    gap: 8,
  },
  emoji: { fontSize: 18 },
  title: { color: COLORS.white, fontSize: 16, fontWeight: '700', flex: 1 },
  badge: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeTxt: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
});

// ── Provider Row ──────────────────────────────────────────────────────────────
function ProviderRow({ rank, data }) {
  const stars = data.avgRating ? '⭐'.repeat(Math.round(data.avgRating)) : null;
  return (
    <View style={pRow.row}>
      <View style={pRow.rankCircle}>
        <Text style={pRow.rankTxt}>{rank}</Text>
      </View>
      <View style={pRow.info}>
        <Text style={pRow.name} numberOfLines={1}>{data.provider?.name || `ID:${(data.provider?.id || '').slice(-6)}`}</Text>
        <Text style={pRow.phone}>{data.provider?.phone || '—'}</Text>
      </View>
      <View style={pRow.right}>
        <Text style={pRow.count}>{data.completedOrders}</Text>
        <Text style={pRow.countLabel}>courses</Text>
        {data.avgRating ? (
          <Text style={pRow.rating}>{data.avgRating.toFixed(1)} ★</Text>
        ) : null}
      </View>
    </View>
  );
}

const pRow = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 14,
    marginVertical: 4,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent + '22',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  rankTxt: { color: COLORS.accent, fontWeight: '700', fontSize: 14 },
  info: { flex: 1 },
  name: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  phone: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  count: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  countLabel: { color: COLORS.muted, fontSize: 10 },
  rating: { color: COLORS.amber, fontSize: 12, fontWeight: '600', marginTop: 2 },
});

// ── Merchant Row ──────────────────────────────────────────────────────────────
function MerchantRow({ rank, data }) {
  const name = data.merchant?.name || data.merchant?.user?.name || `ID:${(data.merchant?.userId || '').slice(-6)}`;
  return (
    <View style={mRow.row}>
      <View style={mRow.rankCircle}>
        <Text style={mRow.rankTxt}>{rank}</Text>
      </View>
      <View style={mRow.info}>
        <Text style={mRow.name} numberOfLines={1}>{name}</Text>
        {data.merchant?.category ? <Text style={mRow.cat}>{data.merchant.category}</Text> : null}
      </View>
      <View style={mRow.right}>
        <Text style={mRow.count}>{data.totalOrders}</Text>
        <Text style={mRow.countLabel}>commandes</Text>
      </View>
    </View>
  );
}

const mRow = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 14,
    marginVertical: 4,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.teal + '22',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.teal,
  },
  rankTxt: { color: COLORS.teal, fontWeight: '700', fontSize: 14 },
  info: { flex: 1 },
  name: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  cat: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  count: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  countLabel: { color: COLORS.muted, fontSize: 10 },
});

// ── Subscription Plan Card ────────────────────────────────────────────────────
function PlanCard({ planKey, planData }) {
  const color = PLAN_COLORS[planKey] || COLORS.muted;
  const label = PLAN_LABELS[planKey] || planKey;
  return (
    <View style={[planCard.card, { borderTopColor: color }]}>
      <Text style={[planCard.label, { color }]}>{label}</Text>
      <View style={planCard.row}>
        <View style={planCard.stat}>
          <Text style={planCard.statNum}>{planData.active || 0}</Text>
          <Text style={planCard.statLbl}>Actifs</Text>
        </View>
        <View style={planCard.stat}>
          <Text style={planCard.statNum}>{planData.expired || 0}</Text>
          <Text style={planCard.statLbl}>Expirés</Text>
        </View>
        <View style={planCard.stat}>
          <Text style={[planCard.statNum, { color: COLORS.green }]}>
            {planData.estimatedRevenueTND || 0} TND
          </Text>
          <Text style={planCard.statLbl}>Revenus est.</Text>
        </View>
      </View>
    </View>
  );
}

const planCard = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 14,
    marginVertical: 5,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center', flex: 1 },
  statNum: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  statLbl: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function AdminReportsScreen({ navigation }) {
  const { reports, isLoading, fetchReports } = useAdminStore();

  const load = useCallback(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = () => {
    Alert.alert('Export', 'Export disponible en version web.\nConnectez-vous au panel admin sur votre navigateur.');
  };

  const subs = reports?.subscriptions;
  const providers = reports?.topProviders?.providers || [];
  const merchants = reports?.topMerchants?.merchants || [];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📊 Rapports</Text>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <Text style={styles.exportTxt}>⬇ Export</Text>
        </TouchableOpacity>
      </View>

      {isLoading && !subs ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loaderTxt}>Chargement des rapports...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={COLORS.accent} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Subscriptions */}
          <SectionHeader emoji="💳" title="Abonnements" />
          {subs?.byPlan ? (
            <>
              {Object.entries(subs.byPlan).map(([planKey, planData]) => (
                <PlanCard key={planKey} planKey={planKey} planData={planData} />
              ))}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total actifs</Text>
                <Text style={styles.summaryValue}>{subs.totalActive || 0}</Text>
                <Text style={styles.summaryLabel}>Renouvellement auto</Text>
                <Text style={styles.summaryValue}>{subs.autoRenewCount || 0}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.noData}>Aucune donnée</Text>
          )}

          {/* Top Providers */}
          <SectionHeader emoji="🏆" title="Top Prestataires" count={providers.length} />
          {providers.length > 0 ? (
            providers.map((p, i) => <ProviderRow key={p.provider?.id || i} rank={i + 1} data={p} />)
          ) : (
            <Text style={styles.noData}>Aucune donnée</Text>
          )}

          {/* Top Merchants */}
          <SectionHeader emoji="🏪" title="Top Marchands" count={merchants.length} />
          {merchants.length > 0 ? (
            merchants.map((m, i) => <MerchantRow key={m.merchant?.userId || i} rank={i + 1} data={m} />)
          ) : (
            <Text style={styles.noData}>Aucune donnée</Text>
          )}

          {/* Export note */}
          <TouchableOpacity style={styles.exportCard} onPress={handleExport}>
            <Text style={styles.exportCardEmoji}>🖥️</Text>
            <View>
              <Text style={styles.exportCardTitle}>Export complet</Text>
              <Text style={styles.exportCardSub}>Disponible en version web</Text>
            </View>
            <Text style={styles.exportCardArrow}>›</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700', flex: 1 },
  exportBtn: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  exportTxt: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderTxt: { color: COLORS.muted, fontSize: 14 },
  scroll: { flex: 1 },
  noData: { color: COLORS.muted, textAlign: 'center', paddingVertical: 16, fontSize: 13 },
  summaryCard: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    marginHorizontal: 14,
    marginTop: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryLabel: { color: COLORS.muted, fontSize: 12 },
  summaryValue: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  exportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 14,
    marginTop: 24,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },
  exportCardEmoji: { fontSize: 28 },
  exportCardTitle: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  exportCardSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  exportCardArrow: { color: COLORS.muted, fontSize: 22, marginLeft: 'auto' },
});
