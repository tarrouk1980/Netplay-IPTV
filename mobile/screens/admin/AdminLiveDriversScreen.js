import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_DRIVERS = [
  { id: 'D1', name: 'Karim Belhaj', type: 'taxi', status: 'on_trip', zone: 'Centre-ville', rating: 4.9, tripsToday: 8, phone: '+216 20 111 222' },
  { id: 'D2', name: 'Sami Trabelsi', type: 'taxi', status: 'online', zone: 'Lac 1', rating: 4.7, tripsToday: 5, phone: '+216 20 333 444' },
  { id: 'D3', name: 'Rania Bouzid', type: 'livreur', status: 'on_trip', zone: 'La Marsa', rating: 4.8, tripsToday: 12, phone: '+216 20 555 666' },
  { id: 'D4', name: 'Youssef Slim', type: 'livreur', status: 'online', zone: 'Ariana', rating: 4.6, tripsToday: 9, phone: '+216 20 777 888' },
  { id: 'D5', name: 'Nabil Gharbi', type: 'depanneur', status: 'on_trip', zone: 'Tunis Nord', rating: 4.9, tripsToday: 3, phone: '+216 20 999 000' },
  { id: 'D6', name: 'Ines Mrad', type: 'taxi', status: 'offline', zone: '—', rating: 4.5, tripsToday: 0, phone: '+216 20 123 456' },
];

const STATUS_LABELS = { online: { label: 'En ligne', color: COLORS.green }, on_trip: { label: 'En course', color: COLORS.accent }, offline: { label: 'Hors ligne', color: COLORS.muted } };
const TYPE_ICONS = { taxi: '🚕', livreur: '📦', depanneur: '🔧' };

export default function AdminLiveDriversScreen({ navigation }) {
  const [drivers, setDrivers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/admin/drivers/live')
      .then(r => setDrivers(r.data || MOCK_DRIVERS))
      .catch(() => setDrivers(MOCK_DRIVERS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = (drivers || []).filter(d => {
    const matchFilter = filter === 'all' || d.type === filter || d.status === filter;
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.zone.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    online: (drivers || []).filter(d => d.status === 'online').length,
    on_trip: (drivers || []).filter(d => d.status === 'on_trip').length,
    offline: (drivers || []).filter(d => d.status === 'offline').length,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📡 Chauffeurs en direct</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderColor: COLORS.green + '40' }]}>
              <Text style={[styles.statVal, { color: COLORS.green }]}>{counts.online}</Text>
              <Text style={styles.statLabel}>En ligne</Text>
            </View>
            <View style={[styles.statCard, { borderColor: COLORS.accent + '40' }]}>
              <Text style={[styles.statVal, { color: COLORS.accent }]}>{counts.on_trip}</Text>
              <Text style={styles.statLabel}>En course</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: COLORS.muted }]}>{counts.offline}</Text>
              <Text style={styles.statLabel}>Hors ligne</Text>
            </View>
          </View>

          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher un chauffeur ou zone..."
            placeholderTextColor={COLORS.muted}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {['all', 'online', 'on_trip', 'taxi', 'livreur', 'depanneur'].map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                  {f === 'all' ? 'Tous' : f === 'online' ? '🟢 En ligne' : f === 'on_trip' ? '🟡 En course' : f === 'taxi' ? '🚕 Taxi' : f === 'livreur' ? '📦 Livreur' : '🔧 Dépanneur'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filtered.map(d => {
            const st = STATUS_LABELS[d.status];
            return (
              <TouchableOpacity
                key={d.id}
                style={styles.driverCard}
                onPress={() => navigation.navigate('AdminDriverDetail', { driverId: d.id })}
                activeOpacity={0.85}
              >
                <View style={styles.driverLeft}>
                  <View style={styles.driverAvatar}>
                    <Text style={{ fontSize: 22 }}>{TYPE_ICONS[d.type]}</Text>
                  </View>
                  <View>
                    <Text style={styles.driverName}>{d.name}</Text>
                    <Text style={styles.driverZone}>📍 {d.zone}</Text>
                    <Text style={styles.driverPhone}>{d.phone}</Text>
                  </View>
                </View>
                <View style={styles.driverRight}>
                  <View style={[styles.statusDot, { backgroundColor: st.color + '20', borderColor: st.color + '60' }]}>
                    <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                  </View>
                  <Text style={styles.driverRating}>⭐ {d.rating}</Text>
                  <Text style={styles.driverTrips}>{d.tripsToday} courses</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {filtered.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun chauffeur trouvé</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statVal: { fontSize: 22, fontWeight: '900' },
  statLabel: { color: COLORS.muted, fontSize: 10, marginTop: 3 },
  searchInput: { backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  filterScroll: { marginBottom: 16 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, marginRight: 8 },
  filterBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  filterText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: COLORS.accent },
  driverCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  driverLeft: { flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 },
  driverAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  driverName: { color: COLORS.text, fontSize: 13, fontWeight: '800' },
  driverZone: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  driverPhone: { color: COLORS.muted, fontSize: 10, marginTop: 1 },
  driverRight: { alignItems: 'flex-end', gap: 4 },
  statusDot: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '700' },
  driverRating: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  driverTrips: { color: COLORS.muted, fontSize: 10 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: COLORS.muted, fontSize: 14 },
});
