import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api';

const TIERS = [
  { name: 'Bronze', min: 0, max: 499, color: '#b45309', bg: '#fef3c7' },
  { name: 'Argent', min: 500, max: 1999, color: '#64748b', bg: '#f1f5f9' },
  { name: 'Or', min: 2000, max: 4999, color: '#d97706', bg: '#fffbeb' },
  { name: 'Platine', min: 5000, max: Infinity, color: '#7c3aed', bg: '#f5f3ff' },
];

function getTier(pts: number) {
  return TIERS.find(t => pts >= t.min && pts <= t.max) || TIERS[0];
}

export default function LoyaltyScreen() {
  const [loyalty, setLoyalty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.get('/loyalty/balance')
      .then(r => setLoyalty(r.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const redeem = async () => {
    if (!loyalty || loyalty.points < 100) return;
    Alert.alert('Échanger des points', 'Échanger 100 points contre 1 TND de réduction ?', [
      { text: 'Annuler' },
      { text: 'Confirmer', onPress: async () => {
        setRedeeming(true);
        try {
          const res = await api.post('/loyalty/redeem', { points: 100 });
          Alert.alert('✓ Échangé !', `100 points = ${res.data?.data?.discountTND} TND de réduction sur votre prochaine commande.`);
          api.get('/loyalty/balance').then(r => setLoyalty(r.data?.data)).catch(() => {});
        } catch (e: any) {
          Alert.alert('Erreur', e.response?.data?.message || 'Erreur lors de l\'échange.');
        } finally {
          setRedeeming(false);
        }
      }},
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#9f1239" />;

  const pts = loyalty?.points ?? 0;
  const tier = getTier(pts);
  const nextTier = TIERS.find(t => t.min > pts);
  const toNext = nextTier ? nextTier.min - pts : 0;
  const tierProgress = nextTier
    ? Math.min(100, ((pts - tier.min) / (nextTier.min - tier.min)) * 100)
    : 100;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Hero */}
      <View style={[s.hero, { backgroundColor: tier.color }]}>
        <Text style={s.heroIcon}>⭐</Text>
        <Text style={s.heroPoints}>{pts}</Text>
        <Text style={s.heroLabel}>points fidélité</Text>
        <View style={s.tierBadge}>
          <Text style={[s.tierText, { color: tier.color }]}>{tier.name}</Text>
        </View>
      </View>

      {/* Tier progress */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Votre niveau</Text>
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: `${tierProgress}%` as any, backgroundColor: tier.color }]} />
        </View>
        {nextTier ? (
          <Text style={s.progressLabel}>Encore {toNext} pts pour atteindre {nextTier.name}</Text>
        ) : (
          <Text style={[s.progressLabel, { color: '#7c3aed' }]}>Niveau maximum atteint !</Text>
        )}

        <View style={s.tiersRow}>
          {TIERS.map(t => (
            <View key={t.name} style={[s.tierChip, { backgroundColor: t.bg, borderColor: t.color + '44' }]}>
              <Text style={[s.tierChipText, { color: t.color }]}>{t.name}</Text>
              <Text style={[s.tierChipMin, { color: t.color }]}>{t.min}+</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Value */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Valeur de vos points</Text>
        <View style={s.valueRow}>
          <View style={s.valueItem}>
            <Text style={s.valueNum}>{pts}</Text>
            <Text style={s.valueSub}>Points</Text>
          </View>
          <Text style={{ fontSize: 24, color: '#94a3b8' }}>=</Text>
          <View style={s.valueItem}>
            <Text style={s.valueNum}>{loyalty?.equivalentTND ?? (pts * 0.01).toFixed(2)}</Text>
            <Text style={s.valueSub}>TND</Text>
          </View>
        </View>
        <Text style={s.rule}>1 TND dépensé = 10 points · 100 points = 1 TND</Text>
      </View>

      {/* Redeem */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Échanger des points</Text>
        {pts >= 100 ? (
          <>
            <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>
              Vous pouvez échanger {Math.floor(pts / 100) * 100} points ({(Math.floor(pts / 100)).toFixed(0)} TND) en réductions.
            </Text>
            <TouchableOpacity style={s.redeemBtn} onPress={redeem} disabled={redeeming}>
              <Text style={s.redeemText}>{redeeming ? 'En cours...' : 'Échanger 100 points → 1 TND'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={s.redeemLocked}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🔒</Text>
            <Text style={{ color: '#64748b', fontSize: 13, textAlign: 'center' }}>
              Il vous faut encore {100 - pts} points pour effectuer votre premier échange.
            </Text>
          </View>
        )}
      </View>

      {/* How to earn */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Comment gagner des points</Text>
        {[
          { icon: '🛒', label: 'Chaque achat', desc: '10 pts par TND dépensé' },
          { icon: '🤝', label: 'Parrainage', desc: '200 pts par ami parrainé' },
          { icon: '⭐', label: 'Avis produit', desc: 'Bientôt disponible' },
        ].map(item => (
          <View key={item.label} style={s.earnRow}>
            <Text style={{ fontSize: 22 }}>{item.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.earnLabel}>{item.label}</Text>
              <Text style={s.earnDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  hero: { alignItems: 'center', paddingVertical: 36, paddingTop: 48 },
  heroIcon: { fontSize: 48 },
  heroPoints: { fontSize: 56, fontWeight: '900', color: '#fff', marginTop: 8 },
  heroLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  tierBadge: { marginTop: 12, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999 },
  tierText: { fontWeight: '900', fontSize: 14 },
  card: { backgroundColor: '#fff', margin: 16, marginBottom: 0, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#f1f5f9' },
  cardTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a', marginBottom: 14 },
  progressBg: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  progressLabel: { fontSize: 12, color: '#64748b', marginTop: 6 },
  tiersRow: { flexDirection: 'row', gap: 8, marginTop: 16, flexWrap: 'wrap' },
  tierChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  tierChipText: { fontSize: 12, fontWeight: '800' },
  tierChipMin: { fontSize: 10, fontWeight: '600' },
  valueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 12 },
  valueItem: { alignItems: 'center' },
  valueNum: { fontSize: 32, fontWeight: '900', color: '#9f1239' },
  valueSub: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  rule: { fontSize: 11, color: '#94a3b8', textAlign: 'center' },
  redeemBtn: { backgroundColor: '#f59e0b', borderRadius: 14, padding: 14, alignItems: 'center' },
  redeemText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  redeemLocked: { alignItems: 'center', paddingVertical: 12 },
  earnRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  earnLabel: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  earnDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
});
