import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Clipboard,
  ActivityIndicator,
  Linking,
} from 'react-native';
import api from '../services/api';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  accent: '#D32F2F',
  gold: '#FFD700',
};

export default function SplitFareModal({ visible, onClose, orderId, totalAmount }) {
  const [persons, setPersons] = useState(2);
  const [shareUrl, setShareUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const perPerson = totalAmount ? (parseFloat(totalAmount) / persons).toFixed(3) : '0.000';

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/taxi/split-fare', {
        orderId,
        totalAmount,
        persons,
      });
      setShareUrl(res.data.shareUrl);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Impossible de générer le lien');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const msg = `🚕 EASYWAY — Split Fare\nCourse: ${parseFloat(totalAmount).toFixed(3)} TND\nVotre part: ${perPerson} TND\nPayez votre part: ${shareUrl || '[lien en cours]'}`;
    const encoded = encodeURIComponent(msg);
    Linking.openURL(`whatsapp://send?text=${encoded}`).catch(() => {
      Alert.alert('WhatsApp non installé', 'Partagez le lien manuellement.');
    });
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    Clipboard.setString(shareUrl);
    Alert.alert('Copié', 'Lien copié dans le presse-papiers');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.handle} />

          <Text style={styles.title}>💸 Partager la course</Text>

          {/* Total */}
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Montant total</Text>
            <Text style={styles.amountValue}>{parseFloat(totalAmount || 0).toFixed(3)} TND</Text>
          </View>

          {/* Persons stepper */}
          <View style={styles.stepperRow}>
            <Text style={styles.stepperLabel}>Nombre de personnes</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setPersons((p) => Math.max(2, p - 1))}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{persons}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setPersons((p) => Math.min(4, p + 1))}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Per person */}
          <View style={styles.perPersonCard}>
            <Text style={styles.perPersonLabel}>Part par personne</Text>
            <Text style={styles.perPersonValue}>{perPerson} TND</Text>
          </View>

          {/* Generate link */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>🔗 Générer le lien de partage</Text>
            )}
          </TouchableOpacity>

          {shareUrl && (
            <>
              <Text style={styles.shareUrlText} numberOfLines={1}>{shareUrl}</Text>

              <TouchableOpacity style={[styles.primaryBtn, styles.whatsappBtn]} onPress={handleWhatsApp}>
                <Text style={styles.primaryBtnText}>📲 Partager via WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBtn} onPress={handleCopy}>
                <Text style={styles.secondaryBtnText}>📋 Copier le lien</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    gap: 14,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: 8,
  },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
  },
  amountLabel: { color: COLORS.textMuted, fontSize: 14 },
  amountValue: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepperLabel: { color: COLORS.text, fontSize: 15 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepperBtn: {
    backgroundColor: COLORS.background,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepperBtnText: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  stepperValue: { color: COLORS.text, fontSize: 20, fontWeight: '800', minWidth: 24, textAlign: 'center' },
  perPersonCard: {
    backgroundColor: COLORS.accent + '22',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  perPersonLabel: { color: COLORS.textMuted, fontSize: 13, marginBottom: 4 },
  perPersonValue: { color: COLORS.accent, fontSize: 28, fontWeight: '800' },
  primaryBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  whatsappBtn: { backgroundColor: '#25D366' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryBtnText: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
  shareUrlText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 10,
  },
  closeBtn: { alignItems: 'center', paddingVertical: 8 },
  closeBtnText: { color: COLORS.textMuted, fontSize: 14 },
});
