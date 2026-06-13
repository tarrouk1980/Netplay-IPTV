import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
  Alert, TextInput, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api';

type ProductEdit = {
  price: string;
  stock: string;
  promoPrice: string;
};

export default function SellerInventoryScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [edits, setEdits] = useState<Record<string, ProductEdit>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.get('/vendors/products')
      .then(r => {
        const data: any[] = r.data?.data || [];
        setProducts(data);
        const init: Record<string, ProductEdit> = {};
        data.forEach(p => {
          init[p.id] = {
            price: String(p.price ?? ''),
            stock: String(p.stock ?? 0),
            promoPrice: p.promoPrice != null ? String(p.promoPrice) : '',
          };
        });
        setEdits(init);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const setField = (id: string, field: keyof ProductEdit, value: string) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const saveProduct = async (p: any) => {
    const e = edits[p.id];
    setSaving(p.id);
    try {
      await api.patch(`/products/${p.id}`, {
        price: parseFloat(e.price) || p.price,
        stock: parseInt(e.stock) || 0,
        promoPrice: e.promoPrice ? parseFloat(e.promoPrice) : null,
      });
      setProducts(prev => prev.map(x => x.id === p.id
        ? { ...x, price: parseFloat(e.price), stock: parseInt(e.stock), promoPrice: e.promoPrice ? parseFloat(e.promoPrice) : null }
        : x
      ));
      Alert.alert('✅', 'Produit mis à jour');
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder');
    } finally {
      setSaving(null);
    }
  };

  const toggleActive = async (p: any) => {
    try {
      await api.patch(`/products/${p.id}/toggle-active`);
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, isActive: !x.isActive } : x));
    } catch {
      Alert.alert('Erreur', 'Impossible de modifier');
    }
  };

  const isDirty = (p: any) => {
    const e = edits[p.id];
    if (!e) return false;
    return (
      parseFloat(e.price) !== p.price ||
      parseInt(e.stock) !== (p.stock ?? 0) ||
      (e.promoPrice ? parseFloat(e.promoPrice) : null) !== (p.promoPrice ?? null)
    );
  };

  if (loading) return (
    <View style={s.center}><ActivityIndicator size="large" color="#9f1239" /></View>
  );

  return (
    <FlatList
      data={products}
      keyExtractor={p => p.id}
      contentContainerStyle={s.list}
      ListHeaderComponent={
        <Text style={s.header}>{products.length} produit{products.length !== 1 ? 's' : ''}</Text>
      }
      renderItem={({ item: p }) => {
        const e = edits[p.id] || { price: '', stock: '', promoPrice: '' };
        const lowStock = p.stock > 0 && p.stock <= (p.stockAlert || 5);
        const outOfStock = p.stock === 0;
        return (
          <View style={s.card}>
            <View style={s.cardTop}>
              {p.images?.[0] ? (
                <Image source={{ uri: p.images[0] }} style={s.img} />
              ) : (
                <View style={[s.img, s.imgPlaceholder]}>
                  <Text style={{ fontSize: 22 }}>📦</Text>
                </View>
              )}
              <View style={s.cardInfo}>
                <Text style={s.title} numberOfLines={2}>{p.title}</Text>
                <View style={s.badgeRow}>
                  <TouchableOpacity onPress={() => toggleActive(p)}
                    style={[s.statusBadge, p.isActive ? s.badgeActive : s.badgeInactive]}>
                    <Text style={[s.badgeText, { color: p.isActive ? '#15803d' : '#94a3b8' }]}>
                      {p.isActive ? '● Actif' : '○ Inactif'}
                    </Text>
                  </TouchableOpacity>
                  {outOfStock && <View style={s.badgeRed}><Text style={s.badgeRedText}>Épuisé</Text></View>}
                  {lowStock && !outOfStock && <View style={s.badgeOrange}><Text style={s.badgeOrangeText}>Stock bas</Text></View>}
                </View>
              </View>
            </View>

            <View style={s.fieldsRow}>
              <View style={s.field}>
                <Text style={s.fieldLabel}>Prix</Text>
                <TextInput value={e.price} onChangeText={v => setField(p.id, 'price', v)}
                  keyboardType="numeric" style={s.input} />
              </View>
              <View style={s.field}>
                <Text style={s.fieldLabel}>Promo</Text>
                <TextInput value={e.promoPrice} onChangeText={v => setField(p.id, 'promoPrice', v)}
                  keyboardType="numeric" style={s.input} placeholder="—" />
              </View>
              <View style={s.field}>
                <Text style={s.fieldLabel}>Stock</Text>
                <TextInput value={e.stock} onChangeText={v => setField(p.id, 'stock', v)}
                  keyboardType="numeric" style={[s.input, outOfStock ? s.inputRed : lowStock ? s.inputOrange : {}]} />
              </View>
            </View>

            {isDirty(p) && (
              <TouchableOpacity onPress={() => saveProduct(p)} disabled={saving === p.id}
                style={s.saveBtn}>
                <Text style={s.saveBtnText}>
                  {saving === p.id ? 'Sauvegarde...' : '✓ Sauvegarder'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, gap: 12 },
  header: { fontSize: 14, fontWeight: '700', color: '#64748b', marginBottom: 4 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  cardTop: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  img: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#f1f5f9' },
  imgPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100, borderWidth: 1 },
  badgeActive: { borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' },
  badgeInactive: { borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeRed: { backgroundColor: '#fee2e2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 100 },
  badgeRedText: { fontSize: 10, fontWeight: '700', color: '#991b1b' },
  badgeOrange: { backgroundColor: '#ffedd5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 100 },
  badgeOrangeText: { fontSize: 10, fontWeight: '700', color: '#9a3412' },
  fieldsRow: { flexDirection: 'row', gap: 8 },
  field: { flex: 1 },
  fieldLabel: { fontSize: 10, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
  input: { borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, color: '#1e293b' },
  inputRed: { borderColor: '#fca5a5' },
  inputOrange: { borderColor: '#fed7aa' },
  saveBtn: { marginTop: 10, backgroundColor: '#9f1239', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
