import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2A2A3A',
  text: '#FFFFFF', muted: '#8A8A9A', orange: '#F57C00',
  green: '#27AE60', teal: '#00838F', gold: '#FFD700', accent: '#D32F2F',
};

const QUICK_TAGS = ['Rapide', 'Professionnel', 'Équipé', 'Ponctuel', 'Prix correct', 'Aimable'];
const RATING_LABELS = ['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent'];

function StarRating({ value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center' }}>
      {[1,2,3,4,5].map((i) => (
        <TouchableOpacity key={i} onPress={() => onChange(i)}>
          <Text style={{ fontSize: 40, color: i <= value ? COLORS.gold : COLORS.border }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function SOSRatingScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;
  const depanneurName = route?.params?.depanneurName || 'Votre dépanneur';

  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState('');
  const [tip, setTip] = useState(0);
  const [saving, setSaving] = useState(false);

  const toggleTag = (tag) => {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.post(`/api/sos/orders/${orderId}/rate`, { rating, tags, comment, tip });
      Alert.alert('Merci ! ⭐', 'Votre évaluation a bien été enregistrée.', [
        { text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }) },
      ]);
    } catch {
      Alert.alert('Erreur', 'Impossible d\'envoyer votre évaluation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={s.header}>
        <Text style={s.title}>⭐ Évaluer l'intervention</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={s.card}>
          <Text style={{ fontSize: 44, textAlign: 'center', marginBottom: 6 }}>🛻</Text>
          <Text style={s.name}>{depanneurName}</Text>
          <Text style={s.role}>Dépanneur</Text>
          <StarRating value={rating} onChange={setRating} />
          <Text style={[s.ratingLabel, { color: rating >= 4 ? COLORS.green : rating >= 3 ? COLORS.orange : COLORS.accent }]}>
            {RATING_LABELS[rating]}
          </Text>
          <View style={s.tagsRow}>
            {QUICK_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[s.tag, tags.includes(tag) && s.tagActive]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[s.tagTxt, tags.includes(tag) && { color: COLORS.teal }]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={s.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Commentaire optionnel..."
            placeholderTextColor={COLORS.muted}
            multiline
            numberOfLines={3}
            maxLength={300}
          />
        </View>

        <View style={s.tipCard}>
          <Text style={s.tipTitle}>💳 Pourboire au dépanneur</Text>
          <Text style={s.tipSub}>100% reversé directement</Text>
          <View style={s.tipRow}>
            {[0, 1, 2, 5].map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[s.tipBtn, tip === amt && s.tipBtnActive]}
                onPress={() => setTip(amt)}
              >
                <Text style={[s.tipBtnTxt, tip === amt && { color: COLORS.gold }]}>
                  {amt === 0 ? 'Non' : `${amt} TND`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={saving}>
          {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={s.submitBtnTxt}>Envoyer l'évaluation ⭐</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={s.skipBtn} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}>
          <Text style={s.skipBtnTxt}>Passer</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, alignItems: 'center' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  name: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 2 },
  role: { color: COLORS.muted, fontSize: 12, marginBottom: 14 },
  ratingLabel: { fontSize: 14, fontWeight: '700', marginTop: 10, marginBottom: 14 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 14 },
  tag: { backgroundColor: COLORS.bg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  tagActive: { borderColor: COLORS.teal, backgroundColor: COLORS.teal + '22' },
  tagTxt: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  commentInput: { backgroundColor: COLORS.bg, borderRadius: 10, padding: 12, color: COLORS.text, fontSize: 13, borderWidth: 1, borderColor: COLORS.border, width: '100%', textAlignVertical: 'top' },
  tipCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  tipTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  tipSub: { color: COLORS.muted, fontSize: 11, marginBottom: 12 },
  tipRow: { flexDirection: 'row', gap: 8 },
  tipBtn: { flex: 1, backgroundColor: COLORS.bg, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  tipBtnActive: { borderColor: COLORS.gold, backgroundColor: COLORS.gold + '22' },
  tipBtnTxt: { color: COLORS.muted, fontSize: 12, fontWeight: '700' },
  submitBtn: { backgroundColor: COLORS.teal, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 10 },
  submitBtnTxt: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  skipBtn: { alignItems: 'center', padding: 12 },
  skipBtnTxt: { color: COLORS.muted, fontSize: 14 },
});
