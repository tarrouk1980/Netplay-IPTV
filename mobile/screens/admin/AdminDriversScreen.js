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
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const SERVICE_ICONS = { TAXI: '🚕', LIVREUR: '📦', DEPANNEUR: '🔧' };
const STATUS_COLORS = { ONLINE: COLORS.green, OFFLINE: COLORS.muted, BUSY: COLORS.orange, SUSPENDED: COLORS.red };
const STATUS_LABELS = { ONLINE: 'En ligne', OFFLINE: 'Hors ligne', BUSY: 'Occupé', SUSPENDED: 'Suspendu' };

const MOCK = [
  { id: 'D001', name: 'Mohamed Ali T.', phone: '+216 22 111 222', service: 'TAXI', status: 'ONLINE', rating: 4.8, trips: 312, vehicle: 'VW Golf 2021 • 123 TN 4567', kyc: 'VERIFIED' },
  { id: 'D002', name: 'Sami Karoui', phone: '+216 98 333 444', service: 'LIVREUR', status: 'BUSY', rating: 4.6, trips: 187, vehicle: 'Scooter Sym • 456 TN 7890', kyc: 'VERIFIED' },
  { id: 'D003', name: 'Karim Mansouri', phone: '+216 71 555 666', service: 'DEPANNEUR', status: 'ONLINE', rating: 4.9, trips: 94, vehicle: 'Camion dépannage • 789 TN 1234', kyc: 'VERIFIED' },
  { id: 'D004', name: 'Nour Bejaoui', phone: '+216 55 777 888', service: 'TAXI', status: 'OFFLINE', rating: 4.3, trips: 241, vehicle: 'Renault Clio 2020 • 321 TN 9876', kyc: 'PENDING' },
  { id: 'D005', name: 'Youssef Tlili', phone: '+216 50 999 000', service: 'LIVREUR', status: 'SUSPENDED', rating: 3.2, trips: 28, vehicle: 'Vélo électrique', kyc: 'REJECTED' },
];

const FILTERS = ['Tous', 'ONLINE', 'TAXI', 'LIVREUR', 'DEPANNEUR'];

function DriverCard({ item, onPress }) {
  const sc = STATUS_COLORS[item.status] || COLORS.muted;
  const kycColor = { VERIFIED: COLORS.green, PENDING: COLORS.accent, REJECTED: COLORS.red }[item.kyc] || COLORS.muted;
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 22 }}>{SERVICE_ICONS[item.service] || '🚗'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.driverName}>{item.name}</Text>
            <View style={[styles.statusDot, { backgroundColor: sc }]} />
          </View>
          <Text style={styles.driverPhone}>{item.phone}</Text>
          <Text style={styles.driverVehicle} numberOfLines={1}>{item.vehicle}</Text>
        </View>
      </View>
      <View style={styles.cardBottom}>
        <View style={[styles.statusBadge, { backgroundColor: sc + '20', borderColor: sc + '40' }]}>
          <Text style={[styles.statusText, { color: sc }]}>{STATUS_LABELS[item.status]}</Text>
        </View>
        <View style={[styles.kycBadge, { borderColor: kycColor + '40', backgroundColor: kycColor + '15' }]}>
          <Text style={[styles.kycText, { color: kycColor }]}>KYC {item.kyc}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <Text style={styles.driverRating}>★ {item.rating}</Text>
        <Text style={styles.driverTrips}>{item.trips} courses</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AdminDriversScreen({ navigation }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Tous');

  const load = useCallback(() => {
    api.get('/api/admin/drivers')
      .then(r => setDrivers(r.data.drivers || MOCK))
      .catch(() => setDrivers(MOCK))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = drivers.filter(d => {
    const matchFilter = filter === 'Tous' ||
      (filter === 'ONLINE' ? d.status === 'ONLINE' : d.service === filter);
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.phone.includes(search);
    return matchFilter && matchSearch;
  });

  const onlineCount = drivers.filter(d => d.status === 'ONLINE').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🚗 Prestataires</Text>
        <View style={styles.onlineBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineCount}>{onlineCount} en ligne</Text>
        </View>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Nom ou téléphone..."
        placeholderTextColor={COLORS.muted}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={f => f}
        style={{ maxHeight: 44 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterBtn, filter === item && styles.filterBtnActive]}
            onPress={() => setFilter(item)}
          >
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <DriverCard item={item} onPress={d => navigation.navigate('AdminUserDetail', { userId: d.id })} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 36 }}>🔍</Text>
              <Text style={{ color: COLORS.muted, marginTop: 10 }}>Aucun prestataire trouvé</Text>
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
  backBtn: { padding: 4 },
  backText: { color: COLORS.accent, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.green + '20', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.green },
  onlineCount: { color: COLORS.green, fontSize: 12, fontWeight: '700' },
  searchInput: {
    margin: 16, marginBottom: 8, backgroundColor: COLORS.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, color: COLORS.text, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterBtn: {
    borderRadius: 20, paddingHorizontal: 13, paddingVertical: 7,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  filterBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  filterText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: COLORS.accent },
  list: { padding: 16 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  cardTop: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  avatar: {
    width: 46, height: 46, borderRadius: 12, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  driverName: { color: COLORS.text, fontSize: 14, fontWeight: '700', flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  driverPhone: { color: COLORS.muted, fontSize: 12, marginBottom: 2 },
  driverVehicle: { color: COLORS.muted, fontSize: 11 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  statusBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  kycBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3 },
  kycText: { fontSize: 10, fontWeight: '700' },
  driverRating: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  driverTrips: { color: COLORS.muted, fontSize: 11 },
  empty: { alignItems: 'center', paddingTop: 60 },
});
