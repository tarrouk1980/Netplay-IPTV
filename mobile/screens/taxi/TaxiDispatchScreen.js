import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_PENDING = [
  { id: 'D1', clientName: 'Sana T.', from: 'Lac 1, Tunis', to: 'Aéroport Tunis-Carthage', distance: 12.4, eta: '18 min', fare: 14.500, vehicle: 'Berline', waiting: 180, assigned: null },
  { id: 'D2', clientName: 'Karim B.', from: 'La Marsa Centre', to: 'Bardo', distance: 18.2, eta: '26 min', fare: 21.000, vehicle: 'SUV', waiting: 65, assigned: null },
  { id: 'D3', clientName: 'Rim H.', from: 'Cité Olympique', to: 'Centre Ville Tunis', distance: 6.8, eta: '11 min', fare: 9.200, vehicle: 'Berline', waiting: 420, assigned: null },
];

const MOCK_DRIVERS = [
  { id: 'DR1', name: 'Mohamed Ali', vehicle: 'Berline', plate: 'TU-145-2022', zone: 'Lac 1', rating: 4.9, available: true },
  { id: 'DR2', name: 'Hedi Trabelsi', vehicle: 'SUV', plate: 'TU-388-2021', zone: 'La Marsa', rating: 4.7, available: true },
  { id: 'DR3', name: 'Youssef Saad', vehicle: 'Berline', plate: 'TU-991-2023', zone: 'Bardo', rating: 4.6, available: false },
  { id: 'DR4', name: 'Nabil Riahi', vehicle: 'Van', plate: 'TU-201-2020', zone: 'Centre', rating: 4.8, available: true },
];

function DispatchCard({ ride, drivers, onAssign }) {
  const waitMins = Math.floor(ride.waiting / 60);
  const waitSecs = ride.waiting % 60;
  const waitColor = ride.waiting > 300 ? COLORS.red : ride.waiting > 120 ? COLORS.orange : COLORS.green;
  const compatible = drivers.filter(d => d.available && (!ride.vehicle || d.vehicle === ride.vehicle || ride.vehicle === 'Berline'));

  return (
    <View style={styles.dispatchCard}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.clientName}>👤 {ride.clientName}</Text>
          <Text style={styles.rideVehicle}>{ride.vehicle}</Text>
        </View>
        <View style={styles.waitBadge}>
          <Text style={[styles.waitText, { color: waitColor }]}>
            {waitMins > 0 ? `${waitMins}m ${waitSecs}s` : `${waitSecs}s`}
          </Text>
          <Text style={styles.waitLabel}>en attente</Text>
        </View>
      </View>
      <View style={styles.routeRow}>
        <View style={styles.routeDot} />
        <Text style={styles.routeText} numberOfLines={1}>{ride.from}</Text>
      </View>
      <View style={[styles.routeRow, { marginTop: 2 }]}>
        <View style={[styles.routeDot, { backgroundColor: COLORS.red }]} />
        <Text style={styles.routeText} numberOfLines={1}>{ride.to}</Text>
      </View>
      <View style={styles.fareRow}>
        <Text style={styles.fareText}>{ride.fare.toFixed(3)} TND</Text>
        <Text style={styles.etaText}>ETA {ride.eta} · {ride.distance} km</Text>
      </View>
      {ride.assigned ? (
        <View style={styles.assignedRow}>
          <Text style={styles.assignedText}>✅ Assigné à {ride.assigned}</Text>
        </View>
      ) : (
        <View style={styles.driversRow}>
          <Text style={styles.driversLabel}>CHAUFFEURS DISPONIBLES</Text>
          {compatible.length === 0 ? (
            <Text style={{ color: COLORS.red, fontSize: 12, marginTop: 4 }}>Aucun chauffeur disponible</Text>
          ) : (
            compatible.map(dr => (
              <TouchableOpacity key={dr.id} style={styles.driverOption} onPress={() => onAssign(ride, dr)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.driverName}>{dr.name}</Text>
                  <Text style={styles.driverInfo}>{dr.plate} · {dr.zone} · ⭐ {dr.rating}</Text>
                </View>
                <Text style={styles.assignBtn}>Assigner →</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
}

export default function TaxiDispatchScreen({ navigation }) {
  const [rides, setRides] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/api/admin/dispatch/rides').catch(() => null),
      api.get('/api/admin/dispatch/drivers').catch(() => null),
    ]).then(([ridesRes, driversRes]) => {
      setRides(ridesRes?.data?.rides || MOCK_PENDING);
      setDrivers(driversRes?.data?.drivers || MOCK_DRIVERS);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRides(prev => prev.map(r => r.assigned ? r : { ...r, waiting: r.waiting + 5 }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAssign = (ride, driver) => {
    Alert.alert(
      'Confirmer l\'assignation',
      `Assigner ${driver.name} à la course de ${ride.clientName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Assigner', onPress: () => {
            setRides(prev => prev.map(r => r.id === ride.id ? { ...r, assigned: driver.name } : r));
            setDrivers(prev => prev.map(d => d.id === driver.id ? { ...d, available: false } : d));
            api.post('/api/admin/dispatch/assign', { rideId: ride.id, driverId: driver.id }).catch(() => {});
          },
        },
      ]
    );
  };

  const pending = rides.filter(r => !r.assigned);
  const assigned = rides.filter(r => r.assigned);
  const availableDrivers = drivers.filter(d => d.available).length;

  const displayed = filter === 'pending' ? pending : assigned;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🚕 Dispatch</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={load}>
          <Text style={{ fontSize: 18 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiItem}><Text style={[styles.kpiVal, { color: COLORS.orange }]}>{pending.length}</Text><Text style={styles.kpiLabel}>En attente</Text></View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}><Text style={[styles.kpiVal, { color: COLORS.green }]}>{assigned.length}</Text><Text style={styles.kpiLabel}>Assignées</Text></View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}><Text style={[styles.kpiVal, { color: COLORS.blue }]}>{availableDrivers}</Text><Text style={styles.kpiLabel}>Chauffeurs libres</Text></View>
      </View>

      <View style={styles.filterRow}>
        {[{ key: 'pending', label: `En attente (${pending.length})` }, { key: 'assigned', label: `Assignées (${assigned.length})` }].map(f => (
          <TouchableOpacity key={f.key} style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]} onPress={() => setFilter(f.key)}>
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : (
        <FlatList
          data={displayed}
          keyExtractor={r => r.id}
          renderItem={({ item }) => <DispatchCard ride={item} drivers={drivers} onAssign={handleAssign} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 40 }}>🚕</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucune course</Text>
            </View>
          }
        />
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
  refreshBtn: { width: 40, alignItems: 'flex-end' },
  kpiRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 12 },
  kpiItem: { flex: 1, alignItems: 'center' },
  kpiVal: { fontSize: 20, fontWeight: '900' },
  kpiLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  kpiDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  filterRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filterBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  filterBtnActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  filterLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  filterLabelActive: { color: COLORS.accent },
  dispatchCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  clientName: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  rideVehicle: { color: COLORS.accent, fontSize: 11, marginTop: 2 },
  waitBadge: { alignItems: 'flex-end' },
  waitText: { fontSize: 14, fontWeight: '900' },
  waitLabel: { color: COLORS.muted, fontSize: 10 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green },
  routeText: { color: COLORS.muted, fontSize: 12, flex: 1 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  fareText: { color: COLORS.text, fontSize: 15, fontWeight: '900' },
  etaText: { color: COLORS.muted, fontSize: 12 },
  assignedRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  assignedText: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  driversRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  driversLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },
  driverOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg, borderRadius: 10, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  driverName: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  driverInfo: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  assignBtn: { color: COLORS.accent, fontSize: 12, fontWeight: '800' },
});
