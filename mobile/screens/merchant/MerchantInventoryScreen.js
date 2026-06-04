import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, TextInput, Modal, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const CATEGORIES = ['Tout', 'Fruits', 'Légumes', 'Boulangerie', 'Laitiers', 'Boissons', 'Autre'];

const MOCK_PRODUCTS = [
  { id: 'P1', name: 'Pommes Golden', category: 'Fruits', price: 3.5, stock: 50, unit: 'kg', available: true, image: '🍎' },
  { id: 'P2', name: 'Tomates cerises', category: 'Légumes', price: 4.2, stock: 30, unit: 'kg', available: true, image: '🍅' },
  { id: 'P3', name: 'Pain complet', category: 'Boulangerie', price: 1.8, stock: 20, unit: 'pièce', available: true, image: '🍞' },
  { id: 'P4', name: 'Lait entier 1L', category: 'Laitiers', price: 2.1, stock: 0, unit: 'L', available: false, image: '🥛' },
  { id: 'P5', name: 'Jus d\'orange', category: 'Boissons', price: 3.9, stock: 15, unit: 'L', available: true, image: '🍊' },
  { id: 'P6', name: 'Bananes', category: 'Fruits', price: 2.5, stock: 40, unit: 'kg', available: true, image: '🍌' },
];

function ProductCard({ item, onEdit, onToggle }) {
  return (
    <View style={[styles.card, !item.available && styles.cardDim]}>
      <View style={styles.cardLeft}>
        <View style={styles.productIcon}>
          <Text style={{ fontSize: 26 }}>{item.image}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCat}>{item.category}</Text>
          <View style={styles.productMeta}>
            <Text style={styles.productPrice}>{item.price.toFixed(3)} TND/{item.unit}</Text>
            <Text style={[styles.productStock, item.stock === 0 && { color: COLORS.red }]}>
              {item.stock === 0 ? '⚠️ Rupture' : `Stock: ${item.stock}`}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Switch
          value={item.available}
          onValueChange={() => onToggle(item)}
          trackColor={{ false: COLORS.border, true: COLORS.green + '80' }}
          thumbColor={item.available ? COLORS.green : COLORS.muted}
        />
        <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(item)}>
          <Text style={{ color: COLORS.accent, fontSize: 12, fontWeight: '700' }}>Éditer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MerchantInventoryScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tout');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', stock: '', unit: 'kg', category: 'Fruits', image: '🛒' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/merchant/products')
      .then(r => setProducts(r.data.products || MOCK_PRODUCTS))
      .catch(() => setProducts(MOCK_PRODUCTS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, price: String(item.price), stock: String(item.stock), unit: item.unit, category: item.category, image: item.image });
    setModal(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', price: '', stock: '', unit: 'kg', category: 'Fruits', image: '🛒' });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      Alert.alert('Erreur', 'Nom et prix requis.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) || 0, available: true };
      if (editing) {
        await api.put(`/api/merchant/products/${editing.id}`, payload);
        setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, ...payload } : p));
      } else {
        const r = await api.post('/api/merchant/products', payload);
        setProducts(prev => [...prev, r.data.product || { ...payload, id: `P${Date.now()}` }]);
      }
      setModal(false);
    } catch {
      // fallback local
      if (editing) setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, name: form.name, price: parseFloat(form.price), stock: parseInt(form.stock) || 0 } : p));
      setModal(false);
    } finally { setSaving(false); }
  };

  const handleToggle = async (item) => {
    setProducts(prev => prev.map(p => p.id === item.id ? { ...p, available: !p.available } : p));
    api.patch(`/api/merchant/products/${item.id}/toggle`).catch(() => {});
  };

  const handleDelete = (item) => {
    Alert.alert('Supprimer ?', `Supprimer "${item.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          setProducts(prev => prev.filter(p => p.id !== item.id));
          setModal(false);
          api.delete(`/api/merchant/products/${item.id}`).catch(() => {});
        },
      },
    ]);
  };

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchCat = category === 'Tout' || p.category === category;
    const matchQ = !q || p.name.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const outOfStock = products.filter(p => p.stock === 0).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📦 Inventaire</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openNew}>
          <Text style={styles.addBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {outOfStock > 0 && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>⚠️ {outOfStock} produit{outOfStock > 1 ? 's' : ''} en rupture de stock</Text>
        </View>
      )}

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Chercher un produit..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={c => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catsRow}
        renderItem={({ item: c }) => (
          <TouchableOpacity
            style={[styles.catBtn, category === c && styles.catBtnActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.catLabel, category === c && styles.catLabelActive]}>{c}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.countRow}>
        <Text style={styles.countText}>{filtered.length} produit{filtered.length !== 1 ? 's' : ''}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => p.id}
          renderItem={({ item }) => <ProductCard item={item} onEdit={openEdit} onToggle={handleToggle} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 40 }}>📦</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucun produit</Text>
            </View>
          }
        />
      )}

      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? 'Modifier le produit' : 'Nouveau produit'}</Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Text style={{ color: COLORS.muted, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {[
              { label: 'Nom du produit', key: 'name', placeholder: 'Ex: Pommes Golden' },
              { label: 'Prix (TND)', key: 'price', placeholder: '0.000', keyboardType: 'numeric' },
              { label: 'Stock', key: 'stock', placeholder: '0', keyboardType: 'numeric' },
              { label: 'Unité', key: 'unit', placeholder: 'kg, pièce, L...' },
            ].map(field => (
              <View key={field.key} style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={form[field.key]}
                  onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                  placeholder={field.placeholder}
                  placeholderTextColor={COLORS.muted}
                  keyboardType={field.keyboardType || 'default'}
                />
              </View>
            ))}

            <View style={styles.modalActions}>
              {editing && (
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(editing)}>
                  <Text style={styles.deleteBtnText}>Supprimer</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.saveBtnText}>Enregistrer</Text>}
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
  backBtn: { width: 60 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  addBtn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  addBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },
  alertBanner: {
    backgroundColor: COLORS.red + '15', borderBottomWidth: 1, borderBottomColor: COLORS.red + '30',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  alertText: { color: COLORS.red, fontSize: 13, fontWeight: '600' },
  searchRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  searchInput: {
    backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  catsRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  catBtn: {
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 7, backgroundColor: COLORS.surface,
  },
  catBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  catLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  catLabelActive: { color: COLORS.accent },
  countRow: { paddingHorizontal: 16, paddingBottom: 4 },
  countText: { color: COLORS.muted, fontSize: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  cardDim: { opacity: 0.55 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  productIcon: {
    width: 50, height: 50, borderRadius: 14, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  productName: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  productCat: { color: COLORS.muted, fontSize: 11, marginTop: 1 },
  productMeta: { flexDirection: 'row', gap: 10, marginTop: 4 },
  productPrice: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  productStock: { color: COLORS.muted, fontSize: 12 },
  cardRight: { alignItems: 'center', gap: 8 },
  editBtn: {
    backgroundColor: COLORS.accent + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: COLORS.accent + '50',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderWidth: 1, borderColor: COLORS.border,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  fieldRow: { marginBottom: 12 },
  fieldLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', marginBottom: 5, letterSpacing: 0.8 },
  fieldInput: {
    backgroundColor: COLORS.bg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  deleteBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1, borderColor: COLORS.red + '60',
    paddingVertical: 13, alignItems: 'center',
  },
  deleteBtnText: { color: COLORS.red, fontSize: 13, fontWeight: '700' },
  saveBtn: { flex: 2, borderRadius: 12, backgroundColor: COLORS.accent, paddingVertical: 13, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
});
