import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
};

const KYC_STATUS_CONFIG = {
  NOT_REQUIRED: { label: 'Non requis', color: COLORS.textMuted, emoji: '—' },
  PENDING: { label: 'En attente', color: COLORS.warning, emoji: '⏳' },
  APPROVED: { label: 'Approuvé', color: COLORS.success, emoji: '✅' },
  REJECTED: { label: 'Rejeté', color: COLORS.error, emoji: '❌' },
};

const ROLE_LABELS = {
  CLIENT: 'Client',
  CHAUFFEUR: 'Chauffeur',
  LIVREUR: 'Livreur',
  DEPANNEUR: 'Dépanneur',
  MARCHAND: 'Marchand',
  ADMIN: 'Administrateur',
};

export default function ProfileScreen({ navigation }) {
  const { user, setUser, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Register FCM token on profile open
    (async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === 'granted') {
          const tokenData = await Notifications.getExpoPushTokenAsync();
          await api.post('/api/users/me/fcm-token', { fcmToken: tokenData.data });
        }
      } catch (err) {
        console.warn('[ProfileScreen] FCM token registration failed:', err?.message);
      }
    })();
  }, []);
  const [isSaving, setIsSaving] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = async () => {
    if (!editedName.trim()) {
      Alert.alert('Erreur', 'Le nom ne peut pas être vide');
      return;
    }
    setIsSaving(true);
    try {
      const response = await api.patch('/api/users/me', {
        name: editedName.trim(),
        email: editedEmail.trim() || undefined,
      });
      setUser(response.data);
      setIsEditing(false);
      Alert.alert('Succès', 'Profil mis à jour');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Mise à jour échouée');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: logout },
    ]);
  };

  const kycConfig = KYC_STATUS_CONFIG[user?.kycStatus] || KYC_STATUS_CONFIG.NOT_REQUIRED;
  const showKyc = ['CHAUFFEUR', 'DEPANNEUR'].includes(user?.role);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <Text style={styles.roleBadge}>{ROLE_LABELS[user?.role] || user?.role}</Text>
        </View>

        {/* KYC Banner */}
        {showKyc && (
          <View style={[styles.kycBanner, { borderLeftColor: kycConfig.color }]}>
            <Text style={styles.kycEmoji}>{kycConfig.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.kycTitle}>KYC: {kycConfig.label}</Text>
              {user?.kycStatus !== 'APPROVED' && (
                <Text style={styles.kycSubtitle}>
                  {user?.kycStatus === 'PENDING'
                    ? 'Documents en cours de vérification'
                    : 'Soumettez vos documents pour activer votre compte'}
                </Text>
              )}
            </View>
            {user?.kycStatus !== 'APPROVED' && user?.kycStatus !== 'PENDING' && (
              <TouchableOpacity
                style={styles.kycBtn}
                onPress={() => navigation.navigate('KYC')}
              >
                <Text style={styles.kycBtnText}>Soumettre</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Profile info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Informations</Text>
            <TouchableOpacity
              onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={COLORS.primary} size="small" />
              ) : (
                <Text style={styles.editBtn}>{isEditing ? 'Enregistrer' : 'Modifier'}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nom</Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={editedName}
                onChangeText={setEditedName}
                placeholderTextColor={COLORS.textMuted}
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.name}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Téléphone</Text>
            <Text style={styles.fieldValue}>{user?.phone}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={editedEmail}
                onChangeText={setEditedEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="email@exemple.com"
                placeholderTextColor={COLORS.textMuted}
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.email || '—'}</Text>
            )}
          </View>

          {isEditing && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setIsEditing(false);
                setEditedName(user?.name || '');
                setEditedEmail(user?.email || '');
              }}
            >
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Autres</Text>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('EasyPoints')}>
            <Text style={styles.quickLinkText}>🏆 EasyPoints</Text>
            <Text style={styles.quickLinkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('EasyBusiness')}>
            <Text style={styles.quickLinkText}>🏢 EasyBusiness</Text>
            <Text style={styles.quickLinkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('ProviderOnboarding')}>
            <Text style={styles.quickLinkText}>🚀 Devenir prestataire</Text>
            <Text style={styles.quickLinkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('SilentSOS')}>
            <Text style={styles.quickLinkText}>📱 SOS Discret</Text>
            <Text style={styles.quickLinkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('Emergency')}>
            <Text style={styles.quickLinkText}>🆘 Urgence Famille</Text>
            <Text style={styles.quickLinkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.quickLinkText}>⚙️ Paramètres</Text>
            <Text style={styles.quickLinkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('History')}>
            <Text style={styles.quickLinkText}>📋 Historique de mes commandes</Text>
            <Text style={styles.quickLinkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('PromoCode')}>
            <Text style={styles.quickLinkText}>🏷️ Code promo</Text>
            <Text style={styles.quickLinkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('Referral')}>
            <Text style={styles.quickLinkText}>🎁 Parrainage — Invitez vos amis</Text>
            <Text style={styles.quickLinkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('ShareApp')}>
            <Text style={styles.quickLinkText}>📤 Partager l'application</Text>
            <Text style={styles.quickLinkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('AddressBook')}>
            <Text style={styles.quickLinkText}>📍 Carnet d'adresses</Text>
            <Text style={styles.quickLinkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('Support')}>
            <Text style={styles.quickLinkText}>🆘 Aide & Support</Text>
            <Text style={styles.quickLinkArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  avatarSection: { alignItems: 'center', paddingVertical: 32 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: COLORS.background },
  roleBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    color: COLORS.textMuted,
    fontSize: 13,
  },
  kycBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    gap: 12,
  },
  kycEmoji: { fontSize: 24 },
  kycTitle: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
  kycSubtitle: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  kycBtn: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  kycBtnText: { color: COLORS.background, fontWeight: '600', fontSize: 12 },
  section: { backgroundColor: COLORS.surface, margin: 16, borderRadius: 16, padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  editBtn: { color: COLORS.primary, fontWeight: '600' },
  field: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  fieldLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  fieldValue: { fontSize: 15, color: COLORS.text },
  fieldInput: {
    fontSize: 15,
    color: COLORS.text,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingVertical: 4,
  },
  cancelBtn: { marginTop: 12, alignItems: 'center' },
  cancelBtnText: { color: COLORS.textMuted },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  quickLinkText: { fontSize: 14, color: COLORS.text },
  quickLinkArrow: { fontSize: 20, color: COLORS.textMuted },
  logoutBtn: {
    backgroundColor: '#1A0A0A',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: { color: COLORS.error, fontWeight: '600', fontSize: 15 },
});
