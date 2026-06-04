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
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const ROLES = ['Gérant', 'Caissier', 'Livreur', 'Cuisinier', 'Accueil'];
const MOCK_STAFF = [
  { id: 'S1', name: 'Karim Ben Ali',  role: 'Gérant',   phone: '+21698001001', active: true,  since: 'Jan 2024' },
  { id: 'S2', name: 'Sana Trabelsi',  role: 'Caissier',  phone: '+21625002002', active: true,  since: 'Mar 2024' },
  { id: 'S3', name: 'Nabil Riahi',    role: 'Livreur',   phone: '+21655003003', active: false, since: 'Jun 2024' },
  { id: 'S4', name: 'Rim Hamdi',      role: 'Cuisinier', phone: '+21621004004', active: true,  since: 'Feb 2025' },
];

const ROLE_ICON = { Gérant: '👑', Caissier: '💵', Livreur: '🛵', Cuisinier: '👨‍🍳', Accueil: '🤝' };

function StaffCard({ item, onEdit, onToggle }) {
  return (
    <View style={[styles.card, !item.active && styles.cardDim]}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 24 }}>{ROLE_ICON[item.role] || '👤'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.staffName}>{item.name}</Text>
          <Text style={styles.staffRole}>{item.role}</Text>
          <Text style={styles.staffPhone}>{item.phone}</Text>
        </View>
        <View style={styles.cardActions}>
          <Switch
            value={item.active}
            onValueChange={() => onToggle(item)}
            trackColor={{ false: COLORS.border, true: COLORS.green + '80' }}
            thumbColor={item.active ? COLORS.green : COLORS.muted}
          />
          <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(item)}>
            <Text style={styles.editBtnText}>Éditer</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.staffSince}>Depuis {item.since}</Text>
    </View>
  );
}

export default function MerchantStaffScreen({ navigation }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', role: 'Caissier', phone: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/merchant/staff')
      .then(r => setStaff(r.data.staff || MOCK_STAFF))
      .catch(() => setStaff(MOCK_STAFF))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (item) => { setEditing(item); setForm({ name: item.name, role: item.role, phone: item.phone }); setModal(true); };
  const openNew = () => { setEditing(null); setForm({ name: '', role: 'Caissier', phone: '' }); setModal(true); };

  const handleToggle = (item) => {
    setStaff(prev => prev.map(s => s.id === item.id ? { ...s, active: !s.active } : s));
    api.patch(`/api/merchant/staff/${item.id}/toggle`).catch(() => {});
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) { Alert.alert('Champs requis', 'Nom et téléphone obligatoires.'); return; }
    setSaving(true);
    const payload = { ...form };
    try {
      if (editing) {
        await api.put(`/api/merchant/staff/${editing.id}`, payload);
        setStaff(prev => prev.map(s => s.id === editing.id ? { ...s, ...payload } : s));
      } else {
        const r = await api.post('/api/merchant/staff', payload);
        setStaff(prev => [...prev, r.data.staff || { ...payload, id: `S${Date.now()}`, active: true, since: 'Aujourd\'hui' }]);
      }
      setModal(false);
    } catch {
      if (editing) setStaff(prev => prev.map(s => s.id === editing.id ? { ...s, ...payload } : s));
      else setStaff(prev => [...prev, { ...payload, id: `S${Date.now()}`, active: true, since: 'Aujourd\'hui' }]);
      setModal(false);
    } finally { setSaving(false); }
  };

  const handleDelete = (item) => {
    Alert.alert('Retirer ce membre ?', `"${item.name}" sera retiré de l'équipe.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Retirer', style: 'destructive', onPress: () => { setStaff(prev => prev.filter(s => s.id !== item.id)); setModal(false); api.delete(`/api/merchant/staff/${item.id}`).catch(() => {}); } },
    ]);
  };

  const active = staff.filter(s => s.active).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👥 Mon équipe</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openNew}>
          <Text style={styles.addBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiItem}><Text style={[styles.kpiVal, { color: COLORS.green }]}>{active}</Text><Text style={styles.kpiLabel}>Actifs</Text></View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}><Text style={[styles.kpiVal, { color: COLORS.text }]}>{staff.length}</Text><Text style={styles.kpiLabel}>Total</Text></View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}><Text style={[styles.kpiVal, { color: COLORS.muted }]}>{staff.length - active}</Text><Text style={styles.kpiLabel}>Inactifs</Text></View>
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : (
        <FlatList
          data={staff}
          keyExtractor={s => s.id}
          renderItem={({ item }) => <StaffCard item={item} onEdit={openEdit} onToggle={handleToggle} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<View style={{ alignItems: 'center', paddingVertical: 60 }}><Text style={{ fontSize: 40 }}>👥</Text><Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucun membre</Text></View>}
        />
      )}

      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? 'Modifier le membre' : 'Nouveau membre'}</Text>
              <TouchableOpacity onPress={() => setModal(false)}><Text style={{ color: COLORS.muted, fontSize: 20 }}>✕</Text></TouchableOpacity>
            </View>
            {[{ label: 'NOM COMPLET', key: 'name', placeholder: 'Karim Ben Ali' }, { label: 'TÉLÉPHONE', key: 'phone', placeholder: '+216 XX XXX XXX', keyboardType: 'phone-pad' }].map(f => (
              <View key={f.key} style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput style={styles.fieldInput} value={form[f.key]} onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))} placeholder={f.placeholder} placeholderTextColor={COLORS.muted} keyboardType={f.keyboardType || 'default'} />
              </View>
            ))}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>RÔLE</Text>
              <View style={styles.rolesRow}>
                {ROLES.map(r => (
                  <TouchableOpacity key={r} style={[styles.roleBtn, form.role === r && styles.roleBtnActive]} onPress={() => setForm(f => ({ ...f, role: r }))}>
                    <Text style={{ fontSize: 16 }}>{ROLE_ICON[r]}</Text>
                    <Text style={[styles.roleLabel, form.role === r && styles.roleLabelActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.modalActions}>
              {editing && <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(editing)}><Text style={styles.deleteBtnText}>Retirer</Text></TouchableOpacity>}
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
  cardDim: { opacity: 0.5 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  staffName: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  staffRole: { color: COLORS.accent, fontSize: 12, marginTop: 1 },
  staffPhone: { color: COLORS.muted, fontSize: 11, marginTop: 1 },
  cardActions: { alignItems: 'center', gap: 6 },
  editBtn: { backgroundColor: COLORS.accent + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.accent + '50' },
  editBtnText: { color: COLORS.accent, fontSize: 11, fontWeight: '700' },
  staffSince: { color: COLORS.muted, fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: COLORS.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  fieldRow: { marginBottom: 12 },
  fieldLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', marginBottom: 5, letterSpacing: 0.8 },
  fieldInput: { backgroundColor: COLORS.bg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border },
  rolesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleBtn: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, gap: 3 },
  roleBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  roleLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600' },
  roleLabelActive: { color: COLORS.accent },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  deleteBtn: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: COLORS.red + '60', paddingVertical: 13, alignItems: 'center' },
  deleteBtnText: { color: COLORS.red, fontSize: 13, fontWeight: '700' },
  saveBtn: { flex: 2, borderRadius: 12, backgroundColor: COLORS.accent, paddingVertical: 13, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
});
