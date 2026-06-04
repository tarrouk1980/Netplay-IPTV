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
  totalBonus: 38.500,
  pendingBonus: 12.000,
  challenges: [
    { id: 'C1', title: '10 livraisons aujourd\'hui', reward: 5.000, current: 7, target: 10, done: false, icon: '🚀' },
    { id: 'C2', title: '5 étoiles × 5 consécutives', reward: 8.000, current: 5, target: 5, done: true, icon: '⭐' },
    { id: 'C3', title: '50 livraisons cette semaine', reward: 20.000, current: 38, target: 50, done: false, icon: '📦' },
    { id: 'C4', title: 'Aucun retard sur 20 livraisons', reward: 10.000, current: 14, target: 20, done: false, icon: '⏱️' },
  ],
  history: [
    { id: 'B1', label: 'Défi 5 étoiles × 5 complété', amount: 8.000, date: 'Aujourd\'hui 11:30' },
    { id: 'B2', label: 'Bonus week-end +20%', amount: 15.500, date: 'Dimanche 20:00' },
    { id: 'B3', label: 'Défi 10 livraisons/jour', amount: 5.000, date: 'Vendredi 19:45' },
    { id: 'B4', label: 'Bonus pluie +10%', amount: 10.000, date: 'Jeudi 16:00' },
  ],
};

export default function LivreurBonusScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/delivery/livreur/bonus')
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
        <Text style={styles.headerTitle}>🎯 Défis & Bonus</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryVal, { color: COLORS.accent }]}>{data.totalBonus.toFixed(3)}</Text>
              <Text style={styles.summaryLabel}>TND bonus total</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryVal, { color: COLORS.green }]}>{data.pendingBonus.toFixed(3)}</Text>
              <Text style={styles.summaryLabel}>TND en attente</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>DÉFIS EN COURS</Text>
          {data.challenges.map(ch => {
            const pct = Math.min((ch.current / ch.target) * 100, 100);
            return (
              <View key={ch.id} style={[styles.challengeCard, ch.done && { borderColor: COLORS.green + '50' }]}>
                <View style={styles.challengeTop}>
                  <Text style={{ fontSize: 28 }}>{ch.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.challengeTitle}>{ch.title}</Text>
                    <Text style={styles.challengeProgress}>{ch.current} / {ch.target}</Text>
                  </View>
                  <View style={[styles.rewardBadge, ch.done && { backgroundColor: COLORS.green + '20', borderColor: COLORS.green + '50' }]}>
                    <Text style={[styles.rewardVal, ch.done && { color: COLORS.green }]}>+{ch.reward.toFixed(3)}</Text>
                    <Text style={[styles.rewardCur, ch.done && { color: COLORS.green }]}>TND</Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, {
                    width: `${pct}%`,
                    backgroundColor: ch.done ? COLORS.green : COLORS.accent,
                  }]} />
                </View>
                {ch.done && (
                  <Text style={styles.doneLabel}>✅ Défi complété — bonus en cours de versement</Text>
                )}
              </View>
            );
          })}

          <Text style={styles.sectionTitle}>HISTORIQUE DES BONUS</Text>
          {data.history.map(b => (
            <View key={b.id} style={styles.historyRow}>
              <View style={styles.historyIcon}>
                <Text style={{ fontSize: 18 }}>🎁</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyLabel}>{b.label}</Text>
                <Text style={styles.historyDate}>{b.date}</Text>
              </View>
              <Text style={styles.historyAmount}>+{b.amount.toFixed(3)} TND</Text>
            </View>
          ))}

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 MAXIMISER VOS BONUS</Text>
            <Text style={styles.tipText}>• Travaillez le week-end : bonus +20% automatique</Text>
            <Text style={styles.tipText}>• Par mauvais temps : bonus météo jusqu'à +30%</Text>
            <Text style={styles.tipText}>• Maintenez 5 étoiles pour les défis de rating</Text>
          </View>
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
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  summaryCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  summaryVal: { fontSize: 22, fontWeight: '900' },
  summaryLabel: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  challengeCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  challengeTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  challengeTitle: { color: COLORS.text, fontSize: 13, fontWeight: '800', marginBottom: 3 },
  challengeProgress: { color: COLORS.muted, fontSize: 11 },
  rewardBadge: { backgroundColor: COLORS.accent + '20', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', borderWidth: 1, borderColor: COLORS.accent + '50' },
  rewardVal: { color: COLORS.accent, fontSize: 14, fontWeight: '900' },
  rewardCur: { color: COLORS.accent, fontSize: 9 },
  progressBar: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  doneLabel: { color: COLORS.green, fontSize: 11, marginTop: 8, fontWeight: '600' },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  historyIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  historyLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  historyDate: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  historyAmount: { color: COLORS.green, fontSize: 14, fontWeight: '900' },
  tipCard: { backgroundColor: COLORS.accent + '10', borderRadius: 14, padding: 14, marginTop: 16, borderWidth: 1, borderColor: COLORS.accent + '30' },
  tipTitle: { color: COLORS.accent, fontSize: 11, fontWeight: '700', marginBottom: 8 },
  tipText: { color: COLORS.muted, fontSize: 12, lineHeight: 20 },
});
