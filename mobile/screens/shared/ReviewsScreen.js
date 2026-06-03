import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F',
};

const MOCK_REVIEWS = [
  { id: 'R001', author: 'Sonia M.', avatar: '👩', date: '15/01/2025', rating: 5, comment: 'Chauffeur très ponctuel et véhicule propre. Je recommande vivement !', service: 'Taxi', verified: true },
  { id: 'R002', author: 'Yassine A.', avatar: '🧑', date: '14/01/2025', rating: 4, comment: 'Bon service dans l\'ensemble. Légère attente mais rien de grave.', service: 'Taxi', verified: true },
  { id: 'R003', author: 'Fatma K.', avatar: '👩‍🦱', date: '12/01/2025', rating: 5, comment: 'EasyWay change la vie ! Livraison rapide et pas chère.', service: 'Livraison', verified: false },
  { id: 'R004', author: 'Mohamed T.', avatar: '🧔', date: '10/01/2025', rating: 3, comment: 'Correct mais prix un peu élevé par rapport à la concurrence.', service: 'SOS', verified: true },
  { id: 'R005', author: 'Ines H.', avatar: '👩‍💼', date: '08/01/2025', rating: 5, comment: 'Easy For Lady est parfait. Je me sens en sécurité à chaque trajet.', service: 'Easy For Lady', verified: true },
];

function Stars({ value, size = 16, onSelect }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <TouchableOpacity key={s} onPress={() => onSelect?.(s)} disabled={!onSelect}>
          <Text style={{ fontSize: size, color: s <= value ? COLORS.accent : COLORS.border }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function ReviewsScreen({ navigation, route }) {
  const { user } = useAuthStore();
  const targetId = route?.params?.targetId;
  const targetName = route?.params?.targetName || 'Ce prestataire';

  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [loading, setLoading] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState('avis');

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
  const dist = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
    pct: reviews.length ? (reviews.filter((r) => r.rating === s).length / reviews.length) * 100 : 0,
  }));

  useEffect(() => {
    if (!targetId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/reviews/${targetId}`);
        if (res.data?.reviews?.length) setReviews(res.data.reviews);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, [targetId]);

  const handleSubmit = async () => {
    if (myRating === 0) { Alert.alert('Erreur', 'Choisissez une note'); return; }
    if (!myComment.trim()) { Alert.alert('Erreur', 'Écrivez un commentaire'); return; }
    setSubmitting(true);
    try {
      await api.post('/api/reviews', { targetId, rating: myRating, comment: myComment });
    } catch {}
    const newReview = {
      id: `R${Date.now()}`, author: user?.name || 'Moi', avatar: '😊',
      date: new Date().toLocaleDateString('fr-TN'),
      rating: myRating, comment: myComment, service: 'Taxi', verified: false,
    };
    setReviews((r) => [newReview, ...r]);
    setMyRating(0);
    setMyComment('');
    setSubmitting(false);
    Alert.alert('Merci !', 'Votre avis a été publié.');
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>⭐ Avis & Notes</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <Text style={styles.avgNum}>{avgRating}</Text>
          <Stars value={Math.round(parseFloat(avgRating))} size={18} />
          <Text style={styles.totalReviews}>{reviews.length} avis</Text>
        </View>
        <View style={styles.summaryRight}>
          {dist.map((d) => (
            <View key={d.star} style={styles.distRow}>
              <Text style={styles.distStar}>{d.star}★</Text>
              <View style={styles.distBar}>
                <View style={[styles.distFill, { width: `${d.pct}%` }]} />
              </View>
              <Text style={styles.distCount}>{d.count}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[{ key: 'avis', label: '⭐ Tous les avis' }, { key: 'noter', label: '✏️ Laisser un avis' }].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && { color: '#000' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'avis' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {loading && <ActivityIndicator color={COLORS.accent} style={{ marginTop: 20 }} />}
          {reviews.map((r) => (
            <View key={r.id} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={{ fontSize: 28 }}>{r.avatar}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.reviewAuthor}>{r.author}</Text>
                    {r.verified && <Text style={{ color: COLORS.accent, fontSize: 11 }}>✓ Vérifié</Text>}
                  </View>
                  <Text style={styles.reviewDate}>{r.date} · {r.service}</Text>
                </View>
                <Stars value={r.rating} size={13} />
              </View>
              <Text style={styles.reviewComment}>{r.comment}</Text>
            </View>
          ))}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {tab === 'noter' && (
        <ScrollView contentContainerStyle={styles.formBox} showsVerticalScrollIndicator={false}>
          <Text style={styles.formLabel}>Notez {targetName}</Text>
          <Stars value={myRating} size={36} onSelect={setMyRating} />
          <Text style={[styles.formLabel, { marginTop: 20 }]}>Votre commentaire</Text>
          <TextInput
            style={styles.commentInput}
            value={myComment}
            onChangeText={setMyComment}
            placeholder="Partagez votre expérience..."
            placeholderTextColor={COLORS.muted}
            multiline
            maxLength={300}
          />
          <Text style={styles.charCount}>{myComment.length}/300</Text>
          <TouchableOpacity
            style={[styles.submitBtn, (submitting || myRating === 0) && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={submitting || myRating === 0}
          >
            {submitting
              ? <ActivityIndicator color="#000" size="small" />
              : <Text style={styles.submitBtnText}>Publier mon avis</Text>}
          </TouchableOpacity>
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
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
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  summaryCard: {
    flexDirection: 'row', margin: 12, backgroundColor: COLORS.surface,
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  summaryLeft: { alignItems: 'center', marginRight: 20, minWidth: 70 },
  avgNum: { color: COLORS.accent, fontSize: 40, fontWeight: '900' },
  totalReviews: { color: COLORS.muted, fontSize: 11, marginTop: 6 },
  summaryRight: { flex: 1, gap: 5, justifyContent: 'center' },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  distStar: { color: COLORS.muted, fontSize: 11, width: 22 },
  distBar: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  distFill: { height: 6, backgroundColor: COLORS.accent, borderRadius: 3 },
  distCount: { color: COLORS.muted, fontSize: 11, width: 18, textAlign: 'right' },
  tabs: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 4 },
  tab: {
    flex: 1, paddingVertical: 9, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  list: { paddingHorizontal: 12, paddingTop: 8 },
  reviewCard: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 10,
  },
  reviewTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reviewAuthor: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  reviewDate: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  reviewComment: { color: COLORS.muted, fontSize: 13, lineHeight: 19 },
  formBox: { padding: 20 },
  formLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  commentInput: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, minHeight: 100, textAlignVertical: 'top', marginBottom: 6,
  },
  charCount: { color: COLORS.muted, fontSize: 11, textAlign: 'right', marginBottom: 16 },
  submitBtn: {
    backgroundColor: COLORS.accent, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  submitBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
});
