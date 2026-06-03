import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22', purple: '#9B59B6',
};

const STATUS_MAP = {
  open: { label: 'Ouvert', color: COLORS.blue, bg: '#08141A' },
  in_progress: { label: 'En traitement', color: COLORS.orange, bg: '#2A1A08' },
  resolved: { label: 'Résolu', color: COLORS.green, bg: '#0D2E0D' },
  closed: { label: 'Fermé', color: COLORS.muted, bg: COLORS.surfaceAlt },
};

const PRIORITY_MAP = {
  high: { label: 'Haute', color: COLORS.red },
  medium: { label: 'Moyenne', color: COLORS.orange },
  low: { label: 'Basse', color: COLORS.muted },
};

const MOCK_TICKET = {
  id: 'TKT-00821',
  subject: 'Chauffeur non présenté — remboursement demandé',
  category: 'Réclamation taxi',
  priority: 'high',
  status: 'in_progress',
  createdAt: '03/06/2024 à 12:15',
  updatedAt: '03/06/2024 à 14:02',
  user: { name: 'Tarek Tarrouk', phone: '+216 20 000 000', role: 'CLIENT', id: 'USR-0042' },
  orderId: 'TXI-8841',
  messages: [
    {
      id: 1, from: 'user', sender: 'Tarek Tarrouk',
      time: '12:15', text: 'Bonjour, j\'ai commandé un taxi à 11h45 et le chauffeur ne s\'est pas présenté. J\'ai attendu 25 minutes. Je demande un remboursement total.',
    },
    {
      id: 2, from: 'admin', sender: 'Support EASYWAY',
      time: '12:35', text: 'Bonjour Monsieur Tarrouk, nous avons bien reçu votre réclamation. Nous allons vérifier le dossier du chauffeur et vous recontacter dans les 24h.',
    },
    {
      id: 3, from: 'user', sender: 'Tarek Tarrouk',
      time: '13:10', text: 'D\'accord, j\'attends votre réponse. Mais je signale que ce n\'est pas la première fois.',
    },
  ],
};

export default function AdminSupportTicketsDetailScreen({ navigation, route }) {
  const ticket = route.params?.ticket || MOCK_TICKET;
  const [messages, setMessages] = useState(ticket.messages);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState(ticket.status);

  const sc = STATUS_MAP[status] || STATUS_MAP.open;
  const pc = PRIORITY_MAP[ticket.priority] || PRIORITY_MAP.low;

  const sendReply = async () => {
    if (!reply.trim()) return;
    const msg = {
      id: Date.now(), from: 'admin', sender: 'Support EASYWAY',
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      text: reply.trim(),
    };
    setMessages(prev => [...prev, msg]);
    setReply('');
    try {
      // await api.post(`/admin/tickets/${ticket.id}/reply`, { text: reply });
    } catch {}
  };

  const updateStatus = async (newStatus) => {
    setStatus(newStatus);
    try {
      // await api.put(`/admin/tickets/${ticket.id}/status`, { status: newStatus });
    } catch {}
    Alert.alert('Statut mis à jour', `Ticket marqué comme : ${STATUS_MAP[newStatus]?.label}`);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Ticket #{ticket.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
          </View>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

        {/* Ticket Info */}
        <View style={styles.ticketCard}>
          <Text style={styles.ticketSubject}>{ticket.subject}</Text>
          <View style={styles.ticketMeta}>
            <Text style={styles.metaItem}>🏷 {ticket.category}</Text>
            <Text style={[styles.metaItem, { color: pc.color }]}>⚡ Priorité {pc.label}</Text>
          </View>
          <View style={styles.ticketMeta}>
            <Text style={styles.metaItem}>🕐 {ticket.createdAt}</Text>
            {ticket.orderId && <Text style={styles.metaItem}>📦 {ticket.orderId}</Text>}
          </View>
        </View>

        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={{ fontSize: 24 }}>👤</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{ticket.user.name}</Text>
            <Text style={styles.userMeta}>{ticket.user.phone} · {ticket.user.role}</Text>
            <Text style={styles.userMeta}>ID: {ticket.user.id}</Text>
          </View>
          <TouchableOpacity
            style={styles.viewProfileBtn}
            onPress={() => navigation.navigate('AdminUserDetail', { userId: ticket.user.id })}
          >
            <Text style={styles.viewProfileText}>Profil ›</Text>
          </TouchableOpacity>
        </View>

        {/* Status Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Changer le statut</Text>
          <View style={styles.statusBtns}>
            {Object.entries(STATUS_MAP).map(([key, val]) => (
              <TouchableOpacity
                key={key}
                style={[styles.statusBtn, status === key && { backgroundColor: val.bg, borderColor: val.color }]}
                onPress={() => updateStatus(key)}
              >
                <Text style={[styles.statusBtnText, status === key && { color: val.color, fontWeight: '700' }]}>
                  {val.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Messages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Conversation</Text>
          {messages.map((m) => {
            const isAdmin = m.from === 'admin';
            return (
              <View key={m.id} style={[styles.msgBubble, isAdmin ? styles.msgAdmin : styles.msgUser]}>
                <View style={styles.msgHeader}>
                  <Text style={styles.msgSender}>{m.sender}</Text>
                  <Text style={styles.msgTime}>{m.time}</Text>
                </View>
                <Text style={styles.msgText}>{m.text}</Text>
              </View>
            );
          })}
        </View>

        {/* Quick Replies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Réponses rapides</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.quickRow}>
              {[
                'Votre remboursement a été traité.',
                'Nous avons contacté le chauffeur.',
                'Ticket transmis à l\'équipe concernée.',
                'Pouvez-vous préciser votre demande ?',
              ].map((q, i) => (
                <TouchableOpacity key={i} style={styles.quickChip} onPress={() => setReply(q)}>
                  <Text style={styles.quickChipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Reply Box */}
      <View style={styles.replyBox}>
        <TextInput
          style={styles.replyInput}
          placeholder="Écrire une réponse..."
          placeholderTextColor={COLORS.muted}
          multiline
          value={reply}
          onChangeText={setReply}
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[styles.sendBtn, !reply.trim() && styles.sendBtnDisabled]}
          onPress={sendReply}
          disabled={!reply.trim()}
        >
          <Text style={styles.sendBtnText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerCenter: { alignItems: 'center', gap: 4 },
  headerTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  ticketCard: {
    margin: 16, backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  ticketSubject: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  ticketMeta: { flexDirection: 'row', gap: 16, marginBottom: 4 },
  metaItem: { color: COLORS.muted, fontSize: 12 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, marginBottom: 12, backgroundColor: COLORS.surface,
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  userAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center',
  },
  userName: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  userMeta: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  viewProfileBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.accent,
  },
  viewProfileText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  statusBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  statusBtnText: { color: COLORS.muted, fontSize: 13 },
  msgBubble: {
    borderRadius: 12, padding: 12, marginBottom: 8, maxWidth: '88%',
    borderWidth: 1,
  },
  msgAdmin: {
    alignSelf: 'flex-end', backgroundColor: '#08141A',
    borderColor: COLORS.blue,
  },
  msgUser: {
    alignSelf: 'flex-start', backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  msgHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, gap: 12 },
  msgSender: { color: COLORS.accent, fontSize: 11, fontWeight: '700' },
  msgTime: { color: COLORS.muted, fontSize: 10 },
  msgText: { color: COLORS.white, fontSize: 13, lineHeight: 18 },
  quickRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  quickChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, maxWidth: 200,
  },
  quickChipText: { color: COLORS.muted, fontSize: 12 },
  replyBox: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border,
    padding: 12, flexDirection: 'row', gap: 10, alignItems: 'flex-end',
  },
  replyInput: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1,
    borderColor: COLORS.border, color: COLORS.white, fontSize: 14, padding: 12, maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: COLORS.accent, borderRadius: 12,
    paddingHorizontal: 18, paddingVertical: 12,
  },
  sendBtnDisabled: { backgroundColor: COLORS.surface },
  sendBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
});
