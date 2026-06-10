import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const USER_POINTS = 2450;
const USER_NAME = 'Ahmed Ben Salem';

const LEVELS = [
  { icon: '🥉', name: 'Bronze', min: 0, max: 999, color: '#CD7F32', bg: '#FDF1E6' },
  { icon: '🥈', name: 'Argent', min: 1000, max: 2999, color: '#9E9E9E', bg: '#F5F5F5' },
  { icon: '🥇', name: 'Or', min: 3000, max: 6999, color: '#F5A623', bg: '#FFFBEB' },
  { icon: '💎', name: 'Diamant', min: 7000, max: Infinity, color: '#6366F1', bg: '#EEF2FF' },
];

function getCurrentLevel() {
  return LEVELS.find(l => USER_POINTS >= l.min && USER_POINTS <= l.max) || LEVELS[0];
}

function getNextLevel() {
  const idx = LEVELS.findIndex(l => USER_POINTS >= l.min && USER_POINTS <= l.max);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

const EARN_WAYS = [
  { icon: '👆', action: 'Cliquer sur une offre', points: '+10 pts' },
  { icon: '📝', action: 'Écrire un avis', points: '+50 pts' },
  { icon: '👥', action: 'Parrainer un ami', points: '+200 pts' },
  { icon: '🔔', action: 'Activer les alertes prix', points: '+20 pts' },
  { icon: '🎂', action: 'Anniversaire', points: '+100 pts' },
];

const REDEEM_OPTIONS = [
  { pts: 500, value: '5 TND de réduction', icon: '💵' },
  { pts: 1000, value: 'Offres exclusives 24h avant', icon: '⏰' },
  { pts: 2000, value: 'Surclassement gratuit', icon: '⬆️' },
];

const BENEFITS = [
  { feature: 'Offres exclusives', bronze: false, argent: false, or: true, diamant: true },
  { feature: 'Double points', bronze: false, argent: false, or: false, diamant: true },
  { feature: 'Support prioritaire', bronze: false, argent: true, or: true, diamant: true },
  { feature: 'Early access offres flash', bronze: false, argent: false, or: true, diamant: true },
  { feature: 'Surclassement auto', bronze: false, argent: false, or: false, diamant: true },
  { feature: 'Cashback 1%', bronze: false, argent: true, or: true, diamant: true },
];

const MOCK_ACTIVITY = [
  { id: '1', desc: 'Clic sur Djerba Beach Resort', pts: '+10 pts', date: 'Aujourd\'hui', icon: '👆' },
  { id: '2', desc: 'Avis publié — Hammamet Palace', pts: '+50 pts', date: 'Hier', icon: '📝' },
  { id: '3', desc: 'Parrainage validé — Sami Ben Ali', pts: '+200 pts', date: '5 juin', icon: '👥' },
  { id: '4', desc: 'Alerte prix activée', pts: '+20 pts', date: '3 juin', icon: '🔔' },
  { id: '5', desc: 'Bonus anniversaire', pts: '+100 pts', date: '1 juin', icon: '🎂' },
];

function CheckMark({ yes }) {
  if (yes) return <Ionicons name="checkmark-circle" size={18} color="#38A169" />;
  return <Ionicons name="close-circle" size={18} color="#E2E8F0" />;
}

export default function LoyaltyScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const level = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progressPct = nextLevel ? Math.min(100, ((USER_POINTS - level.min) / (nextLevel.min - level.min)) * 100) : 100;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#004E89', '#1a6eac']} style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EasyHotels Rewards 🌟</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Points Card */}
        <View style={styles.cardWrapper}>
          <LinearGradient colors={['#004E89', '#1a6eac', '#FF6B35']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.pointsCard}>
            <View style={styles.cardTopRow}>
              <View>
                <Text style={styles.cardName}>{USER_NAME}</Text>
                <Text style={styles.cardLabel}>Membre EasyHotels Rewards</Text>
              </View>
              <View style={[styles.levelBadge, { backgroundColor: level.bg }]}>
                <Text style={{ fontSize: 18 }}>{level.icon}</Text>
                <Text style={[styles.levelBadgeText, { color: level.color }]}>{level.name}</Text>
              </View>
            </View>

            <Text style={styles.pointsValue}>{USER_POINTS.toLocaleString()} pts</Text>
            <Text style={styles.pointsSubLabel}>Points disponibles</Text>

            {nextLevel && (
              <View style={{ marginTop: 14 }}>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>{USER_POINTS} pts</Text>
                  <Text style={styles.progressLabel}>Prochain niveau : {nextLevel.icon} {nextLevel.name} — {nextLevel.min} pts</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                </View>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Levels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Niveaux de fidélité</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
            {LEVELS.map((l) => (
              <View key={l.name} style={[styles.levelCard, { borderColor: l.color, backgroundColor: l.bg }, USER_POINTS >= l.min && USER_POINTS <= l.max && styles.levelCardActive]}>
                <Text style={{ fontSize: 28 }}>{l.icon}</Text>
                <Text style={[styles.levelCardName, { color: l.color }]}>{l.name}</Text>
                <Text style={styles.levelCardRange}>{l.max === Infinity ? `${l.min}+` : `${l.min}–${l.max}`} pts</Text>
                {USER_POINTS >= l.min && USER_POINTS <= l.max && (
                  <View style={[styles.currentBadge, { backgroundColor: l.color }]}>
                    <Text style={styles.currentBadgeText}>Actuel</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Benefits table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avantages par niveau</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Avantage</Text>
              {LEVELS.map(l => (
                <Text key={l.name} style={[styles.tableCell, styles.tableHeaderText, { color: l.color }]}>{l.icon}</Text>
              ))}
            </View>
            {BENEFITS.map((b, i) => (
              <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowEven]}>
                <Text style={[styles.tableCell, styles.tableCellText, { flex: 2 }]}>{b.feature}</Text>
                <View style={styles.tableCell}><CheckMark yes={b.bronze} /></View>
                <View style={styles.tableCell}><CheckMark yes={b.argent} /></View>
                <View style={styles.tableCell}><CheckMark yes={b.or} /></View>
                <View style={styles.tableCell}><CheckMark yes={b.diamant} /></View>
              </View>
            ))}
          </View>
        </View>

        {/* Earn points */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment gagner des points</Text>
          {EARN_WAYS.map((e, i) => (
            <View key={i} style={styles.earnRow}>
              <Text style={{ fontSize: 24 }}>{e.icon}</Text>
              <Text style={styles.earnAction}>{e.action}</Text>
              <View style={styles.earnBadge}>
                <Text style={styles.earnBadgeText}>{e.points}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Redeem */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Utiliser mes points</Text>
          {REDEEM_OPTIONS.map((r, i) => (
            <View key={i} style={styles.redeemRow}>
              <Text style={{ fontSize: 28 }}>{r.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.redeemValue}>{r.value}</Text>
                <Text style={styles.redeemPts}>{r.pts.toLocaleString()} points requis</Text>
              </View>
              <TouchableOpacity style={[styles.redeemBtn, USER_POINTS < r.pts && styles.redeemBtnDisabled]} disabled={USER_POINTS < r.pts}>
                <Text style={styles.redeemBtnText}>{USER_POINTS >= r.pts ? 'Utiliser' : 'Manque'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Recent activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
          {MOCK_ACTIVITY.map((act) => (
            <View key={act.id} style={styles.actRow}>
              <Text style={{ fontSize: 22 }}>{act.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.actDesc}>{act.desc}</Text>
                <Text style={styles.actDate}>{act.date}</Text>
              </View>
              <Text style={styles.actPts}>{act.pts}</Text>
            </View>
          ))}
        </View>

        {/* Exchange CTA */}
        <TouchableOpacity style={styles.exchangeBtn} activeOpacity={0.85}>
          <LinearGradient colors={['#FF6B35', '#e85520']} style={styles.exchangeGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="gift-outline" size={20} color="#fff" />
            <Text style={styles.exchangeText}>Échanger mes points · {USER_POINTS} pts</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, paddingHorizontal: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  cardWrapper: { margin: 16, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 10 },
  pointsCard: { borderRadius: 20, padding: 20 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  cardName: { color: '#fff', fontSize: 18, fontWeight: '800' },
  cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  levelBadgeText: { fontWeight: '800', fontSize: 13 },
  pointsValue: { color: '#fff', fontSize: 42, fontWeight: '900' },
  pointsSubLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
  progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3 },
  progressFill: { height: '100%', backgroundColor: '#FFD700', borderRadius: 3 },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A202C', paddingHorizontal: 16, marginBottom: 14 },
  levelCard: { width: 110, borderRadius: 16, alignItems: 'center', padding: 14, borderWidth: 2, gap: 4 },
  levelCardActive: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  levelCardName: { fontSize: 14, fontWeight: '800' },
  levelCardRange: { fontSize: 10, color: '#718096' },
  currentBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  currentBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  table: { marginHorizontal: 16, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
  tableHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', paddingVertical: 10 },
  tableHeaderText: { fontWeight: '800', fontSize: 12, color: '#4A5568' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  tableRowEven: { backgroundColor: '#F7FAFC' },
  tableCell: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tableCellText: { fontSize: 12, color: '#4A5568' },
  earnRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 14, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  earnAction: { flex: 1, fontSize: 14, fontWeight: '600', color: '#2D3748' },
  earnBadge: { backgroundColor: '#FFF5F0', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#FDBA74' },
  earnBadgeText: { color: '#FF6B35', fontWeight: '800', fontSize: 13 },
  redeemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  redeemValue: { fontSize: 14, fontWeight: '700', color: '#2D3748' },
  redeemPts: { fontSize: 12, color: '#A0AEC0', marginTop: 2 },
  redeemBtn: { backgroundColor: '#FF6B35', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  redeemBtnDisabled: { backgroundColor: '#E2E8F0' },
  redeemBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  actRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 14, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  actDesc: { fontSize: 13, fontWeight: '600', color: '#2D3748' },
  actDate: { fontSize: 11, color: '#A0AEC0', marginTop: 2 },
  actPts: { fontSize: 14, fontWeight: '800', color: '#38A169' },
  exchangeBtn: { margin: 16, borderRadius: 14, overflow: 'hidden' },
  exchangeGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  exchangeText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
