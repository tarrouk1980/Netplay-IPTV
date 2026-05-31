import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  accent: '#FFD700',
  red: '#D32F2F',
};

const LEVELS = [
  { name: 'Bronze', color: '#CD7F32', min: 0, max: 999 },
  { name: 'Argent', color: '#C0C0C0', min: 1000, max: 4999 },
  { name: 'Or', color: '#FFD700', min: 5000, max: 9999 },
  { name: 'Platine', color: '#E5E4E2', min: 10000, max: Infinity },
];

const HOW_TO_EARN = [
  { icon: '🚕', label: 'Taxi', desc: '10 pts par course', points: 10 },
  { icon: '🛵', label: 'Livraison', desc: '8 pts par commande', points: 8 },
  { icon: '🛒', label: 'Courses', desc: '5 pts par commande', points: 5 },
  { icon: '🚑', label: 'SOS', desc: '15 pts par intervention', points: 15 },
  { icon: '👥', label: 'Parrainage', desc: '100 pts par ami inscrit', points: 100 },
  { icon: '⭐', label: 'Avis', desc: '5 pts par avis laissé', points: 5 },
];

const DEFAULT_REWARDS = [
  { id: 'r1', icon: '🎁', label: '-10% sur prochaine course taxi', points: 500 },
  { id: 'r2', icon: '🎁', label: 'Livraison gratuite', points: 300 },
  { id: 'r3', icon: '🎁', label: '-50% SOS', points: 800 },
  { id: 'r4', icon: '🎁', label: 'Course offerte', points: 2000 },
];

function getLevelInfo(points) {
  return LEVELS.find((l) => points >= l.min && points <= l.max) || LEVELS[0];
}

function getProgressPercent(points, level) {
  const range = level.max === Infinity ? 1 : level.max - level.min;
  const pos = points - level.min;
  return Math.min(1, Math.max(0, pos / range));
}

export default function EasyPointsScreen({ navigation }) {
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [rewards, setRewards] = useState(DEFAULT_REWARDS);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);

  // Animated counter
  const animatedPoints = useRef(new Animated.Value(0)).current;
  const [displayPoints, setDisplayPoints] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [balRes, histRes] = await Promise.all([
        api.get('/api/loyalty/balance').catch(() => ({ data: { points: 0, level: 'Bronze', levelColor: '#CD7F32', nextLevel: 'Argent', pointsToNext: 1000, rewards: [] } })),
        api.get('/api/loyalty/history').catch(() => ({ data: [] })),
      ]);
      const data = balRes.data;
      setBalance(data);
      if (data.rewards) setRewards(data.rewards);
      setHistory(histRes.data || []);

      // Animate counter
      animatedPoints.setValue(0);
      Animated.timing(animatedPoints, {
        toValue: data.points,
        duration: 1200,
        useNativeDriver: false,
      }).start();
      animatedPoints.addListener(({ value }) => setDisplayPoints(Math.floor(value)));
    } catch {
      // fallback demo
      setBalance({ points: 1250, level: 'Argent', levelColor: '#C0C0C0', nextLevel: 'Or', pointsToNext: 3750 });
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = (reward) => {
    Alert.alert(
      'Échanger vos points',
      `Utiliser ${reward.points} pts pour : ${reward.label} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setRedeeming(reward.id);
            try {
              await api.post('/api/loyalty/redeem', { rewardId: reward.id });
              Alert.alert('Succès', `Récompense obtenue : ${reward.label}`);
              fetchData();
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.error || 'Échange échoué');
            } finally {
              setRedeeming(null);
            }
          },
        },
      ]
    );
  };

  const currentLevel = balance ? getLevelInfo(balance.points) : LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1];
  const progress = balance ? getProgressPercent(balance.points, currentLevel) : 0;

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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>EasyPoints</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Votre solde</Text>
          <Text style={styles.balancePoints}>{displayPoints.toLocaleString('fr-TN')} pts</Text>

          {/* Level badge */}
          <View style={[styles.levelBadge, { backgroundColor: currentLevel.color + '22', borderColor: currentLevel.color }]}>
            <Text style={[styles.levelBadgeText, { color: currentLevel.color }]}>
              {currentLevel.name}
            </Text>
          </View>

          {/* Progress bar */}
          {nextLevel && (
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: currentLevel.color }]} />
              </View>
              <Text style={styles.progressLabel}>
                {(balance?.pointsToNext || 0).toLocaleString('fr-TN')} pts pour atteindre {nextLevel.name}
              </Text>
            </View>
          )}
          {!nextLevel && (
            <Text style={[styles.progressLabel, { color: currentLevel.color, marginTop: 8 }]}>
              Niveau maximum atteint !
            </Text>
          )}
        </View>

        {/* How to earn */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment gagner des points</Text>
          {HOW_TO_EARN.map((item) => (
            <View key={item.label} style={styles.earnRow}>
              <Text style={styles.earnIcon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.earnLabel}>{item.label}</Text>
                <Text style={styles.earnDesc}>{item.desc}</Text>
              </View>
              <View style={styles.earnPts}>
                <Text style={styles.earnPtsText}>+{item.points}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Rewards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Récompenses disponibles</Text>
          {rewards.map((reward) => {
            const canAfford = (balance?.points || 0) >= reward.points;
            return (
              <View key={reward.id} style={styles.rewardRow}>
                <Text style={styles.rewardIcon}>{reward.icon || '🎁'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rewardLabel}>{reward.label}</Text>
                  <Text style={[styles.rewardPts, { color: COLORS.accent }]}>{reward.points} pts</Text>
                </View>
                <TouchableOpacity
                  style={[styles.redeemBtn, !canAfford && styles.redeemBtnDisabled]}
                  onPress={() => canAfford && handleRedeem(reward)}
                  disabled={!canAfford || redeeming === reward.id}
                >
                  {redeeming === reward.id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.redeemBtnText}>Échanger</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique</Text>
          {history.length === 0 && (
            <Text style={styles.emptyText}>Aucune transaction pour l'instant</Text>
          )}
          {history.map((tx, i) => (
            <View key={tx.id || i} style={styles.txRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.txDesc}>{tx.description}</Text>
                <Text style={styles.txDate}>
                  {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('fr-TN') : ''}
                </Text>
              </View>
              <Text style={[styles.txPts, { color: tx.points >= 0 ? COLORS.accent : COLORS.red }]}>
                {tx.points >= 0 ? '+' : ''}{tx.points} pts
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  backBtn: { width: 36, alignItems: 'center' },
  backText: { color: COLORS.text, fontSize: 28 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },

  balanceCard: {
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent + '44',
  },
  balanceLabel: { color: COLORS.textMuted, fontSize: 13, marginBottom: 6 },
  balancePoints: { color: COLORS.accent, fontSize: 48, fontWeight: '800', letterSpacing: 1 },
  levelBadge: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  levelBadgeText: { fontWeight: '700', fontSize: 14 },
  progressSection: { width: '100%', marginTop: 16 },
  progressBar: {
    height: 8,
    backgroundColor: '#2C2C3A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressLabel: { color: COLORS.textMuted, fontSize: 12, marginTop: 6, textAlign: 'center' },

  section: {
    backgroundColor: COLORS.surface,
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 16 },

  earnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  earnIcon: { fontSize: 22 },
  earnLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  earnDesc: { color: COLORS.textMuted, fontSize: 12 },
  earnPts: {
    backgroundColor: COLORS.accent + '22',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  earnPtsText: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },

  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  rewardIcon: { fontSize: 22 },
  rewardLabel: { color: COLORS.text, fontSize: 14 },
  rewardPts: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  redeemBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  redeemBtnDisabled: { backgroundColor: '#333', opacity: 0.5 },
  redeemBtnText: { color: '#000', fontWeight: '700', fontSize: 12 },

  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  txDesc: { color: COLORS.text, fontSize: 13 },
  txDate: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  txPts: { fontWeight: '700', fontSize: 14 },
  emptyText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 12 },
});
