import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', danger: '#E74C3C', blue: '#1565C0',
};

const DAYS = [
  { key: 'MON', label: 'Lundi', short: 'Lun' },
  { key: 'TUE', label: 'Mardi', short: 'Mar' },
  { key: 'WED', label: 'Mercredi', short: 'Mer' },
  { key: 'THU', label: 'Jeudi', short: 'Jeu' },
  { key: 'FRI', label: 'Vendredi', short: 'Ven' },
  { key: 'SAT', label: 'Samedi', short: 'Sam' },
  { key: 'SUN', label: 'Dimanche', short: 'Dim' },
];

const TIME_SLOTS = [
  { key: 'EARLY', label: 'Tôt le matin', range: '05:00 – 09:00', emoji: '🌅' },
  { key: 'MORNING', label: 'Matinée', range: '09:00 – 12:00', emoji: '☀️' },
  { key: 'NOON', label: 'Mi-journée', range: '12:00 – 15:00', emoji: '🌤️' },
  { key: 'AFTERNOON', label: 'Après-midi', range: '15:00 – 19:00', emoji: '🌇' },
  { key: 'EVENING', label: 'Soirée', range: '19:00 – 23:00', emoji: '🌆' },
  { key: 'NIGHT', label: 'Nuit', range: '23:00 – 05:00', emoji: '🌙' },
];

const DEFAULT_SCHEDULE = {
  MON: ['MORNING', 'NOON', 'AFTERNOON'],
  TUE: ['MORNING', 'NOON', 'AFTERNOON'],
  WED: ['MORNING', 'NOON', 'AFTERNOON'],
  THU: ['MORNING', 'NOON', 'AFTERNOON'],
  FRI: ['MORNING', 'NOON', 'AFTERNOON', 'EVENING'],
  SAT: ['AFTERNOON', 'EVENING', 'NIGHT'],
  SUN: [],
};

const PRESET_TEMPLATES = [
  { key: 'FULL_TIME', label: '⏰ Temps plein', desc: 'Lun–Sam, 09h–19h', fn: () => Object.fromEntries(DAYS.slice(0,6).map(d => [d.key, ['MORNING','NOON','AFTERNOON']])).concat([['SUN',[]]]) },
  { key: 'EVENINGS', label: '🌆 Soirées & week-end', desc: 'Lun–Dim soirs + Sam/Dim journée', fn: () => Object.fromEntries(DAYS.map(d => [d.key, ['EVENING'].concat(['SAT','SUN'].includes(d.key) ? ['MORNING','NOON','AFTERNOON'] : [])])) },
  { key: 'NIGHT_OWL', label: '🌙 Noctambule', desc: 'Nuits du jeu au lun', fn: () => ({ MON:[], TUE:[], WED:[], THU:['NIGHT'], FRI:['NIGHT'], SAT:['NIGHT'], SUN:['NIGHT'] }) },
  { key: 'WEEKEND', label: '🏖️ Week-end uniquement', desc: 'Sam & Dim toute la journée', fn: () => ({ MON:[], TUE:[], WED:[], THU:[], FRI:[], SAT:TIME_SLOTS.map(s=>s.key), SUN:TIME_SLOTS.map(s=>s.key) }) },
];

function DayCard({ day, slots, onToggleSlot, onToggleDay }) {
  const active = slots.length > 0;
  const totalHours = slots.reduce((acc, k) => {
    const slot = TIME_SLOTS.find(s => s.key === k);
    if (!slot) return acc;
    const [sh, sm] = slot.range.split(' – ')[0].split(':').map(Number);
    const [eh, em] = slot.range.split(' – ')[1].split(':').map(Number);
    const diff = ((eh * 60 + em) - (sh * 60 + sm) + 1440) % 1440 / 60;
    return acc + diff;
  }, 0);

  return (
    <View style={[styles.dayCard, !active && styles.dayCardInactive]}>
      <View style={styles.dayHeader}>
        <View style={styles.dayTitleRow}>
          <Text style={[styles.dayName, !active && { color: COLORS.muted }]}>{day.label}</Text>
          {active && <Text style={styles.dayHours}>{totalHours}h</Text>}
        </View>
        <Switch
          value={active}
          onValueChange={(v) => onToggleDay(day.key, v)}
          trackColor={{ false: COLORS.border, true: COLORS.accent }}
          thumbColor={COLORS.white}
        />
      </View>

      {active && (
        <View style={styles.slotsGrid}>
          {TIME_SLOTS.map(slot => {
            const on = slots.includes(slot.key);
            return (
              <TouchableOpacity
                key={slot.key}
                style={[styles.slotChip, on && styles.slotChipOn]}
                onPress={() => onToggleSlot(day.key, slot.key)}
              >
                <Text style={styles.slotEmoji}>{slot.emoji}</Text>
                <View>
                  <Text style={[styles.slotLabel, on && styles.slotLabelOn]}>{slot.label}</Text>
                  <Text style={styles.slotRange}>{slot.range}</Text>
                </View>
                {on && <Text style={styles.slotCheck}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function AvailabilityScheduleScreen({ navigation }) {
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [onlineNow, setOnlineNow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/provider/availability');
      if (res.data?.schedule) setSchedule(res.data.schedule);
      setOnlineNow(res.data?.onlineNow || false);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleSlot = (dayKey, slotKey) => {
    setSchedule(s => {
      const slots = s[dayKey] || [];
      const updated = slots.includes(slotKey)
        ? slots.filter(k => k !== slotKey)
        : [...slots, slotKey];
      return { ...s, [dayKey]: updated };
    });
  };

  const toggleDay = (dayKey, active) => {
    setSchedule(s => ({
      ...s,
      [dayKey]: active ? ['MORNING', 'NOON', 'AFTERNOON'] : [],
    }));
  };

  const applyTemplate = (template) => {
    const newSched = template.fn();
    const merged = Object.fromEntries(DAYS.map(d => [d.key, newSched[d.key] || []]));
    setSchedule(merged);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/api/provider/availability', { schedule, onlineNow });
      Alert.alert('✅ Sauvegardé', 'Vos disponibilités ont été mises à jour.');
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder.');
    } finally {
      setSaving(false);
    }
  };

  const totalWeeklyHours = DAYS.reduce((total, d) => {
    const slots = schedule[d.key] || [];
    return total + slots.reduce((acc, k) => {
      const slot = TIME_SLOTS.find(s => s.key === k);
      if (!slot) return acc;
      const [sh, sm] = slot.range.split(' – ')[0].split(':').map(Number);
      const [eh, em] = slot.range.split(' – ')[1].split(':').map(Number);
      return acc + ((eh * 60 + em) - (sh * 60 + sm) + 1440) % 1440 / 60;
    }, 0);
  }, 0);

  const activeDays = DAYS.filter(d => (schedule[d.key] || []).length > 0).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}><ActivityIndicator color={COLORS.accent} size="large" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🗓️ Mes disponibilités</Text>
        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.saveBtnText}>Sauv.</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Online toggle */}
        <View style={styles.onlineCard}>
          <View style={styles.onlineLeft}>
            <View style={[styles.onlineDot, { backgroundColor: onlineNow ? COLORS.green : COLORS.muted }]} />
            <View>
              <Text style={styles.onlineTitle}>{onlineNow ? 'En ligne' : 'Hors ligne'}</Text>
              <Text style={styles.onlineSub}>{onlineNow ? 'Vous recevez des demandes' : 'Aucune demande envoyée'}</Text>
            </View>
          </View>
          <Switch
            value={onlineNow}
            onValueChange={setOnlineNow}
            trackColor={{ false: COLORS.border, true: COLORS.green }}
            thumbColor={COLORS.white}
          />
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryNum}>{activeDays}</Text>
            <Text style={styles.summaryLabel}>jours actifs</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryNum}>{Math.round(totalWeeklyHours)}</Text>
            <Text style={styles.summaryLabel}>h / semaine</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={[styles.summaryNum, { color: COLORS.accent }]}>
              ~{Math.round(totalWeeklyHours * 10)} TND
            </Text>
            <Text style={styles.summaryLabel}>potentiel / sem.</Text>
          </View>
        </View>

        {/* Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modèles prédéfinis</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.templatesRow}>
              {PRESET_TEMPLATES.map(t => (
                <TouchableOpacity key={t.key} style={styles.templateCard} onPress={() => applyTemplate(t)}>
                  <Text style={styles.templateLabel}>{t.label}</Text>
                  <Text style={styles.templateDesc}>{t.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Day cards */}
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          {DAYS.map(d => (
            <DayCard
              key={d.key}
              day={d}
              slots={schedule[d.key] || []}
              onToggleSlot={toggleSlot}
              onToggleDay={toggleDay}
            />
          ))}
        </View>

        {/* Weekly visual overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vue hebdomadaire</Text>
          <View style={styles.weekGrid}>
            {DAYS.map(d => {
              const slots = schedule[d.key] || [];
              return (
                <View key={d.key} style={styles.weekCol}>
                  <Text style={styles.weekDayLabel}>{d.short}</Text>
                  {TIME_SLOTS.map(s => (
                    <View
                      key={s.key}
                      style={[styles.weekCell, slots.includes(s.key) && styles.weekCellOn]}
                    />
                  ))}
                </View>
              );
            })}
          </View>
          <View style={styles.weekLegend}>
            <View style={styles.weekCellOn} /><Text style={styles.legendText}> Disponible</Text>
            <View style={[styles.weekCell, { marginLeft: 16 }]} /><Text style={styles.legendText}> Indisponible</Text>
          </View>
        </View>
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
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  saveBtn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  saveBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  onlineCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, margin: 16, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  onlineLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  onlineDot: { width: 12, height: 12, borderRadius: 6 },
  onlineTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  onlineSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  summaryChip: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  summaryNum: { color: COLORS.white, fontSize: 20, fontWeight: '800' },
  summaryLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2, textAlign: 'center' },
  section: {
    backgroundColor: COLORS.surface, margin: 16, marginTop: 8, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  templatesRow: { flexDirection: 'row', gap: 8 },
  templateCard: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: COLORS.border, minWidth: 140,
  },
  templateLabel: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  templateDesc: { color: COLORS.muted, fontSize: 11 },
  dayCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  dayCardInactive: { opacity: 0.6 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  dayTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayName: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  dayHours: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  slotsGrid: { gap: 6 },
  slotChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  slotChipOn: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  slotEmoji: { fontSize: 18, width: 24 },
  slotLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  slotLabelOn: { color: COLORS.accent },
  slotRange: { color: COLORS.muted, fontSize: 11, marginTop: 1 },
  slotCheck: { color: COLORS.accent, fontSize: 14, fontWeight: '700', marginLeft: 'auto' },
  weekGrid: { flexDirection: 'row', gap: 4 },
  weekCol: { flex: 1, alignItems: 'center', gap: 3 },
  weekDayLabel: { color: COLORS.muted, fontSize: 9, marginBottom: 4 },
  weekCell: { width: '100%', height: 10, backgroundColor: COLORS.border, borderRadius: 2 },
  weekCellOn: { width: '100%', height: 10, backgroundColor: COLORS.accent, borderRadius: 2 },
  weekLegend: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  legendText: { color: COLORS.muted, fontSize: 11 },
});
