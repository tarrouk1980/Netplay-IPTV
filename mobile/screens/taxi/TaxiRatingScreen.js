import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F',
};

const QUICK_TAGS_GOOD  = ['Ponctuel', 'Véhicule propre', 'Conduite douce', 'Sympa', 'Bonne musique'];
const QUICK_TAGS_BAD   = ['En retard', 'Conduite brusque', 'Pas d\'AC', 'Peu aimable', 'Itinéraire mauvais'];

const TIP_OPTIONS = [0, 1, 2, 5];

export default function TaxiRatingScreen({ navigation, route }) {
  const { rideId, driverName = 'Votre chauffeur', tripSummary } = route?.params || {};

  const [stars, setStars] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState('');
  const [tip, setTip] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const toggleTag = (t) => setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  const displayStars = hoveredStar || stars;
  const quickTags = stars >= 4 ? QUICK_TAGS_GOOD : QUICK_TAGS_BAD;

  const handleSubmit = async () => {
    if (stars === 0) return;
    setSubmitting(true);
    try {
      await api.post('/api/taxi/rate', { rideId, stars, tags, comment, tip });
    } catch {}
    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.doneContainer}>
          <Text style={{ fontSize: 72, marginBottom: 12 }}>🙏</Text>
          <Text style={styles.doneTitle}>Merci pour votre avis !</Text>
          <Text style={styles.doneSub}>Votre évaluation aide à améliorer le service pour tous.</Text>
          {tip > 0 && (
            <View style={styles.tipConfirm}>
              <Text style={styles.tipConfirmText}>Pourboire de {tip} TND envoyé à {driverName} ❤️</Text>
            </View>
          )}
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.doneBtnText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.title}>Évaluation de la course</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={{ color: COLORS.muted, fontSize: 14 }}>Passer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Driver */}
        <View style={styles.driverCard}>
          <View style={styles.driverAvatar}>
            <Text style={{ fontSize: 36 }}>🧔</Text>
          </View>
          <Text style={styles.driverName}>{driverName}</Text>
          {tripSummary && <Text style={styles.tripSummary}>{tripSummary}</Text>}
        </View>

        {/* Stars */}
        <Text style={styles.sectionLabel}>Comment s'est passée votre course ?</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => { setStars(s); setHoveredStar(0); }}
              onPressIn={() => setHoveredStar(s)}
              onPressOut={() => setHoveredStar(0)}
              activeOpacity={0.7}
            >
              <Text style={[styles.star, s <= displayStars && styles.starFilled]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        {stars > 0 && (
          <Text style={styles.starLabel}>
            {['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent'][stars]}
          </Text>
        )}

        {/* Quick tags */}
        {stars > 0 && (
          <>
            <Text style={styles.sectionLabel}>{stars >= 4 ? '👍 Ce qui était bien' : '👎 Ce qui pourrait être amélioré'}</Text>
            <View style={styles.tagWrap}>
              {quickTags.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tagBtn, tags.includes(t) && styles.tagBtnActive]}
                  onPress={() => toggleTag(t)}
                >
                  <Text style={[styles.tagText, tags.includes(t) && { color: '#000' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Comment */}
        <Text style={styles.sectionLabel}>Commentaire (optionnel)</Text>
        <TextInput
          style={styles.commentInput}
          value={comment}
          onChangeText={setComment}
          placeholder="Partagez votre expérience..."
          placeholderTextColor={COLORS.muted}
          multiline maxLength={300}
          textAlignVertical="top"
        />

        {/* Tip */}
        <Text style={styles.sectionLabel}>Laisser un pourboire</Text>
        <View style={styles.tipRow}>
          {TIP_OPTIONS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tipBtn, tip === t && styles.tipBtnActive]}
              onPress={() => setTip(t)}
            >
              <Text style={[styles.tipText, tip === t && { color: '#000' }]}>
                {t === 0 ? 'Non' : `+${t} TND`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, stars === 0 && { opacity: 0.4 }]}
          onPress={handleSubmit}
          disabled={stars === 0 || submitting}
        >
          {submitting
            ? <ActivityIndicator color="#000" size="small" />
            : <Text style={styles.submitBtnText}>Envoyer l'évaluation</Text>}
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
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
  title: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  scroll: { padding: 20 },
  driverCard: { alignItems: 'center', marginBottom: 24 },
  driverAvatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.accent + '22', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  driverName: { color: COLORS.white, fontSize: 20, fontWeight: '800' },
  tripSummary: { color: COLORS.muted, fontSize: 13, marginTop: 4 },
  sectionLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 8 },
  star: { fontSize: 44, color: COLORS.border },
  starFilled: { color: COLORS.accent },
  starLabel: { color: COLORS.accent, fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tagBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  tagBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tagText: { color: COLORS.white, fontSize: 13 },
  commentInput: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, minHeight: 90, marginBottom: 16,
  },
  tipRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  tipBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  tipBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tipText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  submitBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  submitBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
  doneContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  doneTitle: { color: COLORS.white, fontSize: 24, fontWeight: '900', marginBottom: 8 },
  doneSub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  tipConfirm: {
    backgroundColor: COLORS.green + '22', borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: COLORS.green, marginBottom: 20,
  },
  tipConfirmText: { color: COLORS.green, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  doneBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 32, paddingVertical: 13 },
  doneBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
});
