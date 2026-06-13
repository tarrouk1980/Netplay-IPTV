import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator,
} from "react-native";
import api from "../../lib/api";

const ROSE = "#9f1239";

export default function WriteReviewScreen({ route, navigation }: any) {
  const { productId, productTitle } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (rating === 0) {
      Alert.alert("Note requise", "Veuillez sélectionner une note (1-5 étoiles).");
      return;
    }
    setSaving(true);
    try {
      await api.post("/reviews", { productId, rating, comment: comment.trim() || undefined });
      Alert.alert("✓ Merci !", "Votre avis a été publié.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert("Erreur", e.response?.data?.message || "Impossible de publier l'avis.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <Text style={s.productName} numberOfLines={2}>{productTitle || "Produit"}</Text>

      {/* Star rating */}
      <View style={s.starsSection}>
        <Text style={s.label}>Votre note *</Text>
        <View style={s.starsRow}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Text style={[s.star, star <= rating && s.starFilled]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={s.ratingLabel}>
            {["", "Très mauvais 😞", "Mauvais 😕", "Correct 😐", "Bien 🙂", "Excellent 😍"][rating]}
          </Text>
        )}
      </View>

      {/* Comment */}
      <View style={s.fieldSection}>
        <Text style={s.label}>Votre commentaire (optionnel)</Text>
        <TextInput
          style={s.textarea}
          value={comment}
          onChangeText={setComment}
          placeholder="Décrivez votre expérience avec ce produit..."
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={5}
          maxLength={1000}
          textAlignVertical="top"
        />
        <Text style={s.charCount}>{comment.length}/1000</Text>
      </View>

      {/* Tips */}
      <View style={s.tipsBox}>
        <Text style={s.tipsTitle}>💡 Conseils pour un bon avis :</Text>
        <Text style={s.tipsText}>• Mentionnez la qualité, l'emballage et la livraison{"\n"}• Soyez honnête et constructif{"\n"}• Votre avis aide les autres acheteurs</Text>
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[s.submitBtn, (saving || rating === 0) && s.submitBtnDisabled]}
        onPress={submit}
        disabled={saving || rating === 0}
      >
        {saving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={s.submitText}>Publier mon avis</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 20, gap: 20 },
  productName: { fontSize: 16, fontWeight: "800", color: "#1e293b", textAlign: "center" },
  starsSection: { alignItems: "center", gap: 8 },
  label: { fontSize: 13, fontWeight: "700", color: "#64748b" },
  starsRow: { flexDirection: "row", gap: 10 },
  star: { fontSize: 38, color: "#e2e8f0" },
  starFilled: { color: "#f59e0b" },
  ratingLabel: { fontSize: 13, fontWeight: "700", color: "#475569" },
  fieldSection: { gap: 6 },
  textarea: {
    borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 14,
    padding: 14, fontSize: 14, color: "#1e293b", height: 120,
  },
  charCount: { fontSize: 11, color: "#94a3b8", textAlign: "right" },
  tipsBox: { backgroundColor: "#f8fafc", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#f1f5f9" },
  tipsTitle: { fontSize: 12, fontWeight: "800", color: "#64748b", marginBottom: 6 },
  tipsText: { fontSize: 12, color: "#94a3b8", lineHeight: 18 },
  submitBtn: { backgroundColor: ROSE, borderRadius: 14, padding: 15, alignItems: "center" },
  submitBtnDisabled: { opacity: 0.4 },
  submitText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
