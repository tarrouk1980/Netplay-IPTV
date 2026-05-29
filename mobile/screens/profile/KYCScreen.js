import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  success: '#27AE60',
};

const ROLE_INSTRUCTIONS = {
  CHAUFFEUR: "Pour valider votre compte chauffeur, nous avons besoin de votre CIN (recto/verso) et de votre permis de conduire.",
  DEPANNEUR: "Pour valider votre compte dépanneur, nous avons besoin de votre CIN (recto/verso) et de votre carte professionnelle.",
  DEFAULT: "Veuillez soumettre vos documents d'identité pour vérification.",
};

const DOCUMENT_SLOTS = [
  { key: 'id_front', label: 'CIN Recto', emoji: '🪪', required: true },
  { key: 'id_back', label: 'CIN Verso', emoji: '🪪', required: true },
  { key: 'license', label: 'Permis de conduire', emoji: '🚗', roles: ['CHAUFFEUR'] },
  { key: 'professional_card', label: 'Carte professionnelle', emoji: '💼', roles: ['DEPANNEUR'] },
];

export default function KYCScreen({ navigation }) {
  const { user, setUser } = useAuthStore();
  const [documents, setDocuments] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const instructions = ROLE_INSTRUCTIONS[user?.role] || ROLE_INSTRUCTIONS.DEFAULT;

  const pickImage = async (slotKey) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', "L'accès à la galerie est nécessaire");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDocuments((prev) => ({
        ...prev,
        [slotKey]: result.assets[0].uri,
      }));
    }
  };

  const handleSubmit = async () => {
    const requiredSlots = DOCUMENT_SLOTS.filter(
      (slot) => slot.required || !slot.roles || slot.roles.includes(user?.role)
    );

    const missingRequired = requiredSlots.filter(
      (slot) => slot.required && !documents[slot.key]
    );

    if (missingRequired.length > 0) {
      Alert.alert(
        'Documents manquants',
        `Veuillez ajouter: ${missingRequired.map((s) => s.label).join(', ')}`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // In production, upload to Cloudinary first and send URLs
      // For now, sending document type + stub URL
      const documentUrls = Object.entries(documents)
        .map(([key, uri]) => `${key}:${uri}`)
        .join(',');

      const response = await api.post('/api/users/me/kyc', {
        documentType: Object.keys(documents).join(','),
        documentUrl: documentUrls,
      });

      setUser({ ...user, kycStatus: 'PENDING' });

      Alert.alert(
        'Documents soumis !',
        'Votre dossier est en cours de vérification. Vous serez notifié sous 24-48h.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Soumission échouée');
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleSlots = DOCUMENT_SLOTS.filter(
    (slot) => !slot.roles || slot.roles.includes(user?.role)
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Vérification KYC</Text>
          <Text style={styles.subtitle}>{instructions}</Text>
        </View>

        {user?.kycStatus === 'PENDING' && (
          <View style={styles.pendingBanner}>
            <Text style={styles.pendingEmoji}>⏳</Text>
            <Text style={styles.pendingText}>
              Vos documents sont en cours de vérification
            </Text>
          </View>
        )}

        <View style={styles.documentsContainer}>
          {visibleSlots.map((slot) => {
            const uploaded = documents[slot.key];
            return (
              <View key={slot.key} style={styles.documentSlot}>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentEmoji}>{slot.emoji}</Text>
                  <View>
                    <Text style={styles.documentLabel}>{slot.label}</Text>
                    {slot.required && <Text style={styles.requiredBadge}>Obligatoire</Text>}
                  </View>
                </View>

                {uploaded ? (
                  <View style={styles.uploadedContainer}>
                    <Image source={{ uri: uploaded }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.replaceBtn}
                      onPress={() => pickImage(slot.key)}
                    >
                      <Text style={styles.replaceBtnText}>Remplacer</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={() => pickImage(slot.key)}
                  >
                    <Text style={styles.uploadEmoji}>📁</Text>
                    <Text style={styles.uploadBtnText}>Choisir une photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting || user?.kycStatus === 'PENDING'}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.submitBtnText}>
              {user?.kycStatus === 'PENDING' ? 'En attente de validation' : 'Soumettre les documents'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 24 },
  backBtn: { color: COLORS.primary, fontSize: 16, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textMuted, lineHeight: 20 },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A10',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#F39C12',
    gap: 12,
  },
  pendingEmoji: { fontSize: 24 },
  pendingText: { color: '#F39C12', fontSize: 14, flex: 1 },
  documentsContainer: { paddingHorizontal: 16, gap: 12 },
  documentSlot: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  documentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  documentEmoji: { fontSize: 28 },
  documentLabel: { color: COLORS.text, fontWeight: '600', fontSize: 15 },
  requiredBadge: { color: COLORS.primary, fontSize: 11, marginTop: 2 },
  uploadBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  uploadEmoji: { fontSize: 24 },
  uploadBtnText: { color: COLORS.textMuted, fontSize: 13 },
  uploadedContainer: { alignItems: 'center', gap: 8 },
  previewImage: { width: '100%', height: 150, borderRadius: 8 },
  replaceBtn: { paddingHorizontal: 16, paddingVertical: 6 },
  replaceBtnText: { color: COLORS.primary, fontSize: 13 },
  submitBtn: {
    backgroundColor: COLORS.primary,
    margin: 24,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: COLORS.background, fontWeight: '700', fontSize: 16 },
});
