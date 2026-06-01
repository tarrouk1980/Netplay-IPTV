import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  RefreshControl,
  Modal,
  TextInput,
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
  green: '#27AE60',
  orange: '#F57C00',
  gold: '#F5A623',
};

const PLAN_COLORS = {
  STARTER: COLORS.green,
  PRO: COLORS.gold,
  UNLIMITED: '#9C27B0',
};

const PLAN_ICONS = {
  STARTER: '🥉',
  PRO: '🥇',
  UNLIMITED: '👑',
};

function GrantModal({ visible, onClose, onConfirm }) {
  const [userId, setUserId] = useState('');
  const [plan, setPlan] = useState('PRO');
  const [days, setDays] = useState('30');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!userId.trim()) { Alert.alert('Erreur', 'Saisir un ID utilisateur.'); return; }
    setLoading(true);
    try {
      await onConfirm(userId.trim(), plan, parseInt(days) || 30);
      setUserId(''); setDays('30');
      onClose();
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.card}>
          <Text style={m.title}>🎁 Offrir un EasyPass</Text>
          <TextInput style={m.input} placeholder="ID utilisateur" placeholderTextColor={COLORS.muted} value={userId} onChangeText={setUserId} autoCapitalize="none" />
          <Text style={m.label}>Plan</Text>
          <View style={m.planRow}>
            {['STARTER', 'PRO', 'UNLIMITED'].map((p) => (
              <TouchableOpacity key={p} style={[m.planBtn, plan === p && { borderColor: PLAN_COLORS[p] }]} onPress={() => setPlan(p)}>
                <Text style={[m.planTxt, plan === p && { color: PLAN_COLORS[p] }]}>{PLAN_ICONS[p]} {p}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={m.input} placeholder="Durée (jours)" placeholderTextColor={COLORS.muted} value={days} onChangeText={setDays} keyboardType="number-pad" />
          <View style={m.btns}>
            <TouchableOpacity style={m.cancel} onPress={onClose} disabled={loading}>
              <Text style={m.cancelTxt}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={m.confirm} onPress={handle} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={m.confirmTxt}>Offrir</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, width: '100%', borderWidth: 1, borderColor: COLORS.border },
  title: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 14 },
  label: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, marginTop: 4 },
  input: { backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 12, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  planRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  planBtn: { flex: 1, backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  planTxt: { color: COLORS.muted, fontSize: 11, fontWeight: '700' },
  btns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancel: { flex: 1, backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 13, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  cancelTxt: { color: COLORS.muted, fontWeight: '600' },
  confirm: { flex: 1, backgroundColor: COLORS.gold, borderRadius: 10, padding: 13, alignItems: 'center' },
  confirmTxt: { color: '#FFF', fontWeight: '700' },
});

export default function AdminPassManagementScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [grantModal, setGrantModal] = useState(false);
  const [revoking, setRevoking] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/passes');
      setStats(res.data.stats);
      setSubs(res.data.subscriptions || []);
    } catch {
      setStats({ totalActive: 0, totalRevenue: 0, starter: 0, pro: 0, unlimited: 0, churnRate: 0 });
      setSubs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleGrant = async (userId, plan, days) => {
    await api.post('/api/admin/passes/grant', { userId, plan, days });
    Alert.alert('EasyPass offert ✅', `Plan ${plan} accordé pour ${days} jours.`);
    load();
  };

  const handleRevoke = (subId, userName) => {
    Alert.alert('Révoquer ?', `Annuler le pass de ${userName} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Révoquer', style: 'destructive',
        onPress: async () => {
          setRevoking(subId);
          try {
            await api.post(`/api/admin/passes/${subId}/revoke`);
            Alert.alert('Pass révoqué');
            load();
          } catch (e) {
            Alert.alert('Erreur', e?.response?.data?.error || 'Erreur');
          } finally {
            setRevoking(null);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={COLORS.gold} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>👑 Gestion EasyPass</Text>
        <TouchableOpacity style={s.grantBtn} onPress={() => setGrantModal(true)}>
          <Text style={s.grantBtnTxt}>+ Offrir</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={subs}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.gold} />}
        ListHeaderComponent={
          <>
            {/* Stats */}
            <View style={s.statsGrid}>
              {[
                { label: 'Actifs', value: stats?.totalActive ?? 0, color: COLORS.green },
                { label: 'Revenus mois', value: `${(stats?.totalRevenue ?? 0).toFixed(0)} TND`, color: COLORS.gold },
                { label: 'STARTER', value: stats?.starter ?? 0 },
                { label: 'PRO', value: stats?.pro ?? 0, color: COLORS.gold },
                { label: 'UNLIMITED', value: stats?.unlimited ?? 0, color: '#9C27B0' },
                { label: 'Churn', value: `${(stats?.churnRate ?? 0).toFixed(1)}%`, color: COLORS.accent },
              ].map((k, i) => (
                <View key={i} style={s.statCard}>
                  <Text style={[s.statValue, { color: k.color || COLORS.text }]}>{k.value}</Text>
                  <Text style={s.statLabel}>{k.label}</Text>
                </View>
              ))}
            </View>
            <Text style={s.sectionTitle}>Abonnements actifs</Text>
          </>
        }
        renderItem={({ item }) => {
          const planColor = PLAN_COLORS[item.plan] || COLORS.muted;
          const daysLeft = item.expiresAt
            ? Math.max(0, Math.ceil((new Date(item.expiresAt) - Date.now()) / 86400000))
            : null;
          return (
            <View style={[s.subCard, { borderLeftColor: planColor }]}>
              <View style={{ flex: 1 }}>
                <View style={s.subTop}>
                  <Text style={s.subUser}>{item.user?.name || 'Utilisateur'}</Text>
                  <Text style={[s.planBadge, { color: planColor, borderColor: planColor, backgroundColor: planColor + '22' }]}>
                    {PLAN_ICONS[item.plan]} {item.plan}
                  </Text>
                </View>
                <Text style={s.subPhone}>{item.user?.phone}</Text>
                {daysLeft != null && (
                  <Text style={[s.daysLeft, { color: daysLeft < 3 ? COLORS.accent : daysLeft < 7 ? COLORS.orange : COLORS.muted }]}>
                    {daysLeft > 0 ? `⏳ ${daysLeft} jours restants` : '❌ Expiré'}
                  </Text>
                )}
                <Text style={s.subDate}>Depuis {new Date(item.createdAt).toLocaleDateString('fr-TN')}</Text>
              </View>
              <TouchableOpacity
                style={s.revokeBtn}
                onPress={() => handleRevoke(item.id, item.user?.name)}
                disabled={revoking === item.id}
              >
                {revoking === item.id ? (
                  <ActivityIndicator color={COLORS.accent} size="small" />
                ) : (
                  <Text style={s.revokeTxt}>Révoquer</Text>
                )}
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>📭</Text>
            <Text style={s.emptyTitle}>Aucun abonnement actif</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      <GrantModal visible={grantModal} onClose={() => setGrantModal(false)} onConfirm={handleGrant} />
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', flex: 1 },
  grantBtn: { backgroundColor: COLORS.gold, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  grantBtnTxt: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginTop: 16, marginBottom: 8 },
  statCard: { width: '30%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statValue: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: COLORS.muted, fontSize: 10, textAlign: 'center' },
  sectionTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginHorizontal: 16, marginBottom: 8 },
  subCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
  },
  subTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  subUser: { color: COLORS.text, fontSize: 14, fontWeight: '600', flex: 1 },
  planBadge: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  subPhone: { color: COLORS.muted, fontSize: 12, marginBottom: 2 },
  daysLeft: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  subDate: { color: COLORS.muted, fontSize: 11 },
  revokeBtn: { backgroundColor: COLORS.accent + '22', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.accent, marginLeft: 10 },
  revokeTxt: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyTitle: { color: COLORS.muted, fontSize: 15 },
});
