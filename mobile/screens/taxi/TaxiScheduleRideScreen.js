import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Alert, StatusBar, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useLocationStore from '../../store/locationStore';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  accent: '#F5A623',
  green: '#27AE60',
  error: '#E74C3C',
};

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ';

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
const MINUTES = ['00', '15', '30', '45'];

function buildDays() {
  const days = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const label = i === 0 ? "Aujourd'hui" : i === 1 ? 'Demain' : d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    days.push({ date: d, label, key: d.toISOString().slice(0, 10) });
  }
  return days;
}

async function geocode(query) {
  if (!query || query.length < 3) return [];
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=TN&language=fr&limit=4&access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.features || []).map(f => ({ name: f.place_name, lat: f.center[1], lng: f.center[0] }));
  } catch {
    return [];
  }
}

function AddressInput({ label, value, onSelect }) {
  const [query, setQuery] = useState(value?.name || '');
  const [suggestions, setSuggestions] = useState([]);
  const [timer, setTimer] = useState(null);

  const onChange = text => {
    setQuery(text);
    clearTimeout(timer);
    setTimer(setTimeout(async () => {
      const results = await geocode(text);
      setSuggestions(results);
    }, 400));
  };

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        value={query}
        onChangeText={onChange}
        placeholder="Chercher une adresse en Tunisie..."
        placeholderTextColor={COLORS.muted}
      />
      {suggestions.length > 0 && (
        <View style={styles.suggestions}>
          {suggestions.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={styles.suggestionItem}
              onPress={() => { setQuery(s.name); setSuggestions([]); onSelect(s); }}
            >
              <Text style={styles.suggestionText} numberOfLines={1}>📍 {s.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function TaxiScheduleRideScreen({ navigation }) {
  const { location } = useLocationStore();
  const DAYS = buildDays();

  const [step, setStep] = useState(1); // 1=datetime, 2=addresses, 3=confirm
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [selectedHour, setSelectedHour] = useState('08');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const scheduledAt = selectedDay
    ? new Date(`${selectedDay.key}T${selectedHour}:${selectedMinute}:00`)
    : null;

  const isDateValid = scheduledAt && scheduledAt > new Date(Date.now() + 30 * 60 * 1000);

  const handleBook = useCallback(async () => {
    if (!origin || !destination) {
      Alert.alert('Adresses manquantes', 'Veuillez saisir départ et destination.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/taxi/schedule', {
        scheduledAt: scheduledAt.toISOString(),
        originAddress: origin.name,
        originLat: origin.lat,
        originLng: origin.lng,
        destinationAddress: destination.name,
        destinationLat: destination.lat,
        destinationLng: destination.lng,
        note,
      });
      Alert.alert(
        '✅ Course programmée',
        `Votre taxi est réservé pour le ${selectedDay.label} à ${selectedHour}:${selectedMinute}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Réservation échouée');
    } finally {
      setLoading(false);
    }
  }, [origin, destination, scheduledAt, note, selectedDay, selectedHour, selectedMinute, navigation]);

  const renderStep1 = () => (
    <>
      <Text style={styles.sectionTitle}>Choisir le jour</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayRow}>
        {DAYS.map(d => (
          <TouchableOpacity
            key={d.key}
            style={[styles.dayChip, selectedDay?.key === d.key && styles.dayChipActive]}
            onPress={() => setSelectedDay(d)}
          >
            <Text style={[styles.dayChipText, selectedDay?.key === d.key && styles.dayChipTextActive]}>
              {d.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Heure de prise en charge</Text>
      <View style={styles.timeRow}>
        <View style={styles.timeCol}>
          <Text style={styles.timeColLabel}>Heure</Text>
          <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
            {HOURS.map(h => {
              const hh = h.slice(0, 2);
              return (
                <TouchableOpacity
                  key={h}
                  style={[styles.timeSlot, selectedHour === hh && styles.timeSlotActive]}
                  onPress={() => setSelectedHour(hh)}
                >
                  <Text style={[styles.timeSlotText, selectedHour === hh && styles.timeSlotTextActive]}>{h}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        <View style={styles.timeSep}><Text style={styles.timeSepText}>:</Text></View>
        <View style={styles.timeCol}>
          <Text style={styles.timeColLabel}>Min</Text>
          {MINUTES.map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.timeSlot, selectedMinute === m && styles.timeSlotActive]}
              onPress={() => setSelectedMinute(m)}
            >
              <Text style={[styles.timeSlotText, selectedMinute === m && styles.timeSlotTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {!isDateValid && (
        <Text style={styles.warningText}>⚠️ L'heure doit être au moins 30 min dans le futur.</Text>
      )}

      <TouchableOpacity
        style={[styles.nextBtn, !isDateValid && styles.nextBtnDisabled]}
        disabled={!isDateValid}
        onPress={() => setStep(2)}
      >
        <Text style={styles.nextBtnText}>Suivant → Adresses</Text>
      </TouchableOpacity>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.sectionTitle}>Adresses</Text>
      <AddressInput label="🟢 Départ" value={origin} onSelect={setOrigin} />
      <AddressInput label="🔴 Destination" value={destination} onSelect={setDestination} />

      <Text style={styles.inputLabel}>Note pour le chauffeur (optionnel)</Text>
      <TextInput
        style={[styles.textInput, { height: 70 }]}
        value={note}
        onChangeText={setNote}
        placeholder="Ex: bagages, enfants, appel à l'arrivée..."
        placeholderTextColor={COLORS.muted}
        multiline
      />

      <TouchableOpacity
        style={[styles.nextBtn, (!origin || !destination) && styles.nextBtnDisabled]}
        disabled={!origin || !destination}
        onPress={() => setStep(3)}
      >
        <Text style={styles.nextBtnText}>Suivant → Confirmer</Text>
      </TouchableOpacity>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.sectionTitle}>Récapitulatif</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>📅 Date</Text>
          <Text style={styles.summaryValue}>{selectedDay?.label}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>🕐 Heure</Text>
          <Text style={[styles.summaryValue, { color: COLORS.accent }]}>{selectedHour}:{selectedMinute}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>🟢 Départ</Text>
          <Text style={styles.summaryValue} numberOfLines={2}>{origin?.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>🔴 Arrivée</Text>
          <Text style={styles.summaryValue} numberOfLines={2}>{destination?.name}</Text>
        </View>
        {note ? (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>📝 Note</Text>
            <Text style={styles.summaryValue}>{note}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          ℹ️ Un chauffeur vous sera assigné 15 min avant l'heure prévue. Vous recevrez une notification de confirmation.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.bookBtn}
        onPress={handleBook}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.bookBtnText}>🚕 Confirmer la réservation</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.editBtn} onPress={() => setStep(1)}>
        <Text style={styles.editBtnText}>✏️ Modifier</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🚕 Programmer un taxi</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        {[1, 2, 3].map(s => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepCircle, step >= s && styles.stepCircleActive]}>
              <Text style={[styles.stepNum, step >= s && styles.stepNumActive]}>{s}</Text>
            </View>
            <Text style={[styles.stepLabel, step >= s && { color: COLORS.accent }]}>
              {s === 1 ? 'Date/Heure' : s === 2 ? 'Adresses' : 'Confirmer'}
            </Text>
            {s < 3 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        <View style={{ height: 40 }} />
      </ScrollView>
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
  stepRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, paddingHorizontal: 20, gap: 0,
  },
  stepItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepCircleActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '22' },
  stepNum: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },
  stepNumActive: { color: COLORS.accent },
  stepLabel: { color: COLORS.muted, fontSize: 10, marginLeft: 6, fontWeight: '600', flex: 1 },
  stepLine: { height: 2, flex: 1, backgroundColor: COLORS.border, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: COLORS.accent },
  scroll: { padding: 16 },
  sectionTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 8 },
  dayRow: { marginBottom: 16 },
  dayChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border,
    marginRight: 8,
  },
  dayChipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  dayChipText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  dayChipTextActive: { color: COLORS.accent },
  timeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 16 },
  timeCol: { flex: 1 },
  timeColLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  timeScroll: { maxHeight: 200 },
  timeSlot: {
    paddingVertical: 10, marginBottom: 4, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
  },
  timeSlotActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '20' },
  timeSlotText: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
  timeSlotTextActive: { color: COLORS.accent },
  timeSep: { paddingTop: 40, alignItems: 'center', width: 20 },
  timeSepText: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  warningText: { color: COLORS.error, fontSize: 12, marginBottom: 12, textAlign: 'center' },
  nextBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  inputLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600', marginBottom: 6 },
  textInput: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.text, fontSize: 14, padding: 12,
  },
  suggestions: {
    backgroundColor: COLORS.surface, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border, marginTop: 4,
  },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  suggestionText: { color: COLORS.text, fontSize: 13 },
  summaryCard: {
    backgroundColor: COLORS.surface, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  summaryLabel: { color: COLORS.muted, fontSize: 13, flex: 1 },
  summaryValue: { color: COLORS.text, fontSize: 13, fontWeight: '600', flex: 2, textAlign: 'right' },
  infoBox: {
    backgroundColor: '#0A1A2A', borderRadius: 10, borderWidth: 1,
    borderColor: '#1565C0', padding: 12, marginBottom: 16,
  },
  infoText: { color: '#5BA3E8', fontSize: 12, lineHeight: 18 },
  bookBtn: {
    backgroundColor: COLORS.green, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 10,
  },
  bookBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  editBtn: { alignItems: 'center', paddingVertical: 12 },
  editBtnText: { color: COLORS.muted, fontSize: 14 },
});
