import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  orange: '#F57C00',
  green: '#27AE60',
  teal: '#00838F',
  gold: '#FFD700',
};

const QUICK_TAGS_DELIVERY = ['Rapide', 'Soigneux', 'Poli', 'Emballage parfait', 'Ponctuel', 'Professionnel'];
const QUICK_TAGS_MERCHANT = ['Délicieux', 'Bien emballé', 'Portions généreuses', 'Conforme à la commande', 'Prix correct'];

function StarRating({ value, onChange, size = 36 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity key={i} onPress={() => onChange(i)}>
          <Text style={{ fontSize: size, color: i <= value ? COLORS.gold : COLORS.border }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function DeliveryRatingScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;
  const livreurName = route?.params?.livreurName || 'Votre livreur';
  const merchantName = route?.params?.merchantName || 'Le restaurant';

  const [livreurRating, setLivreurRating] = useState(5);
  const [merchantRating, setMerchantRating] = useState(5);
  const [livreurTags, setLivreurTags] = useState([]);
  const [merchantTags, setMerchantTags] = useState([]);
  const [livreurComment, setLivreurComment] = useState('');
  const [merchantComment, setMerchantComment] = useState('');
  const [tip, setTip] = useState(0);
  const [saving, setSaving] = useState(false);

  const toggleTag = (tag, list, setList) => {
    setList((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.post(`/api/delivery/orders/${orderId}/rate`, {
        livreurRating, livreurTags, livreurComment,
        merchantRating, merchantTags, merchantComment,
        tip,
      });
      Alert.alert('Merci pour votre avis ! ⭐', 'Votre évaluation aide à améliorer le service.', [
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>⭐ Évaluer la livraison</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Livreur rating */}
        <View style={s.ratingCard}>
          <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 4 }}>🛵</Text>
          <Text style={s.ratingName}>{livreurName}</Text>
          <Text style={s.ratingRole}>Livreur</Text>
          <StarRating value={livreurRating} onChange={setLivreurRating} />
          <Text style={[s.ratingLabel, { color: livreurRating >= 4 ? COLORS.green : livreurRating >= 3 ? COLORS.orange : COLORS.accent }]}>
            {['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent'][livreurRating]}
          </Text>

          <View style={s.tagsRow}>
            {QUICK_TAGS_DELIVERY.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[s.tag, livreurTags.includes(tag) && s.tagActive]}
                onPress={() => toggleTag(tag, livreurTags, setLivreurTags)}
              >
                <Text style={[s.tagTxt, livreurTags.includes(tag) && { color: COLORS.teal }]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={s.commentInput}
            value={livreurComment}
            onChangeText={setLivreurComment}
            placeholder="Ajouter un commentaire (optionnel)..."
            placeholderTextColor={COLORS.muted}
            multiline
            numberOfLines={2}
            maxLength={200}
          />
        </View>

        {/* Merchant rating */}
        <View style={s.ratingCard}>
          <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 4 }}>🏪</Text>
          <Text style={s.ratingName}>{merchantName}</Text>
          <Text style={s.ratingRole}>Restaurant / Marchand</Text>
          <StarRating value={merchantRating} onChange={setMerchantRating} />
          <Text style={[s.ratingLabel, { color: merchantRating >= 4 ? COLORS.green : merchantRating >= 3 ? COLORS.orange : COLORS.accent }]}>
            {['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent'][merchantRating]}
          </Text>

          <View style={s.tagsRow}>
            {QUICK_TAGS_MERCHANT.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[s.tag, merchantTags.includes(tag) && s.tagActive]}
                onPress={() => toggleTag(tag, merchantTags, setMerchantTags)}
              >
                <Text style={[s.tagTxt, merchantTags.includes(tag) && { color: COLORS.teal }]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={s.commentInput}
            value={merchantComment}
            onChangeText={setMerchantComment}
            placeholder="Ajouter un commentaire (optionnel)..."
            placeholderTextColor={COLORS.muted}
            multiline
            numberOfLines={2}
            maxLength={200}
          />
        </View>

        {/* Tip */}
        <View style={s.tipCard}>
          <Text style={s.tipTitle}>💳 Laisser un pourboire au livreur</Text>
          <Text style={s.tipSub}>100% va directement au livreur</Text>
          <View style={s.tipRow}>
            {[0, 1, 2, 5, 10].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[s.tipBtn, tip === amount && s.tipBtnActive]}
                onPress={() => setTip(amount)}
              >
                <Text style={[s.tipBtnTxt, tip === amount && { color: COLORS.gold }]}>
                  {amount === 0 ? 'Non' : `${amount} TND`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={saving}>
          {saving
            ? <ActivityIndicator color="#FFF" size="small" />
            : <Text style={s.submitBtnTxt}>Envoyer mon évaluation ⭐</Text>
          }
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', flex: 1 },
  ratingCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  ratingName: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 2, textAlign: 'center' },
  ratingRole: { color: COLORS.muted, fontSize: 12, marginBottom: 12 },
  ratingLabel: { fontSize: 13, fontWeight: '700', marginTop: 8, marginBottom: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 12 },
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
