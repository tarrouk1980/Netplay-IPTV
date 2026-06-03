import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
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
  red: '#D32F2F',
};

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function VoiceBubble({ msg, isMe }) {
  const [sound, setSound] = useState(null);
  const [playing, setPlaying] = useState(false);

  const toggle = async () => {
    if (playing) {
      await sound?.pauseAsync();
      setPlaying(false);
    } else {
      if (sound) {
        await sound.playAsync();
        setPlaying(true);
      } else {
        const { sound: s } = await Audio.Sound.createAsync({ uri: msg.audioUri });
        setSound(s);
        setPlaying(true);
        await s.playAsync();
        s.setOnPlaybackStatusUpdate((st) => {
          if (st.didJustFinish) {
            setPlaying(false);
            setSound(null);
          }
        });
      }
    }
  };

  useEffect(() => () => { sound?.unloadAsync(); }, [sound]);

  const time = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <View style={[styles.bubbleWrap, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
        <TouchableOpacity style={styles.voiceRow} onPress={toggle}>
          <Text style={{ fontSize: 22 }}>{playing ? '⏸' : '▶️'}</Text>
          <View style={styles.voiceBar} />
          <Text style={[styles.voiceDur, isMe ? { color: 'rgba(0,0,0,0.6)' } : { color: COLORS.textMuted }]}>
            {msg.duration ? formatDuration(msg.duration) : '0:00'}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.bubbleTime, isMe ? { color: 'rgba(0,0,0,0.5)' } : { color: COLORS.textMuted }]}>
          {time}
        </Text>
      </View>
    </View>
  );
}

function ImageBubble({ msg, isMe }) {
  const time = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })
    : '';
  return (
    <View style={[styles.bubbleWrap, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther, { padding: 4 }]}>
        <Image source={{ uri: msg.imageUri }} style={styles.imageBubble} resizeMode="cover" />
        <Text style={[styles.bubbleTime, isMe ? { color: 'rgba(0,0,0,0.5)' } : { color: COLORS.textMuted }, { paddingHorizontal: 6 }]}>
          {time}
        </Text>
      </View>
    </View>
  );
}

function Bubble({ msg, isMe }) {
  if (msg.audioUri) return <VoiceBubble msg={msg} isMe={isMe} />;
  if (msg.imageUri) return <ImageBubble msg={msg} isMe={isMe} />;

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
  const [recording, setRecording] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const flatRef = useRef(null);
  const socketRef = useRef(null);
  const durationTimer = useRef(null);

  useEffect(() => {
    fetchHistory();
    setupSocket();
    return () => {
      if (socketRef.current) socketRef.current.off('chat:message');
      stopRecording(true);
    };
  }, [orderId]);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/api/chat/${orderId}/messages`);
      setMessages(res.data || []);
    } catch {
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
    } catch {}
    finally { setSending(false); }
  }, [text, sending, orderId, user]);

  // ── Voice recording ──────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Autorisez le microphone pour envoyer des messages vocaux.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
      setRecordingDuration(0);
      durationTimer.current = setInterval(() => setRecordingDuration((d) => d + 1000), 1000);
    } catch (err) {
      Alert.alert('Erreur', "Impossible de démarrer l'enregistrement.");
    }
  };

  const stopRecording = async (cancel = false) => {
    clearInterval(durationTimer.current);
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      if (!cancel) {
        const uri = recording.getURI();
        const dur = recordingDuration;
        const msg = {
          id: `temp_${Date.now()}`,
          orderId,
          senderId: user?.id,
          audioUri: uri,
          duration: dur,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
        // Send to backend (best effort)
        try {
          const form = new FormData();
          form.append('audio', { uri, name: 'voice.m4a', type: 'audio/m4a' });
          await api.post(`/api/chat/${orderId}/voice`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch {}
      }
    } catch {}
    setRecording(null);
    setRecordingDuration(0);
  };

  // ── Image picker ─────────────────────────────────────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', "Autorisez l'accès à la galerie.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.length) return;
    const uri = result.assets[0].uri;
    const msg = {
      id: `temp_${Date.now()}`,
      orderId,
      senderId: user?.id,
      imageUri: uri,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    try {
      const form = new FormData();
      form.append('image', { uri, name: 'photo.jpg', type: 'image/jpeg' });
      await api.post(`/api/chat/${orderId}/image`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch {}
  };

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

        {/* Recording indicator */}
        {recording && (
          <View style={styles.recordingBar}>
            <View style={styles.recDot} />
            <Text style={styles.recText}>Enregistrement... {formatDuration(recordingDuration)}</Text>
            <TouchableOpacity onPress={() => stopRecording(true)} style={styles.recCancel}>
              <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          {/* Image picker */}
          <TouchableOpacity style={styles.iconBtn} onPress={pickImage}>
            <Text style={{ fontSize: 20 }}>📎</Text>
          </TouchableOpacity>

          {recording ? (
            <TouchableOpacity style={styles.sendBtn} onPress={() => stopRecording(false)}>
              <Text style={{ fontSize: 18 }}>⏹</Text>
            </TouchableOpacity>
          ) : (
            <>
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
              {text.trim() ? (
                <TouchableOpacity
                  style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
                  onPress={sendMessage}
                  disabled={sending}
                >
                  {sending
                    ? <ActivityIndicator color="#000" size="small" />
                    : <Text style={styles.sendBtnText}>▶</Text>
                  }
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.sendBtn} onPress={startRecording}>
                  <Text style={{ fontSize: 18 }}>🎤</Text>
                </TouchableOpacity>
              )}
            </>
          )}
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
  voiceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 160 },
  voiceBar: { flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 },
  voiceDur: { fontSize: 12 },
  imageBubble: { width: 200, height: 150, borderRadius: 12 },
  recordingBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1C1C28', paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  recDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.red },
  recText: { flex: 1, color: COLORS.text, fontSize: 14 },
  recCancel: { paddingHorizontal: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 12, gap: 8,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  iconBtn: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
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
