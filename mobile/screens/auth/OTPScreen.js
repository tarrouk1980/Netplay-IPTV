import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  inputActive: '#F5A623',
};

export default function OTPScreen({ navigation, route }) {
  const phone = route?.params?.phone || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  const { setTokens } = useAuthStore();

  // Countdown for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/[^0-9]/g, '').slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Erreur', 'Veuillez saisir le code à 6 chiffres complet');
      return;
    }

    setIsVerifying(true);
    try {
      await api.post('/api/auth/otp/verify', { phone, otp: otpCode });
      Alert.alert('Succès', 'Numéro vérifié avec succès !', [
        { text: 'Continuer', onPress: () => navigation.replace('Main') },
      ]);
    } catch (error) {
      const message = error.response?.data?.error || 'Code OTP invalide';
      Alert.alert('Erreur', message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setIsResending(true);
    try {
      await api.post('/api/auth/otp/send', { phone });
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      Alert.alert('Code renvoyé', 'Un nouveau code a été envoyé');
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'envoyer le code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>📱</Text>
          <Text style={styles.title}>Vérification</Text>
          <Text style={styles.subtitle}>
            Entrez le code à 6 chiffres envoyé au{'\n'}
            <Text style={styles.phoneHighlight}>{phone}</Text>
          </Text>
        </View>

        {/* OTP Input boxes */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              caretHidden
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={isVerifying || otp.join('').length !== 6}
        >
          {isVerifying ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.verifyButtonText}>Vérifier</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          {countdown > 0 ? (
            <Text style={styles.countdownText}>
              Renvoyer dans <Text style={styles.countdownNum}>{countdown}s</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={isResending}>
              {isResending ? (
                <ActivityIndicator color={COLORS.primary} size="small" />
              ) : (
                <Text style={styles.resendLink}>Renvoyer le code</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: 'center', padding: 32 },
  header: { alignItems: 'center', marginBottom: 40 },
  emoji: { fontSize: 60, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  subtitle: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
  phoneHighlight: { color: COLORS.primary, fontWeight: '600' },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 32 },
  otpBox: {
    width: 48,
    height: 56,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  otpBoxFilled: { borderColor: COLORS.primary },
  verifyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonDisabled: { opacity: 0.5 },
  verifyButtonText: { color: COLORS.background, fontWeight: '700', fontSize: 16 },
  resendContainer: { alignItems: 'center' },
  countdownText: { color: COLORS.textMuted, fontSize: 14 },
  countdownNum: { color: COLORS.primary },
  resendLink: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
});
