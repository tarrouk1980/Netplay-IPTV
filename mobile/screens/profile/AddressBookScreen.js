import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, StatusBar, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  green: '#27AE60',
  accent: '#F5A623',
  error: '#E74C3C',
};

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ';

const PRESET_ICONS = [
  { key: 'HOME', label: 'Maison', icon: '🏠' },
  { key: 'WORK', label: 'Travail', icon: '💼' },
  { key: 'GYM', label: 'Sport', icon: '🏋️' },
  { key: 'FAMILY', label: 'Famille', icon: '👨‍👩‍👧' },
  { key: 'CUSTOM', label: 'Autre', icon: '📍' },
];

export default function AddressBookScreen({ navigation, route }) {
  const { onSelect } = route?.params || {};
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // Form state
  const [label, setLabel] = useState('');
  const [type, setType] = useState('CUSTOM');
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [sugLoading, setSugLoading] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const debounceRef = React.useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/users/addresses');
      setAddresses(res.data?.addresses || []);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const searchAddress = (text) => {
    setAddress(text);
    setSelectedCoords(null);
    clearTimeout(debounceRef.current);
    if (!text.trim() || text.length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSugLoading(true);
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?country=TN&language=fr&limit=5&access_token=${MAPBOX_TOKEN}`;
        const r = await fetch(url);
        const d = await r.json();
        setSuggestions((d.features || []).map(f => ({
          id: f.id,
          name: f.text,
          full: f.place_name,
          lat: f.center[1],
          lng: f.center[0],
        })));
      } catch {
        setSuggestions([]);
      } finally {
        setSugLoading(false);
      }
    }, 400);
  };

  const openModal = (addr = null) => {
    setEditTarget(addr);
    setLabel(addr?.label || '');
    setType(addr?.type || 'CUSTOM');
    setAddress(addr?.address || '');
    setSelectedCoords(addr ? { lat: addr.lat, lng: addr.lng } : null);
    setSuggestions([]);
    setModal(true);
  };

  const handleSave = async () => {
    if (!label.trim() || !address.trim()) {
      Alert.alert('Champs requis', 'Renseignez le libellé et l\'adresse.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        label: label.trim(),
        type,
        address: address.trim(),
        lat: selectedCoords?.lat || null,
        lng: selectedCoords?.lng || null,
      };
      if (editTarget) {
        await api.put(`/api/users/addresses/${editTarget.id}`, payload).catch(() => {});
        setAddresses(prev => prev.map(a => a.id === editTarget.id ? { ...a, ...payload } : a));
      } else {
        const res = await api.post('/api/users/addresses', payload).catch(() => ({ data: { address: { id: Date.now().toString(), ...payload } } }));
        setAddresses(prev => [...prev, res.data.address]);
      }
      setModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Supprimer', 'Supprimer cette adresse ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: () => {
          setAddresses(prev => prev.filter(a => a.id !== id));
          api.delete(`/api/users/addresses/${id}`).catch(() => {});
        },
      },
    ]);
  };

  const handleSelect = (addr) => {
    if (onSelect) {
      onSelect(addr);
      navigation.goBack();
    } else {
      openModal(addr);
    }
  };

  const presetIcon = (t) => PRESET_ICONS.find(p => p.key === t)?.icon || '📍';
  const presetLabel = (t) => PRESET_ICONS.find(p => p.key === t)?.label || t;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carnet d'adresses</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={a => a.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📍</Text>
              <Text style={styles.emptyTitle}>Aucune adresse enregistrée</Text>
              <Text style={styles.emptySub}>Ajoutez votre maison, votre travail ou vos lieux favoris pour accélérer vos commandes.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => openModal()}>
                <Text style={styles.emptyBtnText}>+ Ajouter une adresse</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.addrCard}
              onPress={() => handleSelect(item)}
              activeOpacity={0.8}
            >
              <View style={styles.addrIconBox}>
                <Text style={styles.addrIcon}>{presetIcon(item.type)}</Text>
              </View>
              <View style={styles.addrInfo}>
                <Text style={styles.addrLabel}>{item.label}</Text>
                <Text style={styles.addrType}>{presetLabel(item.type)}</Text>
                <Text style={styles.addrAddress} numberOfLines={1}>{item.address}</Text>
              </View>
              <View style={styles.addrActions}>
                <TouchableOpacity onPress={() => openModal(item)} style={styles.editBtn}>
                  <Text style={styles.editBtnText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>🗑</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>{editTarget ? 'Modifier l\'adresse' : 'Nouvelle adresse'}</Text>

              <Text style={styles.formLabel}>TYPE</Text>
              <View style={styles.typeRow}>
                {PRESET_ICONS.map(p => (
                  <TouchableOpacity
                    key={p.key}
                    style={[styles.typeChip, type === p.key && styles.typeChipActive]}
                    onPress={() => { setType(p.key); if (!label) setLabel(p.label); }}
                  >
                    <Text style={styles.typeChipIcon}>{p.icon}</Text>
                    <Text style={[styles.typeChipText, type === p.key && { color: COLORS.text }]}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>LIBELLÉ</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Maison, Bureau principal…"
                placeholderTextColor={COLORS.muted}
                value={label}
                onChangeText={setLabel}
              />

              <Text style={styles.formLabel}>ADRESSE</Text>
              <TextInput
                style={styles.input}
                placeholder="Rechercher une adresse…"
                placeholderTextColor={COLORS.muted}
                value={address}
                onChangeText={searchAddress}
              />

              {sugLoading && <ActivityIndicator size="small" color={COLORS.accent} style={{ marginBottom: 8 }} />}
              {suggestions.length > 0 && (
                <View style={styles.sugList}>
                  {suggestions.map(s => (
                    <TouchableOpacity
                      key={s.id}
                      style={styles.sugItem}
                      onPress={() => { setAddress(s.full); setSelectedCoords({ lat: s.lat, lng: s.lng }); setSuggestions([]); }}
                    >
                      <Text style={styles.sugName}>{s.name}</Text>
                      <Text style={styles.sugFull} numberOfLines={1}>{s.full}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {selectedCoords && (
                <Text style={styles.coordsHint}>📌 {selectedCoords.lat.toFixed(4)}° N, {selectedCoords.lng.toFixed(4)}° E</Text>
              )}

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}>
                  <Text style={styles.cancelBtnText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveBtnText}>Sauvegarder</Text>}
                </TouchableOpacity>
              </View>
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
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#FFF', fontSize: 24, fontWeight: '300', lineHeight: 28 },
  list: { padding: 16, paddingBottom: 40 },
  emptyBox: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  emptyBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  emptyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  addrCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  addrIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  addrIcon: { fontSize: 24 },
  addrInfo: { flex: 1 },
  addrLabel: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  addrType: { color: COLORS.accent, fontSize: 11, fontWeight: '600', marginBottom: 2 },
  addrAddress: { color: COLORS.muted, fontSize: 12 },
  addrActions: { flexDirection: 'row', gap: 4 },
  editBtn: { padding: 8 },
  editBtnText: { fontSize: 16 },
  deleteBtn: { padding: 8 },
  deleteBtnText: { fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 16 },
  formLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 8, marginTop: 4 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  typeChipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '20' },
  typeChipIcon: { fontSize: 16 },
  typeChipText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.bg, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border,
    color: COLORS.text, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 10,
  },
  sugList: { backgroundColor: COLORS.bg, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  sugItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sugName: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  sugFull: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  coordsHint: { color: COLORS.green, fontSize: 11, marginBottom: 8 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  cancelBtnText: { color: COLORS.muted, fontWeight: '700' },
  saveBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: COLORS.accent },
  saveBtnText: { color: '#FFF', fontWeight: '900', fontSize: 15 },
});
