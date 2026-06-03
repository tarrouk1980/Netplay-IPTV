import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60',
};

const GROUPS = [
  {
    title: '🚕 Courses & Livraisons',
    items: [
      { key: 'ride_accepted', label: 'Course acceptée par un chauffeur' },
      { key: 'ride_arriving', label: 'Chauffeur en approche' },
      { key: 'ride_started', label: 'Course démarrée' },
      { key: 'ride_completed', label: 'Course terminée' },
      { key: 'delivery_update', label: 'Mises à jour livraison' },
    ],
  },
  {
    title: '💰 Paiements & Portefeuille',
    items: [
      { key: 'payment_received', label: 'Paiement confirmé' },
      { key: 'wallet_credit', label: 'Crédit portefeuille' },
      { key: 'invoice_ready', label: 'Facture disponible' },
    ],
  },
  {
    title: '🎁 Offres & Promotions',
    items: [
      { key: 'flash_deals', label: 'Offres flash du jour' },
      { key: 'promo_codes', label: 'Nouveaux codes promo' },
      { key: 'referral_reward', label: 'Récompense parrainage' },
    ],
  },
  {
    title: '👤 Compte & Sécurité',
    items: [
      { key: 'login_alert', label: 'Nouvelle connexion détectée' },
      { key: 'kyc_update', label: 'Statut vérification identité' },
      { key: 'account_changes', label: 'Modifications du profil' },
    ],
  },
  {
    title: '📢 Général',
    items: [
      { key: 'news', label: 'Actualités EASYWAY' },
      { key: 'app_updates', label: 'Mises à jour de l\'application' },
      { key: 'surveys', label: 'Sondages & feedback' },
    ],
  },
];

const ALL_KEYS = GROUPS.flatMap((g) => g.items.map((i) => i.key));

export default function NotificationsSettingsScreen({ navigation }) {
  const [prefs, setPrefs] = useState(() => Object.fromEntries(ALL_KEYS.map((k) => [k, true])));
  const [saved, setSaved] = useState(false);

  const toggle = (key) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      await api.put('/api/user/notification-prefs', prefs);
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const enableAll = () => {
    setPrefs(Object.fromEntries(ALL_KEYS.map((k) => [k, true])));
    setSaved(false);
  };
  const disableAll = () => {
    setPrefs(Object.fromEntries(ALL_KEYS.map((k) => [k, false])));
    setSaved(false);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔔 Notifications</Text>
        <TouchableOpacity style={[styles.saveBtn, saved && styles.saveBtnGreen]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{saved ? '✓ Sauvé' : 'Sauver'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickBtn} onPress={enableAll}>
            <Text style={styles.quickBtnText}>✅ Tout activer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickBtn, { borderColor: COLORS.muted }]} onPress={disableAll}>
            <Text style={[styles.quickBtnText, { color: COLORS.muted }]}>🔕 Tout désactiver</Text>
          </TouchableOpacity>
        </View>

        {GROUPS.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            {group.items.map((item, idx) => (
              <View
                key={item.key}
                style={[
                  styles.row,
                  idx === group.items.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Switch
                  value={prefs[item.key]}
                  onValueChange={() => toggle(item.key)}
                  trackColor={{ false: COLORS.border, true: COLORS.accent }}
                  thumbColor={prefs[item.key] ? COLORS.white : COLORS.muted}
                />
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.note}>
          💡 Les notifications critiques (sécurité du compte, alertes SOS) ne peuvent pas être désactivées.
        </Text>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  saveBtn: {
    backgroundColor: COLORS.accent, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  saveBtnGreen: { backgroundColor: COLORS.green },
  saveBtnText: { color: '#000', fontWeight: '800', fontSize: 13 },
  scroll: { padding: 16 },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.accent, alignItems: 'center',
  },
  quickBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  group: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 14, overflow: 'hidden',
  },
  groupTitle: {
    color: COLORS.muted, fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  rowLabel: { flex: 1, color: COLORS.white, fontSize: 14, marginRight: 12 },
  note: { color: COLORS.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
