import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const MOCK_ADDRESSES = [
  { id: 'A1', label: 'Domicile', icon: '🏠', address: '12 Rue Ibn Khaldoun, Lac 1, Tunis', isDefault: true },
  { id: 'A2', label: 'Travail', icon: '🏢', address: 'Immeuble Étoile, Avenue Jugurtha, Les Berges du Lac', isDefault: false },
  { id: 'A3', label: 'Famille', icon: '👨‍👩‍👧', address: '8 Rue de la Liberté, La Marsa', isDefault: false },
];

export default function ClientAddressBookScreen({ navigation }) {
  const [addresses, setAddresses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/client/addresses')
      .then(r => setAddresses(r.data || MOCK_ADDRESSES))
      .catch(() => setAddresses(MOCK_ADDRESSES))
      .finally(() => setLoading(false));
  }, []);

  const handleSetDefault = (id) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    api.patch(`/api/client/addresses/${id}/default`).catch(() => {});
  };

  const handleDelete = (id) => {
    Alert.alert('Supprimer', 'Supprimer cette adresse ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: () => {
          setAddresses(prev => prev.filter(a => a.id !== id));
          api.delete(`/api/client/addresses/${id}`).catch(() => {});
        },
      },
    ]);
  };

  const handleAdd = async () => {
    if (!newLabel.trim() || !newAddress.trim()) {
      Alert.alert('Champs requis', 'Remplissez le nom et l\'adresse.');
      return;
    }
    setSaving(true);
    const newAddr = { id: `A${Date.now()}`, label: newLabel, icon: '📍', address: newAddress, isDefault: false };
    try { await api.post('/api/client/addresses', newAddr); } catch {}
    setAddresses(prev => [...(prev || []), newAddr]);
    setAdding(false);
    setNewLabel('');
    setNewAddress('');
    setSaving(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📍 Mes adresses</Text>
        <TouchableOpacity onPress={() => setAdding(!adding)}>
          <Text style={styles.addBtn}>{adding ? '✕' : '+ Ajouter'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {adding && (
          <View style={styles.addForm}>
            <Text style={styles.fieldLabel}>NOM DE L'ADRESSE</Text>
            <TextInput
              style={styles.fieldInput}
              value={newLabel}
              onChangeText={setNewLabel}
              placeholder="Ex: Domicile, Travail..."
              placeholderTextColor={COLORS.muted}
            />
            <Text style={styles.fieldLabel}>ADRESSE COMPLÈTE</Text>
            <TextInput
              style={styles.fieldInput}
              value={newAddress}
              onChangeText={setNewAddress}
              placeholder="Rue, quartier, ville..."
              placeholderTextColor={COLORS.muted}
            />
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.5 }]}
              onPress={handleAdd}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.saveBtnText}>Enregistrer l'adresse</Text>}
            </TouchableOpacity>
          </View>
        )}

        {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : (
          <>
            {(addresses || []).map(addr => (
              <View key={addr.id} style={[styles.addressCard, addr.isDefault && { borderColor: COLORS.accent + '60' }]}>
                <View style={styles.addressLeft}>
                  <View style={styles.addrIcon}><Text style={{ fontSize: 22 }}>{addr.icon}</Text></View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.addrLabelRow}>
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
                    <TouchableOpacity style={styles.addrActionBtn} onPress={() => handleSetDefault(addr.id)}>
                      <Text style={styles.addrActionText}>✓ Défaut</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.addrActionBtn, { borderColor: COLORS.red + '40' }]} onPress={() => handleDelete(addr.id)}>
                    <Text style={[styles.addrActionText, { color: COLORS.red }]}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {(addresses || []).length === 0 && (
              <View style={styles.empty}>
                <Text style={{ fontSize: 40 }}>📍</Text>
                <Text style={styles.emptyText}>Aucune adresse enregistrée</Text>
                <Text style={styles.emptySub}>Ajoutez vos adresses fréquentes pour commander plus vite</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  addBtn: { color: COLORS.accent, fontSize: 14, fontWeight: '800' },
  addForm: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.accent + '40' },
  fieldLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  fieldInput: { backgroundColor: COLORS.bg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 14 },
  saveBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 14, fontWeight: '900' },
  addressCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  addressLeft: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  addrIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  addrLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  addrLabel: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  defaultBadge: { backgroundColor: COLORS.accent + '20', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: COLORS.accent + '50' },
  defaultBadgeText: { color: COLORS.accent, fontSize: 9, fontWeight: '700' },
  addrText: { color: COLORS.muted, fontSize: 12, lineHeight: 17 },
  addrActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  addrActionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
  addrActionText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 50 },
  emptyText: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  emptySub: { color: COLORS.muted, fontSize: 12, textAlign: 'center' },
});
