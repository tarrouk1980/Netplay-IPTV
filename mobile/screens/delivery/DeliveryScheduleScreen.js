import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F',
};

const TODAY = new Date();
const SLOTS = ['08:00–10:00', '10:00–12:00', '12:00–14:00', '14:00–16:00', '16:00–18:00', '18:00–20:00'];
const DAYS = Array.from({ length: 6 }, (_, i) => {
  const d = new Date(TODAY);
  d.setDate(TODAY.getDate() + i + 1);
  return {
    label: d.toLocaleDateString('fr-TN', { weekday: 'short', day: 'numeric', month: 'short' }),
    date: d.toISOString().slice(0, 10),
  };
});

const SIZE_OPTIONS = [
  { key: 'small',  label: 'Petit',   emoji: '📦', desc: '≤ 2 kg · boîte de chaussures' },
  { key: 'medium', label: 'Moyen',   emoji: '📫', desc: '2–10 kg · sac à dos' },
  { key: 'large',  label: 'Grand',   emoji: '🗃️', desc: '10–30 kg · valise' },
];

export default function DeliveryScheduleScreen({ navigation }) {
  const [day, setDay]     = useState(DAYS[0].date);
  const [slot, setSlot]   = useState('');
  const [size, setSize]   = useState('small');
  const [from, setFrom]   = useState('');
  const [to, setTo]       = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = day && slot && from.trim() && to.trim();

  const handleSchedule = async () => {
    setSubmitting(true);
    try {
      await api.post('/api/delivery/schedule', { date: day, slot, size, from, to, notes });
      Alert.alert(
        '✅ Livraison programmée',
        `Votre livraison est prévue le ${DAYS.find(d => d.date === day)?.label} entre ${slot}. Un livreur vous contactera 30 min avant.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch {
      Alert.alert('Erreur', 'Impossible de programmer. Réessayez.');
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
        <Text style={styles.title}>📅 Livraison Programmée</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Text style={styles.label}>Jour de livraison</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
            {DAYS.map(d => (
              <TouchableOpacity
                key={d.date}
                style={[styles.dayBtn, day === d.date && styles.dayBtnActive]}
                onPress={() => setDay(d.date)}
              >
                <Text style={[styles.dayText, day === d.date && { color: '#000' }]}>{d.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={styles.label}>Créneau horaire</Text>
        <View style={styles.slotGrid}>
          {SLOTS.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.slotBtn, slot === s && styles.slotBtnActive]}
              onPress={() => setSlot(s)}
            >
              <Text style={[styles.slotText, slot === s && { color: '#000' }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Taille du colis</Text>
        {SIZE_OPTIONS.map(o => (
          <TouchableOpacity
            key={o.key}
            style={[styles.sizeRow, size === o.key && styles.sizeRowActive]}
            onPress={() => setSize(o.key)}
          >
            <Text style={{ fontSize: 28 }}>{o.emoji}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.sizeLabel, size === o.key && { color: COLORS.accent }]}>{o.label}</Text>
              <Text style={styles.sizeDesc}>{o.desc}</Text>
            </View>
            <View style={[styles.radio, size === o.key && styles.radioActive]}>
              {size === o.key && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.label}>Adresse de collecte</Text>
        <TextInput style={styles.input} value={from} onChangeText={setFrom} placeholder="📍 Adresse de départ" placeholderTextColor={COLORS.muted} />

        <Text style={[styles.label, { marginTop: 10 }]}>Adresse de livraison</Text>
        <TextInput style={styles.input} value={to} onChangeText={setTo} placeholder="🏁 Adresse destination" placeholderTextColor={COLORS.muted} />

        <Text style={[styles.label, { marginTop: 10 }]}>Instructions (optionnel)</Text>
        <TextInput
          style={[styles.input, { minHeight: 70 }]}
          value={notes} onChangeText={setNotes}
          placeholder="Ex : Appeler avant d'arriver, code portail..."
          placeholderTextColor={COLORS.muted} multiline textAlignVertical="top"
        />

        <View style={styles.reminderNote}>
          <Text style={styles.reminderText}>🔔 Le livreur vous contactera 30 min avant l'arrivée dans le créneau choisi.</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && { opacity: 0.4 }]}
          onPress={handleSchedule}
          disabled={!canSubmit || submitting}
        >
          {submitting ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.submitBtnText}>Confirmer la livraison</Text>}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  scroll: { padding: 16 },
  label: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  dayBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  dayBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  dayText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  slotBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  slotBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  slotText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  sizeRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 8 },
  sizeRowActive: { borderColor: COLORS.accent, backgroundColor: '#1A1200' },
  sizeLabel: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  sizeDesc: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.muted, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, color: COLORS.white, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  reminderNote: { backgroundColor: '#1A1200', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.accent + '44', marginVertical: 14 },
  reminderText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  submitBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  submitBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
});
