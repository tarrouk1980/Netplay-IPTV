import React, { useState, useEffect } from 'react';
import {
  Linking,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../store/authStore';
import EasywayLogo from '../../components/EasywayLogo';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  error: '#E74C3C',
};

const COUNTRY_CODES = [
  { flag: '🇹🇳', code: '+216' },
  { flag: '🇩🇿', code: '+213' },
  { flag: '🇲🇦', code: '+212' },
  { flag: '🇫🇷', code: '+33' },
  { flag: '🇸🇦', code: '+966' },
];

export default function LoginScreen({ navigation }) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    AsyncStorage.getItem('savedCredentials').then((raw) => {
      if (raw) {
        try {
          const { phone: savedPhone, password: savedPassword } = JSON.parse(raw);
          if (savedPhone) setPhone(savedPhone);
          if (savedPassword) setPassword(savedPassword);
          setRememberMe(true);
        } catch (_) {}
      }
    });
  }, []);

  const handleCountryPicker = () => {
    Alert.alert(
      'Sélectionner le pays',
      '',
      COUNTRY_CODES.map((c) => ({
        text: `${c.flag}  ${c.code}`,
        onPress: () => setSelectedCountry(c),
      })).concat([{ text: 'Annuler', style: 'cancel' }])
    );
  };

  const handleClearSaved = async () => {
    await AsyncStorage.removeItem('savedCredentials');
    setPhone('');
    setPassword('');
    setRememberMe(false);
  };

  const handleLogin = async () => {
    if (!phone.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre numéro de téléphone.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre mot de passe.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    clearError();
    const fullPhone = `${selectedCountry.code}${phone.trim()}`;
    const result = await login(fullPhone, password);

    if (result.success) {
      if (rememberMe) {
        await AsyncStorage.setItem(
          'savedCredentials',
          JSON.stringify({ phone: phone.trim(), password })
        );
      } else {
        await AsyncStorage.removeItem('savedCredentials');
      }
      // Navigation handled by App.js based on isAuthenticated state
    } else {
      Alert.alert('Connexion échouée', result.error || 'Identifiants incorrects');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.brandContainer}>
            <EasywayLogo size={100} showTagline={true} />
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Connexion</Text>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Numéro de téléphone</Text>
              <View style={styles.phoneRow}>
                <TouchableOpacity style={styles.countryPicker} onPress={handleCountryPicker}>
                  <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                  <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                  <Text style={styles.countryChevron}>▼</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="XX XXX XXX"
                  placeholderTextColor={COLORS.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mot de passe</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Mot de passe"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.showPasswordBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.showPasswordText}>{showPassword ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot password */}
            <TouchableOpacity
              style={styles.forgotContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            {/* Remember me */}
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>Se souvenir de moi</Text>
            </TouchableOpacity>

            {(phone || password) ? (
              <TouchableOpacity onPress={handleClearSaved} style={{ alignSelf: 'flex-end', marginBottom: 12 }}>
                <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>✕ Effacer les données sauvegardées</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <Text style={styles.loginButtonText}>Connexion</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Pas encore de compte ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>S'inscrire</Text>
              </TouchableOpacity>
            </View>

            {/* Footer SNS + copyright */}
            <View style={styles.footer}>
              <View style={styles.socialsRow}>
                {[
                  { name: 'Facebook', icon: 'f', color: '#1877F2', url: null },
                  { name: 'Instagram', icon: '📸', color: '#E1306C', url: null },
                  { name: 'TikTok', icon: '♪', color: '#FFFFFF', url: null },
                  { name: 'YouTube', icon: '▶', color: '#FF0000', url: null },
                  { name: 'LinkedIn', icon: 'in', color: '#0A66C2', url: null },
                ].map((s) => (
                  <TouchableOpacity
                    key={s.name}
                    style={[styles.socialBtn, { borderColor: s.color, opacity: 0.4 }]}
                    onPress={() => { if (s.url) Linking.openURL(s.url); }}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.socialIcon, { color: s.color }]}>{s.icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.copyright}>© 2025 EASYWAY. Tous droits réservés.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brandContainer: { alignItems: 'center', marginBottom: 40 },
  formContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
  },
  formTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 20 },
  errorBox: {
    backgroundColor: '#3D1515',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  errorText: { color: COLORS.error, fontSize: 13 },
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
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252535',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  countryFlag: { fontSize: 18 },
  countryCode: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  countryChevron: { color: COLORS.textMuted, fontSize: 9, marginLeft: 2 },
  phoneInput: {
    flex: 1,
    backgroundColor: '#252535',
    borderRadius: 10,
    padding: 14,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passwordContainer: { position: 'relative' },
  passwordInput: { paddingRight: 50 },
  showPasswordBtn: { position: 'absolute', right: 14, top: 14 },
  showPasswordText: { fontSize: 18 },
  forgotContainer: { alignItems: 'flex-end', marginBottom: 12 },
  forgotText: { color: COLORS.primary, fontSize: 13, fontWeight: '500' },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: '#252535',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  checkmark: { color: '#0A0A0F', fontSize: 12, fontWeight: '800' },
  rememberText: { color: COLORS.textMuted, fontSize: 14 },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { color: COLORS.background, fontWeight: '700', fontSize: 16 },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  registerText: { color: COLORS.textMuted, fontSize: 14 },
  registerLink: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  footer: { alignItems: 'center', paddingTop: 28, paddingBottom: 8, gap: 8 },
  socialsRow: { flexDirection: 'row', gap: 10 },
  socialBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1C1C28' },
  socialIcon: { fontSize: 13, fontWeight: '800' },
  copyright: { color: '#4A4A5A', fontSize: 11 },
});
