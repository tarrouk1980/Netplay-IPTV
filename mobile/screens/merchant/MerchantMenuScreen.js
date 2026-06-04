import React, { useState, useCallback } from 'react';
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

const MOCK_CATEGORIES = ['Entrées', 'Plats', 'Desserts', 'Boissons', 'Accompagnements'];
const MOCK_ITEMS = [
  { id: 'MI1', name: 'Tajine poulet citron', category: 'Plats', price: 12.500, available: true, icon: '🍲', description: 'Tajine traditionnel au citron confit et olives' },
  { id: 'MI2', name: 'Brick au thon', category: 'Entrées', price: 3.500, available: true, icon: '🥟', description: 'Brick croustillante farcie au thon et oeuf' },
  { id: 'MI3', name: 'Couscous agneau', category: 'Plats', price: 14.000, available: false, icon: '🍛', description: 'Couscous royal aux légumes de saison' },
  { id: 'MI4', name: 'Makroudh', category: 'Desserts', price: 2.000, available: true, icon: '🍮', description: 'Gâteau aux dattes et eau de fleur d\'oranger' },
  { id: 'MI5', name: 'Citronnade', category: 'Boissons', price: 2.500, available: true, icon: '🍋', description: 'Citronnade fraîche maison' },
];

function MenuItem({ item, onEdit, onToggle }) {
  return (
    <View style={[styles.card, !item.available && styles.cardDim]}>
      <View style={styles.cardMain}>
        <View style={styles.itemIcon}><Text style={{ fontSize: 26 }}>{item.icon}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemCategory}>{item.category}</Text>
          <Text style={styles.itemDesc} numberOfLines={1}>{item.description}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.itemPrice}>{item.price.toFixed(3)}</Text>
          <Text style={styles.itemPriceSub}>TND</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Switch
          value={item.available}
          onValueChange={() => onToggle(item)}
          trackColor={{ false: COLORS.border, true: COLORS.green + '80' }}
          thumbColor={item.available ? COLORS.green : COLORS.muted}
        />
        <Text style={[styles.availableLabel, { color: item.available ? COLORS.green : COLORS.muted }]}>
          {item.available ? 'Disponible' : 'Indisponible'}
        </Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(item)}>
          <Text style={styles.editBtnText}>Éditer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const EMPTY_FORM = { name: '', category: 'Plats', price: '', description: '', icon: '🍽️', available: true };

export default function MerchantMenuScreen({ navigation }) {
  const [items, setItems] = useState(MOCK_ITEMS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tout');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    const matchQ = !q || i.name.toLowerCase().includes(q);
    const matchC = categoryFilter === 'Tout' || i.category === categoryFilter;
    return matchQ && matchC;
  });

  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, category: item.category, price: String(item.price), description: item.description, icon: item.icon, available: item.available });
    setModal(true);
  };

  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };

  const handleToggle = (item) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, available: !i.available } : i));
    api.patch(`/api/merchant/menu/${item.id}/toggle`).catch(() => {});
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) { Alert.alert('Champs requis', 'Nom et prix obligatoires.'); return; }
    setSaving(true);
    const payload = { ...form, price: parseFloat(form.price) || 0 };
    try {
      if (editing) {
        await api.put(`/api/merchant/menu/${editing.id}`, payload);
        setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...payload } : i));
      } else {
        const r = await api.post('/api/merchant/menu', payload);
        setItems(prev => [...prev, r.data.item || { ...payload, id: `MI${Date.now()}` }]);
      }
      setModal(false);
    } catch {
      if (editing) setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...payload } : i));
      else setItems(prev => [...prev, { ...payload, id: `MI${Date.now()}` }]);
      setModal(false);
    } finally { setSaving(false); }
  };

  const handleDelete = (item) => {
    Alert.alert('Supprimer cet article ?', `"${item.name}" sera retiré du menu.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => { setItems(prev => prev.filter(i => i.id !== item.id)); setModal(false); api.delete(`/api/merchant/menu/${item.id}`).catch(() => {}); } },
    ]);
  };

  const available = items.filter(i => i.available).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🍽️ Mon menu</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openNew}>
          <Text style={styles.addBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiItem}><Text style={[styles.kpiVal, { color: COLORS.text }]}>{items.length}</Text><Text style={styles.kpiLabel}>Articles</Text></View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}><Text style={[styles.kpiVal, { color: COLORS.green }]}>{available}</Text><Text style={styles.kpiLabel}>Disponibles</Text></View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}><Text style={[styles.kpiVal, { color: COLORS.muted }]}>{items.length - available}</Text><Text style={styles.kpiLabel}>Indisponibles</Text></View>
      </View>

      <View style={styles.searchRow}>
        <TextInput style={styles.searchInput} placeholder="Chercher..." placeholderTextColor={COLORS.muted} value={search} onChangeText={setSearch} />
      </View>

      <View style={styles.catsRow}>
        {['Tout', ...MOCK_CATEGORIES].map(c => (
          <TouchableOpacity key={c} style={[styles.catBtn, categoryFilter === c && styles.catBtnActive]} onPress={() => setCategoryFilter(c)}>
            <Text style={[styles.catLabel, categoryFilter === c && styles.catLabelActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={({ item }) => <MenuItem item={item} onEdit={openEdit} onToggle={handleToggle} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={{ alignItems: 'center', paddingVertical: 60 }}><Text style={{ fontSize: 40 }}>🍽️</Text><Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucun article</Text></View>}
      />

      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? 'Modifier l\'article' : 'Nouvel article'}</Text>
              <TouchableOpacity onPress={() => setModal(false)}><Text style={{ color: COLORS.muted, fontSize: 20 }}>✕</Text></TouchableOpacity>
            </View>
            {[
              { label: 'NOM', key: 'name', placeholder: 'Tajine poulet' },
              { label: 'PRIX (TND)', key: 'price', placeholder: '12.500', keyboardType: 'decimal-pad' },
              { label: 'DESCRIPTION', key: 'description', placeholder: 'Description courte...' },
              { label: 'ICÔNE EMOJI', key: 'icon', placeholder: '🍽️' },
            ].map(f => (
              <View key={f.key} style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput style={styles.fieldInput} value={form[f.key]} onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))} placeholder={f.placeholder} placeholderTextColor={COLORS.muted} keyboardType={f.keyboardType || 'default'} />
              </View>
            ))}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>CATÉGORIE</Text>
              <View style={styles.catsWrap}>
                {MOCK_CATEGORIES.map(c => (
                  <TouchableOpacity key={c} style={[styles.catChip, form.category === c && styles.catChipActive]} onPress={() => setForm(f => ({ ...f, category: c }))}>
                    <Text style={[styles.catChipText, form.category === c && styles.catChipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.modalActions}>
              {editing && <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(editing)}><Text style={styles.deleteBtnText}>Supprimer</Text></TouchableOpacity>}
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 60 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  addBtn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  addBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },
  kpiRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 12 },
  kpiItem: { flex: 1, alignItems: 'center' },
  kpiVal: { fontSize: 20, fontWeight: '900' },
  kpiLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  kpiDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  searchRow: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  searchInput: { backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border },
  catsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 10, gap: 8, flexWrap: 'nowrap' },
  catBtn: { borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.surface },
  catBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  catLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  catLabelActive: { color: COLORS.accent },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  cardDim: { opacity: 0.55 },
  cardMain: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  itemIcon: { width: 50, height: 50, borderRadius: 12, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  itemName: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  itemCategory: { color: COLORS.accent, fontSize: 11, marginTop: 2 },
  itemDesc: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  itemPrice: { color: COLORS.accent, fontSize: 18, fontWeight: '900' },
  itemPriceSub: { color: COLORS.muted, fontSize: 10 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, gap: 8 },
  availableLabel: { flex: 1, fontSize: 12, fontWeight: '700' },
  editBtn: { backgroundColor: COLORS.accent + '20', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.accent + '50' },
  editBtnText: { color: COLORS.accent, fontSize: 11, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: COLORS.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  fieldRow: { marginBottom: 12 },
  fieldLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', marginBottom: 5, letterSpacing: 0.8 },
  fieldInput: { backgroundColor: COLORS.bg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border },
  catsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.bg },
  catChipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  catChipText: { color: COLORS.muted, fontSize: 12 },
  catChipTextActive: { color: COLORS.accent, fontWeight: '700' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  deleteBtn: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: COLORS.red + '60', paddingVertical: 13, alignItems: 'center' },
  deleteBtnText: { color: COLORS.red, fontSize: 13, fontWeight: '700' },
  saveBtn: { flex: 2, borderRadius: 12, backgroundColor: COLORS.accent, paddingVertical: 13, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
});
