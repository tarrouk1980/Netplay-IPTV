import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C',
};

const CATEGORIES = [
  { key: 'taxi', icon: '🚕', label: 'Taxi' },
  { key: 'delivery', icon: '🛵', label: 'Livraison' },
  { key: 'sos', icon: '🛻', label: 'Dépannage' },
  { key: 'grocery', icon: '🛒', label: 'Épicerie' },
  { key: 'app', icon: '📱', label: 'Application' },
  { key: 'other', icon: '💬', label: 'Autre' },
];

const TAGS = [
  'Chauffeur courtois', 'Trajet rapide', 'Véhicule propre',
  'Ponctualité', 'Prix correct', 'Navigation exacte',
  'Mauvaise attitude', 'Retard', 'Problème de paiement',
];

export default function ClientFeedbackScreen({ navigation }) {
  const [category, setCategory] = useState('app');
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Note requise', 'Veuillez attribuer une note avant d\'envoyer.');
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    setSubmitting(false);
    Alert.alert('Merci !', 'Votre avis a été envoyé avec succès.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💬 Donner un avis</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category */}
        <Text style={styles.sectionTitle}>CATÉGORIE</Text>
        <View style={styles.catRow}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c.key}
              style={[styles.catBtn, category === c.key && styles.catBtnActive]}
              onPress={() => setCategory(c.key)}
            >
              <Text style={styles.catIcon}>{c.icon}</Text>
              <Text style={[styles.catLabel, category === c.key && { color: COLORS.accent }]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Star rating */}
        <Text style={styles.sectionTitle}>NOTE GLOBALE</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(s => (
            <TouchableOpacity key={s} onPress={() => setRating(s)} activeOpacity={0.7}>
              <Text style={[styles.star, s <= rating && styles.starActive]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingLabel}>
            {['', 'Très mauvais', 'Mauvais', 'Correct', 'Bon', 'Excellent'][rating]}
          </Text>
        )}

        {/* Tags */}
        <Text style={styles.sectionTitle}>POINTS SPÉCIFIQUES</Text>
        <View style={styles.tagsWrap}>
          {TAGS.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[styles.tag, selectedTags.includes(tag) && styles.tagActive]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[styles.tagText, selectedTags.includes(tag) && { color: COLORS.accent }]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Comment */}
        <Text style={styles.sectionTitle}>COMMENTAIRE LIBRE</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Décrivez votre expérience..."
          placeholderTextColor={COLORS.muted}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{comment.length}/500</Text>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, (rating === 0 || submitting) && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.submitText}>Envoyer mon avis →</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, width: 36 },
  backIcon: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10, marginTop: 16 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  catBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  catBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  catIcon: { fontSize: 14 },
  catLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  starsRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  star: { fontSize: 36, color: COLORS.border },
  starActive: { color: COLORS.accent },
  ratingLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 4 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  tag: {
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.surface,
  },
  tagActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  tagText: { color: COLORS.muted, fontSize: 12 },
  textarea: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border,
    minHeight: 120,
  },
  charCount: { color: COLORS.muted, fontSize: 11, textAlign: 'right', marginTop: 4 },
  submitBtn: {
    backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', marginTop: 20,
  },
  submitText: { color: '#000', fontSize: 15, fontWeight: '900' },
});
