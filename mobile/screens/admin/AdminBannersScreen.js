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
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', purple: '#9B59B6',
};

const PAGES = ['Accueil', 'Taxi', 'Livraison', 'Épicerie', 'SOS'];
const MOCK_BANNERS = [
  { id: 'B1', title: 'Livraison offerte', subtitle: 'Dès 30 TND de commande', icon: '🚴', color: '#27AE60', page: 'Épicerie', active: true, clicks: 1240 },
  { id: 'B2', title: '-20% sur les fruits', subtitle: "Jusqu'au 10 juin", icon: '🍎', color: '#3498DB', page: 'Épicerie', active: true, clicks: 876 },
  { id: 'B3', title: 'SOS prioritaire', subtitle: 'Intervention < 15 min', icon: '🔧', color: '#E74C3C', page: 'SOS', active: false, clicks: 432 },
  { id: 'B4', title: 'Taxi offert', subtitle: '1ère course gratuite', icon: '🚕', color: '#F5A623', page: 'Taxi', active: true, clicks: 2100 },
  { id: 'B5', title: 'Nouveau : Bio', subtitle: 'Produits bio locaux', icon: '🌱', color: '#9B59B6', page: 'Accueil', active: true, clicks: 654 },
];

function BannerCard({ item, onEdit, onToggle }) {
  return (
    <View style={[styles.card, !item.active && styles.cardDim]}>
      <View style={[styles.bannerPreview, { backgroundColor: item.color + '20', borderColor: item.color + '40' }]}>
        <Text style={{ fontSize: 30 }}>{item.icon}</Text>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.previewTitle, { color: item.color }]}>{item.title}</Text>
          <Text style={styles.previewSub}>{item.subtitle}</Text>
        </View>
      </View>
      <View style={styles.cardMeta}>
        <View style={styles.metaLeft}>
          <Text style={styles.metaPage}>📱 {item.page}</Text>
          <Text style={styles.metaClicks}>👆 {item.clicks.toLocaleString()} clics</Text>
        </View>
        <View style={styles.metaRight}>
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
    </View>
  );
}

const COLOR_PRESETS = ['#27AE60', '#3498DB', '#E74C3C', '#F5A623', '#9B59B6', '#E67E22', '#1ABC9C'];

export default function AdminBannersScreen({ navigation }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', icon: '🎁', color: '#3498DB', page: 'Accueil' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/admin/banners')
      .then(r => setBanners(r.data.banners || MOCK_BANNERS))
      .catch(() => setBanners(MOCK_BANNERS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (item) => {
    setEditing(item);
    setForm({ title: item.title, subtitle: item.subtitle, icon: item.icon, color: item.color, page: item.page });
    setModal(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', subtitle: '', icon: '🎁', color: '#3498DB', page: 'Accueil' });
    setModal(true);
  };

  const handleToggle = (item) => {
    setBanners(prev => prev.map(b => b.id === item.id ? { ...b, active: !b.active } : b));
    api.patch(`/api/admin/banners/${item.id}/toggle`).catch(() => {});
  };

  const handleSave = async () => {
    if (!form.title.trim()) { Alert.alert('Erreur', 'Titre requis.'); return; }
    setSaving(true);
    const payload = { ...form };
    try {
      if (editing) {
        await api.put(`/api/admin/banners/${editing.id}`, payload);
        setBanners(prev => prev.map(b => b.id === editing.id ? { ...b, ...payload } : b));
      } else {
        const r = await api.post('/api/admin/banners', payload);
        setBanners(prev => [...prev, r.data.banner || { ...payload, id: `B${Date.now()}`, active: true, clicks: 0 }]);
      }
      setModal(false);
    } catch {
      if (editing) setBanners(prev => prev.map(b => b.id === editing.id ? { ...b, ...payload } : b));
      else setBanners(prev => [...prev, { ...payload, id: `B${Date.now()}`, active: true, clicks: 0 }]);
      setModal(false);
    } finally { setSaving(false); }
  };

  const handleDelete = (item) => {
    Alert.alert('Supprimer ?', `"${item.title}" sera supprimée.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: () => {
          setBanners(prev => prev.filter(b => b.id !== item.id));
          setModal(false);
          api.delete(`/api/admin/banners/${item.id}`).catch(() => {});
        },
      },
    ]);
  };

  const activeCount = banners.filter(b => b.active).length;
  const totalClicks = banners.reduce((s, b) => s + b.clicks, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🖼️ Bannières promo</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openNew}>
          <Text style={styles.addBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiVal, { color: COLORS.green }]}>{activeCount}</Text>
          <Text style={styles.kpiLabel}>Actives</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiVal, { color: COLORS.muted }]}>{banners.length - activeCount}</Text>
          <Text style={styles.kpiLabel}>Inactives</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiVal, { color: COLORS.accent }]}>{(totalClicks / 1000).toFixed(1)}k</Text>
          <Text style={styles.kpiLabel}>Clics total</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={banners}
          keyExtractor={b => b.id}
          renderItem={({ item }) => <BannerCard item={item} onEdit={openEdit} onToggle={handleToggle} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 40 }}>🖼️</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucune bannière</Text>
            </View>
          }
        />
      )}

      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? 'Modifier la bannière' : 'Nouvelle bannière'}</Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Text style={{ color: COLORS.muted, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {[
              { label: 'Titre', key: 'title', placeholder: 'Ex: Livraison offerte' },
              { label: 'Sous-titre', key: 'subtitle', placeholder: 'Ex: Dès 30 TND' },
              { label: 'Icône (emoji)', key: 'icon', placeholder: '🎁' },
            ].map(f => (
              <View key={f.key} style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={form[f.key]}
                  onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                  placeholder={f.placeholder}
                  placeholderTextColor={COLORS.muted}
                />
              </View>
            ))}

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Page cible</Text>
              <View style={styles.pagesRow}>
                {PAGES.map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.pageBtn, form.page === p && styles.pageBtnActive]}
                    onPress={() => setForm(f => ({ ...f, page: p }))}
                  >
                    <Text style={[styles.pageLabel, form.page === p && styles.pageLabelActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Couleur</Text>
              <View style={styles.colorsRow}>
                {COLOR_PRESETS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorDot, { backgroundColor: c }, form.color === c && styles.colorDotActive]}
                    onPress={() => setForm(f => ({ ...f, color: c }))}
                  />
                ))}
              </View>
            </View>

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
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  addBtn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  addBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },
  kpiRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    paddingVertical: 12,
  },
  kpiItem: { flex: 1, alignItems: 'center' },
  kpiVal: { fontSize: 20, fontWeight: '900' },
  kpiLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  kpiDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  cardDim: { opacity: 0.5 },
  bannerPreview: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 12,
    padding: 14, marginBottom: 10, borderWidth: 1,
  },
  previewTitle: { fontSize: 14, fontWeight: '800' },
  previewSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaLeft: { gap: 4 },
  metaPage: { color: COLORS.muted, fontSize: 12 },
  metaClicks: { color: COLORS.muted, fontSize: 12 },
  metaRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  editBtn: {
    backgroundColor: COLORS.accent + '20', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.accent + '50',
  },
  editBtnText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderWidth: 1, borderColor: COLORS.border,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  fieldRow: { marginBottom: 12 },
  fieldLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', marginBottom: 5, letterSpacing: 0.8 },
  fieldInput: {
    backgroundColor: COLORS.bg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  pagesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pageBtn: {
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.bg,
  },
  pageBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  pageLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  pageLabelActive: { color: COLORS.accent },
  colorsRow: { flexDirection: 'row', gap: 10 },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotActive: { borderWidth: 3, borderColor: COLORS.text },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  deleteBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1, borderColor: COLORS.red + '60',
    paddingVertical: 13, alignItems: 'center',
  },
  deleteBtnText: { color: COLORS.red, fontSize: 13, fontWeight: '700' },
  saveBtn: { flex: 2, borderRadius: 12, backgroundColor: COLORS.accent, paddingVertical: 13, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
});
