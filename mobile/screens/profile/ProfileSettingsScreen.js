import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
  red: '#EF4444',
};

const ROLE_LABELS = {
  client: 'Client',
  driver: 'Chauffeur',
  livreur: 'Livreur',
  depanneur: 'Dépanneur 🛻',
  merchant: 'Marchand',
  admin: 'Administrateur',
};

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}

export default function ProfileSettingsScreen({ navigation }) {
  const { user, logout } = useAuthStore();
  const userName = user?.name || user?.fullName || "Utilisateur";
  const userRole = user?.role || 'client';
  const userPhone = user?.phone || '+216 XX XXX XXX';

  const [notifPush, setNotifPush] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [notifEmail, setNotifEmail] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Se déconnecter",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: () => {
            if (logout) logout();
          },
        },
      ]
    );
  };

  const handlePress = (label) => {
    Alert.alert(label, "Cette fonctionnalité sera disponible prochainement.", [{ text: 'OK' }]);
  };

  const renderItem = (emoji, label, onPress, right = '›', color = COLORS.text) => (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.itemEmoji}>{emoji}</Text>
      <Text style={[styles.itemLabel, { color }]}>{label}</Text>
      {typeof right === 'string' ? (
        <Text style={styles.chevron}>{right}</Text>
      ) : (
        right
      )}
    </TouchableOpacity>
  );

  const renderSwitch = (emoji, label, value, onValueChange) => (
    <View style={styles.item}>
      <Text style={styles.itemEmoji}>{emoji}</Text>
      <Text style={styles.itemLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.border, true: COLORS.primary }}
        thumbColor={value ? '#fff' : COLORS.muted}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Paramètres</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Avatar + info */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(userName)}</Text>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{ROLE_LABELS[userRole] || userRole}</Text>
          </View>
          <Text style={styles.userPhone}>{userPhone}</Text>
        </View>

        {/* Section Compte */}
        <Text style={styles.sectionTitle}>Compte</Text>
        <View style={styles.section}>
          {renderItem('✏️', "Modifier le profil", () => handlePress("Modifier le profil"))}
          <View style={styles.separator} />
          {renderItem('🔒', "Changer mot de passe", () => handlePress("Changer mot de passe"))}
          <View style={styles.separator} />
          {renderItem('📱', "Numéro de téléphone", () => handlePress("Numéro de téléphone"))}
        </View>

        {/* Section Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.section}>
          {renderSwitch('🔔', "Notifications push", notifPush, setNotifPush)}
          <View style={styles.separator} />
          {renderSwitch('💬', "SMS", notifSMS, setNotifSMS)}
          <View style={styles.separator} />
          {renderSwitch('📧', "Email", notifEmail, setNotifEmail)}
        </View>

        {/* Section Confidentialité */}
        <Text style={styles.sectionTitle}>Confidentialité</Text>
        <View style={styles.section}>
          {renderItem('🛡️', "Données personnelles", () => handlePress("Données personnelles"))}
          <View style={styles.separator} />
          {renderItem('🗑️', "Supprimer mon compte", () => handlePress("Supprimer mon compte"), '›', COLORS.red)}
        </View>

        {/* Section À propos */}
        <Text style={styles.sectionTitle}>À propos</Text>
        <View style={styles.section}>
          {renderItem('ℹ️', "Version de l'app", () => {}, '1.0.0')}
          <View style={styles.separator} />
          {renderItem('📄', "Conditions d'utilisation", () => handlePress("Conditions d'utilisation"))}
          <View style={styles.separator} />
          {renderItem('🔐', "Politique de confidentialité", () => handlePress("Politique de confidentialité"))}
        </View>

        {/* Logout button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: COLORS.text,
    fontSize: 28,
    lineHeight: 32,
  },
  title: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#000',
    fontSize: 26,
    fontWeight: '800',
  },
  userName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  roleBadge: {
    backgroundColor: COLORS.primary + '22',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 6,
  },
  roleBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  userPhone: {
    color: COLORS.muted,
    fontSize: 13,
  },
  sectionTitle: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 16,
    marginLeft: 4,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 46,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  itemEmoji: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  itemLabel: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },
  chevron: {
    color: COLORS.muted,
    fontSize: 20,
    fontWeight: '300',
  },
  logoutBtn: {
    marginTop: 24,
    borderWidth: 1.5,
    borderColor: COLORS.red,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.red,
    fontSize: 15,
    fontWeight: '700',
  },
});
