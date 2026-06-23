import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C',
};

function Stars({ rating, size = 16 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <Text key={s} style={{ fontSize: size, color: s <= rating ? COLORS.accent : COLORS.border }}>★</Text>
      ))}
    </View>
  );
}

export default function GroceryReviewsScreen({ route, navigation }) {
  const { storeName = 'Épicerie', storeId } = route.params || {};
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myText, setMyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    if (!storeId) { setLoading(false); setError(true); return; }
    setLoading(true);
    api.get(`/api/reviews/${storeId}`)
      .then((res) => { setReviews(res.data?.reviews || []); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [storeId]);

  useEffect(() => { load(); }, [load]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const handleSubmit = async () => {
    if (myRating === 0) { Alert.alert('Note requise'); return; }
    if (!storeId) { Alert.alert('Erreur', 'Magasin introuvable.'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/api/reviews', { targetId: storeId, rating: myRating, comment: myText || undefined });
      const r = res.data?.review;
      setReviews(prev => [{
        id: r.id, author: 'Moi', rating: r.rating,
        date: new Date(r.createdAt).toLocaleDateString('fr-TN'),
        comment: r.comment,
      }, ...prev]);
      setMyRating(0); setMyText(''); setShowForm(false);
      Alert.alert('✅ Avis publié', 'Merci pour votre retour !');
    } catch (e) {
      Alert.alert('Erreur', e?.response?.data?.error || "Impossible de publier votre avis. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Avis — {storeName}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={COLORS.accent} style={{ marginTop: 30 }} />
        ) : error ? (
          <View style={{ alignItems: 'center', marginTop: 30 }}>
            <Text style={{ color: COLORS.muted, fontSize: 14, marginBottom: 12 }}>⚠️ Impossible de charger les avis.</Text>
            <TouchableOpacity style={styles.addBtn} onPress={load}>
              <Text style={styles.addBtnText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.avgScore}>{avgRating}</Text>
              <Stars rating={Math.round(parseFloat(avgRating))} size={22} />
              <Text style={styles.reviewCount}>{reviews.length} avis</Text>
            </View>

            {/* Add review */}
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
              <Text style={styles.addBtnText}>{showForm ? '✕ Annuler' : '✏️ Laisser un avis'}</Text>
            </TouchableOpacity>

            {showForm && (
              <View style={styles.formCard}>
                <Text style={styles.fieldLabel}>VOTRE NOTE</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                  {[1,2,3,4,5].map(s => (
                    <TouchableOpacity key={s} onPress={() => setMyRating(s)}>
                      <Text style={{ fontSize: 32, color: s <= myRating ? COLORS.accent : COLORS.border }}>★</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.fieldLabel}>COMMENTAIRE</Text>
                <TextInput
                  style={styles.textarea}
                  placeholder="Partagez votre expérience..."
                  placeholderTextColor={COLORS.muted}
                  value={myText}
                  onChangeText={setMyText}
                  multiline numberOfLines={4}
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  style={[styles.submitBtn, (myRating === 0 || submitting) && { opacity: 0.5 }]}
                  onPress={handleSubmit} disabled={myRating === 0 || submitting}
                >
                  {submitting ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Publier →</Text>}
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.sectionTitle}>{reviews.length} AVIS CLIENTS</Text>
            {reviews.map(r => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{r.author.charAt(0)}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewAuthor}>{r.author}</Text>
                    <Text style={styles.reviewDate}>{r.date}</Text>
                  </View>
                  <Stars rating={r.rating} size={14} />
                </View>
                {r.comment ? <Text style={styles.reviewText}>{r.comment}</Text> : null}
              </View>
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4, width: 36 },
  backIcon: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  summaryCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: COLORS.border, gap: 6 },
  avgScore: { color: COLORS.accent, fontSize: 48, fontWeight: '900' },
  reviewCount: { color: COLORS.muted, fontSize: 13 },
  addBtn: { backgroundColor: COLORS.accent + '20', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: COLORS.accent + '40' },
  addBtnText: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
  formCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  fieldLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  textarea: { backgroundColor: COLORS.bg, borderRadius: 10, padding: 12, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, minHeight: 100, marginBottom: 12 },
  submitBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  submitBtnText: { color: '#000', fontSize: 14, fontWeight: '900' },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  reviewCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accent + '25', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.accent, fontSize: 16, fontWeight: '900' },
  reviewAuthor: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  reviewDate: { color: COLORS.muted, fontSize: 11 },
  reviewText: { color: COLORS.muted, fontSize: 13, lineHeight: 19, marginBottom: 8 },
});
