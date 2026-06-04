import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const MOCK = [
  { id: 'T001', clientName: 'Nadia K.', from: 'Lac 1, Tunis', to: 'Berges du Lac 2', distance: 3.2, fare: 8.500, status: 'COMPLETED', date: '03/06/2026 15:40', rating: 5, duration: '14 min' },
  { id: 'T002', clientName: 'Ahmed B.', from: 'La Marsa Centre', to: 'Sidi Bou Said', distance: 2.1, fare: 6.200, status: 'COMPLETED', date: '03/06/2026 13:05', rating: 4, duration: '11 min' },
  { id: 'T003', clientName: 'Lina M.', from: 'Menzah 6', to: 'Ariana Ville', distance: 4.8, fare: 11.000, status: 'CANCELLED', date: '03/06/2026 10:20', rating: null, duration: null },
  { id: 'T004', clientName: 'Youssef T.', from: 'Bardo Centre', to: 'El Omrane', distance: 5.5, fare: 12.500, status: 'COMPLETED', date: '02/06/2026 19:30', rating: 5, duration: '22 min' },
  { id: 'T005', clientName: 'Rim S.', from: 'Tunis Centre', to: 'Carthage', distance: 8.1, fare: 18.000, status: 'COMPLETED', date: '02/06/2026 17:10', rating: 4, duration: '28 min' },
];

const STATUS_LABELS = { COMPLETED: 'Terminée', CANCELLED: 'Annulée' };
const STATUS_COLORS = { COMPLETED: COLORS.green, CANCELLED: COLORS.red };

function TripCard({ item }) {
  const sc = STATUS_COLORS[item.status] || COLORS.muted;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardId}>#{item.id}</Text>
        <View style={[styles.badge, { backgroundColor: sc + '20', borderColor: sc + '40' }]}>
          <Text style={[styles.badgeText, { color: sc }]}>{STATUS_LABELS[item.status]}</Text>
        </View>
      </View>

      <View style={styles.routeSection}>
        <View style={styles.routeRow}>
          <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
          <Text style={styles.routeText} numberOfLines={1}>{item.from}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <View style={[styles.dot, { backgroundColor: COLORS.accent }]} />
          <Text style={styles.routeText} numberOfLines={1}>{item.to}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.footerMeta}>{item.date}</Text>
        <Text style={styles.footerMeta}>📍 {item.distance} km</Text>
        {item.duration && <Text style={styles.footerMeta}>⏱ {item.duration}</Text>}
        <View style={{ flex: 1 }} />
        <Text style={styles.footerFare}>{item.fare.toFixed(3)} TND</Text>
        {item.rating && <Text style={styles.footerRating}>{'★'.repeat(item.rating)}</Text>}
      </View>
    </View>
  );
}

export default function DriverTripHistoryScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, earnings: 0, avgRating: '—' });

  const load = useCallback(() => {
    api.get('/api/driver/trips/history')
      .then(r => {
        const data = r.data.trips || MOCK;
        setTrips(data);
        const done = data.filter(t => t.status === 'COMPLETED');
        const earnings = done.reduce((s, t) => s + t.fare, 0);
        const ratings = done.filter(t => t.rating).map(t => t.rating);
        setStats({
          total: done.length,
          earnings,
          avgRating: ratings.length ? (ratings.reduce((a, b) => a + b) / ratings.length).toFixed(1) : '—',
        });
      })
      .catch(() => {
        setTrips(MOCK);
        setStats({ total: 4, earnings: 55.200, avgRating: '4.7' });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📋 Historique courses</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
      ) : (
        <>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: COLORS.accent }]}>{stats.earnings.toFixed(3)}</Text>
              <Text style={styles.statLabel}>TND gagnés</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{stats.total}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: COLORS.accent }]}>★ {stats.avgRating}</Text>
              <Text style={styles.statLabel}>Note moy.</Text>
            </View>
          </View>

          <FlatList
            data={trips}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <TripCard item={item} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={{ fontSize: 40 }}>🚕</Text>
                <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucune course</Text>
              </View>
            }
          />
        </>
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
  statsRow: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 8 },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statNum: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  statLabel: { color: COLORS.muted, fontSize: 10, marginTop: 3, textAlign: 'center' },
  list: { padding: 16 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardId: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  badge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  routeSection: { marginBottom: 10 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  routeLine: { width: 1, height: 10, backgroundColor: COLORS.border, marginLeft: 3.5, marginVertical: 2 },
  routeText: { flex: 1, color: COLORS.text, fontSize: 13 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  footerMeta: { color: COLORS.muted, fontSize: 11 },
  footerFare: { color: COLORS.accent, fontSize: 14, fontWeight: '800' },
  footerRating: { color: COLORS.accent, fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: 60 },
});
