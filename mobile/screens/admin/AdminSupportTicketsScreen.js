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

const STATUS_CONFIG = {
  OPEN: { color: COLORS.orange, label: 'Ouvert', icon: '🔔' },
  IN_PROGRESS: { color: COLORS.blue, label: 'En cours', icon: '💬' },
  RESOLVED: { color: COLORS.green, label: 'Résolu', icon: '✅' },
  CLOSED: { color: COLORS.muted, label: 'Fermé', icon: '🔒' },
};

const PRIORITY_CONFIG = {
  LOW: { color: COLORS.muted, label: 'Basse' },
  MEDIUM: { color: COLORS.orange, label: 'Moyenne' },
  HIGH: { color: COLORS.accent, label: 'Haute' },
  URGENT: { color: '#B71C1C', label: '🚨 Urgent' },
};

const CATEGORY_ICONS = {
  PAYMENT: '💳',
  ACCOUNT: '👤',
  ORDER: '📦',
  DRIVER: '🚕',
  APP_BUG: '🐛',
  OTHER: '💬',
};

const MOCK_TICKETS = [
  { id: 'tkt-001', subject: 'Paiement débité mais commande non confirmée', category: 'PAYMENT', status: 'OPEN', priority: 'HIGH', userName: 'Sami B.', userRole: 'CLIENT', createdAt: new Date(Date.now() - 1 * 3600000).toISOString(), messages: [{ from: 'user', text: 'J\'ai été débité de 25 TND mais la commande reste en attente.', at: new Date(Date.now() - 3600000).toISOString() }] },
  { id: 'tkt-002', subject: 'Mon compte a été suspendu injustement', category: 'ACCOUNT', status: 'IN_PROGRESS', priority: 'MEDIUM', userName: 'Karim A.', userRole: 'CHAUFFEUR', createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), messages: [] },
  { id: 'tkt-003', subject: 'Application plante au démarrage', category: 'APP_BUG', status: 'OPEN', priority: 'URGENT', userName: 'Leila M.', userRole: 'CLIENT', createdAt: new Date(Date.now() - 30 * 60000).toISOString(), messages: [] },
  { id: 'tkt-004', subject: 'Remboursement non reçu après annulation', category: 'PAYMENT', status: 'RESOLVED', priority: 'LOW', userName: 'Ahmed T.', userRole: 'CLIENT', createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), messages: [] },
];

function TicketModal({ ticket, onClose, onStatusChange }) {
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  if (!ticket) return null;
  const st = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
  const pr = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.MEDIUM;

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/api/admin/support/${ticket.id}/reply`, { message: reply });
      setReply('');
      Alert.alert('Réponse envoyée ✅');
    } catch {
      Alert.alert('Erreur', 'Impossible d\'envoyer la réponse.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.sheet}>
          <View style={m.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={m.subject} numberOfLines={2}>{ticket.subject}</Text>
              <Text style={m.meta}>{CATEGORY_ICONS[ticket.category] || '💬'} {ticket.userName} · {ticket.userRole}</Text>
            </View>
            <TouchableOpacity onPress={onClose}><Text style={{ color: COLORS.muted, fontSize: 20 }}>✕</Text></TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <View style={[m.badge, { backgroundColor: st.color + '22', borderColor: st.color }]}>
              <Text style={{ color: st.color, fontSize: 10, fontWeight: '700' }}>{st.icon} {st.label}</Text>
            </View>
            <View style={[m.badge, { backgroundColor: pr.color + '22', borderColor: pr.color }]}>
              <Text style={{ color: pr.color, fontSize: 10, fontWeight: '700' }}>{pr.label}</Text>
            </View>
          </View>

          <ScrollView style={{ maxHeight: 180 }} showsVerticalScrollIndicator={false}>
            {(ticket.messages || []).map((msg, i) => (
              <View key={i} style={[m.msgBubble, msg.from === 'admin' && m.msgBubbleAdmin]}>
                <Text style={m.msgFrom}>{msg.from === 'admin' ? '🛡 Admin' : '👤 ' + ticket.userName}</Text>
                <Text style={m.msgTxt}>{msg.text}</Text>
              </View>
            ))}
          </ScrollView>

          <TextInput
            style={m.replyInput}
            value={reply}
            onChangeText={setReply}
            placeholder="Répondre au client..."
            placeholderTextColor={COLORS.muted}
            multiline
            numberOfLines={3}
          />

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <TouchableOpacity style={[m.btn, { flex: 1, backgroundColor: COLORS.blue }]} onPress={sendReply} disabled={sending}>
              <Text style={m.btnTxt}>{sending ? '...' : '📤 Envoyer'}</Text>
            </TouchableOpacity>
            {ticket.status !== 'RESOLVED' && (
              <TouchableOpacity
                style={[m.btn, { flex: 1, backgroundColor: COLORS.green }]}
                onPress={() => onStatusChange(ticket.id, 'RESOLVED')}
              >
                <Text style={m.btnTxt}>✅ Résoudre</Text>
              </TouchableOpacity>
            )}
            {ticket.status !== 'CLOSED' && (
              <TouchableOpacity
                style={[m.btn, { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }]}
                onPress={() => onStatusChange(ticket.id, 'CLOSED')}
              >
                <Text style={[m.btnTxt, { color: COLORS.muted }]}>🔒</Text>
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
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  subject: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  meta: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  msgBubble: { backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 10, marginBottom: 8 },
  msgBubbleAdmin: { backgroundColor: COLORS.blue + '22', borderWidth: 1, borderColor: COLORS.blue + '44' },
  msgFrom: { color: COLORS.muted, fontSize: 10, fontWeight: '700', marginBottom: 4 },
  msgTxt: { color: COLORS.text, fontSize: 13 },
  replyInput: { backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 12, color: COLORS.text, fontSize: 13, borderWidth: 1, borderColor: COLORS.border, textAlignVertical: 'top', marginTop: 10 },
  btn: { borderRadius: 10, paddingVertical: 11, paddingHorizontal: 14, alignItems: 'center' },
  btnTxt: { color: '#FFF', fontSize: 13, fontWeight: '700' },
});

const FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'];

export default function AdminSupportTicketsScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async (silent = false) => {
    try {
      const res = await api.get('/api/admin/support/tickets');
      setTickets(res.data.tickets || []);
    } catch {
      if (!silent) setTickets(MOCK_TICKETS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await api.patch(`/api/admin/support/${ticketId}`, { status: newStatus });
      setSelected(null);
      load(true);
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour le ticket.');
    }
  };

  const filtered = filter === 'ALL' ? tickets : tickets.filter((t) => t.status === filter);
  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const urgentCount = tickets.filter((t) => t.priority === 'URGENT').length;

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.blue} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>🎧 Support tickets</Text>
          <Text style={s.sub}>{openCount} ouvert{openCount !== 1 ? 's' : ''}{urgentCount > 0 ? ` · 🚨 ${urgentCount} urgent${urgentCount !== 1 ? 's' : ''}` : ''}</Text>
        </View>
        <View style={s.badge}>
          <Text style={s.badgeTxt}>{tickets.length}</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={s.filterRow}>
        {FILTERS.map((f) => {
          const count = f === 'ALL' ? tickets.length : tickets.filter((t) => t.status === f).length;
          const cfg = STATUS_CONFIG[f];
          return (
            <TouchableOpacity
              key={f}
              style={[s.filterTab, filter === f && s.filterTabActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[s.filterTxt, filter === f && s.filterTxtActive]}>
                {cfg?.icon || '📋'} {count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered.sort((a, b) => {
          const pr = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
          return (pr[a.priority] ?? 2) - (pr[b.priority] ?? 2);
        })}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={COLORS.blue} />
        }
        renderItem={({ item }) => {
          const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.OPEN;
          const pr = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.MEDIUM;
          const elapsed = Math.floor((Date.now() - new Date(item.createdAt)) / 3600000);
          return (
            <TouchableOpacity
              style={[s.card, { borderLeftColor: pr.color }]}
              onPress={() => setSelected(item)}
            >
              <View style={s.cardTop}>
                <Text style={{ fontSize: 18 }}>{CATEGORY_ICONS[item.category] || '💬'}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.subject} numberOfLines={1}>{item.subject}</Text>
                  <Text style={s.meta}>{item.userName} · {item.userRole}</Text>
                </View>
                <View style={[s.statusDot, { backgroundColor: st.color }]} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <View style={[s.chip, { borderColor: st.color }]}>
                    <Text style={[s.chipTxt, { color: st.color }]}>{st.label}</Text>
                  </View>
                  <View style={[s.chip, { borderColor: pr.color }]}>
                    <Text style={[s.chipTxt, { color: pr.color }]}>{pr.label}</Text>
                  </View>
                </View>
                <Text style={[s.elapsed, elapsed > 24 && { color: COLORS.accent }]}>
                  {elapsed < 1 ? '< 1h' : `${elapsed}h`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🎧</Text>
            <Text style={s.emptyTitle}>Aucun ticket {filter !== 'ALL' ? filter.toLowerCase() : ''}</Text>
            <Text style={s.emptySub}>Tous les tickets support apparaîtront ici.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      <TicketModal
        ticket={selected}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
      />
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
  badge: { backgroundColor: COLORS.blue, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTxt: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  filterTab: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  filterTabActive: { borderColor: COLORS.blue, backgroundColor: COLORS.blue + '22' },
  filterTxt: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  filterTxtActive: { color: COLORS.blue },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 8, padding: 14, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  subject: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  meta: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  chip: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1 },
  chipTxt: { fontSize: 10, fontWeight: '700' },
  elapsed: { color: COLORS.muted, fontSize: 11 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center' },
});
