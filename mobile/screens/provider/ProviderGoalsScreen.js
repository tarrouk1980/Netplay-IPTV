import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK = {
  level: 'Gold',
  points: 3840,
  nextLevel: 'Platinum',
  pointsNeeded: 5000,
  weeklyGoal: { current: 38, target: 50, reward: 20.000 },
  monthlyGoal: { current: 142, target: 200, reward: 80.000 },
  goals: [
    { id: 'G1', title: 'Note moyenne ≥ 4.8', progress: 4.9, max: 5, unit: '★', done: true, reward: 15.000, icon: '⭐' },
    { id: 'G2', title: 'Taux acceptation ≥ 90%', progress: 94, max: 100, unit: '%', done: true, reward: 10.000, icon: '✅' },
    { id: 'G3', title: '200 courses ce mois', progress: 142, max: 200, unit: '', done: false, reward: 80.000, icon: '🚀' },
    { id: 'G4', title: 'Zéro annulation cette semaine', progress: 6, max: 7, unit: 'j', done: false, reward: 12.000, icon: '🛡️' },
  ],
  levelPerks: {
    Gold: ['Priorité sur les courses', 'Support dédié', 'Bonus météo +15%'],
    Platinum: ['Accès aux zones premium', 'Bonus événements', 'Assurance renforcée'],
  },
};

const LEVEL_COLORS = { Bronze: '#CD7F32', Silver: '#C0C0C0', Gold: '#FFD700', Platinum: '#E5E4E2' };

export default function ProviderGoalsScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/provider/goals')
      .then(r => setData(r.data || MOCK))
      .catch(() => setData(MOCK))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏆 Objectifs & Niveau</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

          <View style={styles.levelCard}>
            <View style={[styles.levelBadge, { borderColor: LEVEL_COLORS[data.level] + '80' }]}>
              <Text style={[styles.levelText, { color: LEVEL_COLORS[data.level] }]}>🏅 {data.level}</Text>
            </View>
            <Text style={styles.pointsVal}>{data.points.toLocaleString()} pts</Text>
            <Text style={styles.levelSub}>Prochain niveau : {data.nextLevel} ({data.pointsNeeded} pts)</Text>
            <View style={styles.levelBar}>
              <View style={[styles.levelFill, {
                width: `${Math.min((data.points / data.pointsNeeded) * 100, 100)}%`,
                backgroundColor: LEVEL_COLORS[data.level],
              }]} />
            </View>
            <View style={styles.perksBox}>
              <Text style={styles.perksTitle}>Avantages {data.level}</Text>
              {(data.levelPerks[data.level] || []).map((p, i) => (
                <Text key={i} style={styles.perkItem}>✓ {p}</Text>
              ))}
            </View>
          </View>

          <Text style={styles.sectionTitle}>OBJECTIFS DE LA SEMAINE</Text>
          <View style={styles.shortGoalCard}>
            <View style={styles.shortGoalTop}>
              <Text style={styles.shortGoalTitle}>🚀 {data.weeklyGoal.current}/{data.weeklyGoal.target} courses</Text>
              <Text style={styles.shortGoalReward}>+{data.weeklyGoal.reward.toFixed(3)} TND</Text>
            </View>
            <View style={styles.goalBar}>
              <View style={[styles.goalFill, { width: `${Math.min((data.weeklyGoal.current / data.weeklyGoal.target) * 100, 100)}%` }]} />
            </View>
          </View>

          <Text style={styles.sectionTitle}>OBJECTIFS DU MOIS</Text>
          <View style={styles.shortGoalCard}>
            <View style={styles.shortGoalTop}>
              <Text style={styles.shortGoalTitle}>📦 {data.monthlyGoal.current}/{data.monthlyGoal.target} courses</Text>
              <Text style={styles.shortGoalReward}>+{data.monthlyGoal.reward.toFixed(3)} TND</Text>
            </View>
            <View style={styles.goalBar}>
              <View style={[styles.goalFill, { width: `${Math.min((data.monthlyGoal.current / data.monthlyGoal.target) * 100, 100)}%`, backgroundColor: COLORS.blue }]} />
            </View>
          </View>

          <Text style={styles.sectionTitle}>DÉFIS PERMANENTS</Text>
          {data.goals.map(g => {
            const pct = Math.min((g.progress / g.max) * 100, 100);
            return (
              <View key={g.id} style={[styles.goalCard, g.done && { borderColor: COLORS.green + '50' }]}>
                <View style={styles.goalTop}>
                  <Text style={{ fontSize: 28 }}>{g.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.goalTitle}>{g.title}</Text>
                    <Text style={styles.goalProgress}>{g.progress}{g.unit} / {g.max}{g.unit}</Text>
                  </View>
                  <View style={[styles.rewardTag, g.done && { backgroundColor: COLORS.green + '20', borderColor: COLORS.green + '50' }]}>
                    <Text style={[styles.rewardTagText, g.done && { color: COLORS.green }]}>+{g.reward.toFixed(3)} TND</Text>
                  </View>
                </View>
                <View style={styles.goalBar}>
                  <View style={[styles.goalFill, { width: `${pct}%`, backgroundColor: g.done ? COLORS.green : COLORS.accent }]} />
                </View>
                {g.done && <Text style={styles.doneLabel}>✅ Objectif atteint</Text>}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  levelCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  levelBadge: { borderRadius: 20, borderWidth: 2, paddingHorizontal: 20, paddingVertical: 8, marginBottom: 12 },
  levelText: { fontSize: 18, fontWeight: '900' },
  pointsVal: { color: COLORS.text, fontSize: 32, fontWeight: '900', marginBottom: 6 },
  levelSub: { color: COLORS.muted, fontSize: 12, marginBottom: 12 },
  levelBar: { width: '100%', height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden', marginBottom: 16 },
  levelFill: { height: 8, borderRadius: 4 },
  perksBox: { width: '100%', backgroundColor: COLORS.bg, borderRadius: 12, padding: 12 },
  perksTitle: { color: COLORS.accent, fontSize: 11, fontWeight: '700', marginBottom: 6 },
  perkItem: { color: COLORS.muted, fontSize: 12, lineHeight: 22 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  shortGoalCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  shortGoalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  shortGoalTitle: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  shortGoalReward: { color: COLORS.green, fontSize: 13, fontWeight: '900' },
  goalCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  goalTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  goalTitle: { color: COLORS.text, fontSize: 13, fontWeight: '800', marginBottom: 3 },
  goalProgress: { color: COLORS.muted, fontSize: 11 },
  rewardTag: { backgroundColor: COLORS.accent + '20', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.accent + '50' },
  rewardTagText: { color: COLORS.accent, fontSize: 11, fontWeight: '900' },
  goalBar: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  goalFill: { height: 8, borderRadius: 4, backgroundColor: COLORS.accent },
  doneLabel: { color: COLORS.green, fontSize: 11, marginTop: 8, fontWeight: '600' },
});
