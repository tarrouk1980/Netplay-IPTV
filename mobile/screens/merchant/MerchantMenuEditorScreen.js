import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C',
};

const MOCK_ITEMS = [
  { id: 1, name: 'Pizza Margherita', price: 18.5, category: 'Pizzas', available: true, description: 'Tomate, mozzarella, basilic' },
  { id: 2, name: 'Pizza Reine', price: 22.0, category: 'Pizzas', available: true, description: 'Jambon, champignons, fromage' },
  { id: 3, name: 'Burger Classic', price: 14.0, category: 'Burgers', available: false, description: 'Boeuf, salade, tomate' },
  { id: 4, name: 'Salade César', price: 12.5, category: 'Salades', available: true, description: 'Poulet grillé, parmesan, croûtons' },
  { id: 5, name: 'Tiramisu', price: 7.0, category: 'Desserts', available: true, description: 'Mascarpone, café, cacao' },
];

export default function MerchantMenuEditorScreen({ navigation }) {
  const [items, setItems] = useState(MOCK_ITEMS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [filterCat, setFilterCat] = useState('Tous');

  const categories = ['Tous', ...new Set(items.map(i => i.category))];

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/merchant/menu');
        if (res.data?.items?.length > 0) setItems(res.data.items);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const toggleAvailability = async (item) => {
    setSaving(item.id);
    const newVal = !item.available;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, available: newVal } : i));
    try {
      await api.patch(`/api/merchant/menu/${item.id}`, { available: newVal });
    } catch {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, available: item.available } : i));
      Alert.alert('Erreur', 'Impossible de modifier la disponibilité.');
    } finally { setSaving(null); }
  };

  const savePrice = async (item) => {
    const price = parseFloat(editPrice);
    if (isNaN(price) || price <= 0) { Alert.alert('Prix invalide'); return; }
    setSaving(item.id);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, price } : i));
    setEditingId(null);
    try {
      await api.patch(`/api/merchant/menu/${item.id}`, { price });
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder le prix.');
    } finally { setSaving(null); }
  };

  const deleteItem = (item) => {
    Alert.alert('Supprimer', `Supprimer "${item.name}" du menu ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          setItems(prev => prev.filter(i => i.id !== item.id));
          try { await api.delete(`/api/merchant/menu/${item.id}`); } catch {}
        },
      },
    ]);
  };

  const filtered = filterCat === 'Tous' ? items : items.filter(i => i.category === filterCat);

  const renderItem = ({ item }) => (
    <View style={[styles.card, !item.available && { opacity: 0.6 }]}>
      <View style={styles.cardMain}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDesc} numberOfLines={1}>{item.description}</Text>
          <View style={styles.catBadge}>
            <Text style={styles.catText}>{item.category}</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          {editingId === item.id ? (
            <View style={styles.priceEdit}>
              <TextInput
                style={styles.priceInput}
                value={editPrice}
                onChangeText={setEditPrice}
                keyboardType="decimal-pad"
                autoFocus
              />
              <TouchableOpacity style={styles.saveBtn} onPress={() => savePrice(item)}>
                <Text style={{ color: '#000', fontSize: 10, fontWeight: '800' }}>✓</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => { setEditingId(item.id); setEditPrice(String(item.price)); }}>
              <Text style={styles.itemPrice}>{item.price.toFixed(2)} TND</Text>
              <Text style={{ color: COLORS.accent, fontSize: 9, textAlign: 'right' }}>✎ modifier</Text>
            </TouchableOpacity>
          )}
          <Switch
            value={item.available}
            onValueChange={() => toggleAvailability(item)}
            thumbColor={item.available ? COLORS.green : COLORS.muted}
            trackColor={{ false: COLORS.border, true: COLORS.green + '66' }}
          />
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MerchantAddProduct', { editItem: item })}>
          <Text style={styles.actionBtnText}>✎ Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { borderColor: COLORS.red + '55' }]} onPress={() => deleteItem(item)}>
          <Text style={[styles.actionBtnText, { color: COLORS.red }]}>🗑 Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Éditeur de menu</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('MerchantAddProduct')}>
          <Text style={{ color: '#000', fontWeight: '800', fontSize: 18 }}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.statItem}><Text style={{ color: COLORS.white, fontWeight: '700' }}>{items.length}</Text> articles</Text>
        <Text style={styles.statItem}><Text style={{ color: COLORS.green, fontWeight: '700' }}>{items.filter(i => i.available).length}</Text> disponibles</Text>
        <Text style={styles.statItem}><Text style={{ color: COLORS.red, fontWeight: '700' }}>{items.filter(i => !i.available).length}</Text> indisponibles</Text>
      </View>

      <View style={styles.catRow}>
        {categories.map(c => (
          <TouchableOpacity key={c} style={[styles.catChip, filterCat === c && styles.catChipActive]} onPress={() => setFilterCat(c)}>
            <Text style={[styles.catChipText, filterCat === c && { color: '#000' }]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={filtered}
          keyExtractor={i => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <View style={styles.empty}><Text style={{ fontSize: 40, marginBottom: 10 }}>🍽️</Text><Text style={styles.emptyText}>Aucun article</Text></View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 12, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  statItem: { color: COLORS.muted, fontSize: 12 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 12 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  catChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  catChipText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  cardMain: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  itemName: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  itemDesc: { color: COLORS.muted, fontSize: 11, marginBottom: 6 },
  catBadge: { alignSelf: 'flex-start', backgroundColor: COLORS.accent + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  catText: { color: COLORS.accent, fontSize: 10, fontWeight: '700' },
  cardRight: { alignItems: 'flex-end', gap: 8 },
  itemPrice: { color: COLORS.accent, fontSize: 16, fontWeight: '900' },
  priceEdit: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  priceInput: { backgroundColor: COLORS.surfaceAlt, borderRadius: 8, borderWidth: 1, borderColor: COLORS.accent, paddingHorizontal: 8, paddingVertical: 4, color: COLORS.white, fontSize: 13, width: 70 },
  saveBtn: { backgroundColor: COLORS.accent, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardActions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border },
  actionBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: COLORS.muted, fontSize: 14 },
});
