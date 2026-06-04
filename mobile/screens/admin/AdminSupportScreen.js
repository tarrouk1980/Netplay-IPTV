import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert, TextInput, Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const TABS = ['Ouverts', 'En cours', 'Fermés'];
const STATUS_TAB = { OPEN: 0, IN_PROGRESS: 1, CLOSED: 2 };
const PRIORITY_COLOR = { HIGH: COLORS.red, MEDIUM: COLORS.orange, LOW: COLORS.muted };

const MOCK_TICKETS = [
  { id: 'TK001', subject: 'Problème de paiement', user: 'Nadia K.', role: 'CLIENT', status: 'OPEN', priority: 'HIGH', createdAt: '03 juin 14:32', message: 'Ma carte a été débitée mais la course n\'apparaît pas.' },
  { id: 'TK002', subject: 'KYC refusé sans raison', user: 'Karim B.', role: 'CHAUFFEUR', status: 'IN_PROGRESS', priority: 'MEDIUM', createdAt: '02 juin 09:15', message: 'Mon dossier KYC a été refusé sans explication claire.' },
  { id: 'TK003', subject: 'Application plante au démarrage', user: 'Ahmed R.', role: 'CLIENT', status: 'OPEN', priority: 'LOW', createdAt: '01 juin 18:00', message: 'L\'app se ferme dès que j\'essaie de commander.' },
  { id: 'TK004', subject: 'Course non attribuée', user: 'Sara M.', role: 'CLIENT', status: 'CLOSED', priority: 'MEDIUM', createdAt: '30 mai 11:20', message: 'J\'ai attendu 15 min sans chauffeur.' },
];

function TicketCard({ item, onOpen }) {
  const tabIdx = STATUS_TAB[item.status] ?? 0;
  const pColor = PRIORITY_COLOR[item.priority] || COLORS.muted;
  return (
    <TouchableOpacity style={styles.card} onPress={() => onOpen(item)} activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <View style={[styles.priorityDot, { backgroundColor: pColor }]} />
          <View>
            <Text style={styles.ticketId}>#{item.id}</Text>
            <Text style={styles.ticketSubject}>{item.subject}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, {
          backgroundColor: tabIdx === 0 ? COLORS.orange + '20' : tabIdx === 1 ? COLORS.blue + '20' : COLORS.green + '20',
          borderColor: tabIdx === 0 ? COLORS.orange + '50' : tabIdx === 1 ? COLORS.blue + '50' : COLORS.green + '50',
        }]}>
          <Text style={[styles.statusText, { color: tabIdx === 0 ? COLORS.orange : tabIdx === 1 ? COLORS.blue : COLORS.green }]}>
            {item.status === 'OPEN' ? 'Ouvert' : item.status === 'IN_PROGRESS' ? 'En cours' : 'Fermé'}
          </Text>
        </View>
      </View>
      <Text style={styles.ticketUser}>👤 {item.user} · {item.role}</Text>
      <Text style={styles.ticketMessage} numberOfLines={2}>{item.message}</Text>
      <Text style={styles.ticketDate}>{item.createdAt}</Text>
    </TouchableOpacity>
  );
}

export default function AdminSupportScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/admin/support')
      .then(r => setTickets(r.data.tickets || MOCK_TICKETS))
      .catch(() => setTickets(MOCK_TICKETS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/api/admin/support/${selected.id}/reply`, { message: reply.trim() });
      setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, status: 'IN_PROGRESS' } : t));
      setSelected(s => ({ ...s, status: 'IN_PROGRESS' }));
      setReply('');
    } catch { Alert.alert('Erreur', 'Impossible d\'envoyer la réponse.'); }
    finally { setSending(false); }
  };

  const handleClose = async () => {
    Alert.alert('Fermer le ticket ?', '', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Fermer', onPress: async () => {
          try {
            await api.post(`/api/admin/support/${selected.id}/close`);
            setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, status: 'CLOSED' } : t));
            setSelected(null);
          } catch { Alert.alert('Erreur', 'Impossible de fermer.'); }
        },
      },
    ]);
  };

  const filtered = tickets.filter(t => (STATUS_TAB[t.status] ?? 0) === tab);
  const openCount = tickets.filter(t => t.status === 'OPEN').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.headerTitle}>Support client</Text>
          {openCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{openCount}</Text></View>}
        </View>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}>
          <Text style={{ color: COLORS.accent, fontSize: 20 }}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={i} style={[styles.tabBtn, tab === i && styles.tabBtnActive]} onPress={() => setTab(i)}>
            <Text style={[styles.tabLabel, tab === i && styles.tabLabelActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={t => t.id}
          renderItem={({ item }) => <TicketCard item={item} onOpen={setSelected} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ fontSize: 40 }}>💬</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucun ticket ici</Text>
            </View>
          }
        />
      )}

      {/* Detail modal */}
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>#{selected?.id} · {selected?.subject}</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={{ color: COLORS.muted, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalUser}>👤 {selected?.user} · {selected?.role}</Text>
            <View style={styles.modalMessageBox}>
              <Text style={styles.modalMessage}>{selected?.message}</Text>
            </View>

            {selected?.status !== 'CLOSED' && (
              <>
                <TextInput
                  style={styles.replyInput}
                  value={reply}
                  onChangeText={setReply}
                  placeholder="Votre réponse..."
                  placeholderTextColor={COLORS.muted}
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.closeTicketBtn} onPress={handleClose}>
                    <Text style={styles.closeTicketText}>Fermer ticket</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.replyBtn, (!reply.trim() || sending) && { opacity: 0.5 }]}
                    onPress={handleReply}
                    disabled={!reply.trim() || sending}
                  >
                    {sending
                      ? <ActivityIndicator color="#000" size="small" />
                      : <Text style={styles.replyBtnText}>Répondre</Text>
                    }
                  </TouchableOpacity>
                </View>
              </>
            )}
            {selected?.status === 'CLOSED' && (
              <View style={styles.closedBanner}>
                <Text style={styles.closedBannerText}>✓ Ticket fermé</Text>
              </View>
            )}
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
  badge: { backgroundColor: COLORS.red, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  refreshBtn: { width: 40, alignItems: 'flex-end' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  tabLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tabLabelActive: { color: COLORS.accent },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  ticketId: { color: COLORS.muted, fontSize: 11 },
  ticketSubject: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginTop: 1 },
  statusBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  ticketUser: { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  ticketMessage: { color: COLORS.muted, fontSize: 13, lineHeight: 18, marginBottom: 8 },
  ticketDate: { color: COLORS.muted, fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderWidth: 1, borderColor: COLORS.border,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  modalTitle: { color: COLORS.text, fontSize: 15, fontWeight: '800', flex: 1, marginRight: 10 },
  modalUser: { color: COLORS.muted, fontSize: 12, marginBottom: 10 },
  modalMessageBox: {
    backgroundColor: COLORS.bg, borderRadius: 12, padding: 12, marginBottom: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  modalMessage: { color: COLORS.text, fontSize: 14, lineHeight: 20 },
  replyInput: {
    backgroundColor: COLORS.bg, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border,
    marginBottom: 12, textAlignVertical: 'top', height: 80,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  closeTicketBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1, borderColor: COLORS.muted,
    paddingVertical: 11, alignItems: 'center',
  },
  closeTicketText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  replyBtn: { flex: 2, borderRadius: 12, backgroundColor: COLORS.accent, paddingVertical: 11, alignItems: 'center' },
  replyBtnText: { color: '#000', fontSize: 13, fontWeight: '800' },
  closedBanner: {
    backgroundColor: COLORS.green + '20', borderRadius: 12, paddingVertical: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.green + '40',
  },
  closedBannerText: { color: COLORS.green, fontSize: 14, fontWeight: '700' },
});
