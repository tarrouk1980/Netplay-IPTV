import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const TOPICS = [
  { id: 'app', icon: '📱', label: 'Application' },
  { id: 'driver', icon: '🚗', label: 'Chauffeur' },
  { id: 'delivery', icon: '🛵', label: 'Livraison' },
  { id: 'payment', icon: '💳', label: 'Paiement' },
  { id: 'support', icon: '🎧', label: 'Support' },
  { id: 'other', icon: '📝', label: 'Autre' },
];

const EMOJIS = ['😡', '😕', '😐', '🙂', '😍'];
const EMOJI_LABELS = ['Terrible', 'Mauvais', 'Correct', 'Bien', 'Excellent'];

export default function FeedbackScreen({ navigation }) {
  const [rating, setRating] = useState(null);
  const [topic, setTopic] = useState(null);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const scaleAnims = useRef(EMOJIS.map(() => new Animated.Value(1))).current;

  const selectRating = (i) => {
    setRating(i);
    Animated.sequence([
      Animated.timing(scaleAnims[i], { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnims[i], { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const submit = () => {
    if (rating === null) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={styles.successBox}>
          <Text style={{ fontSize: 72, marginBottom: 20 }}>🙏</Text>
          <Text style={styles.successTitle}>Merci pour votre retour !</Text>
          <Text style={styles.successSub}>
            Votre avis nous aide à améliorer EASYWAY chaque jour.
          </Text>
          {rating !== null && rating >= 3 && (
            <View style={styles.shareBanner}>
              <Text style={styles.shareText}>
                Vous êtes satisfait ? Partagez l'app avec vos proches 🎉
              </Text>
              <TouchableOpacity style={styles.shareBtn} onPress={() => navigation.navigate('ShareApp')}>
                <Text style={styles.shareBtnText}>Partager EASYWAY</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Votre avis</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>

        {/* Emoji rating */}
        <Text style={styles.fieldLabel}>Comment évaluez-vous votre expérience ?</Text>
        <View style={styles.emojiRow}>
          {EMOJIS.map((e, i) => (
            <TouchableOpacity key={i} onPress={() => selectRating(i)} activeOpacity={0.8}>
              <Animated.Text style={[
                styles.emoji,
                { transform: [{ scale: scaleAnims[i] }], opacity: rating === null || rating === i ? 1 : 0.35 },
              ]}>
                {e}
              </Animated.Text>
            </TouchableOpacity>
          ))}
        </View>
        {rating !== null && (
          <Text style={[styles.emojiLabel, { color: rating >= 3 ? COLORS.green : COLORS.orange }]}>
            {EMOJI_LABELS[rating]}
          </Text>
        )}

        {/* Topic */}
        <Text style={[styles.fieldLabel, { marginTop: 24 }]}>Sujet du retour</Text>
        <View style={styles.topicGrid}>
          {TOPICS.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.topicCard, topic === t.id && styles.topicCardActive]}
              onPress={() => setTopic(t.id)}
            >
              <Text style={{ fontSize: 22 }}>{t.icon}</Text>
              <Text style={[styles.topicLabel, topic === t.id && { color: COLORS.accent }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Message */}
        <Text style={[styles.fieldLabel, { marginTop: 8 }]}>Dites-nous en plus (optionnel)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Décrivez votre expérience, vos suggestions..."
          placeholderTextColor={COLORS.muted}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.charCount}>{message.length}/500</Text>

        {/* Quick suggestions */}
        {rating !== null && rating <= 2 && (
          <View style={styles.suggBox}>
            <Text style={styles.suggTitle}>💡 Qu'est-ce qui n'a pas fonctionné ?</Text>
            {['Temps d\'attente trop long', 'Problème de paiement', 'Chauffeur peu professionnel', 'Application instable'].map(s => (
              <TouchableOpacity
                key={s}
                style={styles.suggChip}
                onPress={() => setMessage(prev => prev ? `${prev}, ${s.toLowerCase()}` : s)}
              >
                <Text style={styles.suggText}>+ {s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, rating === null && { opacity: 0.4 }]}
          onPress={submit}
          disabled={rating === null}
        >
          <Text style={styles.submitBtnText}>Envoyer mon avis</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  fieldLabel: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 14 },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  emoji: { fontSize: 42 },
  emojiLabel: { textAlign: 'center', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  topicGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  topicCard: {
    width: '30%', backgroundColor: COLORS.surface, borderRadius: 10, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, gap: 6,
  },
  topicCardActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '11' },
  topicLabel: { color: COLORS.muted, fontSize: 11, textAlign: 'center' },
  textArea: {
    backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 12, color: COLORS.white, fontSize: 14,
    minHeight: 110, marginBottom: 6,
  },
  charCount: { color: COLORS.muted, fontSize: 11, textAlign: 'right', marginBottom: 16 },
  suggBox: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  suggTitle: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginBottom: 10 },
  suggChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginBottom: 6,
    backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border,
    alignSelf: 'flex-start',
  },
  suggText: { color: COLORS.orange, fontSize: 12, fontWeight: '600' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  submitBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  submitBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
  successBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  successTitle: { color: COLORS.white, fontSize: 22, fontWeight: '900', marginBottom: 12 },
  successSub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', marginBottom: 24 },
  shareBanner: {
    backgroundColor: '#0D2E0D', borderRadius: 12, padding: 16, borderWidth: 1,
    borderColor: COLORS.green, marginBottom: 24, alignItems: 'center',
  },
  shareText: { color: COLORS.muted, fontSize: 13, textAlign: 'center', marginBottom: 12 },
  shareBtn: { backgroundColor: COLORS.green, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
  shareBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
  doneBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingHorizontal: 40, paddingVertical: 14,
  },
  doneBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
});
