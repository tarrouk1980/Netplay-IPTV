import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  accent: '#F5A623',
  green: '#27AE60',
  red: '#E74C3C',
};

const SERVICE_ICONS = { TAXI: '🚕', SOS: '🛻', DELIVERY: '🛵', GROCERY: '🛒' };

const MOCK_REVIEWS = [
  { id: 'r1', rating: 5, comment: 'Très professionnel, ponctuel et courtois.', serviceType: 'TAXI', clientName: 'Salim B.', createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 'r2', rating: 4, comment: 'Bonne conduite, légèrement en retard.', serviceType: 'TAXI', clientName: 'Amira K.', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'r3', rating: 5, comment: 'Excellent service ! Je recommande vivement.', serviceType: 'TAXI', clientName: 'Nizar R.', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'r4', rating: 3, comment: 'Correct mais voiture un peu vieille.', serviceType: 'TAXI', clientName: 'Ines H.', createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 'r5', rating: 5, comment: null, serviceType: 'TAXI', clientName: 'Tarek M.', createdAt: new Date(Date.now() - 9 * 86400000).toISOString() },
  { id: 'r6', rating: 4, comment: 'Rapide et efficace.', serviceType: 'TAXI', clientName: 'Rania T.', createdAt: new Date(Date.now() - 12 * 86400000).toISOString() },
];

function Stars({ rating, size = 16 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={{ fontSize: size, color: i <= rating ? '#F5A623' : '#3A3A4A' }}>★</Text>
      ))}
    </View>
  );
}

function RatingBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={bar.row}>
      <Text style={bar.label}>{label}★</Text>
      <View style={bar.track}>
        <View style={[bar.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={bar.count}>{count}</Text>
    </View>
  );
}

const bar = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  label: { color: COLORS.muted, fontSize: 12, width: 14 },
  track: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  count: { color: COLORS.muted, fontSize: 11, width: 20, textAlign: 'right' },
});

function ReviewCard({ review }) {
  const date = new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.clientAvatar}>
          <Text style={styles.clientInitial}>{review.clientName?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.clientName}>{review.clientName}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Stars rating={review.rating} size={13} />
            <Text style={styles.serviceTag}>{SERVICE_ICONS[review.serviceType]} {review.serviceType}</Text>
          </View>
        </View>
        <Text style={styles.cardDate}>{date}</Text>
      </View>
      {review.comment ? (
        <Text style={styles.comment}>"{review.comment}"</Text>
      ) : (
        <Text style={styles.noComment}>Aucun commentaire</Text>
      )}
    </View>
  );
}

export default function ProviderReviewsScreen({ navigation }) {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(0); // 0=all, 1-5=star

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/provider/reviews');
      setReviews(res.data?.reviews || MOCK_REVIEWS);
    } catch {
      setReviews(MOCK_REVIEWS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 0 ? reviews : reviews.filter(r => r.rating === filter);
  const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const counts = [5, 4, 3, 2, 1].map(n => ({ n, count: reviews.filter(r => r.rating === n).length }));
  const barColors = { 5: COLORS.green, 4: '#8BC34A', 3: COLORS.accent, 2: '#FF9800', 1: COLORS.red };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes avis clients</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Global rating card */}
      <View style={styles.ratingCard}>
        <View style={styles.ratingLeft}>
          <Text style={styles.avgNum}>{avg.toFixed(1)}</Text>
          <Stars rating={Math.round(avg)} size={20} />
          <Text style={styles.totalCount}>{reviews.length} avis</Text>
        </View>
        <View style={styles.ratingRight}>
          {counts.map(({ n, count }) => (
            <RatingBar key={n} label={n} count={count} total={reviews.length} color={barColors[n]} />
          ))}
        </View>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {[0, 5, 4, 3, 2, 1].map(n => (
          <TouchableOpacity
            key={n}
            style={[styles.filterChip, filter === n && styles.filterChipActive]}
            onPress={() => setFilter(n)}
          >
            <Text style={[styles.filterChipText, filter === n && styles.filterChipTextActive]}>
              {n === 0 ? 'Tous' : `${n}★`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyText}>Aucun avis pour cette note</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={r => r.id}
          renderItem={({ item }) => <ReviewCard review={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
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
  ratingCard: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    margin: 16, borderRadius: 16, padding: 16, gap: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  ratingLeft: { alignItems: 'center', justifyContent: 'center', width: 80 },
  avgNum: { color: COLORS.text, fontSize: 36, fontWeight: '900', marginBottom: 4 },
  totalCount: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  ratingRight: { flex: 1, justifyContent: 'center' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border,
  },
  filterChipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '18' },
  filterChipText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.accent },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  clientAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.accent + '22', alignItems: 'center', justifyContent: 'center',
  },
  clientInitial: { color: COLORS.accent, fontSize: 16, fontWeight: '800' },
  cardMeta: { flex: 1 },
  clientName: { color: COLORS.text, fontSize: 13, fontWeight: '700', marginBottom: 3 },
  serviceTag: { color: COLORS.muted, fontSize: 11 },
  cardDate: { color: COLORS.muted, fontSize: 11 },
  comment: { color: COLORS.text, fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
  noComment: { color: COLORS.muted, fontSize: 12, fontStyle: 'italic' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { color: COLORS.muted, fontSize: 15 },
});
