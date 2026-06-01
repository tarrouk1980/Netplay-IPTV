import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  TextInput,
  Modal,
  RefreshControl,
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
  accent: '#D32F2F',
  green: '#27AE60',
  orange: '#F57C00',
  blue: '#1565C0',
};

const ACTION_COLORS = {
  BAN: COLORS.accent,
  WARN: COLORS.orange,
  SUSPEND: '#F57C00',
  UNBAN: COLORS.green,
  NOTE: COLORS.blue,
};

const ACTION_ICONS = {
  BAN: '🚫',
  WARN: '⚠️',
  SUSPEND: '⏸',
  UNBAN: '✅',
  NOTE: '📝',
};

function AppealModal({ visible, appeal, onClose, onResolve }) {
  const [decision, setDecision] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (accepted) => {
    setLoading(true);
    try {
      await onResolve(appeal.id, accepted, decision.trim());
      setDecision('');
      onClose();
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.card}>
          <Text style={m.title}>📬 Appel reçu</Text>
          <Text style={m.reason}>{appeal?.reason || '(Aucune raison fournie)'}</Text>
          <TextInput
            style={m.input}
            placeholder="Décision / commentaire admin..."
            placeholderTextColor={COLORS.muted}
            value={decision}
            onChangeText={setDecision}
            multiline
            autoFocus
          />
          {loading ? (
            <ActivityIndicator color={COLORS.green} />
          ) : (
            <View style={m.btns}>
              <TouchableOpacity style={m.rejectBtn} onPress={() => handle(false)}>
                <Text style={m.rejectTxt}>❌ Rejeter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={m.acceptBtn} onPress={() => handle(true)}>
                <Text style={m.acceptTxt}>✅ Accepter</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity style={m.closeBtn} onPress={onClose}>
            <Text style={m.closeTxt}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, width: '100%', borderWidth: 1, borderColor: COLORS.border },
  title: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 8 },
  reason: { color: COLORS.muted, fontSize: 13, marginBottom: 14, lineHeight: 18 },
  input: { backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 12, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, minHeight: 70, textAlignVertical: 'top', marginBottom: 14 },
  btns: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  rejectBtn: { flex: 1, backgroundColor: COLORS.accent + '22', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.accent },
  rejectTxt: { color: COLORS.accent, fontWeight: '700' },
  acceptBtn: { flex: 1, backgroundColor: COLORS.green + '22', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.green },
  acceptTxt: { color: COLORS.green, fontWeight: '700' },
  closeBtn: { alignItems: 'center', paddingVertical: 6 },
  closeTxt: { color: COLORS.muted, fontSize: 13 },
});

export default function AdminUserBanHistoryScreen({ route, navigation }) {
  const { userId, userName } = route.params || {};
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appealModal, setAppealModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/admin/users/${userId}/ban-history`);
      setHistory(res.data.history || []);
      setUser(res.data.user || { name: userName, id: userId });
    } catch {
      setHistory([]);
      setUser({ name: userName, id: userId });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleUnban = () => {
    Alert.alert('Débannir ?', `Confirmer le débannissement de ${user?.name} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Débannir',
        onPress: async () => {
          setActionLoading('unban');
          try {
            await api.post(`/api/admin/users/${userId}/unban`);
            Alert.alert('Succès', 'Utilisateur débanni.');
            load();
          } catch (e) {
            Alert.alert('Erreur', e?.response?.data?.error || 'Erreur');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const handleResolveAppeal = async (appealId, accepted, note) => {
    await api.patch(`/api/admin/appeals/${appealId}`, { accepted, adminNote: note });
    Alert.alert(accepted ? 'Appel accepté ✅' : 'Appel rejeté', accepted ? 'L\'utilisateur a été débanni.' : 'L\'appel a été rejeté.');
    load();
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  const currentlyBanned = user?.isBanned;
  const pendingAppeals = history.filter((h) => h.type === 'APPEAL' && h.status === 'PENDING');

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>📋 Historique — {user?.name || userName}</Text>
          {currentlyBanned && (
            <Text style={s.bannedTag}>🚫 Actuellement banni</Text>
          )}
        </View>
        {pendingAppeals.length > 0 && (
          <View style={s.appealBadge}>
            <Text style={s.appealBadgeTxt}>{pendingAppeals.length} appel{pendingAppeals.length > 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.accent} />}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
      >
        {/* Pending appeals */}
        {pendingAppeals.length > 0 && (
          <View style={s.alertBox}>
            <Text style={s.alertTitle}>📬 Appels en attente de traitement</Text>
            {pendingAppeals.map((a) => (
              <TouchableOpacity key={a.id} style={s.appealItem} onPress={() => setAppealModal(a)}>
                <Text style={s.appealDate}>{new Date(a.createdAt).toLocaleDateString('fr-TN')}</Text>
                <Text style={s.appealReason} numberOfLines={2}>{a.reason || '(Aucune raison)'}</Text>
                <Text style={s.appealAction}>Traiter →</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Timeline */}
        {history.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>✅</Text>
            <Text style={s.emptyTitle}>Aucune action disciplinaire</Text>
            <Text style={s.emptySub}>Cet utilisateur n'a reçu aucun avertissement ou sanction.</Text>
          </View>
        ) : (
          <View style={s.timeline}>
            {history.map((item, i) => {
              const color = ACTION_COLORS[item.type] || COLORS.muted;
              const icon = ACTION_ICONS[item.type] || '•';
              return (
                <View key={item.id} style={s.timelineItem}>
                  <View style={s.timelineLeft}>
                    <View style={[s.dot, { backgroundColor: color }]}>
                      <Text style={{ fontSize: 10 }}>{icon}</Text>
                    </View>
                    {i < history.length - 1 && <View style={[s.line, { borderColor: color + '44' }]} />}
                  </View>
                  <View style={s.timelineContent}>
                    <View style={s.timelineHeader}>
                      <Text style={[s.timelineType, { color }]}>{item.type}</Text>
                      <Text style={s.timelineDate}>
                        {new Date(item.createdAt).toLocaleDateString('fr-TN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </Text>
                    </View>
                    {item.reason && <Text style={s.timelineReason}>{item.reason}</Text>}
                    {item.adminNote && <Text style={s.timelineAdminNote}>Admin: {item.adminNote}</Text>}
                    {item.performedBy && <Text style={s.timelineBy}>Par: {item.performedBy}</Text>}
                    {item.duration && <Text style={s.timelineDuration}>Durée: {item.duration}</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Actions */}
        {currentlyBanned && (
          <TouchableOpacity
            style={s.unbanBtn}
            onPress={handleUnban}
            disabled={actionLoading === 'unban'}
          >
            {actionLoading === 'unban' ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={s.unbanTxt}>✅ Lever le ban</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={s.profileBtn}
          onPress={() => navigation.navigate('AdminUserDetail', { userId })}
        >
          <Text style={s.profileBtnTxt}>👤 Voir le profil complet →</Text>
        </TouchableOpacity>
      </ScrollView>

      <AppealModal
        visible={!!appealModal}
        appeal={appealModal}
        onClose={() => setAppealModal(null)}
        onResolve={handleResolveAppeal}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  bannedTag: { color: COLORS.accent, fontSize: 11, fontWeight: '700', marginTop: 2 },
  appealBadge: {
    backgroundColor: COLORS.orange,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  appealBadgeTxt: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  alertBox: {
    backgroundColor: COLORS.orange + '11',
    borderWidth: 1,
    borderColor: COLORS.orange,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
  },
  alertTitle: { color: COLORS.orange, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  appealItem: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  appealDate: { color: COLORS.muted, fontSize: 11, marginBottom: 4 },
  appealReason: { color: COLORS.text, fontSize: 13, marginBottom: 6 },
  appealAction: { color: COLORS.orange, fontSize: 12, fontWeight: '700', alignSelf: 'flex-end' },
  timeline: { paddingHorizontal: 16 },
  timelineItem: { flexDirection: 'row', marginBottom: 8 },
  timelineLeft: { alignItems: 'center', width: 32 },
  dot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  line: { flex: 1, width: 0, borderWidth: 1, borderStyle: 'dashed', marginVertical: 2 },
  timelineContent: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginLeft: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  timelineType: { fontSize: 13, fontWeight: '700' },
  timelineDate: { color: COLORS.muted, fontSize: 11 },
  timelineReason: { color: COLORS.text, fontSize: 13, lineHeight: 18, marginBottom: 4 },
  timelineAdminNote: { color: COLORS.muted, fontSize: 12, fontStyle: 'italic' },
  timelineBy: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  timelineDuration: { color: COLORS.orange, fontSize: 11, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center' },
  unbanBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    alignItems: 'center',
  },
  unbanTxt: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  profileBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileBtnTxt: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
});
