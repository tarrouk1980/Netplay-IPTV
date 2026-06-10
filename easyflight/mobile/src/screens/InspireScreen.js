import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { flightAPI } from '../services/api';

const ORIGINS_ES = [
  { code: 'MAD', city: 'Madrid',     flag: '🏙' },
  { code: 'BCN', city: 'Barcelone',  flag: '🏖' },
  { code: 'VLC', city: 'Valence',    flag: '🌅' },
  { code: 'AGP', city: 'Málaga',     flag: '☀️' },
  { code: 'SVQ', city: 'Séville',    flag: '💃' },
];

const DEST_INFO = {
  CMN: { emoji: '🕌', vibe: 'Culture & histoire' },
  RAK: { emoji: '🏮', vibe: 'Marchés & medina' },
  TNG: { emoji: '⛵', vibe: 'Côte atlantique' },
  AGA: { emoji: '🏄', vibe: 'Plages & surf' },
  FEZ: { emoji: '🏛', vibe: 'Cité impériale' },
  ALG: { emoji: '🌆', vibe: 'Casbah & mer' },
  ORN: { emoji: '🎭', vibe: 'La Belle de l\'Ouest' },
  TUN: { emoji: '🏺', vibe: 'Carthage & mer' },
  DJE: { emoji: '🌴', vibe: 'Île & plages' },
  NDR: { emoji: '🐠', vibe: 'Mer & nature' },
  CAI: { emoji: '🔺', vibe: 'Pyramides & nil' },
};

export default function InspireScreen({ navigation }) {
  const [origin, setOrigin] = useState(ORIGINS_ES[0]);
  const [date, setDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [maxBudget, setMaxBudget] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { search(); }, [origin]);

  const search = async () => {
    setLoading(true);
    try {
      const res = await flightAPI.inspire({
        origin: origin.code, date, budget: maxBudget || undefined,
      });
      setResults(res.data.destinations || []);
    } catch {
      setResults(FAKE_INSPIRE);
    }
    setLoading(false);
  };

  const renderItem = ({ item, index }) => {
    const info = DEST_INFO[item.code] || { emoji: '✈', vibe: 'Destination exotique' };
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;

    return (
      <TouchableOpacity
        style={[s.destCard, index === 0 && s.destCardFirst]}
        onPress={() => navigation.navigate('FlightResults', {
          outbound: [], inbound: [],
          search: { date, passengers: 1 },
          origin, dest: { code: item.code, city: item.city, country: item.country },
          tripType: 'ONE_WAY',
        })}
      >
        <View style={s.destRank}>
          {medal ? (
            <Text style={s.medal}>{medal}</Text>
          ) : (
            <Text style={s.rankNum}>#{index + 1}</Text>
          )}
        </View>

        <View style={s.destEmoji}>
          <Text style={{ fontSize: 32 }}>{info.emoji}</Text>
        </View>

        <View style={s.destInfo}>
          <Text style={s.destCity}>{item.city}</Text>
          <Text style={s.destCountry}>{item.country}</Text>
          <Text style={s.destVibe}>{info.vibe}</Text>
        </View>

        <View style={s.destPrice}>
          <Text style={s.priceFrom}>dès</Text>
          <Text style={s.priceAmt}>{Math.round(item.price)}€</Text>
          <Text style={s.priceDur}>{item.duration}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>✨ Inspirez-moi</Text>
      </View>

      {/* Origin picker */}
      <View style={s.originRow}>
        {ORIGINS_ES.map((o) => (
          <TouchableOpacity
            key={o.code}
            style={[s.originChip, origin.code === o.code && s.originChipActive]}
            onPress={() => setOrigin(o)}
          >
            <Text style={s.originFlag}>{o.flag}</Text>
            <Text style={[s.originCity, origin.code === o.code && s.originCityActive]}>
              {o.city}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.subtitle}>
        Depuis <Text style={{ color: COLORS.primary }}>{origin.city}</Text>, où partir au meilleur prix ?
      </Text>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.code}
          contentContainerStyle={s.list}
          renderItem={renderItem}
          ListHeaderComponent={
            results.length > 0 && (
              <Text style={s.listHeader}>
                {results.length} destinations trouvées · tarifs indicatifs
              </Text>
            )
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={{ fontSize: 52, marginBottom: 16 }}>🌍</Text>
              <Text style={s.emptyTitle}>Aucune destination</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const FAKE_INSPIRE = [
  { code: 'CMN', city: 'Casablanca', country: 'Maroc', price: 38, duration: '2h' },
  { code: 'RAK', city: 'Marrakech', country: 'Maroc', price: 42, duration: '2h15' },
  { code: 'TNG', city: 'Tanger', country: 'Maroc', price: 35, duration: '1h45' },
  { code: 'ALG', city: 'Alger', country: 'Algérie', price: 58, duration: '2h' },
  { code: 'TUN', city: 'Tunis', country: 'Tunisie', price: 62, duration: '2h30' },
  { code: 'NDR', city: 'Nador', country: 'Maroc', price: 45, duration: '2h' },
  { code: 'FEZ', city: 'Fès', country: 'Maroc', price: 48, duration: '2h15' },
  { code: 'DJE', city: 'Djerba', country: 'Tunisie', price: 74, duration: '2h45' },
];

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.bg },
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn:    { marginRight: 12, padding: 4 },
  backIcon:   { color: COLORS.accent, fontSize: 22 },
  headerTitle:{ color: COLORS.text, fontSize: 17, fontWeight: '800' },
  originRow:  { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  originChip: { backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  originChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  originFlag: { fontSize: 16, marginBottom: 2 },
  originCity: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  originCityActive: { color: '#fff' },
  subtitle:   { color: COLORS.muted, fontSize: 13, paddingHorizontal: 16, paddingVertical: 10 },
  list:       { paddingHorizontal: 16, paddingBottom: 32 },
  listHeader: { color: COLORS.subtle, fontSize: 12, marginBottom: 12 },
  destCard:   { backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  destCardFirst: { borderColor: COLORS.primary, borderWidth: 2 },
  destRank:   { width: 32, alignItems: 'center', marginRight: 4 },
  medal:      { fontSize: 20 },
  rankNum:    { color: COLORS.subtle, fontSize: 14, fontWeight: '700' },
  destEmoji:  { width: 52, height: 52, backgroundColor: COLORS.card, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  destInfo:   { flex: 1 },
  destCity:   { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  destCountry:{ color: COLORS.muted, fontSize: 12 },
  destVibe:   { color: COLORS.subtle, fontSize: 11, marginTop: 2 },
  destPrice:  { alignItems: 'flex-end' },
  priceFrom:  { color: COLORS.muted, fontSize: 11 },
  priceAmt:   { color: COLORS.accent, fontSize: 22, fontWeight: '900' },
  priceDur:   { color: COLORS.subtle, fontSize: 11 },
  empty:      { alignItems: 'center', marginTop: 80 },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
});
