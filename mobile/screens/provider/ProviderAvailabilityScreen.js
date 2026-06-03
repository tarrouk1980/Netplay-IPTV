import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F', orange: '#E67E22',
};

const DAYS_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const SLOTS_PER_DAY = [
  { key: 'morning',   label: 'Matin',    hours: '06:00–12:00' },
  { key: 'afternoon', label: 'Après-midi', hours: '12:00–18:00' },
  { key: 'evening',   label: 'Soir',     hours: '18:00–24:00' },
];

const DEFAULT_SCHEDULE = Object.fromEntries(
  DAYS_FR.map((_, i) => [i, { enabled: i < 5, slots: { morning: true, afternoon: true, evening: false } }])
);

export default function ProviderAvailabilityScreen({ navigation }) {
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [isOnline, setIsOnline] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/provider/availability');
        if (res.data?.schedule) setSchedule(res.data.schedule);
        if (res.data?.isOnline !== undefined) setIsOnline(res.data.isOnline);
      } catch {}
    })();
  }, []);

  const toggleDay = (dayIdx) => {
    setSchedule(prev => ({
      ...prev,
      [dayIdx]: { ...prev[dayIdx], enabled: !prev[dayIdx].enabled },
    }));
    setSaved(false);
  };

  const toggleSlot = (dayIdx, slot) => {
    setSchedule(prev => ({
      ...prev,
      [dayIdx]: {
        ...prev[dayIdx],
        slots: { ...prev[dayIdx].slots, [slot]: !prev[dayIdx].slots[slot] },
      },
    }));
    setSaved(false);
  };

  const handleToggleOnline = async (val) => {
    setIsOnline(val);
    try { await api.patch('/api/provider/online', { isOnline: val }); } catch {}
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/provider/availability', { schedule });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder. Réessayez.');
    } finally {
      setSaving(false);
    }
  };

  const activeDays = Object.values(schedule).filter(d => d.enabled).length;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📅 Disponibilités</Text>
        <TouchableOpacity style={[styles.saveBtn, saved && { backgroundColor: COLORS.green }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.saveBtnText}>{saved ? '✓' : 'Sauver'}</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Online toggle */}
        <View style={[styles.onlineCard, { borderColor: isOnline ? COLORS.green : COLORS.border }]}>
          <View>
            <Text style={styles.onlineLabel}>Statut en ce moment</Text>
            <Text style={[styles.onlineStatus, { color: isOnline ? COLORS.green : COLORS.red }]}>
              {isOnline ? '🟢 En ligne — visible par les clients' : '🔴 Hors ligne'}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: COLORS.border, true: COLORS.green }}
            thumbColor={isOnline ? COLORS.white : COLORS.muted}
          />
        </View>

        <Text style={styles.sectionLabel}>Planning hebdomadaire — {activeDays} jour(s) actif(s)</Text>

        {DAYS_FR.map((day, idx) => {
          const dayData = schedule[idx];
          return (
            <View key={day} style={[styles.dayCard, !dayData.enabled && { opacity: 0.5 }]}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayName}>{day}</Text>
                <Switch
                  value={dayData.enabled}
                  onValueChange={() => toggleDay(idx)}
                  trackColor={{ false: COLORS.border, true: COLORS.accent }}
                  thumbColor={dayData.enabled ? COLORS.white : COLORS.muted}
                />
              </View>
              {dayData.enabled && (
                <View style={styles.slotsRow}>
                  {SLOTS_PER_DAY.map(s => (
                    <TouchableOpacity
                      key={s.key}
                      style={[styles.slotChip, dayData.slots[s.key] && styles.slotChipActive]}
                      onPress={() => toggleSlot(idx, s.key)}
                    >
                      <Text style={[styles.slotLabel, dayData.slots[s.key] && { color: '#000' }]}>{s.label}</Text>
                      <Text style={[styles.slotHours, dayData.slots[s.key] && { color: '#000' }]}>{s.hours}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.tipBox}>
          <Text style={styles.tipText}>💡 Un planning complet augmente vos chances de recevoir des commandes. Les clients voient votre disponibilité avant de commander.</Text>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  saveBtn: { backgroundColor: COLORS.accent, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6, minWidth: 56, alignItems: 'center' },
  saveBtnText: { color: '#000', fontWeight: '800', fontSize: 13 },
  scroll: { padding: 16 },
  onlineCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1.5, padding: 16, marginBottom: 16 },
  onlineLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  onlineStatus: { fontSize: 14, fontWeight: '700' },
  sectionLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  dayCard: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 10 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  dayName: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  slotsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 6 },
  slotChip: { flex: 1, minWidth: '28%', backgroundColor: COLORS.bg, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, padding: 8, alignItems: 'center' },
  slotChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  slotLabel: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  slotHours: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  tipBox: { backgroundColor: '#1A1200', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.accent + '44' },
  tipText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
});
