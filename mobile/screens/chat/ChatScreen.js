import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSocket } from '../../services/socket';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  accent: '#F5A623',
  myBubble: '#F5A623',
  otherBubble: '#252535',
  myText: '#000000',
  otherText: '#FFFFFF',
};

function Bubble({ msg, isMe }) {
  const time = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })
    : '';
  return (
    <View style={[styles.bubbleWrap, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
        <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextOther]}>
          {msg.text}
        </Text>
        <Text style={[styles.bubbleTime, isMe ? { color: 'rgba(0,0,0,0.5)' } : { color: COLORS.textMuted }]}>
          {time}
        </Text>
      </View>
    </View>
  );
}

export default function ChatScreen({ route, navigation }) {
  const { orderId, otherName, otherRole } = route.params || {};
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchHistory();
    setupSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.off('chat:message');
      }
    };
  }, [orderId]);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/api/chat/${orderId}/messages`);
      setMessages(res.data || []);
    } catch {
      // Fallback: load from local cache
      try {
        const cached = await AsyncStorage.getItem(`chat_${orderId}`);
        if (cached) setMessages(JSON.parse(cached));
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    try {
      const socket = getSocket();
      if (!socket) return;
      socketRef.current = socket;
      socket.emit('join:order', orderId);
      socket.on('chat:message', (msg) => {
        if (msg.orderId && msg.orderId !== orderId) return;
        setMessages((prev) => {
          const updated = [...prev, msg];
          AsyncStorage.setItem(`chat_${orderId}`, JSON.stringify(updated)).catch(() => {});
          return updated;
        });
        setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
      });
    } catch {}
  };

  const sendMessage = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    const optimistic = {
      id: `temp_${Date.now()}`,
      orderId,
      senderId: user?.id,
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setText('');
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      await api.post(`/api/chat/${orderId}/messages`, { text: trimmed });
    } catch {
      // Message already shown optimistically — don't remove it
    } finally {
      setSending(false);
    }
  }, [text, sending, orderId, user]);

  const renderItem = useCallback(({ item }) => {
    const isMe = item.senderId === user?.id;
    return <Bubble msg={item} isMe={isMe} />;
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherName || 'Chauffeur'}</Text>
          <Text style={styles.headerRole}>{otherRole === 'DRIVER' ? '🚕 Chauffeur' : '👤 Client'}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={COLORS.accent} />
          </View>
        ) : (
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={(item, i) => item.id || String(i)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyText}>Commencez la conversation</Text>
              </View>
            }
          />
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Votre message..."
            placeholderTextColor={COLORS.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!text.trim() || sending}
          >
            {sending
              ? <ActivityIndicator color="#000" size="small" />
              : <Text style={styles.sendBtnText}>▶</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  backBtn: { width: 36, alignItems: 'center' },
  backText: { color: COLORS.text, fontSize: 28 },
  headerInfo: { alignItems: 'center' },
  headerName: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  headerRole: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, paddingBottom: 8, flexGrow: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
  bubbleWrap: { marginBottom: 8, maxWidth: '78%' },
  bubbleLeft: { alignSelf: 'flex-start' },
  bubbleRight: { alignSelf: 'flex-end' },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { backgroundColor: COLORS.myBubble, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: COLORS.otherBubble, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  bubbleTextMe: { color: COLORS.myText },
  bubbleTextOther: { color: COLORS.otherText },
  bubbleTime: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 12, gap: 10,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  input: {
    flex: 1, backgroundColor: '#12121C',
    borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10,
    color: COLORS.text, fontSize: 15,
    borderWidth: 1, borderColor: COLORS.border,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
});
