import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

export default function MerchantReviewsScreen({ navigation }) {
  const { user } = useAuthStore();
  const [filterRating, setFilterRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!user?.id) return;
    setLoading(true);
    api.get(`/api/reviews/${user.id}`)
      .then((r) => { setReviews(r.data.reviews || []); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const filtered = filterRating === 0
    ? reviews
    : reviews.filter(r => r.rating === filterRating);

  const total = reviews.length;
  const avgRating = total > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)
    : '—';

  const dist = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    return { stars, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 };
  });

  const renderItem = ({ item: r }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewTop}>
        <Text style={{ fontSize: 28 }}>👤</Text>
        <View style={{ flex: 1 }}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewClient}>{r.author}</Text>
            <Text style={styles.reviewDate}>{r.date}</Text>
          </View>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(s => (
              <Text key={s} style={{ fontSize: 14, opacity: s <= r.rating ? 1 : 0.2 }}>⭐</Text>
            ))}
          </View>
        </View>
      </View>
      {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.root, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ color: COLORS.muted, textAlign: 'center', marginBottom: 16 }}>
          Impossible de charger les avis.
        </Text>
        <TouchableOpacity onPress={load} style={{ backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 }}>
          <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Avis clients</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Rating summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <Text style={styles.bigRating}>{avgRating}</Text>
          <Text style={{ fontSize: 24 }}>⭐</Text>
          <Text style={styles.totalReviews}>{total} avis</Text>
        </View>
        <View style={styles.summaryRight}>
          {dist.map(d => (
            <View key={d.stars} style={styles.distRow}>
              <Text style={styles.distStars}>{d.stars}⭐</Text>
              <View style={styles.distBarWrap}>
                <View style={[styles.distBar, {
                  width: `${d.pct}%`,
                  backgroundColor: d.stars >= 4 ? COLORS.green : d.stars === 3 ? COLORS.orange : COLORS.red,
                }]} />
              </View>
              <Text style={styles.distPct}>{d.pct}%</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Filter by rating */}
      <View style={styles.filtersRow}>
        {[0, 5, 4, 3, 2, 1].map(r => (
          <TouchableOpacity
            key={r}
            style={[styles.filterChip, filterRating === r && styles.filterChipActive]}
            onPress={() => setFilterRating(r)}
          >
            <Text style={[styles.filterText, filterRating === r && { color: '#000' }]}>
              {r === 0 ? 'Tous' : `${r}⭐`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={r => String(r.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>💬</Text>
            <Text style={styles.emptyText}>Aucun avis</Text>
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
  summaryCard: {
    flexDirection: 'row', margin: 16, backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 16,
  },
  summaryLeft: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  bigRating: { color: COLORS.white, fontSize: 36, fontWeight: '900' },
  totalReviews: { color: COLORS.muted, fontSize: 11 },
  summaryRight: { flex: 1, gap: 4 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  distStars: { color: COLORS.muted, fontSize: 10, width: 24 },
  distBarWrap: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  distBar: { height: '100%', borderRadius: 3 },
  distPct: { color: COLORS.muted, fontSize: 10, width: 28, textAlign: 'right' },
  filtersRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingBottom: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  reviewCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  reviewTop: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewClient: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  reviewDate: { color: COLORS.muted, fontSize: 11 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  reviewComment: { color: COLORS.muted, fontSize: 13 },
  emptyBox: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: COLORS.muted, fontSize: 15 },
});
