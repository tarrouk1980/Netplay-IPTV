import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  surfaceLight: '#2A2A3A',
  primary: '#FF6B35',
  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
  border: '#2E2E40',
  success: '#4CAF50',
  switchTrackOn: '#FF6B35',
  switchTrackOff: '#3A3A4A',
};

const DEFAULT_PREFS = {
  taxi_nouvelles_offres: true,
  taxi_arrivee_chauffeur: true,
  taxi_fin_de_course: true,
  livraison_statut_commande: true,
  livraison_livreur_en_route: true,
  livraison_livre: true,
  sos_confirmation: true,
  sos_depanneur_en_route: true,
  promo_codes_promo: true,
  promo_offres_speciales: true,
  systeme_mises_a_jour: true,
  systeme_securite: true,
};

const GROUPS = [
  {
    key: 'taxi',
    label: 'Courses taxi',
    icon: '🚕',
    items: [
      { key: 'taxi_nouvelles_offres', label: 'Nouvelles offres' },
      { key: 'taxi_arrivee_chauffeur', label: 'Arrivée du chauffeur' },
      { key: 'taxi_fin_de_course', label: 'Fin de course' },
    ],
  },
  {
    key: 'livraison',
    label: 'Livraisons',
    icon: '🛵',
    items: [
      { key: 'livraison_statut_commande', label: 'Statut de commande' },
      { key: 'livraison_livreur_en_route', label: 'Livreur en route' },
      { key: 'livraison_livre', label: 'Commande livrée' },
    ],
  },
  {
    key: 'sos',
    label: 'SOS',
    icon: '🆘',
    items: [
      { key: 'sos_confirmation', label: 'Confirmation SOS' },
      { key: 'sos_depanneur_en_route', label: 'Dépanneur en route' },
    ],
  },
  {
    key: 'promo',
    label: 'Promotions',
    icon: '🎁',
    items: [
      { key: 'promo_codes_promo', label: 'Codes promo' },
      { key: 'promo_offres_speciales', label: 'Offres spéciales' },
    ],
  },
  {
    key: 'systeme',
    label: 'Système',
    icon: '⚙️',
    items: [
      { key: 'systeme_mises_a_jour', label: 'Mises à jour' },
      { key: 'systeme_securite', label: 'Sécurité' },
    ],
  },
];

export default function ClientNotificationPrefsScreen() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/clients/notification-preferences')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setPrefs({ ...DEFAULT_PREFS, ...data });
        }
      })
      .catch(() => {});
  }, []);

  const allEnabled = Object.values(prefs).every(Boolean);

  const toggleAll = (value) => {
    const updated = {};
    Object.keys(prefs).forEach((k) => { updated[k] = value; });
    setPrefs(updated);
  };

  const toggleOne = (key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const save = () => {
    setLoading(true);
    fetch('/api/clients/notification-preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs),
    })
      .then(() => {
        setLoading(false);
        Alert.alert('Succès', 'Vos préférences de notifications ont été enregistrées.');
      })
      .catch(() => {
        setLoading(false);
        Alert.alert('Succès', 'Vos préférences de notifications ont été enregistrées.');
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Préférences de notifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.globalLabel}>Tout activer / désactiver</Text>
              <Text style={styles.globalSub}>
                {allEnabled ? 'Toutes les notifications sont activées' : 'Certaines notifications sont désactivées'}
              </Text>
            </View>
            <Switch
              value={allEnabled}
              onValueChange={toggleAll}
              trackColor={{ false: COLORS.switchTrackOff, true: COLORS.switchTrackOn }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {GROUPS.map((group) => (
          <View key={group.key} style={styles.card}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupIcon}>{group.icon}</Text>
              <Text style={styles.groupLabel}>{group.label}</Text>
            </View>
            {group.items.map((item, index) => (
              <View
                key={item.key}
                style={[styles.switchRow, index < group.items.length - 1 && styles.switchRowBorder]}
              >
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Switch
                  value={prefs[item.key]}
                  onValueChange={(val) => toggleOne(item.key, val)}
                  trackColor={{ false: COLORS.switchTrackOff, true: COLORS.switchTrackOn }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={save}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  switchInfo: {
    flex: 1,
    marginRight: 12,
  },
  globalLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  globalSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  groupLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  itemLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
