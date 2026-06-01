import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Animated,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  accent: '#D32F2F',
  orange: '#F57C00',
  green: '#27AE60',
  blue: '#1565C0',
};

const STATUS_LABEL = {
  PENDING: 'En attente',
  ACCEPTED: 'Accepté',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
};

const STATUS_COLOR = {
  PENDING: COLORS.orange,
  ACCEPTED: COLORS.blue,
  IN_PROGRESS: COLORS.green,
  COMPLETED: COLORS.muted,
  CANCELLED: COLORS.accent,
};

function PulseRing({ color }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.5, duration: 900, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 900, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 900, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: color,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
}

function StatCard({ value, label, color }) {
  return (
    <View style={s.statCard}>
      <Text style={[s.statValue, { color: color || COLORS.text }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

export default function DepanneurDashboardScreen({ navigation }) {
  const [isOnline, setIsOnline] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [active, setActive] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/sos/depanneur/dashboard');
      const d = res.data;
      setIsOnline(d.isOnline ?? false);
      setActive(d.activeIntervention ?? null);
      setHistory(d.history ?? []);
      setStats(d.stats ?? null);
    } catch {
      // fallback mock
      setStats({ interventions: 0, revenue: 0, rating: 5.0, streak: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 12000);
    return () => clearInterval(iv);
  }, [load]);

  const handleToggle = async (val) => {
    setToggleLoading(true);
    try {
      await api.patch('/api/sos/depanneur/toggle');
      setIsOnline(val);
    } catch {
      Alert.alert('Erreur', 'Impossible de changer le statut.');
    } finally {
      setToggleLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!active) return;
    Alert.alert('Terminer?', 'Confirmer la fin de cette intervention ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Terminer',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.patch(`/api/sos/orders/${active.id}/complete`);
            load();
          } catch (e) {
            Alert.alert('Erreur', e?.response?.data?.error || 'Erreur serveur');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={COLORS.orange} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>🛻 Tableau de bord</Text>
        <View style={s.onlineDot(isOnline)} />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.orange} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Toggle */}
        <View style={s.toggleCard}>
          <View>
            <Text style={s.toggleLabel}>{isOnline ? '🟢 En ligne' : '🔴 Hors ligne'}</Text>
            <Text style={s.toggleSub}>{isOnline ? 'Vous recevez des missions' : 'Vous ne recevez pas de missions'}</Text>
          </View>
          {toggleLoading ? (
            <ActivityIndicator color={COLORS.orange} />
          ) : (
            <Switch
              value={isOnline}
              onValueChange={handleToggle}
              trackColor={{ false: COLORS.border, true: COLORS.orange }}
              thumbColor="#FFF"
            />
          )}
        </View>

        {/* Stats */}
        {stats && (
          <View style={s.statsRow}>
            <StatCard value={stats.interventions ?? 0} label={'Interventions\naujourd\'hui'} />
            <StatCard value={`${(stats.revenue ?? 0).toFixed(0)} TND`} label={'Revenus\naujourd\'hui'} color={COLORS.green} />
            <StatCard value={`⭐ ${(stats.rating ?? 5).toFixed(1)}`} label="Note" color="#F5A623" />
            <StatCard value={`🔥 ${stats.streak ?? 0}j`} label="Série" color={COLORS.orange} />
          </View>
        )}

        {/* Active intervention */}
        {active ? (
          <View style={s.activeCard}>
            <View style={s.pulseWrapper}>
              <PulseRing color={COLORS.orange} />
              <View style={[s.pulseCore, { backgroundColor: COLORS.orange }]}>
                <Text style={{ fontSize: 22 }}>🛻</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.activeTitle}>Intervention en cours</Text>
              <Text style={s.activeClient}>{active.client?.name || 'Client'}</Text>
              <Text style={s.activeMeta}>📍 {active.metadata?.location || 'Localisation non précisée'}</Text>
              <Text style={s.activeMeta}>🔧 {active.metadata?.problemType || 'Type non précisé'}</Text>
              <Text style={[s.activeMeta, { color: STATUS_COLOR[active.status] || COLORS.orange }]}>
                {STATUS_LABEL[active.status] || active.status}
              </Text>
            </View>

            <View style={s.activeActions}>
              <TouchableOpacity
                style={s.detailBtn}
                onPress={() => navigation.navigate('SOSOrderDetail', { orderId: active.id })}
              >
                <Text style={s.detailBtnTxt}>Détail</Text>
              </TouchableOpacity>
              {active.status === 'IN_PROGRESS' && (
                <TouchableOpacity style={s.completeBtn} onPress={handleComplete}>
                  <Text style={s.completeBtnTxt}>✓ Terminé</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : isOnline ? (
          <View style={s.waitCard}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>⏳</Text>
            <Text style={s.waitTitle}>En attente d'une mission...</Text>
            <Text style={s.waitSub}>Restez connecté pour recevoir des demandes.</Text>
          </View>
        ) : (
          <View style={s.offlineCard}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>😴</Text>
            <Text style={s.waitTitle}>Vous êtes hors ligne</Text>
            <Text style={s.waitSub}>Activez le bouton ci-dessus pour recevoir des missions.</Text>
          </View>
        )}

        {/* Quick links */}
        <View style={s.quickRow}>
          {[
            { icon: '📄', label: 'Docs', screen: 'DriverDocuments' },
            { icon: '🗺', label: 'Zones chaudes', screen: 'DriverHeatmap' },
            { icon: '🎯', label: 'Objectif', screen: 'EarningsGoal' },
            { icon: '⭐', label: 'Avis', screen: 'ProviderReviews' },
            { icon: '💰', label: 'Revenus', screen: 'ProviderEarnings' },
          ].map((q) => (
            <TouchableOpacity key={q.screen} style={s.quickBtn} onPress={() => navigation.navigate(q.screen)}>
              <Text style={{ fontSize: 22 }}>{q.icon}</Text>
              <Text style={s.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* History */}
        <Text style={s.sectionTitle}>Historique récent</Text>
        {history.length === 0 ? (
          <Text style={s.emptyTxt}>Aucune intervention récente.</Text>
        ) : (
          history.slice(0, 10).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={s.historyCard}
              onPress={() => navigation.navigate('SOSOrderDetail', { orderId: item.id })}
            >
              <View style={{ flex: 1 }}>
                <Text style={s.historyClient}>{item.client?.name || 'Client'}</Text>
                <Text style={s.historyMeta}>{item.metadata?.problemType || '—'}</Text>
                <Text style={s.historyDate}>
                  {new Date(item.createdAt).toLocaleDateString('fr-TN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={[s.historyStatus, { color: STATUS_COLOR[item.status] || COLORS.muted }]}>
                  {STATUS_LABEL[item.status] || item.status}
                </Text>
                <Text style={s.historyAmount}>{parseFloat(item.price || 0).toFixed(3)} TND</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  backArrow: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', flex: 1 },
  onlineDot: (online) => ({
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: online ? COLORS.green : COLORS.muted,
  }),
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  toggleLabel: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  toggleSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: { color: COLORS.text, fontSize: 15, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: COLORS.muted, fontSize: 9, textAlign: 'center', lineHeight: 12 },
  activeCard: {
    backgroundColor: '#1A1208',
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.orange,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pulseWrapper: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCore: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTitle: { color: COLORS.orange, fontSize: 13, fontWeight: '700', marginBottom: 2 },
  activeClient: { color: COLORS.text, fontSize: 15, fontWeight: '600', marginBottom: 4 },
  activeMeta: { color: COLORS.muted, fontSize: 13, marginBottom: 2 },
  activeActions: { gap: 8, marginTop: 4 },
  detailBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailBtnTxt: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  completeBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  completeBtnTxt: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  waitCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  offlineCard: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  waitTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  waitSub: { color: COLORS.muted, fontSize: 13, textAlign: 'center' },
  quickRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickLabel: { color: COLORS.muted, fontSize: 9, textAlign: 'center' },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  emptyTxt: { color: COLORS.muted, textAlign: 'center', fontSize: 13, marginTop: 8 },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyClient: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  historyMeta: { color: COLORS.muted, fontSize: 12, marginBottom: 2 },
  historyDate: { color: COLORS.muted, fontSize: 11 },
  historyStatus: { fontSize: 12, fontWeight: '600' },
  historyAmount: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
});
