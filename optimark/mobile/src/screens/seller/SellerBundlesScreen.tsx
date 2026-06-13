import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
  Alert, TextInput, ScrollView, Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api';

type Bundle = {
  id: string;
  title: string;
  description?: string;
  discount: number;
  isActive: boolean;
  items: { id: string; product: { id: string; title: string; price: number } }[];
};

const EMPTY_FORM = { title: '', description: '', discount: '', productIds: [] as string[] };

export default function SellerBundlesScreen() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/bundles/my'),
      api.get('/vendors/products'),
    ]).then(([bRes, pRes]) => {
      setBundles(bRes.data.data || []);
      setProducts(pRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []));

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (b: Bundle) => {
    setEditId(b.id);
    setForm({
      title: b.title,
      description: b.description || '',
      discount: String(b.discount),
      productIds: b.items.map(i => i.product.id),
    });
    setModalVisible(true);
  };

  const toggleProduct = (id: string) => {
    setForm(f => ({
      ...f,
      productIds: f.productIds.includes(id)
        ? f.productIds.filter(p => p !== id)
        : [...f.productIds, id],
    }));
  };

  const save = async () => {
    if (!form.title.trim()) { Alert.alert('Erreur', 'Titre requis'); return; }
    const discount = parseFloat(form.discount);
    if (isNaN(discount) || discount <= 0 || discount > 100) { Alert.alert('Erreur', 'Réduction invalide (0-100%)'); return; }
    if (form.productIds.length < 2) { Alert.alert('Erreur', 'Sélectionnez au moins 2 produits'); return; }
    setSaving(true);
    try {
      const payload = { title: form.title.trim(), description: form.description, discount, productIds: form.productIds };
      if (editId) {
        const res = await api.put(`/bundles/${editId}`, payload);
        setBundles(prev => prev.map(b => b.id === editId ? res.data.data : b));
      } else {
        const res = await api.post('/bundles', payload);
        setBundles(prev => [res.data.data, ...prev]);
      }
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const remove = (id: string) => {
    Alert.alert('Supprimer le bundle', 'Cette action est irréversible.', [
      { text: 'Annuler' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/bundles/${id}`);
          setBundles(prev => prev.filter(b => b.id !== id));
        } catch { Alert.alert('Erreur', 'Impossible de supprimer'); }
      }},
    ]);
  };

  const toggleActive = async (b: Bundle) => {
    try {
      const res = await api.put(`/bundles/${b.id}`, { isActive: !b.isActive });
      setBundles(prev => prev.map(x => x.id === b.id ? res.data.data : x));
    } catch { Alert.alert('Erreur', 'Impossible de mettre à jour'); }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#9f1239" />;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <TouchableOpacity style={s.addBtn} onPress={openCreate}>
        <Text style={s.addBtnText}>+ Nouveau bundle</Text>
      </TouchableOpacity>

      {bundles.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 48 }}>📦</Text>
          <Text style={s.emptyTitle}>Aucun bundle créé</Text>
          <Text style={s.emptySub}>Groupez vos produits avec une remise pour augmenter votre panier moyen.</Text>
        </View>
      ) : (
        <FlatList
          data={bundles}
          keyExtractor={b => b.id}
          contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{item.title}</Text>
                  {item.description ? <Text style={s.cardDesc}>{item.description}</Text> : null}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    <View style={[s.badge, { backgroundColor: '#fef3c7' }]}>
                      <Text style={[s.badgeText, { color: '#d97706' }]}>-{item.discount}%</Text>
                    </View>
                    <View style={[s.badge, { backgroundColor: item.isActive ? '#f0fdf4' : '#f8fafc' }]}>
                      <Text style={[s.badgeText, { color: item.isActive ? '#16a34a' : '#94a3b8' }]}>
                        {item.isActive ? 'Actif' : 'Inactif'}
                      </Text>
                    </View>
                    <View style={s.badge}>
                      <Text style={s.badgeText}>{item.items.length} produits</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={s.products}>
                {item.items.map(i => (
                  <Text key={i.id} style={s.productLine} numberOfLines={1}>· {i.product.title} — {i.product.price} TND</Text>
                ))}
              </View>

              <View style={s.actions}>
                <TouchableOpacity style={s.actionBtn} onPress={() => openEdit(item)}>
                  <Text style={s.actionBtnText}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.actionBtn, { borderColor: item.isActive ? '#94a3b8' : '#22c55e' }]} onPress={() => toggleActive(item)}>
                  <Text style={[s.actionBtnText, { color: item.isActive ? '#64748b' : '#16a34a' }]}>
                    {item.isActive ? 'Désactiver' : 'Activer'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.actionBtn, { borderColor: '#fca5a5' }]} onPress={() => remove(item.id)}>
                  <Text style={[s.actionBtnText, { color: '#ef4444' }]}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modal}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>{editId ? 'Modifier le bundle' : 'Nouveau bundle'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#94a3b8', fontSize: 16 }}>Annuler</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            <Text style={s.label}>Titre *</Text>
            <TextInput style={s.input} value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} placeholder="Ex: Pack Cuisine" placeholderTextColor="#94a3b8" />

            <Text style={s.label}>Description</Text>
            <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} multiline placeholder="Description optionnelle" placeholderTextColor="#94a3b8" />

            <Text style={s.label}>Réduction (%) *</Text>
            <TextInput style={s.input} value={form.discount} onChangeText={v => setForm(f => ({ ...f, discount: v }))} keyboardType="numeric" placeholder="Ex: 15" placeholderTextColor="#94a3b8" />

            <Text style={s.label}>Produits * ({form.productIds.length} sélectionnés)</Text>
            {products.map(p => {
              const selected = form.productIds.includes(p.id);
              return (
                <TouchableOpacity key={p.id} style={[s.productRow, selected && s.productRowSelected]} onPress={() => toggleProduct(p.id)}>
                  <View style={[s.checkbox, selected && s.checkboxSelected]}>
                    {selected && <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>✓</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.productRowTitle} numberOfLines={1}>{p.title}</Text>
                    <Text style={s.productRowPrice}>{p.price} TND</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
              <Text style={s.saveBtnText}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  addBtn: { margin: 16, marginBottom: 8, backgroundColor: '#9f1239', borderRadius: 14, padding: 14, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  emptySub: { fontSize: 13, color: '#64748b', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  cardDesc: { fontSize: 13, color: '#64748b', marginTop: 3 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: '#f8fafc' },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#64748b' },
  products: { marginTop: 10, gap: 2 },
  productLine: { fontSize: 12, color: '#64748b' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  actionBtn: { flex: 1, borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 10, padding: 8, alignItems: 'center' },
  actionBtnText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  modal: { flex: 1, backgroundColor: '#f8fafc' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#fff' },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, fontSize: 14, color: '#0f172a', backgroundColor: '#fff' },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 8, backgroundColor: '#fff' },
  productRowSelected: { borderColor: '#9f1239', backgroundColor: '#fff7f7' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: '#9f1239', borderColor: '#9f1239' },
  productRowTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  productRowPrice: { fontSize: 12, color: '#64748b' },
  saveBtn: { backgroundColor: '#9f1239', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});
