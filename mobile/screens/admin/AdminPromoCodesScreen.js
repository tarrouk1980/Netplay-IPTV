import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert, TextInput, Modal, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const MOCK_PROMOS = [
  { id: 'P1', code: 'WELCOME20', type: 'PERCENT', value: 20, service: 'ALL', usageCount: 312, maxUsage: 500, active: true, expiresAt: '2025-12-31' },
  { id: 'P2', code: 'TAXI5TND', type: 'FIXED', value: 5, service: 'TAXI', usageCount: 88, maxUsage: 200, active: true, expiresAt: '2025-07-31' },
  { id: 'P3', code: 'SOS15', type: 'PERCENT', value: 15, service: 'SOS', usageCount: 45, maxUsage: 100, active: false, expiresAt: '2025-06-30' },
  { id: 'P4', code: 'LIVRAISON0', type: 'FIXED', value: 3, service: 'DELIVERY', usageCount: 203, maxUsage: 300, active: true, expiresAt: '2025-09-01' },
];

const SERVICES_OPTIONS = ['ALL', 'TAXI', 'DELIVERY', 'GROCERY', 'SOS'];

function PromoCard({ item, onToggle, onDelete }) {
  const pct = Math.round((item.usageCount / item.maxUsage) * 100);
  return (
    <View style={[styles.card, !item.active && styles.cardInactive]}>
      <View style={styles.cardHeader}>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{item.code}</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          <View style={[styles.typeBadge, { backgroundColor: item.type === 'PERCENT' ? COLORS.blue + '25' : COLORS.green + '25' }]}>
            <Text style={[styles.typeText, { color: item.type === 'PERCENT' ? COLORS.blue : COLORS.green }]}>
              {item.type === 'PERCENT' ? `-${item.value}%` : `-${item.value} TND`}
            </Text>
          </View>
          <Text style={styles.serviceLabel}>{item.service}</Text>
        </View>
      </View>

      <View style={styles.usageRow}>
        <Text style={styles.usageText}>{item.usageCount} / {item.maxUsage} utilisations</Text>
        <Text style={styles.expiryText}>exp. {item.expiresAt}</Text>
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, {
          width: `${Math.min(100, pct)}%`,
          backgroundColor: pct >= 90 ? COLORS.red : pct >= 60 ? COLORS.accent : COLORS.green,
        }]} />
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity onPress={() => onDelete(item)} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>🗑️ Supprimer</Text>
        </TouchableOpacity>
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: item.active ? COLORS.green : COLORS.muted }]}>
            {item.active ? 'Actif' : 'Inactif'}
          </Text>
          <Switch
            value={item.active}
            onValueChange={() => onToggle(item)}
            trackColor={{ false: COLORS.border, true: COLORS.green }}
            thumbColor={item.active ? '#FFF' : COLORS.muted}
          />
        </View>
      </View>
    </View>
  );
}

export default function AdminPromoCodesScreen({ navigation }) {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'PERCENT', value: '', service: 'ALL', maxUsage: '', expiresAt: '' });

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/admin/promos')
      .then(r => setPromos(r.data.promos || MOCK_PROMOS))
      .catch(() => setPromos(MOCK_PROMOS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (promo) => {
    const next = !promo.active;
    try {
      await api.patch(`/api/admin/promos/${promo.id}`, { active: next });
      setPromos(prev => prev.map(p => p.id === promo.id ? { ...p, active: next } : p));
    } catch { Alert.alert('Erreur', 'Impossible de modifier.'); }
  };

  const handleDelete = (promo) => {
    Alert.alert(`Supprimer ${promo.code} ?`, 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/api/admin/promos/${promo.id}`);
            setPromos(prev => prev.filter(p => p.id !== promo.id));
          } catch { Alert.alert('Erreur', 'Impossible de supprimer.'); }
        },
      },
    ]);
  };

  const handleCreate = async () => {
    if (!form.code.trim() || !form.value || !form.maxUsage) {
      Alert.alert('Champs requis', 'Remplissez le code, la valeur et le max d\'utilisations.');
      return;
    }
    try {
      const body = { ...form, value: parseFloat(form.value), maxUsage: parseInt(form.maxUsage) };
      const res = await api.post('/api/admin/promos', body).catch(() => ({ data: { promo: { id: Date.now().toString(), ...body, usageCount: 0, active: true } } }));
      setPromos(prev => [res.data.promo, ...prev]);
      setModalVisible(false);
      setForm({ code: '', type: 'PERCENT', value: '', service: 'ALL', maxUsage: '', expiresAt: '' });
    } catch { Alert.alert('Erreur', 'Impossible de créer.'); }
  };

  const activeCount = promos.filter(p => p.active).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Codes promo</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Créer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{promos.length}</Text>
          <Text style={styles.statLabel}>total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.green }]}>{activeCount}</Text>
          <Text style={styles.statLabel}>actifs</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{promos.reduce((s, p) => s + p.usageCount, 0)}</Text>
          <Text style={styles.statLabel}>utilisations</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={promos}
          keyExtractor={p => p.id}
          renderItem={({ item }) => (
            <PromoCard item={item} onToggle={handleToggle} onDelete={handleDelete} />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ fontSize: 40 }}>🎁</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucun code promo</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nouveau code promo</Text>

            <Text style={styles.fieldLabel}>Code</Text>
            <TextInput
              style={styles.input}
              value={form.code}
              onChangeText={v => setForm(f => ({ ...f, code: v.toUpperCase() }))}
              placeholder="ex: WELCOME20"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="characters"
            />

            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Type</Text>
                <View style={styles.typeRow}>
                  {['PERCENT', 'FIXED'].map(t => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.typeBtn, form.type === t && styles.typeBtnActive]}
                      onPress={() => setForm(f => ({ ...f, type: t }))}
                    >
                      <Text style={[styles.typeBtnText, form.type === t && { color: '#000' }]}>
                        {t === 'PERCENT' ? '% Remise' : 'TND fixe'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Valeur</Text>
                <TextInput
                  style={styles.input}
                  value={form.value}
                  onChangeText={v => setForm(f => ({ ...f, value: v }))}
                  placeholder="20"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Service</Text>
            <View style={styles.servicesRow}>
              {SERVICES_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.svcChip, form.service === s && styles.svcChipActive]}
                  onPress={() => setForm(f => ({ ...f, service: s }))}
                >
                  <Text style={[styles.svcChipText, form.service === s && { color: '#000' }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Max utilisations</Text>
                <TextInput
                  style={styles.input}
                  value={form.maxUsage}
                  onChangeText={v => setForm(f => ({ ...f, maxUsage: v }))}
                  placeholder="500"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Expiration</Text>
                <TextInput
                  style={styles.input}
                  value={form.expiresAt}
                  onChangeText={v => setForm(f => ({ ...f, expiresAt: v }))}
                  placeholder="2025-12-31"
                  placeholderTextColor={COLORS.muted}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
                <Text style={styles.createBtnText}>Créer</Text>
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
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  addBtn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnText: { color: '#000', fontSize: 13, fontWeight: '700' },
  statsBar: { flexDirection: 'row', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  statLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  cardInactive: { opacity: 0.55 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  codeBox: {
    backgroundColor: COLORS.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed',
  },
  codeText: { color: COLORS.accent, fontSize: 14, fontWeight: '900', letterSpacing: 1.5 },
  cardHeaderRight: { alignItems: 'flex-end', gap: 4 },
  typeBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  typeText: { fontSize: 13, fontWeight: '800' },
  serviceLabel: { color: COLORS.muted, fontSize: 11 },
  usageRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  usageText: { color: COLORS.muted, fontSize: 12 },
  expiryText: { color: COLORS.muted, fontSize: 12 },
  progressBg: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: 4, borderRadius: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deleteBtn: { padding: 4 },
  deleteBtnText: { color: COLORS.red, fontSize: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  switchLabel: { fontSize: 12, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderWidth: 1, borderColor: COLORS.border,
  },
  modalTitle: { color: COLORS.text, fontSize: 17, fontWeight: '800', marginBottom: 16 },
  fieldLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', marginBottom: 6, letterSpacing: 0.8 },
  input: {
    backgroundColor: COLORS.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9,
    color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12,
  },
  formRow: { flexDirection: 'row', gap: 10 },
  typeRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  typeBtn: {
    flex: 1, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 7, alignItems: 'center', backgroundColor: COLORS.bg,
  },
  typeBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  typeBtnText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  servicesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  svcChip: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
  },
  svcChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  svcChipText: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 12, alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
  createBtn: { flex: 2, borderRadius: 12, backgroundColor: COLORS.accent, paddingVertical: 12, alignItems: 'center' },
  createBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
});
