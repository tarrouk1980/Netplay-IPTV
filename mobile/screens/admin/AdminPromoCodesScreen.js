import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, StatusBar, Modal,
  Switch, ScrollView, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  green: '#27AE60',
  accent: '#D32F2F',
  amber: '#F57C00',
  blue: '#3498DB',
};

const SERVICE_LABELS = { TAXI: '🚕', SOS: '🚨', DELIVERY: '🛵', GROCERY: '🛒' };
const ALL_SERVICES = ['TAXI', 'SOS', 'DELIVERY', 'GROCERY'];

const MOCK_CODES = [
  { code: 'BIENVENUE', type: 'PERCENT', value: 20, maxUses: 1000, usedCount: 47, services: ALL_SERVICES, active: true, label: '20% première commande' },
  { code: 'TAXI10', type: 'PERCENT', value: 10, maxUses: 500, usedCount: 123, services: ['TAXI'], active: true, label: '10% taxi' },
  { code: 'SOS5', type: 'FIXED', value: 5, maxUses: 200, usedCount: 8, services: ['SOS'], active: true, label: '5 TND dépannage' },
  { code: 'ETE2025', type: 'PERCENT', value: 15, maxUses: 300, usedCount: 300, services: ALL_SERVICES, active: false, label: 'Promo été — expiré' },
];

function PromoRow({ item, onToggle, onDelete }) {
  const used = (item.usedCount / item.maxUses) * 100;
  const exhausted = item.usedCount >= item.maxUses;
  return (
    <View style={[styles.promoCard, !item.active && { opacity: 0.55 }]}>
      <View style={styles.promoTop}>
        <View style={styles.promoCodeBox}>
          <Text style={styles.promoCode}>{item.code}</Text>
          <View style={[styles.typeBadge, { backgroundColor: item.type === 'PERCENT' ? '#0D2A1A' : '#1A0D2A' }]}>
            <Text style={[styles.typeBadgeText, { color: item.type === 'PERCENT' ? COLORS.green : '#9B59B6' }]}>
              {item.type === 'PERCENT' ? `-${item.value}%` : `-${item.value} TND`}
            </Text>
          </View>
        </View>
        <View style={styles.promoActions}>
          <Switch
            value={item.active}
            onValueChange={() => onToggle(item)}
            trackColor={{ false: COLORS.border, true: COLORS.green + '80' }}
            thumbColor={item.active ? COLORS.green : COLORS.muted}
          />
          <TouchableOpacity onPress={() => onDelete(item)} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.promoLabel}>{item.label}</Text>

      <View style={styles.promoServices}>
        {item.services.map(s => (
          <Text key={s} style={styles.serviceIcon}>{SERVICE_LABELS[s] || s}</Text>
        ))}
      </View>

      {/* Usage bar */}
      <View style={styles.usageRow}>
        <Text style={styles.usageText}>{item.usedCount} / {item.maxUses} utilisations</Text>
        <Text style={[styles.usageText, exhausted && { color: COLORS.accent }]}>
          {exhausted ? 'Épuisé' : `${Math.round(used)}%`}
        </Text>
      </View>
      <View style={styles.usageBar}>
        <View style={[styles.usageFill, {
          width: `${Math.min(100, used)}%`,
          backgroundColor: exhausted ? COLORS.accent : used > 80 ? COLORS.amber : COLORS.green,
        }]} />
      </View>
    </View>
  );
}

export default function AdminPromoCodesScreen({ navigation }) {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // New code form
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState('PERCENT');
  const [newValue, setNewValue] = useState('');
  const [newMax, setNewMax] = useState('100');
  const [newLabel, setNewLabel] = useState('');
  const [newServices, setNewServices] = useState(ALL_SERVICES);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/promo/admin');
      setCodes(Array.isArray(res.data) ? res.data : MOCK_CODES);
    } catch {
      setCodes(MOCK_CODES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleService = (s) => {
    setNewServices(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleCreate = async () => {
    if (!newCode.trim() || !newValue || !newLabel.trim()) {
      Alert.alert('Champs requis', 'Code, valeur et libellé sont obligatoires.');
      return;
    }
    if (newServices.length === 0) {
      Alert.alert('Services requis', 'Sélectionnez au moins un service.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: newCode.trim().toUpperCase(),
        type: newType,
        value: parseFloat(newValue),
        maxUses: parseInt(newMax, 10) || 100,
        label: newLabel.trim(),
        services: newServices,
      };
      await api.post('/api/promo/admin/create', payload).catch(() => {});
      setCodes(prev => [...prev, { ...payload, usedCount: 0, active: true }]);
      setModal(false);
      setNewCode(''); setNewType('PERCENT'); setNewValue(''); setNewMax('100');
      setNewLabel(''); setNewServices(ALL_SERVICES);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item) => {
    setCodes(prev => prev.map(c => c.code === item.code ? { ...c, active: !c.active } : c));
    api.patch(`/api/promo/admin/${item.code}`, { active: !item.active }).catch(() => {});
  };

  const handleDelete = (item) => {
    Alert.alert('Supprimer', `Supprimer le code "${item.code}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          setCodes(prev => prev.filter(c => c.code !== item.code));
          api.delete(`/api/promo/admin/${item.code}`).catch(() => {});
        },
      },
    ]);
  };

  const totalUses = codes.reduce((s, c) => s + (c.usedCount || 0), 0);
  const activeCodes = codes.filter(c => c.active).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏷️ Codes promo</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
          <Text style={styles.addBtnText}>+ Créer</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statNum}>{codes.length}</Text>
          <Text style={styles.statLbl}>Total</Text>
        </View>
        <View style={[styles.statChip, { borderColor: COLORS.green + '50' }]}>
          <Text style={[styles.statNum, { color: COLORS.green }]}>{activeCodes}</Text>
          <Text style={styles.statLbl}>Actifs</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statNum}>{totalUses}</Text>
          <Text style={styles.statLbl}>Utilisations</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.green} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={codes}
          keyExtractor={i => i.code}
          renderItem={({ item }) => <PromoRow item={item} onToggle={handleToggle} onDelete={handleDelete} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.green} />}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucun code promo.</Text>}
        />
      )}

      {/* Create Modal */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalBox} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>Nouveau code promo</Text>

            <Text style={styles.modalLabel}>CODE</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: ETE2025"
              placeholderTextColor={COLORS.muted}
              value={newCode}
              onChangeText={v => setNewCode(v.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <Text style={styles.modalLabel}>TYPE DE RÉDUCTION</Text>
            <View style={styles.typeRow}>
              {['PERCENT', 'FIXED'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, newType === t && { backgroundColor: COLORS.green, borderColor: COLORS.green }]}
                  onPress={() => setNewType(t)}
                >
                  <Text style={[styles.typeBtnText, newType === t && { color: '#FFF' }]}>
                    {t === 'PERCENT' ? '% Pourcentage' : 'TND Montant fixe'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>VALEUR ({newType === 'PERCENT' ? '%' : 'TND'})</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={newType === 'PERCENT' ? 'Ex: 20' : 'Ex: 5'}
              placeholderTextColor={COLORS.muted}
              keyboardType="numeric"
              value={newValue}
              onChangeText={setNewValue}
            />

            <Text style={styles.modalLabel}>UTILISATIONS MAX</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="100"
              placeholderTextColor={COLORS.muted}
              keyboardType="numeric"
              value={newMax}
              onChangeText={setNewMax}
            />

            <Text style={styles.modalLabel}>LIBELLÉ</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Description courte du code"
              placeholderTextColor={COLORS.muted}
              value={newLabel}
              onChangeText={setNewLabel}
            />

            <Text style={styles.modalLabel}>SERVICES CONCERNÉS</Text>
            <View style={styles.servicesRow}>
              {ALL_SERVICES.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.serviceChip, newServices.includes(s) && styles.serviceChipActive]}
                  onPress={() => toggleService(s)}
                >
                  <Text style={styles.serviceChipText}>{SERVICE_LABELS[s]} {s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModal(false)}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalCreateBtn, saving && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.modalCreateText}>Créer</Text>}
              </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
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
  addBtn: { backgroundColor: COLORS.green, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', padding: 12, gap: 10 },
  statChip: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 10,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statNum: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  statLbl: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  list: { padding: 12, paddingBottom: 40 },
  promoCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  promoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  promoCodeBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  promoCode: { color: COLORS.text, fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  typeBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  typeBadgeText: { fontSize: 13, fontWeight: '800' },
  promoActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 18 },
  promoLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 8 },
  promoServices: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  serviceIcon: { fontSize: 18 },
  usageRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  usageText: { color: COLORS.muted, fontSize: 11 },
  usageBar: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  usageFill: { height: 4, borderRadius: 2 },
  emptyText: { color: COLORS.muted, textAlign: 'center', marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderTopWidth: 1, borderTopColor: COLORS.border, maxHeight: '90%',
  },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 16 },
  modalLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 8, marginTop: 4 },
  modalInput: {
    backgroundColor: COLORS.bg, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border,
    color: COLORS.text, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 12,
  },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  typeBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  typeBtnText: { color: COLORS.muted, fontWeight: '700', fontSize: 13 },
  servicesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  serviceChip: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  serviceChipActive: { backgroundColor: COLORS.surface, borderColor: COLORS.green },
  serviceChipText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  modalCancelBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  modalCancelText: { color: COLORS.muted, fontWeight: '700' },
  modalCreateBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: COLORS.green },
  modalCreateText: { color: '#FFF', fontWeight: '900', fontSize: 15 },
});
