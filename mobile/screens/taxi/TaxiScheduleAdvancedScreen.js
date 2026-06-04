import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const TAXI_TYPES = [
  { key: 'NORMAL', label: 'EasyTaxy', icon: '🚕', color: '#F5A623' },
  { key: 'EASYLADY', label: 'Easy For Lady', icon: '🚗', color: '#E91E8C' },
  { key: 'EASYACCESS', label: 'EasyAccess', icon: '♿', color: '#2196F3' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

const UPCOMING = [
  { id: 1, date: 'Demain 08:30', from: 'Maison - La Marsa', to: 'Aéroport Tunis-Carthage', type: 'NORMAL', status: 'CONFIRMED' },
  { id: 2, date: 'Sam 14:00', from: 'Bureau - Centre-ville', to: 'La Goulette', type: 'EASYLADY', status: 'PENDING' },
];

export default function TaxiScheduleAdvancedScreen({ navigation }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [taxiType, setTaxiType] = useState('NORMAL');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState('08');
  const [selectedMin, setSelectedMin] = useState('00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('NEW');

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return {
      key: d.toISOString().split('T')[0],
      label: i === 0 ? 'Demain' : d.toLocaleDateString('fr-TN', { weekday: 'short', day: 'numeric', month: 'short' }),
    };
  });

  const handleBook = async () => {
    if (!origin.trim() || !destination.trim() || !selectedDate) {
      Alert.alert('Champs requis', 'Remplissez le départ, la destination et la date.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/taxi/schedule', {
        originAddress: origin,
        destinationAddress: destination,
        taxiType,
        scheduledAt: `${selectedDate}T${selectedHour}:${selectedMin}:00`,
        notes,
      });
      Alert.alert('✅ Réservation confirmée', `Votre taxi est réservé pour le ${dates.find(d => d.key === selectedDate)?.label} à ${selectedHour}h${selectedMin}.`, [
        { text: 'OK', onPress: () => { setTab('UPCOMING'); setOrigin(''); setDestination(''); setNotes(''); } },
      ]);
    } catch {
      Alert.alert('Erreur', 'Impossible de créer la réservation. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = (id) => {
    Alert.alert('Annuler', 'Annuler cette réservation ?', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui, annuler', style: 'destructive', onPress: () => {} },
    ]);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Taxi programmé</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.tabs}>
        {[['NEW', '➕ Nouvelle résa'], ['UPCOMING', '📅 Mes réservations']].map(([key, label]) => (
          <TouchableOpacity key={key} style={[styles.tab, tab === key && styles.tabActive]} onPress={() => setTab(key)}>
            <Text style={[styles.tabText, tab === key && { color: '#000' }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {tab === 'NEW' && (
          <>
            <Text style={styles.section}>🚕 Type de taxi</Text>
            <View style={styles.typeRow}>
              {TAXI_TYPES.map(t => (
                <TouchableOpacity key={t.key} style={[styles.typeCard, taxiType === t.key && { borderColor: t.color, backgroundColor: t.color + '18' }]} onPress={() => setTaxiType(t.key)}>
                  <Text style={{ fontSize: 24 }}>{t.icon}</Text>
                  <Text style={[styles.typeLabel, taxiType === t.key && { color: t.color }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.section}>📍 Itinéraire</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>🟢</Text>
              <TextInput style={styles.input} value={origin} onChangeText={setOrigin} placeholder="Adresse de départ" placeholderTextColor={COLORS.muted} />
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>🔴</Text>
              <TextInput style={styles.input} value={destination} onChangeText={setDestination} placeholder="Adresse de destination" placeholderTextColor={COLORS.muted} />
            </View>

            <Text style={styles.section}>📅 Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {dates.map(d => (
                <TouchableOpacity key={d.key} style={[styles.dateChip, selectedDate === d.key && styles.dateChipActive]} onPress={() => setSelectedDate(d.key)}>
                  <Text style={[styles.dateText, selectedDate === d.key && { color: '#000' }]}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.section}>⏰ Heure</Text>
            <View style={styles.timeRow}>
              <View style={styles.timePicker}>
                <Text style={styles.timePickerLabel}>Heure</Text>
                <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                  {HOURS.map(h => (
                    <TouchableOpacity key={h} style={[styles.timeItem, selectedHour === h && styles.timeItemActive]} onPress={() => setSelectedHour(h)}>
                      <Text style={[styles.timeItemText, selectedHour === h && { color: '#000' }]}>{h}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <Text style={{ color: COLORS.white, fontSize: 24, fontWeight: '900', alignSelf: 'center' }}>:</Text>
              <View style={styles.timePicker}>
                <Text style={styles.timePickerLabel}>Min</Text>
                <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                  {MINUTES.map(m => (
                    <TouchableOpacity key={m} style={[styles.timeItem, selectedMin === m && styles.timeItemActive]} onPress={() => setSelectedMin(m)}>
                      <Text style={[styles.timeItemText, selectedMin === m && { color: '#000' }]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.timeDisplay}>
                <Text style={styles.timeDisplayText}>{selectedHour}:{selectedMin}</Text>
                <Text style={{ color: COLORS.muted, fontSize: 11, marginTop: 4 }}>
                  {selectedDate ? dates.find(d => d.key === selectedDate)?.label : 'Choisissez une date'}
                </Text>
              </View>
            </View>

            <Text style={styles.section}>📝 Notes (optionnel)</Text>
            <TextInput
              style={[styles.input, { minHeight: 70, textAlignVertical: 'top', marginBottom: 20, padding: 12, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Instructions pour le chauffeur..."
              placeholderTextColor={COLORS.muted}
              multiline
            />

            <TouchableOpacity style={[styles.bookBtn, loading && { opacity: 0.7 }]} onPress={handleBook} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.bookBtnText}>📅 Confirmer la réservation</Text>}
            </TouchableOpacity>
          </>
        )}

        {tab === 'UPCOMING' && (
          <>
            {UPCOMING.length === 0 ? (
              <View style={styles.empty}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>📅</Text>
                <Text style={styles.emptyText}>Aucune réservation à venir</Text>
              </View>
            ) : (
              UPCOMING.map(r => (
                <View key={r.id} style={styles.reservCard}>
                  <View style={styles.reservTop}>
                    <Text style={styles.reservDate}>{r.date}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: r.status === 'CONFIRMED' ? COLORS.green + '22' : COLORS.accent + '22' }]}>
                      <Text style={[styles.statusText, { color: r.status === 'CONFIRMED' ? COLORS.green : COLORS.accent }]}>
                        {r.status === 'CONFIRMED' ? '✅ Confirmé' : '⏳ En attente'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.reservRoute}>
                    <Text style={styles.reservFrom}>🟢 {r.from}</Text>
                    <Text style={styles.reservTo}>🔴 {r.to}</Text>
                  </View>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelBooking(r.id)}>
                    <Text style={styles.cancelBtnText}>✕ Annuler</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  tabs: { flexDirection: 'row', padding: 12, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  section: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  typeCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.border },
  typeLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, marginBottom: 10 },
  inputIcon: { fontSize: 14, marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, color: COLORS.white, fontSize: 14 },
  dateChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, marginRight: 8 },
  dateChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  dateText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  timeRow: { flexDirection: 'row', gap: 12, marginBottom: 20, alignItems: 'flex-start' },
  timePicker: { width: 70 },
  timePickerLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '600', marginBottom: 6, textAlign: 'center' },
  timeScroll: { height: 120, backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
  timeItem: { paddingVertical: 8, alignItems: 'center' },
  timeItemActive: { backgroundColor: COLORS.accent },
  timeItemText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  timeDisplay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  timeDisplayText: { color: COLORS.accent, fontSize: 32, fontWeight: '900' },
  bookBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  bookBtnText: { color: '#000', fontSize: 15, fontWeight: '900' },
  reservCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  reservTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  reservDate: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '700' },
  reservRoute: { gap: 6, marginBottom: 12 },
  reservFrom: { color: COLORS.muted, fontSize: 12 },
  reservTo: { color: COLORS.muted, fontSize: 12 },
  cancelBtn: { alignSelf: 'flex-end', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: COLORS.red + '55', backgroundColor: COLORS.red + '11' },
  cancelBtnText: { color: COLORS.red, fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: COLORS.muted, fontSize: 15 },
});
