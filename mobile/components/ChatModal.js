import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import socketService from '../services/socket';
import useAuthStore from '../store/authStore';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#252535',
  primary: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  bubbleOther: '#1C1C28',
  bubbleMe: '#F5A623',
};

export default function ChatModal({ visible, orderId, onClose }) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!visible || !orderId) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    // Join order room
    socket.emit('join:order', orderId);

    const onMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };

    socket.on('chat:message', onMessage);

    return () => {
      socket.off('chat:message', onMessage);
    };
  }, [visible, orderId]);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit('chat:message', {
      orderId,
      message: text,
      senderName: user?.name || 'Moi',
    });

    // Optimistic local add
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        message: text,
        senderName: user?.name || 'Moi',
        senderId: user?.id,
        createdAt: new Date().toISOString(),
      },
    ]);
    setInputText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === user?.id;
    return (
      <View style={[styles.bubbleWrapper, isMe ? styles.bubbleWrapperMe : styles.bubbleWrapperOther]}>
        {!isMe && <Text style={styles.senderName}>{item.senderName}</Text>}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextOther]}>
            {item.message}
          </Text>
        </View>
        <Text style={styles.bubbleTime}>
          {new Date(item.createdAt).toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeTxt}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>💬 Chat</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun message. Dites bonjour ! 👋</Text>
            </View>
          }
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Votre message..."
              placeholderTextColor={COLORS.textMuted}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} activeOpacity={0.8}>
              <Text style={styles.sendTxt}>➤</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    justifyContent: 'space-between',
  },
  closeBtn: { padding: 4 },
  closeTxt: { color: COLORS.text, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  messageList: { padding: 16, flexGrow: 1 },
  bubbleWrapper: { marginVertical: 4, maxWidth: '75%' },
  bubbleWrapperMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubbleWrapperOther: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  senderName: { color: COLORS.textMuted, fontSize: 11, marginBottom: 2, marginLeft: 4 },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { backgroundColor: COLORS.bubbleMe, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: COLORS.bubbleOther, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  bubbleText: { fontSize: 14 },
  bubbleTextMe: { color: '#000', fontWeight: '600' },
  bubbleTextOther: { color: COLORS.text },
  bubbleTime: { color: COLORS.textMuted, fontSize: 10, marginTop: 3, marginHorizontal: 4 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendTxt: { color: '#000', fontSize: 18, fontWeight: '700' },
});
