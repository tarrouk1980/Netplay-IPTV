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

const FILTERS = ['Tous', 'En ligne', 'En course', 'Hors ligne'];

const MOCK_DRIVERS = [
  { id: 'D1', name: 'Karim Ben Salah', phone: '+216 98 765 432', rating: 4.9, totalRides: 1240, todayRides: 8, online: true, inRide: false, zone: 'Tunis Centre', car: 'Citroën C3 • TU 123 456' },
  { id: 'D2', name: 'Sami Rjab', phone: '+216 55 001 122', rating: 4.7, totalRides: 856, todayRides: 5, online: true, inRide: true, zone: 'La Marsa', car: 'Dacia Logan • TU 789 012' },
  { id: 'D3', name: 'Aymen Khelifi', phone: '+216 22 334 455', rating: 4.5, totalRides: 423, todayRides: 2, online: false, inRide: false, zone: 'Ariana', car: 'Kia Picanto • TU 345 678' },
  { id: 'D4', name: 'Mounir Trabelsi', phone: '+216 77 889 900', rating: 4.8, totalRides: 2100, todayRides: 12, online: true, inRide: true, zone: 'Sousse', car: 'Hyundai i10 • SS 111 222' },
];

function statusInfo(driver) {
  if (driver.inRide) return { label: 'En course', color: COLORS.blue };
  if (driver.online) return { label: 'En ligne', color: COLORS.green };
  return { label: 'Hors ligne', color: COLORS.muted };
}

function DriverCard({ item }) {
  const st = statusInfo(item);
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: COLORS.accent + '20' }]}>
          <Text style={[styles.avatarText, { color: COLORS.accent }]}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{item.name}</Text>
          <Text style={styles.driverCar}>{item.car}</Text>
          <Text style={styles.driverZone}>📍 {item.zone}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: st.color + '20', borderColor: st.color + '50' }]}>
          <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>
      <View style={styles.kpiRow}>
        <View style={styles.kpi}>
          <Text style={styles.kpiNum}>★ {item.rating}</Text>
          <Text style={styles.kpiLabel}>note</Text>
        </View>
        <View style={styles.kpiDiv} />
        <View style={styles.kpi}>
          <Text style={styles.kpiNum}>{item.todayRides}</Text>
          <Text style={styles.kpiLabel}>aujourd'hui</Text>
        </View>
        <View style={styles.kpiDiv} />
        <View style={styles.kpi}>
          <Text style={styles.kpiNum}>{item.totalRides.toLocaleString()}</Text>
          <Text style={styles.kpiLabel}>total</Text>
        </View>
      </View>
    </View>
  );
}

export default function AdminDriversScreen({ navigation }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tous');
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/admin/drivers')
      .then(r => setDrivers(r.data.drivers || MOCK_DRIVERS))
      .catch(() => setDrivers(MOCK_DRIVERS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = drivers.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.phone.includes(q) || d.zone.toLowerCase().includes(q);
    if (!matchSearch) return false;
    if (filter === 'En ligne') return d.online && !d.inRide;
    if (filter === 'En course') return d.inRide;
    if (filter === 'Hors ligne') return !d.online;
    return true;
  });

  const onlineCount = drivers.filter(d => d.online).length;
  const inRideCount = drivers.filter(d => d.inRide).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chauffeurs</Text>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}>
          <Text style={{ color: COLORS.accent, fontSize: 20 }}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{drivers.length}</Text>
          <Text style={styles.statLabel}>total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.green }]}>{onlineCount}</Text>
          <Text style={styles.statLabel}>en ligne</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.blue }]}>{inRideCount}</Text>
          <Text style={styles.statLabel}>en course</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Nom, zone, téléphone..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterLabel, filter === f && styles.filterLabelActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={d => d.id}
          renderItem={({ item }) => <DriverCard item={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ fontSize: 40 }}>🚕</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucun chauffeur trouvé</Text>
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
  refreshBtn: { width: 40, alignItems: 'flex-end' },
  statsBar: { flexDirection: 'row', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  statLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  searchRow: { paddingHorizontal: 16, paddingVertical: 10 },
  searchInput: {
    backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 10, color: COLORS.text, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  filterBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  filterBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  filterLabelActive: { color: '#000' },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800' },
  driverInfo: { flex: 1 },
  driverName: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  driverCar: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  driverZone: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  statusBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  kpiRow: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10,
  },
  kpi: { flex: 1, alignItems: 'center' },
  kpiNum: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  kpiLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  kpiDiv: { width: 1, backgroundColor: COLORS.border },
});
