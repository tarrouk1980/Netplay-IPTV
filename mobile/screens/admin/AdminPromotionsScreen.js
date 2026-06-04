import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert, TextInput, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const MOCK = [
  { id: 'P1', code: 'EASY20', type: 'PERCENT', value: 20, minOrder: 10, usageLimit: 500, usageCount: 234, active: true, expiresAt: '30/06/2026', service: 'ALL' },
  { id: 'P2', code: 'TAXI10', type: 'FIXED', value: 10, minOrder: 15, usageLimit: 200, usageCount: 87, active: true, expiresAt: '15/06/2026', service: 'TAXI' },
  { id: 'P3', code: 'WELCOME5', type: 'PERCENT', value: 5, minOrder: 0, usageLimit: 1000, usageCount: 1000, active: false, expiresAt: '01/06/2026', service: 'ALL' },
  { id: 'P4', code: 'LIVRAISON15', type: 'PERCENT', value: 15, minOrder: 20, usageLimit: 300, usageCount: 142, active: true, expiresAt: '31/07/2026', service: 'DELIVERY' },
];

const SERVICE_LABELS = { ALL: 'Tous services', TAXI: 'Taxi', DELIVERY: 'Livraison', GROCERY: 'Épicerie', SOS: 'SOS' };

function PromoCard({ item, onToggle, onDelete }) {
  const expired = item.usageCount >= item.usageLimit;
  return (
    <View style={[styles.card, !item.active && styles.cardInactive]}>
      <View style={styles.cardTop}>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{item.code}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.toggleBtn, item.active ? styles.toggleBtnOn : styles.toggleBtnOff]}
            onPress={() => onToggle(item)}
          >
            <Text style={[styles.toggleText, { color: item.active ? COLORS.green : COLORS.muted }]}>
              {item.active ? 'Actif' : 'Inactif'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item)} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Remise</Text>
          <Text style={styles.metaValue}>
            {item.type === 'PERCENT' ? item.value + '%' : item.value + ' TND'}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Service</Text>
          <Text style={styles.metaValue}>{SERVICE_LABELS[item.service] || item.service}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Min. commande</Text>
          <Text style={styles.metaValue}>{item.minOrder} TND</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Expire</Text>
          <Text style={styles.metaValue}>{item.expiresAt}</Text>
        </View>
      </View>

      <View style={styles.usageRow}>
        <Text style={styles.usageText}>{item.usageCount} / {item.usageLimit} utilisations</Text>
        <View style={styles.usageBarBg}>
          <View style={[styles.usageBarFill, {
            width: Math.min(100, (item.usageCount / item.usageLimit) * 100) + '%',
            backgroundColor: expired ? COLORS.red : COLORS.green,
          }]} />
        </View>
      </View>
    </View>
  );
}

export default function AdminPromotionsScreen({ navigation }) {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'PERCENT', value: '', minOrder: '0', usageLimit: '100', expiresAt: '', service: 'ALL' });

  const load = useCallback(() => {
    api.get('/api/admin/promotions')
      .then(r => setPromos(r.data.promotions || MOCK))
      .catch(() => setPromos(MOCK))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const togglePromo = (item) => {
    setPromos(prev => prev.map(p => p.id === item.id ? { ...p, active: !p.active } : p));
    api.put('/api/admin/promotions/' + item.id, { active: !item.active }).catch(() => {});
  };

  const deletePromo = (item) => {
    Alert.alert('Supprimer ?', 'Supprimer le code ' + item.code + ' ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => {
        setPromos(prev => prev.filter(p => p.id !== item.id));
        api.delete('/api/admin/promotions/' + item.id).catch(() => {});
      }},
    ]);
  };

  const createPromo = async () => {
    if (!form.code || !form.value || !form.expiresAt) {
      Alert.alert('Champs requis', 'Code, valeur et date d\'expiration sont obligatoires.');
      return;
    }
    const newPromo = {
      ...form, id: Date.now().toString(),
      value: parseFloat(form.value), minOrder: parseFloat(form.minOrder),
      usageLimit: parseInt(form.usageLimit), usageCount: 0, active: true,
    };
    setPromos(prev => [newPromo, ...prev]);
    api.post('/api/admin/promotions', newPromo).catch(() => {});
    setShowModal(false);
  };

  const activeCount = promos.filter(p => p.active).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎁 Promotions</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+ Créer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{promos.length}</Text>
          <Text style={styles.statLabel}>Total codes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: COLORS.green }]}>{activeCount}</Text>
          <Text style={styles.statLabel}>Actifs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{promos.reduce((s, p) => s + p.usageCount, 0)}</Text>
          <Text style={styles.statLabel}>Utilisations</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={promos}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <PromoCard item={item} onToggle={togglePromo} onDelete={deletePromo} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={showModal} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Nouveau code promo</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Text style={{ color: COLORS.muted, fontSize: 22 }}>×</Text>
                </TouchableOpacity>
              </View>
              {[
                { label: 'Code', key: 'code', placeholder: 'Ex: SUMMER25', upper: true },
                { label: 'Valeur (%  ou TND)', key: 'value', placeholder: '20', numeric: true },
                { label: 'Commande minimum (TND)', key: 'minOrder', placeholder: '0', numeric: true },
                { label: 'Limite d\'utilisations', key: 'usageLimit', placeholder: '100', numeric: true },
                { label: 'Date d\'expiration', key: 'expiresAt', placeholder: 'JJ/MM/AAAA' },
              ].map(f => (
                <View key={f.key} style={{ marginBottom: 10 }}>
                  <Text style={styles.fieldLabel}>{f.label}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    placeholderTextColor={COLORS.muted}
                    value={form[f.key]}
                    onChangeText={v => setForm(prev => ({ ...prev, [f.key]: f.upper ? v.toUpperCase() : v }))}
                    keyboardType={f.numeric ? 'numeric' : 'default'}
                  />
                </View>
              ))}
              <TouchableOpacity style={styles.createBtn} onPress={createPromo}>
                <Text style={styles.createBtnText}>✓ Créer le code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  backBtn: { padding: 4 },
  backText: { color: COLORS.accent, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  addBtn: { backgroundColor: COLORS.accent + '20', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 8 },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statNum: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  statLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  list: { padding: 16 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  cardInactive: { opacity: 0.6 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  codeBox: {
    backgroundColor: COLORS.accent + '20', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: COLORS.accent + '50',
  },
  codeText: { color: COLORS.accent, fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  cardActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  toggleBtn: {
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1,
  },
  toggleBtnOn: { backgroundColor: COLORS.green + '20', borderColor: COLORS.green + '50' },
  toggleBtnOff: { backgroundColor: COLORS.surface, borderColor: COLORS.border },
  toggleText: { fontSize: 12, fontWeight: '700' },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 18 },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  metaItem: { width: '45%' },
  metaLabel: { color: COLORS.muted, fontSize: 10, marginBottom: 2 },
  metaValue: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  usageRow: { gap: 6 },
  usageText: { color: COLORS.muted, fontSize: 11 },
  usageBarBg: { height: 4, backgroundColor: COLORS.border, borderRadius: 2 },
  usageBarFill: { height: 4, borderRadius: 2 },
  overlay: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  fieldLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: COLORS.bg, borderRadius: 10, padding: 12,
    color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  createBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  createBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
});
