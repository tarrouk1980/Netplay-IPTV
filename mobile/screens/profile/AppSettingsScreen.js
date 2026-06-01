import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  accent: '#D32F2F',
  green: '#27AE60',
  orange: '#F57C00',
};

const APP_VERSION = '1.0.0';

function SettingRow({ icon, label, value, onPress, toggle, toggleValue, onToggle, sublabel, danger }) {
  return (
    <TouchableOpacity
      style={r.row}
      onPress={onPress}
      disabled={toggle || !onPress}
      activeOpacity={toggle ? 1 : 0.7}
    >
      <Text style={r.icon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[r.label, danger && { color: COLORS.accent }]}>{label}</Text>
        {sublabel ? <Text style={r.sublabel}>{sublabel}</Text> : null}
      </View>
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.border, true: COLORS.green }}
          thumbColor="#FFF"
        />
      ) : value ? (
        <Text style={r.value}>{value}</Text>
      ) : onPress ? (
        <Text style={r.chevron}>›</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const r = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 14 },
  icon: { fontSize: 20, width: 28, textAlign: 'center' },
  label: { color: COLORS.text, fontSize: 15, fontWeight: '500' },
  sublabel: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  value: { color: COLORS.muted, fontSize: 14 },
  chevron: { color: COLORS.muted, fontSize: 20 },
});

function Section({ title, children }) {
  return (
    <View style={s.section}>
      {title ? <Text style={s.sectionTitle}>{title}</Text> : null}
      <View style={s.sectionCard}>{children}</View>
    </View>
  );
}

export default function AppSettingsScreen({ navigation }) {
  const { user, logout } = useAuthStore();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnecter',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['authToken', 'user']);
          logout?.();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer définitivement',
          style: 'destructive',
          onPress: () => Alert.alert('Demande envoyée', 'Votre demande de suppression a été transmise.'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>⚙️ Paramètres</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Account */}
        <Section title="Compte">
          <SettingRow icon="👤" label={user?.name || 'Mon profil'} sublabel={user?.phone} onPress={() => navigation.navigate('Profile')} />
          <View style={s.divider} />
          <SettingRow icon="📖" label="Carnet d'adresses" onPress={() => navigation.navigate('AddressBook')} />
          <View style={s.divider} />
          <SettingRow icon="❤️" label="Prestataires favoris" onPress={() => navigation.navigate('ClientFavoriteProviders')} />
          <View style={s.divider} />
          <SettingRow icon="🎯" label="Programme fidélité" onPress={() => navigation.navigate('EasyPointsDashboard')} />
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <SettingRow icon="🔔" label="Notifications push" toggle toggleValue={pushEnabled} onToggle={setPushEnabled} />
          <View style={s.divider} />
          <SettingRow icon="📧" label="Notifications email" toggle toggleValue={emailEnabled} onToggle={setEmailEnabled} />
          <View style={s.divider} />
          <SettingRow icon="🔊" label="Sons" toggle toggleValue={soundEnabled} onToggle={setSoundEnabled} />
          <View style={s.divider} />
          <SettingRow icon="📬" label="Centre de notifications" onPress={() => navigation.navigate('NotificationCenter')} />
        </Section>

        {/* Appearance */}
        <Section title="Apparence">
          <SettingRow icon="🌙" label="Mode sombre" toggle toggleValue={darkMode} onToggle={setDarkMode} />
          <View style={s.divider} />
          <SettingRow icon="🌍" label="Langue" value="Français" onPress={() => navigation.navigate('Language')} />
        </Section>

        {/* Privacy & Security */}
        <Section title="Confidentialité">
          <SettingRow icon="📍" label="Partage de position" toggle toggleValue={locationEnabled} onToggle={setLocationEnabled} sublabel="Requis pour les services de livraison" />
          <View style={s.divider} />
          <SettingRow icon="🔒" label="Changer le mot de passe" onPress={() => navigation.navigate('ForgotPassword')} />
          <View style={s.divider} />
          <SettingRow icon="📋" label="Politique de confidentialité" onPress={() => Linking.openURL('https://easyway.tn/privacy')} />
          <View style={s.divider} />
          <SettingRow icon="📄" label="Conditions d'utilisation" onPress={() => navigation.navigate('CGU')} />
        </Section>

        {/* Support */}
        <Section title="Support">
          <SettingRow icon="💬" label="Chat avec le support" onPress={() => navigation.navigate('LiveChat')} />
          <View style={s.divider} />
          <SettingRow icon="⭐" label="Évaluer l'app" onPress={() => Linking.openURL('market://details?id=tn.easyway.app')} />
          <View style={s.divider} />
          <SettingRow icon="📣" label="Inviter un ami" onPress={() => navigation.navigate('Referral')} />
        </Section>

        {/* About */}
        <Section title="À propos">
          <SettingRow icon="ℹ️" label="Version" value={APP_VERSION} />
          <View style={s.divider} />
          <SettingRow icon="🏢" label="EASYWAY Tunisia" sublabel="© 2025 Tous droits réservés" />
        </Section>

        {/* Danger zone */}
        <Section title="">
          <SettingRow
            icon="🚪"
            label="Déconnexion"
            onPress={handleLogout}
          />
          <View style={s.divider} />
          <SettingRow
            icon="🗑"
            label="Supprimer le compte"
            onPress={handleDeleteAccount}
            danger
          />
        </Section>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  section: { marginHorizontal: 16, marginTop: 20 },
  sectionTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, paddingLeft: 4 },
  sectionCard: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: COLORS.border, marginLeft: 58 },
});
