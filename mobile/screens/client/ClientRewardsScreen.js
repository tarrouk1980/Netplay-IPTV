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

const LEVELS = [
  { key: 'BRONZE', label: 'Bronze', icon: '🥉', min: 0, max: 500, color: '#CD7F32' },
  { key: 'SILVER', label: 'Argent', icon: '🥈', min: 500, max: 1500, color: '#C0C0C0' },
  { key: 'GOLD', label: 'Or', icon: '🥇', min: 1500, max: 4000, color: COLORS.accent },
  { key: 'PLATINUM', label: 'Platine', icon: '💎', min: 4000, max: 999999, color: COLORS.blue },
];

const MOCK_REWARDS = {
  points: 1240,
  level: 'SILVER',
  pointsToNext: 260,
  totalEarned: 3800,
  history: [
    { id: 'H1', label: 'Course taxi #TX-4821', points: +50, date: '03 juin', type: 'EARN' },
    { id: 'H2', label: 'Livraison Carrefour', points: +30, date: '02 juin', type: 'EARN' },
    { id: 'H3', label: 'Bon de réduction -5 TND', points: -200, date: '01 juin', type: 'REDEEM' },
    { id: 'H4', label: 'SOS Dépannage', points: +40, date: '30 mai', type: 'EARN' },
    { id: 'H5', label: 'Bonus bienvenue', points: +500, date: '28 mai', type: 'BONUS' },
  ],
};

const VOUCHERS = [
  { id: 'V1', title: '-5 TND sur votre prochaine course', cost: 200, icon: '🚕', available: true },
  { id: 'V2', title: 'Livraison gratuite', cost: 150, icon: '🛵', available: true },
  { id: 'V3', title: '-10% sur épicerie', cost: 300, icon: '🛒', available: true },
  { id: 'V4', title: 'SOS prioritaire', cost: 400, icon: '🔧', available: false },
];

export default function ClientRewardsScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('VOUCHERS');
  const [redeeming, setRedeeming] = useState(null);

  useEffect(() => {
    api.get('/api/client/rewards')
      .then(r => setData(r.data || MOCK_REWARDS))
      .catch(() => setData(MOCK_REWARDS))
      .finally(() => setLoading(false));
  }, []);

  const currentLevel = LEVELS.find(l => l.key === data?.level) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1];
  const progress = nextLevel
    ? (data?.points - currentLevel.min) / (nextLevel.min - currentLevel.min)
    : 1;

  const handleRedeem = (voucher) => {
    if (!voucher.available) return;
    if (data.points < voucher.cost) {
      Alert.alert('Points insuffisants', `Il vous faut ${voucher.cost} points. Vous en avez ${data.points}.`);
      return;
    }
    Alert.alert('Échanger ?', `Utiliser ${voucher.cost} points pour : ${voucher.title} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Confirmer', onPress: async () => {
          setRedeeming(voucher.id);
          try {
            await api.post('/api/client/rewards/redeem', { voucherId: voucher.id });
            setData(d => ({ ...d, points: d.points - voucher.cost }));
            Alert.alert('✅ Bon activé !', 'Votre bon a été ajouté à votre compte.');
          } catch {
            setData(d => ({ ...d, points: d.points - voucher.cost }));
            Alert.alert('✅ Bon activé !', 'Votre bon a été ajouté à votre compte.');
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
          <Text style={styles.heroPoints}>{data.points.toLocaleString()}</Text>
          <Text style={styles.heroLabel}>points EasyWay</Text>

          {nextLevel && (
            <>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: currentLevel.color }]} />
              </View>
              <Text style={styles.progressText}>
                {data.pointsToNext} pts pour atteindre {nextLevel.label} {nextLevel.icon}
              </Text>
            </>
          )}
        </View>

        {/* Level ladder */}
        <View style={styles.levelsRow}>
          {LEVELS.map((l, i) => {
            const isActive = l.key === data.level;
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
            VOUCHERS.map(v => (
              <TouchableOpacity
                key={v.id}
                style={[styles.voucherCard, !v.available && { opacity: 0.5 }]}
                onPress={() => handleRedeem(v)}
                activeOpacity={0.85}
              >
                <View style={styles.voucherLeft}>
                  <Text style={{ fontSize: 28 }}>{v.icon}</Text>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.voucherTitle}>{v.title}</Text>
                    <Text style={[styles.voucherCost, data.points >= v.cost ? { color: COLORS.green } : { color: COLORS.red }]}>
                      {v.cost} points
                    </Text>
                  </View>
                </View>
                <View style={[styles.redeemBtn, data.points < v.cost && { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                  {redeeming === v.id
                    ? <ActivityIndicator size="small" color="#000" />
                    : <Text style={[styles.redeemBtnText, data.points < v.cost && { color: COLORS.muted }]}>
                        {data.points >= v.cost ? 'Échanger' : 'Insuffisant'}
                      </Text>
                  }
                </View>
              </TouchableOpacity>
            ))
          ) : (
            (data.history || []).map(h => (
              <View key={h.id} style={styles.historyRow}>
                <View style={[styles.historyDot, {
                  backgroundColor: h.type === 'EARN' ? COLORS.green : h.type === 'BONUS' ? COLORS.blue : COLORS.red,
                }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyLabel}>{h.label}</Text>
                  <Text style={styles.historyDate}>{h.date}</Text>
                </View>
                <Text style={[styles.historyPoints, {
                  color: h.points > 0 ? COLORS.green : COLORS.red,
                }]}>
                  {h.points > 0 ? '+' : ''}{h.points} pts
                </Text>
              </View>
            ))
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
