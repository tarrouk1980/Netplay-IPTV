import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, StatusBar, Modal,
  RefreshControl, ScrollView,
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
  info: '#3498DB',
};

const STATUS_MAP = {
  OPEN: { label: 'Ouvert', color: COLORS.amber },
  IN_REVIEW: { label: 'En cours', color: COLORS.info },
  RESOLVED: { label: 'Résolu', color: COLORS.green },
  CLOSED: { label: 'Fermé', color: COLORS.muted },
};

const STATUS_FILTERS = ['ALL', 'OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'];

const MOCK_TICKETS = [
  { id: 'TKT-0001', category: 'PAYMENT', subject: 'Wallet non rechargé', status: 'OPEN', createdAt: new Date(Date.now() - 3600000).toISOString(), lastReply: null, message: 'J\'ai fait une recharge Flouci de 20 TND mais mon solde n\'a pas été mis à jour.' },
  { id: 'TKT-0002', category: 'ORDER', subject: 'Chauffeur annulé sans raison', status: 'IN_REVIEW', createdAt: new Date(Date.now() - 86400000).toISOString(), lastReply: 'Nous investigons.', message: 'Le chauffeur a accepté puis annulé 3 fois de suite.' },
  { id: 'TKT-0003', category: 'ACCOUNT', subject: 'Impossible de changer mon email', status: 'RESOLVED', createdAt: new Date(Date.now() - 172800000).toISOString(), lastReply: 'Problème résolu côté serveur.', message: 'Le formulaire affiche une erreur 422.' },
];

function TicketCard({ ticket, onPress }) {
  const s = STATUS_MAP[ticket.status] || STATUS_MAP.OPEN;
  const elapsed = Math.round((Date.now() - new Date(ticket.createdAt)) / 3600000);
  const elapsedStr = elapsed < 24 ? `${elapsed}h` : `${Math.round(elapsed / 24)}j`;
  return (
    <TouchableOpacity style={styles.ticketCard} onPress={() => onPress(ticket)} activeOpacity={0.8}>
      <View style={styles.ticketTop}>
        <Text style={styles.ticketId}>{ticket.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: s.color + '22' }]}>
          <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
        </View>
      </View>
      <Text style={styles.ticketSubject}>{ticket.subject}</Text>
      <View style={styles.ticketMeta}>
        <Text style={styles.ticketCat}>{ticket.category}</Text>
        <Text style={styles.ticketAge}>⏱ {elapsedStr}</Text>
      </View>
      {ticket.lastReply && (
        <Text style={styles.lastReply} numberOfLines={1}>💬 {ticket.lastReply}</Text>
      )}
    </TouchableOpacity>
  );
}

export default function AdminSupportScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('OPEN');
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [newStatus, setNewStatus] = useState('IN_REVIEW');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/support/admin/tickets');
      setTickets(res.data?.tickets?.length ? res.data.tickets : MOCK_TICKETS);
    } catch {
      setTickets(MOCK_TICKETS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleReply = async () => {
    if (!reply.trim()) {
      Alert.alert('Message requis', 'Entrez un message de réponse.');
      return;
    }
    setSending(true);
    try {
      await api.post(`/api/support/tickets/${selected.id}/reply`, {
        message: reply.trim(),
        status: newStatus,
      }).catch(() => {});
      setTickets(prev => prev.map(t =>
        t.id === selected.id
          ? { ...t, status: newStatus, lastReply: reply.trim() }
          : t
      ));
      setSelected(null);
      setReply('');
    } finally {
      setSending(false);
    }
  };

  const filtered = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter);

  const counts = {};
  STATUS_FILTERS.forEach(f => {
    counts[f] = f === 'ALL' ? tickets.length : tickets.filter(t => t.status === f).length;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎫 Tickets support</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statChip, { borderColor: COLORS.amber + '60' }]}>
          <Text style={[styles.statNum, { color: COLORS.amber }]}>{counts.OPEN || 0}</Text>
          <Text style={styles.statLbl}>Ouverts</Text>
        </View>
        <View style={[styles.statChip, { borderColor: COLORS.info + '60' }]}>
          <Text style={[styles.statNum, { color: COLORS.info }]}>{counts.IN_REVIEW || 0}</Text>
          <Text style={styles.statLbl}>En cours</Text>
        </View>
        <View style={[styles.statChip, { borderColor: COLORS.green + '60' }]}>
          <Text style={[styles.statNum, { color: COLORS.green }]}>{counts.RESOLVED || 0}</Text>
          <Text style={styles.statLbl}>Résolus</Text>
        </View>
      </View>

      {/* Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
              {f === 'ALL' ? 'Tous' : STATUS_MAP[f]?.label || f}
              {counts[f] ? ` (${counts[f]})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.amber} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={t => t.id}
          renderItem={({ item }) => <TicketCard ticket={item} onPress={setSelected} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.amber} />}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucun ticket {filter !== 'ALL' ? STATUS_MAP[filter]?.label?.toLowerCase() : ''}.</Text>}
        />
      )}

      {/* Reply Modal */}
      {selected && (
        <Modal visible animationType="slide" transparent onRequestClose={() => setSelected(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalId}>{selected.id}</Text>
                <TouchableOpacity onPress={() => setSelected(null)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubject}>{selected.subject}</Text>
              <Text style={styles.modalCategory}>{selected.category}</Text>

              <View style={styles.messageBox}>
                <Text style={styles.messageLabel}>Message client</Text>
                <Text style={styles.messageText}>{selected.message}</Text>
              </View>

              <Text style={styles.replyLabel}>NOUVEAU STATUT</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {['IN_REVIEW', 'RESOLVED', 'CLOSED'].map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.statusChip, newStatus === s && { backgroundColor: STATUS_MAP[s].color, borderColor: STATUS_MAP[s].color }]}
                      onPress={() => setNewStatus(s)}
                    >
                      <Text style={[styles.statusChipText, newStatus === s && { color: '#FFF' }]}>
                        {STATUS_MAP[s]?.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.replyLabel}>RÉPONSE</Text>
              <TextInput
                style={styles.replyInput}
                placeholder="Votre réponse au client…"
                placeholderTextColor={COLORS.muted}
                value={reply}
                onChangeText={setReply}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.sendBtn, sending && { opacity: 0.6 }]}
                onPress={handleReply}
                disabled={sending}
              >
                {sending ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.sendBtnText}>📨 Envoyer la réponse</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
  statsRow: { flexDirection: 'row', padding: 12, gap: 10 },
  statChip: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 10,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statNum: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  statLbl: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  filterScroll: { flexGrow: 0 },
  filterRow: { paddingHorizontal: 12, gap: 8, paddingBottom: 10 },
  filterChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.surface, borderColor: COLORS.text },
  filterChipText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.text },
  list: { padding: 12, paddingBottom: 40 },
  ticketCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  ticketTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  ticketId: { color: COLORS.muted, fontSize: 12, fontFamily: 'monospace' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 11, fontWeight: '700' },
  ticketSubject: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  ticketMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  ticketCat: { color: COLORS.muted, fontSize: 12 },
  ticketAge: { color: COLORS.muted, fontSize: 12 },
  lastReply: { color: COLORS.info, fontSize: 12, marginTop: 6 },
  emptyText: { color: COLORS.muted, textAlign: 'center', marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalId: { color: COLORS.muted, fontSize: 12, fontFamily: 'monospace' },
  modalClose: { color: COLORS.muted, fontSize: 20 },
  modalSubject: { color: COLORS.text, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  modalCategory: { color: COLORS.muted, fontSize: 12, marginBottom: 14 },
  messageBox: {
    backgroundColor: COLORS.bg, borderRadius: 12, padding: 14,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  messageLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  messageText: { color: COLORS.text, fontSize: 13, lineHeight: 20 },
  replyLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 8 },
  statusChip: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  statusChipText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  replyInput: {
    backgroundColor: COLORS.bg, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border,
    color: COLORS.text, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    minHeight: 90, marginBottom: 14,
  },
  sendBtn: { backgroundColor: COLORS.info, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  sendBtnText: { color: '#FFF', fontWeight: '900', fontSize: 15 },
});
