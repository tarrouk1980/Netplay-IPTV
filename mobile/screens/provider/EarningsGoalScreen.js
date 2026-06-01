import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', danger: '#E74C3C',
  blue: '#1565C0',
};

const PERIODS = [
  { key: 'daily', label: 'Journalier', icon: '☀️' },
  { key: 'weekly', label: 'Hebdomadaire', icon: '📅' },
  { key: 'monthly', label: 'Mensuel', icon: '🗓️' },
];

const PRESET_GOALS = {
  daily: [50, 80, 100, 150, 200],
  weekly: [300, 500, 700, 1000, 1500],
  monthly: [1200, 2000, 3000, 4000, 6000],
};

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function CircularProgress({ percent, size = 140, strokeWidth = 12, color, children }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(percent, 1);
  const gap = circ - dash;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background ring */}
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth, borderColor: COLORS.border,
      }} />
      {/* Progress arc using conic-gradient approximation via rotation */}
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: 'transparent',
        borderTopColor: color,
        borderRightColor: percent > 0.25 ? color : 'transparent',
        borderBottomColor: percent > 0.5 ? color : 'transparent',
        borderLeftColor: percent > 0.75 ? color : 'transparent',
        transform: [{ rotate: '-90deg' }],
      }} />
      {children}
    </View>
  );
}

function StreakCalendar({ streakData }) {
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - i));
    return d;
  });

  return (
    <View>
      <Text style={styles.sectionTitle}>Streak des 14 derniers jours</Text>
      <View style={styles.calGrid}>
        {days.map((d, i) => {
          const key = d.toISOString().slice(0, 10);
          const hit = streakData[key];
          const isToday = i === 13;
          return (
            <View key={key} style={[styles.calCell, hit && styles.calCellHit, isToday && styles.calCellToday]}>
              <Text style={[styles.calDay, hit && styles.calDayHit]}>{DAYS_FR[d.getDay()]}</Text>
              <Text style={[styles.calNum, hit && styles.calNumHit]}>{d.getDate()}</Text>
              {hit && <Text style={styles.calCheck}>✓</Text>}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function EarningsGoalScreen({ navigation }) {
  const [period, setPeriod] = useState('daily');
  const [goals, setGoals] = useState({ daily: 100, weekly: 500, monthly: 2000 });
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [earnings, setEarnings] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [streakData, setStreakData] = useState({});
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/provider/earnings-goal');
      setGoals(res.data.goals || { daily: 100, weekly: 500, monthly: 2000 });
      setEarnings(res.data.earnings || { daily: 0, weekly: 0, monthly: 0 });
      setStreakData(res.data.streakData || {});
      setStreak(res.data.streak || 0);
    } catch {
      // Mock
      const today = new Date().toISOString().slice(0, 10);
      const mock = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        if (Math.random() > 0.3) mock[d.toISOString().slice(0, 10)] = true;
      }
      setEarnings({ daily: 67, weekly: 312, monthly: 1180 });
      setStreakData(mock);
      setStreak(4);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveGoal = async (p, val) => {
    const v = parseFloat(val);
    if (!v || v <= 0) { Alert.alert('Valeur invalide'); return; }
    const updated = { ...goals, [p]: v };
    setGoals(updated);
    setEditing(null);
    try {
      await api.post('/api/provider/earnings-goal', { goals: updated });
    } catch {}
  };

  const cur = earnings[period] || 0;
  const goal = goals[period] || 100;
  const pct = Math.min(cur / goal, 1);
  const pctDisplay = Math.round(pct * 100);
  const remaining = Math.max(goal - cur, 0);
  const exceeded = cur >= goal;

  const progressColor = exceeded ? COLORS.green : pct > 0.7 ? COLORS.accent : COLORS.blue;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎯 Objectifs de revenus</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Period selector */}
        <View style={styles.periodRow}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p.key}
              style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}
              onPress={() => setPeriod(p.key)}
            >
              <Text style={styles.periodIcon}>{p.icon}</Text>
              <Text style={[styles.periodLabel, period === p.key && styles.periodLabelActive]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main progress card */}
        <View style={styles.progressCard}>
          <View style={styles.progressCenter}>
            <CircularProgress percent={pct} color={progressColor}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.pctText, { color: progressColor }]}>{pctDisplay}%</Text>
                {exceeded && <Text style={{ fontSize: 18 }}>🏆</Text>}
              </View>
            </CircularProgress>
          </View>

          <View style={styles.progressInfo}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Réalisé</Text>
              <Text style={[styles.progressValue, { color: progressColor }]}>{cur.toFixed(0)} TND</Text>
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Objectif</Text>
              <Text style={styles.progressValue}>{goal.toFixed(0)} TND</Text>
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>{exceeded ? 'Excédent' : 'Restant'}</Text>
              <Text style={[styles.progressValue, { color: exceeded ? COLORS.green : COLORS.muted }]}>
                {exceeded ? `+${(cur - goal).toFixed(0)}` : remaining.toFixed(0)} TND
              </Text>
            </View>
          </View>

          {exceeded && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>🎉 Objectif atteint ! Continuez comme ça !</Text>
            </View>
          )}
        </View>

        {/* Goal presets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modifier l'objectif {PERIODS.find(p => p.key === period)?.label.toLowerCase()}</Text>
          <View style={styles.presetRow}>
            {PRESET_GOALS[period].map(v => (
              <TouchableOpacity
                key={v}
                style={[styles.preset, goals[period] === v && styles.presetActive]}
                onPress={() => saveGoal(period, v)}
              >
                <Text style={[styles.presetText, goals[period] === v && styles.presetTextActive]}>{v}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.preset, editing === period && styles.presetActive]}
              onPress={() => { setEditing(period); setEditValue(String(goals[period])); }}
            >
              <Text style={[styles.presetText, editing === period && styles.presetTextActive]}>✏️</Text>
            </TouchableOpacity>
          </View>

          {editing === period && (
            <View style={styles.editRow}>
              <TextInput
                style={styles.editInput}
                value={editValue}
                onChangeText={setEditValue}
                keyboardType="decimal-pad"
                placeholder="Entrez un montant"
                placeholderTextColor={COLORS.muted}
                autoFocus
              />
              <TouchableOpacity style={styles.editConfirm} onPress={() => saveGoal(period, editValue)}>
                <Text style={styles.editConfirmText}>OK</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* All periods summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé toutes périodes</Text>
          {PERIODS.map(p => {
            const e = earnings[p.key] || 0;
            const g = goals[p.key] || 1;
            const pc = Math.min(e / g, 1);
            return (
              <View key={p.key} style={styles.allPeriodRow}>
                <Text style={styles.allPeriodIcon}>{p.icon}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.allPeriodTop}>
                    <Text style={styles.allPeriodLabel}>{p.label}</Text>
                    <Text style={styles.allPeriodValues}>{e.toFixed(0)} / {g.toFixed(0)} TND</Text>
                  </View>
                  <View style={styles.miniBar}>
                    <View style={[styles.miniFill, { width: `${pc * 100}%`, backgroundColor: pc >= 1 ? COLORS.green : COLORS.accent }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Streak */}
        <View style={styles.section}>
          <View style={styles.streakHeader}>
            <Text style={styles.sectionTitle}>🔥 Série en cours</Text>
            <View style={styles.streakBadge}>
              <Text style={styles.streakNum}>{streak}</Text>
              <Text style={styles.streakJours}> jours</Text>
            </View>
          </View>
          <StreakCalendar streakData={streakData} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, alignItems: 'center' },
  backText: { color: COLORS.white, fontSize: 28 },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  periodRow: { flexDirection: 'row', padding: 16, gap: 8 },
  periodBtn: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  periodBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  periodIcon: { fontSize: 20, marginBottom: 4 },
  periodLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  periodLabelActive: { color: COLORS.accent },
  progressCard: {
    backgroundColor: COLORS.surface, margin: 16, borderRadius: 20,
    padding: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  progressCenter: { alignItems: 'center', marginBottom: 20 },
  pctText: { fontSize: 26, fontWeight: '800' },
  progressInfo: { gap: 8 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { color: COLORS.muted, fontSize: 14 },
  progressValue: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  successBanner: {
    backgroundColor: COLORS.green + '22', borderRadius: 10, padding: 12,
    marginTop: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.green,
  },
  successText: { color: COLORS.green, fontWeight: '700', fontSize: 14 },
  section: {
    backgroundColor: COLORS.surface, margin: 16, marginTop: 0, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12,
  },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preset: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border,
  },
  presetActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '22' },
  presetText: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
  presetTextActive: { color: COLORS.accent },
  editRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  editInput: {
    flex: 1, backgroundColor: COLORS.surfaceAlt, borderRadius: 10, borderWidth: 1,
    borderColor: COLORS.accent, color: COLORS.white, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
  },
  editConfirm: {
    backgroundColor: COLORS.accent, borderRadius: 10,
    paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center',
  },
  editConfirmText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  allPeriodRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  allPeriodIcon: { fontSize: 22 },
  allPeriodTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  allPeriodLabel: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  allPeriodValues: { color: COLORS.muted, fontSize: 13 },
  miniBar: { height: 6, backgroundColor: COLORS.border, borderRadius: 3 },
  miniFill: { height: 6, borderRadius: 3 },
  streakHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  streakBadge: { flexDirection: 'row', alignItems: 'baseline', backgroundColor: COLORS.danger + '22', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.danger },
  streakNum: { color: COLORS.danger, fontSize: 20, fontWeight: '800' },
  streakJours: { color: COLORS.danger, fontSize: 13 },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  calCell: {
    width: 40, backgroundColor: COLORS.surfaceAlt, borderRadius: 8,
    padding: 6, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  calCellHit: { backgroundColor: COLORS.green + '22', borderColor: COLORS.green },
  calCellToday: { borderColor: COLORS.accent },
  calDay: { color: COLORS.muted, fontSize: 9 },
  calDayHit: { color: COLORS.green },
  calNum: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  calNumHit: { color: COLORS.green },
  calCheck: { fontSize: 9, color: COLORS.green, marginTop: 2 },
});
