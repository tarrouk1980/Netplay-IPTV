import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  accent: '#F5A623',
  star: '#FFD700',
  success: '#27AE60',
};

const TAGS_POSITIVE = [
  { key: 'punctual', label: '⏱ Ponctuel' },
  { key: 'polite', label: '😊 Poli' },
  { key: 'clean_car', label: '🚗 Voiture propre' },
  { key: 'safe_driving', label: '🛡 Conduite sûre' },
  { key: 'good_music', label: '🎵 Bonne ambiance' },
  { key: 'knows_roads', label: '🗺 Bon itinéraire' },
];

const TAGS_NEGATIVE = [
  { key: 'late', label: '⏰ En retard' },
  { key: 'rude', label: '😤 Impoli' },
  { key: 'dirty_car', label: '🚗 Voiture sale' },
  { key: 'bad_driving', label: '⚠️ Conduite dangereuse' },
  { key: 'wrong_route', label: '🔀 Mauvais itinéraire' },
  { key: 'phone_use', label: '📱 Téléphone au volant' },
];

function StarPicker({ value, onChange }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity key={i} onPress={() => onChange(i)} activeOpacity={0.7}>
          <Text style={[styles.starIcon, { color: i <= value ? COLORS.star : COLORS.border }]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function RatingScreen({ route, navigation }) {
  const { orderId, driverName, driverInitial } = route.params || {};
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  const [tip, setTip] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentTags = rating >= 4 ? TAGS_POSITIVE : rating > 0 ? TAGS_NEGATIVE : [];

  const toggleTag = (key) => {
    setSelectedTags((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Note requise', 'Veuillez donner une note de 1 à 5 étoiles.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/api/orders/${orderId}/rate`, {
        rating,
        tags: selectedTags,
        comment: comment.trim(),
        tip: tip ? parseFloat(tip) : 0,
      });
      Alert.alert(
        'Merci !',
        'Votre avis a été enregistré.',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Impossible d\'enregistrer la note.');
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabel = ['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent !'][rating] || '';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Comment s'est passée votre course ?</Text>
        </View>

        {/* Driver avatar */}
        <View style={styles.driverCard}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverAvatarText}>{driverInitial || '🚕'}</Text>
          </View>
          <Text style={styles.driverName}>{driverName || 'Votre chauffeur'}</Text>
          <Text style={styles.driverSub}>Comment notez-vous cette course ?</Text>
        </View>

        {/* Stars */}
        <View style={styles.starsSection}>
          <StarPicker value={rating} onChange={(v) => { setRating(v); setSelectedTags([]); }} />
          {rating > 0 && (
            <Text style={[styles.ratingLabel, { color: rating >= 4 ? COLORS.success : rating >= 3 ? COLORS.accent : '#E74C3C' }]}>
              {ratingLabel}
            </Text>
          )}
        </View>

        {/* Tags */}
        {currentTags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {rating >= 4 ? 'Ce qui était bien :' : 'Ce qui n\'était pas bien :'}
            </Text>
            <View style={styles.tagsWrap}>
              {currentTags.map((tag) => {
                const active = selectedTags.includes(tag.key);
                return (
                  <TouchableOpacity
                    key={tag.key}
                    style={[styles.tag, active && (rating >= 4 ? styles.tagActiveGood : styles.tagActiveBad)]}
                    onPress={() => toggleTag(tag.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tagText, active && styles.tagTextActive]}>
                      {tag.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Comment */}
        {rating > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Commentaire (optionnel)</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Décrivez votre expérience..."
              placeholderTextColor={COLORS.textMuted}
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={300}
              numberOfLines={4}
            />
            <Text style={styles.charCount}>{comment.length}/300</Text>
          </View>
        )}

        {/* Tip */}
        {rating >= 4 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Pourboire (optionnel)</Text>
            <View style={styles.tipRow}>
              {['0', '1', '2', '5'].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.tipBtn, tip === amt && styles.tipBtnActive]}
                  onPress={() => setTip(amt === '0' ? '' : amt)}
                >
                  <Text style={[styles.tipBtnText, tip === amt && styles.tipBtnTextActive]}>
                    {amt === '0' ? 'Aucun' : `+${amt} TND`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, (rating === 0 || submitting) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          {submitting
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.submitBtnText}>Envoyer mon avis</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.skipBtnText}>Passer →</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 24, paddingBottom: 8, alignItems: 'center' },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  driverCard: { alignItems: 'center', padding: 24 },
  driverAvatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.accent + '33',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, borderWidth: 2, borderColor: COLORS.accent,
  },
  driverAvatarText: { fontSize: 32, fontWeight: '700', color: COLORS.accent },
  driverName: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  driverSub: { color: COLORS.textMuted, fontSize: 13, marginTop: 4 },
  starsSection: { alignItems: 'center', paddingBottom: 20 },
  starRow: { flexDirection: 'row', gap: 8 },
  starIcon: { fontSize: 44 },
  ratingLabel: { fontSize: 16, fontWeight: '700', marginTop: 10 },
  section: {
    backgroundColor: COLORS.surface, marginHorizontal: 16,
    marginBottom: 12, borderRadius: 16, padding: 16,
  },
  sectionTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#12121C', borderWidth: 1, borderColor: COLORS.border,
  },
  tagActiveGood: { borderColor: COLORS.success, backgroundColor: COLORS.success + '22' },
  tagActiveBad: { borderColor: '#E74C3C', backgroundColor: '#E74C3C22' },
  tagText: { color: COLORS.textMuted, fontSize: 13 },
  tagTextActive: { color: COLORS.text, fontWeight: '600' },
  commentInput: {
    backgroundColor: '#12121C', borderRadius: 12,
    padding: 14, color: COLORS.text, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.border,
    textAlignVertical: 'top', minHeight: 100,
  },
  charCount: { color: COLORS.textMuted, fontSize: 11, textAlign: 'right', marginTop: 4 },
  tipRow: { flexDirection: 'row', gap: 10 },
  tipBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#12121C', borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
  },
  tipBtnActive: { borderColor: COLORS.success, backgroundColor: COLORS.success + '22' },
  tipBtnText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 13 },
  tipBtnTextActive: { color: COLORS.success },
  submitBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14,
    marginHorizontal: 16, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },
  skipBtn: { alignItems: 'center', paddingVertical: 16 },
  skipBtnText: { color: COLORS.textMuted, fontSize: 14 },
});
