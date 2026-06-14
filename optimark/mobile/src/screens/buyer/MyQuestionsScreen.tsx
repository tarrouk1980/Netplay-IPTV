import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, Alert, ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../api";

const ROSE = "#9f1239";

export default function MyQuestionsScreen({ navigation }: any) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.get("/questions/my")
      .then(r => setQuestions(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const deleteQ = (id: string) => {
    Alert.alert("Supprimer", "Supprimer cette question ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer", style: "destructive",
        onPress: async () => {
          await api.delete(`/questions/${id}`).catch(() => {});
          setQuestions(q => q.filter(x => x.id !== id));
        }
      }
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color={ROSE} style={{ marginTop: 60 }} />;

  if (questions.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={{ fontSize: 48 }}>❓</Text>
        <Text style={s.emptyTitle}>Aucune question posée</Text>
        <Text style={s.emptySub}>Posez vos questions aux vendeurs depuis la page produit.</Text>
        <TouchableOpacity style={s.exploreBtn} onPress={() => navigation.navigate("Home")}>
          <Text style={s.exploreBtnText}>Explorer les produits</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }: any) => (
    <View style={s.card}>
      {/* Product */}
      <TouchableOpacity
        style={s.productRow}
        onPress={() => navigation.navigate("ProductDetail", { id: item.product.id })}
      >
        <View style={s.productImg}>
          {item.product.images?.[0] ? (
            <Image source={{ uri: item.product.images[0] }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          ) : (
            <Text style={{ fontSize: 22 }}>📦</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.productTitle} numberOfLines={1}>{item.product.title}</Text>
          <Text style={s.productDate}>{new Date(item.createdAt).toLocaleDateString("fr-FR")}</Text>
        </View>
      </TouchableOpacity>

      {/* Question */}
      <View style={s.qaRow}>
        <Text style={s.qLabel}>Q</Text>
        <Text style={s.qText}>{item.question}</Text>
      </View>

      {/* Answer */}
      {item.answer ? (
        <View style={s.answerBox}>
          <Text style={s.aLabel}>R</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.aText}>{item.answer}</Text>
            {item.answeredAt && (
              <Text style={s.aDate}>
                Répondu le {new Date(item.answeredAt).toLocaleDateString("fr-FR")}
              </Text>
            )}
          </View>
        </View>
      ) : (
        <View style={s.pendingBox}>
          <Text style={s.pendingText}>⏳ En attente de réponse du vendeur</Text>
        </View>
      )}

      {/* Delete */}
      <TouchableOpacity style={s.deleteBtn} onPress={() => deleteQ(item.id)}>
        <Text style={s.deleteBtnText}>Supprimer</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={questions}
      keyExtractor={i => i.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      style={{ backgroundColor: "#f8fafc" }}
    />
  );
}

const s = StyleSheet.create({
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12, backgroundColor: "#f8fafc" },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: "#1e293b" },
  emptySub: { fontSize: 13, color: "#64748b", textAlign: "center" },
  exploreBtn: { marginTop: 8, backgroundColor: ROSE, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  exploreBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f1f5f9" },
  productRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  productImg: { width: 44, height: 44, borderRadius: 10, backgroundColor: "#f1f5f9", overflow: "hidden", alignItems: "center", justifyContent: "center" },
  productTitle: { fontSize: 13, fontWeight: "700", color: "#1e293b" },
  productDate: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  qaRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  qLabel: { fontSize: 13, fontWeight: "900", color: ROSE, width: 18 },
  qText: { flex: 1, fontSize: 14, color: "#1e293b", fontWeight: "500" },
  answerBox: { flexDirection: "row", gap: 10, backgroundColor: "#f0fdf4", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#bbf7d0" },
  aLabel: { fontSize: 13, fontWeight: "900", color: "#16a34a", width: 18 },
  aText: { flex: 1, fontSize: 13, color: "#15803d" },
  aDate: { fontSize: 11, color: "#86efac", marginTop: 4 },
  pendingBox: { backgroundColor: "#f8fafc", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  pendingText: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },
  deleteBtn: { marginTop: 12, alignSelf: "flex-end" },
  deleteBtnText: { fontSize: 12, color: "#94a3b8" },
});
