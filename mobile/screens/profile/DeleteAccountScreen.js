import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F',
};

const REASONS = [
  'Je n\'utilise plus l\'application',
  'L\'application ne répond pas à mes besoins',
  'Je crée un nouveau compte',
  'Problème de confidentialité',
  'Trop de notifications',
  'Autre raison',
];

export default function DeleteAccountScreen({ navigation }) {
  const { logout } = useAuthStore();
  const [reason, setReason] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [step, setStep] = useState(1);
  const [deleting, setDeleting] = useState(false);

  const canProceed = reason && confirmation.toUpperCase() === 'SUPPRIMER';

  const handleDelete = async () => {
    Alert.alert(
      '⚠️ Dernière confirmation',
      'Cette action est IRRÉVERSIBLE. Toutes vos données seront supprimées définitivement.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer mon compte', style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await api.delete('/api/user/account', { data: { reason } });
              await logout();
              navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer le compte. Contactez le support.');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Supprimer le compte</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {step === 1 && (
          <>
            <View style={styles.warningBox}>
              <Text style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>⚠️</Text>
              <Text style={styles.warningTitle}>Êtes-vous sûr ?</Text>
              <Text style={styles.warningText}>
                La suppression de votre compte entraîne la perte permanente de :
              </Text>
              {[
                '• Votre historique de courses et commandes',
                '• Votre solde de portefeuille',
                '• Vos EasyPoints et récompenses',
                '• Vos données de parrainage',
                '• Votre accès aux services EASYWAY',
              ].map((item) => (
                <Text key={item} style={styles.lossItem}>{item}</Text>
              ))}
            </View>

            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() => setStep(2)}
            >
              <Text style={styles.continueBtnText}>Je comprends, continuer →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelBtnText}>Garder mon compte</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.sectionLabel}>Pourquoi souhaitez-vous partir ?</Text>
            {REASONS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.reasonBtn, reason === r && styles.reasonBtnActive]}
                onPress={() => setReason(r)}
              >
                <View style={[styles.radioCircle, reason === r && styles.radioCircleActive]}>
                  {reason === r && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.reasonText, reason === r && { color: COLORS.white }]}>{r}</Text>
              </TouchableOpacity>
            ))}

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Confirmez en tapant « SUPPRIMER »</Text>
            <TextInput
              style={[styles.confirmInput, confirmation.toUpperCase() === 'SUPPRIMER' && { borderColor: COLORS.red }]}
              value={confirmation}
              onChangeText={setConfirmation}
              placeholder="SUPPRIMER"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="characters"
              maxLength={10}
            />

            <TouchableOpacity
              style={[styles.deleteBtn, !canProceed && { opacity: 0.4 }]}
              onPress={handleDelete}
              disabled={!canProceed || deleting}
            >
              {deleting
                ? <ActivityIndicator color={COLORS.white} size="small" />
                : <Text style={styles.deleteBtnText}>🗑️ Supprimer définitivement</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setStep(1)}>
              <Text style={styles.cancelBtnText}>← Retour</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
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
  title: { color: COLORS.red, fontSize: 16, fontWeight: '700' },
  scroll: { padding: 20 },
  warningBox: {
    backgroundColor: '#1A0000', borderRadius: 16,
    borderWidth: 1.5, borderColor: COLORS.red, padding: 20, marginBottom: 20,
  },
  warningTitle: { color: COLORS.red, fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  warningText: { color: COLORS.white, fontSize: 14, marginBottom: 10, lineHeight: 20 },
  lossItem: { color: COLORS.muted, fontSize: 13, lineHeight: 22 },
  continueBtn: {
    backgroundColor: COLORS.red, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginBottom: 10,
  },
  continueBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  cancelBtn: {
    backgroundColor: COLORS.green, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  sectionLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  reasonBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 8,
  },
  reasonBtnActive: { borderColor: COLORS.red, backgroundColor: '#1A0000' },
  radioCircle: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: COLORS.muted,
    alignItems: 'center', justifyContent: 'center',
  },
  radioCircleActive: { borderColor: COLORS.red },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.red },
  reasonText: { flex: 1, color: COLORS.muted, fontSize: 14 },
  confirmInput: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1.5, borderColor: COLORS.border,
    color: COLORS.red, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 18, fontWeight: '900', letterSpacing: 3,
    textAlign: 'center', marginBottom: 20,
  },
  deleteBtn: {
    backgroundColor: COLORS.red, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginBottom: 10,
  },
  deleteBtnText: { color: COLORS.white, fontWeight: '900', fontSize: 15 },
});
