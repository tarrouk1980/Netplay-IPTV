import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', purple: '#9B59B6',
};

const TIERS = [
  { key: 'BRONZE', label: 'Bronze', icon: '🥉', min: 0, max: 499, color: '#CD7F32', perks: ['5% de réduction taxi', 'Priorité support'] },
  { key: 'SILVER', label: 'Argent', icon: '🥈', min: 500, max: 1999, color: '#C0C0C0', perks: ['10% de réduction taxi', '5% livraison', 'Accès anticipé promos'] },
  { key: 'GOLD', label: 'Or', icon: '🥇', min: 2000, max: 4999, color: '#FFD700', perks: ['15% taxi & livraison', '10% épicerie', 'Support prioritaire 24h'] },
  { key: 'PLATINUM', label: 'Platine', icon: '💎', min: 5000, max: null, color: '#E5E4E2', perks: ['20% sur tous les services', 'Chauffeur dédié', 'Conciergerie EasyWay'] },
];

const HISTORY = [
  { id: 'H1', action: '🚕 Course taxi', points: +25, date: '03 juin' },
  { id: 'H2', action: '🛵 Livraison', points: +10, date: '02 juin' },
  { id: 'H3', action: '🎁 Bonus parrainage', points: +100, date: '01 juin' },
  { id: 'H4', action: '🏷️ Code promo utilisé', points: -50, date: '30 mai' },
  { id: 'H5', action: '🚕 Course taxi', points: +20, date: '29 mai' },
];

const USER_POINTS = 1240;
const USER_TIER = 'SILVER';

export default function ClientLoyaltyScreen({ navigation }) {
  const [points] = useState(USER_POINTS);
  const tier = TIERS.find(t => t.key === USER_TIER);
  const nextTier = TIERS[TIERS.findIndex(t => t.key === USER_TIER) + 1];
  const progress = nextTier
    ? ((points - tier.min) / (nextTier.min - tier.min)) * 100
    : 100;

  const handleRedeem = () => {
    Alert.alert(
      'Convertir les points',
      `Convertir 500 points en 5 TND de crédit ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => Alert.alert('✅ Crédit ajouté', '5 TND ont été ajoutés à votre portefeuille.') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⭐ Programme fidélité</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status card */}
        <View style={[styles.statusCard, { borderColor: tier.color + '50' }]}>
          <Text style={{ fontSize: 48 }}>{tier.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.tierName, { color: tier.color }]}>{tier.label}</Text>
            <Text style={styles.pointsVal}>{points.toLocaleString()} pts</Text>
            {nextTier && (
              <>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: tier.color }]} />
                </View>
                <Text style={styles.progressNote}>
                  {(nextTier.min - points).toLocaleString()} pts pour {nextTier.icon} {nextTier.label}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Redeem */}
        <TouchableOpacity style={styles.redeemBtn} onPress={handleRedeem}>
          <Text style={styles.redeemBtnText}>🔄 Convertir 500 pts → 5 TND</Text>
        </TouchableOpacity>

        {/* Avantages */}
        <Text style={styles.sectionTitle}>VOS AVANTAGES ACTUELS</Text>
        <View style={styles.perksCard}>
          {tier.perks.map((p, i) => (
            <View key={i} style={styles.perkRow}>
              <Text style={[styles.perkDot, { color: tier.color }]}>●</Text>
              <Text style={styles.perkText}>{p}</Text>
            </View>
          ))}
        </View>

        {/* All tiers */}
        <Text style={styles.sectionTitle}>TOUS LES NIVEAUX</Text>
        {TIERS.map(t => {
          const isCurrent = t.key === USER_TIER;
          return (
            <View key={t.key} style={[styles.tierRow, isCurrent && { borderColor: t.color + '60' }]}>
              <Text style={{ fontSize: 22 }}>{t.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tierRowName, { color: isCurrent ? t.color : COLORS.text }]}>
                  {t.label} {isCurrent && '← vous êtes ici'}
                </Text>
                <Text style={styles.tierRange}>
                  {t.max ? `${t.min.toLocaleString()} – ${t.max.toLocaleString()} pts` : `${t.min.toLocaleString()}+ pts`}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Points history */}
        <Text style={styles.sectionTitle}>HISTORIQUE</Text>
        {HISTORY.map(h => (
          <View key={h.id} style={styles.histRow}>
            <Text style={styles.histAction}>{h.action}</Text>
            <Text style={styles.histDate}>{h.date}</Text>
            <Text style={[styles.histPts, { color: h.points > 0 ? COLORS.green : COLORS.red }]}>
              {h.points > 0 ? '+' : ''}{h.points} pts
            </Text>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4, width: 36 },
  backIcon: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: COLORS.surface, borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1 },
  tierName: { fontSize: 18, fontWeight: '900', marginBottom: 2 },
  pointsVal: { color: COLORS.text, fontSize: 28, fontWeight: '900' },
  progressBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  progressNote: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  redeemBtn: { backgroundColor: COLORS.accent + '20', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: COLORS.accent + '40' },
  redeemBtnText: { color: COLORS.accent, fontSize: 14, fontWeight: '800' },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  perksCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  perkDot: { fontSize: 10 },
  perkText: { color: COLORS.text, fontSize: 13 },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  tierRowName: { fontSize: 14, fontWeight: '700' },
  tierRange: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  histRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  histAction: { color: COLORS.text, fontSize: 13, flex: 1 },
  histDate: { color: COLORS.muted, fontSize: 11, marginRight: 10 },
  histPts: { fontSize: 13, fontWeight: '700', minWidth: 60, textAlign: 'right' },
});
