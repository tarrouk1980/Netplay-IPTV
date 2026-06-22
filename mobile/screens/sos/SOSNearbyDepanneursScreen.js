import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { getCurrentLocationWithAddress } from '../../utils/locationUtils';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  accent: '#D32F2F',
  green: '#27AE60',
  orange: '#F57C00',
};

function Stars({ rating }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={{ fontSize: 10, color: i <= Math.round(rating) ? '#FFD700' : COLORS.border }}>★</Text>
      ))}
    </View>
  );
}

export default function SOSNearbyDepanneursScreen({ navigation, route }) {
  const problemType = route?.params?.problemType;
  const [depanneurs, setDepanneurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [error, setError] = useState(false);

  const load = useCallback(async (silent = false) => {
    try {
      const loc = await getCurrentLocationWithAddress();
      const res = await api.get('/api/sos/nearby', { params: { lat: loc?.coords?.lat, lng: loc?.coords?.lng } });
      const list = (res.data?.depanneurs || []).map((d) => ({
        id: d.id,
        name: d.name,
        phone: d.phone,
        rating: d.avgRating || 0,
        distanceKm: d.distanceKm != null ? Math.round(d.distanceKm * 10) / 10 : 0,
      }));
      setDepanneurs(list);
      setError(false);
    } catch {
      setError(true);
      if (!silent) setDepanneurs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [problemType]);

  useEffect(() => { load(); }, [load]);

  const sorted = [...depanneurs].sort((a, b) => {
    if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  const handleBook = (dep) => {
    navigation.navigate('SOSRequest', { depanneurId: dep.id, depanneurName: dep.name });
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Impossible d\'appeler'));
  };

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.accent} size="large" /></View>;

  if (error && depanneurs.length === 0) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.centered}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, fontSize: 14, textAlign: 'center', marginBottom: 16, paddingHorizontal: 30 }}>
            Impossible de récupérer les dépanneurs proches. Vérifiez votre connexion.
          </Text>
          <TouchableOpacity onPress={() => { setLoading(true); load(); }} style={{ backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
            <Text style={{ color: '#FFF', fontWeight: '700' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>🛻 Dépanneurs proches</Text>
          <Text style={s.sub}>{sorted.length} disponible{sorted.length !== 1 ? 's' : ''}</Text>
        </View>
        <View style={[s.onlineBadge]}>
          <View style={s.onlineDot} />
          <Text style={s.onlineTxt}>En direct</Text>
        </View>
      </View>

      {/* Sort tabs */}
      <View style={s.sortRow}>
        {[
          { key: 'distance', label: '📍 Distance' },
          { key: 'rating', label: '⭐ Note' },
        ].map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[s.sortTab, sortBy === opt.key && s.sortTabActive]}
            onPress={() => setSortBy(opt.key)}
          >
            <Text style={[s.sortTxt, sortBy === opt.key && s.sortTxtActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={COLORS.accent} />
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardTop}>
              <View style={s.avatar}>
                <Text style={{ fontSize: 22 }}>🛻</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <View style={s.onlineChip}>
                    <Text style={s.onlineChipTxt}>● En ligne</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <Stars rating={item.rating} />
                  <Text style={s.ratingTxt}>{item.rating ? item.rating.toFixed(1) : '—'}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[s.distance, { color: item.distanceKm < 2 ? COLORS.green : COLORS.orange }]}>
                  {item.distanceKm} km
                </Text>
              </View>
            </View>

            <View style={s.bottomRow}>
              <View />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={s.callBtn} onPress={() => handleCall(item.phone)}>
                  <Text style={s.callBtnTxt}>📞</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.bookBtn} onPress={() => handleBook(item)}>
                  <Text style={s.bookBtnTxt}>Appeler à l'aide</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🛻</Text>
            <Text style={s.emptyTitle}>Aucun dépanneur disponible</Text>
            <Text style={s.emptySub}>Tous les dépanneurs sont occupés. Réessayez dans quelques minutes.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  sub: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.green + '22', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.green },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.green },
  onlineTxt: { color: COLORS.green, fontSize: 10, fontWeight: '700' },
  sortRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  sortTab: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  sortTabActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '22' },
  sortTxt: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  sortTxtActive: { color: COLORS.accent },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 10, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.accent + '22', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.accent + '44' },
  name: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  onlineChip: { backgroundColor: COLORS.green + '22', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: COLORS.green },
  onlineChipTxt: { color: COLORS.green, fontSize: 9, fontWeight: '700' },
  ratingTxt: { color: COLORS.muted, fontSize: 11 },
  jobs: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  distance: { fontSize: 13, fontWeight: '700' },
  eta: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  specialtiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  specialtyChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: COLORS.border },
  specialtyTxt: { color: COLORS.muted, fontSize: 10 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: COLORS.muted, fontSize: 12 },
  callBtn: { backgroundColor: COLORS.surface, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: COLORS.border },
  callBtnTxt: { fontSize: 16 },
  bookBtn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  bookBtnTxt: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center' },
});
