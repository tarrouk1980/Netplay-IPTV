import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Modal, TextInput, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const TYPE_LABEL = { PERCENT: '% Remise', FIXED: 'TND fixe', FREE_DELIVERY: 'Livraison gratuite' };
const TYPE_ICON  = { PERCENT: '🏷️', FIXED: '💵', FREE_DELIVERY: '🚴' };

const MOCK_COUPONS = [
  { id: 'C1', code: 'RAMADAN20', type: 'PERCENT', value: 20, minOrder: 15, uses: 84, maxUses: 200, active: true, expiry: '30/06/2025' },
  { id: 'C2', code: 'BIENVENUE5', type: 'FIXED', value: 5, minOrder: 20, uses: 12, maxUses: 50, active: true, expiry: '31/12/2025' },
  { id: 'C3', code: 'LIVRGRATUITE', type: 'FREE_DELIVERY', value: 0, minOrder: 30, uses: 33, maxUses: 100, active: false, expiry: '15/06/2025' },
  { id: 'C4', code: 'ETE10', type: 'PERCENT', value: 10, minOrder: 10, uses: 200, maxUses: 200, active: false, expiry: '01/09/2025' },
];

function CouponCard({ item, onEdit, onToggle }) {
  const usagePercent = Math.min((item.uses / item.maxUses) * 100, 100);
  const exhausted = item.uses >= item.maxUses;
  return (
    <View style={[styles.card, !item.active && styles.cardDim]}>
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={{ fontSize: 24 }}>{TYPE_ICON[item.type]}</Text>
          <View>
            <Text style={styles.couponCode}>{item.code}</Text>
            <Text style={styles.couponType}>{TYPE_LABEL[item.type]}{item.type !== 'FREE_DELIVERY' ? ` · ${item.value}${item.type === 'PERCENT' ? '%' : ' TND'}` : ''}</Text>
          </View>
        </View>
        <Switch
          value={item.active && !exhausted}
          onValueChange={() => !exhausted && onToggle(item)}
          trackColor={{ false: COLORS.border, true: COLORS.green + '80' }}
          thumbColor={item.active && !exhausted ? COLORS.green : COLORS.muted}
          disabled={exhausted}
        />
      </View>
      <View style={styles.usageRow}>
        <View style={styles.usageBar}>
          <View style={[styles.usageFill, { width: `${usagePercent}%`, backgroundColor: exhausted ? COLORS.red : COLORS.green }]} />
        </View>
        <Text style={[styles.usageText, exhausted && { color: COLORS.red }]}>{item.uses}/{item.maxUses}</Text>
      </View>
      <View style={styles.cardMeta}>
        <Text style={styles.metaItem}>🛒 Min. {item.minOrder} TND</Text>
        <Text style={styles.metaItem}>📅 Exp. {item.expiry}</Text>
        {exhausted && <Text style={[styles.metaItem, { color: COLORS.red }]}>⚠️ Épuisé</Text>}
      </View>
      <TouchableOpacity style={styles.editRow} onPress={() => onEdit(item)}>
        <Text style={styles.editText}>⚙️ Modifier</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function MerchantCouponsScreen({ navigation }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code: '', type: 'PERCENT', value: '', minOrder: '', maxUses: '', expiry: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/merchant/coupons')
      .then(r => setCoupons(r.data.coupons || MOCK_COUPONS))
      .catch(() => setCoupons(MOCK_COUPONS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (item) => {
    setEditing(item);
    setForm({ code: item.code, type: item.type, value: String(item.value), minOrder: String(item.minOrder), maxUses: String(item.maxUses), expiry: item.expiry });
    setModal(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ code: '', type: 'PERCENT', value: '', minOrder: '', maxUses: '', expiry: '' });
    setModal(true);
  };

  const handleToggle = (item) => {
    setCoupons(prev => prev.map(c => c.id === item.id ? { ...c, active: !c.active } : c));
    api.patch(`/api/merchant/coupons/${item.id}/toggle`).catch(() => {});
  };

  const handleSave = async () => {
    if (!form.code.trim()) { Alert.alert('Erreur', 'Code requis.'); return; }
    setSaving(true);
    const payload = { ...form, value: parseFloat(form.value) || 0, minOrder: parseFloat(form.minOrder) || 0, maxUses: parseInt(form.maxUses) || 100 };
    try {
      if (editing) {
        await api.put(`/api/merchant/coupons/${editing.id}`, payload);
        setCoupons(prev => prev.map(c => c.id === editing.id ? { ...c, ...payload } : c));
      } else {
        const r = await api.post('/api/merchant/coupons', payload);
        setCoupons(prev => [...prev, r.data.coupon || { ...payload, id: `C${Date.now()}`, uses: 0, active: true }]);
      }
      setModal(false);
    } catch {
      if (editing) setCoupons(prev => prev.map(c => c.id === editing.id ? { ...c, ...payload } : c));
      else setCoupons(prev => [...prev, { ...payload, id: `C${Date.now()}`, uses: 0, active: true }]);
      setModal(false);
    } finally { setSaving(false); }
  };

  const handleDelete = (item) => {
    Alert.alert('Supprimer ?', `Supprimer le code "${item.code}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => { setCoupons(prev => prev.filter(c => c.id !== item.id)); setModal(false); api.delete(`/api/merchant/coupons/${item.id}`).catch(() => {}); } },
    ]);
  };

  const active = coupons.filter(c => c.active).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏷️ Codes promo</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openNew}>
          <Text style={styles.addBtnText}>+ Créer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiVal, { color: COLORS.green }]}>{active}</Text>
          <Text style={styles.kpiLabel}>Actifs</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiVal, { color: COLORS.text }]}>{coupons.length}</Text>
          <Text style={styles.kpiLabel}>Total</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiVal, { color: COLORS.accent }]}>{coupons.reduce((s, c) => s + c.uses, 0)}</Text>
          <Text style={styles.kpiLabel}>Utilisations</Text>
        </View>
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : (
        <FlatList
          data={coupons}
          keyExtractor={c => c.id}
          renderItem={({ item }) => <CouponCard item={item} onEdit={openEdit} onToggle={handleToggle} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<View style={{ alignItems: 'center', paddingVertical: 60 }}><Text style={{ fontSize: 40 }}>🏷️</Text><Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucun code promo</Text></View>}
        />
      )}

      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? 'Modifier le code' : 'Nouveau code promo'}</Text>
              <TouchableOpacity onPress={() => setModal(false)}><Text style={{ color: COLORS.muted, fontSize: 20 }}>✕</Text></TouchableOpacity>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>CODE</Text>
              <TextInput style={styles.fieldInput} value={form.code} onChangeText={v => setForm(f => ({ ...f, code: v.toUpperCase() }))} placeholder="EX: PROMO20" placeholderTextColor={COLORS.muted} autoCapitalize="characters" />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>TYPE</Text>
              <View style={styles.typeRow}>
                {['PERCENT', 'FIXED', 'FREE_DELIVERY'].map(t => (
                  <TouchableOpacity key={t} style={[styles.typeBtn, form.type === t && styles.typeBtnActive]} onPress={() => setForm(f => ({ ...f, type: t }))}>
                    <Text style={[styles.typeLabel, form.type === t && styles.typeLabelActive]}>{TYPE_ICON[t]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {form.type !== 'FREE_DELIVERY' && (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{form.type === 'PERCENT' ? 'REMISE (%)' : 'MONTANT (TND)'}</Text>
                <TextInput style={styles.fieldInput} value={form.value} onChangeText={v => setForm(f => ({ ...f, value: v }))} placeholder="0" placeholderTextColor={COLORS.muted} keyboardType="numeric" />
              </View>
            )}
            {[{ label: 'COMMANDE MINIMUM (TND)', key: 'minOrder', placeholder: '0' }, { label: 'MAX UTILISATIONS', key: 'maxUses', placeholder: '100' }, { label: 'DATE D\'EXPIRATION', key: 'expiry', placeholder: 'JJ/MM/AAAA' }].map(f => (
              <View key={f.key} style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput style={styles.fieldInput} value={form[f.key]} onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))} placeholder={f.placeholder} placeholderTextColor={COLORS.muted} keyboardType={f.key === 'expiry' ? 'default' : 'numeric'} />
              </View>
            ))}
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
  card: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  cardDim: { opacity: 0.55 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  couponCode: { color: COLORS.text, fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
  couponType: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  usageRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  usageBar: { flex: 1, height: 5, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  usageFill: { height: '100%', borderRadius: 3 },
  usageText: { color: COLORS.muted, fontSize: 11, fontWeight: '700' },
  cardMeta: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginBottom: 10 },
  metaItem: { color: COLORS.muted, fontSize: 11 },
  editRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, alignItems: 'center' },
  editText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: COLORS.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  fieldRow: { marginBottom: 12 },
  fieldLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', marginBottom: 5, letterSpacing: 0.8 },
  fieldInput: { backgroundColor: COLORS.bg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  typeBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '20' },
  typeLabel: { fontSize: 20 },
  typeLabelActive: {},
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  deleteBtn: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: COLORS.red + '60', paddingVertical: 13, alignItems: 'center' },
  deleteBtnText: { color: COLORS.red, fontSize: 13, fontWeight: '700' },
  saveBtn: { flex: 2, borderRadius: 12, backgroundColor: COLORS.accent, paddingVertical: 13, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
});
