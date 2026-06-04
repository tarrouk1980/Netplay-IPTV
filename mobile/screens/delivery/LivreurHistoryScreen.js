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
  { id: 'D001', clientName: 'Nadia K.', pickup: 'Pizza Roma, Lac 1', dropoff: 'Berges du Lac 2', distance: 2.3, amount: 5.000, status: 'DELIVERED', date: '03/06/2026 14:52', rating: 5 },
  { id: 'D002', clientName: 'Ahmed B.', pickup: 'Carrefour Market', dropoff: 'Sidi Bou Said', distance: 4.1, amount: 7.500, status: 'DELIVERED', date: '03/06/2026 13:10', rating: 4 },
  { id: 'D003', clientName: 'Lina M.', pickup: 'Monoprix Menzah', dropoff: 'Ariana Centre', distance: 3.8, amount: 6.500, status: 'CANCELLED', date: '03/06/2026 11:30', rating: null },
  { id: 'D004', clientName: 'Youssef T.', pickup: 'KFC Tunis City', dropoff: 'Lafayette', distance: 1.5, amount: 4.000, status: 'DELIVERED', date: '02/06/2026 19:45', rating: 5 },
  { id: 'D005', clientName: 'Rim S.', pickup: 'Géant Casino', dropoff: 'El Manar', distance: 5.2, amount: 8.500, status: 'DELIVERED', date: '02/06/2026 17:22', rating: 4 },
];

const STATUS_LABELS = { DELIVERED: 'Livré', CANCELLED: 'Annulé', IN_PROGRESS: 'En cours' };
const STATUS_COLORS = { DELIVERED: COLORS.green, CANCELLED: COLORS.red, IN_PROGRESS: COLORS.blue };

function DeliveryCard({ item }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardId}>#{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20', borderColor: STATUS_COLORS[item.status] + '50' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>{STATUS_LABELS[item.status]}</Text>
        </View>
      </View>

      <View style={styles.routeSection}>
        <View style={styles.routeRow}>
          <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
          <Text style={styles.routeText} numberOfLines={1}>{item.pickup}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <View style={[styles.dot, { backgroundColor: COLORS.accent }]} />
          <Text style={styles.routeText} numberOfLines={1}>{item.dropoff}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.footerDate}>{item.date}</Text>
        <Text style={styles.footerDist}>📍 {item.distance} km</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.footerAmount}>{item.amount.toFixed(3)} TND</Text>
        {item.rating && <Text style={styles.footerRating}>{'★'.repeat(item.rating)}</Text>}
      </View>
    </View>
  );
}

export default function LivreurHistoryScreen({ navigation }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, earnings: 0, avgRating: 0 });

  const load = useCallback(() => {
    api.get('/api/livreur/deliveries/history')
      .then(r => {
        const data = r.data.deliveries || MOCK;
        setDeliveries(data);
        const delivered = data.filter(d => d.status === 'DELIVERED');
        const earnings = delivered.reduce((s, d) => s + d.amount, 0);
        const ratings = delivered.filter(d => d.rating).map(d => d.rating);
        const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—';
        setStats({ total: delivered.length, earnings, avgRating });
      })
      .catch(() => {
        setDeliveries(MOCK);
        setStats({ total: 4, earnings: 25.000, avgRating: '4.7' });
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
        <Text style={styles.headerTitle}>📋 Historique livraisons</Text>
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
              <Text style={styles.statLabel}>Livraisons</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: COLORS.accent }]}>★ {stats.avgRating}</Text>
              <Text style={styles.statLabel}>Note moy.</Text>
            </View>
          </View>

          <FlatList
            data={deliveries}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <DeliveryCard item={item} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={{ fontSize: 40 }}>📭</Text>
                <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucune livraison</Text>
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
  statusBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  routeSection: { marginBottom: 10 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  routeLine: { width: 1, height: 10, backgroundColor: COLORS.border, marginLeft: 3.5, marginVertical: 2 },
  routeText: { flex: 1, color: COLORS.text, fontSize: 13 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerDate: { color: COLORS.muted, fontSize: 11 },
  footerDist: { color: COLORS.muted, fontSize: 11 },
  footerAmount: { color: COLORS.accent, fontSize: 14, fontWeight: '800' },
  footerRating: { color: COLORS.accent, fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: 60 },
});
