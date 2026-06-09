import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { login } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      const { user } = await login(email, password);
      if (user.role === 'admin') router.replace('/dashboard/admin' as any);
      else if (user.role === 'expert') router.replace('/dashboard/expert' as any);
      else router.replace('/(tabs)/' as any);
    } catch {
      Alert.alert('Erreur', 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <LinearGradient colors={['#1E1B4B', '#4338CA', '#7C3AED']} style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.logo}>SKOLZ</Text>
            <Text style={styles.headerTitle}>Bon retour 👋</Text>
            <Text style={styles.headerSub}>Connectez-vous pour continuer</Text>
          </LinearGradient>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="votre@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  style={[styles.input, styles.passwordInput]}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Pas encore de compte? </Text>
              <TouchableOpacity onPress={() => router.push('/register' as any)}>
                <Text style={styles.switchLink}>S&apos;inscrire</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: { paddingTop: 16, paddingBottom: 40, paddingHorizontal: 24 },
  backBtn: { marginBottom: 20, width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  logo: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 8, letterSpacing: -0.5 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  headerSub: { color: '#C7D2FE', fontSize: 14 },
  form: { backgroundColor: '#fff', flex: 1, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -16, padding: 24, paddingTop: 32 },
  field: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#1E1B4B',
  },
  passwordContainer: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
  submitButton: { backgroundColor: '#4F46E5', borderRadius: 99, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  switchText: { color: '#6B7280', fontSize: 14 },
  switchLink: { color: '#4F46E5', fontSize: 14, fontWeight: '700' },
});
