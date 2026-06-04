import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, TextInput, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const MOCK_MESSAGES = [
  { id: 'M1', text: 'Bonjour, j\'ai commandé il y a 30 min, c\'est normal ?', from: 'client', time: '14:05' },
  { id: 'M2', text: 'Bonjour ! Votre commande est en cours de préparation, le cuisinier prépare votre tajine. 🍲', from: 'support', time: '14:06' },
  { id: 'M3', text: 'Ok merci, combien de temps encore ?', from: 'client', time: '14:07' },
  { id: 'M4', text: 'Environ 10 minutes supplémentaires. Le livreur sera ensuite chez vous sous 15 min. Désolé pour l\'attente ! 🙏', from: 'support', time: '14:07' },
  { id: 'M5', text: 'D\'accord, merci pour l\'info !', from: 'client', time: '14:08' },
];

const QUICK_REPLIES = [
  'Où est ma commande ?',
  'Je veux annuler',
  'Problème de paiement',
  'Modifier mon adresse',
];

function Bubble({ msg }) {
  const isMe = msg.from === 'client';
  return (
    <View style={[styles.bubbleRow, isMe && styles.bubbleRowMe]}>
      {!isMe && (
        <View style={styles.agentAvatar}><Text style={{ fontSize: 14 }}>🎧</Text></View>
      )}
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{msg.text}</Text>
        <Text style={[styles.bubbleTime, isMe && { color: 'rgba(0,0,0,0.5)' }]}>{msg.time}</Text>
      </View>
    </View>
  );
}

export default function ClientChatScreen({ navigation, route }) {
  const orderRef = route?.params?.orderRef || '#CMD-20250604-0042';
  const topic = route?.params?.topic || 'Support EasyWay';

  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const listRef = useRef(null);

  const scrollToEnd = () => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  useEffect(() => { scrollToEnd(); }, [messages]);

  const simulateReply = () => {
    setAgentTyping(true);
    setTimeout(() => {
      setAgentTyping(false);
      const replies = [
        'Je vais vérifier ça pour vous immédiatement !',
        'Votre demande a bien été prise en compte. 👍',
        'Un instant s\'il vous plaît, je consulte votre dossier.',
        'Pouvez-vous me donner plus de détails ?',
        'Je transfère votre demande à l\'équipe concernée.',
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      const now = new Date();
      const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      setMessages(prev => [...prev, { id: `M${Date.now()}`, text: reply, from: 'support', time }]);
    }, 1500);
  };

  const handleSend = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setSending(true);
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMsg = { id: `M${Date.now()}`, text: msg, from: 'client', time };
    setMessages(prev => [...prev, newMsg]);
    try {
      await api.post('/api/client/chat', { message: msg, orderRef });
    } catch {}
    setSending(false);
    simulateReply();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.agentOnline} />
          <View>
            <Text style={styles.headerTitle}>{topic}</Text>
            <Text style={styles.headerSub}>🟢 En ligne · Répond en &lt; 2 min</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {orderRef && (
        <View style={styles.orderBanner}>
          <Text style={styles.orderBannerText}>📦 Ref : {orderRef}</Text>
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={({ item }) => <Bubble msg={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={agentTyping ? (
            <View style={[styles.bubbleRow, { marginBottom: 8 }]}>
              <View style={styles.agentAvatar}><Text style={{ fontSize: 14 }}>🎧</Text></View>
              <View style={[styles.bubble, styles.bubbleThem, { paddingVertical: 14 }]}>
                <Text style={styles.typingDots}>• • •</Text>
              </View>
            </View>
          ) : null}
        />

        {/* Quick replies */}
        <View style={styles.quickRow}>
          {QUICK_REPLIES.map(q => (
            <TouchableOpacity key={q} style={styles.quickBtn} onPress={() => handleSend(q)}>
              <Text style={styles.quickText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Votre message..."
            placeholderTextColor={COLORS.muted}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && { opacity: 0.4 }]}
            onPress={() => handleSend()}
            disabled={!input.trim() || sending}
          >
            {sending ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.sendBtnText}>➤</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  agentOnline: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.green },
  headerTitle: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  headerSub: { color: COLORS.muted, fontSize: 11, marginTop: 1 },
  orderBanner: { backgroundColor: COLORS.surface, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  orderBannerText: { color: COLORS.muted, fontSize: 12 },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 },
  bubbleRowMe: { flexDirection: 'row-reverse' },
  agentAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  bubble: { maxWidth: '75%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleThem: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderBottomLeftRadius: 4 },
  bubbleMe: { backgroundColor: COLORS.accent, borderBottomRightRadius: 4 },
  bubbleText: { color: COLORS.text, fontSize: 14, lineHeight: 20 },
  bubbleTextMe: { color: '#000' },
  bubbleTime: { color: COLORS.muted, fontSize: 10, marginTop: 4, textAlign: 'right' },
  typingDots: { color: COLORS.muted, fontSize: 18, letterSpacing: 4 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingBottom: 6, gap: 6 },
  quickBtn: { backgroundColor: COLORS.surface, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  quickText: { color: COLORS.accent, fontSize: 11, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  input: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: '#000', fontSize: 18, fontWeight: '900' },
});
