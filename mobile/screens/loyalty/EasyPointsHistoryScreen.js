import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F', purple: '#8E44AD',
};

// Fallback only used if /api/loyalty/balance is unreachable — the real
// catalog (and the only set of ids /api/loyalty/redeem actually accepts)
// is fetched from the backend below.
const FALLBACK_REWARDS = [
  { id: 'r1', pts: 500,  label: '-10% Taxi',          emoji: '🚕' },
  { id: 'r2', pts: 300,  label: 'Livraison gratuite',  emoji: '🛵' },
  { id: 'r3', pts: 800,  label: '-50% SOS',            emoji: '🚑' },
  { id: 'r4', pts: 2000, label: 'Course offerte',      emoji: '🎁' },
];

export default function EasyPointsHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [rewards, setRewards] = useState(FALLBACK_REWARDS);
  const [redeeming, setRedeeming] = useState(null);
  const [tab, setTab] = useState('historique');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/loyalty/history');
        setHistory(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('[EasyPointsHistoryScreen] history load failed', err);
        setHistory([]);
        setHistoryError('Impossible de charger l\'historique des points.');
      }
      try {
        const balRes = await api.get('/api/loyalty/balance');
        setBalance(balRes.data.points ?? 0);
        if (Array.isArray(balRes.data.rewards) && balRes.data.rewards.length) {
          setRewards(balRes.data.rewards.map((r) => ({
            id: r.id, pts: r.points, label: r.label, emoji: r.icon,
          })));
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const handleRedeem = async (reward) => {
    setRedeeming(reward.id);
    try {
      await api.post('/api/loyalty/redeem', { rewardId: reward.id });
      setBalance((p) => p - reward.pts);
      Alert.alert('🎁 Récompense activée !', `${reward.label} est disponible.`);
    } catch {
      Alert.alert('Erreur', "Impossible d'échanger cette récompense.");
    } finally {
      setRedeeming(null);
    }
  };

  const earned = history.filter((h) => h.type === 'credit').reduce((s, h) => s + h.pts, 0);
  const spent  = history.filter((h) => h.type === 'debit').reduce((s, h) => s + Math.abs(h.pts), 0);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>⭐ EasyPoints</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Balance */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Votre solde</Text>
        <Text style={styles.balanceValue}>{balance.toLocaleString()} pts</Text>
        <View style={styles.balanceStats}>
          <View style={styles.balanceStat}>
            <Text style={[styles.balanceStatNum, { color: COLORS.green }]}>+{earned}</Text>
            <Text style={styles.balanceStatLabel}>Gagnés</Text>
          </View>
          <View style={[styles.balanceStat, { borderLeftWidth: 1, borderLeftColor: COLORS.border }]}>
            <Text style={[styles.balanceStatNum, { color: COLORS.red }]}>−{spent}</Text>
            <Text style={styles.balanceStatLabel}>Dépensés</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[{ key: 'historique', label: '📋 Historique' }, { key: 'echanger', label: '🎁 Échanger' }].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && { color: '#000' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'historique' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {loading && <ActivityIndicator color={COLORS.accent} style={{ marginTop: 20 }} />}
          {!loading && historyError && (
            <Text style={{ color: COLORS.red, fontSize: 13, textAlign: 'center', marginTop: 20 }}>{historyError}</Text>
          )}
          {!loading && !historyError && history.length === 0 && (
            <Text style={{ color: COLORS.muted, fontSize: 13, textAlign: 'center', marginTop: 20 }}>Aucune transaction pour le moment.</Text>
          )}
          {history.map((h) => (
            <View key={h.id} style={styles.txRow}>
              <View style={[styles.txIcon, { backgroundColor: (h.type === 'credit' ? COLORS.green : COLORS.red) + '22' }]}>
                <Text style={{ fontSize: 20 }}>{h.service}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.txLabel}>{h.label}</Text>
                <Text style={styles.txDate}>{h.date}</Text>
              </View>
              <Text style={[styles.txPts, { color: h.type === 'credit' ? COLORS.green : COLORS.red }]}>
                {h.type === 'credit' ? '+' : ''}{h.pts} pts
              </Text>
            </View>
          ))}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {tab === 'echanger' && (
        <ScrollView contentContainerStyle={styles.rewardList} showsVerticalScrollIndicator={false}>
          <Text style={styles.rewardNote}>Échangez vos points contre des avantages exclusifs !</Text>
          {rewards.map((r) => {
            const canRedeem = balance >= r.pts;
            const isRedeeming = redeeming === r.id;
            return (
              <View key={r.id} style={[styles.rewardCard, !canRedeem && { opacity: 0.5 }]}>
                <Text style={{ fontSize: 36 }}>{r.emoji}</Text>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.rewardLabel}>{r.label}</Text>
                  <Text style={styles.rewardPts}>{r.pts.toLocaleString()} points</Text>
                </View>
                <TouchableOpacity
                  style={[styles.redeemBtn, !canRedeem && styles.redeemBtnDisabled]}
                  disabled={!canRedeem || isRedeeming}
                  onPress={() => handleRedeem(r)}
                >
                  {isRedeeming
                    ? <ActivityIndicator color="#000" size="small" />
                    : <Text style={styles.redeemBtnText}>{canRedeem ? 'Échanger' : 'Insuffisant'}</Text>}
                </TouchableOpacity>
              </View>
            );
          })}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  balanceCard: {
    backgroundColor: '#1A1200', margin: 16, borderRadius: 16,
    borderWidth: 1.5, borderColor: COLORS.accent, padding: 20, alignItems: 'center',
  },
  balanceLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  balanceValue: { color: COLORS.accent, fontSize: 40, fontWeight: '900', marginBottom: 14 },
  balanceStats: { flexDirection: 'row', width: '100%' },
  balanceStat: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  balanceStatNum: { fontSize: 20, fontWeight: '800' },
  balanceStatLabel: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 6 },
  tab: {
    flex: 1, paddingVertical: 9, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  txRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  txIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  txLabel: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  txDate: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  txPts: { fontSize: 15, fontWeight: '800' },
  rewardList: { padding: 16, gap: 10 },
  rewardNote: { color: COLORS.muted, fontSize: 13, marginBottom: 4 },
  rewardCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, padding: 16,
  },
  rewardLabel: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  rewardPts: { color: COLORS.accent, fontSize: 13, fontWeight: '700', marginTop: 3 },
  redeemBtn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  redeemBtnDisabled: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  redeemBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },
});
