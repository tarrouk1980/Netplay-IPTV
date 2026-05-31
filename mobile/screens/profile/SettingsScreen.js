import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  accent: '#D32F2F',
  white: '#FFFFFF',
  muted: '#8A8A9A',
  border: '#2A2A3A',
  green: '#2E7D32',
};

const STORAGE_KEY = '@easyway_settings';

const DEFAULT_SETTINGS = {
  pushNotifications: true,
  smsNotifications: false,
  emailNotifications: false,
  shareLocation: true,
  rideHistory: true,
  language: 'fr',
  darkMode: true,
};

const LANGUAGES = [
  { key: 'fr', label: 'Français', flag: '🇫🇷' },
  { key: 'ar', label: 'العربية', flag: '🇹🇳' },
  { key: 'en', label: 'English', flag: '🇬🇧' },
];

function SectionHeader({ title }) {
  return (
    <View style={sec.container}>
      <Text style={sec.title}>{title}</Text>
    </View>
  );
}

const sec = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 8,
  },
  title: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});

function SettingRow({ label, sublabel, value, onValueChange, disabled, note }) {
  return (
    <View style={row.container}>
      <View style={row.left}>
        <Text style={row.label}>{label}</Text>
        {sublabel ? <Text style={row.sublabel}>{sublabel}</Text> : null}
        {note ? <Text style={row.note}>{note}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: COLORS.border, true: COLORS.accent + '99' }}
        thumbColor={value ? COLORS.accent : COLORS.muted}
        ios_backgroundColor={COLORS.border}
      />
    </View>
  );
}

const row = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  left: { flex: 1 },
  label: { color: COLORS.white, fontSize: 14, fontWeight: '500' },
  sublabel: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  note: { color: COLORS.muted, fontSize: 11, marginTop: 4, fontStyle: 'italic' },
});

function LinkRow({ label, onPress, danger, sublabel }) {
  return (
    <TouchableOpacity style={lRow.container} onPress={onPress} activeOpacity={0.7}>
      <View style={lRow.left}>
        <Text style={[lRow.label, danger && lRow.danger]}>{label}</Text>
        {sublabel ? <Text style={lRow.sublabel}>{sublabel}</Text> : null}
      </View>
      <Text style={lRow.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const lRow = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  left: { flex: 1 },
  label: { color: COLORS.white, fontSize: 14, fontWeight: '500' },
  danger: { color: COLORS.accent },
  sublabel: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  arrow: { color: COLORS.muted, fontSize: 20 },
});

export default function SettingsScreen({ navigation }) {
  const { logout } = useAuthStore();
  const { mode: themeMode, setMode: setThemeMode } = useThemeStore();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load settings: try API first, fallback to AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/users/me/settings');
        const merged = { ...DEFAULT_SETTINGS, ...res.data };
        setSettings(merged);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {
        try {
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          if (stored) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
        } catch {}
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateSetting = useCallback(async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    // Persist locally immediately
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
    // Sync to server in background
    setSaving(true);
    try {
      await api.patch('/api/users/me/settings', updated);
    } catch {
      // silently ignore — local state is already updated
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const handleLanguage = (lang) => {
    Alert.alert(
      'Changer la langue',
      `Passer à ${LANGUAGES.find((l) => l.key === lang)?.label} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => updateSetting('language', lang) },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront supprimées définitivement.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Confirmation finale',
              'Êtes-vous absolument sûr ? Cette action ne peut pas être annulée.',
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Supprimer définitivement',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await api.delete('/api/users/me');
                      logout();
                    } catch (err) {
                      Alert.alert('Erreur', err.response?.data?.error || 'Suppression échouée');
                    }
                  },
                },
              ]
            ),
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  const currentLang = LANGUAGES.find((l) => l.key === settings.language) || LANGUAGES[0];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={{ width: 40 }}>
          {saving && <ActivityIndicator size="small" color={COLORS.muted} />}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <View style={styles.group}>
          <SettingRow
            label="Notifications push"
            sublabel="Alertes en temps réel dans l'app"
            value={settings.pushNotifications}
            onValueChange={(v) => updateSetting('pushNotifications', v)}
          />
          <SettingRow
            label="Notifications SMS"
            sublabel="Confirmation de commandes par SMS"
            value={settings.smsNotifications}
            onValueChange={(v) => updateSetting('smsNotifications', v)}
          />
          <SettingRow
            label="Notifications email"
            sublabel="Récapitulatifs et reçus par email"
            value={settings.emailNotifications}
            onValueChange={(v) => updateSetting('emailNotifications', v)}
          />
        </View>

        {/* Confidentialité */}
        <SectionHeader title="Confidentialité" />
        <View style={styles.group}>
          <SettingRow
            label="Partage de position"
            sublabel="Permet aux prestataires de vous localiser"
            value={settings.shareLocation}
            onValueChange={(v) => updateSetting('shareLocation', v)}
          />
          <SettingRow
            label="Historique de courses"
            sublabel="Conserver l'historique de vos trajets"
            value={settings.rideHistory}
            onValueChange={(v) => updateSetting('rideHistory', v)}
          />
        </View>

        {/* Langue */}
        <SectionHeader title="Langue" />
        <View style={styles.group}>
          {LANGUAGES.map((lang, i) => (
            <TouchableOpacity
              key={lang.key}
              style={[
                lRow.container,
                i === LANGUAGES.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={() => handleLanguage(lang.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.langFlag}>{lang.flag}</Text>
              <Text style={[lRow.label, { flex: 1 }]}>{lang.label}</Text>
              {settings.language === lang.key && (
                <Text style={styles.langCheck}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[lRow.container, { borderTopWidth: 1, borderTopColor: COLORS.border, borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate('Language')}
            activeOpacity={0.7}
          >
            <Text style={[lRow.label, { flex: 1, color: COLORS.accent }]}>🌐 Paramètres langue avancés</Text>
            <Text style={{ color: COLORS.muted, fontSize: 16 }}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Apparence */}
        <SectionHeader title="Apparence" />
        <View style={styles.group}>
          {[
            { key: 'dark', label: '🌙 Mode sombre', sublabel: 'Toujours sombre' },
            { key: 'light', label: '☀️ Mode clair', sublabel: 'Toujours clair' },
            { key: 'auto', label: '🌓 Automatique', sublabel: 'Sombre 20h–7h, clair sinon' },
          ].map((opt, idx, arr) => (
            <TouchableOpacity
              key={opt.key}
              style={[lRow.container, idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: COLORS.border }]}
              onPress={() => setThemeMode(opt.key)}
              activeOpacity={0.7}
            >
              <View style={lRow.left}>
                <Text style={lRow.label}>{opt.label}</Text>
                <Text style={lRow.sublabel}>{opt.sublabel}</Text>
              </View>
              {themeMode === opt.key && (
                <Text style={{ color: COLORS.accent, fontSize: 18, fontWeight: '700' }}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Compte */}
        <SectionHeader title="Compte" />
        <View style={styles.group}>
          <LinkRow
            label="Changer le mot de passe"
            sublabel="Réinitialiser via SMS"
            onPress={() => navigation.navigate('ForgotPassword')}
          />
          <LinkRow
            label="Supprimer mon compte"
            sublabel="Action irréversible"
            danger
            onPress={handleDeleteAccount}
          />
        </View>

        {/* À propos */}
        <SectionHeader title="À propos" />
        <View style={styles.group}>
          <View style={[lRow.container, { borderBottomWidth: 1, borderBottomColor: COLORS.border }]}>
            <View style={lRow.left}>
              <Text style={lRow.label}>Version de l'application</Text>
              <Text style={lRow.sublabel}>EASYWAY v1.0.0</Text>
            </View>
          </View>
          <LinkRow
            label="Conditions d'utilisation"
            onPress={() => navigation.navigate('CGU')}
          />
          <LinkRow
            label="Politique de confidentialité"
            sublabel="Comment nous utilisons vos données"
            onPress={() => Alert.alert('Politique de confidentialité', 'Disponible sur notre site web: easyway.tn/privacy')}
          />
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  loader: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, width: 40 },
  backTxt: { color: COLORS.white, fontSize: 22 },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  group: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  langFlag: { fontSize: 20, marginRight: 12 },
  langCheck: { color: COLORS.accent, fontSize: 18, fontWeight: '700' },
});
