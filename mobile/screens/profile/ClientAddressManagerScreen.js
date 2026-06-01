import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  orange: '#F57C00',
  green: '#27AE60',
  accent: '#D32F2F',
};

const ADDRESS_TYPES = [
  { key: 'HOME', label: 'Domicile', icon: '🏠' },
  { key: 'WORK', label: 'Travail', icon: '🏢' },
  { key: 'OTHER', label: 'Autre', icon: '📍' },
];

const MOCK_ADDRESSES = [
  { id: 'addr-1', label: 'Domicile', type: 'HOME', address: '12 Rue du Lac, Les Berges du Lac 2, Tunis 1053', isDefault: true },
  { id: 'addr-2', label: 'Bureau', type: 'WORK', address: 'Avenue Habib Bourguiba, Immeuble Colisée, Tunis Centre', isDefault: false },
  { id: 'addr-3', label: 'Parents', type: 'OTHER', address: '5 Rue Ibn Rachiq, La Marsa, Tunis', isDefault: false },
];

function AddressModal({ visible, address, onClose, onSave }) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState('HOME');
  const [fullAddress, setFullAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (address) {
      setLabel(address.label || '');
      setType(address.type || 'HOME');
      setFullAddress(address.address || '');
      setIsDefault(address.isDefault || false);
    } else {
      setLabel('');
      setType('HOME');
      setFullAddress('');
      setIsDefault(false);
    }
  }, [address, visible]);

  const handleSave = () => {
    if (!fullAddress.trim()) { Alert.alert('Adresse requise'); return; }
    onSave({ id: address?.id, label: label || ADDRESS_TYPES.find((t) => t.key === type)?.label, type, address: fullAddress.trim(), isDefault });
  };

  const typeCfg = ADDRESS_TYPES.find((t) => t.key === type) || ADDRESS_TYPES[0];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.sheet}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text style={m.title}>{address ? '✏️ Modifier' : '➕ Nouvelle adresse'}</Text>
            <TouchableOpacity onPress={onClose} style={{ marginLeft: 'auto' }}>
              <Text style={{ color: COLORS.muted, fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Type picker */}
          <Text style={m.label}>Type</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
            {ADDRESS_TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[m.typeBtn, type === t.key && m.typeBtnActive]}
                onPress={() => setType(t.key)}
              >
                <Text style={{ fontSize: 16 }}>{t.icon}</Text>
                <Text style={[m.typeLbl, type === t.key && { color: COLORS.orange }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={m.label}>Nom de l'adresse (optionnel)</Text>
          <TextInput style={m.input} value={label} onChangeText={setLabel} placeholder={typeCfg.label} placeholderTextColor={COLORS.muted} maxLength={30} />

          <Text style={m.label}>Adresse complète</Text>
          <TextInput
            style={[m.input, { height: 70, textAlignVertical: 'top' }]}
            value={fullAddress}
            onChangeText={setFullAddress}
            placeholder="Rue, quartier, ville..."
            placeholderTextColor={COLORS.muted}
            multiline
            maxLength={200}
          />

          <TouchableOpacity
            style={[m.defaultRow, isDefault && m.defaultRowActive]}
            onPress={() => setIsDefault(!isDefault)}
          >
            <Text style={{ fontSize: 16 }}>⭐</Text>
            <Text style={[m.defaultLbl, isDefault && { color: COLORS.orange }]}>Définir comme adresse par défaut</Text>
            {isDefault && <Text style={{ color: COLORS.orange, marginLeft: 'auto' }}>✓</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={m.saveBtn} onPress={handleSave}>
            <Text style={m.saveBtnTxt}>Enregistrer l'adresse</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  label: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: { backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 12, color: COLORS.text, fontSize: 13, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  typeBtn: { flex: 1, backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 10, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: COLORS.border },
  typeBtnActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orange + '11' },
  typeLbl: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  defaultRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  defaultRowActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orange + '11' },
  defaultLbl: { color: COLORS.muted, fontSize: 13 },
  saveBtn: { backgroundColor: COLORS.orange, borderRadius: 12, padding: 14, alignItems: 'center' },
  saveBtnTxt: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

export default function ClientAddressManagerScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/clients/addresses');
      setAddresses(res.data.addresses || []);
    } catch {
      setAddresses(MOCK_ADDRESSES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    try {
      if (data.id) {
        await api.put(`/api/clients/addresses/${data.id}`, data);
      } else {
        await api.post('/api/clients/addresses', data);
      }
      setShowModal(false);
      setEditing(null);
      load();
    } catch {
      Alert.alert('Erreur', 'Impossible d\'enregistrer l\'adresse.');
    }
  };

  const handleDelete = (addr) => {
    Alert.alert(
      'Supprimer',
      `Supprimer "${addr.label}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/clients/addresses/${addr.id}`);
              load();
            } catch {
              setAddresses((prev) => prev.filter((a) => a.id !== addr.id));
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addrId) => {
    try {
      await api.patch(`/api/clients/addresses/${addrId}/default`);
      load();
    } catch {
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === addrId })));
    }
  };

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.orange} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>📍 Mes adresses</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => { setEditing(null); setShowModal(true); }}>
          <Text style={s.addBtnTxt}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const typeCfg = ADDRESS_TYPES.find((t) => t.key === item.type) || ADDRESS_TYPES[2];
          return (
            <View style={[s.card, item.isDefault && s.cardDefault]}>
              <View style={s.cardTop}>
                <Text style={{ fontSize: 24 }}>{typeCfg.icon}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={s.addrLabel}>{item.label}</Text>
                    {item.isDefault && (
                      <View style={s.defaultBadge}>
                        <Text style={s.defaultBadgeTxt}>⭐ Défaut</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.addrFull} numberOfLines={2}>{item.address}</Text>
                </View>
              </View>

              <View style={s.actionRow}>
                <TouchableOpacity style={s.actionBtn} onPress={() => { setEditing(item); setShowModal(true); }}>
                  <Text style={s.actionBtnTxt}>✏️ Modifier</Text>
                </TouchableOpacity>
                {!item.isDefault && (
                  <TouchableOpacity style={s.actionBtn} onPress={() => handleSetDefault(item.id)}>
                    <Text style={s.actionBtnTxt}>⭐ Définir défaut</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[s.actionBtn, { borderColor: COLORS.accent + '44' }]} onPress={() => handleDelete(item)}>
                  <Text style={[s.actionBtnTxt, { color: COLORS.accent }]}>🗑 Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📍</Text>
            <Text style={s.emptyTitle}>Aucune adresse enregistrée</Text>
            <Text style={s.emptySub}>Ajoutez vos adresses favorites pour commander plus vite.</Text>
            <TouchableOpacity style={s.addBtnLarge} onPress={() => { setEditing(null); setShowModal(true); }}>
              <Text style={s.addBtnLargeTxt}>+ Ajouter une adresse</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      />

      <AddressModal
        visible={showModal}
        address={editing}
        onClose={() => { setShowModal(false); setEditing(null); }}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', flex: 1 },
  addBtn: { backgroundColor: COLORS.orange + '22', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.orange },
  addBtnTxt: { color: COLORS.orange, fontSize: 13, fontWeight: '700' },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  cardDefault: { borderColor: COLORS.orange + '66' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  addrLabel: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  defaultBadge: { backgroundColor: COLORS.orange + '22', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: COLORS.orange },
  defaultBadgeTxt: { color: COLORS.orange, fontSize: 10, fontWeight: '700' },
  addrFull: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  actionBtn: { backgroundColor: COLORS.surfaceAlt || '#16161F', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  actionBtnTxt: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center', marginBottom: 20 },
  addBtnLarge: { backgroundColor: COLORS.orange, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  addBtnLargeTxt: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
