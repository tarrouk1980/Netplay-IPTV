import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F',
};

const TAXI_TYPES = [
  { key: 'NORMAL', label: '🚕 EasyTaxy', color: COLORS.accent },
  { key: 'EASYLADY', label: '👩‍✈️ Easy For Lady', color: '#E91E8C' },
  { key: 'EASYACCESS', label: '♿ EasyAccess', color: '#2196F3' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

const TODAY = new Date();
const DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(TODAY);
  d.setDate(TODAY.getDate() + i);
  return {
    label: i === 0 ? "Aujourd'hui" : i === 1 ? 'Demain'
      : d.toLocaleDateString('fr-TN', { weekday: 'short', day: 'numeric', month: 'short' }),
    date: d.toISOString().slice(0, 10),
  };
});

export default function TaxiScheduleScreen({ navigation }) {
  const [taxiType, setTaxiType] = useState('NORMAL');
  const [selectedDay, setSelectedDay] = useState(DAYS[0].date);
  const [hour, setHour] = useState('08');
  const [minute, setMinute] = useState('00');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSchedule = async () => {
    if (!from.trim() || !to.trim()) {
      Alert.alert('Erreur', 'Renseignez les adresses de départ et destination');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/taxi/schedule', {
        taxiType, date: selectedDay, time: `${hour}:${minute}`,
        from: from.trim(), to: to.trim(), notes: notes.trim(),
      });
      Alert.alert(
        '✅ Réservation programmée !',
        `Votre taxi est réservé pour le ${DAYS.find((d) => d.date === selectedDay)?.label} à ${hour}h${minute}.\nVous serez notifié 15 min avant.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch {
      Alert.alert('Erreur', 'Impossible de programmer la réservation. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📅 Taxi Programmé</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Type */}
        <Text style={styles.sectionLabel}>Type de taxi</Text>
        <View style={styles.typeRow}>
          {TAXI_TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.typeBtn, taxiType === t.key && { borderColor: t.color, backgroundColor: t.color + '22' }]}
              onPress={() => setTaxiType(t.key)}
            >
              <Text style={[styles.typeBtnText, taxiType === t.key && { color: t.color }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Day */}
        <Text style={styles.sectionLabel}>Jour</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
            {DAYS.map((d) => (
              <TouchableOpacity
                key={d.date}
                style={[styles.dayBtn, selectedDay === d.date && styles.dayBtnActive]}
                onPress={() => setSelectedDay(d.date)}
              >
                <Text style={[styles.dayBtnText, selectedDay === d.date && { color: '#000' }]}>{d.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Time */}
        <Text style={styles.sectionLabel}>Heure</Text>
        <View style={styles.timeRow}>
          <View style={styles.timeBox}>
            <Text style={styles.timeBoxLabel}>Heure</Text>
            <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
              {HOURS.map((h) => (
                <TouchableOpacity key={h} style={[styles.pickerItem, hour === h && styles.pickerItemActive]} onPress={() => setHour(h)}>
                  <Text style={[styles.pickerText, hour === h && { color: '#000' }]}>{h}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <Text style={styles.timeSep}>:</Text>
          <View style={styles.timeBox}>
            <Text style={styles.timeBoxLabel}>Min</Text>
            <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
              {MINUTES.map((m) => (
                <TouchableOpacity key={m} style={[styles.pickerItem, minute === m && styles.pickerItemActive]} onPress={() => setMinute(m)}>
                  <Text style={[styles.pickerText, minute === m && { color: '#000' }]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.timePreview}>
            <Text style={styles.timePreviewValue}>{hour}:{minute}</Text>
            <Text style={styles.timePreviewLabel}>Départ prévu</Text>
          </View>
        </View>

        {/* Addresses */}
        <Text style={styles.sectionLabel}>Adresses</Text>
        <TextInput
          style={styles.input}
          value={from}
          onChangeText={setFrom}
          placeholder="📍 Adresse de départ"
          placeholderTextColor={COLORS.muted}
        />
        <TextInput
          style={[styles.input, { marginTop: 8 }]}
          value={to}
          onChangeText={setTo}
          placeholder="🏁 Destination"
          placeholderTextColor={COLORS.muted}
        />

        {/* Notes */}
        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Notes (optionnel)</Text>
        <TextInput
          style={[styles.input, { minHeight: 70 }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Instructions spéciales pour le chauffeur..."
          placeholderTextColor={COLORS.muted}
          multiline
          maxLength={200}
        />

        <View style={styles.reminderNote}>
          <Text style={styles.reminderText}>🔔 Vous recevrez une notification 15 min avant l'heure programmée.</Text>
        </View>

        <TouchableOpacity
          style={[styles.scheduleBtn, submitting && { opacity: 0.5 }]}
          onPress={handleSchedule}
          disabled={submitting}
        >
          <Text style={styles.scheduleBtnText}>📅 Confirmer la réservation</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  scroll: { padding: 16 },
  sectionLabel: {
    color: COLORS.muted, fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
  },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center',
  },
  typeBtnText: { color: COLORS.white, fontSize: 11, fontWeight: '600' },
  dayBtn: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  dayBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  dayBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  timeBox: { width: 72 },
  timeBoxLabel: { color: COLORS.muted, fontSize: 10, textAlign: 'center', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  pickerScroll: { height: 120, backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
  pickerItem: { paddingVertical: 8, alignItems: 'center' },
  pickerItemActive: { backgroundColor: COLORS.accent, margin: 2, borderRadius: 6 },
  pickerText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  timeSep: { color: COLORS.accent, fontSize: 28, fontWeight: '900', marginBottom: 24 },
  timePreview: { flex: 1, alignItems: 'center' },
  timePreviewValue: { color: COLORS.accent, fontSize: 36, fontWeight: '900' },
  timePreviewLabel: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    textAlignVertical: 'top',
  },
  reminderNote: {
    backgroundColor: '#1A1200', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: COLORS.accent + '44', marginVertical: 16,
  },
  reminderText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  scheduleBtn: {
    backgroundColor: COLORS.accent, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  scheduleBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
});
