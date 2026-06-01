import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  orange: '#F57C00',
  green: '#27AE60',
  accent: '#D32F2F',
  blue: '#1565C0',
};

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

const DEFAULT_SCHEDULE = DAYS.map((day, i) => ({
  day,
  dayIndex: i,
  enabled: i < 5,
  startHour: '08:00',
  endHour: '20:00',
  breakStart: '13:00',
  breakEnd: '14:00',
  hasBreak: false,
}));

function HourPicker({ value, onChange, label }) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Text style={p.label}>{label}</Text>
      <TouchableOpacity style={p.btn} onPress={() => setOpen(!open)}>
        <Text style={p.btnTxt}>{value} ▾</Text>
      </TouchableOpacity>
      {open && (
        <ScrollView style={p.dropdown} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {HOURS.map((h) => (
            <TouchableOpacity
              key={h}
              style={[p.option, value === h && p.optionActive]}
              onPress={() => { onChange(h); setOpen(false); }}
            >
              <Text style={[p.optionTxt, value === h && { color: COLORS.orange }]}>{h}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const p = StyleSheet.create({
  label: { color: COLORS.muted, fontSize: 10, fontWeight: '700', marginBottom: 4 },
  btn: { backgroundColor: COLORS.surfaceAlt, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: COLORS.border },
  btnTxt: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  dropdown: { position: 'absolute', top: 52, zIndex: 99, backgroundColor: COLORS.surface, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, maxHeight: 150, width: 80 },
  option: { paddingHorizontal: 10, paddingVertical: 8 },
  optionActive: { backgroundColor: COLORS.orange + '22' },
  optionTxt: { color: COLORS.muted, fontSize: 12 },
});

export default function ProviderWorkScheduleScreen({ navigation }) {
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/provider/work-schedule');
      if (res.data.schedule && res.data.schedule.length > 0) {
        setSchedule(res.data.schedule);
      }
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = (dayIndex, key, val) => {
    setSchedule((prev) => prev.map((d) => d.dayIndex === dayIndex ? { ...d, [key]: val } : d));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/provider/work-schedule', { schedule });
      Alert.alert('Horaires sauvegardés ✅');
      navigation.goBack();
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder les horaires.');
    } finally {
      setSaving(false);
    }
  };

  const enabledDays = schedule.filter((d) => d.enabled).length;

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.orange} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>🗓 Horaires de travail</Text>
          <Text style={s.sub}>{enabledDays} jour{enabledDays !== 1 ? 's' : ''} actif{enabledDays !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={COLORS.orange} size="small" /> : (
            <Text style={s.saveBtn}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        <View style={s.infoBox}>
          <Text style={s.infoTxt}>💡 Configurez vos disponibilités hebdomadaires. Les clients ne pourront vous contacter que durant vos heures actives.</Text>
        </View>

        {schedule.map((day) => (
          <View key={day.dayIndex} style={[s.dayCard, !day.enabled && s.dayCardDisabled]}>
            <View style={s.dayTop}>
              <Text style={[s.dayName, !day.enabled && { color: COLORS.muted }]}>{day.day}</Text>
              {day.enabled && (
                <Text style={s.dayHours}>{day.startHour} – {day.endHour}</Text>
              )}
              <Switch
                value={day.enabled}
                onValueChange={(v) => update(day.dayIndex, 'enabled', v)}
                trackColor={{ false: COLORS.border, true: COLORS.orange + '88' }}
                thumbColor={day.enabled ? COLORS.orange : COLORS.muted}
              />
            </View>

            {day.enabled && (
              <View style={s.hoursRow}>
                <View style={{ flex: 1 }}>
                  <HourPicker
                    label="Début"
                    value={day.startHour}
                    onChange={(v) => update(day.dayIndex, 'startHour', v)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <HourPicker
                    label="Fin"
                    value={day.endHour}
                    onChange={(v) => update(day.dayIndex, 'endHour', v)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={p.label}>Pause</Text>
                  <Switch
                    value={day.hasBreak}
                    onValueChange={(v) => update(day.dayIndex, 'hasBreak', v)}
                    trackColor={{ false: COLORS.border, true: COLORS.blue + '88' }}
                    thumbColor={day.hasBreak ? COLORS.blue : COLORS.muted}
                  />
                </View>
              </View>
            )}

            {day.enabled && day.hasBreak && (
              <View style={[s.hoursRow, { marginTop: 8 }]}>
                <View style={{ flex: 1 }}>
                  <HourPicker
                    label="Début pause"
                    value={day.breakStart}
                    onChange={(v) => update(day.dayIndex, 'breakStart', v)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <HourPicker
                    label="Fin pause"
                    value={day.breakEnd}
                    onChange={(v) => update(day.dayIndex, 'breakEnd', v)}
                  />
                </View>
                <View style={{ flex: 1 }} />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  sub: { color: COLORS.muted, fontSize: 11, marginTop: 1 },
  saveBtn: { color: COLORS.orange, fontSize: 15, fontWeight: '700' },
  infoBox: { backgroundColor: COLORS.blue + '11', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: COLORS.blue + '33' },
  infoTxt: { color: COLORS.muted, fontSize: 12 },
  dayCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  dayCardDisabled: { opacity: 0.5 },
  dayTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  dayName: { color: COLORS.text, fontSize: 14, fontWeight: '700', width: 36 },
  dayHours: { color: COLORS.orange, fontSize: 12, fontWeight: '600', flex: 1 },
  hoursRow: { flexDirection: 'row', gap: 12 },
});
