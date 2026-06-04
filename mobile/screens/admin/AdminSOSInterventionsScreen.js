import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const STATUS_META = {
  active:    { label: 'En cours',  color: COLORS.blue,   bg: '#0A1A2E' },
  pending:   { label: 'En attente', color: COLORS.orange, bg: '#1A100A' },
  completed: { label: 'Terminé',   color: COLORS.green,  bg: '#0D2E0D' },
  cancelled: { label: 'Annulé',    color: COLORS.muted,  bg: COLORS.surface },
};

const MOCK_SOS = [
  {
    id: 'SOS-0441', client: 'Sana B.', phone: '+216 22 441 998',
    depanneur: 'Karim SOS', type: 'Crevaison', zone: 'Route de Soukra, Tunis',
    fare: 85.00, status: 'active', time: '14:32', eta: '8 min',
  },
  {
    id: 'SOS-0440', client: 'Youssef L.', phone: '+216 55 770 114',
    depanneur: 'Non assigné', type: 'Panne batterie', zone: 'Autoroute A1, km 32',
    fare: 65.00, status: 'pending', time: '14:10', eta: '—',
  },
  {
    id: 'SOS-0439', client: 'Ines K.', phone: '+216 29 882 001',
    depanneur: 'Mohamed D.', type: 'Accident mineur', zone: 'Av. de la République, Ariana',
    fare: 120.00, status: 'completed', time: '12:55', eta: '—',
  },
  {
    id: 'SOS-0438', client: 'Amine T.', phone: '+216 98 554 223',
    depanneur: 'Sofiene SOS', type: 'Véhicule bloqué', zone: 'La Marsa',
    fare: 50.00, status: 'cancelled', time: '11:40', eta: '—',
  },
];

const MOCK_STATS = {
  activeNow: 1, pendingNow: 1, todayTotal: 14, avgResponse: '6 min',
};

export default function AdminSOSInterventionsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = MOCK_SOS.filter(s => {
    const matchSearch = !search ||
      s.id.includes(search.toUpperCase()) ||
      s.client.toLowerCase().includes(search.toLowerCase()) ||
      s.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const renderItem = ({ item: s }) => {
    const meta = STATUS_META[s.status];
    return (
      <View style={[styles.card, { borderColor: meta.color + '55', backgroundColor: meta.bg }]}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.sosId}>{s.id}</Text>
            <Text style={styles.sosType}>{s.type}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: meta.color + '22' }]}>
            <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>👤 {s.client}</Text>
          <Text style={styles.infoText}>📞 {s.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>🔧 {s.depanneur}</Text>
          <Text style={[styles.fareText, { color: s.status === 'active' ? COLORS.accent : COLORS.muted }]}>
            {s.fare.toFixed(2)} TND
          </Text>
        </View>
        <Text style={styles.zoneText} numberOfLines={1}>📍 {s.zone}</Text>

        <View style={styles.cardBottom}>
          <Text style={styles.timeText}>🕐 {s.time}</Text>
          {s.status === 'active' && (
            <Text style={{ color: COLORS.blue, fontSize: 12 }}>⏱ ETA {s.eta}</Text>
          )}
          <View style={styles.cardActions}>
            {s.status === 'pending' && (
              <TouchableOpacity style={styles.assignBtn}>
                <Text style={styles.assignBtnText}>Assigner</Text>
              </TouchableOpacity>
            )}
            {s.status === 'active' && (
              <TouchableOpacity style={styles.trackBtn}>
                <Text style={styles.trackBtnText}>📍 Suivre</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interventions SOS</Text>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={{ color: COLORS.green, fontSize: 11, fontWeight: '700' }}>LIVE</Text>
        </View>
      </View>

      {/* KPI row */}
      <View style={styles.kpiRow}>
        {[
          { label: 'En cours', value: MOCK_STATS.activeNow, color: COLORS.blue },
          { label: 'En attente', value: MOCK_STATS.pendingNow, color: COLORS.orange },
          { label: 'Aujourd\'hui', value: MOCK_STATS.todayTotal, color: COLORS.muted },
          { label: 'Temps moy.', value: MOCK_STATS.avgResponse, color: COLORS.green },
        ].map((k) => (
          <View key={k.label} style={styles.kpiCard}>
            <Text style={[styles.kpiVal, { color: k.color }]}>{k.value}</Text>
            <Text style={styles.kpiLabel}>{k.label}</Text>
          </View>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Text style={{ color: COLORS.muted }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="SOS-ID, client, type..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        {[['all', 'Tous'], ['active', 'En cours'], ['pending', 'En attente'], ['completed', 'Terminés']].map(([val, lbl]) => (
          <TouchableOpacity
            key={val}
            style={[styles.filterChip, filterStatus === val && styles.filterChipActive]}
            onPress={() => setFilterStatus(val)}
          >
            <Text style={[styles.filterText, filterStatus === val && { color: '#000' }]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={s => s.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🚑</Text>
            <Text style={styles.emptyText}>Aucune intervention</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.green + '22', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: COLORS.green },
  kpiRow: { flexDirection: 'row', padding: 12, gap: 8 },
  kpiCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, padding: 10,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  kpiVal: { fontSize: 18, fontWeight: '900' },
  kpiLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2, textAlign: 'center' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, color: COLORS.white, fontSize: 14 },
  filtersRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  card: { borderRadius: 14, padding: 14, borderWidth: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  sosId: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  sosType: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  infoText: { color: COLORS.muted, fontSize: 12 },
  fareText: { fontSize: 13, fontWeight: '800' },
  zoneText: { color: COLORS.muted, fontSize: 11, marginBottom: 10 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeText: { color: COLORS.muted, fontSize: 12 },
  cardActions: { flexDirection: 'row', gap: 8 },
  assignBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    backgroundColor: COLORS.orange + '22', borderWidth: 1, borderColor: COLORS.orange,
  },
  assignBtnText: { color: COLORS.orange, fontSize: 12, fontWeight: '700' },
  trackBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    backgroundColor: COLORS.blue + '22', borderWidth: 1, borderColor: COLORS.blue,
  },
  trackBtnText: { color: COLORS.blue, fontSize: 12, fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: COLORS.muted, fontSize: 15 },
});
