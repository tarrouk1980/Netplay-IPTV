import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const CRITERIA = [
  { key: 'speed', label: 'Rapidité d\'arrivée', icon: '⚡' },
  { key: 'quality', label: 'Qualité de l\'intervention', icon: '🔧' },
  { key: 'courtesy', label: 'Courtoisie', icon: '😊' },
  { key: 'price', label: 'Rapport qualité/prix', icon: '💰' },
];

const BADGES = [
  { key: 'pro', label: 'Très professionnel', icon: '🏅' },
  { key: 'fast', label: 'Ultra rapide', icon: '⚡' },
  { key: 'honest', label: 'Honnête', icon: '🤝' },
  { key: 'careful', label: 'Soigneux', icon: '🛠️' },
  { key: 'friendly', label: 'Sympathique', icon: '😊' },
];

export default function SOSRatingDetailScreen({ navigation, route }) {
  const { depanneurId, depanneurName, sosType } = route?.params || { depanneurName: 'Karim Dépannage', sosType: 'batterie' };
  const [ratings, setRatings] = useState({ speed: 0, quality: 0, courtesy: 0, price: 0 });
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const globalRating = Object.values(ratings).filter(v => v > 0).length > 0
    ? Math.round(Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).filter(v => v > 0).length * 10) / 10
    : 0;

  const toggleBadge = (key) =>
    setSelectedBadges(prev => prev.includes(key) ? prev.filter(b => b !== key) : [...prev, key]);

  const handleSubmit = async () => {
    if (globalRating === 0) {
      Alert.alert('Note requise', 'Veuillez noter au moins un critère.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/sos/rating', { depanneurId, ratings, badges: selectedBadges, comment, globalRating });
    } catch {}
    setSubmitting(false);
    Alert.alert('⭐ Merci !', 'Votre avis aide la communauté EasyWay.', [
      { text: 'OK', onPress: () => navigation.navigate('ClientHome') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⭐ Évaluer le dépanneur</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        <View style={styles.depanneurCard}>
          <View style={styles.depAvatar}><Text style={{ fontSize: 32 }}>🔧</Text></View>
          <Text style={styles.depName}>{depanneurName || 'Karim Dépannage'}</Text>
          <Text style={styles.depService}>Intervention : {sosType || 'Dépannage'}</Text>
          {globalRating > 0 && (
            <View style={styles.globalRatingRow}>
              <Text style={styles.globalRatingVal}>{globalRating.toFixed(1)}</Text>
              <Text style={styles.globalRatingStar}>⭐</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>CRITÈRES D'ÉVALUATION</Text>
        {CRITERIA.map(c => (
          <View key={c.key} style={styles.criteriaRow}>
            <Text style={styles.criteriaLabel}>{c.icon} {c.label}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => setRatings(prev => ({ ...prev, [c.key]: star }))}>
                  <Text style={[styles.star, ratings[c.key] >= star && styles.starActive]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>POINTS FORTS</Text>
        <View style={styles.badgesRow}>
          {BADGES.map(b => (
            <TouchableOpacity
              key={b.key}
              style={[styles.badgeBtn, selectedBadges.includes(b.key) && styles.badgeBtnActive]}
              onPress={() => toggleBadge(b.key)}
            >
              <Text style={{ fontSize: 16 }}>{b.icon}</Text>
              <Text style={[styles.badgeLabel, selectedBadges.includes(b.key) && styles.badgeLabelActive]}>{b.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>COMMENTAIRE (OPTIONNEL)</Text>
        <TextInput
          style={styles.commentInput}
          value={comment}
          onChangeText={setComment}
          placeholder="Décrivez votre expérience..."
          placeholderTextColor={COLORS.muted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submitBtn, (submitting || globalRating === 0) && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={submitting || globalRating === 0}
        >
          {submitting ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Envoyer mon évaluation →</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  depanneurCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  depAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  depName: { color: COLORS.text, fontSize: 18, fontWeight: '900', marginBottom: 4 },
  depService: { color: COLORS.muted, fontSize: 12, marginBottom: 12 },
  globalRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  globalRatingVal: { color: COLORS.accent, fontSize: 32, fontWeight: '900' },
  globalRatingStar: { fontSize: 24 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  criteriaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  criteriaLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600', flex: 1 },
  starsRow: { flexDirection: 'row', gap: 4 },
  star: { fontSize: 28, color: COLORS.border },
  starActive: { color: COLORS.accent },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  badgeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  badgeBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  badgeLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  badgeLabelActive: { color: COLORS.accent },
  commentInput: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, color: COLORS.text, fontSize: 13, borderWidth: 1, borderColor: COLORS.border, minHeight: 100, marginBottom: 20 },
  submitBtn: { backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  submitBtnText: { color: '#000', fontSize: 15, fontWeight: '900' },
});
