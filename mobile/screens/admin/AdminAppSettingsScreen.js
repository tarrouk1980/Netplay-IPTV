import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const DEFAULT_SETTINGS = {
  taxiBaseFare: '1.500',
  taxiPerKm: '0.800',
  sosCalloutFee: '25.000',
  deliveryBaseFee: '2.000',
  deliveryPerKm: '0.500',
  commissionRate: '0',
  maxOrderRadius: '15',
  driverIdleTimeout: '5',
  maintenanceMode: false,
  newRegistrations: true,
  sosEnabled: true,
  deliveryEnabled: true,
  groceryEnabled: true,
  appVersion: '1.0.0',
  minAppVersion: '1.0.0',
};

export default function AdminAppSettingsScreen({ navigation }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('TARIFS');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/admin/settings');
        if (res.data) setSettings(s => ({ ...s, ...res.data }));
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.put('/api/admin/settings', settings);
      Alert.alert('✅ Sauvegardé', 'Les paramètres ont été mis à jour.');
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder.');
    } finally { setSaving(false); }
  };

  const update = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  const sections = ['TARIFS', 'SERVICES', 'LIMITES', 'SYSTÈME'];

  const NumberField = ({ label, settingKey, suffix = 'TND' }) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldInput}>
        <TextInput
          style={styles.numberInput}
          value={String(settings[settingKey])}
          onChangeText={v => update(settingKey, v)}
          keyboardType="decimal-pad"
        />
        <Text style={styles.fieldSuffix}>{suffix}</Text>
      </View>
    </View>
  );

  const ToggleField = ({ label, settingKey, subtitle }) => (
    <View style={styles.toggleField}>
      <View style={{ flex: 1 }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {subtitle && <Text style={styles.fieldSub}>{subtitle}</Text>}
      </View>
      <Switch
        value={!!settings[settingKey]}
        onValueChange={v => update(settingKey, v)}
        thumbColor={settings[settingKey] ? COLORS.accent : COLORS.muted}
        trackColor={{ false: COLORS.border, true: COLORS.accent + '66' }}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres app</Text>
        <TouchableOpacity onPress={saveSettings} disabled={saving}>
          {saving ? <ActivityIndicator color={COLORS.accent} size="small" /> : <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '700' }}>Sauvegarder</Text>}
        </TouchableOpacity>
      </View>

      {settings.maintenanceMode && (
        <View style={styles.maintenanceBanner}>
          <Text style={styles.maintenanceText}>⚠️ MODE MAINTENANCE ACTIF — L'app est inaccessible aux utilisateurs</Text>
        </View>
      )}

      <View style={styles.sectionTabs}>
        {sections.map(s => (
          <TouchableOpacity key={s} style={[styles.sectionTab, activeSection === s && styles.sectionTabActive]} onPress={() => setActiveSection(s)}>
            <Text style={[styles.sectionTabText, activeSection === s && { color: '#000' }]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} /> : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>

          {activeSection === 'TARIFS' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🚕 Taxi</Text>
              <NumberField label="Prise en charge de base" settingKey="taxiBaseFare" />
              <NumberField label="Prix par km" settingKey="taxiPerKm" suffix="TND/km" />
              <View style={styles.divider} />
              <Text style={styles.cardTitle}>🔧 SOS Dépannage</Text>
              <NumberField label="Frais de déplacement" settingKey="sosCalloutFee" />
              <View style={styles.divider} />
              <Text style={styles.cardTitle}>🛵 Livraison</Text>
              <NumberField label="Frais de livraison base" settingKey="deliveryBaseFee" />
              <NumberField label="Supplément par km" settingKey="deliveryPerKm" suffix="TND/km" />
              <View style={styles.divider} />
              <Text style={styles.cardTitle}>💰 Commission</Text>
              <NumberField label="Taux de commission" settingKey="commissionRate" suffix="%" />
              <View style={styles.zeroCommNote}>
                <Text style={{ color: COLORS.green, fontSize: 11 }}>✅ Modèle 0% commission — différenciateur EASYWAY</Text>
              </View>
            </View>
          )}

          {activeSection === 'SERVICES' && (
            <View style={styles.card}>
              <ToggleField label="🚕 Service Taxi" settingKey="sosEnabled" subtitle="Activer/désactiver EasyTaxy" />
              <View style={styles.divider} />
              <ToggleField label="🔧 Service SOS" settingKey="sosEnabled" subtitle="Activer/désactiver SOS Dépannage" />
              <View style={styles.divider} />
              <ToggleField label="🛵 Livraison" settingKey="deliveryEnabled" subtitle="Activer/désactiver la livraison" />
              <View style={styles.divider} />
              <ToggleField label="🛒 Épicerie" settingKey="groceryEnabled" subtitle="Activer/désactiver EasyGrocery" />
              <View style={styles.divider} />
              <ToggleField label="📝 Nouvelles inscriptions" settingKey="newRegistrations" subtitle="Autoriser les nouveaux comptes" />
            </View>
          )}

          {activeSection === 'LIMITES' && (
            <View style={styles.card}>
              <NumberField label="Rayon max commande (km)" settingKey="maxOrderRadius" suffix="km" />
              <NumberField label="Timeout chauffeur inactif" settingKey="driverIdleTimeout" suffix="min" />
            </View>
          )}

          {activeSection === 'SYSTÈME' && (
            <View style={styles.card}>
              <ToggleField label="🔧 Mode maintenance" settingKey="maintenanceMode" subtitle="L'app sera inaccessible pendant la maintenance" />
              <View style={styles.divider} />
              <NumberField label="Version actuelle" settingKey="appVersion" suffix="" />
              <NumberField label="Version minimale requise" settingKey="minAppVersion" suffix="" />
              <View style={styles.divider} />
              <TouchableOpacity style={styles.dangerBtn} onPress={() => Alert.alert('Confirmation requise', 'Cette action effacera le cache Redis. Continuer ?', [{ text: 'Annuler', style: 'cancel' }, { text: 'Vider le cache', style: 'destructive', onPress: async () => { try { await api.post('/api/admin/cache/flush'); Alert.alert('Cache vidé'); } catch {} } }])}>
                <Text style={styles.dangerBtnText}>🗑 Vider le cache Redis</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  maintenanceBanner: { backgroundColor: COLORS.red + '22', borderBottomWidth: 1, borderBottomColor: COLORS.red, padding: 10, alignItems: 'center' },
  maintenanceText: { color: COLORS.red, fontSize: 11, fontWeight: '700' },
  sectionTabs: { flexDirection: 'row', padding: 12, gap: 6 },
  sectionTab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  sectionTabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  sectionTabText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginBottom: 14, marginTop: 4 },
  field: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  fieldLabel: { color: COLORS.muted, fontSize: 13, flex: 1 },
  fieldInput: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  numberInput: { backgroundColor: COLORS.surfaceAlt, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 8, color: COLORS.white, fontSize: 14, fontWeight: '700', minWidth: 80, textAlign: 'right' },
  fieldSuffix: { color: COLORS.muted, fontSize: 11, width: 45 },
  fieldSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  toggleField: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  zeroCommNote: { backgroundColor: COLORS.green + '11', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: COLORS.green + '44' },
  dangerBtn: { backgroundColor: COLORS.red + '11', borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.red + '55' },
  dangerBtnText: { color: COLORS.red, fontSize: 13, fontWeight: '700' },
});
