import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  StatusBar, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C',
};

const TAGS = ['Ponctuel', 'Véhicule propre', 'Conduite douce', 'Sympathique', 'Route rapide'];
const BAD_TAGS = ['En retard', 'Mauvaise conduite', 'Véhicule sale', 'Impoli', 'Mauvais itinéraire'];

export default function TaxiRatingScreen({ navigation, route }) {
  const { orderId, driverName = 'Votre chauffeur' } = route.params || {};
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const tags = rating >= 4 ? TAGS : BAD_TAGS;

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const submit = async () => {
    if (rating === 0) { Alert.alert('Veuillez attribuer une note'); return; }
    setSubmitting(true);
    try {
      await api.post('/api/taxi/orders/' + orderId + '/rate', { rating, comment, tags: selectedTags });
    } catch {}
    setSubmitting(false);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.driverCard}>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 36 }}>🚕</Text>
            </View>
            <Text style={styles.driverName}>{driverName}</Text>
            <Text style={styles.driverSub}>Comment s'est passée votre course ?</Text>
          </View>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(s => (
              <TouchableOpacity key={s} onPress={() => { setRating(s); setSelectedTags([]); }}>
                <Text style={[styles.star, s <= rating && styles.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent'][rating]}
            </Text>
          )}

          {rating > 0 && (
            <>
              <Text style={styles.sectionLabel}>Points à souligner</Text>
              <View style={styles.tagsWrap}>
                {tags.map(tag => (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tag, selectedTags.includes(tag) && styles.tagActive]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>Commentaire (optionnel)</Text>
              <TextInput
                style={styles.input}
                placeholder="Dites-nous en plus..."
                placeholderTextColor={COLORS.muted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={comment}
                onChangeText={setComment}
                maxLength={300}
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, (submitting || rating === 0) && { opacity: 0.5 }]}
            onPress={submit}
            disabled={submitting || rating === 0}
          >
            <Text style={styles.submitBtnText}>{submitting ? 'Envoi...' : '✓ Envoyer l\'avis'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })} style={styles.skipBtn}>
            <Text style={styles.skipText}>Passer</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 24, alignItems: 'center' },
  driverCard: { alignItems: 'center', marginBottom: 32 },
  avatar: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.accent + '50', marginBottom: 14,
  },
  driverName: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginBottom: 6 },
  driverSub: { color: COLORS.muted, fontSize: 14 },
  starsRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  star: { fontSize: 44, color: COLORS.border },
  starActive: { color: COLORS.accent },
  ratingLabel: { color: COLORS.accent, fontSize: 16, fontWeight: '700', marginBottom: 28 },
  sectionLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 10, marginTop: 4 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20, alignSelf: 'flex-start' },
  tag: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  tagActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  tagText: { color: COLORS.muted, fontSize: 13 },
  tagTextActive: { color: COLORS.accent, fontWeight: '600' },
  input: {
    width: '100%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    color: COLORS.text, fontSize: 14, minHeight: 90, borderWidth: 1, borderColor: COLORS.border,
    marginBottom: 28,
  },
  submitBtn: {
    width: '100%', backgroundColor: COLORS.accent, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
  },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
  skipBtn: { paddingVertical: 8 },
  skipText: { color: COLORS.muted, fontSize: 14 },
});
