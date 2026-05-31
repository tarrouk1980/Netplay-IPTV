import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import api from '../services/api';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  star: '#F5A623',
  starEmpty: '#3A3A4A',
};

export default function RatingModal({ visible, orderId, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Notation requise', 'Veuillez sélectionner une note.');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/api/taxi/${orderId}/rate`, { rating, comment: comment.trim() || undefined });
      onSubmitted && onSubmitted(rating);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Impossible d\'envoyer la note.';
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Notez votre course</Text>
          <Text style={styles.subtitle}>Votre avis nous aide à améliorer le service</Text>

          {/* Stars */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                <Text style={[styles.star, { color: star <= rating ? COLORS.star : COLORS.starEmpty }]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {rating === 1 ? 'Très mauvais' : rating === 2 ? 'Mauvais' : rating === 3 ? 'Correct' : rating === 4 ? 'Bien' : 'Excellent !'}
            </Text>
          )}

          {/* Comment */}
          <TextInput
            style={styles.commentInput}
            placeholder="Commentaire (optionnel)..."
            placeholderTextColor={COLORS.textMuted}
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={500}
          />

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.skipBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.skipTxt}>Passer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <Text style={styles.submitTxt}>Envoyer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 40,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: COLORS.textMuted, fontSize: 13, marginBottom: 24, textAlign: 'center' },
  starsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  star: { fontSize: 44 },
  ratingLabel: { color: COLORS.primary, fontSize: 14, fontWeight: '600', marginBottom: 16 },
  commentInput: {
    width: '100%',
    backgroundColor: '#252535',
    borderRadius: 12,
    padding: 14,
    color: COLORS.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  btnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  skipBtn: {
    flex: 1,
    backgroundColor: '#252535',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skipTxt: { color: COLORS.textMuted, fontWeight: '600' },
  submitBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  submitTxt: { color: '#000', fontWeight: '700', fontSize: 15 },
});
