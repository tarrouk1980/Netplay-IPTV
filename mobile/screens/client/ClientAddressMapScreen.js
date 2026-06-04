import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  TextInput, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C',
};

const ADDR_ICONS = ['🏠', '💼', '🏫', '🏥', '🛒', '📍'];

const MOCK_ADDRESSES = [
  { id: 'A1', label: 'Maison', icon: '🏠', address: 'Berges du Lac 2, Tunis', lat: 36.844, lng: 10.228, isDefault: true },
  { id: 'A2', label: 'Bureau', icon: '💼', address: 'Centre Urbain Nord, Tunis', lat: 36.832, lng: 10.194, isDefault: false },
];

export default function ClientAddressMapScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [form, setForm] = useState({ label: '', icon: '📍', address: '', lat: null, lng: null });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/client/addresses')
      .then(r => setAddresses(r.data.addresses || MOCK_ADDRESSES))
      .catch(() => setAddresses(MOCK_ADDRESSES))
      .finally(() => setLoading(false));
  }, []);

  const detectLocation = async () => {
    setDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setDetecting(false); return; }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      const addr = geo ? `${geo.street || ''} ${geo.city || ''}`.trim() : `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
      setForm(f => ({ ...f, address: addr, lat: pos.coords.latitude, lng: pos.coords.longitude }));
    } catch {
      Alert.alert('Erreur', 'Impossible de détecter la position.');
    } finally { setDetecting(false); }
  };

  const handleSave = async () => {
    if (!form.label.trim() || !form.address.trim()) {
      Alert.alert('Champs requis', 'Libellé et adresse sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      const r = await api.post('/api/client/addresses', form);
      setAddresses(prev => [...prev, r.data.address || { ...form, id: `A${Date.now()}`, isDefault: addresses.length === 0 }]);
      setAdding(false);
      setForm({ label: '', icon: '📍', address: '', lat: null, lng: null });
    } catch {
      setAddresses(prev => [...prev, { ...form, id: `A${Date.now()}`, isDefault: prev.length === 0 }]);
      setAdding(false);
      setForm({ label: '', icon: '📍', address: '', lat: null, lng: null });
    } finally { setSaving(false); }
  };

  const handleDelete = (addr) => {
    Alert.alert('Supprimer ?', `"${addr.label}" sera supprimée.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: () => {
          setAddresses(prev => prev.filter(a => a.id !== addr.id));
          api.delete(`/api/client/addresses/${addr.id}`).catch(() => {});
        },
      },
    ]);
  };

  const handleSetDefault = async (addr) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === addr.id })));
    api.patch(`/api/client/addresses/${addr.id}/default`).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📍 Mes adresses</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAdding(true)}>
          <Text style={styles.addBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ flex: 1 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {addresses.length === 0 && !adding && (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 40 }}>📍</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucune adresse enregistrée</Text>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setAdding(true)}>
                <Text style={styles.emptyAddBtnText}>Ajouter ma première adresse</Text>
              </TouchableOpacity>
            </View>
          )}

          {addresses.map(addr => (
            <View key={addr.id} style={[styles.addrCard, addr.isDefault && styles.addrCardDefault]}>
              <View style={styles.addrLeft}>
                <Text style={{ fontSize: 28 }}>{addr.icon}</Text>
                <View style={{ flex: 1 }}>
                  <View style={styles.addrTitleRow}>
                    <Text style={styles.addrLabel}>{addr.label}</Text>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Par défaut</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addrText} numberOfLines={2}>{addr.address}</Text>
                </View>
              </View>
              <View style={styles.addrActions}>
                {!addr.isDefault && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleSetDefault(addr)}>
                    <Text style={styles.actionBtnText}>⭐</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(addr)}>
                  <Text style={[styles.actionBtnText, { color: COLORS.red }]}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {adding && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Nouvelle adresse</Text>

              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Libellé</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={form.label}
                  onChangeText={v => setForm(f => ({ ...f, label: v }))}
                  placeholder="Ex: Maison, Bureau..."
                  placeholderTextColor={COLORS.muted}
                />
              </View>

              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Icône</Text>
                <View style={styles.iconsRow}>
                  {ADDR_ICONS.map(ic => (
                    <TouchableOpacity
                      key={ic}
                      style={[styles.iconBtn, form.icon === ic && styles.iconBtnActive]}
                      onPress={() => setForm(f => ({ ...f, icon: ic }))}
                    >
                      <Text style={{ fontSize: 20 }}>{ic}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Adresse</Text>
                <View style={styles.addressInputRow}>
                  <TextInput
                    style={[styles.fieldInput, { flex: 1 }]}
                    value={form.address}
                    onChangeText={v => setForm(f => ({ ...f, address: v }))}
                    placeholder="Saisir l'adresse..."
                    placeholderTextColor={COLORS.muted}
                  />
                  <TouchableOpacity style={styles.gpsBtn} onPress={detectLocation} disabled={detecting}>
                    {detecting ? <ActivityIndicator size="small" color={COLORS.accent} /> : <Text style={{ fontSize: 18 }}>📍</Text>}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setAdding(false)}>
                  <Text style={styles.cancelBtnText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.saveBtnText}>Enregistrer</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 60 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  addBtn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  addBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },
  addrCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  addrCardDefault: { borderColor: COLORS.accent + '60', backgroundColor: COLORS.accent + '08' },
  addrLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  addrTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addrLabel: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  defaultBadge: {
    backgroundColor: COLORS.accent + '25', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  defaultBadgeText: { color: COLORS.accent, fontSize: 10, fontWeight: '700' },
  addrText: { color: COLORS.muted, fontSize: 12, marginTop: 4, lineHeight: 16 },
  addrActions: { flexDirection: 'row', gap: 6 },
  actionBtn: { padding: 6 },
  actionBtnText: { fontSize: 16 },
  emptyAddBtn: {
    marginTop: 16, backgroundColor: COLORS.accent,
    borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12,
  },
  emptyAddBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
  formCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: COLORS.border,
  },
  formTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800', marginBottom: 14 },
  fieldRow: { marginBottom: 12 },
  fieldLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', marginBottom: 5, letterSpacing: 0.8 },
  fieldInput: {
    backgroundColor: COLORS.bg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  iconsRow: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
  },
  iconBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '20' },
  addressInputRow: { flexDirection: 'row', gap: 8 },
  gpsBtn: {
    width: 46, height: 46, borderRadius: 12, backgroundColor: COLORS.accent + '20',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.accent + '50',
  },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 13, alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },
  saveBtn: { flex: 2, borderRadius: 12, backgroundColor: COLORS.accent, paddingVertical: 13, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
});
