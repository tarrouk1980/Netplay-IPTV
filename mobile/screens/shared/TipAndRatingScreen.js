import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, StatusBar, TextInput, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  accent: '#F5A623',
  green: '#27AE60',
  red: '#E74C3C',
};

const SERVICE_ICONS = { TAXI: '🚕', SOS: '🛻', DELIVERY: '🛵', GROCERY: '🛒' };
const SERVICE_TIPS = {
  TAXI:     [0.5, 1, 2, 3, 5],
  SOS:      [1, 2, 3, 5, 10],
  DELIVERY: [0.5, 1, 2, 3],
  GROCERY:  [0.5, 1, 2],
};

const QUICK_TAGS = {
  TAXI: [
    { key: 'punctual',  label: '⏰ Ponctuel' },
    { key: 'clean',     label: '✨ Véhicule propre' },
    { key: 'friendly',  label: '😊 Sympa' },
    { key: 'safe',      label: '🛡️ Conduite sûre' },
    { key: 'fast',      label: '⚡ Rapide' },
    { key: 'polite',    label: '🤝 Poli' },
  ],
  SOS: [
    { key: 'fast',      label: '⚡ Intervenu vite' },
    { key: 'pro',       label: '🔧 Très professionnel' },
    { key: 'fair',      label: '💰 Prix juste' },
    { key: 'clean',     label: '✨ Matériel propre' },
    { key: 'helpful',   label: '🤝 Serviable' },
  ],
  DELIVERY: [
    { key: 'fast',      label: '⚡ Livraison rapide' },
    { key: 'careful',   label: '📦 Colis intact' },
    { key: 'friendly',  label: '😊 Sympa' },
    { key: 'punctual',  label: '⏰ Ponctuel' },
  ],
  GROCERY: [
    { key: 'fresh',     label: '🥬 Produits frais' },
    { key: 'complete',  label: '✅ Commande complète' },
    { key: 'fast',      label: '⚡ Rapide' },
    { key: 'careful',   label: '📦 Soigné' },
  ],
};

const STAR_LABELS = ['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent !'];

function StarRow({ rating, onRate, size = 44 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <TouchableOpacity key={i} onPress={() => onRate(i)} activeOpacity={0.7}>
          <Text style={{ fontSize: size, color: i <= rating ? COLORS.accent : COLORS.border }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function TipAndRatingScreen({ route, navigation }) {
  const {
    orderId,
    serviceType = 'TAXI',
    providerName = 'Votre prestataire',
    orderPrice = 0,
  } = route.params || {};

  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tipAmount, setTipAmount] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const [useCustomTip, setUseCustomTip] = useState(false);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const svcIcon = SERVICE_ICONS[serviceType] || '📦';
  const tips = SERVICE_TIPS[serviceType] || SERVICE_TIPS.TAXI;
  const tags = QUICK_TAGS[serviceType] || QUICK_TAGS.TAXI;

  const toggleTag = key => {
    setSelectedTags(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const effectiveTip = useCustomTip ? parseFloat(customTip) || 0 : tipAmount;

  const handleSubmit = useCallback(async () => {
    if (rating === 0) {
      Alert.alert('Note requise', 'Veuillez attribuer au moins 1 étoile.');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/api/orders/${orderId}/rate`, {
        rating,
        tags: selectedTags,
        comment: comment.trim() || null,
        tip: effectiveTip,
        serviceType,
      });
      setDone(true);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Envoi échoué');
    } finally {
      setLoading(false);
    }
  }, [rating, selectedTags, comment, effectiveTip, orderId, serviceType]);

  if (done) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.doneBox}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>Merci pour votre avis !</Text>
          <Text style={styles.doneSub}>
            {effectiveTip > 0 ? `Pourboire de ${effectiveTip.toFixed(3)} TND envoyé à ${providerName}.` : `Votre note a été transmise à ${providerName}.`}
          </Text>
          {effectiveTip > 0 && (
            <View style={styles.tipConfirm}>
              <Text style={styles.tipConfirmText}>💰 +{effectiveTip.toFixed(3)} TND → {providerName}</Text>
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Évaluer la course</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.skipText}>Ignorer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Provider hero */}
        <View style={styles.providerCard}>
          <View style={[styles.providerAvatar, { backgroundColor: COLORS.accent + '22' }]}>
            <Text style={{ fontSize: 32 }}>{svcIcon}</Text>
          </View>
          <Text style={styles.providerName}>{providerName}</Text>
          <Text style={styles.orderRef}>Commande #{String(orderId).slice(-6)} · {orderPrice > 0 ? `${parseFloat(orderPrice).toFixed(3)} TND` : serviceType}</Text>
        </View>

        {/* Star rating */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Votre note</Text>
          <StarRow rating={rating} onRate={setRating} />
          <Text style={styles.starLabel}>{rating > 0 ? STAR_LABELS[rating] : 'Appuyez sur une étoile'}</Text>
        </View>

        {/* Quick tags */}
        {rating >= 4 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ce qui vous a plu</Text>
            <View style={styles.tagsGrid}>
              {tags.map(t => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.tag, selectedTags.includes(t.key) && styles.tagActive]}
                  onPress={() => toggleTag(t.key)}
                >
                  <Text style={[styles.tagText, selectedTags.includes(t.key) && styles.tagTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Comment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commentaire (optionnel)</Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Partagez votre expérience..."
            placeholderTextColor={COLORS.muted}
            multiline
            maxLength={300}
          />
          <Text style={styles.charCount}>{comment.length}/300</Text>
        </View>

        {/* Tip */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Pourboire pour {providerName}</Text>
          <Text style={styles.tipSub}>100% reversé directement au prestataire</Text>
          <View style={styles.tipRow}>
            <TouchableOpacity
              style={[styles.tipChip, tipAmount === 0 && !useCustomTip && styles.tipChipActive]}
              onPress={() => { setTipAmount(0); setUseCustomTip(false); }}
            >
              <Text style={[styles.tipChipText, tipAmount === 0 && !useCustomTip && styles.tipChipTextActive]}>Sans</Text>
            </TouchableOpacity>
            {tips.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.tipChip, tipAmount === t && !useCustomTip && styles.tipChipActive]}
                onPress={() => { setTipAmount(t); setUseCustomTip(false); }}
              >
                <Text style={[styles.tipChipText, tipAmount === t && !useCustomTip && styles.tipChipTextActive]}>{t} TND</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.tipChip, useCustomTip && styles.tipChipActive]}
              onPress={() => { setUseCustomTip(true); setTipAmount(0); }}
            >
              <Text style={[styles.tipChipText, useCustomTip && styles.tipChipTextActive]}>Autre</Text>
            </TouchableOpacity>
          </View>
          {useCustomTip && (
            <TextInput
              style={styles.tipInput}
              value={customTip}
              onChangeText={setCustomTip}
              placeholder="Montant en TND"
              placeholderTextColor={COLORS.muted}
              keyboardType="decimal-pad"
            />
          )}
          {effectiveTip > 0 && (
            <View style={styles.tipPreview}>
              <Text style={styles.tipPreviewText}>+{effectiveTip.toFixed(3)} TND → {providerName}</Text>
            </View>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading || rating === 0}
          activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : (
            <Text style={styles.submitBtnText}>
              {effectiveTip > 0 ? `Envoyer — Pourboire ${effectiveTip.toFixed(3)} TND` : 'Envoyer mon avis'}
            </Text>
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
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  skipText: { color: COLORS.muted, fontSize: 14 },
  scroll: { padding: 16 },
  providerCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 20,
    alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  providerAvatar: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  providerName: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  orderRef: { color: COLORS.muted, fontSize: 12 },
  ratingSection: {
    backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border,
    padding: 20, marginBottom: 14, alignItems: 'center',
  },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
  starLabel: { color: COLORS.accent, fontSize: 14, fontWeight: '700', marginTop: 10 },
  section: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 14 },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  tagActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '18' },
  tagText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tagTextActive: { color: COLORS.accent },
  commentInput: {
    backgroundColor: COLORS.bg, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.text, fontSize: 14, padding: 12, minHeight: 80, textAlignVertical: 'top',
  },
  charCount: { color: COLORS.muted, fontSize: 11, textAlign: 'right', marginTop: 4 },
  tipSub: { color: COLORS.muted, fontSize: 11, marginBottom: 12, marginTop: -8 },
  tipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tipChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  tipChipActive: { borderColor: COLORS.green, backgroundColor: COLORS.green + '18' },
  tipChipText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tipChipTextActive: { color: COLORS.green },
  tipInput: {
    marginTop: 10, backgroundColor: COLORS.bg, borderRadius: 10, borderWidth: 1,
    borderColor: COLORS.border, color: COLORS.text, fontSize: 15, padding: 12,
  },
  tipPreview: { marginTop: 10, backgroundColor: COLORS.green + '18', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: COLORS.green },
  tipPreviewText: { color: COLORS.green, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  submitBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  doneBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  doneEmoji: { fontSize: 64, marginBottom: 16 },
  doneTitle: { color: COLORS.text, fontSize: 24, fontWeight: '900', marginBottom: 10, textAlign: 'center' },
  doneSub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  tipConfirm: { backgroundColor: COLORS.green + '18', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.green, marginBottom: 24 },
  tipConfirmText: { color: COLORS.green, fontWeight: '700', fontSize: 14 },
  doneBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40 },
  doneBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});
