import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  error: '#E74C3C',
};

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    if (!phone.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre numéro de téléphone');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { phone: phone.trim() });
      setStep(2);
    } catch (err) {
      const message = err.response?.data?.error || 'Impossible d\'envoyer le code. Vérifiez votre numéro.';
      Alert.alert('Erreur', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!code.trim() || code.length !== 4) {
      Alert.alert('Erreur', 'Veuillez saisir le code à 4 chiffres');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/api/auth/reset-password', {
        phone: phone.trim(),
        code: code.trim(),
        newPassword,
      });
      Alert.alert('Succès', 'Mot de passe modifié !', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err) {
      const message = err.response?.data?.error || 'Code invalide ou expiré.';
      Alert.alert('Erreur', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mot de passe oublié</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.formContainer}>
            {step === 1 ? (
              <>
                <Text style={styles.formTitle}>Réinitialisation</Text>
                <Text style={styles.formSubtitle}>
                  Saisissez votre numéro de téléphone. Nous vous enverrons un code de vérification.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Numéro de téléphone</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+216 XX XXX XXX"
                    placeholderTextColor={COLORS.textMuted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleSendCode}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={COLORS.background} />
                  ) : (
                    <Text style={styles.buttonText}>Envoyer le code</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.formTitle}>Nouveau mot de passe</Text>
                <Text style={styles.formSubtitle}>
                  Saisissez le code reçu par SMS et choisissez un nouveau mot de passe.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Code OTP (4 chiffres)</Text>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="• • • •"
                    placeholderTextColor={COLORS.textMuted}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="numeric"
                    maxLength={4}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Minimum 6 caractères"
                    placeholderTextColor={COLORS.textMuted}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    editable={!isLoading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={COLORS.background} />
                  ) : (
                    <Text style={styles.buttonText}>Réinitialiser</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendRow}
                  onPress={() => setStep(1)}
                >
                  <Text style={styles.resendText}>Changer de numéro</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
  },
  backBtnText: { color: COLORS.primary, fontSize: 20, fontWeight: '700' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  formContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
  },
  formTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  formSubtitle: { fontSize: 13, color: COLORS.textMuted, marginBottom: 24, lineHeight: 20 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, color: COLORS.textMuted, marginBottom: 6, fontWeight: '500' },
  input: {
    backgroundColor: '#252535',
    borderRadius: 10,
    padding: 14,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: '700',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: COLORS.background, fontWeight: '700', fontSize: 16 },
  resendRow: { alignItems: 'center', marginTop: 16 },
  resendText: { color: COLORS.primary, fontSize: 14, fontWeight: '500' },
});
