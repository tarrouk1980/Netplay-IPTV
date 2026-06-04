import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const MOCK = [
  { id: 'T1', date: '03 juin 2025', time: '14:32', from: 'Lac 1, Tunis', to: 'Aéroport Tunis-Carthage', amount: 14.500, rating: 5, duration: '22 min', km: 11.2, type: 'TAXI' },
  { id: 'T2', date: '02 juin 2025', time: '09:15', from: 'Menzah 6', to: 'Centre Urbain Nord', amount: 8.200, rating: 4, duration: '14 min', km: 6.8, type: 'TAXI' },
  { id: 'T3', date: '01 juin 2025', time: '18:50', from: 'La Marsa', to: 'Cité Sportive', amount: 21.000, rating: 5, duration: '38 min', km: 18.5, type: 'TAXI' },
  { id: 'T4', date: '31 mai 2025', time: '11:20', from: 'Soukra', to: 'Ariana Centre', amount: 6.500, rating: null, duration: '11 min', km: 4.1, type: 'TAXI' },
  { id: 'T5', date: '30 mai 2025', time: '07:05', from: 'Tunis Centre', to: 'Gare de Tunis', amount: 5.000, rating: 3, duration: '9 min', km: 3.2, type: 'TAXI' },
];

const FILTERS = ['Tous', 'Cette semaine', 'Ce mois'];

export default function ProviderTripHistoryScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tous');
  const [total, setTotal] = useState({ count: 0, revenue: 0, km: 0 });

  useEffect(() => {
    api.get('/api/provider/trips/history')
      .then(r => setTrips(r.data?.trips || MOCK))
      .catch(() => setTrips(MOCK))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setTotal({
      count: trips.length,
      revenue: trips.reduce((s, t) => s + t.amount, 0),
      km: trips.reduce((s, t) => s + t.km, 0),
    });
  }, [trips]);

  const renderTrip = ({ item: t }) => (
    <TouchableOpacity style={styles.tripCard} activeOpacity={0.8}>
      <View style={styles.tripLeft}>
        <Text style={styles.tripDate}>{t.date}</Text>
        <Text style={styles.tripTime}>{t.time}</Text>
      </View>
      <View style={styles.tripCenter}>
        <View style={styles.routeRow}>
          <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
          <Text style={styles.routeText} numberOfLines={1}>{t.from}</Text>
        </View>
        <View style={styles.connector} />
        <View style={styles.routeRow}>
          <View style={[styles.dot, { backgroundColor: COLORS.red }]} />
          <Text style={styles.routeText} numberOfLines={1}>{t.to}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaChip}>⏱ {t.duration}</Text>
          <Text style={styles.metaChip}>📍 {t.km} km</Text>
          {t.rating && <Text style={styles.metaChip}>⭐ {t.rating}</Text>}
        </View>
      </View>
      <Text style={styles.tripAmount}>{t.amount.toFixed(3)}{'\n'}TND</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🗂️ Historique</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* KPI */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiBox}>
          <Text style={styles.kpiVal}>{total.count}</Text>
          <Text style={styles.kpiLabel}>Courses</Text>
        </View>
        <View style={styles.kpiBox}>
          <Text style={[styles.kpiVal, { color: COLORS.accent }]}>{total.revenue.toFixed(3)}</Text>
          <Text style={styles.kpiLabel}>TND gagnés</Text>
        </View>
        <View style={styles.kpiBox}>
          <Text style={styles.kpiVal}>{total.km.toFixed(1)}</Text>
          <Text style={styles.kpiLabel}>km parcourus</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterLabel, filter === f && { color: COLORS.accent }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={trips}
          keyExtractor={t => t.id}
          renderItem={renderTrip}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ color: COLORS.muted, textAlign: 'center', marginTop: 40 }}>Aucune course</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4, width: 36 },
  backIcon: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  kpiRow: { flexDirection: 'row', padding: 14, gap: 10 },
  kpiBox: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  kpiVal: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  kpiLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 4 },
  filterBtn: { borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: COLORS.surface },
  filterBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  filterLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  tripCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  tripLeft: { alignItems: 'center', minWidth: 56 },
  tripDate: { color: COLORS.muted, fontSize: 10, textAlign: 'center' },
  tripTime: { color: COLORS.accent, fontSize: 14, fontWeight: '900', marginTop: 2 },
  tripCenter: { flex: 1 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  routeText: { color: COLORS.text, fontSize: 12, flex: 1 },
  connector: { width: 1, height: 10, backgroundColor: COLORS.border, marginLeft: 3, marginVertical: 1 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  metaChip: { color: COLORS.muted, fontSize: 10 },
  tripAmount: { color: COLORS.accent, fontSize: 13, fontWeight: '900', textAlign: 'right', lineHeight: 18 },
});
