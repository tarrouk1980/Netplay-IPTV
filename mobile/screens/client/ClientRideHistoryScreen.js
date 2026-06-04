import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const FILTERS = ['Tous', 'TAXI', 'LIVRAISON', 'SOS'];

const STATUS_LABEL = {
  COMPLETED: { label: 'Terminée', color: COLORS.green },
  CANCELLED: { label: 'Annulée', color: COLORS.red },
  PENDING: { label: 'En attente', color: COLORS.accent },
};

const MOCK_RIDES = [
  { id: '1', type: 'TAXI', status: 'COMPLETED', date: '2025-06-03', origin: 'Tunis Centre', destination: 'Aéroport Tunis-Carthage', amount: 18.500, rating: 5, driver: 'Karim B.' },
  { id: '2', type: 'LIVRAISON', status: 'COMPLETED', date: '2025-06-02', origin: 'Pizza Roma, Lac 1', destination: 'Berges du Lac 2', amount: 5.000, rating: 4, driver: 'Yassine M.' },
  { id: '3', type: 'TAXI', status: 'CANCELLED', date: '2025-06-01', origin: 'La Marsa', destination: 'Sidi Bou Said', amount: 0, rating: null, driver: null },
  { id: '4', type: 'SOS', status: 'COMPLETED', date: '2025-05-30', origin: 'Route GP1, Km 22', destination: null, amount: 45.000, rating: 5, driver: 'Mounir T.' },
  { id: '5', type: 'TAXI', status: 'COMPLETED', date: '2025-05-28', origin: 'Bab Bhar', destination: 'El Menzah 9', amount: 12.750, rating: 3, driver: 'Sami R.' },
  { id: '6', type: 'LIVRAISON', status: 'COMPLETED', date: '2025-05-27', origin: 'Carrefour Market', destination: 'Cité Mahrajène', amount: 3.500, rating: 4, driver: 'Aymen K.' },
];

function Stars({ rating }) {
  if (!rating) return null;
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Text key={i} style={{ fontSize: 11, color: i <= rating ? COLORS.accent : COLORS.border }}>★</Text>
      ))}
    </View>
  );
}

function RideCard({ item, onPress }) {
  const st = STATUS_LABEL[item.status] || { label: item.status, color: COLORS.muted };
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={[styles.typeBadge, item.type === 'TAXI' && { backgroundColor: '#F5A62320' },
          item.type === 'LIVRAISON' && { backgroundColor: '#3498DB20' },
          item.type === 'SOS' && { backgroundColor: '#E74C3C20' }]}>
          <Text style={[styles.typeText,
            item.type === 'TAXI' && { color: COLORS.accent },
            item.type === 'LIVRAISON' && { color: COLORS.blue },
            item.type === 'SOS' && { color: COLORS.red }]}>
            {item.type === 'TAXI' ? '🚕 Taxi' : item.type === 'LIVRAISON' ? '📦 Livraison' : '🔧 SOS'}
          </Text>
        </View>
        <Text style={{ color: st.color, fontSize: 12, fontWeight: '600' }}>{st.label}</Text>
      </View>

      <View style={styles.routeRow}>
        <View style={styles.routeDots}>
          <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
          <View style={styles.routeLine} />
          <View style={[styles.dot, { backgroundColor: COLORS.accent }]} />
        </View>
        <View style={styles.routeLabels}>
          <Text style={styles.routeText} numberOfLines={1}>{item.origin}</Text>
          <Text style={styles.routeText} numberOfLines={1}>{item.destination || '— (dépannage sur place)'}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>{item.date}</Text>
        {item.driver && <Text style={styles.cardDriver}>↳ {item.driver}</Text>}
        <View style={{ flex: 1 }} />
        <Stars rating={item.rating} />
        {item.amount > 0 && (
          <Text style={styles.cardAmount}>{item.amount.toFixed(3)} TND</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ClientRideHistoryScreen({ navigation }) {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tous');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/api/client/rides?limit=50')
      .then(r => setRides(r.data.rides || MOCK_RIDES))
      .catch(() => setRides(MOCK_RIDES))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rides.filter(r => {
    const matchFilter = filter === 'Tous' || r.type === filter;
    const matchSearch = !search || r.origin?.toLowerCase().includes(search.toLowerCase())
      || r.destination?.toLowerCase().includes(search.toLowerCase())
      || r.driver?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalSpent = rides.filter(r => r.status === 'COMPLETED').reduce((s, r) => s + r.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes courses</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{rides.filter(r => r.status === 'COMPLETED').length}</Text>
          <Text style={styles.statLabel}>terminées</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{rides.filter(r => r.status === 'CANCELLED').length}</Text>
          <Text style={styles.statLabel}>annulées</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.accent }]}>{totalSpent.toFixed(3)}</Text>
          <Text style={styles.statLabel}>TND dépensés</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une course..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterLabel, filter === f && styles.filterLabelActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={({ item }) => <RideCard item={item} onPress={() => {}} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ fontSize: 40 }}>🗺️</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucune course trouvée</Text>
            </View>
          }
        />
      )}
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
  statsBar: {
    flexDirection: 'row', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  statLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  searchRow: { paddingHorizontal: 16, paddingVertical: 10 },
  searchInput: {
    backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 10, color: COLORS.text, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4,
  },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  filterBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  filterLabelActive: { color: '#000' },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  typeBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  typeText: { fontSize: 12, fontWeight: '700' },
  routeRow: { flexDirection: 'row', marginBottom: 10 },
  routeDots: { width: 14, alignItems: 'center', paddingTop: 3 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  routeLine: { width: 1, flex: 1, backgroundColor: COLORS.border, marginVertical: 2 },
  routeLabels: { flex: 1, paddingLeft: 10, gap: 8 },
  routeText: { color: COLORS.text, fontSize: 13 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardDate: { color: COLORS.muted, fontSize: 11 },
  cardDriver: { color: COLORS.muted, fontSize: 11 },
  cardAmount: { color: COLORS.accent, fontSize: 14, fontWeight: '800', marginLeft: 4 },
});
