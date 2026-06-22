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

const STATUS_LABELS = { COMPLETED: 'Livré', CANCELLED: 'Annulé', IN_PROGRESS: 'En cours', ACCEPTED: 'Acceptée', PENDING: 'En attente' };
const STATUS_COLORS = { COMPLETED: COLORS.green, CANCELLED: COLORS.red, IN_PROGRESS: COLORS.blue, ACCEPTED: COLORS.blue, PENDING: COLORS.accent };

function DeliveryCard({ item }) {
  const statusColor = STATUS_COLORS[item.status] || COLORS.muted;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardId}>#{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor + '50' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{STATUS_LABELS[item.status] || item.status}</Text>
        </View>
      </View>

      <View style={styles.routeSection}>
        <View style={styles.routeRow}>
          <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
          <Text style={styles.routeText} numberOfLines={1}>{item.originAddress || '—'}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <View style={[styles.dot, { backgroundColor: COLORS.accent }]} />
          <Text style={styles.routeText} numberOfLines={1}>{item.destinationAddress || '—'}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.footerDate}>{new Date(item.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</Text>
        <Text style={styles.footerClient} numberOfLines={1}>{item.client?.name || ''}</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.footerAmount}>{Number(item.price || 0).toFixed(3)} TND</Text>
      </View>
    </View>
  );
}

export default function LivreurHistoryScreen({ navigation }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [stats, setStats] = useState({ total: 0, earnings: 0 });

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/delivery/livreur/earnings', { params: { period: 'month' } })
      .then(r => {
        const orders = r.data.orders || [];
        setDeliveries(orders);
        setStats({ total: r.data.totalDeliveries || 0, earnings: r.data.totalRevenue || 0 });
        setError(false);
      })
      .catch(() => setError(true))
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
      ) : error ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 40 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, marginTop: 12, textAlign: 'center', paddingHorizontal: 30 }}>
            Impossible de charger votre historique.
          </Text>
          <TouchableOpacity onPress={load} style={{ marginTop: 14, backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
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
  footerClient: { color: COLORS.muted, fontSize: 11, maxWidth: 100 },
  footerAmount: { color: COLORS.accent, fontSize: 14, fontWeight: '800' },
  empty: { alignItems: 'center', paddingVertical: 60 },
});
