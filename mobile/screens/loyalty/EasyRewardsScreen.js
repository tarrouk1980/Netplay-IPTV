import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  orange: '#F57C00',
  green: '#27AE60',
  accent: '#D32F2F',
  gold: '#FFD700',
  purple: '#7B1FA2',
};

const TIERS = [
  { name: 'Bronze', min: 0, max: 499, color: '#CD7F32', icon: '🥉' },
  { name: 'Silver', min: 500, max: 999, color: '#C0C0C0', icon: '🥈' },
  { name: 'Gold', min: 1000, max: 2499, color: COLORS.gold, icon: '🥇' },
  { name: 'Platinum', min: 2500, max: 4999, color: '#E5E4E2', icon: '💎' },
  { name: 'Diamond', min: 5000, max: Infinity, color: '#89CFF0', icon: '💠' },
];

const REWARDS = [
  { id: 'r1', title: 'Course gratuite', description: 'Réduction de 10 TND sur votre prochain taxi', cost: 200, icon: '🚕', category: 'TAXI', stock: 50 },
  { id: 'r2', title: 'Livraison offerte', description: 'Frais de livraison gratuits sur votre prochaine commande', cost: 150, icon: '🛵', category: 'DELIVERY', stock: 100 },
  { id: 'r3', title: 'Réduction SOS 50%', description: '50% de réduction sur votre prochaine intervention SOS', cost: 400, icon: '🛻', category: 'SOS', stock: 20 },
  { id: 'r4', title: 'Bon d\'achat 5 TND', description: 'Bon valable sur toutes les épiceries partenaires', cost: 100, icon: '🎁', category: 'GROCERY', stock: 200 },
  { id: 'r5', title: 'EasyPass 7 jours', description: 'Accès premium gratuit pendant 7 jours', cost: 500, icon: '⭐', category: 'PASS', stock: 30 },
  { id: 'r6', title: 'Bon carburant 10 TND', description: 'Valable dans les stations partenaires', cost: 350, icon: '⛽', category: 'FUEL', stock: 15 },
];

function ProgressBar({ pct, color }) {
  return (
    <View style={{ height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' }}>
      <View style={{ width: `${Math.min(pct, 100)}%`, height: '100%', backgroundColor: color, borderRadius: 3 }} />
    </View>
  );
}

function TierBadge({ tier, active }) {
  return (
    <View style={[tb.card, active && { borderColor: tier.color, backgroundColor: tier.color + '11' }]}>
      <Text style={{ fontSize: active ? 22 : 16 }}>{tier.icon}</Text>
      <Text style={[tb.name, { color: active ? tier.color : COLORS.muted }]}>{tier.name}</Text>
      <Text style={tb.pts}>{tier.min}+</Text>
    </View>
  );
}

const tb = StyleSheet.create({
  card: { alignItems: 'center', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, flex: 1 },
  name: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  pts: { color: COLORS.muted, fontSize: 9 },
});

export default function EasyRewardsScreen({ navigation }) {
  const [points, setPoints] = useState(0);
  const [tier, setTier] = useState(TIERS[0]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/loyalty/rewards');
      setPoints(res.data.points || 0);
      const currentTier = TIERS.slice().reverse().find((t) => res.data.points >= t.min) || TIERS[0];
      setTier(currentTier);
      setHistory(res.data.history || []);
    } catch {
      setPoints(680);
      setTier(TIERS[1]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const nextTier = TIERS[TIERS.indexOf(tier) + 1];
  const pctToNext = nextTier ? Math.round(((points - tier.min) / (nextTier.min - tier.min)) * 100) : 100;

  const handleRedeem = (reward) => {
    if (points < reward.cost) {
      Alert.alert('Points insuffisants', `Il vous manque ${reward.cost - points} points pour cette récompense.`);
      return;
    }
    Alert.alert(
      `Échanger ${reward.cost} pts`,
      `Voulez-vous échanger ${reward.cost} EasyPoints contre "${reward.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setRedeeming(reward.id);
            try {
              await api.post('/api/loyalty/redeem', { rewardId: reward.id });
              setPoints((prev) => prev - reward.cost);
              Alert.alert('Récompense obtenue 🎉', `"${reward.title}" a été ajouté à votre compte.`);
            } catch {
              Alert.alert('Erreur', 'Impossible d\'échanger cette récompense.');
            } finally {
              setRedeeming(null);
            }
          },
        },
      ]
    );
  };

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.gold} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>🏆 EasyRewards</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EasyPointsDashboard')}>
          <Text style={s.historyBtn}>Historique</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Points card */}
        <View style={[s.pointsCard, { borderColor: tier.color + '88' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 32 }}>{tier.icon}</Text>
            <View>
              <Text style={[s.tierName, { color: tier.color }]}>{tier.name}</Text>
              <Text style={s.pointsVal}>{points.toLocaleString()} EasyPoints</Text>
            </View>
          </View>
          {nextTier && (
            <View style={{ marginTop: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={s.progressLbl}>Vers {nextTier.name} {nextTier.icon}</Text>
                <Text style={[s.progressLbl, { color: tier.color }]}>{nextTier.min - points} pts restants</Text>
              </View>
              <ProgressBar pct={pctToNext} color={tier.color} />
            </View>
          )}
        </View>

        {/* Tier overview */}
        <Text style={s.sectionTitle}>Niveaux</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 20 }}>
          {TIERS.map((t) => (
            <TierBadge key={t.name} tier={t} active={t.name === tier.name} />
          ))}
        </View>

        {/* Rewards catalogue */}
        <Text style={s.sectionTitle}>Catalogue de récompenses</Text>
        {REWARDS.map((reward) => {
          const canAfford = points >= reward.cost;
          const isRedeeming = redeeming === reward.id;
          return (
            <View key={reward.id} style={[s.rewardCard, !canAfford && { opacity: 0.6 }]}>
              <View style={s.rewardTop}>
                <Text style={{ fontSize: 28 }}>{reward.icon}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.rewardTitle}>{reward.title}</Text>
                  <Text style={s.rewardDesc}>{reward.description}</Text>
                  {reward.stock < 20 && (
                    <Text style={s.stockWarn}>⚠️ Plus que {reward.stock} disponibles</Text>
                  )}
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <Text style={[s.cost, { color: canAfford ? COLORS.gold : COLORS.muted }]}>
                  ⭐ {reward.cost} pts
                </Text>
                <TouchableOpacity
                  style={[s.redeemBtn, { backgroundColor: canAfford ? COLORS.gold : COLORS.border }]}
                  onPress={() => handleRedeem(reward)}
                  disabled={!canAfford || isRedeeming}
                >
                  {isRedeeming
                    ? <ActivityIndicator color={COLORS.bg} size="small" />
                    : <Text style={[s.redeemBtnTxt, { color: canAfford ? COLORS.bg : COLORS.muted }]}>
                        {canAfford ? 'Échanger' : 'Insuffisant'}
                      </Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', flex: 1 },
  historyBtn: { color: COLORS.orange, fontSize: 13, fontWeight: '600' },
  pointsCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1 },
  tierName: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  pointsVal: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginTop: 2 },
  progressLbl: { color: COLORS.muted, fontSize: 11 },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  rewardCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  rewardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  rewardTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  rewardDesc: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  stockWarn: { color: COLORS.accent, fontSize: 11, marginTop: 4 },
  cost: { fontSize: 14, fontWeight: '700' },
  redeemBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  redeemBtnTxt: { fontSize: 13, fontWeight: '700' },
});
