import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', danger: '#E74C3C',
  agentBubble: '#1C1C28', clientBubble: '#F5A623',
};

const QUICK_REPLIES = [
  'Où est ma commande ?',
  'Je veux annuler ma commande',
  'Problème de paiement',
  'Le chauffeur ne répond pas',
  'Remboursement demandé',
];

const MOCK_MESSAGES = [
  {
    id: '1', role: 'AGENT', text: 'Bonjour ! Je suis Nour, votre conseillère EASYWAY. Comment puis-je vous aider aujourd\'hui ? 😊',
    time: new Date(Date.now() - 300000).toISOString(),
  },
];

function TypingIndicator() {
  const dots = [0, 1, 2];
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 3), 500);
    return () => clearInterval(t);
  }, []);
  return (
    <View style={styles.typingRow}>
      <View style={styles.agentAvatar}><Text style={styles.agentAvatarText}>N</Text></View>
      <View style={styles.typingBubble}>
        {dots.map((_, i) => (
          <View key={i} style={[styles.typingDot, { opacity: frame === i ? 1 : 0.3 }]} />
        ))}
      </View>
    </View>
  );
}

function MessageBubble({ msg, isOwn }) {
  const time = new Date(msg.time).toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' });

  if (isOwn) {
    return (
      <View style={styles.ownRow}>
        <View style={styles.ownBubble}>
          {msg.image && (
            <View style={styles.imagePreview}>
              <Text style={{ color: COLORS.muted, fontSize: 12 }}>📎 Image jointe</Text>
            </View>
          )}
          {msg.text ? <Text style={styles.ownText}>{msg.text}</Text> : null}
          <View style={styles.bubbleMeta}>
            <Text style={styles.ownTime}>{time}</Text>
            <Text style={styles.readStatus}>{msg.read ? '✓✓' : '✓'}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.agentRow}>
      <View style={styles.agentAvatar}><Text style={styles.agentAvatarText}>N</Text></View>
      <View style={styles.agentBubble}>
        {msg.text ? <Text style={styles.agentText}>{msg.text}</Text> : null}
        <Text style={styles.agentTime}>{time}</Text>
      </View>
    </View>
  );
}

function StatusBanner({ status, ticketId }) {
  const config = {
    OPEN:       { color: COLORS.green,  label: '🟢 Agent connecté', bg: COLORS.green + '15' },
    WAITING:    { color: COLORS.accent, label: '⏳ En attente d\'un agent…', bg: COLORS.accent + '15' },
    RESOLVED:   { color: COLORS.muted,  label: '✅ Ticket résolu', bg: COLORS.muted + '15' },
  }[status] || { color: COLORS.muted, label: status, bg: COLORS.muted + '15' };

  return (
    <View style={[styles.statusBanner, { backgroundColor: config.bg }]}>
      <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
      {ticketId && <Text style={styles.ticketId}>#{ticketId.slice(0, 8).toUpperCase()}</Text>}
    </View>
  );
}

export default function LiveChatScreen({ route, navigation }) {
  const { ticketId, subject } = route.params || {};
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [status, setStatus] = useState('OPEN');
  const [showQuick, setShowQuick] = useState(true);
  const listRef = useRef(null);
  const pollRef = useRef(null);

  const load = useCallback(async () => {
    if (!ticketId) return;
    try {
      const res = await api.get(`/api/support/tickets/${ticketId}/messages`);
      if (res.data?.messages?.length) setMessages(res.data.messages);
      setStatus(res.data?.status || 'OPEN');
    } catch {}
  }, [ticketId]);

  useEffect(() => {
    load();
    pollRef.current = setInterval(load, 5000);
    return () => clearInterval(pollRef.current);
  }, [load]);

  const scrollToEnd = () => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = async (text, image = null) => {
    if (!text?.trim() && !image) return;
    setSending(true);
    setShowQuick(false);
    const msg = {
      id: Date.now().toString(),
      role: 'CLIENT',
      text: text?.trim() || '',
      image,
      time: new Date().toISOString(),
      read: false,
    };
    setMessages(m => [...m, msg]);
    setInput('');
    scrollToEnd();

    // Simulate agent typing then reply
    setTimeout(() => setTyping(true), 600);
    setTimeout(() => {
      setTyping(false);
      const auto = [
        'Je comprends votre problème. Laissez-moi vérifier cela pour vous…',
        'Un instant, je consulte votre dossier.',
        'Je vais escalader votre demande à notre équipe spécialisée.',
        'Votre remboursement sera traité sous 24-48h ouvrables.',
        'Pouvez-vous me donner plus de détails sur le problème ?',
      ];
      const reply = {
        id: (Date.now() + 1).toString(),
        role: 'AGENT',
        text: auto[Math.floor(Math.random() * auto.length)],
        time: new Date().toISOString(),
      };
      setMessages(m => [...m, reply]);
      scrollToEnd();
    }, 2500);

    try {
      await api.post(`/api/support/tickets/${ticketId || 'new'}/messages`, { text, image });
    } catch {}
    setSending(false);
  };

  const handleAttach = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission requise'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) {
      sendMessage('📎 Image jointe', result.assets[0].uri);
    }
  };

  const handleResolve = () => {
    Alert.alert('Résoudre le ticket', 'Marquer ce ticket comme résolu ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Résoudre', onPress: async () => {
          setStatus('RESOLVED');
          const msg = { id: Date.now().toString(), role: 'AGENT', text: '✅ Ticket marqué comme résolu. Merci d\'avoir contacté EASYWAY !', time: new Date().toISOString() };
          setMessages(m => [...m, msg]);
          try { await api.post(`/api/support/tickets/${ticketId}/resolve`); } catch {}
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <MessageBubble msg={item} isOwn={item.role === 'CLIENT'} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Support EASYWAY</Text>
          {subject && <Text style={styles.headerSubject} numberOfLines={1}>{subject}</Text>}
        </View>
        <TouchableOpacity onPress={handleResolve} style={styles.resolveBtn}>
          <Text style={styles.resolveBtnText}>Résolu</Text>
        </TouchableOpacity>
      </View>

      <StatusBanner status={status} ticketId={ticketId} />

      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={scrollToEnd}
        ListFooterComponent={typing ? <TypingIndicator /> : null}
        showsVerticalScrollIndicator={false}
      />

      {/* Quick replies */}
      {showQuick && messages.length <= 1 && (
        <View style={styles.quickRow}>
          <Text style={styles.quickLabel}>Réponses rapides :</Text>
          <FlatList
            horizontal
            data={QUICK_REPLIES}
            keyExtractor={i => i}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.quickChip} onPress={() => sendMessage(item)}>
                <Text style={styles.quickChipText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachBtn} onPress={handleAttach}>
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Votre message…"
            placeholderTextColor={COLORS.muted}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && { opacity: 0.5 }]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || sending}
          >
            {sending ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.sendIcon}>➤</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, alignItems: 'center' },
  backText: { color: COLORS.white, fontSize: 28 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  headerSubject: { color: COLORS.muted, fontSize: 11, marginTop: 1 },
  resolveBtn: { backgroundColor: COLORS.green + '22', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.green },
  resolveBtnText: { color: COLORS.green, fontSize: 12, fontWeight: '700' },
  statusBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  statusText: { fontSize: 13, fontWeight: '600' },
  ticketId: { color: COLORS.muted, fontSize: 12 },
  messageList: { paddingHorizontal: 12, paddingVertical: 8, paddingBottom: 16 },
  ownRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 },
  ownBubble: {
    maxWidth: '78%', backgroundColor: COLORS.clientBubble, borderRadius: 18,
    borderBottomRightRadius: 4, padding: 12,
  },
  ownText: { color: '#000', fontSize: 14, lineHeight: 20 },
  bubbleMeta: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 4 },
  ownTime: { color: '#00000066', fontSize: 10 },
  readStatus: { color: '#00000066', fontSize: 10 },
  agentRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10, gap: 8 },
  agentAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.accent + '22',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.accent,
  },
  agentAvatarText: { color: COLORS.accent, fontWeight: '700', fontSize: 14 },
  agentBubble: {
    maxWidth: '78%', backgroundColor: COLORS.agentBubble, borderRadius: 18,
    borderBottomLeftRadius: 4, padding: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  agentText: { color: COLORS.white, fontSize: 14, lineHeight: 20 },
  agentTime: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  typingRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 },
  typingBubble: {
    backgroundColor: COLORS.agentBubble, borderRadius: 18, borderBottomLeftRadius: 4,
    padding: 14, flexDirection: 'row', gap: 5, borderWidth: 1, borderColor: COLORS.border,
  },
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.muted },
  imagePreview: {
    backgroundColor: COLORS.border, borderRadius: 10, padding: 10, marginBottom: 6,
  },
  quickRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingVertical: 8 },
  quickLabel: { color: COLORS.muted, fontSize: 11, marginLeft: 12, marginBottom: 6 },
  quickChip: {
    backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  quickChipText: { color: COLORS.white, fontSize: 13 },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 8, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: COLORS.border, gap: 6,
  },
  attachBtn: { padding: 10 },
  attachIcon: { fontSize: 22 },
  input: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, fontSize: 14, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  sendIcon: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
});
