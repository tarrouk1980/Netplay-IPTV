import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
  Alert, Image, TextInput, Modal, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api';
import { useCart } from '../../contexts/CartContext';

type Wishlist = {
  id: string;
  name: string;
  isPublic: boolean;
  items: { id: string; product: { id: string; title: string; price: number; promoPrice?: number; images: string[] } }[];
};

export default function WishlistScreen({ navigation }: any) {
  const [lists, setLists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Wishlist | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPublic, setNewPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addItem } = useCart();

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.get('/wishlists')
      .then(r => {
        const data = r.data.data || [];
        setLists(data);
        if (selected) {
          const updated = data.find((l: Wishlist) => l.id === selected.id);
          if (updated) setSelected(updated);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const createList = async () => {
    if (!newName.trim()) { Alert.alert('Erreur', 'Nom requis'); return; }
    setSaving(true);
    try {
      const res = await api.post('/wishlists', { name: newName.trim(), isPublic: newPublic });
      setLists(prev => [res.data.data, ...prev]);
      setCreating(false);
      setNewName('');
      setNewPublic(false);
    } catch { Alert.alert('Erreur', 'Impossible de créer la liste'); }
    finally { setSaving(false); }
  };

  const deleteList = (id: string) => {
    Alert.alert('Supprimer la liste', 'Cette action est irréversible.', [
      { text: 'Annuler' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/wishlists/${id}`);
          setLists(prev => prev.filter(l => l.id !== id));
          if (selected?.id === id) setSelected(null);
        } catch { Alert.alert('Erreur', 'Impossible de supprimer'); }
      }},
    ]);
  };

  const removeItem = async (listId: string, productId: string) => {
    try {
      await api.delete(`/wishlists/${listId}/items/${productId}`);
      setLists(prev => prev.map(l => l.id === listId
        ? { ...l, items: l.items.filter(i => i.product.id !== productId) }
        : l));
      if (selected?.id === listId) {
        setSelected(prev => prev ? { ...prev, items: prev.items.filter(i => i.product.id !== productId) } : null);
      }
    } catch { Alert.alert('Erreur', 'Impossible de retirer le produit'); }
  };

  const addAllToCart = (list: Wishlist) => {
    if (list.items.length === 0) return;
    list.items.forEach(i => {
      addItem({ id: i.product.id, title: i.product.title, price: i.product.promoPrice ?? i.product.price, image: i.product.images?.[0], seller: '' });
    });
    Alert.alert('✓ Ajouté', `${list.items.length} produit(s) ajouté(s) au panier.`);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#9f1239" />;

  if (selected) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <View style={s.detailHeader}>
          <TouchableOpacity onPress={() => setSelected(null)} style={s.backBtn}>
            <Text style={{ color: '#9f1239', fontWeight: '800', fontSize: 16 }}>‹ Retour</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.detailTitle}>{selected.name}</Text>
            <Text style={s.detailSub}>{selected.items.length} produit(s) · {selected.isPublic ? 'Publique' : 'Privée'}</Text>
          </View>
          {selected.items.length > 0 && (
            <TouchableOpacity style={s.cartAllBtn} onPress={() => addAllToCart(selected)}>
              <Text style={s.cartAllText}>🛒 Tout</Text>
            </TouchableOpacity>
          )}
        </View>
        {selected.items.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
            <Text style={s.emptyTitle}>Liste vide</Text>
            <Text style={s.emptySub}>Ajoutez des produits depuis les fiches produit.</Text>
          </View>
        ) : (
          <FlatList
            data={selected.items}
            keyExtractor={i => i.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
            renderItem={({ item }) => {
              const p = item.product;
              const price = p.promoPrice ?? p.price;
              return (
                <View style={s.productCard}>
                  <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { id: p.id })} style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
                    {p.images?.[0] ? (
                      <Image source={{ uri: p.images[0] }} style={s.productImg} />
                    ) : (
                      <View style={[s.productImg, { backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }]}>
                        <Text style={{ fontSize: 24 }}>📦</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={s.productTitle} numberOfLines={2}>{p.title}</Text>
                      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
                        <Text style={s.productPrice}>{Number(price).toFixed(2)} TND</Text>
                        {p.promoPrice && <Text style={s.productOrig}>{Number(p.price).toFixed(2)}</Text>}
                      </View>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeItem(selected.id, p.id)} style={s.removeBtn}>
                    <Text style={{ color: '#ef4444', fontSize: 18 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={s.header}>
        <Text style={s.title}>📋 Mes listes</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setCreating(true)}>
          <Text style={s.addBtnText}>+ Nouvelle liste</Text>
        </TouchableOpacity>
      </View>

      {lists.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
          <Text style={s.emptyTitle}>Aucune liste créée</Text>
          <Text style={s.emptySub}>Créez des listes pour organiser vos produits favoris.</Text>
        </View>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={l => l.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.listCard} onPress={() => setSelected(item)}>
              <View style={s.listImgs}>
                {item.items.slice(0, 4).map((wi, i) => (
                  wi.product.images?.[0] ? (
                    <Image key={i} source={{ uri: wi.product.images[0] }} style={s.listThumb} />
                  ) : (
                    <View key={i} style={[s.listThumb, { backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }]}>
                      <Text style={{ fontSize: 14 }}>📦</Text>
                    </View>
                  )
                ))}
                {item.items.length === 0 && (
                  <View style={[s.listThumb, { backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', width: 64 }]}>
                    <Text style={{ fontSize: 24, color: '#cbd5e1' }}>+</Text>
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.listName}>{item.name}</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                  <Text style={s.listCount}>{item.items.length} produit(s)</Text>
                  <View style={[s.publicBadge, { backgroundColor: item.isPublic ? '#f0fdf4' : '#f8fafc' }]}>
                    <Text style={[s.publicText, { color: item.isPublic ? '#16a34a' : '#94a3b8' }]}>
                      {item.isPublic ? 'Publique' : 'Privée'}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => deleteList(item.id)} style={{ padding: 8 }}>
                <Text style={{ color: '#cbd5e1', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={creating} animationType="slide" presentationStyle="formSheet" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Nouvelle liste</Text>
            <Text style={s.label}>Nom de la liste *</Text>
            <TextInput
              style={s.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Ex: Cadeaux de Noël"
              placeholderTextColor="#94a3b8"
              autoFocus
            />
            <TouchableOpacity style={s.toggleRow} onPress={() => setNewPublic(v => !v)}>
              <View style={[s.toggle, { backgroundColor: newPublic ? '#9f1239' : '#e2e8f0' }]}>
                <View style={[s.toggleThumb, { transform: [{ translateX: newPublic ? 20 : 2 }] }]} />
              </View>
              <Text style={{ fontSize: 14, color: '#1e293b', fontWeight: '600' }}>Liste publique</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>
              Les listes publiques peuvent être partagées avec un lien.
            </Text>
            <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={createList} disabled={saving}>
              <Text style={s.saveBtnText}>{saving ? 'Création...' : 'Créer la liste'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setCreating(false); setNewName(''); }} style={{ alignItems: 'center', marginTop: 12 }}>
              <Text style={{ color: '#94a3b8', fontWeight: '600' }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 20 },
  title: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  addBtn: { backgroundColor: '#9f1239', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 6 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  emptySub: { fontSize: 13, color: '#64748b', textAlign: 'center' },
  listCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9' },
  listImgs: { flexDirection: 'row', flexWrap: 'wrap', width: 64, gap: 2 },
  listThumb: { width: 30, height: 30, borderRadius: 6 },
  listName: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  listCount: { fontSize: 12, color: '#64748b' },
  publicBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  publicText: { fontSize: 10, fontWeight: '800' },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, paddingTop: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { paddingRight: 8 },
  detailTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  detailSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  cartAllBtn: { backgroundColor: '#9f1239', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  cartAllText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  productCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9', gap: 4 },
  productImg: { width: 56, height: 56, borderRadius: 10 },
  productTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  productPrice: { fontSize: 14, fontWeight: '900', color: '#9f1239' },
  productOrig: { fontSize: 11, color: '#94a3b8', textDecorationLine: 'line-through' },
  removeBtn: { padding: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, padding: 14, fontSize: 15, color: '#0f172a', marginBottom: 16 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  toggle: { width: 44, height: 24, borderRadius: 12, position: 'relative', justifyContent: 'center' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', position: 'absolute', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 2 },
  saveBtn: { backgroundColor: '#9f1239', borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});
