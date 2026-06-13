import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  Alert, StyleSheet, Modal, ScrollView, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api';

export default function SellerCollectionsScreen() {
  const [collections, setCollections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [managingId, setManagingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/collections'),
      api.get('/vendors/products'),
    ]).then(([cRes, pRes]) => {
      setCollections(cRes.data?.data || []);
      setProducts(pRes.data?.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const create = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await api.post('/collections', form);
      setCollections(prev => [res.data.data, ...prev]);
      setForm({ name: '', description: '' });
      setShowCreate(false);
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.message || 'Impossible de créer.');
    } finally { setSaving(false); }
  };

  const remove = (id: string) => {
    Alert.alert('Supprimer', 'Supprimer cette collection ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        await api.delete(`/collections/${id}`).catch(() => {});
        setCollections(prev => prev.filter(c => c.id !== id));
      }},
    ]);
  };

  const toggleProduct = async (collectionId: string, productId: string, inCollection: boolean) => {
    if (inCollection) {
      await api.delete(`/collections/${collectionId}/products/${productId}`).catch(() => {});
    } else {
      await api.post(`/collections/${collectionId}/products`, { productId }).catch(() => {});
    }
    const res = await api.get('/collections').catch(() => null);
    if (res) setCollections(res.data?.data || []);
  };

  const managingCol = managingId ? collections.find(c => c.id === managingId) : null;

  if (loading) return <ActivityIndicator color="#9f1239" size="large" style={{ flex: 1, marginTop: 80 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <FlatList
        data={collections}
        keyExtractor={c => c.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 80 }}
        ListHeaderComponent={
          <TouchableOpacity style={s.createBtn} onPress={() => setShowCreate(true)}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>+ Nouvelle collection</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 40 }}>🗂️</Text>
            <Text style={{ color: '#64748b', fontWeight: '600', marginTop: 12 }}>Aucune collection</Text>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 6, textAlign: 'center' }}>Groupez vos produits par thème ou saison.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.cardName}>{item.name}</Text>
                {item.description ? <Text style={s.cardDesc} numberOfLines={1}>{item.description}</Text> : null}
                <Text style={s.cardCount}>{item.items?.length || 0} produit(s)</Text>
              </View>
              <TouchableOpacity onPress={() => remove(item.id)} style={{ padding: 8 }}>
                <Text style={{ color: '#ef4444', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={s.cardActions}>
              <TouchableOpacity style={s.manageBtn} onPress={() => setManagingId(managingId === item.id ? null : item.id)}>
                <Text style={{ color: '#9f1239', fontWeight: '700', fontSize: 13 }}>
                  {managingId === item.id ? 'Fermer' : '📋 Gérer produits'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Create modal */}
      <Modal visible={showCreate} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Nouvelle collection</Text>
            <TextInput style={s.input} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} placeholder="Nom de la collection *" placeholderTextColor="#94a3b8" />
            <TextInput style={[s.input, { minHeight: 70, textAlignVertical: 'top' }]} value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} placeholder="Description (optionnel)" placeholderTextColor="#94a3b8" multiline />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[s.modalBtn, { backgroundColor: '#f1f5f9', flex: 1 }]} onPress={() => setShowCreate(false)}>
                <Text style={{ color: '#64748b', fontWeight: '700' }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn, { backgroundColor: '#9f1239', flex: 2 }]} onPress={create} disabled={saving || !form.name.trim()}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>{saving ? 'Création...' : 'Créer'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Manage products drawer */}
      <Modal visible={!!managingId} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={[s.modal, { maxHeight: '80%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={s.modalTitle}>{managingCol?.name}</Text>
              <TouchableOpacity onPress={() => setManagingId(null)}>
                <Text style={{ fontSize: 22, color: '#9f1239' }}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>Appuyez pour ajouter/retirer :</Text>
            <ScrollView>
              {products.map((p: any) => {
                const inCol = managingCol?.items?.some((i: any) => i.productId === p.id);
                return (
                  <TouchableOpacity key={p.id} style={[s.productRow, inCol && s.productRowSelected]} onPress={() => toggleProduct(managingId!, p.id, inCol)}>
                    <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: inCol ? '#9f1239' : '#1e293b' }} numberOfLines={1}>{p.title}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: inCol ? '#9f1239' : '#94a3b8' }}>{inCol ? '✓' : '+'}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  createBtn: { backgroundColor: '#9f1239', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  cardName: { fontSize: 15, fontWeight: '800', color: '#1e293b' },
  cardDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  cardCount: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 8 },
  manageBtn: { flex: 1, borderWidth: 1, borderColor: '#fecdd3', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b', marginBottom: 16 },
  input: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, fontSize: 14, color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 },
  modalBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  productRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc', paddingHorizontal: 4 },
  productRowSelected: { backgroundColor: '#fff5f7' },
});
