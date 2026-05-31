import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, ActivityIndicator, StatusBar, Modal,
  KeyboardAvoidingView, Platform, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  green: '#27AE60',
  accent: '#F5A623',
  error: '#E74C3C',
  info: '#3498DB',
};

const CATEGORIES = [
  { key: 'PAYMENT', label: '💳 Paiement', color: '#27AE60' },
  { key: 'ORDER', label: '📦 Commande', color: '#F5A623' },
  { key: 'ACCOUNT', label: '👤 Compte', color: '#3498DB' },
  { key: 'DRIVER', label: '🚕 Chauffeur', color: '#9B59B6' },
  { key: 'OTHER', label: '💬 Autre', color: '#8E8E9A' },
];

const STATUS_MAP = {
  OPEN: { label: 'Ouvert', color: COLORS.accent },
  IN_REVIEW: { label: 'En cours', color: COLORS.info },
  RESOLVED: { label: 'Résolu', color: COLORS.green },
  CLOSED: { label: 'Fermé', color: COLORS.muted },
};

const FAQS = [
  { q: 'Comment recharger mon wallet ?', a: 'Allez dans Profil → Wallet → Recharger. Choisissez Flouci, D17 ou Espèces en agence.' },
  { q: 'Mon chauffeur n\'est pas arrivé', a: 'Si le chauffeur dépasse 10 min, vous pouvez annuler sans frais depuis l\'écran de suivi.' },
  { q: 'Comment signaler un problème de livraison ?', a: 'Depuis l\'historique, ouvrez la commande concernée et appuyez sur "Signaler un problème".' },
  { q: 'Comment obtenir un remboursement ?', a: 'Ouvrez un ticket Support avec la catégorie "Paiement" et joignez votre numéro de commande.' },
];

function TicketCard({ ticket, onPress }) {
  const s = STATUS_MAP[ticket.status] || STATUS_MAP.OPEN;
  const dateStr = new Date(ticket.createdAt).toLocaleDateString('fr-TN', { day: '2-digit', month: 'short' });
  const cat = CATEGORIES.find(c => c.key === ticket.category);
  return (
    <TouchableOpacity style={styles.ticketCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.ticketTop}>
        <Text style={styles.ticketCat}>{cat?.label || ticket.category}</Text>
        <View style={[styles.statusBadge, { backgroundColor: s.color + '22' }]}>
          <Text style={[styles.statusBadgeText, { color: s.color }]}>{s.label}</Text>
        </View>
      </View>
      <Text style={styles.ticketSubject} numberOfLines={1}>{ticket.subject}</Text>
      <View style={styles.ticketBottom}>
        <Text style={styles.ticketDate}>{dateStr}</Text>
        {ticket.lastReply && (
          <Text style={styles.ticketReply} numberOfLines={1}>💬 {ticket.lastReply}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function SupportScreen({ navigation }) {
  const [tab, setTab] = useState('FAQ'); // FAQ | TICKETS
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [category, setCategory] = useState('ORDER');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const loadTickets = useCallback(async () => {
    try {
      const res = await api.get('/api/support/tickets');
      setTickets(res.data?.tickets || []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadTickets();
  }, [loadTickets]);

  const handleCreate = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Champs requis', 'Renseignez l\'objet et le message.');
      return;
    }
    setSending(true);
    try {
      const res = await api.post('/api/support/tickets', { category, subject: subject.trim(), message: message.trim() });
      const newTicket = res.data?.ticket || {
        id: Date.now().toString(),
        category,
        subject: subject.trim(),
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        lastReply: null,
      };
      setTickets(prev => [newTicket, ...prev]);
      setModal(false);
      setSubject('');
      setMessage('');
      setTab('TICKETS');
      Alert.alert('Ticket créé ✅', 'Notre équipe vous répondra sous 24h.');
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de créer le ticket.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support EASYWAY</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => setModal(true)}>
          <Text style={styles.newBtnText}>+ Ticket</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {['FAQ', 'TICKETS'].map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'FAQ' ? '❓ FAQ' : `📋 Mes tickets${tickets.length ? ` (${tickets.length})` : ''}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={tab === 'TICKETS' ? <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTickets(); }} tintColor={COLORS.accent} /> : undefined}
      >
        {tab === 'FAQ' && (
          <>
            <Text style={styles.sectionLabel}>QUESTIONS FRÉQUENTES</Text>
            {FAQS.map((faq, i) => (
              <TouchableOpacity
                key={i}
                style={styles.faqCard}
                onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
                activeOpacity={0.8}
              >
                <View style={styles.faqTop}>
                  <Text style={styles.faqQ}>{faq.q}</Text>
                  <Text style={styles.faqChevron}>{expandedFaq === i ? '▲' : '▼'}</Text>
                </View>
                {expandedFaq === i && (
                  <Text style={styles.faqA}>{faq.a}</Text>
                )}
              </TouchableOpacity>
            ))}

            <View style={styles.contactCard}>
              <Text style={styles.contactTitle}>Besoin d'aide supplémentaire ?</Text>
              <Text style={styles.contactSub}>Notre équipe répond sous 24h en semaine.</Text>
              <TouchableOpacity style={styles.contactBtn} onPress={() => setModal(true)}>
                <Text style={styles.contactBtnText}>📩 Ouvrir un ticket</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {tab === 'TICKETS' && (
          <>
            {loading ? (
              <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} />
            ) : tickets.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>🎉</Text>
                <Text style={styles.emptyTitle}>Aucun ticket ouvert</Text>
                <Text style={styles.emptySub}>Tout va bien ? Si vous avez besoin d'aide, créez un ticket.</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => setModal(true)}>
                  <Text style={styles.emptyBtnText}>+ Nouveau ticket</Text>
                </TouchableOpacity>
              </View>
            ) : (
              tickets.map(t => (
                <TicketCard
                  key={t.id}
                  ticket={t}
                  onPress={() => Alert.alert(t.subject, t.lastReply || 'En attente de réponse.')}
                />
              ))
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* New ticket modal */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Nouveau ticket</Text>

              <Text style={styles.modalLabel}>CATÉGORIE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity
                    key={c.key}
                    style={[styles.catChip, category === c.key && { backgroundColor: c.color, borderColor: c.color }]}
                    onPress={() => setCategory(c.key)}
                  >
                    <Text style={[styles.catChipText, category === c.key && { color: '#FFF' }]}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.modalLabel}>OBJET</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Décrivez brièvement le problème"
                placeholderTextColor={COLORS.muted}
                value={subject}
                onChangeText={setSubject}
                maxLength={100}
              />

              <Text style={styles.modalLabel}>MESSAGE</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Expliquez votre problème en détail…"
                placeholderTextColor={COLORS.muted}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModal(false)}>
                  <Text style={styles.modalCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSendBtn, sending && { opacity: 0.6 }]}
                  onPress={handleCreate}
                  disabled={sending}
                >
                  {sending ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.modalSendText}>Envoyer</Text>}
                </TouchableOpacity>
              </View>
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
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  newBtn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  newBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  tabText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: COLORS.text },
  scroll: { padding: 16 },
  sectionLabel: {
    color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4,
    textTransform: 'uppercase', marginBottom: 10,
  },
  faqCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  faqTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  faqQ: { color: COLORS.text, fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 20 },
  faqChevron: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  faqA: { color: COLORS.muted, fontSize: 13, lineHeight: 20, marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  contactCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 20,
    marginTop: 8, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  contactTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 6 },
  contactSub: { color: COLORS.muted, fontSize: 13, textAlign: 'center', marginBottom: 14 },
  contactBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28 },
  contactBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  ticketCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  ticketTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  ticketCat: { color: COLORS.muted, fontSize: 12 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  ticketSubject: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  ticketBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketDate: { color: COLORS.muted, fontSize: 12 },
  ticketReply: { color: COLORS.muted, fontSize: 12, flex: 1, marginLeft: 10 },
  emptyBox: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  emptyBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28 },
  emptyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 16 },
  modalLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 8 },
  catScroll: { marginBottom: 16 },
  catChip: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  catChipText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  modalInput: {
    backgroundColor: COLORS.bg, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border,
    color: COLORS.text, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 14,
  },
  modalTextArea: { height: 100 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  modalCancelBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  modalCancelText: { color: COLORS.muted, fontWeight: '700' },
  modalSendBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: COLORS.accent },
  modalSendText: { color: '#FFF', fontWeight: '900', fontSize: 15 },
});
