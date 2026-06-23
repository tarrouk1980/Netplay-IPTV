import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, TextInput, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const QUICK_REPLIES = [
  'Où est ma commande ?',
  'Je veux annuler',
  'Problème de paiement',
  'Modifier mon adresse',
];

function Bubble({ msg }) {
  const isMe = msg.role === 'CLIENT';
  return (
    <View style={[styles.bubbleRow, isMe && styles.bubbleRowMe]}>
      {!isMe && (
        <View style={styles.agentAvatar}><Text style={{ fontSize: 14 }}>🎧</Text></View>
      )}
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{msg.text}</Text>
        <Text style={[styles.bubbleTime, isMe && { color: 'rgba(0,0,0,0.5)' }]}>
          {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

export default function ClientChatScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;
  const orderRef = route?.params?.orderRef;
  const topic = route?.params?.topic || 'Support EasyWay';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(!!orderId);
  const listRef = useRef(null);

  const scrollToEnd = () => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const load = useCallback(() => {
    if (!orderId) return;
    api.get(`/api/chat/${orderId}/messages`)
      .then((r) => setMessages(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!orderId) return;
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [orderId, load]);
  useEffect(() => { scrollToEnd(); }, [messages]);

  const handleSend = async (text) => {
    const msg = text || input.trim();
    if (!msg || !orderId) return;
    setInput('');
    setSending(true);
    try {
      const res = await api.post(`/api/chat/${orderId}/messages`, { text: msg });
      setMessages((prev) => [...prev, res.data]);
      scrollToEnd();
    } catch {
      Alert.alert('Erreur', "Le message n'a pas pu être envoyé. Réessayez.");
    }
    setSending(false);
  };

  if (!orderId) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{topic}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
          <Text style={{ color: COLORS.muted, textAlign: 'center' }}>Aucune commande sélectionnée.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{topic}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {orderRef && (
        <View style={styles.orderBanner}>
          <Text style={styles.orderBannerText}>📦 Ref : {orderRef}</Text>
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={COLORS.accent} size="large" />
          </View>
        ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={({ item }) => <Bubble msg={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
        />
        )}

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
