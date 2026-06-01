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
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Switch,
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

const AUDIENCE_OPTIONS = [
  { key: 'ALL', label: 'Tous les utilisateurs', icon: '👥' },
  { key: 'CLIENTS', label: 'Clients uniquement', icon: '👤' },
  { key: 'PROVIDERS', label: 'Prestataires uniquement', icon: '🚗' },
  { key: 'INACTIVE', label: 'Inactifs (30j+)', icon: '😴' },
  { key: 'NEW', label: 'Nouveaux (7j)', icon: '🆕' },
];

const STATUS_CONFIG = {
  DRAFT: { color: COLORS.muted, label: 'Brouillon', icon: '📝' },
  SCHEDULED: { color: COLORS.blue, label: 'Planifiée', icon: '📅' },
  SENT: { color: COLORS.green, label: 'Envoyée', icon: '✅' },
  FAILED: { color: COLORS.accent, label: 'Échouée', icon: '❌' },
};

const MOCK_CAMPAIGNS = [
  { id: 'camp-001', title: 'Offre Ramadan 🌙', body: 'Profitez de 20% de réduction sur toutes vos courses ce soir !', audience: 'ALL', status: 'SENT', sentAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), reached: 4820, opened: 1930 },
  { id: 'camp-002', title: 'Bienvenue sur EasyWay', body: 'Votre première course est offerte jusqu\'à 15 TND. Commandez maintenant !', audience: 'NEW', status: 'SCHEDULED', scheduledAt: new Date(Date.now() + 3600000).toISOString(), reached: 0, opened: 0 },
  { id: 'camp-003', title: 'On vous manque 😊', body: 'Cela fait 30 jours que vous n\'avez pas commandé. Revenez avec un bon de 5 TND !', audience: 'INACTIVE', status: 'DRAFT', reached: 0, opened: 0 },
];

function CreateModal({ visible, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('ALL');
  const [schedule, setSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [sending, setSending] = useState(false);

  const reset = () => { setTitle(''); setBody(''); setAudience('ALL'); setSchedule(false); setScheduleDate(''); };

  const handleCreate = async (sendNow) => {
    if (!title.trim() || !body.trim()) { Alert.alert('Champs requis', 'Titre et message obligatoires.'); return; }
    setSending(true);
    try {
      await onCreate({ title, body, audience, sendNow, scheduledAt: schedule && scheduleDate ? scheduleDate : null });
      reset();
      onClose();
    } catch {
      Alert.alert('Erreur', 'Impossible de créer la campagne.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={m.overlay}>
        <ScrollView style={m.sheet} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text style={m.sheetTitle}>📣 Nouvelle campagne</Text>
            <TouchableOpacity onPress={() => { reset(); onClose(); }} style={{ marginLeft: 'auto' }}>
              <Text style={{ color: COLORS.muted, fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={m.fieldLabel}>Titre</Text>
          <TextInput style={m.input} value={title} onChangeText={setTitle} placeholder="Ex: Offre spéciale..." placeholderTextColor={COLORS.muted} maxLength={60} />
          <Text style={m.charCount}>{title.length}/60</Text>

          <Text style={m.fieldLabel}>Message</Text>
          <TextInput style={[m.input, { height: 80, textAlignVertical: 'top' }]} value={body} onChangeText={setBody} placeholder="Contenu de la notification..." placeholderTextColor={COLORS.muted} multiline maxLength={200} />
          <Text style={m.charCount}>{body.length}/200</Text>

          <Text style={m.fieldLabel}>Audience</Text>
          {AUDIENCE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[m.audienceRow, audience === opt.key && m.audienceRowActive]}
              onPress={() => setAudience(opt.key)}
            >
              <Text style={{ fontSize: 16 }}>{opt.icon}</Text>
              <Text style={[m.audienceLbl, audience === opt.key && { color: COLORS.orange }]}>{opt.label}</Text>
              {audience === opt.key && <Text style={{ color: COLORS.orange, marginLeft: 'auto' }}>✓</Text>}
            </TouchableOpacity>
          ))}

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 8 }}>
            <Text style={[m.fieldLabel, { flex: 1, marginBottom: 0 }]}>Planifier l'envoi</Text>
            <Switch
              value={schedule}
              onValueChange={setSchedule}
              trackColor={{ false: COLORS.border, true: COLORS.blue + '88' }}
              thumbColor={schedule ? COLORS.blue : COLORS.muted}
            />
          </View>
          {schedule && (
            <TextInput style={m.input} value={scheduleDate} onChangeText={setScheduleDate} placeholder="AAAA-MM-JJ HH:MM" placeholderTextColor={COLORS.muted} />
          )}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16, paddingBottom: 40 }}>
            <TouchableOpacity style={[m.btn, { flex: 1, borderWidth: 1, borderColor: COLORS.border }]} onPress={() => handleCreate(false)} disabled={sending}>
              <Text style={[m.btnTxt, { color: COLORS.muted }]}>💾 Brouillon</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[m.btn, { flex: 1, backgroundColor: COLORS.orange }]} onPress={() => handleCreate(true)} disabled={sending}>
              {sending ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={m.btnTxt}>📤 Envoyer</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  sheetTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  fieldLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 12, color: COLORS.text, fontSize: 13, borderWidth: 1, borderColor: COLORS.border },
  charCount: { color: COLORS.muted, fontSize: 10, textAlign: 'right', marginTop: 2 },
  audienceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surfaceAlt, borderRadius: 8, padding: 10, marginBottom: 4, borderWidth: 1, borderColor: COLORS.border },
  audienceRowActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orange + '11' },
  audienceLbl: { color: COLORS.muted, fontSize: 13 },
  btn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnTxt: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});

export default function AdminNotificationCampaignsScreen({ navigation }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async (silent = false) => {
    try {
      const res = await api.get('/api/admin/notifications/campaigns');
      setCampaigns(res.data.campaigns || []);
    } catch {
      if (!silent) setCampaigns(MOCK_CAMPAIGNS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data) => {
    await api.post('/api/admin/notifications/campaigns', data);
    load(true);
  };

  const totalReached = campaigns.reduce((s, c) => s + (c.reached || 0), 0);
  const sentCount = campaigns.filter((c) => c.status === 'SENT').length;

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.purple} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>📣 Campagnes notifs</Text>
          <Text style={s.sub}>{sentCount} envoyées · {totalReached.toLocaleString()} utilisateurs touchés</Text>
        </View>
        <TouchableOpacity style={s.createBtn} onPress={() => setShowCreate(true)}>
          <Text style={s.createBtnTxt}>+ Créer</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={campaigns}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={COLORS.purple} />}
        renderItem={({ item }) => {
          const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.DRAFT;
          const audienceCfg = AUDIENCE_OPTIONS.find((a) => a.key === item.audience) || AUDIENCE_OPTIONS[0];
          const openRate = item.reached > 0 ? Math.round((item.opened / item.reached) * 100) : 0;
          return (
            <View style={[s.card, { borderLeftColor: st.color }]}>
              <View style={s.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{item.title}</Text>
                  <Text style={s.cardBody} numberOfLines={2}>{item.body}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: st.color + '22', borderColor: st.color }]}>
                  <Text style={{ fontSize: 10 }}>{st.icon}</Text>
                  <Text style={[s.statusTxt, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <Text style={s.audienceChip}>{audienceCfg.icon} {audienceCfg.label}</Text>
              </View>

              {item.status === 'SENT' && (
                <View style={s.statsRow}>
                  <View style={s.statItem}>
                    <Text style={[s.statVal, { color: COLORS.blue }]}>{item.reached?.toLocaleString()}</Text>
                    <Text style={s.statLbl}>Touchés</Text>
                  </View>
                  <View style={s.statItem}>
                    <Text style={[s.statVal, { color: COLORS.green }]}>{item.opened?.toLocaleString()}</Text>
                    <Text style={s.statLbl}>Ouverts</Text>
                  </View>
                  <View style={s.statItem}>
                    <Text style={[s.statVal, { color: COLORS.orange }]}>{openRate}%</Text>
                    <Text style={s.statLbl}>Taux d'ouv.</Text>
                  </View>
                </View>
              )}

              {item.scheduledAt && item.status === 'SCHEDULED' && (
                <Text style={s.scheduledAt}>
                  📅 Planifiée le {new Date(item.scheduledAt).toLocaleString('fr-TN')}
                </Text>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📣</Text>
            <Text style={s.emptyTitle}>Aucune campagne</Text>
            <Text style={s.emptySub}>Créez votre première campagne de notifications push.</Text>
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
  card: { backgroundColor: COLORS.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 10, padding: 14, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 3, marginTop: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  cardBody: { color: COLORS.muted, fontSize: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  statusTxt: { fontSize: 10, fontWeight: '700' },
  audienceChip: { color: COLORS.muted, fontSize: 11, backgroundColor: COLORS.surfaceAlt || '#16161F', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: COLORS.border },
  statsRow: { flexDirection: 'row', gap: 16, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 15, fontWeight: '800' },
  statLbl: { color: COLORS.muted, fontSize: 9 },
  scheduledAt: { color: COLORS.blue, fontSize: 11, marginTop: 8 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center' },
});
