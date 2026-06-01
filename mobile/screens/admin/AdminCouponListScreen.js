import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  orange: '#F57C00',
  green: '#27AE60',
  accent: '#D32F2F',
  blue: '#1565C0',
  purple: '#7B1FA2',
};

const TYPE_CONFIG = {
  PERCENTAGE: { label: '% Réduction', icon: '%', color: COLORS.orange },
  FIXED: { label: 'Montant fixe', icon: 'TND', color: COLORS.green },
  FREE_DELIVERY: { label: 'Livraison offerte', icon: '🛵', color: COLORS.blue },
};

const MOCK_COUPONS = [
  { id: 'c1', code: 'BIENVENUE20', type: 'PERCENTAGE', value: 20, minOrder: 15, maxUses: 1000, usedCount: 342, expiresAt: '2026-12-31', isActive: true, services: ['TAXI', 'DELIVERY'] },
  { id: 'c2', code: 'RAMADAN10', type: 'FIXED', value: 10, minOrder: 25, maxUses: 500, usedCount: 498, expiresAt: '2026-03-30', isActive: false, services: ['ALL'] },
  { id: 'c3', code: 'FREELIV', type: 'FREE_DELIVERY', value: 0, minOrder: 20, maxUses: 200, usedCount: 87, expiresAt: '2026-09-15', isActive: true, services: ['DELIVERY', 'GROCERY'] },
];

function CreateModal({ visible, onClose, onCreate }) {
  const [code, setCode] = useState('');
  const [type, setType] = useState('PERCENTAGE');
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!code.trim()) { Alert.alert('Code requis'); return; }
    setSaving(true);
    try {
      await onCreate({ code: code.toUpperCase().trim(), type, value: parseFloat(value) || 0, minOrder: parseFloat(minOrder) || 0, maxUses: parseInt(maxUses) || 100, expiresAt });
      setCode(''); setValue(''); setMinOrder(''); setMaxUses(''); setExpiresAt('');
      onClose();
    } catch {
      Alert.alert('Erreur', 'Impossible de créer le coupon.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={m.overlay}>
        <ScrollView style={m.sheet} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text style={m.title}>🎫 Nouveau coupon</Text>
            <TouchableOpacity onPress={onClose} style={{ marginLeft: 'auto' }}>
              <Text style={{ color: COLORS.muted, fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={m.label}>Code</Text>
          <TextInput style={m.input} value={code} onChangeText={(v) => setCode(v.toUpperCase())} placeholder="EX: PROMO25" placeholderTextColor={COLORS.muted} autoCapitalize="characters" maxLength={20} />

          <Text style={m.label}>Type de réduction</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
              <TouchableOpacity key={key} style={[m.typeBtn, type === key && { borderColor: cfg.color, backgroundColor: cfg.color + '22' }]} onPress={() => setType(key)}>
                <Text style={{ color: type === key ? cfg.color : COLORS.muted, fontSize: 11, fontWeight: '700' }}>{cfg.icon} {cfg.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {type !== 'FREE_DELIVERY' && (
            <>
              <Text style={m.label}>Valeur ({type === 'PERCENTAGE' ? '%' : 'TND'})</Text>
              <TextInput style={m.input} value={value} onChangeText={setValue} placeholder="20" placeholderTextColor={COLORS.muted} keyboardType="numeric" />
            </>
          )}

          <Text style={m.label}>Commande minimum (TND)</Text>
          <TextInput style={m.input} value={minOrder} onChangeText={setMinOrder} placeholder="15" placeholderTextColor={COLORS.muted} keyboardType="numeric" />

          <Text style={m.label}>Utilisations maximum</Text>
          <TextInput style={m.input} value={maxUses} onChangeText={setMaxUses} placeholder="100" placeholderTextColor={COLORS.muted} keyboardType="numeric" />

          <Text style={m.label}>Expire le (AAAA-MM-JJ)</Text>
          <TextInput style={m.input} value={expiresAt} onChangeText={setExpiresAt} placeholder="2026-12-31" placeholderTextColor={COLORS.muted} />

          <TouchableOpacity style={[m.btn, { backgroundColor: COLORS.orange, marginTop: 16, marginBottom: 40 }]} onPress={handleCreate} disabled={saving}>
            {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={m.btnTxt}>Créer le coupon</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  label: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 12, color: COLORS.text, fontSize: 13, borderWidth: 1, borderColor: COLORS.border, marginBottom: 4 },
  typeBtn: { flex: 1, borderRadius: 8, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  btn: { borderRadius: 12, padding: 14, alignItems: 'center' },
  btnTxt: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

export default function AdminCouponListScreen({ navigation }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async (silent = false) => {
    try {
      const res = await api.get('/api/admin/promo-codes');
      setCoupons(res.data.codes || []);
    } catch {
      if (!silent) setCoupons(MOCK_COUPONS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data) => {
    await api.post('/api/admin/promo-codes', data);
    load(true);
  };

  const toggleActive = async (coupon) => {
    try {
      await api.patch(`/api/admin/promo-codes/${coupon.id}`, { isActive: !coupon.isActive });
      load(true);
    } catch {
      setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, isActive: !c.isActive } : c));
    }
  };

  const activeCount = coupons.filter((c) => c.isActive).length;

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.purple} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>🎫 Coupons de réduction</Text>
          <Text style={s.sub}>{activeCount} actif{activeCount !== 1 ? 's' : ''} sur {coupons.length}</Text>
        </View>
        <TouchableOpacity style={s.createBtn} onPress={() => setShowCreate(true)}>
          <Text style={s.createBtnTxt}>+ Créer</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={coupons}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={COLORS.purple} />}
        renderItem={({ item }) => {
          const typeCfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.PERCENTAGE;
          const usagePct = item.maxUses > 0 ? Math.round((item.usedCount / item.maxUses) * 100) : 0;
          const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date();
          return (
            <TouchableOpacity
              style={[s.card, !item.isActive && s.cardInactive]}
              onPress={() => navigation.navigate('AdminPromoDetail', { promoId: item.id })}
            >
              <View style={s.cardTop}>
                <View style={[s.codeBadge, { borderColor: typeCfg.color }]}>
                  <Text style={[s.codeText, { color: typeCfg.color }]}>{item.code}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.typeLabel}>{typeCfg.icon} {typeCfg.label}{item.value > 0 ? ` · ${item.value}${item.type === 'PERCENTAGE' ? '%' : ' TND'}` : ''}</Text>
                  <Text style={s.minOrder}>Min. {item.minOrder} TND</Text>
                </View>
                <TouchableOpacity
                  style={[s.toggleBtn, { backgroundColor: item.isActive ? COLORS.green + '22' : COLORS.muted + '22', borderColor: item.isActive ? COLORS.green : COLORS.muted }]}
                  onPress={() => toggleActive(item)}
                >
                  <Text style={[s.toggleTxt, { color: item.isActive ? COLORS.green : COLORS.muted }]}>
                    {item.isActive ? 'Actif' : 'Inactif'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={s.usageRow}>
                <Text style={s.usageTxt}>{item.usedCount} / {item.maxUses} utilisations</Text>
                <Text style={[s.usagePct, { color: usagePct > 80 ? COLORS.accent : typeCfg.color }]}>{usagePct}%</Text>
              </View>
              <View style={s.usageBar}>
                <View style={[s.usageBarFill, { width: `${usagePct}%`, backgroundColor: usagePct > 80 ? COLORS.accent : typeCfg.color }]} />
              </View>

              {isExpired && <Text style={s.expiredTag}>⚠️ Coupon expiré</Text>}
              {item.expiresAt && !isExpired && (
                <Text style={s.expiry}>Expire le {new Date(item.expiresAt).toLocaleDateString('fr-TN')}</Text>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🎫</Text>
            <Text style={s.emptyTitle}>Aucun coupon</Text>
            <Text style={s.emptySub}>Créez des coupons pour fidéliser vos clients.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      <CreateModal visible={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  sub: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  createBtn: { backgroundColor: COLORS.purple, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  createBtnTxt: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 10, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginTop: 8 },
  cardInactive: { opacity: 0.55 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  codeBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1.5 },
  codeText: { fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  typeLabel: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  minOrder: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  toggleBtn: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  toggleTxt: { fontSize: 11, fontWeight: '700' },
  usageRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  usageTxt: { color: COLORS.muted, fontSize: 11 },
  usagePct: { fontSize: 11, fontWeight: '700' },
  usageBar: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
  usageBarFill: { height: '100%', borderRadius: 2 },
  expiredTag: { color: COLORS.accent, fontSize: 11, fontWeight: '700' },
  expiry: { color: COLORS.muted, fontSize: 11 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center' },
});
