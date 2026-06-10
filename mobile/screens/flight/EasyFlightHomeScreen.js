import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, Modal, StatusBar, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  card: '#22223A',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  primary: '#1565C0',
  accent: '#42A5F5',
  success: '#27AE60',
  border: '#2E2E3F',
};

const TRIP_TYPES = [
  { key: 'ONE_WAY', label: 'Aller simple' },
  { key: 'ROUND_TRIP', label: 'Aller-retour' },
];

const PASSENGER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function formatDateDisplay(str) {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export default function EasyFlightHomeScreen({ navigation }) {
  const [tripType, setTripType] = useState('ONE_WAY');
  const [origin, setOrigin] = useState(null);
  const [dest, setDest] = useState(null);
  const [date, setDate] = useState(daysFromNow(7));
  const [returnDate, setReturnDate] = useState(daysFromNow(14));
  const [passengers, setPassengers] = useState(1);

  const [airportModal, setAirportModal] = useState(null); // 'origin' | 'dest' | null
  const [airportQuery, setAirportQuery] = useState('');
  const [airportResults, setAirportResults] = useState([]);
  const [loadingAirports, setLoadingAirports] = useState(false);

  const [dateModal, setDateModal] = useState(null); // 'departure' | 'return' | null
  const [passModal, setPassModal] = useState(false);

  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const searchAirports = useCallback(async (q) => {
    setAirportQuery(q);
    if (q.length < 2) { setAirportResults([]); return; }
    setLoadingAirports(true);
    try {
      const res = await api.get('/api/flights/airports', { params: { q } });
      setAirportResults(res.data.airports || []);
    } catch {
      setAirportResults([]);
    } finally {
      setLoadingAirports(false);
    }
  }, []);

  const pickAirport = useCallback((airport) => {
    if (airportModal === 'origin') setOrigin(airport);
    else setDest(airport);
    setAirportModal(null);
    setAirportQuery('');
    setAirportResults([]);
  }, [airportModal]);

  const swapAirports = () => {
    const tmp = origin;
    setOrigin(dest);
    setDest(tmp);
  };

  const handleSearch = async () => {
    setError('');
    if (!origin) { setError('Veuillez sélectionner l\'aéroport de départ.'); return; }
    if (!dest) { setError('Veuillez sélectionner l\'aéroport d\'arrivée.'); return; }
    if (!date) { setError('Veuillez choisir une date de départ.'); return; }
    if (tripType === 'ROUND_TRIP' && !returnDate) {
      setError('Veuillez choisir une date de retour.'); return;
    }
    setSearching(true);
    try {
      const params = {
        origin: origin.code, dest: dest.code, date, passengers, tripType,
        ...(tripType === 'ROUND_TRIP' ? { returnDate } : {}),
      };
      const res = await api.get('/api/flights/search', { params });
      navigation.navigate('FlightResults', {
        search: res.data.search,
        outbound: res.data.outbound,
        inbound: res.data.inbound,
        tripType,
        origin,
        dest,
      });
    } catch (e) {
      const msg = e?.response?.data?.error || 'Erreur de recherche. Vérifiez votre connexion.';
      setError(msg);
    } finally {
      setSearching(false);
    }
  };

  // Simple date picker with quick options
  const DATE_QUICK = [
    { label: 'Demain', value: daysFromNow(1) },
    { label: 'Dans 3j', value: daysFromNow(3) },
    { label: 'Dans 1 sem', value: daysFromNow(7) },
    { label: 'Dans 2 sem', value: daysFromNow(14) },
    { label: 'Dans 1 mois', value: daysFromNow(30) },
    { label: 'Dans 3 mois', value: daysFromNow(90) },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoEasy}>Easy</Text>
          <Text style={styles.logoFlight}>Flight</Text>
          <Text style={styles.tagline}>Comparez. Réservez. Décollez.</Text>
        </View>

        {/* Trip Type Tabs */}
        <View style={styles.tabs}>
          {TRIP_TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, tripType === t.key && styles.tabActive]}
              onPress={() => setTripType(t.key)}
            >
              <Text style={[styles.tabText, tripType === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Card */}
        <View style={styles.card}>

          {/* Origin */}
          <TouchableOpacity style={styles.fieldRow} onPress={() => setAirportModal('origin')}>
            <Text style={styles.fieldIcon}>✈️</Text>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Départ</Text>
              <Text style={origin ? styles.fieldValue : styles.fieldPlaceholder}>
                {origin ? `${origin.city} (${origin.code})` : 'Ville ou aéroport'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Swap */}
          <TouchableOpacity style={styles.swapBtn} onPress={swapAirports}>
            <Text style={styles.swapIcon}>⇅</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Destination */}
          <TouchableOpacity style={styles.fieldRow} onPress={() => setAirportModal('dest')}>
            <Text style={styles.fieldIcon}>🛬</Text>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Arrivée</Text>
              <Text style={dest ? styles.fieldValue : styles.fieldPlaceholder}>
                {dest ? `${dest.city} (${dest.code})` : 'Ville ou aéroport'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Dates row */}
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.fieldRow, styles.halfField]}
              onPress={() => setDateModal('departure')}
            >
              <Text style={styles.fieldIcon}>📅</Text>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Départ</Text>
                <Text style={styles.fieldValue}>{formatDateDisplay(date)}</Text>
              </View>
            </TouchableOpacity>

            {tripType === 'ROUND_TRIP' && (
              <TouchableOpacity
                style={[styles.fieldRow, styles.halfField]}
                onPress={() => setDateModal('return')}
              >
                <Text style={styles.fieldIcon}>📅</Text>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Retour</Text>
                  <Text style={styles.fieldValue}>{formatDateDisplay(returnDate)}</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.divider} />

          {/* Passengers */}
          <TouchableOpacity style={styles.fieldRow} onPress={() => setPassModal(true)}>
            <Text style={styles.fieldIcon}>👤</Text>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Passagers</Text>
              <Text style={styles.fieldValue}>
                {passengers} {passengers === 1 ? 'adulte' : 'adultes'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Search Button */}
        <TouchableOpacity
          style={[styles.searchBtn, searching && { opacity: 0.7 }]}
          onPress={handleSearch}
          disabled={searching}
        >
          <Text style={styles.searchBtnText}>
            {searching ? 'Recherche...' : '🔍  Rechercher des vols'}
          </Text>
        </TouchableOpacity>

        {/* North Africa Countries */}
        <Text style={styles.sectionTitle}>Vols depuis le Nord Afrique</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.destRow}>
          {[
            { country: 'Tunisie', flag: '🇹🇳', code: 'TUN', city: 'Tunis', color: '#C8102E' },
            { country: 'Algérie', flag: '🇩🇿', code: 'ALG', city: 'Alger', color: '#006B3F' },
            { country: 'Maroc', flag: '🇲🇦', code: 'CMN', city: 'Casablanca', color: '#006233' },
            { country: 'Libye', flag: '🇱🇾', code: 'TIP', city: 'Tripoli', color: '#005BAC' },
            { country: 'Mauritanie', flag: '🇲🇷', code: 'NKC', city: 'Nouakchott', color: '#006233' },
            { country: 'Égypte', flag: '🇪🇬', code: 'CAI', city: 'Le Caire', color: '#C8102E' },
          ].map((c) => (
            <TouchableOpacity
              key={c.code}
              style={[styles.countryCard, { borderColor: c.color + '55' }]}
              onPress={() => {
                setOrigin({ code: c.code, city: c.city, name: c.city, country: c.country, countryCode: c.code.slice(0, 2) });
              }}
            >
              <Text style={styles.destFlag}>{c.flag}</Text>
              <Text style={styles.destCity}>{c.country}</Text>
              <Text style={styles.destPrice}>{c.city}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Destinations */}
        <Text style={styles.sectionTitle}>Destinations populaires depuis Tunis</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.destRow}>
          {[
            { city: 'Paris', code: 'CDG', flag: '🇫🇷', price: '~450 TND' },
            { city: 'Istanbul', code: 'IST', flag: '🇹🇷', price: '~380 TND' },
            { city: 'Dubaï', code: 'DXB', flag: '🇦🇪', price: '~615 TND' },
            { city: 'Rome', code: 'FCO', flag: '🇮🇹', price: '~335 TND' },
            { city: 'Casablanca', code: 'CMN', flag: '🇲🇦', price: '~295 TND' },
            { city: 'Le Caire', code: 'CAI', flag: '🇪🇬', price: '~340 TND' },
            { city: 'Barcelone', code: 'BCN', flag: '🇪🇸', price: '~365 TND' },
            { city: 'Londres', code: 'LHR', flag: '🇬🇧', price: '~565 TND' },
          ].map((d) => (
            <TouchableOpacity
              key={d.code}
              style={styles.destCard}
              onPress={() => {
                setOrigin({ code: 'TUN', city: 'Tunis', name: 'Tunis-Carthage', country: 'Tunisie' });
                setDest({ code: d.code, city: d.city, name: d.city, country: '' });
              }}
            >
              <Text style={styles.destFlag}>{d.flag}</Text>
              <Text style={styles.destCity}>{d.city}</Text>
              <Text style={styles.destPrice}>{d.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Feature shortcuts */}
        <Text style={styles.sectionTitle}>Outils</Text>
        <View style={styles.toolsGrid}>
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => navigation.navigate('FlightInspire')}
          >
            <Text style={styles.toolIcon}>🌍</Text>
            <Text style={styles.toolTitle}>Inspire-moi</Text>
            <Text style={styles.toolSub}>Où partir avec mon budget ?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => {
              if (!origin || !dest) {
                setError('Choisissez d\'abord un départ et une destination.');
                return;
              }
              navigation.navigate('FlightPriceCalendar', { origin, dest, passengers });
            }}
          >
            <Text style={styles.toolIcon}>📅</Text>
            <Text style={styles.toolTitle}>Calendrier prix</Text>
            <Text style={styles.toolSub}>Jour le moins cher</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => navigation.navigate('FlightAlerts')}
          >
            <Text style={styles.toolIcon}>🔔</Text>
            <Text style={styles.toolTitle}>Mes alertes</Text>
            <Text style={styles.toolSub}>Notifié quand ça baisse</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => navigation.navigate('FlightBookings')}
          >
            <Text style={styles.toolIcon}>📋</Text>
            <Text style={styles.toolTitle}>Réservations</Text>
            <Text style={styles.toolSub}>Historique vols</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Airport Search Modal */}
      <Modal visible={!!airportModal} animationType="slide" onRequestClose={() => setAirportModal(null)}>
        <View style={styles.modal}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setAirportModal(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {airportModal === 'origin' ? 'Aéroport de départ' : 'Aéroport d\'arrivée'}
              </Text>
            </View>
            <TextInput
              style={styles.airportInput}
              placeholder="Ville, pays ou code IATA..."
              placeholderTextColor={COLORS.muted}
              value={airportQuery}
              onChangeText={searchAirports}
              autoFocus
            />
            {loadingAirports && <Text style={styles.loadingText}>Recherche...</Text>}
            <FlatList
              data={airportResults}
              keyExtractor={(i) => i.code}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.airportItem} onPress={() => pickAirport(item)}>
                  <Text style={styles.airportCode}>{item.code}</Text>
                  <View>
                    <Text style={styles.airportCity}>{item.city}, {item.country}</Text>
                    <Text style={styles.airportName}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                airportQuery.length >= 2 && !loadingAirports
                  ? <Text style={styles.noResults}>Aucun aéroport trouvé</Text>
                  : null
              }
            />
          </SafeAreaView>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal visible={!!dateModal} animationType="slide" transparent onRequestClose={() => setDateModal(null)}>
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetContent}>
            <Text style={styles.sheetTitle}>
              {dateModal === 'departure' ? 'Date de départ' : 'Date de retour'}
            </Text>
            {DATE_QUICK.map((q) => (
              <TouchableOpacity
                key={q.value}
                style={styles.quickDate}
                onPress={() => {
                  if (dateModal === 'departure') setDate(q.value);
                  else setReturnDate(q.value);
                  setDateModal(null);
                }}
              >
                <Text style={styles.quickDateLabel}>{q.label}</Text>
                <Text style={styles.quickDateValue}>{formatDateDisplay(q.value)}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.sheetCancel} onPress={() => setDateModal(null)}>
              <Text style={styles.sheetCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Passengers Modal */}
      <Modal visible={passModal} animationType="slide" transparent onRequestClose={() => setPassModal(false)}>
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetContent}>
            <Text style={styles.sheetTitle}>Nombre de passagers</Text>
            {PASSENGER_OPTIONS.map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.quickDate, passengers === n && styles.quickDateSelected]}
                onPress={() => { setPassengers(n); setPassModal(false); }}
              >
                <Text style={styles.quickDateLabel}>{n} {n === 1 ? 'adulte' : 'adultes'}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.sheetCancel} onPress={() => setPassModal(false)}>
              <Text style={styles.sheetCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  logoEasy: { fontSize: 32, fontWeight: '900', color: COLORS.accent, letterSpacing: 1 },
  logoFlight: { fontSize: 32, fontWeight: '900', color: COLORS.text, letterSpacing: 1, marginTop: -8 },
  tagline: { color: COLORS.muted, fontSize: 13, marginTop: 4 },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.muted, fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: COLORS.text },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 4, marginBottom: 12 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  fieldIcon: { fontSize: 20, marginRight: 12, width: 28, textAlign: 'center' },
  fieldContent: { flex: 1 },
  fieldLabel: { color: COLORS.muted, fontSize: 11, marginBottom: 2 },
  fieldValue: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  fieldPlaceholder: { color: COLORS.muted, fontSize: 16 },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 14 },
  row: { flexDirection: 'row' },
  halfField: { flex: 1 },
  swapBtn: {
    position: 'absolute', right: 20, top: 52,
    backgroundColor: COLORS.primary, borderRadius: 20, width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  swapIcon: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  error: { color: '#E74C3C', textAlign: 'center', marginBottom: 8, fontSize: 13 },
  searchBtn: {
    backgroundColor: COLORS.primary, borderRadius: 14, padding: 18,
    alignItems: 'center', marginBottom: 24,
  },
  searchBtnText: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  sectionTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  destRow: { marginBottom: 20 },
  countryCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginRight: 10, alignItems: 'center', minWidth: 90,
    borderWidth: 1,
  },
  destCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginRight: 10, alignItems: 'center', minWidth: 90,
  },
  destFlag: { fontSize: 28, marginBottom: 6 },
  destCity: { color: COLORS.text, fontWeight: '700', fontSize: 13 },
  destPrice: { color: COLORS.accent, fontSize: 11, marginTop: 2 },
  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  toolCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    width: '47.5%', borderWidth: 1, borderColor: COLORS.border,
  },
  toolIcon: { fontSize: 28, marginBottom: 8 },
  toolTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  toolSub: { color: COLORS.muted, fontSize: 11 },
  // Modal
  modal: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  modalClose: { color: COLORS.muted, fontSize: 20, padding: 4 },
  modalTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  airportInput: {
    backgroundColor: COLORS.surface, color: COLORS.text, fontSize: 16,
    padding: 14, margin: 16, borderRadius: 12,
  },
  airportItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 14,
  },
  airportCode: { color: COLORS.accent, fontSize: 18, fontWeight: '900', width: 44 },
  airportCity: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  airportName: { color: COLORS.muted, fontSize: 12 },
  noResults: { color: COLORS.muted, textAlign: 'center', marginTop: 40, fontSize: 14 },
  loadingText: { color: COLORS.muted, textAlign: 'center', marginVertical: 12 },
  // Bottom sheet
  bottomSheet: {
    flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)',
  },
  bottomSheetContent: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20,
  },
  sheetTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 16 },
  quickDate: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderRadius: 10, marginBottom: 6, backgroundColor: COLORS.card,
  },
  quickDateSelected: { backgroundColor: COLORS.primary },
  quickDateLabel: { color: COLORS.text, fontWeight: '600' },
  quickDateValue: { color: COLORS.muted, fontSize: 12 },
  sheetCancel: { padding: 14, alignItems: 'center', marginTop: 8 },
  sheetCancelText: { color: '#E74C3C', fontWeight: '700', fontSize: 15 },
});
