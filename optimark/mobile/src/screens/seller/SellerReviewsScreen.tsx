import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../lib/api';

export default function SellerReviewsScreen() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    api.get('/reviews/seller')
      .then(r => setReviews(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const submit = async (reviewId: string) => {
    const reply = replyMap[reviewId]?.trim();
    if (!reply) { Alert.alert('Erreur', 'Réponse vide.'); return; }
    setSubmitting(reviewId);
    try {
      await api.patch(`/reviews/${reviewId}/reply`, { reply });
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, sellerReply: reply } : r));
      setReplyMap(prev => { const n = { ...prev }; delete n[reviewId]; return n; });
    } catch {
      Alert.alert('Erreur', "Impossible d'envoyer la réponse.");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return <View style={s.center}><ActivityIndicator color="#9f1239" size="large" /></View>;

  return (
    <FlatList
      style={s.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      data={reviews}
      keyExtractor={r => r.id}
      ListHeaderComponent={<Text style={s.title}>⭐ Avis clients</Text>}
      ListEmptyComponent={<Text style={s.empty}>Aucun avis pour l&apos;instant</Text>}
      renderItem={({ item: r }) => (
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={s.user}>{r.user?.name || 'Anonyme'}</Text>
              <Text style={s.product} numberOfLines={1}>{r.product?.title || r.service?.title || '—'}</Text>
            </View>
            <Text style={s.stars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</Text>
          </View>
          {r.comment && <Text style={s.comment}>{r.comment}</Text>}
          <Text style={s.date}>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</Text>

          {r.sellerReply ? (
            <View style={s.replyBox}>
              <Text style={s.replyLabel}>Votre réponse :</Text>
              <Text style={s.replyText}>{r.sellerReply}</Text>
            </View>
          ) : (
            <View style={{ marginTop: 10 }}>
              <TextInput
                value={replyMap[r.id] || ''}
                onChangeText={v => setReplyMap(prev => ({ ...prev, [r.id]: v }))}
                placeholder="Répondre à cet avis..."
                multiline
                style={s.input}
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity
                style={s.btn}
                onPress={() => submit(r.id)}
                disabled={submitting === r.id || !replyMap[r.id]?.trim()}
              >
                <Text style={s.btnText}>{submitting === r.id ? 'Envoi...' : 'Répondre'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 16 },
  empty: { color: '#94a3b8', textAlign: 'center', paddingVertical: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  user: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  product: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  stars: { color: '#f59e0b', fontSize: 14, fontWeight: '900' },
  comment: { fontSize: 13, color: '#475569', marginBottom: 6, lineHeight: 20 },
  date: { fontSize: 11, color: '#94a3b8' },
  replyBox: { marginTop: 10, backgroundColor: '#fff1f2', borderLeftWidth: 3, borderLeftColor: '#9f1239', borderRadius: 8, padding: 10 },
  replyLabel: { fontSize: 10, fontWeight: '800', color: '#9f1239', textTransform: 'uppercase', marginBottom: 4 },
  replyText: { fontSize: 13, color: '#334155' },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 10, fontSize: 13, color: '#0f172a', marginTop: 10, minHeight: 60, textAlignVertical: 'top' },
  btn: { backgroundColor: '#9f1239', borderRadius: 12, padding: 10, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
