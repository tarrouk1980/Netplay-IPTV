import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert, TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C',
};

const TYPE_ICONS = { HOME: '🏠', WORK: '💼', OTHER: '📍' };
const TYPE_LABELS = { HOME: 'Domicile', WORK: 'Travail', OTHER: 'Autre' };

const MOCK = [
  { id: 'A1', type: 'HOME', label: 'Domicile', address: 'Rue de la Liberté, Menzah 6, Ariana', lat: 36.855, lng: 10.188 },
  { id: 'A2', type: 'WORK', label: 'Bureau', address: 'Avenue Mohamed V, Tunis Centre', lat: 36.819, lng: 10.166 },
];

function AddressCard({ item, onDelete, onEdit }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.iconBox}>
          <Text style={{ fontSize: 22 }}>{TYPE_ICONS[item.type] || '📍'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardLabel}>{item.label || TYPE_LABELS[item.type]}</Text>
          <Text style={styles.cardAddress} numberOfLines={2}>{item.address}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(item)}>
          <Text style={styles.actionBtnText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onDelete(item)}>
          <Text style={styles.actionBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ClientAddressesScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ type: 'HOME', label: '', address: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api.get('/api/client/addresses')
      .then(r => setAddresses(r.data.addresses || MOCK))
      .catch(() => setAddresses(MOCK));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm({ type: 'HOME', label: '', address: '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ type: item.type, label: item.label, address: item.address });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.address.trim()) { Alert.alert('Adresse requise'); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.put('/api/client/addresses/' + editing.id, form);
        setAddresses(prev => prev.map(a => a.id === editing.id ? { ...a, ...form } : a));
      } else {
        const res = await api.post('/api/client/addresses', form);
        setAddresses(prev => [...prev, res.data.address || { id: Date.now().toString(), ...form }]);
      }
      setShowModal(false);
    } catch {
      if (editing) {
        setAddresses(prev => prev.map(a => a.id === editing.id ? { ...a, ...form } : a));
      } else {
        setAddresses(prev => [...prev, { id: Date.now().toString(), ...form }]);
      }
      setShowModal(false);
    } finally { setSaving(false); }
  };

  const deleteAddress = (item) => {
    Alert.alert('Supprimer', 'Supprimer cette adresse ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: () => {
          api.delete('/api/client/addresses/' + item.id).catch(() => {});
          setAddresses(prev => prev.filter(a => a.id !== item.id));
        }
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📍 Mes adresses</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <AddressCard item={item} onDelete={deleteAddress} onEdit={openEdit} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>📍</Text>
            <Text style={{ color: COLORS.muted, marginTop: 14 }}>Aucune adresse sauvegardée</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={openAdd}>
              <Text style={styles.emptyBtnText}>Ajouter une adresse</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={showModal} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editing ? 'Modifier l\'adresse' : 'Nouvelle adresse'}</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Text style={{ color: COLORS.muted, fontSize: 22 }}>×</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>Type</Text>
              <View style={styles.typeRow}>
                {['HOME', 'WORK', 'OTHER'].map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeBtn, form.type === t && styles.typeBtnActive]}
                    onPress={() => setForm(f => ({ ...f, type: t }))}
                  >
                    <Text style={styles.typeBtnIcon}>{TYPE_ICONS[t]}</Text>
                    <Text style={[styles.typeBtnText, form.type === t && { color: COLORS.accent }]}>{TYPE_LABELS[t]}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Libellé (optionnel)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Chez maman, Salle de sport..."
                placeholderTextColor={COLORS.muted}
                value={form.label}
                onChangeText={v => setForm(f => ({ ...f, label: v }))}
              />

              <Text style={styles.fieldLabel}>Adresse</Text>
              <TextInput
                style={[styles.input, { minHeight: 70 }]}
                placeholder="Rue, quartier, ville..."
                placeholderTextColor={COLORS.muted}
                value={form.address}
                onChangeText={v => setForm(f => ({ ...f, address: v }))}
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={save}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>{saving ? 'Sauvegarde...' : '✓ Sauvegarder'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  backBtn: { padding: 4 },
  backText: { color: COLORS.accent, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  addBtn: { backgroundColor: COLORS.accent + '20', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  list: { padding: 16 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  cardLabel: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 3 },
  cardAddress: { color: COLORS.muted, fontSize: 12, lineHeight: 17 },
  cardActions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 6 },
  actionBtnText: { fontSize: 18 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyBtn: {
    backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 12,
    paddingHorizontal: 24, marginTop: 20,
  },
  emptyBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  fieldLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600', marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeBtn: {
    flex: 1, backgroundColor: COLORS.bg, borderRadius: 12, paddingVertical: 10,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  typeBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  typeBtnIcon: { fontSize: 20, marginBottom: 4 },
  typeBtnText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.bg, borderRadius: 12, padding: 14,
    color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 14,
  },
  saveBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 6,
  },
  saveBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
});
