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

const DEMAND_COLOR = { HIGH: COLORS.red, MEDIUM: COLORS.orange, LOW: COLORS.green };
const DEMAND_LABEL = { HIGH: '🔥 Forte demande', MEDIUM: '📊 Demande modérée', LOW: '✅ Calme' };

const MOCK_ZONES = [
  { id: 'Z1', name: 'Tunis Centre', city: 'Tunis', active: true, demand: 'HIGH', drivers: 12, surgeMultiplier: 1.3, lat: 36.806, lng: 10.181 },
  { id: 'Z2', name: 'Berges du Lac', city: 'Tunis', active: true, demand: 'MEDIUM', drivers: 8, surgeMultiplier: 1.0, lat: 36.844, lng: 10.228 },
  { id: 'Z3', name: 'La Marsa', city: 'Tunis', active: true, demand: 'LOW', drivers: 4, surgeMultiplier: 1.0, lat: 36.878, lng: 10.323 },
  { id: 'Z4', name: 'Ariana Ville', city: 'Ariana', active: true, demand: 'HIGH', drivers: 10, surgeMultiplier: 1.2, lat: 36.862, lng: 10.194 },
  { id: 'Z5', name: 'Ben Arous', city: 'Ben Arous', active: false, demand: 'LOW', drivers: 2, surgeMultiplier: 1.0, lat: 36.748, lng: 10.223 },
  { id: 'Z6', name: 'Sfax Centre', city: 'Sfax', active: true, demand: 'MEDIUM', drivers: 6, surgeMultiplier: 1.1, lat: 34.740, lng: 10.760 },
];

function ZoneCard({ item, onEdit, onToggle }) {
  const dColor = DEMAND_COLOR[item.demand];
  return (
    <View style={[styles.card, !item.active && styles.cardDim]}>
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <View style={[styles.zoneIcon, { backgroundColor: dColor + '20' }]}>
            <Text style={{ fontSize: 22 }}>📍</Text>
          </View>
          <View>
            <Text style={styles.zoneName}>{item.name}</Text>
            <Text style={styles.zoneCity}>{item.city}</Text>
          </View>
        </View>
        <Switch
          value={item.active}
          onValueChange={() => onToggle(item)}
          trackColor={{ false: COLORS.border, true: COLORS.green + '80' }}
          thumbColor={item.active ? COLORS.green : COLORS.muted}
        />
      </View>

      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Text style={styles.statVal}>{item.drivers}</Text>
          <Text style={styles.statLabel}>Chauffeurs</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: item.surgeMultiplier > 1 ? COLORS.accent : COLORS.green }]}>
            x{item.surgeMultiplier.toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>Surge</Text>
        </View>
        <View style={[styles.demandBadge, { backgroundColor: dColor + '20', borderColor: dColor + '40' }]}>
          <Text style={[styles.demandText, { color: dColor }]}>{DEMAND_LABEL[item.demand]}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.editRow} onPress={() => onEdit(item)}>
        <Text style={styles.editText}>⚙️ Configurer la zone</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AdminZonesScreen({ navigation }) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', city: '', surgeMultiplier: '1.0' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/admin/zones')
      .then(r => setZones(r.data.zones || MOCK_ZONES))
      .catch(() => setZones(MOCK_ZONES))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (zone) => {
    setEditing(zone);
    setForm({ name: zone.name, city: zone.city, surgeMultiplier: String(zone.surgeMultiplier) });
    setModal(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', city: '', surgeMultiplier: '1.0' });
    setModal(true);
  };

  const handleToggle = async (zone) => {
    setZones(prev => prev.map(z => z.id === zone.id ? { ...z, active: !z.active } : z));
    api.patch(`/api/admin/zones/${zone.id}/toggle`).catch(() => {});
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.city.trim()) {
      Alert.alert('Erreur', 'Nom et ville requis.');
      return;
    }
    setSaving(true);
    const payload = { name: form.name.trim(), city: form.city.trim(), surgeMultiplier: parseFloat(form.surgeMultiplier) || 1.0 };
    try {
      if (editing) {
        await api.put(`/api/admin/zones/${editing.id}`, payload);
        setZones(prev => prev.map(z => z.id === editing.id ? { ...z, ...payload } : z));
      } else {
        const r = await api.post('/api/admin/zones', payload);
        setZones(prev => [...prev, r.data.zone || { ...payload, id: `Z${Date.now()}`, active: true, demand: 'LOW', drivers: 0 }]);
      }
      setModal(false);
    } catch {
      if (editing) setZones(prev => prev.map(z => z.id === editing.id ? { ...z, ...payload } : z));
      setModal(false);
    } finally { setSaving(false); }
  };

  const handleDelete = (zone) => {
    Alert.alert('Supprimer la zone ?', `"${zone.name}" sera supprimée.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          setZones(prev => prev.filter(z => z.id !== zone.id));
          setModal(false);
          api.delete(`/api/admin/zones/${zone.id}`).catch(() => {});
        },
      },
    ]);
  };

  const activeCount = zones.filter(z => z.active).length;
  const highDemand = zones.filter(z => z.demand === 'HIGH' && z.active).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📍 Zones de service</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openNew}>
          <Text style={styles.addBtnText}>+ Zone</Text>
        </TouchableOpacity>
      </View>

      {/* Summary strip */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: COLORS.green }]}>{activeCount}</Text>
          <Text style={styles.summaryLabel}>Actives</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: COLORS.muted }]}>{zones.length - activeCount}</Text>
          <Text style={styles.summaryLabel}>Inactives</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: COLORS.red }]}>{highDemand}</Text>
          <Text style={styles.summaryLabel}>Forte dem.</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: COLORS.text }]}>{zones.reduce((s, z) => s + z.drivers, 0)}</Text>
          <Text style={styles.summaryLabel}>Chauffeurs</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={zones}
          keyExtractor={z => z.id}
          renderItem={({ item }) => <ZoneCard item={item} onEdit={openEdit} onToggle={handleToggle} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 40 }}>🗺️</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucune zone configurée</Text>
            </View>
          }
        />
      )}

      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? 'Modifier la zone' : 'Nouvelle zone'}</Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Text style={{ color: COLORS.muted, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {[
              { label: 'Nom de la zone', key: 'name', placeholder: 'Ex: Tunis Centre' },
              { label: 'Ville', key: 'city', placeholder: 'Ex: Tunis' },
              { label: 'Multiplicateur surge (ex: 1.2)', key: 'surgeMultiplier', placeholder: '1.0', keyboardType: 'numeric' },
            ].map(f => (
              <View key={f.key} style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={form[f.key]}
                  onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                  placeholder={f.placeholder}
                  placeholderTextColor={COLORS.muted}
                  keyboardType={f.keyboardType || 'default'}
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
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  addBtn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  addBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },
  summaryRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    paddingVertical: 12,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: 20, fontWeight: '900' },
  summaryLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  summaryDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  cardDim: { opacity: 0.5 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  zoneIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  zoneName: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  zoneCity: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  cardStats: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  statItem: { alignItems: 'center', minWidth: 48 },
  statVal: { color: COLORS.text, fontSize: 16, fontWeight: '900' },
  statLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', marginTop: 1 },
  demandBadge: { flex: 1, borderRadius: 8, borderWidth: 1, paddingVertical: 5, alignItems: 'center' },
  demandText: { fontSize: 11, fontWeight: '700' },
  editRow: {
    borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingTop: 10, alignItems: 'center',
  },
  editText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
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
