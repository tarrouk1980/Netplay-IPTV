import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', purple: '#9B59B6',
};

// Tiers mirror the backend loyalty levels (backend/src/routes/loyalty.js)
const LEVELS = [
  { key: 'Bronze', label: 'Bronze', icon: '🥉', min: 0, max: 999, color: '#CD7F32' },
  { key: 'Argent', label: 'Argent', icon: '🥈', min: 1000, max: 4999, color: '#C0C0C0' },
  { key: 'Or', label: 'Or', icon: '🥇', min: 5000, max: 9999, color: COLORS.accent },
  { key: 'Platine', label: 'Platine', icon: '💎', min: 10000, max: 999999, color: COLORS.blue },
];

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

export default function ClientRewardsScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState('VOUCHERS');
  const [redeeming, setRedeeming] = useState(null);

  const load = () => {
    Promise.all([
      api.get('/api/loyalty/balance'),
      api.get('/api/loyalty/history').catch(() => ({ data: [] })),
    ])
      .then(([balRes, histRes]) => {
        setData(balRes.data);
        setRewards(balRes.data?.rewards || []);
        setHistory(Array.isArray(histRes.data) ? histRes.data : []);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const points = data?.points || 0;
  const currentLevel = LEVELS.find(l => points >= l.min && points <= l.max) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1];
  const pointsToNext = data?.pointsToNext != null ? data.pointsToNext : (nextLevel ? nextLevel.min - points : 0);
  const progress = nextLevel
    ? (points - currentLevel.min) / (nextLevel.min - currentLevel.min)
    : 1;

  const handleRedeem = (reward) => {
    if (points < reward.points) {
      Alert.alert('Points insuffisants', `Il vous faut ${reward.points} points. Vous en avez ${points}.`);
      return;
    }
    Alert.alert('Échanger ?', `Utiliser ${reward.points} points pour : ${reward.label} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Confirmer', onPress: async () => {
          setRedeeming(reward.id);
          try {
            await api.post('/api/loyalty/redeem', { rewardId: reward.id });
            // Re-fetch real balance/history from server instead of guessing locally
            load();
            Alert.alert('✅ Récompense activée !', 'Votre récompense a été ajoutée à votre compte.');
          } catch (err) {
            const msg = err?.response?.data?.error || 'Échange impossible. Réessayez.';
            Alert.alert('Erreur', msg);
          } finally { setRedeeming(null); }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={COLORS.accent} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🎁 Récompenses</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 30 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
            Impossible de charger vos récompenses. Vérifiez votre connexion.
          </Text>
          <TouchableOpacity onPress={() => { setLoading(true); load(); }} style={{ backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎁 Récompenses</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Points hero */}
        <View style={[styles.heroCard, { borderColor: currentLevel.color + '50' }]}>
          <Text style={styles.heroEmoji}>{currentLevel.icon}</Text>
          <Text style={[styles.heroLevel, { color: currentLevel.color }]}>{currentLevel.label}</Text>
          <Text style={styles.heroPoints}>{points.toLocaleString()}</Text>
          <Text style={styles.heroLabel}>points EasyWay</Text>

          {nextLevel && (
            <>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: currentLevel.color }]} />
              </View>
              <Text style={styles.progressText}>
                {pointsToNext} pts pour atteindre {nextLevel.label} {nextLevel.icon}
              </Text>
            </>
          )}
        </View>

        {/* Level ladder */}
        <View style={styles.levelsRow}>
          {LEVELS.map((l, i) => {
            const isActive = l.key === currentLevel.key;
            const isDone = LEVELS.indexOf(currentLevel) > i;
            return (
              <View key={l.key} style={styles.levelStep}>
                <View style={[styles.levelCircle, {
                  backgroundColor: isDone || isActive ? l.color + '30' : COLORS.surface,
                  borderColor: isDone || isActive ? l.color : COLORS.border,
                }]}>
                  <Text style={{ fontSize: 16 }}>{l.icon}</Text>
                </View>
                <Text style={[styles.levelName, isActive && { color: l.color }]}>{l.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {[{ key: 'VOUCHERS', label: 'Bons' }, { key: 'HISTORY', label: 'Historique' }].map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
              onPress={() => setTab(t.key)}
            >
              <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ padding: 16 }}>
          {tab === 'VOUCHERS' ? (
            rewards.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                <Text style={{ color: COLORS.muted, fontSize: 14 }}>Aucune récompense disponible</Text>
              </View>
            ) : (
              rewards.map(v => (
                <TouchableOpacity
                  key={v.id}
                  style={styles.voucherCard}
                  onPress={() => handleRedeem(v)}
                  activeOpacity={0.85}
                >
                  <View style={styles.voucherLeft}>
                    <Text style={{ fontSize: 28 }}>{v.icon}</Text>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.voucherTitle}>{v.label}</Text>
                      {!!v.description && <Text style={styles.historyDate}>{v.description}</Text>}
                      <Text style={[styles.voucherCost, points >= v.points ? { color: COLORS.green } : { color: COLORS.red }]}>
                        {v.points} points
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.redeemBtn, points < v.points && { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                    {redeeming === v.id
                      ? <ActivityIndicator size="small" color="#000" />
                      : <Text style={[styles.redeemBtnText, points < v.points && { color: COLORS.muted }]}>
                          {points >= v.points ? 'Échanger' : 'Insuffisant'}
                        </Text>
                    }
                  </View>
                </TouchableOpacity>
              ))
            )
          ) : (
            history.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                <Text style={{ color: COLORS.muted, fontSize: 14 }}>Aucun historique</Text>
              </View>
            ) : (
              history.map(h => (
                <View key={h.id} style={styles.historyRow}>
                  <View style={[styles.historyDot, {
                    backgroundColor: h.points > 0 ? COLORS.green : COLORS.red,
                  }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyLabel}>{h.description || h.type}</Text>
                    <Text style={styles.historyDate}>{fmtDate(h.createdAt)}</Text>
                  </View>
                  <Text style={[styles.historyPoints, {
                    color: h.points > 0 ? COLORS.green : COLORS.red,
                  }]}>
                    {h.points > 0 ? '+' : ''}{h.points} pts
                  </Text>
                </View>
              ))
            )
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  heroCard: {
    margin: 16, backgroundColor: COLORS.surface, borderRadius: 20, padding: 24,
    alignItems: 'center', borderWidth: 1.5,
  },
  heroEmoji: { fontSize: 44, marginBottom: 6 },
  heroLevel: { fontSize: 14, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  heroPoints: { fontSize: 52, fontWeight: '900', color: COLORS.text },
  heroLabel: { color: COLORS.muted, fontSize: 13, marginTop: 2, marginBottom: 14 },
  progressBar: {
    width: '100%', height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { color: COLORS.muted, fontSize: 11, marginTop: 8 },
  levelsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: 16, marginBottom: 8,
  },
  levelStep: { alignItems: 'center', gap: 4 },
  levelCircle: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5,
  },
  levelName: { color: COLORS.muted, fontSize: 10, fontWeight: '600' },
  tabRow: {
    flexDirection: 'row', marginHorizontal: 16, marginVertical: 8,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
  tabBtnActive: { backgroundColor: COLORS.accent },
  tabLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },
  tabLabelActive: { color: '#000' },
  voucherCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  voucherLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  voucherTitle: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  voucherCost: { fontSize: 12, fontWeight: '700', marginTop: 3 },
  redeemBtn: {
    backgroundColor: COLORS.accent, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  redeemBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  historyDot: { width: 8, height: 8, borderRadius: 4 },
  historyLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  historyDate: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  historyPoints: { fontSize: 14, fontWeight: '800' },
});
