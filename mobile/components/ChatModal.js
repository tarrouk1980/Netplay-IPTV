import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Image,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Audio, Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import socketService from '../services/socket';
import useAuthStore from '../store/authStore';
import api from '../services/api';

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
  red: '#E53935',
  green: '#27AE60',
};

// ── Audio player bubble ───────────────────────────────────────────────────────
function AudioBubble({ uri, isMe }) {
  const [sound, setSound] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    return () => { sound?.unloadAsync(); };
  }, [sound]);

  const togglePlay = async () => {
    if (!playing) {
      try {
        const { sound: s } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              setProgress(status.positionMillis / (status.durationMillis || 1));
              setDuration(status.durationMillis || 0);
              if (status.didJustFinish) { setPlaying(false); setProgress(0); }
            }
          }
        );
        setSound(s);
        setPlaying(true);
      } catch {
        Alert.alert('Erreur', 'Impossible de lire le message vocal.');
      }
    } else {
      await sound?.pauseAsync();
      setPlaying(false);
    }
  };

  const secs = Math.floor(duration / 1000);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <TouchableOpacity style={styles.audioBubble} onPress={togglePlay} activeOpacity={0.8}>
      <Text style={[styles.audioIcon, { color: isMe ? '#000' : COLORS.primary }]}>
        {playing ? '⏸' : '▶'}
      </Text>
      <View style={styles.audioTrack}>
        <View style={[styles.audioBar, { width: `${Math.round(progress * 100)}%`, backgroundColor: isMe ? '#000' : COLORS.primary }]} />
      </View>
      <Text style={[styles.audioDuration, { color: isMe ? '#333' : COLORS.textMuted }]}>{mm}:{ss}</Text>
    </TouchableOpacity>
  );
}

// ── Video bubble ──────────────────────────────────────────────────────────────
function VideoBubble({ uri }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  return (
    <TouchableOpacity onPress={() => {
      setPlaying((p) => !p);
      if (!playing) videoRef.current?.playAsync();
      else videoRef.current?.pauseAsync();
    }} activeOpacity={0.9}>
      <Video
        ref={videoRef}
        source={{ uri }}
        style={styles.videoPreview}
        resizeMode={ResizeMode.COVER}
        isLooping={false}
        onPlaybackStatusUpdate={(s) => { if (s.didJustFinish) setPlaying(false); }}
      />
      {!playing && (
        <View style={styles.videoPlayOverlay}>
          <Text style={styles.videoPlayIcon}>▶</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Main ChatModal ────────────────────────────────────────────────────────────
export default function ChatModal({ visible, orderId, onClose }) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const flatListRef = useRef(null);
  const recTimerRef = useRef(null);
  const recordAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation when recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordAnim, { toValue: 1.3, duration: 500, useNativeDriver: true }),
          Animated.timing(recordAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      recordAnim.setValue(1);
    }
  }, [isRecording]);

  useEffect(() => {
    if (!visible || !orderId) return;
    const socket = socketService.getSocket();
    if (!socket) return;
    socket.emit('join:order', orderId);

    const onMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };
    socket.on('chat:message', onMessage);
    return () => { socket.off('chat:message', onMessage); };
  }, [visible, orderId]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const emitAndAddLocal = useCallback((payload) => {
    const socket = socketService.getSocket();
    if (!socket) return;
    const msg = {
      id: Date.now(),
      senderName: user?.name || 'Moi',
      senderId: user?.id,
      createdAt: new Date().toISOString(),
      ...payload,
    };
    socket.emit('chat:message', { orderId, senderName: msg.senderName, ...payload });
    setMessages((prev) => [...prev, msg]);
    scrollToBottom();
  }, [orderId, user, scrollToBottom]);

  // ── Text send ───────────────────────────────────────────────────────────────
  const sendText = () => {
    const text = inputText.trim();
    if (!text) return;
    emitAndAddLocal({ type: 'text', message: text });
    setInputText('');
  };

  // ── Upload helper ───────────────────────────────────────────────────────────
  async function uploadMedia(uri, mimeType, filename) {
    const formData = new FormData();
    formData.append('file', { uri, name: filename, type: mimeType });
    const res = await api.post('/api/chat/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url; // backend returns { url: '...' }
  }

  // ── Photo pick & send ────────────────────────────────────────────────────────
  const sendPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission refusée'); return; }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: false,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      const ext = asset.uri.split('.').pop() || 'jpg';
      const url = await uploadMedia(asset.uri, `image/${ext}`, `photo.${ext}`);
      emitAndAddLocal({ type: 'image', mediaUrl: url, message: '📷 Photo' });
    } catch {
      // Fallback: send local uri directly (works within same session)
      emitAndAddLocal({ type: 'image', mediaUrl: asset.uri, message: '📷 Photo' });
    } finally {
      setUploading(false);
    }
  };

  // ── Camera photo ─────────────────────────────────────────────────────────────
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission refusée'); return; }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      const url = await uploadMedia(asset.uri, 'image/jpg', 'photo.jpg');
      emitAndAddLocal({ type: 'image', mediaUrl: url, message: '📷 Photo' });
    } catch {
      emitAndAddLocal({ type: 'image', mediaUrl: asset.uri, message: '📷 Photo' });
    } finally {
      setUploading(false);
    }
  };

  // ── Video pick & send ────────────────────────────────────────────────────────
  const sendVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission refusée'); return; }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.6,
      videoMaxDuration: 60,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      const url = await uploadMedia(asset.uri, 'video/mp4', 'video.mp4');
      emitAndAddLocal({ type: 'video', mediaUrl: url, message: '🎥 Vidéo' });
    } catch {
      emitAndAddLocal({ type: 'video', mediaUrl: asset.uri, message: '🎥 Vidéo' });
    } finally {
      setUploading(false);
    }
  };

  // ── Voice recording ─────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission micro refusée'); return; }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsRecording(true);
      setRecordingDuration(0);
      recTimerRef.current = setInterval(() => setRecordingDuration((d) => d + 1), 1000);
    } catch {
      Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    clearInterval(recTimerRef.current);
    setIsRecording(false);
    setRecordingDuration(0);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (!uri) return;

      setUploading(true);
      try {
        const url = await uploadMedia(uri, 'audio/m4a', 'voice.m4a');
        emitAndAddLocal({ type: 'audio', mediaUrl: url, message: '🎤 Message vocal' });
      } catch {
        emitAndAddLocal({ type: 'audio', mediaUrl: uri, message: '🎤 Message vocal' });
      } finally {
        setUploading(false);
      }
    } catch {
      Alert.alert('Erreur', 'Enregistrement échoué.');
    }
  };

  const cancelRecording = async () => {
    clearInterval(recTimerRef.current);
    try { await recording?.stopAndUnloadAsync(); } catch {}
    setRecording(null);
    setIsRecording(false);
    setRecordingDuration(0);
  };

  // ── Render bubble ────────────────────────────────────────────────────────────
  const renderMessage = ({ item }) => {
    const isMe = item.senderId === user?.id;
    const time = new Date(item.createdAt).toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.bubbleWrapper, isMe ? styles.bubbleWrapperMe : styles.bubbleWrapperOther]}>
        {!isMe && <Text style={styles.senderName}>{item.senderName}</Text>}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          {item.type === 'image' && item.mediaUrl ? (
            <Image source={{ uri: item.mediaUrl }} style={styles.imagePreview} resizeMode="cover" />
          ) : item.type === 'video' && item.mediaUrl ? (
            <VideoBubble uri={item.mediaUrl} />
          ) : item.type === 'audio' && item.mediaUrl ? (
            <AudioBubble uri={item.mediaUrl} isMe={isMe} />
          ) : (
            <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextOther]}>
              {item.message}
            </Text>
          )}
        </View>
        <Text style={styles.bubbleTime}>{time}</Text>
      </View>
    );
  };

  const recMM = String(Math.floor(recordingDuration / 60)).padStart(2, '0');
  const recSS = String(recordingDuration % 60).padStart(2, '0');

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
          onContentSizeChange={scrollToBottom}
        />

        {uploading && (
          <View style={styles.uploadingBar}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.uploadingText}>Envoi en cours…</Text>
          </View>
        )}

        {/* Recording bar */}
        {isRecording && (
          <View style={styles.recordingBar}>
            <Animated.View style={[styles.recDot, { transform: [{ scale: recordAnim }] }]} />
            <Text style={styles.recTimer}>{recMM}:{recSS}</Text>
            <Text style={styles.recHint}>Enregistrement…</Text>
            <TouchableOpacity onPress={cancelRecording} style={styles.recCancelBtn}>
              <Text style={styles.recCancelTxt}>✕ Annuler</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input bar */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.inputRow}>
            {/* Media buttons */}
            {!isRecording && (
              <>
                <TouchableOpacity style={styles.mediaBtn} onPress={takePhoto} activeOpacity={0.7}>
                  <Text style={styles.mediaBtnTxt}>📷</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mediaBtn} onPress={sendPhoto} activeOpacity={0.7}>
                  <Text style={styles.mediaBtnTxt}>🖼️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mediaBtn} onPress={sendVideo} activeOpacity={0.7}>
                  <Text style={styles.mediaBtnTxt}>🎥</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Text input or stop recording */}
            {isRecording ? (
              <TouchableOpacity style={styles.stopRecBtn} onPress={stopRecording} activeOpacity={0.8}>
                <Text style={styles.stopRecTxt}>⏹ Envoyer</Text>
              </TouchableOpacity>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="Votre message…"
                placeholderTextColor={COLORS.textMuted}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={sendText}
                returnKeyType="send"
                multiline
              />
            )}

            {/* Send text OR hold to record */}
            {!isRecording && inputText.trim() ? (
              <TouchableOpacity style={styles.sendBtn} onPress={sendText} activeOpacity={0.8}>
                <Text style={styles.sendTxt}>➤</Text>
              </TouchableOpacity>
            ) : !isRecording ? (
              <TouchableOpacity
                style={[styles.sendBtn, { backgroundColor: COLORS.red }]}
                onPressIn={startRecording}
                activeOpacity={0.8}
              >
                <Text style={styles.sendTxt}>🎤</Text>
              </TouchableOpacity>
            ) : null}
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
  bubbleWrapper: { marginVertical: 4, maxWidth: '78%' },
  bubbleWrapperMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubbleWrapperOther: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  senderName: { color: COLORS.textMuted, fontSize: 11, marginBottom: 2, marginLeft: 4 },
  bubble: { borderRadius: 16, overflow: 'hidden' },
  bubbleMe: { backgroundColor: COLORS.bubbleMe, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: COLORS.bubbleOther, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  bubbleText: { fontSize: 14, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleTextMe: { color: '#000', fontWeight: '600' },
  bubbleTextOther: { color: COLORS.text },
  bubbleTime: { color: COLORS.textMuted, fontSize: 10, marginTop: 3, marginHorizontal: 4 },
  imagePreview: { width: 200, height: 150, borderRadius: 12 },
  videoPreview: { width: 200, height: 140, borderRadius: 12 },
  videoPlayOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 12,
  },
  videoPlayIcon: { fontSize: 36, color: '#fff' },
  audioBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10, minWidth: 180,
  },
  audioIcon: { fontSize: 20 },
  audioTrack: {
    flex: 1, height: 4, backgroundColor: '#333', borderRadius: 2, overflow: 'hidden',
  },
  audioBar: { height: '100%', borderRadius: 2 },
  audioDuration: { fontSize: 11, minWidth: 36, textAlign: 'right' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
  uploadingBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.surface,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  uploadingText: { color: COLORS.textMuted, fontSize: 12 },
  recordingBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#1A0000', borderTopWidth: 1, borderTopColor: COLORS.red,
  },
  recDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.red },
  recTimer: { color: COLORS.red, fontWeight: '700', fontSize: 15, minWidth: 44 },
  recHint: { color: COLORS.textMuted, fontSize: 12, flex: 1 },
  recCancelBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: COLORS.red },
  recCancelTxt: { color: COLORS.red, fontSize: 12, fontWeight: '600' },
  stopRecBtn: {
    flex: 1, backgroundColor: COLORS.green, borderRadius: 24,
    paddingVertical: 12, alignItems: 'center', justifyContent: 'center',
  },
  stopRecTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
    alignItems: 'flex-end',
  },
  mediaBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  mediaBtnTxt: { fontSize: 18 },
  input: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    color: COLORS.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  sendTxt: { color: '#000', fontSize: 18, fontWeight: '700' },
});
