import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  green: '#27AE60',
  accent: '#D32F2F',
};

const AVATAR_OPTIONS = ['😊', '😎', '🤩', '👨', '👩', '🧑', '👦', '👧', '🧔', '👱', '🧑‍💼', '👮', '🦸', '🧙'];

function Field({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize, maxLength }) {
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      <TextInput
        style={f.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize || 'sentences'}
        maxLength={maxLength}
      />
    </View>
  );
}

const f = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    color: COLORS.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

export default function ClientProfileEditScreen({ navigation }) {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '😊');
  const [saving, setSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Erreur', 'Le nom est requis.'); return; }
    setSaving(true);
    try {
      const res = await api.patch('/api/users/me', { name: name.trim(), email: email.trim() || undefined, avatar });
      setUser?.({ ...user, name: name.trim(), email: email.trim(), avatar });
      Alert.alert('Profil mis à jour ✅', 'Vos informations ont été enregistrées.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erreur', e?.response?.data?.error || 'Impossible de sauvegarder.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Modifier le profil</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={COLORS.green} size="small" /> : <Text style={s.saveBtn}>Enregistrer</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Avatar */}
        <View style={s.avatarSection}>
          <TouchableOpacity style={s.avatarBtn} onPress={() => setShowAvatarPicker(!showAvatarPicker)}>
            <Text style={{ fontSize: 56 }}>{avatar}</Text>
          </TouchableOpacity>
          <Text style={s.avatarHint}>Appuyez pour changer l'avatar</Text>
        </View>

        {showAvatarPicker && (
          <View style={s.avatarGrid}>
            {AVATAR_OPTIONS.map((a) => (
              <TouchableOpacity
                key={a}
                style={[s.avatarOption, avatar === a && s.avatarOptionActive]}
                onPress={() => { setAvatar(a); setShowAvatarPicker(false); }}
              >
                <Text style={{ fontSize: 28 }}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Field label="Nom complet" value={name} onChangeText={setName} placeholder="Votre nom" maxLength={60} />
        <Field label="Téléphone" value={phone} onChangeText={() => {}} placeholder={phone} keyboardType="phone-pad" autoCapitalize="none" />
        <Text style={s.phoneHint}>Le numéro de téléphone ne peut pas être modifié.</Text>
        <Field label="Email (optionnel)" value={email} onChangeText={setEmail} placeholder="email@exemple.com" keyboardType="email-address" autoCapitalize="none" />

        {/* Role info */}
        <View style={s.roleCard}>
          <Text style={s.roleLabel}>Rôle</Text>
          <Text style={s.roleValue}>{user?.role || 'CLIENT'}</Text>
        </View>

        {/* KYC status */}
        <View style={s.kycCard}>
          <View>
            <Text style={s.kycTitle}>Statut KYC</Text>
            <Text style={[s.kycStatus, { color: user?.kycStatus === 'APPROVED' ? COLORS.green : COLORS.muted }]}>
              {user?.kycStatus === 'APPROVED' ? '✅ Vérifié' : user?.kycStatus === 'PENDING' ? '⏳ En attente' : '❌ Non soumis'}
            </Text>
          </View>
          {user?.kycStatus !== 'APPROVED' && (
            <TouchableOpacity style={s.kycBtn} onPress={() => navigation.navigate('KYC')}>
              <Text style={s.kycBtnTxt}>Vérifier →</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 17, fontWeight: '700', flex: 1 },
  saveBtn: { color: COLORS.green, fontSize: 15, fontWeight: '700' },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarBtn: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.border },
  avatarHint: { color: COLORS.muted, fontSize: 12, marginTop: 8 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20, justifyContent: 'center' },
  avatarOption: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  avatarOptionActive: { borderColor: COLORS.green, borderWidth: 2 },
  phoneHint: { color: COLORS.muted, fontSize: 11, marginTop: -10, marginBottom: 16 },
  roleCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  roleLabel: { color: COLORS.muted, fontSize: 13 },
  roleValue: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  kycCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  kycTitle: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  kycStatus: { fontSize: 13, fontWeight: '600' },
  kycBtn: { backgroundColor: COLORS.green + '22', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: COLORS.green },
  kycBtnTxt: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
});
