import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', accentDark: '#C47D0A', white: '#FFFFFF',
  muted: '#8A8A9A', border: '#2A2A3A', green: '#27AE60',
  blue: '#1565C0', purple: '#7B1FA2', danger: '#E74C3C',
};

const TIERS = [
  { name: 'Bronze',   min: 0,    max: 499,  color: '#CD7F32', emoji: '🥉', perks: ['5% remise taxi', 'Accès priorité support'] },
  { name: 'Argent',   min: 500,  max: 1499, color: '#C0C0C0', emoji: '🥈', perks: ['8% remise taxi', 'Livraison offerte ×2/mois', 'Support dédié'] },
  { name: 'Or',       min: 1500, max: 3999, color: '#FFD700', emoji: '🥇', perks: ['12% remise tous services', 'Livraison offerte ×5/mois', 'Accès EasyPass Basic'] },
  { name: 'Platine',  min: 4000, max: 9999, color: '#E5E4E2', emoji: '💎', perks: ['15% remise tous services', 'Livraison illimitée offerte', 'EasyPass Premium inclus'] },
  { name: 'Diamant',  min: 10000, max: Infinity, color: '#B9F2FF', emoji: '👑', perks: ['20% remise', 'Chauffeur dédié', 'EasyPass Gold inclus', 'Concierge 24/7'] },
];

const REWARDS = [
  { id: 'taxi5', label: '-5 TND sur votre prochain taxi', cost: 100, emoji: '🚕', service: 'TAXI' },
  { id: 'delivery_free', label: 'Livraison offerte', cost: 80, emoji: '🛵', service: 'DELIVERY' },
  { id: 'sos10', label: '-10 TND sur SOS Remorquage', cost: 200, emoji: '🛻', service: 'SOS' },
  { id: 'grocery15', label: '-15 TND sur vos courses', cost: 250, emoji: '🛒', service: 'GROCERY' },
  { id: 'pass1month', label: '1 mois EasyPass Basic', cost: 500, emoji: '⭐', service: 'PASS' },
  { id: 'taxi20', label: '-20 TND sur votre prochain taxi', cost: 350, emoji: '🚕', service: 'TAXI' },
];

const TYPE_EARN = {
  TAXI: { emoji: '🚕', label: 'Course taxi', color: COLORS.accent },
  DELIVERY: { emoji: '🛵', label: 'Livraison', color: COLORS.green },
  SOS: { emoji: '🛻', label: 'SOS Remorquage', color: COLORS.danger },
  GROCERY: { emoji: '🛒', label: 'Courses', color: COLORS.blue },
  REDEEM: { emoji: '🎁', label: 'Récompense utilisée', color: COLORS.purple },
  BONUS: { emoji: '🎉', label: 'Bonus', color: '#FF9800' },
};

const MOCK_HISTORY = [
  { id: '1', type: 'TAXI', points: 10, createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), desc: 'Course Tunis → La Marsa' },
  { id: '2', type: 'DELIVERY', points: 8, createdAt: new Date(Date.now() - 3600000 * 26).toISOString(), desc: 'Livraison Pizza Hut' },
  { id: '3', type: 'BONUS', points: 50, createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), desc: 'Bienvenue sur EasyWay !' },
  { id: '4', type: 'REDEEM', points: -100, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), desc: 'Remise -5 TND taxi' },
  { id: '5', type: 'SOS', points: 15, createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), desc: 'SOS Remorquage Sfax' },
  { id: '6', type: 'GROCERY', points: 5, createdAt: new Date(Date.now() - 86400000 * 9).toISOString(), desc: 'Courses Monoprix' },
  { id: '7', type: 'TAXI', points: 10, createdAt: new Date(Date.now() - 86400000 * 12).toISOString(), desc: 'Course Sousse Centre' },
];

function TierProgressBar({ points }) {
  const tier = TIERS.find(t => points >= t.min && points <= t.max) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(tier) + 1];
  const progress = nextTier
    ? (points - tier.min) / (tier.max - tier.min + 1)
    : 1;

  return (
    <View style={styles.tierCard}>
      <View style={styles.tierHeader}>
        <Text style={styles.tierEmoji}>{tier.emoji}</Text>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
          <Text style={styles.tierPts}>{points.toLocaleString()} pts</Text>
        </View>
        {nextTier && (
          <View>
            <Text style={styles.nextTierLabel}>Prochain: {nextTier.emoji} {nextTier.name}</Text>
            <Text style={styles.nextTierPts}>{(nextTier.min - points).toLocaleString()} pts restants</Text>
          </View>
        )}
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: tier.color }]} />
      </View>
      <View style={styles.tierPerks}>
        {tier.perks.map((p, i) => (
          <Text key={i} style={styles.perkText}>✓ {p}</Text>
        ))}
      </View>
    </View>
  );
}

function RewardCard({ reward, points, onRedeem }) {
  const affordable = points >= reward.cost;
  return (
    <View style={[styles.rewardCard, !affordable && styles.rewardCardDim]}>
      <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
      <Text style={styles.rewardLabel}>{reward.label}</Text>
      <View style={styles.rewardFooter}>
        <Text style={[styles.rewardCost, { color: affordable ? COLORS.accent : COLORS.muted }]}>
          {reward.cost} pts
        </Text>
        <TouchableOpacity
          style={[styles.redeemBtn, !affordable && styles.redeemBtnDis]}
          onPress={() => onRedeem(reward)}
          disabled={!affordable}
          activeOpacity={0.8}
        >
          <Text style={styles.redeemBtnText}>{affordable ? 'Utiliser' : 'Insuffisant'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function EasyPointsDashboardScreen({ navigation }) {
  const [points, setPoints] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('rewards'); // rewards | history | tiers

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/loyalty/me');
      setPoints(res.data.points ?? 0);
      setHistory(res.data.history || MOCK_HISTORY);
    } catch {
      setPoints(68);
      setHistory(MOCK_HISTORY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRedeem = (reward) => {
    Alert.alert(
      `Utiliser ${reward.cost} pts`,
      `Obtenir: ${reward.label}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              await api.post('/api/loyalty/redeem', { rewardId: reward.id });
              setPoints(p => p - reward.cost);
              Alert.alert('🎁 Récompense activée !', `Votre ${reward.label} est disponible.`);
            } catch {
              Alert.alert('Erreur', 'Impossible d\'utiliser cette récompense.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⭐ EasyPoints</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Points hero */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Vos points</Text>
        <Text style={styles.heroPoints}>{(points || 0).toLocaleString()}</Text>
        <Text style={styles.heroPts}>EasyPoints</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[['rewards', '🎁 Récompenses'], ['history', '📋 Historique'], ['tiers', '🏆 Niveaux']].map(([key, lbl]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, tab === key && styles.tabActive]}
            onPress={() => setTab(key)}
          >
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {tab === 'rewards' && (
          <View style={styles.rewardsGrid}>
            {REWARDS.map(r => (
              <RewardCard key={r.id} reward={r} points={points || 0} onRedeem={handleRedeem} />
            ))}
          </View>
        )}

        {tab === 'history' && (
          <View style={{ padding: 16 }}>
            <Text style={styles.sectionTitle}>Historique de points</Text>
            {history.map(h => {
              const meta = TYPE_EARN[h.type] || TYPE_EARN.BONUS;
              const d = new Date(h.createdAt);
              const dateStr = d.toLocaleDateString('fr-TN', { day: '2-digit', month: 'short' });
              return (
                <View key={h.id} style={styles.histRow}>
                  <View style={[styles.histIcon, { backgroundColor: meta.color + '22' }]}>
                    <Text style={{ fontSize: 18 }}>{meta.emoji}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.histDesc}>{h.desc}</Text>
                    <Text style={styles.histDate}>{meta.label} · {dateStr}</Text>
                  </View>
                  <Text style={[styles.histPts, { color: h.points > 0 ? COLORS.green : COLORS.danger }]}>
                    {h.points > 0 ? '+' : ''}{h.points} pts
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {tab === 'tiers' && (
          <View style={{ padding: 16 }}>
            <TierProgressBar points={points || 0} />
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Tous les niveaux</Text>
            {TIERS.map(t => (
              <View key={t.name} style={[styles.allTierRow, { borderLeftColor: t.color }]}>
                <Text style={styles.allTierEmoji}>{t.emoji}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.allTierName, { color: t.color }]}>{t.name}</Text>
                  <Text style={styles.allTierRange}>
                    {t.min.toLocaleString()} – {t.max === Infinity ? '∞' : t.max.toLocaleString()} pts
                  </Text>
                  {t.perks.map((p, i) => (
                    <Text key={i} style={styles.allTierPerk}>· {p}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, alignItems: 'center' },
  backText: { color: COLORS.white, fontSize: 28 },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  hero: {
    backgroundColor: COLORS.surface, alignItems: 'center', paddingVertical: 28,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  heroLabel: { color: COLORS.muted, fontSize: 13 },
  heroPoints: { color: COLORS.accent, fontSize: 52, fontWeight: '800', marginVertical: 4 },
  heroPts: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  tabText: { color: COLORS.muted, fontSize: 13 },
  tabTextActive: { color: COLORS.accent, fontWeight: '700' },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  rewardsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10 },
  rewardCard: {
    width: '46%', margin: '2%', backgroundColor: COLORS.surface,
    borderRadius: 16, padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  rewardCardDim: { opacity: 0.55 },
  rewardEmoji: { fontSize: 28, marginBottom: 8 },
  rewardLabel: { color: COLORS.white, fontSize: 13, fontWeight: '600', marginBottom: 12, lineHeight: 18 },
  rewardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rewardCost: { fontSize: 13, fontWeight: '700' },
  redeemBtn: { backgroundColor: COLORS.accent, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  redeemBtnDis: { backgroundColor: COLORS.border },
  redeemBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  histRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  histIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  histDesc: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  histDate: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  histPts: { fontSize: 15, fontWeight: '700' },
  tierCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 16,
  },
  tierHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  tierEmoji: { fontSize: 36 },
  tierName: { fontSize: 20, fontWeight: '800' },
  tierPts: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  nextTierLabel: { color: COLORS.muted, fontSize: 12, textAlign: 'right' },
  nextTierPts: { color: COLORS.white, fontSize: 12, fontWeight: '700', textAlign: 'right', marginTop: 2 },
  progressBg: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, marginBottom: 14 },
  progressFill: { height: 8, borderRadius: 4 },
  tierPerks: { gap: 4 },
  perkText: { color: COLORS.muted, fontSize: 12 },
  allTierRow: {
    flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 4,
  },
  allTierEmoji: { fontSize: 28 },
  allTierName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  allTierRange: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  allTierPerk: { color: COLORS.muted, fontSize: 12 },
});
