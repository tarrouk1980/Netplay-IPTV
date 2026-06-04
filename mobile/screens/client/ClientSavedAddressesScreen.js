import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C',
};

const ICONS = ['🏠', '💼', '❤️', '⭐', '📍', '🏋️', '🏥', '🏫'];

const MOCK_ADDRESSES = [
  { id: '1', label: 'Maison', address: 'Rue du Lac Malaren, Berges du Lac 2, Tunis', icon: '🏠', isDefault: true },
  { id: '2', label: 'Bureau', address: 'Avenue Mohamed V, Centre Urbain Nord, Tunis', icon: '💼', isDefault: false },
  { id: '3', label: 'Salle de sport', address: 'Centre commercial Carrefour, La Marsa', icon: '🏋️', isDefault: false },
];

function AddressCard({ item, onDelete, onSetDefault, onEdit }) {
  return (
    <View style={[styles.card, item.isDefault && styles.cardDefault]}>
      <View style={styles.cardLeft}>
        <View style={[styles.iconBox, item.isDefault && styles.iconBoxDefault]}>
          <Text style={styles.iconText}>{item.icon}</Text>
        </View>
        <View style={styles.addressInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.addressLabel}>{item.label}</Text>
            {item.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>PAR DÉFAUT</Text>
              </View>
            )}
          </View>
          <Text style={styles.addressText} numberOfLines={2}>{item.address}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        {!item.isDefault && (
          <TouchableOpacity style={styles.setDefaultBtn} onPress={() => onSetDefault(item.id)}>
            <Text style={styles.setDefaultText}>★</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(item)}>
          <Text style={styles.editText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)}>
          <Text style={styles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ClientSavedAddressesScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ label: '', address: '', icon: '📍' });

  useEffect(() => {
    api.get('/api/client/addresses')
      .then(r => setAddresses(r.data.addresses || MOCK_ADDRESSES))
      .catch(() => setAddresses(MOCK_ADDRESSES))
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ label: '', address: '', icon: '📍' });
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ label: item.label, address: item.address, icon: item.icon });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.label.trim() || !form.address.trim()) {
      Alert.alert('Champs requis', 'Veuillez remplir le nom et l\'adresse.');
      return;
    }
    try {
      if (editing) {
        await api.put(`/api/client/addresses/${editing.id}`, form).catch(() => {});
        setAddresses(prev => prev.map(a => a.id === editing.id ? { ...a, ...form } : a));
      } else {
        const newAddr = { id: Date.now().toString(), ...form, isDefault: addresses.length === 0 };
        await api.post('/api/client/addresses', form).catch(() => {});
        setAddresses(prev => [...prev, newAddr]);
      }
      setModalVisible(false);
    } catch {}
  };

  const handleDelete = (id) => {
    Alert.alert('Supprimer', 'Supprimer cette adresse ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          await api.delete(`/api/client/addresses/${id}`).catch(() => {});
          setAddresses(prev => prev.filter(a => a.id !== id));
        },
      },
    ]);
  };

  const handleSetDefault = async (id) => {
    await api.post(`/api/client/addresses/${id}/default`).catch(() => {});
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes adresses</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={a => a.id}
          renderItem={({ item }) => (
            <AddressCard item={item} onDelete={handleDelete} onSetDefault={handleSetDefault} onEdit={openEdit} />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 80 }}>
              <Text style={{ fontSize: 48 }}>📍</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12, fontSize: 15 }}>Aucune adresse sauvegardée</Text>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={openAdd}>
                <Text style={styles.emptyAddBtnText}>+ Ajouter une adresse</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editing ? 'Modifier' : 'Nouvelle adresse'}</Text>

            <Text style={styles.fieldLabel}>Icône</Text>
            <View style={styles.iconRow}>
              {ICONS.map(ic => (
                <TouchableOpacity
                  key={ic}
                  style={[styles.iconPick, form.icon === ic && styles.iconPickActive]}
                  onPress={() => setForm(f => ({ ...f, icon: ic }))}
                >
                  <Text style={{ fontSize: 20 }}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Nom</Text>
            <TextInput
              style={styles.input}
              value={form.label}
              onChangeText={v => setForm(f => ({ ...f, label: v }))}
              placeholder="ex: Maison, Bureau..."
              placeholderTextColor={COLORS.muted}
            />

            <Text style={styles.fieldLabel}>Adresse complète</Text>
            <TextInput
              style={[styles.input, { height: 72, textAlignVertical: 'top' }]}
              value={form.address}
              onChangeText={v => setForm(f => ({ ...f, address: v }))}
              placeholder="Rue, ville..."
              placeholderTextColor={COLORS.muted}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  addBtn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnText: { color: '#000', fontSize: 13, fontWeight: '700' },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center',
  },
  cardDefault: { borderColor: COLORS.accent + '60' },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  iconBoxDefault: { borderColor: COLORS.accent + '60', backgroundColor: COLORS.accent + '15' },
  iconText: { fontSize: 22 },
  addressInfo: { flex: 1 },
  addressLabel: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  defaultBadge: {
    backgroundColor: COLORS.accent + '25', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2,
  },
  defaultBadgeText: { color: COLORS.accent, fontSize: 9, fontWeight: '800' },
  addressText: { color: COLORS.muted, fontSize: 12, marginTop: 3, lineHeight: 16 },
  cardActions: { gap: 6, marginLeft: 8 },
  setDefaultBtn: { padding: 4 },
  setDefaultText: { fontSize: 16, color: COLORS.muted },
  editBtn: { padding: 4 },
  editText: { fontSize: 14 },
  deleteBtn: { padding: 4 },
  deleteText: { fontSize: 14 },
  emptyAddBtn: {
    marginTop: 20, backgroundColor: COLORS.accent, borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  emptyAddBtnText: { color: '#000', fontSize: 14, fontWeight: '700' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderWidth: 1, borderColor: COLORS.border,
  },
  modalTitle: { color: COLORS.text, fontSize: 17, fontWeight: '800', marginBottom: 20 },
  fieldLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: 0.8 },
  iconRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  iconPick: {
    width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
  },
  iconPickActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '20' },
  input: {
    backgroundColor: COLORS.bg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 14,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cancelBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 12, alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
  saveBtn: { flex: 2, borderRadius: 12, backgroundColor: COLORS.accent, paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
});
