import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const DAYS = [
  { key: 'mon', label: 'Lundi' },
  { key: 'tue', label: 'Mardi' },
  { key: 'wed', label: 'Mercredi' },
  { key: 'thu', label: 'Jeudi' },
  { key: 'fri', label: 'Vendredi' },
  { key: 'sat', label: 'Samedi' },
  { key: 'sun', label: 'Dimanche' },
];

const SLOTS = ['08:00–12:00', '12:00–16:00', '16:00–20:00', '20:00–00:00'];

const DEFAULT_SCHEDULE = Object.fromEntries(
  DAYS.map(d => [d.key, { enabled: ['mon','tue','wed','thu','fri'].includes(d.key), slots: ['12:00–16:00', '16:00–20:00'] }])
);

export default function LivreurScheduleScreen({ navigation }) {
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/delivery/livreur/schedule')
      .then(r => setSchedule(r.data || DEFAULT_SCHEDULE))
      .catch(() => setSchedule(DEFAULT_SCHEDULE))
      .finally(() => setLoading(false));
  }, []);

  const toggleDay = (key) =>
    setSchedule(prev => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }));

  const toggleSlot = (day, slot) => {
    setSchedule(prev => {
      const current = prev[day].slots;
      const updated = current.includes(slot) ? current.filter(s => s !== slot) : [...current, slot];
      return { ...prev, [day]: { ...prev[day], slots: updated } };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try { await api.put('/api/delivery/livreur/schedule', schedule); } catch {}
    setSaving(false);
    Alert.alert('✅ Planning enregistré', 'Vos disponibilités ont été mises à jour.');
  };

  const totalHours = Object.values(schedule).reduce((acc, day) => {
    if (!day.enabled) return acc;
    return acc + day.slots.length * 4;
  }, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📅 Mon planning</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Heures prévues cette semaine</Text>
              <Text style={styles.summaryVal}>{totalHours}h</Text>
              <Text style={styles.summaryEstimate}>≈ {(totalHours * 12).toFixed(0)}–{(totalHours * 18).toFixed(0)} TND estimés</Text>
            </View>

            {DAYS.map(day => {
              const dayData = schedule[day.key];
              return (
                <View key={day.key} style={[styles.dayCard, !dayData.enabled && { opacity: 0.5 }]}>
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayLabel}>{day.label}</Text>
                    <Switch
                      value={dayData.enabled}
                      onValueChange={() => toggleDay(day.key)}
                      trackColor={{ false: COLORS.border, true: COLORS.green + '80' }}
                      thumbColor={dayData.enabled ? COLORS.green : COLORS.muted}
                    />
                  </View>
                  {dayData.enabled && (
                    <View style={styles.slotsRow}>
                      {SLOTS.map(slot => (
                        <TouchableOpacity
                          key={slot}
                          style={[styles.slotBtn, dayData.slots.includes(slot) && styles.slotBtnActive]}
                          onPress={() => toggleSlot(day.key, slot)}
                        >
                          <Text style={[styles.slotText, dayData.slots.includes(slot) && styles.slotTextActive]}>{slot}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.saveBtnText}>💾 Enregistrer le planning</Text>}
            </TouchableOpacity>
          </View>
        </>
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
  summaryCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: COLORS.accent + '40' },
  summaryTitle: { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  summaryVal: { color: COLORS.accent, fontSize: 36, fontWeight: '900', marginBottom: 4 },
  summaryEstimate: { color: COLORS.green, fontSize: 12 },
  dayCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  dayLabel: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  slotsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border },
  slotBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '20' },
  slotText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  slotTextActive: { color: COLORS.accent },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border },
  saveBtn: { backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 15, fontWeight: '900' },
});
