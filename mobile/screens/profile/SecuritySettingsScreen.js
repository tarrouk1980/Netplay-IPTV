import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C',
};

export default function SecuritySettingsScreen({ navigation }) {
  const { logout } = useAuthStore();
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  const sessions = [
    { id: 1, device: 'Samsung Galaxy S23', location: 'Tunis, TN', time: 'Actuel', current: true },
    { id: 2, device: 'Chrome / Windows', location: 'Tunis, TN', time: 'Il y a 2 jours', current: false },
    { id: 3, device: 'iPhone 14', location: 'Sfax, TN', time: 'Il y a 5 jours', current: false },
  ];

  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) { Alert.alert('Champs requis', 'Remplissez tous les champs.'); return; }
    if (newPwd.length < 6) { Alert.alert('Mot de passe trop court', 'Minimum 6 caractères.'); return; }
    if (newPwd !== confirmPwd) { Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.'); return; }
    setSavingPwd(true);
    try {
      await api.post('/api/auth/change-password', { currentPassword: currentPwd, newPassword: newPwd });
      Alert.alert('✅ Succès', 'Mot de passe modifié avec succès.');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Mot de passe actuel incorrect.');
    } finally {
      setSavingPwd(false);
    }
  };

  const revokeSession = (session) => {
    if (session.current) return;
    Alert.alert('Révoquer', `Déconnecter "${session.device}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Révoquer', style: 'destructive', onPress: async () => {
        try { await api.delete(`/api/auth/sessions/${session.id}`); } catch {}
      }},
    ]);
  };

  const handleLogoutAll = () => {
    Alert.alert('Déconnecter partout', 'Vous serez déconnecté de tous vos appareils.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter tout', style: 'destructive', onPress: async () => {
        try { await api.post('/api/auth/logout-all'); } catch {}
        logout();
      }},
    ]);
  };

  const pwdStrength = () => {
    if (!newPwd) return null;
    if (newPwd.length < 6) return { label: 'Faible', color: COLORS.red, width: '25%' };
    if (newPwd.length < 10 || !/[A-Z]/.test(newPwd)) return { label: 'Moyen', color: COLORS.accent, width: '55%' };
    return { label: 'Fort', color: COLORS.green, width: '100%' };
  };
  const strength = pwdStrength();

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sécurité du compte</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Change password */}
        <Text style={styles.sectionTitle}>🔑 Modifier le mot de passe</Text>
        <View style={styles.card}>
          <View style={styles.pwdWrap}>
            <TextInput style={styles.pwdInput} value={currentPwd} onChangeText={setCurrentPwd} placeholder="Mot de passe actuel" placeholderTextColor={COLORS.muted} secureTextEntry={!showCurrentPwd} />
            <TouchableOpacity onPress={() => setShowCurrentPwd(!showCurrentPwd)}>
              <Text style={{ color: COLORS.muted, fontSize: 16 }}>{showCurrentPwd ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pwdWrap}>
            <TextInput style={styles.pwdInput} value={newPwd} onChangeText={setNewPwd} placeholder="Nouveau mot de passe" placeholderTextColor={COLORS.muted} secureTextEntry={!showNewPwd} />
            <TouchableOpacity onPress={() => setShowNewPwd(!showNewPwd)}>
              <Text style={{ color: COLORS.muted, fontSize: 16 }}>{showNewPwd ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
          {strength && (
            <View style={{ marginBottom: 10 }}>
              <View style={styles.strengthBar}>
                <View style={[styles.strengthFill, { width: strength.width, backgroundColor: strength.color }]} />
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
            </View>
          )}
          <TextInput style={[styles.pwdInput, { marginBottom: 14 }]} value={confirmPwd} onChangeText={setConfirmPwd} placeholder="Confirmer le nouveau mot de passe" placeholderTextColor={COLORS.muted} secureTextEntry />
          <TouchableOpacity style={[styles.saveBtn, savingPwd && { opacity: 0.6 }]} onPress={handleChangePassword} disabled={savingPwd}>
            {savingPwd ? <ActivityIndicator color="#000" /> : <Text style={styles.saveBtnText}>Changer le mot de passe</Text>}
          </TouchableOpacity>
        </View>

        {/* Security options */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>🛡️ Options de sécurité</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Double authentification (2FA)</Text>
              <Text style={styles.toggleSub}>Vérification par SMS à chaque connexion</Text>
            </View>
            <Switch value={twoFactor} onValueChange={setTwoFactor} thumbColor={twoFactor ? COLORS.green : COLORS.muted} trackColor={{ false: COLORS.border, true: COLORS.green + '66' }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Alertes de connexion</Text>
              <Text style={styles.toggleSub}>Notification à chaque nouvelle connexion</Text>
            </View>
            <Switch value={loginAlerts} onValueChange={setLoginAlerts} thumbColor={loginAlerts ? COLORS.accent : COLORS.muted} trackColor={{ false: COLORS.border, true: COLORS.accent + '66' }} />
          </View>
        </View>

        {/* Sessions */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>📱 Sessions actives</Text>
        <View style={styles.card}>
          {sessions.map((s, i) => (
            <View key={s.id}>
              <View style={styles.sessionRow}>
                <Text style={{ fontSize: 22 }}>{s.device.includes('iPhone') ? '📱' : s.device.includes('Chrome') ? '💻' : '📱'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionDevice}>{s.device}</Text>
                  <Text style={styles.sessionMeta}>{s.location} · {s.time}</Text>
                </View>
                {s.current
                  ? <View style={styles.currentBadge}><Text style={styles.currentText}>Actuel</Text></View>
                  : <TouchableOpacity onPress={() => revokeSession(s)}><Text style={{ color: COLORS.red, fontSize: 12, fontWeight: '700' }}>Révoquer</Text></TouchableOpacity>
                }
              </View>
              {i < sessions.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.dangerBtn} onPress={handleLogoutAll}>
          <Text style={styles.dangerBtnText}>🚪 Déconnecter tous les appareils</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  sectionTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  pwdWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceAlt, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, marginBottom: 10 },
  pwdInput: { flex: 1, paddingVertical: 13, color: COLORS.white, fontSize: 14 },
  strengthBar: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  strengthFill: { height: '100%', borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: '700' },
  saveBtn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  toggleLabel: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  toggleSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sessionDevice: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  sessionMeta: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  currentBadge: { backgroundColor: COLORS.green + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  currentText: { color: COLORS.green, fontSize: 10, fontWeight: '700' },
  dangerBtn: { backgroundColor: COLORS.red + '11', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.red + '44', marginTop: 8 },
  dangerBtnText: { color: COLORS.red, fontSize: 14, fontWeight: '700' },
});
