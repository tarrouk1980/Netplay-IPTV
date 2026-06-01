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
  TextInput,
  Modal,
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
};

const ROLE_CONFIG = {
  CHAUFFEUR: { icon: '🚕', color: COLORS.orange, label: 'Chauffeur' },
  LIVREUR: { icon: '🛵', color: COLORS.green, label: 'Livreur' },
  DEPANNEUR: { icon: '🛻', color: COLORS.accent, label: 'Dépanneur' },
  MARCHAND: { icon: '🏪', color: '#00838F', label: 'Marchand' },
};

const DOC_TYPES = ['CIN', 'PERMIS', 'CARTE_GRISE', 'ASSURANCE', 'VISITE_TECHNIQUE', 'CASIER_JUDICIAIRE'];

const MOCK_PROVIDERS = [
  {
    id: 'prov-001',
    name: 'Karim Bouzid',
    phone: '+216 22 345 678',
    role: 'CHAUFFEUR',
    kycStatus: 'PENDING',
    submittedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    docs: { CIN: 'PENDING', PERMIS: 'PENDING', CARTE_GRISE: 'PENDING', ASSURANCE: 'MISSING' },
  },
  {
    id: 'prov-002',
    name: 'Sami Trabelsi',
    phone: '+216 55 678 901',
    role: 'LIVREUR',
    kycStatus: 'PENDING',
    submittedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    docs: { CIN: 'PENDING', PERMIS: 'PENDING' },
  },
  {
    id: 'prov-003',
    name: 'Ahmed Mansour',
    phone: '+216 98 234 567',
    role: 'DEPANNEUR',
    kycStatus: 'PENDING',
    submittedAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    docs: { CIN: 'PENDING', PERMIS: 'PENDING', CARTE_GRISE: 'APPROVED', ASSURANCE: 'PENDING' },
  },
];

function ReviewModal({ visible, provider, onClose, onAction }) {
  const [rejectNote, setRejectNote] = useState('');
  const [mode, setMode] = useState(null); // 'approve' | 'reject'

  if (!provider) return null;
  const roleCfg = ROLE_CONFIG[provider.role] || ROLE_CONFIG.CHAUFFEUR;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.sheet}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 }}>
            <Text style={{ fontSize: 24 }}>{roleCfg.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={m.name}>{provider.name}</Text>
              <Text style={m.sub}>{roleCfg.label} · {provider.phone}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: COLORS.muted, fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={m.docTitle}>Documents soumis</Text>
          <ScrollView style={{ maxHeight: 160 }} showsVerticalScrollIndicator={false}>
            {Object.entries(provider.docs || {}).map(([type, status]) => (
              <View key={type} style={m.docRow}>
                <Text style={m.docType}>{type.replace('_', ' ')}</Text>
                <View style={[m.docStatus, {
                  backgroundColor: status === 'APPROVED' ? COLORS.green + '22' : status === 'PENDING' ? COLORS.orange + '22' : COLORS.muted + '22',
                  borderColor: status === 'APPROVED' ? COLORS.green : status === 'PENDING' ? COLORS.orange : COLORS.muted,
                }]}>
                  <Text style={{ fontSize: 10, color: status === 'APPROVED' ? COLORS.green : status === 'PENDING' ? COLORS.orange : COLORS.muted, fontWeight: '700' }}>
                    {status === 'APPROVED' ? '✅' : status === 'PENDING' ? '⏳' : '❌'} {status}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {mode === 'reject' && (
            <View style={{ marginTop: 12 }}>
              <Text style={m.noteLabel}>Motif de refus (obligatoire)</Text>
              <TextInput
                style={m.noteInput}
                value={rejectNote}
                onChangeText={setRejectNote}
                placeholder="Ex: Document illisible, informations incorrectes..."
                placeholderTextColor={COLORS.muted}
                multiline
                numberOfLines={3}
              />
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            {mode !== 'reject' && (
              <TouchableOpacity
                style={[m.btn, { backgroundColor: COLORS.green + '22', borderColor: COLORS.green, flex: 1 }]}
                onPress={() => onAction(provider.id, 'approve', '')}
              >
                <Text style={[m.btnTxt, { color: COLORS.green }]}>✅ Approuver</Text>
              </TouchableOpacity>
            )}
            {mode === 'reject' ? (
              <TouchableOpacity
                style={[m.btn, { backgroundColor: COLORS.accent, flex: 1 }]}
                onPress={() => {
                  if (!rejectNote.trim()) { Alert.alert('Motif requis'); return; }
                  onAction(provider.id, 'reject', rejectNote);
                }}
              >
                <Text style={[m.btnTxt, { color: '#FFF' }]}>Confirmer le refus</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[m.btn, { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent, flex: 1 }]}
                onPress={() => setMode('reject')}
              >
                <Text style={[m.btnTxt, { color: COLORS.accent }]}>❌ Refuser</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  name: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  sub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  docTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  docRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  docType: { color: COLORS.text, fontSize: 12 },
  docStatus: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  noteLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', marginBottom: 6 },
  noteInput: { backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 12, color: COLORS.text, fontSize: 13, borderWidth: 1, borderColor: COLORS.border, textAlignVertical: 'top' },
  btn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  btnTxt: { fontSize: 14, fontWeight: '700' },
});

export default function AdminProviderVerificationScreen({ navigation }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [roleFilter, setRoleFilter] = useState('ALL');

  const load = useCallback(async (silent = false) => {
    try {
      const res = await api.get('/api/admin/providers/pending');
      setProviders(res.data.providers || []);
    } catch {
      if (!silent) setProviders(MOCK_PROVIDERS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (providerId, action, note) => {
    try {
      await api.post(`/api/admin/providers/${providerId}/verify`, { action, note });
      setSelected(null);
      load(true);
    } catch {
      Alert.alert('Erreur', 'Action impossible pour le moment.');
    }
  };

  const filtered = roleFilter === 'ALL' ? providers : providers.filter((p) => p.role === roleFilter);

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.orange} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>🔍 Vérification prestataires</Text>
        <View style={[s.badge, { backgroundColor: providers.length > 0 ? COLORS.orange : COLORS.muted }]}>
          <Text style={s.badgeTxt}>{providers.length}</Text>
        </View>
      </View>

      {/* Role filter */}
      <View style={s.filterRow}>
        {['ALL', ...Object.keys(ROLE_CONFIG)].map((role) => {
          const cfg = ROLE_CONFIG[role];
          const count = role === 'ALL' ? providers.length : providers.filter((p) => p.role === role).length;
          return (
            <TouchableOpacity
              key={role}
              style={[s.filterTab, roleFilter === role && s.filterTabActive]}
              onPress={() => setRoleFilter(role)}
            >
              <Text style={[s.filterTxt, roleFilter === role && s.filterTxtActive]}>
                {cfg ? cfg.icon : '👤'} {count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(true); }}
            tintColor={COLORS.orange}
          />
        }
        renderItem={({ item }) => {
          const roleCfg = ROLE_CONFIG[item.role] || ROLE_CONFIG.CHAUFFEUR;
          const docsCount = Object.keys(item.docs || {}).length;
          const elapsed = Math.floor((Date.now() - new Date(item.submittedAt)) / 3600000);
          return (
            <TouchableOpacity
              style={[s.card, { borderLeftColor: roleCfg.color }]}
              onPress={() => setSelected(item)}
            >
              <View style={s.cardTop}>
                <Text style={{ fontSize: 22 }}>{roleCfg.icon}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.providerName}>{item.name}</Text>
                  <Text style={s.providerPhone}>{item.phone}</Text>
                </View>
                <View style={[s.roleBadge, { backgroundColor: roleCfg.color + '22', borderColor: roleCfg.color }]}>
                  <Text style={[s.roleTxt, { color: roleCfg.color }]}>{roleCfg.label}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={s.meta}>📄 {docsCount} documents</Text>
                <Text style={[s.elapsed, elapsed > 24 ? { color: COLORS.accent } : null]}>
                  ⏱ {elapsed < 1 ? '< 1h' : `${elapsed}h`} en attente
                </Text>
              </View>
              <TouchableOpacity
                style={s.reviewBtn}
                onPress={() => setSelected(item)}
              >
                <Text style={s.reviewBtnTxt}>Examiner le dossier →</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>✅</Text>
            <Text style={s.emptyTitle}>Aucun dossier en attente</Text>
            <Text style={s.emptySub}>Tous les prestataires ont été vérifiés.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      <ReviewModal
        visible={!!selected}
        provider={selected}
        onClose={() => setSelected(null)}
        onAction={handleAction}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '700', flex: 1 },
  badge: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTxt: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  filterTab: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  filterTabActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orange + '22' },
  filterTxt: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  filterTxtActive: { color: COLORS.orange },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 10, padding: 14, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  providerName: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  providerPhone: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  roleBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  roleTxt: { fontSize: 10, fontWeight: '700' },
  meta: { color: COLORS.muted, fontSize: 12 },
  elapsed: { color: COLORS.muted, fontSize: 11 },
  reviewBtn: { backgroundColor: COLORS.orange + '11', borderRadius: 8, padding: 10, marginTop: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.orange + '44' },
  reviewBtnTxt: { color: COLORS.orange, fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center' },
});
