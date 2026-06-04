import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  StatusBar, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C',
};

const TIPS = [0, 1, 2, 5];
const QUICK_COMMENTS = [
  'Chauffeur ponctuel', 'Très propre', 'Conduite agréable',
  'Sympa et professionnel', 'Musique agréable', 'Route optimale',
];

const STAR_LABELS = ['', 'Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent !'];

export default function TaxiRatingScreen({ navigation, route }) {
  const { orderId } = route?.params || {};
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [tip, setTip] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert('Note requise', 'Donnez au moins 1 étoile.'); return; }
    setSubmitting(true);
    try {
      await api.post(`/api/taxi/${orderId}/rate`, {
        rating,
        tip,
        comment: [comment, ...selectedTags].filter(Boolean).join(' · '),
      });
      navigation.replace('Home');
    } catch {
      Alert.alert('Erreur', 'Impossible d\'envoyer la note.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hovered || rating;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.topSection}>
          <Text style={styles.emoji}>🏁</Text>
          <Text style={styles.title}>Course terminée !</Text>
          <Text style={styles.subtitle}>Comment s'est passée votre course ?</Text>
        </View>

        {/* Stars */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(i => (
            <TouchableOpacity
              key={i}
              onPress={() => setRating(i)}
              onPressIn={() => setHovered(i)}
              onPressOut={() => setHovered(0)}
              activeOpacity={0.7}
            >
              <Text style={[styles.star, i <= displayRating && styles.starActive]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        {displayRating > 0 && (
          <Text style={styles.starLabel}>{STAR_LABELS[displayRating]}</Text>
        )}

        {/* Quick tags */}
        {rating >= 4 && (
          <>
            <Text style={styles.sectionTitle}>CE QUI ÉTAIT BIEN</Text>
            <View style={styles.tagsWrap}>
              {QUICK_COMMENTS.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tag, selectedTags.includes(tag) && styles.tagActive]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Comment */}
        <Text style={styles.sectionTitle}>COMMENTAIRE (OPTIONNEL)</Text>
        <TextInput
          style={styles.commentInput}
          value={comment}
          onChangeText={setComment}
          placeholder="Partagez votre expérience..."
          placeholderTextColor={COLORS.muted}
          multiline
          numberOfLines={3}
        />

        {/* Tip */}
        <Text style={styles.sectionTitle}>POURBOIRE</Text>
        <View style={styles.tipsRow}>
          {TIPS.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tipBtn, tip === t && styles.tipBtnActive]}
              onPress={() => setTip(t)}
            >
              <Text style={[styles.tipText, tip === t && styles.tipTextActive]}>
                {t === 0 ? 'Aucun' : `${t} TND`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tip > 0 && (
          <Text style={styles.tipNote}>
            Le chauffeur recevra {tip.toFixed(3)} TND de pourboire — merci pour lui 🙏
          </Text>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, rating === 0 && { opacity: 0.4 }]}
          onPress={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          {submitting
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.submitText}>Envoyer ma note</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.replace('Home')}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 24, alignItems: 'center' },
  topSection: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  emoji: { fontSize: 56, marginBottom: 12 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '900', marginBottom: 6 },
  subtitle: { color: COLORS.muted, fontSize: 14 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  star: { fontSize: 48, color: COLORS.border },
  starActive: { color: COLORS.accent },
  starLabel: { color: COLORS.accent, fontSize: 16, fontWeight: '700', marginBottom: 24 },
  sectionTitle: {
    color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4,
    marginBottom: 12, marginTop: 8, alignSelf: 'flex-start',
  },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20, alignSelf: 'stretch' },
  tag: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  tagActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  tagText: { color: COLORS.muted, fontSize: 12 },
  tagTextActive: { color: COLORS.accent, fontWeight: '600' },
  commentInput: {
    backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border,
    marginBottom: 20, alignSelf: 'stretch', textAlignVertical: 'top', height: 80,
  },
  tipsRow: { flexDirection: 'row', gap: 10, marginBottom: 12, alignSelf: 'stretch' },
  tipBtn: {
    flex: 1, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 10, alignItems: 'center', backgroundColor: COLORS.surface,
  },
  tipBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tipText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tipTextActive: { color: '#000', fontWeight: '800' },
  tipNote: { color: COLORS.muted, fontSize: 12, marginBottom: 20, textAlign: 'center' },
  submitBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', alignSelf: 'stretch',
  },
  submitText: { color: '#000', fontSize: 16, fontWeight: '800' },
  skipBtn: { marginTop: 12, padding: 8 },
  skipText: { color: COLORS.muted, fontSize: 14 },
});
