import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  accent: '#D32F2F',
  white: '#FFFFFF',
  muted: '#8A8A9A',
  border: '#2A2A3A',
  green: '#2E7D32',
};

const REPORT_REASONS = [
  'Comportement inapproprié',
  'Retard excessif',
  'Prix non respecté',
  'Véhicule en mauvais état',
  'Conduite dangereuse',
  'Autre',
];

export default function ReportModal({ visible, onClose, orderId, reportedUserId, reportedName }) {
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleReason = (reason) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const handleSubmit = async () => {
    if (selectedReasons.length === 0) {
      Alert.alert('Motif requis', 'Veuillez sélectionner au moins un motif.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/reports', {
        orderId: orderId || null,
        reportedUserId,
        reasons: selectedReasons,
        details: details.trim(),
      });
      Alert.alert(
        'Signalement envoyé',
        'Votre signalement a été transmis à notre équipe. Nous le traiterons dans les plus brefs délais.',
        [{ text: 'OK', onPress: handleClose }]
      );
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || "Impossible d'envoyer le signalement.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedReasons([]);
    setDetails('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Signaler un problème</Text>
              {reportedName ? (
                <Text style={styles.subtitle}>Concernant: {reportedName}</Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Reasons */}
            <Text style={styles.sectionLabel}>Motif(s) du signalement *</Text>
            <View style={styles.reasons}>
              {REPORT_REASONS.map((reason) => {
                const selected = selectedReasons.includes(reason);
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.reasonRow, selected && styles.reasonRowSelected]}
                    onPress={() => toggleReason(reason)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                      {selected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={[styles.reasonTxt, selected && styles.reasonTxtSelected]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Details */}
            <Text style={styles.sectionLabel}>Détails (optionnel)</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              placeholder="Décrivez le problème en détail..."
              placeholderTextColor={COLORS.muted}
              value={details}
              onChangeText={setDetails}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{details.length}/500</Text>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} disabled={loading}>
              <Text style={styles.cancelTxt}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
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
    backgroundColor: '#00000099',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  subtitle: { color: COLORS.muted, fontSize: 13, marginTop: 4 },
  closeBtn: { padding: 4 },
  closeTxt: { color: COLORS.muted, fontSize: 20 },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  sectionLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 8,
  },
  reasons: { gap: 8, marginBottom: 20 },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reasonRowSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '15',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent,
  },
  checkmark: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  reasonTxt: { color: COLORS.muted, fontSize: 14, flex: 1 },
  reasonTxtSelected: { color: COLORS.white, fontWeight: '600' },
  textArea: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    color: COLORS.white,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 6,
  },
  charCount: { color: COLORS.muted, fontSize: 11, textAlign: 'right', marginBottom: 20 },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
  },
  cancelTxt: { color: COLORS.muted, fontWeight: '600', fontSize: 15 },
  submitBtn: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: COLORS.accent,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitTxt: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
