import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F',
};

const ADDRESS_TYPES = [
  { key: 'home',  label: 'Domicile', emoji: '🏠' },
  { key: 'work',  label: 'Travail',  emoji: '🏢' },
  { key: 'other', label: 'Autre',    emoji: '📍' },
];

const MOCK_ADDRESSES = [
  { id: 'A1', type: 'home', label: 'Domicile', address: 'Rue Ibn Khaldoun, Menzah 6, Tunis', default: true },
  { id: 'A2', type: 'work', label: 'Travail',  address: 'Av. de la Liberté, Centre Ville, Tunis', default: false },
];

function AddressForm({ onSave, onCancel, initial }) {
  const [type, setType] = useState(initial?.type || 'home');
  const [label, setLabel] = useState(initial?.label || '');
  const [address, setAddress] = useState(initial?.address || '');

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>{initial ? 'Modifier l\'adresse' : 'Nouvelle adresse'}</Text>

      <View style={styles.typeRow}>
        {ADDRESS_TYPES.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.typeBtn, type === t.key && styles.typeBtnActive]}
            onPress={() => { setType(t.key); setLabel(t.label); }}
          >
            <Text style={{ fontSize: 20 }}>{t.emoji}</Text>
            <Text style={[styles.typeBtnText, type === t.key && { color: '#000' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        value={label}
        onChangeText={setLabel}
        placeholder="Nom de l'adresse (ex : Chez maman)"
        placeholderTextColor={COLORS.muted}
        maxLength={40}
      />
      <TextInput
        style={[styles.input, { marginTop: 8, minHeight: 70 }]}
        value={address}
        onChangeText={setAddress}
        placeholder="Adresse complète..."
        placeholderTextColor={COLORS.muted}
        multiline textAlignVertical="top"
      />

      <View style={styles.formBtns}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, (!label.trim() || !address.trim()) && { opacity: 0.4 }]}
          onPress={() => onSave({ type, label, address })}
          disabled={!label.trim() || !address.trim()}
        >
          <Text style={styles.saveBtnText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AddressBookScreen({ navigation }) {
  const [addresses, setAddresses] = useState(MOCK_ADDRESSES);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/user/addresses');
        if (res.data?.addresses?.length) setAddresses(res.data.addresses);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async ({ type, label, address }) => {
    try {
      if (editTarget) {
        await api.put(`/api/user/addresses/${editTarget.id}`, { type, label, address });
        setAddresses(prev => prev.map(a => a.id === editTarget.id ? { ...a, type, label, address } : a));
      } else {
        const res = await api.post('/api/user/addresses', { type, label, address }).catch(() => ({ data: { id: `A${Date.now()}` } }));
        setAddresses(prev => [...prev, { id: res.data.id, type, label, address, default: false }]);
      }
    } catch {}
    setShowForm(false);
    setEditTarget(null);
  };

  const handleDelete = (id) => {
    Alert.alert('Supprimer l\'adresse', 'Confirmer la suppression ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try { await api.delete(`/api/user/addresses/${id}`); } catch {}
          setAddresses(prev => prev.filter(a => a.id !== id));
        },
      },
    ]);
  };

  const handleSetDefault = async (id) => {
    try { await api.patch(`/api/user/addresses/${id}/default`); } catch {}
    setAddresses(prev => prev.map(a => ({ ...a, default: a.id === id })));
  };

  const typeEmoji = (type) => ADDRESS_TYPES.find(t => t.key === type)?.emoji || '📍';

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📍 Mes Adresses</Text>
        <TouchableOpacity onPress={() => { setEditTarget(null); setShowForm(true); }}>
          <Text style={{ color: COLORS.accent, fontSize: 22, fontWeight: '700' }}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {loading && <ActivityIndicator color={COLORS.accent} style={{ marginTop: 20 }} />}

        {showForm && (
          <AddressForm
            initial={editTarget}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditTarget(null); }}
          />
        )}

        {addresses.map(addr => (
          <View key={addr.id} style={[styles.addrCard, addr.default && { borderColor: COLORS.accent }]}>
            <View style={styles.addrLeft}>
              <Text style={{ fontSize: 28 }}>{typeEmoji(addr.type)}</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.addrLabel}>{addr.label}</Text>
                  {addr.default && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Par défaut</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.addrText}>{addr.address}</Text>
              </View>
            </View>
            <View style={styles.addrActions}>
              {!addr.default && (
                <TouchableOpacity onPress={() => handleSetDefault(addr.id)} style={styles.actionIcon}>
                  <Text style={{ fontSize: 16 }}>⭐</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => { setEditTarget(addr); setShowForm(true); }} style={styles.actionIcon}>
                <Text style={{ fontSize: 16 }}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(addr.id)} style={styles.actionIcon}>
                <Text style={{ fontSize: 16 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {addresses.length === 0 && !loading && !showForm && (
          <View style={styles.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📭</Text>
            <Text style={styles.emptyText}>Aucune adresse enregistrée.</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
              <Text style={styles.addBtnText}>+ Ajouter une adresse</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  scroll: { padding: 16 },
  form: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.accent, padding: 16, marginBottom: 16 },
  formTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  typeBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, gap: 4 },
  typeBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  typeBtnText: { color: COLORS.white, fontSize: 11, fontWeight: '600' },
  input: { backgroundColor: COLORS.bg, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, color: COLORS.white, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14 },
  formBtns: { flexDirection: 'row', gap: 8, marginTop: 12 },
  cancelBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border },
  cancelBtnText: { color: COLORS.muted, fontWeight: '600' },
  saveBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', backgroundColor: COLORS.accent },
  saveBtnText: { color: '#000', fontWeight: '800' },
  addrCard: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 10 },
  addrLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start' },
  addrLabel: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  addrText: { color: COLORS.muted, fontSize: 12, marginTop: 3, lineHeight: 17 },
  defaultBadge: { backgroundColor: COLORS.accent + '22', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  defaultBadgeText: { color: COLORS.accent, fontSize: 10, fontWeight: '700' },
  addrActions: { flexDirection: 'row', gap: 6, marginLeft: 8 },
  actionIcon: { padding: 4 },
  empty: { alignItems: 'center', paddingTop: 50 },
  emptyText: { color: COLORS.muted, fontSize: 14, marginBottom: 16 },
  addBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  addBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
});
