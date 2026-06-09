import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '@/lib/api';
import { login } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'client',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleRegister() {
    if (!form.name || !form.email || !form.password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (form.password !== form.password_confirmation) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/register', form);
      await login(form.email, form.password);
      router.replace('/(tabs)/' as any);
    } catch {
      Alert.alert('Erreur', 'Une erreur est survenue. Cet email est peut-être déjà utilisé.');
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
            <Text style={styles.headerTitle}>Créer un compte</Text>
            <Text style={styles.headerSub}>Rejoignez 10 000+ professionnels</Text>
          </LinearGradient>

          {/* Form */}
          <View style={styles.form}>
            {/* Role selector */}
            <View style={styles.roleSelector}>
              {(['client', 'expert'] as const).map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleBtn, form.role === role && styles.roleBtnActive]}
                  onPress={() => update('role', role)}
                >
                  <Text style={[styles.roleBtnText, form.role === role && styles.roleBtnTextActive]}>
                    {role === 'client' ? '👤 Client' : '🎯 Expert'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Nom complet</Text>
              <TextInput value={form.name} onChangeText={(v) => update('name', v)} placeholder="Votre nom" placeholderTextColor="#9CA3AF" style={styles.input} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput value={form.email} onChangeText={(v) => update('email', v)} placeholder="votre@email.com" placeholderTextColor="#9CA3AF" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.passwordContainer}>
                <TextInput value={form.password} onChangeText={(v) => update('password', v)} placeholder="8 caractères minimum" placeholderTextColor="#9CA3AF" secureTextEntry={!showPassword} style={[styles.input, styles.passwordInput]} />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <TextInput value={form.password_confirmation} onChangeText={(v) => update('password_confirmation', v)} placeholder="Confirmez votre mot de passe" placeholderTextColor="#9CA3AF" secureTextEntry style={styles.input} />
            </View>

            <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleRegister} disabled={loading}>
              <Text style={styles.submitButtonText}>{loading ? 'Création...' : 'Créer mon compte'}</Text>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Déjà membre? </Text>
              <TouchableOpacity onPress={() => router.push('/login' as any)}>
                <Text style={styles.switchLink}>Se connecter</Text>
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
  logo: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 8 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  headerSub: { color: '#C7D2FE', fontSize: 14 },
  form: { backgroundColor: '#fff', flex: 1, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -16, padding: 24, paddingTop: 28 },
  roleSelector: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  roleBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, borderWidth: 2, borderColor: '#E5E7EB', alignItems: 'center' },
  roleBtnActive: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  roleBtnText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  roleBtnTextActive: { color: '#4F46E5' },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#1E1B4B' },
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
