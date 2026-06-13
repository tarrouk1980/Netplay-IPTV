import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
  Image
} from "react-native";
import api from "../../api";
import { useAuth } from "../../contexts/AuthContext";

function ThreadItem({ thread, onPress }: { thread: any; onPress: () => void }) {
  const other = thread.other;
  const initial = other?.name?.[0]?.toUpperCase() || "?";
  return (
    <TouchableOpacity style={t.thread} onPress={onPress}>
      <View style={t.avatar}>
        <Text style={t.avatarText}>{initial}</Text>
      </View>
      <View style={t.threadBody}>
        <View style={t.threadTop}>
          <Text style={t.threadName}>{other?.name || "Inconnu"}</Text>
          {thread.lastMessage?.createdAt && (
            <Text style={t.threadTime}>
              {new Date(thread.lastMessage.createdAt).toLocaleTimeString("fr-TN", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          )}
        </View>
        <View style={t.threadBottom}>
          <Text style={t.threadPreview} numberOfLines={1}>{thread.lastMessage?.content || "Démarrer la conversation"}</Text>
          {thread.unreadCount > 0 && (
            <View style={t.unreadBadge}>
              <Text style={t.unreadText}>{thread.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ConversationView({ otherId, otherName, onBack }: { otherId: string; otherName: string; onBack: () => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    api.get(`/messages/conversation/${otherId}`)
      .then(r => setMessages(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [otherId]);

  const send = async () => {
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText("");
    setSending(true);
    try {
      const res = await api.post("/messages/send", { receiverId: otherId, content });
      setMessages(prev => [...prev, res.data?.data]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {}
    setSending(false);
  };

  return (
    <KeyboardAvoidingView style={c.container} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      {/* Header */}
      <View style={c.header}>
        <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
          <Text style={{ fontSize: 22, color: "#9f1239" }}>‹</Text>
        </TouchableOpacity>
        <View style={c.headerAvatar}>
          <Text style={{ color: "#fff", fontWeight: "800" }}>{otherName[0]?.toUpperCase()}</Text>
        </View>
        <Text style={c.headerName}>{otherName}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#9f1239" style={{ flex: 1 }} />
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const isMine = item.senderId === user?.id;
            return (
              <View style={[c.bubble, isMine ? c.bubbleMine : c.bubbleOther]}>
                <Text style={[c.bubbleText, isMine && { color: "#fff" }]}>{item.content}</Text>
                <Text style={[c.bubbleTime, isMine && { color: "#fecdd3" }]}>
                  {new Date(item.createdAt).toLocaleTimeString("fr-TN", { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            );
          }}
        />
      )}

      <View style={c.inputRow}>
        <TextInput
          style={c.input}
          value={text}
          onChangeText={setText}
          placeholder="Écrire un message..."
          placeholderTextColor="#94a3b8"
          multiline
          returnKeyType="send"
          onSubmitEditing={send}
        />
        <TouchableOpacity style={c.sendBtn} onPress={send} disabled={!text.trim() || sending}>
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 18 }}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

export default function MessagesScreen() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeThread, setActiveThread] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    api.get("/messages/threads")
      .then(r => setThreads(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 40, marginBottom: 12 }}>💬</Text>
      <Text style={{ color: "#64748b", fontWeight: "600" }}>Connectez-vous pour voir vos messages</Text>
    </View>
  );

  if (activeThread) return (
    <ConversationView
      otherId={activeThread.id}
      otherName={activeThread.name}
      onBack={() => setActiveThread(null)}
    />
  );

  return (
    <View style={t.container}>
      <View style={t.titleBar}>
        <Text style={t.pageTitle}>Messages</Text>
      </View>
      {loading ? (
        <ActivityIndicator color="#9f1239" style={{ flex: 1 }} />
      ) : threads.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>💬</Text>
          <Text style={{ color: "#334155", fontWeight: "700", fontSize: 16 }}>Aucun message</Text>
          <Text style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>Contactez un vendeur depuis la fiche produit.</Text>
        </View>
      ) : (
        <FlatList
          data={threads}
          keyExtractor={item => item.other?.id || item.lastMessage?.id}
          renderItem={({ item }) => (
            <ThreadItem
              thread={item}
              onPress={() => setActiveThread({ id: item.other?.id, name: item.other?.name || "Contact" })}
            />
          )}
        />
      )}
    </View>
  );
}

const t = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  titleBar: { backgroundColor: "#fff", padding: 20, paddingTop: 24, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  pageTitle: { fontSize: 22, fontWeight: "900", color: "#1e293b" },
  thread: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f8fafc", gap: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#9f1239", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText: { color: "#fff", fontWeight: "900", fontSize: 18 },
  threadBody: { flex: 1 },
  threadTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  threadName: { fontWeight: "700", color: "#1e293b", fontSize: 14 },
  threadTime: { color: "#94a3b8", fontSize: 11 },
  threadBottom: { flexDirection: "row", alignItems: "center" },
  threadPreview: { flex: 1, color: "#64748b", fontSize: 13 },
  unreadBadge: { backgroundColor: "#9f1239", borderRadius: 999, width: 20, height: 20, alignItems: "center", justifyContent: "center", marginLeft: 8 },
  unreadText: { color: "#fff", fontSize: 11, fontWeight: "800" },
});

const c = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 16, paddingTop: 20, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", gap: 10 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#9f1239", alignItems: "center", justifyContent: "center" },
  headerName: { fontWeight: "800", color: "#1e293b", fontSize: 16, flex: 1 },
  bubble: { maxWidth: "80%", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: "#9f1239", alignSelf: "flex-end", borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: "#fff", alignSelf: "flex-start", borderBottomLeftRadius: 4, borderWidth: 1, borderColor: "#e2e8f0" },
  bubbleText: { color: "#1e293b", fontSize: 14, lineHeight: 20 },
  bubbleTime: { color: "#94a3b8", fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, padding: 12, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  input: { flex: 1, backgroundColor: "#f1f5f9", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: "#1e293b", maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#9f1239", alignItems: "center", justifyContent: "center" },
});
