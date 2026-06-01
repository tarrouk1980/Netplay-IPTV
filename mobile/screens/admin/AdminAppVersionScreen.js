import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, RefreshControl, Alert, Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  border: '#2A2A3A', text: '#FFFFFF', muted: '#8A8A9A',
  orange: '#F57C00', green: '#27AE60', accent: '#D32F2F', blue: '#1565C0',
};

const STATUS_CONFIG = {
  CURRENT: { label: 'Actuelle', color: COLORS.green },
  DEPRECATED: { label: 'Obsolète', color: COLORS.orange },
  FORCED_UPDATE: { label: 'Mise à jour forcée', color: COLORS.accent },
};

const MOCK_VERSIONS = [
  { id: 'v1', number: '2.4.1', platform: 'Android', status: 'CURRENT', releasedAt: '2026-05-15', downloads: 12400 },
  { id: 'v2', number: '2.4.1', platform: 'iOS', status: 'CURRENT', releasedAt: '2026-05-16', downloads: 8700 },
  { id: 'v3', number: '2.3.0', platform: 'Android', status: 'DEPRECATED', releasedAt: '2026-03-01', downloads: 34200 },
  { id: 'v4', number: '2.2.5', platform: 'Android', status: 'FORCED_UPDATE', releasedAt: '2026-01-10', downloads: 5100 },
  { id: 'v5', number: '2.3.0', platform: 'iOS', status: 'DEPRECATED', releasedAt: '2026-03-02', downloads: 21000 },
];

function CreateModal({ visible, onClose, onCreate }) {
  const [number, setNumber] = useState('');
  const [platform, setPlatform] = useState('Android');
  const [type, setType] = useState('CURRENT');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!number.trim()) { Alert.alert('Numéro de version requis'); return; }
    setSaving(true);
    try {
      await onCreate({ number: number.trim(), platform, status: type });
      setNumber('');
      onClose();
    } catch {
      Alert.alert('Erreur', 'Impossible de créer la version.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.sheet}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text style={m.title}>📱 Nouvelle version</Text>
            <TouchableOpacity onPress={onClose} style={{ marginLeft: 'auto' }}>
              <Text style={{ color: COLORS.muted, fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={m.label}>Numéro de version</Text>
          <TextInput style={m.input} value={number} onChangeText={setNumber} placeholder="ex: 2.5.0" placeholderTextColor={COLORS.muted} />
          <Text style={m.label}>Plateforme</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
            {['Android', 'iOS'].map((p) => (
              <TouchableOpacity key={p} style={[m.optBtn, platform === p && { borderColor: COLORS.blue, backgroundColor: COLORS.blue + '22' }]} onPress={() => setPlatform(p)}>
                <Text style={{ color: platform === p ? COLORS.blue : COLORS.muted, fontSize: 13, fontWeight: '700' }}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={m.label}>Type</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <TouchableOpacity key={key} style={[m.optBtn, { flex: 1 }, type === key && { borderColor: cfg.color, backgroundColor: cfg.color + '22' }]} onPress={() => setType(key)}>
                <Text style={{ color: type === key ? cfg.color : COLORS.muted, fontSize: 10, fontWeight: '700', textAlign: 'center' }}>{cfg.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={[m.btn, { backgroundColor: COLORS.blue }]} onPress={handleCreate} disabled={saving}>
            {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={m.btnTxt}>Créer</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  label: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 12, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 4 },
  optBtn: { flex: 1, borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  btn: { borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10 },
  btnTxt: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

export default function AdminAppVersionScreen({ navigation }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async (silent = false) => {
    try {
      const res = await api.get('/api/admin/app-versions');
      setVersions(res.data.versions || []);
    } catch {
      if (!silent) setVersions(MOCK_VERSIONS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data) => {
    await api.post('/api/admin/app-versions', data);
    load(true);
  };

  const handleForceUpdate = (v) => {
    Alert.alert(
      'Forcer la mise à jour',
      `Les utilisateurs de la version ${v.number} (${v.platform}) seront forcés à mettre à jour.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.patch(`/api/admin/app-versions/${v.id}`, { status: 'FORCED_UPDATE' });
              load(true);
            } catch {
              setVersions((prev) => prev.map((x) => x.id === v.id ? { ...x, status: 'FORCED_UPDATE' } : x));
            }
          },
        },
      ]
    );
  };

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.blue} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>📱 Versions de l'app</Text>
          <Text style={s.sub}>{versions.filter((v) => v.status === 'CURRENT').length} version(s) actuelle(s)</Text>
        </View>
        <TouchableOpacity style={s.createBtn} onPress={() => setShowCreate(true)}>
          <Text style={s.createBtnTxt}>+ Nouvelle</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={versions}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={COLORS.blue} />}
        renderItem={({ item }) => {
          const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.DEPRECATED;
          return (
            <View style={s.card}>
              <View style={s.cardTop}>
                <View style={[s.platformBadge, { backgroundColor: item.platform === 'iOS' ? '#555' + '33' : COLORS.green + '22', borderColor: item.platform === 'iOS' ? '#888' : COLORS.green }]}>
                  <Text style={{ color: item.platform === 'iOS' ? '#CCC' : COLORS.green, fontSize: 11, fontWeight: '800' }}>{item.platform}</Text>
                </View>
                <Text style={s.versionNum}>v{item.number}</Text>
                <View style={[s.statusBadge, { backgroundColor: cfg.color + '22', borderColor: cfg.color + '66' }]}>
                  <Text style={[s.statusTxt, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>
              <View style={s.cardInfo}>
                <Text style={s.infoTxt}>📅 Sortie le {new Date(item.releasedAt).toLocaleDateString('fr-TN')}</Text>
                <Text style={s.infoTxt}>⬇️ {item.downloads.toLocaleString('fr-FR')} téléchargements</Text>
              </View>
              {item.status !== 'FORCED_UPDATE' && item.status !== 'CURRENT' && (
                <TouchableOpacity style={s.forceBtn} onPress={() => handleForceUpdate(item)}>
                  <Text style={s.forceBtnTxt}>⚠️ Forcer mise à jour</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📱</Text>
            <Text style={s.emptyTitle}>Aucune version</Text>
          </View>
        }
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
  createBtn: { backgroundColor: COLORS.blue, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  createBtnTxt: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, marginHorizontal: 16, marginTop: 10, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  platformBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  versionNum: { color: COLORS.text, fontSize: 16, fontWeight: '800', flex: 1 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  statusTxt: { fontSize: 11, fontWeight: '700' },
  cardInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  infoTxt: { color: COLORS.muted, fontSize: 11 },
  forceBtn: { backgroundColor: COLORS.accent + '11', borderRadius: 8, padding: 8, marginTop: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.accent + '44' },
  forceBtnTxt: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
});
