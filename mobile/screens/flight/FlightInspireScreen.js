import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  FlatList, TextInput, Modal, ActivityIndicator, Linking,
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
  warning: '#F5A623',
  border: '#2E2E3F',
};

const NORTH_AFRICA_AIRPORTS = [
  { code: 'TUN', city: 'Tunis', flag: '🇹🇳' },
  { code: 'ALG', city: 'Alger', flag: '🇩🇿' },
  { code: 'CMN', city: 'Casablanca', flag: '🇲🇦' },
  { code: 'CAI', city: 'Le Caire', flag: '🇪🇬' },
  { code: 'TIP', city: 'Tripoli', flag: '🇱🇾' },
  { code: 'NKC', city: 'Nouakchott', flag: '🇲🇷' },
  { code: 'DJE', city: 'Djerba', flag: '🇹🇳' },
  { code: 'MIR', city: 'Monastir', flag: '🇹🇳' },
  { code: 'ORN', city: 'Oran', flag: '🇩🇿' },
  { code: 'RAK', city: 'Marrakech', flag: '🇲🇦' },
];

const CONTINENT_FLAGS = {
  'France': '🇫🇷', 'Allemagne': '🇩🇪', 'Italie': '🇮🇹', 'Espagne': '🇪🇸',
  'Turquie': '🇹🇷', 'EAU': '🇦🇪', 'Pays-Bas': '🇳🇱', 'Royaume-Uni': '🇬🇧',
  'Portugal': '🇵🇹', 'Belgique': '🇧🇪', 'Tunisie': '🇹🇳', 'Algérie': '🇩🇿',
  'Maroc': '🇲🇦', 'Libye': '🇱🇾', 'Mauritanie': '🇲🇷', 'Égypte': '🇪🇬',
};

function daysFromNow(n) {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const DATE_OPTIONS = [
  { label: 'Dans 1 semaine', value: daysFromNow(7) },
  { label: 'Dans 2 semaines', value: daysFromNow(14) },
  { label: 'Dans 1 mois', value: daysFromNow(30) },
  { label: 'Dans 2 mois', value: daysFromNow(60) },
  { label: 'Dans 3 mois', value: daysFromNow(90) },
];

export default function FlightInspireScreen({ navigation }) {
  const [origin, setOrigin] = useState(NORTH_AFRICA_AIRPORTS[0]);
  const [date, setDate] = useState(daysFromNow(30));
  const [budget, setBudget] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [originModal, setOriginModal] = useState(false);
  const [dateModal, setDateModal] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(false);
    try {
      const res = await api.get('/api/flights/inspire', {
        params: {
          origin: origin.code,
          date,
          ...(budget ? { budget: parseFloat(budget) } : {}),
        },
      });
      setResults(res.data.destinations || []);
      setSearched(true);
    } catch {
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }) => {
    const flag = CONTINENT_FLAGS[item.destination?.country] || '✈️';
    const isTop3 = index < 3;

    return (
      <TouchableOpacity
        style={[styles.resultCard, isTop3 && styles.resultCardTop]}
        onPress={() => navigation.navigate('FlightResults', {
          search: { origin: origin.code, dest: item.destination.code, date, passengers: 1, tripType: 'ONE_WAY' },
          origin: { code: origin.code, city: origin.city, name: origin.city, country: '' },
          dest: item.destination,
          tripType: 'ONE_WAY',
        })}
      >
        {isTop3 && (
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{index + 1}</Text>
          </View>
        )}
        <View style={styles.resultLeft}>
          <Text style={styles.resultFlag}>{flag}</Text>
          <View>
            <Text style={styles.resultCity}>{item.destination?.city || item.destination?.code}</Text>
            <Text style={styles.resultCountry}>{item.destination?.country}</Text>
            <Text style={styles.resultMeta}>
              {item.airline?.name} · {item.duration}
              {item.stops === 0 ? ' · Direct' : ` · ${item.stops} escale`}
            </Text>
          </View>
        </View>
        <View style={styles.resultRight}>
          <Text style={styles.resultPrice}>{item.bestPrice}</Text>
          <Text style={styles.resultCurrency}>{item.currency}</Text>
          <Text style={styles.resultSeeBtn}>Voir →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Inspire-moi</Text>
          <Text style={styles.headerSub}>Où partir avec mon budget ?</Text>
        </View>
        <Text style={styles.headerEmoji}>🌍</Text>
      </View>

      <View style={styles.searchBox}>
        {/* Origin */}
        <TouchableOpacity style={styles.searchRow} onPress={() => setOriginModal(true)}>
          <Text style={styles.searchIcon}>✈️</Text>
          <View style={styles.searchField}>
            <Text style={styles.searchLabel}>Depuis</Text>
            <Text style={styles.searchValue}>{origin.flag} {origin.city} ({origin.code})</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Date */}
        <TouchableOpacity style={styles.searchRow} onPress={() => setDateModal(true)}>
          <Text style={styles.searchIcon}>📅</Text>
          <View style={styles.searchField}>
            <Text style={styles.searchLabel}>Quand</Text>
            <Text style={styles.searchValue}>
              {DATE_OPTIONS.find(d => d.value === date)?.label || date}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Budget */}
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>💰</Text>
          <View style={styles.searchField}>
            <Text style={styles.searchLabel}>Budget max (optionnel)</Text>
            <TextInput
              style={styles.budgetInput}
              value={budget}
              onChangeText={setBudget}
              placeholder="Ex: 500"
              placeholderTextColor={COLORS.muted}
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.goBtn, loading && { opacity: 0.7 }]}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.goBtnText}>🌍  Trouver mes destinations</Text>
          }
        </TouchableOpacity>
      </View>

      {searched && !loading && (
        <Text style={styles.resultsHeader}>
          {results.length > 0
            ? `${results.length} destination${results.length > 1 ? 's' : ''} disponible${results.length > 1 ? 's' : ''}`
            : 'Aucune destination trouvée'}
        </Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.destination?.code || item.flightId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading && !searched && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🗺️</Text>
              <Text style={styles.emptyTitle}>Laissez-vous surprendre</Text>
              <Text style={styles.emptyText}>
                Choisissez votre ville de départ, une date et un budget.{'\n'}
                On trouve les meilleures destinations pour vous.
              </Text>
            </View>
          )
        }
      />

      {/* Origin modal */}
      <Modal visible={originModal} animationType="slide" onRequestClose={() => setOriginModal(false)}>
        <View style={styles.modal}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setOriginModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Aéroport de départ</Text>
            </View>
            {NORTH_AFRICA_AIRPORTS.map((a) => (
              <TouchableOpacity
                key={a.code}
                style={[styles.airportItem, origin.code === a.code && styles.airportItemSelected]}
                onPress={() => { setOrigin(a); setOriginModal(false); }}
              >
                <Text style={styles.airportFlag}>{a.flag}</Text>
                <Text style={styles.airportCity}>{a.city}</Text>
                <Text style={styles.airportCode}>{a.code}</Text>
              </TouchableOpacity>
            ))}
          </SafeAreaView>
        </View>
      </Modal>

      {/* Date modal */}
      <Modal visible={dateModal} animationType="slide" transparent onRequestClose={() => setDateModal(false)}>
        <View style={styles.bottomSheet}>
          <View style={styles.bottomContent}>
            <Text style={styles.sheetTitle}>Quand voyagez-vous ?</Text>
            {DATE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.dateOption, date === opt.value && styles.dateOptionSelected]}
                onPress={() => { setDate(opt.value); setDateModal(false); }}
              >
                <Text style={[styles.dateOptionText, date === opt.value && { color: '#fff' }]}>
                  {opt.label}
                </Text>
                <Text style={[styles.dateOptionSub, date === opt.value && { color: 'rgba(255,255,255,0.7)' }]}>
                  {opt.value}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setDateModal(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4, marginRight: 12 },
  backIcon: { color: COLORS.accent, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  headerSub: { color: COLORS.muted, fontSize: 12 },
  headerEmoji: { fontSize: 28, marginLeft: 'auto' },
  searchBox: { margin: 16, backgroundColor: COLORS.surface, borderRadius: 16, overflow: 'hidden' },
  searchRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  searchIcon: { fontSize: 18, width: 28 },
  searchField: { flex: 1 },
  searchLabel: { color: COLORS.muted, fontSize: 11, marginBottom: 2 },
  searchValue: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  chevron: { color: COLORS.muted, fontSize: 20 },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 14 },
  budgetInput: { color: COLORS.text, fontSize: 15, fontWeight: '600', padding: 0 },
  goBtn: { backgroundColor: COLORS.primary, margin: 12, borderRadius: 12, padding: 16, alignItems: 'center' },
  goBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  resultsHeader: { color: COLORS.muted, fontSize: 12, paddingHorizontal: 16, paddingBottom: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  resultCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  resultCardTop: { borderColor: COLORS.accent + '44', backgroundColor: COLORS.card },
  rankBadge: {
    position: 'absolute', top: -1, left: -1,
    backgroundColor: COLORS.accent, borderTopLeftRadius: 13, borderBottomRightRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  rankText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  resultLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  resultFlag: { fontSize: 32 },
  resultCity: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  resultCountry: { color: COLORS.muted, fontSize: 12 },
  resultMeta: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  resultRight: { alignItems: 'flex-end' },
  resultPrice: { color: COLORS.accent, fontSize: 22, fontWeight: '900' },
  resultCurrency: { color: COLORS.muted, fontSize: 11 },
  resultSeeBtn: { color: COLORS.primary, fontSize: 13, fontWeight: '700', marginTop: 4 },
  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { color: COLORS.text, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: COLORS.muted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  // Modal
  modal: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalClose: { color: COLORS.muted, fontSize: 20 },
  modalTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  airportItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  airportItemSelected: { backgroundColor: COLORS.primary + '22' },
  airportFlag: { fontSize: 24 },
  airportCity: { flex: 1, color: COLORS.text, fontSize: 16, fontWeight: '600' },
  airportCode: { color: COLORS.accent, fontSize: 16, fontWeight: '900' },
  // Bottom sheet
  bottomSheet: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  bottomContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  sheetTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 16 },
  dateOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderRadius: 10, marginBottom: 6, backgroundColor: COLORS.card },
  dateOptionSelected: { backgroundColor: COLORS.primary },
  dateOptionText: { color: COLORS.text, fontWeight: '600' },
  dateOptionSub: { color: COLORS.muted, fontSize: 12 },
  cancelBtn: { padding: 14, alignItems: 'center', marginTop: 4 },
  cancelBtnText: { color: '#E74C3C', fontWeight: '700' },
});
