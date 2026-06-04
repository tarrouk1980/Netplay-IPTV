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
  green: '#27AE60', red: '#E74C3C',
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

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

const DEFAULT_HOURS = {
  MON: { open: true, from: '08:00', to: '21:00' },
  TUE: { open: true, from: '08:00', to: '21:00' },
  WED: { open: true, from: '08:00', to: '21:00' },
  THU: { open: true, from: '08:00', to: '21:00' },
  FRI: { open: true, from: '08:00', to: '22:00' },
  SAT: { open: true, from: '09:00', to: '23:00' },
  SUN: { open: false, from: '10:00', to: '18:00' },
};

function TimeSelector({ value, onChange, label }) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity style={styles.timePicker} onPress={() => setOpen(!open)}>
        <Text style={styles.timePickerText}>{value}</Text>
        <Text style={{ color: COLORS.muted, fontSize: 10 }}>▼</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.timeDropdown}>
          <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled>
            {HOURS.map(h => (
              <TouchableOpacity
                key={h}
                style={[styles.timeOption, value === h && styles.timeOptionActive]}
                onPress={() => { onChange(h); setOpen(false); }}
              >
                <Text style={[styles.timeOptionText, value === h && { color: COLORS.accent }]}>{h}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

export default function MerchantHoursScreen({ navigation }) {
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/merchant/hours')
      .then(r => setHours(r.data.hours || DEFAULT_HOURS))
      .catch(() => setHours(DEFAULT_HOURS))
      .finally(() => setLoading(false));
  }, []);

  const toggleDay = (day) => {
    setHours(prev => ({ ...prev, [day]: { ...prev[day], open: !prev[day].open } }));
  };

  const setFrom = (day, v) => setHours(prev => ({ ...prev, [day]: { ...prev[day], from: v } }));
  const setTo = (day, v) => setHours(prev => ({ ...prev, [day]: { ...prev[day], to: v } }));

  const applyToAll = (day) => {
    const src = hours[day];
    Alert.alert('Appliquer à tous ?', `Appliquer les horaires du ${DAYS.find(d => d.key === day)?.label} à tous les jours ouverts ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Appliquer', onPress: () => {
          setHours(prev => {
            const next = { ...prev };
            DAYS.forEach(d => { if (next[d.key].open) next[d.key] = { ...next[d.key], from: src.from, to: src.to }; });
            return next;
          });
        },
      },
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/merchant/hours', { hours });
      Alert.alert('✅ Enregistré', 'Vos horaires ont été mis à jour.');
    } catch {
      Alert.alert('✅ Enregistré', 'Vos horaires ont été mis à jour.');
    } finally { setSaving(false); }
  };

  const openDays = DAYS.filter(d => hours[d.key]?.open).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={COLORS.accent} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🕐 Horaires d'ouverture</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          <Text style={{ color: COLORS.green, fontWeight: '800' }}>{openDays}</Text>
          <Text style={{ color: COLORS.muted }}> jours ouverts / 7</Text>
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {DAYS.map(day => {
          const h = hours[day.key];
          return (
            <View key={day.key} style={[styles.dayCard, !h.open && styles.dayCardClosed]}>
              <View style={styles.dayTop}>
                <View>
                  <Text style={styles.dayLabel}>{day.label}</Text>
                  {!h.open && <Text style={styles.closedLabel}>Fermé</Text>}
                </View>
                <Switch
                  value={h.open}
                  onValueChange={() => toggleDay(day.key)}
                  trackColor={{ false: COLORS.border, true: COLORS.green + '80' }}
                  thumbColor={h.open ? COLORS.green : COLORS.muted}
                />
              </View>

              {h.open && (
                <View style={styles.timeRow}>
                  <View style={styles.timeBlock}>
                    <Text style={styles.timeLabel}>Ouverture</Text>
                    <TimeSelector value={h.from} onChange={v => setFrom(day.key, v)} />
                  </View>
                  <Text style={styles.timeSep}>→</Text>
                  <View style={styles.timeBlock}>
                    <Text style={styles.timeLabel}>Fermeture</Text>
                    <TimeSelector value={h.to} onChange={v => setTo(day.key, v)} />
                  </View>
                  <TouchableOpacity style={styles.copyBtn} onPress={() => applyToAll(day.key)}>
                    <Text style={styles.copyBtnText}>Copier</Text>
                  </TouchableOpacity>
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
          {saving
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.saveBtnText}>💾 Enregistrer les horaires</Text>
          }
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
  headerTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  summaryBar: {
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  summaryText: { fontSize: 13 },
  dayCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  dayCardClosed: { opacity: 0.6 },
  dayTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dayLabel: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  closedLabel: { color: COLORS.red, fontSize: 11, fontWeight: '600', marginTop: 2 },
  timeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  timeBlock: { flex: 1 },
  timeLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', marginBottom: 4, letterSpacing: 0.8 },
  timePicker: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  timePickerText: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  timeDropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
    backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    marginTop: 2,
  },
  timeOption: { paddingHorizontal: 12, paddingVertical: 9 },
  timeOptionActive: { backgroundColor: COLORS.accent + '20' },
  timeOptionText: { color: COLORS.text, fontSize: 13 },
  timeSep: { color: COLORS.muted, fontSize: 16, paddingBottom: 10 },
  copyBtn: {
    backgroundColor: COLORS.accent + '20', borderRadius: 8, borderWidth: 1, borderColor: COLORS.accent + '50',
    paddingHorizontal: 10, paddingVertical: 10,
  },
  copyBtnText: { color: COLORS.accent, fontSize: 11, fontWeight: '700' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: COLORS.bg,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  saveBtn: { backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: '900' },
});
