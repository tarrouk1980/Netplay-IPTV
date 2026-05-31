import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  green: '#27AE60',
  accent: '#F5A623',
  error: '#E74C3C',
};

const DAYS = [
  { key: 'MON', label: 'Lundi' },
  { key: 'TUE', label: 'Mardi' },
  { key: 'WED', label: 'Mercredi' },
  { key: 'THU', label: 'Jeudi' },
  { key: 'FRI', label: 'Vendredi' },
  { key: 'SAT', label: 'Samedi' },
  { key: 'SUN', label: 'Dimanche' },
];

const HOUR_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, '0');
  return { value: i, label: `${h}:00` };
});

const DEFAULT_SCHEDULE = Object.fromEntries(
  DAYS.map(d => [d.key, { enabled: ['MON','TUE','WED','THU','FRI'].includes(d.key), start: 7, end: 22 }])
);

function DayRow({ day, slot, onChange }) {
  return (
    <View style={[styles.dayCard, !slot.enabled && { opacity: 0.5 }]}>
      <View style={styles.dayLeft}>
        <Text style={styles.dayLabel}>{day.label}</Text>
        {slot.enabled && (
          <Text style={styles.dayTime}>{String(slot.start).padStart(2,'0')}:00 – {String(slot.end).padStart(2,'0')}:00</Text>
        )}
      </View>
      <Switch
        value={slot.enabled}
        onValueChange={v => onChange({ ...slot, enabled: v })}
        trackColor={{ false: COLORS.border, true: COLORS.green + '80' }}
        thumbColor={slot.enabled ? COLORS.green : COLORS.muted}
      />
    </View>
  );
}

function HourPicker({ value, onChange, min = 0, max = 23, label }) {
  return (
    <View style={styles.pickerBox}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerScroll}>
        {HOUR_SLOTS.filter(h => h.value >= min && h.value <= max).map(h => (
          <TouchableOpacity
            key={h.value}
            style={[styles.hourBtn, value === h.value && styles.hourBtnActive]}
            onPress={() => onChange(h.value)}
          >
            <Text style={[styles.hourBtnText, value === h.value && styles.hourBtnTextActive]}>
              {h.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default function ProviderScheduleScreen({ navigation }) {
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [selectedDay, setSelectedDay] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/provider/schedule')
      .then(r => { if (r.data?.schedule) setSchedule(r.data.schedule); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateDay = (key, slot) => {
    setSchedule(prev => ({ ...prev, [key]: slot }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/api/provider/schedule', { schedule });
      Alert.alert('Horaires sauvegardés ✅', 'Vos disponibilités ont été mises à jour.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de sauvegarder.');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyAll = () => {
    if (!selectedDay) return;
    const src = schedule[selectedDay];
    Alert.alert('Appliquer à tous', `Appliquer les horaires du ${DAYS.find(d => d.key === selectedDay)?.label} à tous les jours actifs ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Appliquer',
        onPress: () => {
          setSchedule(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(k => {
              if (next[k].enabled) next[k] = { ...next[k], start: src.start, end: src.end };
            });
            return next;
          });
        },
      },
    ]);
  };

  const activeCount = Object.values(schedule).filter(s => s.enabled).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes disponibilités</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.green} size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>🗓️</Text>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryTitle}>{activeCount} jour{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}</Text>
              <Text style={styles.summarySub}>Vous recevrez des demandes uniquement pendant vos horaires</Text>
            </View>
          </View>

          {/* Day rows */}
          <Text style={styles.sectionLabel}>JOURS DE TRAVAIL</Text>
          {DAYS.map(day => (
            <TouchableOpacity
              key={day.key}
              activeOpacity={schedule[day.key].enabled ? 0.7 : 1}
              onPress={() => schedule[day.key].enabled && setSelectedDay(day.key === selectedDay ? null : day.key)}
            >
              <DayRow
                day={day}
                slot={schedule[day.key]}
                onChange={slot => updateDay(day.key, slot)}
              />
              {selectedDay === day.key && schedule[day.key].enabled && (
                <View style={styles.timeEditor}>
                  <HourPicker
                    label="Heure de début"
                    value={schedule[day.key].start}
                    onChange={v => updateDay(day.key, { ...schedule[day.key], start: Math.min(v, schedule[day.key].end - 1) })}
                    max={schedule[day.key].end - 1}
                  />
                  <HourPicker
                    label="Heure de fin"
                    value={schedule[day.key].end}
                    onChange={v => updateDay(day.key, { ...schedule[day.key], end: Math.max(v, schedule[day.key].start + 1) })}
                    min={schedule[day.key].start + 1}
                  />
                  <TouchableOpacity style={styles.applyAllBtn} onPress={handleApplyAll}>
                    <Text style={styles.applyAllText}>Appliquer à tous les jours actifs</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}

          <Text style={styles.hintText}>💡 Appuyez sur un jour actif pour modifier ses horaires.</Text>

          {/* Quick presets */}
          <Text style={styles.sectionLabel}>MODÈLES RAPIDES</Text>
          <View style={styles.presetsRow}>
            {[
              { label: 'Semaine', days: ['MON','TUE','WED','THU','FRI'], start: 7, end: 20 },
              { label: 'Week-end', days: ['SAT','SUN'], start: 8, end: 22 },
              { label: 'Tous les jours', days: DAYS.map(d => d.key), start: 6, end: 23 },
            ].map(preset => (
              <TouchableOpacity
                key={preset.label}
                style={styles.presetBtn}
                onPress={() => {
                  const next = { ...schedule };
                  DAYS.forEach(d => {
                    next[d.key] = {
                      enabled: preset.days.includes(d.key),
                      start: preset.days.includes(d.key) ? preset.start : next[d.key].start,
                      end: preset.days.includes(d.key) ? preset.end : next[d.key].end,
                    };
                  });
                  setSchedule(next);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.presetBtnText}>{preset.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>✓ Sauvegarder les disponibilités</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  scroll: { padding: 16 },
  summaryCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  summaryIcon: { fontSize: 32 },
  summaryInfo: { flex: 1 },
  summaryTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  summarySub: { color: COLORS.muted, fontSize: 12, lineHeight: 17 },
  sectionLabel: {
    color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4,
    textTransform: 'uppercase', marginBottom: 10, marginTop: 4,
  },
  dayCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    marginBottom: 4, borderWidth: 1, borderColor: COLORS.border,
  },
  dayLeft: { flex: 1 },
  dayLabel: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  dayTime: { color: COLORS.green, fontSize: 12, marginTop: 2 },
  timeEditor: {
    backgroundColor: COLORS.bg, borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.green + '50',
  },
  pickerBox: { marginBottom: 12 },
  pickerLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  pickerScroll: { gap: 6 },
  hourBtn: {
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  hourBtnActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  hourBtnText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  hourBtnTextActive: { color: '#FFF' },
  applyAllBtn: {
    backgroundColor: COLORS.surface, borderRadius: 10, paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border, marginTop: 4,
  },
  applyAllText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  hintText: { color: COLORS.muted, fontSize: 12, textAlign: 'center', marginBottom: 20, marginTop: 4 },
  presetsRow: { flexDirection: 'row', gap: 10 },
  presetBtn: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, paddingVertical: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  presetBtnText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.bg, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  saveBtn: { backgroundColor: COLORS.green, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});
