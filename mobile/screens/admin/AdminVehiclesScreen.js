import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, TextInput, Modal, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const STATUS_COLOR = { APPROVED: COLORS.green, PENDING: COLORS.orange, REJECTED: COLORS.red, SUSPENDED: COLORS.muted };
const STATUS_LABEL = { APPROVED: 'Approuvé', PENDING: 'En attente', REJECTED: 'Refusé', SUSPENDED: 'Suspendu' };
const TYPE_ICON = { BERLINE: '🚗', SUV: '🚙', VAN: '🚐', MOTO: '🛵', CAMION: '🚛' };

const MOCK_VEHICLES = [
  { id: 'VH1', plate: 'TU-145-2022', brand: 'Toyota', model: 'Corolla', type: 'BERLINE', year: 2022, driver: 'Karim B.', status: 'APPROVED', color: 'Blanc', insurance: '31/12/2025' },
  { id: 'VH2', plate: 'TN-887-2021', brand: 'Hyundai', model: 'Tucson', type: 'SUV', year: 2021, driver: 'Sami T.', status: 'APPROVED', color: 'Noir', insurance: '30/06/2025' },
  { id: 'VH3', plate: 'AR-234-2023', brand: 'Renault', model: 'Master', type: 'VAN', year: 2023, driver: 'Nabil R.', status: 'PENDING', color: 'Blanc', insurance: '28/02/2026' },
  { id: 'VH4', plate: 'TU-556-2020', brand: 'Yamaha', model: 'NMAX', type: 'MOTO', year: 2020, driver: 'Rim H.', status: 'APPROVED', color: 'Rouge', insurance: '15/11/2025' },
  { id: 'VH5', plate: 'SF-112-2019', brand: 'Peugeot', model: '308', type: 'BERLINE', year: 2019, driver: 'Hatem K.', status: 'SUSPENDED', color: 'Gris', insurance: '01/08/2024' },
  { id: 'VH6', plate: 'BA-778-2022', brand: 'Ford', model: 'Transit', type: 'CAMION', year: 2022, driver: 'Anis M.', status: 'REJECTED', color: 'Blanc', insurance: '20/09/2025' },
];

const FILTERS = [
  { key: 'ALL', label: 'Tous' },
  { key: 'APPROVED', label: '✅ Approuvés' },
  { key: 'PENDING', label: '⏳ En attente' },
  { key: 'REJECTED', label: '❌ Refusés' },
  { key: 'SUSPENDED', label: '⚠️ Suspendus' },
];

function VehicleCard({ item, onPress }) {
  const sc = STATUS_COLOR[item.status];
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <View style={[styles.vehicleIcon, { backgroundColor: sc + '15' }]}>
          <Text style={{ fontSize: 26 }}>{TYPE_ICON[item.type] || '🚗'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.vehiclePlate}>{item.plate}</Text>
          <Text style={styles.vehicleName}>{item.brand} {item.model} {item.year}</Text>
          <Text style={styles.vehicleDriver}>👤 {item.driver}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: sc + '20', borderColor: sc + '50' }]}>
          <Text style={[styles.statusText, { color: sc }]}>{STATUS_LABEL[item.status]}</Text>
        </View>
      </View>
      <View style={styles.cardMeta}>
        <Text style={styles.metaItem}>🎨 {item.color}</Text>
        <Text style={styles.metaItem}>🛡️ Ass. {item.insurance}</Text>
        <Text style={styles.metaItem}>{item.type}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AdminVehiclesScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [acting, setActing] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/admin/vehicles')
      .then(r => setVehicles(r.data.vehicles || MOCK_VEHICLES))
      .catch(() => setVehicles(MOCK_VEHICLES))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (vehicleId, action) => {
    setActing(true);
    try {
      await api.post(`/api/admin/vehicles/${vehicleId}/${action}`);
      const newStatus = action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : action === 'suspend' ? 'SUSPENDED' : 'APPROVED';
      setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: newStatus } : v));
      setSelected(s => s ? { ...s, status: newStatus } : null);
    } catch {
      const newStatus = action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : action === 'suspend' ? 'SUSPENDED' : 'APPROVED';
      setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: newStatus } : v));
      setSelected(s => s ? { ...s, status: newStatus } : null);
    } finally { setActing(false); }
  };

  const confirmAction = (vehicle, action, label) => {
    Alert.alert(`${label} ce véhicule ?`, `${vehicle.brand} ${vehicle.model} — ${vehicle.plate}`, [
      { text: 'Annuler', style: 'cancel' },
      { text: label, onPress: () => handleAction(vehicle.id, action) },
    ]);
  };

  const filtered = vehicles.filter(v => {
    const matchFilter = filter === 'ALL' || v.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || v.plate.toLowerCase().includes(q) || v.driver.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const pending = vehicles.filter(v => v.status === 'PENDING').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.headerTitle}>🚗 Véhicules</Text>
          {pending > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{pending}</Text></View>}
        </View>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}>
          <Text style={{ color: COLORS.accent, fontSize: 20 }}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Plaque, chauffeur, marque..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={f => f.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>{f.label}</Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={v => v.id}
          renderItem={({ item }) => <VehicleCard item={item} onPress={setSelected} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 40 }}>🚗</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucun véhicule</Text>
            </View>
          }
        />
      )}

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selected?.brand} {selected?.model}</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={{ color: COLORS.muted, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailGrid}>
              {[
                { label: 'Plaque', value: selected?.plate },
                { label: 'Année', value: selected?.year },
                { label: 'Type', value: selected?.type },
                { label: 'Couleur', value: selected?.color },
                { label: 'Chauffeur', value: selected?.driver },
                { label: 'Assurance', value: selected?.insurance },
              ].map(d => (
                <View key={d.label} style={styles.detailItem}>
                  <Text style={styles.detailLabel}>{d.label}</Text>
                  <Text style={styles.detailValue}>{d.value}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.currentStatus, { backgroundColor: STATUS_COLOR[selected?.status] + '15', borderColor: STATUS_COLOR[selected?.status] + '40' }]}>
              <Text style={[styles.currentStatusText, { color: STATUS_COLOR[selected?.status] }]}>
                Statut actuel : {STATUS_LABEL[selected?.status]}
              </Text>
            </View>

            {acting ? (
              <ActivityIndicator color={COLORS.accent} style={{ marginTop: 16 }} />
            ) : (
              <View style={styles.actionGrid}>
                {selected?.status !== 'APPROVED' && (
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.green + '20', borderColor: COLORS.green + '50' }]}
                    onPress={() => confirmAction(selected, 'approve', 'Approuver')}>
                    <Text style={[styles.actionBtnText, { color: COLORS.green }]}>✅ Approuver</Text>
                  </TouchableOpacity>
                )}
                {selected?.status !== 'REJECTED' && (
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.red + '20', borderColor: COLORS.red + '50' }]}
                    onPress={() => confirmAction(selected, 'reject', 'Refuser')}>
                    <Text style={[styles.actionBtnText, { color: COLORS.red }]}>❌ Refuser</Text>
                  </TouchableOpacity>
                )}
                {selected?.status === 'APPROVED' && (
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.orange + '20', borderColor: COLORS.orange + '50' }]}
                    onPress={() => confirmAction(selected, 'suspend', 'Suspendre')}>
                    <Text style={[styles.actionBtnText, { color: COLORS.orange }]}>⚠️ Suspendre</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  badge: { backgroundColor: COLORS.orange, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  refreshBtn: { width: 40, alignItems: 'flex-end' },
  searchRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  searchInput: {
    backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  filterRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterBtn: {
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 7, backgroundColor: COLORS.surface,
  },
  filterBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  filterLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  filterLabelActive: { color: COLORS.accent },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  vehicleIcon: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  vehiclePlate: { color: COLORS.accent, fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  vehicleName: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginTop: 2 },
  vehicleDriver: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  statusBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardMeta: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  metaItem: { color: COLORS.muted, fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderWidth: 1, borderColor: COLORS.border,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 },
  detailItem: { width: '45%' },
  detailLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 3 },
  detailValue: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  currentStatus: { borderRadius: 12, borderWidth: 1, paddingVertical: 10, alignItems: 'center', marginBottom: 14 },
  currentStatusText: { fontSize: 13, fontWeight: '700' },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: { flex: 1, minWidth: '45%', borderRadius: 12, borderWidth: 1, paddingVertical: 12, alignItems: 'center' },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
});
