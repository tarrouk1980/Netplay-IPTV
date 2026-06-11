import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Modal, FlatList, StatusBar, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { flightAPI, ferryAPI } from '../services/api';

const MODES = [
  { key: 'FLIGHT', label: '✈ Vols', color: COLORS.primary },
  { key: 'FERRY',  label: '⛴ Ferries', color: COLORS.ferry },
];

const TRIP_TYPES = [
  { key: 'ONE_WAY',    label: 'Aller simple' },
  { key: 'ROUND_TRIP', label: 'Aller-retour' },
];

const POPULAR_ROUTES = [
  { from: 'MAD', to: 'CMN', label: 'Madrid → Casablanca', flag: '🇲🇦', price: '45€' },
  { from: 'BCN', to: 'ALG', label: 'Barcelone → Alger',   flag: '🇩🇿', price: '58€' },
  { from: 'VLC', to: 'TUN', label: 'Valence → Tunis',     flag: '🇹🇳', price: '62€' },
  { from: 'MAD', to: 'RAK', label: 'Madrid → Marrakech',  flag: '🇲🇦', price: '38€' },
  { from: 'BCN', to: 'TUN', label: 'Barcelone → Tunis',   flag: '🇹🇳', price: '54€' },
  { from: 'AGP', to: 'CMN', label: 'Málaga → Casablanca', flag: '🇲🇦', price: '41€' },
];

const POPULAR_FERRY_ROUTES = [
  { from: 'ALG_ES', to: 'TNG_PORT', label: 'Algésiras → Tanger', flag: '🇲🇦', price: '28€', time: '35min' },
  { from: 'ALM_PORT', to: 'NDR_PORT', label: 'Almería → Nador', flag: '🇲🇦', price: '55€', time: '7h' },
  { from: 'BCN_PORT', to: 'NDR_PORT', label: 'Barcelone → Nador', flag: '🇲🇦', price: '98€', time: '20h' },
  { from: 'ALM_PORT', to: 'ORN_PORT', label: 'Almería → Oran', flag: '🇩🇿', price: '68€', time: '8h' },
  { from: 'MRS_PORT', to: 'ALG_PORT', label: 'Marseille → Alger', flag: '🇩🇿', price: '112€', time: '22h' },
  { from: 'GEN_PORT', to: 'TUNIS_P', label: 'Gênes → Tunis', flag: '🇹🇳', price: '88€', time: '21h' },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}
function tomorrow() {
  const d = new Date(); d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export default function HomeScreen({ navigation }) {
  const [mode, setMode] = useState('FLIGHT');
  const [tripType, setTripType] = useState('ONE_WAY');
  const [origin, setOrigin] = useState(null);
  const [dest, setDest] = useState(null);
  const [date, setDate] = useState(today());
  const [returnDate, setReturnDate] = useState(tomorrow());
  const [passengers, setPassengers] = useState(1);
  const [loading, setLoading] = useState(false);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState(null); // 'origin' | 'dest'
  const [pickerQuery, setPickerQuery] = useState('');
  const [pickerResults, setPickerResults] = useState([]);

  const modeAnim = useRef(new Animated.Value(0)).current;

  const switchMode = (m) => {
    setMode(m);
    setOrigin(null);
    setDest(null);
    Animated.spring(modeAnim, {
      toValue: m === 'FLIGHT' ? 0 : 1,
      useNativeDriver: false,
    }).start();
  };

  const openPicker = (target) => {
    setPickerTarget(target);
    setPickerQuery('');
    setPickerResults([]);
    setPickerVisible(true);
    loadPickerResults('');
  };

  const loadPickerResults = async (q) => {
    try {
      if (mode === 'FLIGHT') {
        const res = await flightAPI.airports(q);
        setPickerResults(res.data.airports || []);
      } else {
        const res = await ferryAPI.ports(q);
        setPickerResults(res.data.ports || []);
      }
    } catch {
      // Use fallback data
      if (mode === 'FLIGHT') {
        setPickerResults(FALLBACK_AIRPORTS.filter(a =>
          !q || a.city.toLowerCase().includes(q.toLowerCase()) || a.code.toLowerCase().includes(q.toLowerCase())
        ));
      } else {
        setPickerResults(FALLBACK_PORTS.filter(p =>
          !q || p.city.toLowerCase().includes(q.toLowerCase()) || p.code.toLowerCase().includes(q.toLowerCase())
        ));
      }
    }
  };

  const selectPlace = (place) => {
    if (pickerTarget === 'origin') setOrigin(place);
    else setDest(place);
    setPickerVisible(false);
  };

  const swapPlaces = () => {
    const tmp = origin;
    setOrigin(dest);
    setDest(tmp);
  };

  const handleSearch = async () => {
    if (!origin || !dest) return;
    setLoading(true);
    try {
      if (mode === 'FLIGHT') {
        const res = await flightAPI.search({
          origin: origin.code,
          dest: dest.code,
          date,
          returnDate: tripType === 'ROUND_TRIP' ? returnDate : undefined,
          passengers,
          tripType,
        });
        navigation.navigate('FlightResults', {
          outbound: res.data.outbound,
          inbound: res.data.inbound,
          search: { date, returnDate, passengers },
          origin, dest, tripType,
        });
      } else {
        const res = await ferryAPI.search({
          originPort: origin.code,
          destPort: dest.code,
          date,
          passengers,
        });
        navigation.navigate('FerryResults', {
          ferries: res.data.ferries,
          search: { date, passengers },
          origin, dest,
        });
      }
    } catch {
      // Navigate with empty data for demo
      if (mode === 'FLIGHT') {
        navigation.navigate('FlightResults', {
          outbound: [], inbound: [],
          search: { date, returnDate, passengers },
          origin, dest, tripType,
        });
      } else {
        navigation.navigate('FerryResults', {
          ferries: [],
          search: { date, passengers },
          origin, dest,
        });
      }
    }
    setLoading(false);
  };

  const isSearchReady = origin && dest;
  const popularRoutes = mode === 'FLIGHT' ? POPULAR_ROUTES : POPULAR_FERRY_ROUTES;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.logo}>EasyTravel</Text>
            <Text style={s.tagline}>Espagne ↔ Maghreb · Vols & Ferries</Text>
          </View>
          <View style={s.headerActions}>
            <TouchableOpacity style={s.iconBtn} onPress={() => navigation.navigate('Inspire')}>
              <Text style={s.iconBtnText}>✨</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn} onPress={() => navigation.navigate('Alerts')}>
              <Text style={s.iconBtnText}>🔔</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mode selector */}
        <View style={s.modeSwitcher}>
          {MODES.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[s.modeBtn, mode === m.key && { backgroundColor: m.color }]}
              onPress={() => switchMode(m.key)}
            >
              <Text style={[s.modeBtnText, mode === m.key && s.modeBtnTextActive]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search card */}
        <View style={s.searchCard}>
          {/* Trip type (flights only) */}
          {mode === 'FLIGHT' && (
            <View style={s.tripTypeRow}>
              {TRIP_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[s.tripTypeBtn, tripType === t.key && s.tripTypeBtnActive]}
                  onPress={() => setTripType(t.key)}
                >
                  <Text style={[s.tripTypeTxt, tripType === t.key && s.tripTypeTxtActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Origin / Dest */}
          <View style={s.routeRow}>
            <TouchableOpacity style={s.placeBtn} onPress={() => openPicker('origin')}>
              <Text style={s.placeBtnLabel}>{mode === 'FLIGHT' ? 'Départ' : 'Port départ'}</Text>
              <Text style={s.placeBtnValue} numberOfLines={1}>
                {origin ? `${origin.code} · ${origin.city}` : 'Choisir…'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.swapBtn} onPress={swapPlaces}>
              <Text style={s.swapIcon}>⇄</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.placeBtn} onPress={() => openPicker('dest')}>
              <Text style={s.placeBtnLabel}>{mode === 'FLIGHT' ? 'Arrivée' : 'Port arrivée'}</Text>
              <Text style={s.placeBtnValue} numberOfLines={1}>
                {dest ? `${dest.code} · ${dest.city}` : 'Choisir…'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date row */}
          <View style={s.dateRow}>
            <View style={s.dateField}>
              <Text style={s.dateLabel}>Date départ</Text>
              <TextInput
                style={s.dateInput}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.subtle}
              />
            </View>
            {mode === 'FLIGHT' && tripType === 'ROUND_TRIP' && (
              <View style={s.dateField}>
                <Text style={s.dateLabel}>Retour</Text>
                <TextInput
                  style={s.dateInput}
                  value={returnDate}
                  onChangeText={setReturnDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={COLORS.subtle}
                />
              </View>
            )}
          </View>

          {/* Passengers row */}
          <View style={s.paxRow}>
            <Text style={s.paxLabel}>Passagers</Text>
            <View style={s.paxControl}>
              <TouchableOpacity
                style={s.paxBtn}
                onPress={() => setPassengers(Math.max(1, passengers - 1))}
              >
                <Text style={s.paxBtnTxt}>−</Text>
              </TouchableOpacity>
              <Text style={s.paxCount}>{passengers}</Text>
              <TouchableOpacity
                style={s.paxBtn}
                onPress={() => setPassengers(Math.min(9, passengers + 1))}
              >
                <Text style={s.paxBtnTxt}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search button */}
          <TouchableOpacity
            style={[s.searchBtn, !isSearchReady && s.searchBtnDisabled,
              mode === 'FERRY' && s.searchBtnFerry]}
            onPress={handleSearch}
            disabled={!isSearchReady || loading}
          >
            <Text style={s.searchBtnTxt}>
              {loading ? 'Recherche…' : mode === 'FLIGHT' ? '✈  Rechercher des vols' : '⛴  Rechercher des ferries'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tools row */}
        <View style={s.toolsRow}>
          <TouchableOpacity
            style={s.toolCard}
            onPress={() => navigation.navigate('Calendar')}
          >
            <Text style={s.toolIcon}>📅</Text>
            <Text style={s.toolLabel}>Calendrier{'\n'}des prix</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.toolCard}
            onPress={() => navigation.navigate('Inspire')}
          >
            <Text style={s.toolIcon}>✨</Text>
            <Text style={s.toolLabel}>Inspire{'\n'}moi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.toolCard}
            onPress={() => navigation.navigate('Alerts')}
          >
            <Text style={s.toolIcon}>🔔</Text>
            <Text style={s.toolLabel}>Alertes{'\n'}prix</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.toolCard}
            onPress={() => navigation.navigate('Bookmarks')}
          >
            <Text style={s.toolIcon}>⭐</Text>
            <Text style={s.toolLabel}>Mes{'\n'}favoris</Text>
          </TouchableOpacity>
        </View>

        {/* Popular routes */}
        <Text style={s.sectionTitle}>
          {mode === 'FLIGHT' ? '🔥 Routes populaires' : '⚓ Liaisons maritimes'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.routeScroll}>
          {popularRoutes.map((r, i) => (
            <TouchableOpacity
              key={i}
              style={s.routeChip}
              onPress={() => {
                /* quick-fill search form */
              }}
            >
              <Text style={s.routeFlag}>{r.flag}</Text>
              <Text style={s.routeLabel}>{r.label}</Text>
              <Text style={s.routePrice}>
                dès {r.price}{r.time ? ` · ${r.time}` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Spain↔Maghreb promo banner */}
        <View style={s.promoBanner}>
          <Text style={s.promoIcon}>🇪🇸 ↔ 🌍</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.promoTitle}>Diaspora Maghreb en Espagne</Text>
            <Text style={s.promoSub}>
              Comparez 30+ compagnies · Ryanair, Vueling, Iberia, Balearia…
            </Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Airport/Port picker modal */}
      <Modal visible={pickerVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modal}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>
              {mode === 'FLIGHT'
                ? pickerTarget === 'origin' ? 'Aéroport de départ' : 'Aéroport d\'arrivée'
                : pickerTarget === 'origin' ? 'Port de départ' : 'Port d\'arrivée'}
            </Text>
            <TouchableOpacity onPress={() => setPickerVisible(false)}>
              <Text style={s.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={s.modalSearch}
            placeholder="Ville, aéroport, port…"
            placeholderTextColor={COLORS.muted}
            value={pickerQuery}
            onChangeText={(t) => { setPickerQuery(t); loadPickerResults(t); }}
            autoFocus
          />

          <FlatList
            data={pickerResults}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.pickerItem} onPress={() => selectPlace(item)}>
                <View style={s.pickerItemCode}>
                  <Text style={s.pickerCode}>{item.code}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.pickerCity}>{item.city}</Text>
                  <Text style={s.pickerName} numberOfLines={1}>{item.name}</Text>
                </View>
                <Text style={s.pickerCountry}>{item.country}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={s.separator} />}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Fallback data if API is unavailable
const FALLBACK_AIRPORTS = [
  { code: 'MAD', city: 'Madrid',     name: 'Adolfo Suárez Barajas',    country: 'Espagne',   countryCode: 'ES' },
  { code: 'BCN', city: 'Barcelone',  name: 'El Prat',                  country: 'Espagne',   countryCode: 'ES' },
  { code: 'VLC', city: 'Valence',    name: 'Manises',                  country: 'Espagne',   countryCode: 'ES' },
  { code: 'AGP', city: 'Málaga',     name: 'Costa del Sol',            country: 'Espagne',   countryCode: 'ES' },
  { code: 'SVQ', city: 'Séville',    name: 'San Pablo',                country: 'Espagne',   countryCode: 'ES' },
  { code: 'PMI', city: 'Palma',      name: 'Son Sant Joan',            country: 'Espagne',   countryCode: 'ES' },
  { code: 'CMN', city: 'Casablanca', name: 'Mohammed V',               country: 'Maroc',     countryCode: 'MA' },
  { code: 'RAK', city: 'Marrakech',  name: 'Menara',                   country: 'Maroc',     countryCode: 'MA' },
  { code: 'TNG', city: 'Tanger',     name: 'Ibn Batouta',              country: 'Maroc',     countryCode: 'MA' },
  { code: 'FEZ', city: 'Fès',        name: 'Saïss',                    country: 'Maroc',     countryCode: 'MA' },
  { code: 'NDR', city: 'Nador',      name: 'El Aroui',                 country: 'Maroc',     countryCode: 'MA' },
  { code: 'ALG', city: 'Alger',      name: 'Houari Boumediene',        country: 'Algérie',   countryCode: 'DZ' },
  { code: 'ORN', city: 'Oran',       name: 'Ahmed Ben Bella',          country: 'Algérie',   countryCode: 'DZ' },
  { code: 'TUN', city: 'Tunis',      name: 'Carthage',                 country: 'Tunisie',   countryCode: 'TN' },
  { code: 'DJE', city: 'Djerba',     name: 'Djerba-Zarzis',            country: 'Tunisie',   countryCode: 'TN' },
];

const FALLBACK_PORTS = [
  { code: 'ALG_ES',   city: 'Algésiras',  name: 'Port Algésiras',      country: 'Espagne',  countryCode: 'ES' },
  { code: 'TARIFA',   city: 'Tarifa',     name: 'Port Tarifa',         country: 'Espagne',  countryCode: 'ES' },
  { code: 'BCN_PORT', city: 'Barcelone',  name: 'Port Barcelone',      country: 'Espagne',  countryCode: 'ES' },
  { code: 'ALM_PORT', city: 'Almería',    name: 'Port Almería',        country: 'Espagne',  countryCode: 'ES' },
  { code: 'VLC_PORT', city: 'Valence',    name: 'Port Valence',        country: 'Espagne',  countryCode: 'ES' },
  { code: 'MRS_PORT', city: 'Marseille',  name: 'Port Marseille',      country: 'France',   countryCode: 'FR' },
  { code: 'GEN_PORT', city: 'Gênes',      name: 'Port Gênes',          country: 'Italie',   countryCode: 'IT' },
  { code: 'TNG_PORT', city: 'Tanger',     name: 'Tanger Med',          country: 'Maroc',    countryCode: 'MA' },
  { code: 'TNG_VILLE',city: 'Tanger',     name: 'Tanger Ville',        country: 'Maroc',    countryCode: 'MA' },
  { code: 'NDR_PORT', city: 'Nador',      name: 'Port Nador',          country: 'Maroc',    countryCode: 'MA' },
  { code: 'ALG_PORT', city: 'Alger',      name: 'Port Alger',          country: 'Algérie',  countryCode: 'DZ' },
  { code: 'ORN_PORT', city: 'Oran',       name: 'Port Oran',           country: 'Algérie',  countryCode: 'DZ' },
  { code: 'TUNIS_P',  city: 'Tunis',      name: 'Port La Goulette',    country: 'Tunisie',  countryCode: 'TN' },
];

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.bg },
  scroll:     { paddingBottom: 20 },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  logo:       { color: COLORS.text, fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  tagline:    { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn:    { backgroundColor: COLORS.surface, borderRadius: 12, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  iconBtnText:{ fontSize: 18 },
  modeSwitcher: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 14, backgroundColor: COLORS.surface, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: COLORS.border },
  modeBtn:    { flex: 1, borderRadius: 11, paddingVertical: 10, alignItems: 'center' },
  modeBtnText:{ color: COLORS.muted, fontSize: 15, fontWeight: '700' },
  modeBtnTextActive: { color: '#fff' },
  searchCard: { marginHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  tripTypeRow:{ flexDirection: 'row', marginBottom: 14, gap: 8 },
  tripTypeBtn:{ flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  tripTypeBtnActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}22` },
  tripTypeTxt:{ color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tripTypeTxtActive: { color: COLORS.primary },
  routeRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  placeBtn:   { flex: 1, backgroundColor: COLORS.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  placeBtnLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  placeBtnValue: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  swapBtn:    { width: 36, height: 36, backgroundColor: COLORS.elevated, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginHorizontal: 8, borderWidth: 1, borderColor: COLORS.border },
  swapIcon:   { color: COLORS.accent, fontSize: 18, fontWeight: '700' },
  dateRow:    { flexDirection: 'row', gap: 10, marginBottom: 14 },
  dateField:  { flex: 1, backgroundColor: COLORS.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  dateLabel:  { color: COLORS.muted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  dateInput:  { color: COLORS.text, fontSize: 15, fontWeight: '600', padding: 0 },
  paxRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, backgroundColor: COLORS.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  paxLabel:   { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  paxControl: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  paxBtn:     { width: 32, height: 32, backgroundColor: COLORS.elevated, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  paxBtnTxt:  { color: COLORS.accent, fontSize: 20, fontWeight: '700', lineHeight: 24 },
  paxCount:   { color: COLORS.text, fontSize: 18, fontWeight: '800', minWidth: 20, textAlign: 'center' },
  searchBtn:  { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  searchBtnFerry: { backgroundColor: COLORS.ferry },
  searchBtnDisabled: { opacity: 0.4 },
  searchBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  toolsRow:   { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 22 },
  toolCard:   { flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  toolIcon:   { fontSize: 22, marginBottom: 6 },
  toolLabel:  { color: COLORS.muted, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800', paddingHorizontal: 20, marginBottom: 12 },
  routeScroll:{ paddingLeft: 16, marginBottom: 20 },
  routeChip:  { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginRight: 10, minWidth: 160, borderWidth: 1, borderColor: COLORS.border },
  routeFlag:  { fontSize: 22, marginBottom: 6 },
  routeLabel: { color: COLORS.text, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  routePrice: { color: COLORS.accent, fontSize: 12, fontWeight: '600' },
  promoBanner:{ marginHorizontal: 16, backgroundColor: COLORS.card, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  promoIcon:  { fontSize: 28 },
  promoTitle: { color: COLORS.text, fontSize: 14, fontWeight: '800', marginBottom: 4 },
  promoSub:   { color: COLORS.muted, fontSize: 12 },
  // Modal
  modal:      { flex: 1, backgroundColor: COLORS.bg },
  modalHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  modalClose: { color: COLORS.muted, fontSize: 18, padding: 4 },
  modalSearch:{ margin: 16, backgroundColor: COLORS.surface, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, color: COLORS.text, fontSize: 15, borderWidth: 1, borderColor: COLORS.border },
  pickerItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  pickerItemCode: { backgroundColor: COLORS.primary, borderRadius: 8, width: 46, height: 34, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  pickerCode: { color: '#fff', fontSize: 12, fontWeight: '900' },
  pickerCity: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  pickerName: { color: COLORS.muted, fontSize: 12 },
  pickerCountry: { color: COLORS.subtle, fontSize: 12 },
  separator:  { height: 1, backgroundColor: COLORS.divider, marginLeft: 74 },
});
