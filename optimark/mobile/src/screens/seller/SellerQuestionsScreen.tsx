import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../api";

export default function SellerQuestionsScreen() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.get("/questions/seller").then(r => setQuestions(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const submit = async (questionId: string) => {
    const answer = answerMap[questionId]?.trim();
    if (!answer) return;
    setSubmitting(questionId);
    try {
      const res = await api.patch(`/questions/${questionId}/answer`, { answer });
      setQuestions(prev => prev.map(q => q.id === questionId ? res.data?.data : q));
      setAnswerMap(prev => { const n = { ...prev }; delete n[questionId]; return n; });
    } catch (e: any) {
      Alert.alert("Erreur", e.response?.data?.message || "Impossible de répondre.");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return <ActivityIndicator color="#9f1239" size="large" style={{ flex: 1, marginTop: 80 }} />;

  return (
    <FlatList
      data={questions}
      keyExtractor={q => q.id}
      refreshing={loading}
      onRefresh={load}
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
      ListEmptyComponent={
        <View style={{ alignItems: "center", paddingTop: 60 }}>
          <Text style={{ fontSize: 40 }}>❓</Text>
          <Text style={{ color: "#64748b", fontWeight: "600", marginTop: 12 }}>Aucune question pour le moment</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={s.card}>
          <View style={s.headerRow}>
            <View style={s.avatar}>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>{item.user?.name?.[0] || "?"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.userName}>{item.user?.name || "Acheteur"}</Text>
              <Text style={s.productName} numberOfLines={1}>📦 {item.product?.title || ""}</Text>
            </View>
            <Text style={s.date}>{new Date(item.createdAt).toLocaleDateString("fr-FR")}</Text>
          </View>

          <View style={s.questionBox}>
            <Text style={s.questionText}>{item.question}</Text>
          </View>

          {item.answer ? (
            <View style={s.answerBox}>
              <Text style={s.answerLabel}>✓ Votre réponse :</Text>
              <Text style={s.answerText}>{item.answer}</Text>
            </View>
          ) : (
            <View style={s.replyBox}>
              <TextInput
                style={s.replyInput}
                value={answerMap[item.id] || ""}
                onChangeText={v => setAnswerMap(prev => ({ ...prev, [item.id]: v }))}
                placeholder="Votre réponse..."
                placeholderTextColor="#94a3b8"
                multiline
              />
              <TouchableOpacity
                style={[s.replyBtn, (!answerMap[item.id]?.trim() || submitting === item.id) && { opacity: 0.5 }]}
                onPress={() => submit(item.id)}
                disabled={!answerMap[item.id]?.trim() || submitting === item.id}
              >
                <Text style={s.replyBtnText}>{submitting === item.id ? "Envoi..." : "Répondre"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f1f5f9" },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#475569", alignItems: "center", justifyContent: "center" },
  userName: { fontSize: 13, fontWeight: "700", color: "#1e293b" },
  productName: { fontSize: 11, color: "#64748b", marginTop: 1 },
  date: { fontSize: 11, color: "#94a3b8" },
  questionBox: { backgroundColor: "#f8fafc", borderRadius: 10, padding: 12, marginBottom: 10 },
  questionText: { fontSize: 14, color: "#1e293b", lineHeight: 20 },
  answerBox: { backgroundColor: "#fef2f2", borderLeftWidth: 3, borderLeftColor: "#9f1239", borderRadius: 8, padding: 10 },
  answerLabel: { fontSize: 11, fontWeight: "800", color: "#9f1239", marginBottom: 4 },
  answerText: { fontSize: 13, color: "#475569", lineHeight: 18 },
  replyBox: { gap: 8 },
  replyInput: { backgroundColor: "#f1f5f9", borderRadius: 12, padding: 12, fontSize: 14, color: "#1e293b", minHeight: 70 },
  replyBtn: { backgroundColor: "#9f1239", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  replyBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
});
