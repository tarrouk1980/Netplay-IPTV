import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { setTokens } from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  error: '#E74C3C',
  selected: '#F5A623',
};

const ROLES = [
  { value: 'CLIENT', label: 'Client', emoji: '👤' },
  { value: 'CHAUFFEUR', label: 'Chauffeur', emoji: '🚗' },
  { value: 'LIVREUR', label: 'Livreur', emoji: '📦' },
  { value: 'DEPANNEUR', label: 'Dépanneur', emoji: '🔧' },
  { value: 'MARCHAND', label: 'Marchand', emoji: '🏪' },
];

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { setUser, setTokens: storeSetTokens } = useAuthStore();

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Nom, téléphone et mot de passe sont obligatoires');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    try {
      const body = { name: name.trim(), phone: phone.trim(), role, password };
      if (email.trim()) body.email = email.trim();

      const response = await api.post('/api/auth/register', body);
      const { user, accessToken, refreshToken } = response.data;

      await setTokens(accessToken, refreshToken);
      setUser(user);
      storeSetTokens(accessToken, refreshToken);

      navigation.navigate('OTP', { phone: phone.trim() });
    } catch (error) {
      const message = error.response?.data?.error || "L'inscription a échoué";
      Alert.alert('Erreur', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Créer un compte</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom complet *</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre nom"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Téléphone *</Text>
            <TextInput
              style={styles.input}
              placeholder="+216 XX XXX XXX"
              placeholderTextColor={COLORS.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email (optionnel)</Text>
            <TextInput
              style={styles.input}
              placeholder="email@exemple.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mot de passe *</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimum 6 caractères"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Rôle</Text>
            <View style={styles.rolesGrid}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.roleBtn, role === r.value && styles.roleBtnSelected]}
                  onPress={() => setRole(r.value)}
                  disabled={isLoading}
                >
                  <Text style={styles.roleEmoji}>{r.emoji}</Text>
                  <Text style={[styles.roleLabel, role === r.value && styles.roleLabelSelected]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <Text style={styles.registerButtonText}>S'inscrire</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 24 },
  header: { marginBottom: 24 },
  backBtn: { color: COLORS.primary, fontSize: 16, marginBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  formContainer: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 24 },
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
  rolesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleBtn: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: '#252535',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleBtnSelected: { borderColor: COLORS.primary, backgroundColor: '#2A1F0A' },
  roleEmoji: { fontSize: 24, marginBottom: 4 },
  roleLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '500' },
  roleLabelSelected: { color: COLORS.primary },
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: { opacity: 0.6 },
  registerButtonText: { color: COLORS.background, fontWeight: '700', fontSize: 16 },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { color: COLORS.textMuted, fontSize: 14 },
  loginLink: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
});
