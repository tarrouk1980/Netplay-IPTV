import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  green: '#27AE60',
  accent: '#D32F2F',
  gold: '#F5A623',
};

const SERVICE_ICON = { TAXI: '🚕', DELIVERY: '🛵', SOS: '🛻', GROCERY: '🛒' };

function Stars({ rating, size = 16 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <Text style={{ fontSize: size }}>
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
    </Text>
  );
}

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? count / total : 0;
  return (
    <View style={rb.row}>
      <Text style={rb.star}>{star}★</Text>
      <View style={rb.track}>
        <View style={[rb.fill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={rb.count}>{count}</Text>
    </View>
  );
}

const rb = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  star: { color: COLORS.gold, fontSize: 12, width: 20 },
  track: { flex: 1, height: 6, backgroundColor: COLORS.surfaceAlt, borderRadius: 3, overflow: 'hidden', marginHorizontal: 8 },
  fill: { height: '100%', backgroundColor: COLORS.gold, borderRadius: 3 },
  count: { color: COLORS.muted, fontSize: 11, width: 24, textAlign: 'right' },
});

export default function ProviderRatingDetailScreen({ navigation }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState(null); // null = all, 1-5 = star filter

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/provider/reviews');
      setReviews(res.data.reviews || []);
      setSummary(res.data.summary || null);
    } catch {
      setReviews([]);
      setSummary({ avg: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter ? reviews.filter((r) => Math.round(r.rating) === filter) : reviews;

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.gold} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>⭐ Mes avis clients</Text>
        <Text style={s.totalCount}>{reviews.length} avis</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item, i) => item.id || i.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.gold} />}
        ListHeaderComponent={
          <>
            {/* Summary */}
            {summary && (
              <View style={s.summaryCard}>
                <View style={s.summaryLeft}>
                  <Text style={s.avgScore}>{(summary.avg || 0).toFixed(1)}</Text>
                  <Stars rating={summary.avg || 0} size={20} />
                  <Text style={s.totalTxt}>{summary.total || 0} avis</Text>
                </View>
                <View style={s.summaryRight}>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <RatingBar key={star} star={star} count={summary.distribution?.[star] || 0} total={summary.total || 0} />
                  ))}
                </View>
              </View>
            )}

            {/* Star filter */}
            <View style={s.filterRow}>
              <TouchableOpacity style={[s.filterBtn, !filter && s.filterActive]} onPress={() => setFilter(null)}>
                <Text style={[s.filterTxt, !filter && s.filterActiveTxt]}>Tous</Text>
              </TouchableOpacity>
              {[5, 4, 3, 2, 1].map((star) => (
                <TouchableOpacity key={star} style={[s.filterBtn, filter === star && s.filterActive]} onPress={() => setFilter(filter === star ? null : star)}>
                  <Text style={[s.filterTxt, filter === star && s.filterActiveTxt]}>{star}★</Text>
                </TouchableOpacity>
              ))}
            </View>

            {filtered.length === 0 && (
              <View style={s.empty}>
                <Text style={{ fontSize: 40, marginBottom: 10 }}>💬</Text>
                <Text style={s.emptyTitle}>Aucun avis</Text>
                <Text style={s.emptySub}>{filter ? `Aucun avis ${filter} étoile(s).` : 'Vous n\'avez pas encore reçu d\'avis.'}</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => {
          const roundedRating = Math.round(item.rating || 0);
          const starColor = roundedRating >= 4 ? COLORS.gold : roundedRating >= 3 ? COLORS.orange : COLORS.accent;
          return (
            <View style={s.reviewCard}>
              <View style={s.reviewTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.reviewClient}>{item.client?.name || 'Client anonyme'}</Text>
                  <Text style={s.reviewDate}>
                    {new Date(item.createdAt).toLocaleDateString('fr-TN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </Text>
                </View>
                <View style={s.reviewRating}>
                  <Text style={[s.reviewStars, { color: starColor }]}>{'★'.repeat(roundedRating)}{'☆'.repeat(5 - roundedRating)}</Text>
                  <Text style={[s.reviewScore, { color: starColor }]}>{(item.rating || 0).toFixed(1)}</Text>
                </View>
              </View>

              {item.comment ? (
                <Text style={s.reviewComment}>"{item.comment}"</Text>
              ) : (
                <Text style={s.noComment}>Aucun commentaire</Text>
              )}

              {item.serviceType && (
                <Text style={s.reviewService}>{SERVICE_ICON[item.serviceType] || ''} {item.serviceType}</Text>
              )}

              {item.orderId && (
                <TouchableOpacity onPress={() => navigation.navigate('ClientOrderHistoryDetail', { orderId: item.orderId })}>
                  <Text style={s.reviewLink}>Voir la course →</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', flex: 1 },
  totalCount: { color: COLORS.muted, fontSize: 13 },
  summaryCard: { flexDirection: 'row', backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 16, marginBottom: 8 },
  summaryLeft: { alignItems: 'center', justifyContent: 'center', width: 80 },
  avgScore: { color: COLORS.gold, fontSize: 36, fontWeight: '900', marginBottom: 4 },
  totalTxt: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  summaryRight: { flex: 1, justifyContent: 'center' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 6, marginBottom: 12, marginTop: 4 },
  filterBtn: { backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  filterActive: { borderColor: COLORS.gold, backgroundColor: COLORS.gold + '22' },
  filterTxt: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  filterActiveTxt: { color: COLORS.gold },
  reviewCard: { backgroundColor: COLORS.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 10, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reviewClient: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  reviewDate: { color: COLORS.muted, fontSize: 11 },
  reviewRating: { alignItems: 'flex-end' },
  reviewStars: { fontSize: 14 },
  reviewScore: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  reviewComment: { color: COLORS.text, fontSize: 13, fontStyle: 'italic', lineHeight: 20, marginBottom: 8 },
  noComment: { color: COLORS.muted, fontSize: 12, fontStyle: 'italic', marginBottom: 8 },
  reviewService: { color: COLORS.muted, fontSize: 11, marginBottom: 4 },
  reviewLink: { color: COLORS.green, fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 40 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center' },
});
