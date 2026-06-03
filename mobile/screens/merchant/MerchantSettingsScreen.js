import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', accentDark: '#C47D0E',
  white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', purple: '#9B59B6',
};

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const SERVICES = [
  { id: 'taxi', icon: '🚕', label: 'Taxi' },
  { id: 'delivery', icon: '🛵', label: 'Livraison' },
  { id: 'grocery', icon: '🛒', label: 'Épicerie' },
  { id: 'sos', icon: '🔧', label: 'SOS' },
];

const MOCK_STORE = {
  name: 'Carrefour Market',
  category: 'Épicerie',
  address: 'Av. Mohamed V, Tunis',
  phone: '+216 71 234 567',
  description: 'Supermarché de proximité ouvert 7j/7.',
  minOrder: 15,
  deliveryFee: 1.50,
  freeDeliveryThreshold: 30,
  active: true,
  acceptsPreorders: true,
  schedule: {
    Lun: { open: '08:00', close: '21:00', enabled: true },
    Mar: { open: '08:00', close: '21:00', enabled: true },
    Mer: { open: '08:00', close: '21:00', enabled: true },
    Jeu: { open: '08:00', close: '21:00', enabled: true },
    Ven: { open: '08:00', close: '21:00', enabled: true },
    Sam: { open: '09:00', close: '20:00', enabled: true },
    Dim: { open: '10:00', close: '18:00', enabled: false },
  },
};

export default function MerchantSettingsScreen({ navigation }) {
  const [store, setStore] = useState(MOCK_STORE);
  const [saved, setSaved] = useState(false);

  const update = (key, value) => setStore(p => ({ ...p, [key]: value }));

  const updateSchedule = (day, field, value) =>
    setStore(p => ({
      ...p,
      schedule: { ...p.schedule, [day]: { ...p.schedule[day], [field]: value } },
    }));

  const handleSave = async () => {
    try {
      // await api.put('/merchant/settings', store);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      Alert.alert('Erreur', 'La sauvegarde a échoué.');
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres boutique</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveBtn, saved && { color: COLORS.green }]}>
            {saved ? '✓ Sauvé' : 'Sauver'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Store Status */}
        <View style={styles.statusCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>Boutique en ligne</Text>
            <Text style={styles.statusSub}>
              {store.active ? '● Visible et accessible aux clients' : '○ Boutique masquée'}
            </Text>
          </View>
          <Switch
            value={store.active}
            onValueChange={(v) => update('active', v)}
            trackColor={{ false: COLORS.border, true: COLORS.green }}
            thumbColor={COLORS.white}
          />
        </View>

        {/* General Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏪 Informations générales</Text>
          <Text style={styles.fieldLabel}>Nom de la boutique</Text>
          <TextInput
            style={styles.input}
            value={store.name}
            onChangeText={(v) => update('name', v)}
            placeholderTextColor={COLORS.muted}
          />
          <Text style={styles.fieldLabel}>Adresse</Text>
          <TextInput
            style={styles.input}
            value={store.address}
            onChangeText={(v) => update('address', v)}
            placeholderTextColor={COLORS.muted}
          />
          <Text style={styles.fieldLabel}>Téléphone</Text>
          <TextInput
            style={styles.input}
            value={store.phone}
            onChangeText={(v) => update('phone', v)}
            keyboardType="phone-pad"
            placeholderTextColor={COLORS.muted}
          />
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.input, { minHeight: 80 }]}
            value={store.description}
            onChangeText={(v) => update('description', v)}
            multiline
            textAlignVertical="top"
            placeholderTextColor={COLORS.muted}
          />
        </View>

        {/* Delivery Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛵 Paramètres livraison</Text>
          <View style={styles.rowFields}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Commande min (TND)</Text>
              <TextInput
                style={styles.input}
                value={String(store.minOrder)}
                onChangeText={(v) => update('minOrder', parseFloat(v) || 0)}
                keyboardType="decimal-pad"
                placeholderTextColor={COLORS.muted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Frais livraison (TND)</Text>
              <TextInput
                style={styles.input}
                value={String(store.deliveryFee)}
                onChangeText={(v) => update('deliveryFee', parseFloat(v) || 0)}
                keyboardType="decimal-pad"
                placeholderTextColor={COLORS.muted}
              />
            </View>
          </View>
          <Text style={styles.fieldLabel}>Livraison gratuite dès (TND)</Text>
          <TextInput
            style={styles.input}
            value={String(store.freeDeliveryThreshold)}
            onChangeText={(v) => update('freeDeliveryThreshold', parseFloat(v) || 0)}
            keyboardType="decimal-pad"
            placeholderTextColor={COLORS.muted}
          />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>🕐 Accepter les précommandes</Text>
            <Switch
              value={store.acceptsPreorders}
              onValueChange={(v) => update('acceptsPreorders', v)}
              trackColor={{ false: COLORS.border, true: COLORS.accent }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗓 Horaires d'ouverture</Text>
          {DAYS.map((day) => {
            const s = store.schedule[day];
            return (
              <View key={day} style={styles.scheduleRow}>
                <Switch
                  value={s.enabled}
                  onValueChange={(v) => updateSchedule(day, 'enabled', v)}
                  trackColor={{ false: COLORS.border, true: COLORS.green }}
                  thumbColor={COLORS.white}
                  style={{ transform: [{ scale: 0.8 }] }}
                />
                <Text style={[styles.dayLabel, !s.enabled && { color: COLORS.border }]}>{day}</Text>
                {s.enabled ? (
                  <View style={styles.timeFields}>
                    <TextInput
                      style={styles.timeInput}
                      value={s.open}
                      onChangeText={(v) => updateSchedule(day, 'open', v)}
                      placeholderTextColor={COLORS.muted}
                    />
                    <Text style={styles.timeSep}>–</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={s.close}
                      onChangeText={(v) => updateSchedule(day, 'close', v)}
                      placeholderTextColor={COLORS.muted}
                    />
                  </View>
                ) : (
                  <Text style={styles.closedLabel}>Fermé</Text>
                )}
              </View>
            );
          })}
        </View>

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
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  saveBtn: { color: COLORS.accent, fontSize: 15, fontWeight: '700' },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    margin: 16, backgroundColor: '#0A1A0A', borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.green,
  },
  statusTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  statusSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  fieldLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, fontSize: 14, paddingHorizontal: 14, paddingVertical: 11,
  },
  rowFields: { flexDirection: 'row', gap: 10 },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  switchLabel: { color: COLORS.white, fontSize: 14 },
  scheduleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 8, backgroundColor: COLORS.surface, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  dayLabel: { color: COLORS.white, fontSize: 13, fontWeight: '700', width: 34 },
  timeFields: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeInput: {
    flex: 1, backgroundColor: COLORS.surfaceAlt, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, fontSize: 13, textAlign: 'center', paddingVertical: 6,
  },
  timeSep: { color: COLORS.muted, fontSize: 14 },
  closedLabel: { flex: 1, color: COLORS.border, fontSize: 13, textAlign: 'center' },
});
