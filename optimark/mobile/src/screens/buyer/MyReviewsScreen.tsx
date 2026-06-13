import React, { useCallback, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../lib/api";

const ROSE = "#9f1239";

function Stars({ n }: { n: number }) {
  return (
    <Text style={{ color: "#f59e0b", fontSize: 13 }}>
      {"★".repeat(n)}{"☆".repeat(5 - n)}
    </Text>
  );
}

export default function MyReviewsScreen() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.get("/reviews/my")
      .then(r => setReviews(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const remove = (id: string) => {
    Alert.alert("Supprimer", "Supprimer cet avis définitivement ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer", style: "destructive", onPress: async () => {
          await api.delete(`/reviews/${id}`).catch(() => {});
          setReviews(prev => prev.filter(r => r.id !== id));
        },
      },
    ]);
  };

  if (loading) return (
    <View style={s.center}><ActivityIndicator color={ROSE} size="large" /></View>
  );

  if (reviews.length === 0) return (
    <View style={s.center}>
      <Text style={{ fontSize: 40, marginBottom: 12 }}>⭐</Text>
      <Text style={s.emptyTitle}>Aucun avis pour le moment</Text>
      <Text style={s.emptySub}>Achetez des produits et partagez votre expérience.</Text>
    </View>
  );

  return (
    <FlatList
      data={reviews}
      keyExtractor={r => r.id}
      contentContainerStyle={s.list}
      ListHeaderComponent={
        <Text style={s.header}>Vous avez laissé {reviews.length} avis</Text>
      }
      renderItem={({ item: r }) => {
        const item = r.product || r.service;
        const date = new Date(r.createdAt).toLocaleDateString("fr-FR");
        return (
          <View style={s.card}>
            <View style={s.cardTop}>
              <View style={s.itemRow}>
                {r.product?.images?.[0] ? (
                  <Image source={{ uri: r.product.images[0] }} style={s.thumb} />
                ) : (
                  <View style={[s.thumb, s.thumbPlaceholder]}>
                    <Text style={{ fontSize: 20 }}>📦</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={s.itemTitle} numberOfLines={1}>{item?.title || "Produit"}</Text>
                  <Stars n={r.rating} />
                </View>
              </View>
              <View style={s.rightCol}>
                <Text style={s.dateText}>{date}</Text>
                <TouchableOpacity onPress={() => remove(r.id)} style={s.deleteBtn}>
                  <Text style={s.deleteText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {r.comment ? (
              <View style={s.commentBox}>
                <Text style={s.commentText}>{r.comment}</Text>
              </View>
            ) : null}

            {r.images?.length > 0 && (
              <View style={s.imagesRow}>
                {r.images.slice(0, 4).map((img: string, i: number) => (
                  <Image key={i} source={{ uri: img }} style={s.reviewImg} />
                ))}
              </View>
            )}

            {r.sellerReply ? (
              <View style={s.replyBox}>
                <Text style={s.replyLabel}>Réponse du vendeur :</Text>
                <Text style={s.replyText}>{r.sellerReply}</Text>
              </View>
            ) : null}
          </View>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#334155", marginBottom: 6 },
  emptySub: { fontSize: 13, color: "#94a3b8", textAlign: "center" },
  list: { padding: 16, gap: 12 },
  header: { fontSize: 13, color: "#64748b", fontWeight: "600", marginBottom: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  itemRow: { flexDirection: "row", gap: 10, flex: 1, alignItems: "center" },
  thumb: { width: 44, height: 44, borderRadius: 10 },
  thumbPlaceholder: { backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center" },
  itemTitle: { fontSize: 13, fontWeight: "700", color: "#1e293b", marginBottom: 2 },
  rightCol: { alignItems: "flex-end", gap: 4 },
  dateText: { fontSize: 11, color: "#94a3b8" },
  deleteBtn: { padding: 4 },
  deleteText: { fontSize: 13, color: "#cbd5e1" },
  commentBox: { backgroundColor: "#f8fafc", borderRadius: 10, padding: 10, marginBottom: 8 },
  commentText: { fontSize: 13, color: "#475569" },
  imagesRow: { flexDirection: "row", gap: 6, marginBottom: 8 },
  reviewImg: { width: 56, height: 56, borderRadius: 8 },
  replyBox: { borderLeftWidth: 3, borderLeftColor: ROSE, backgroundColor: "#fff1f2", borderRadius: 8, padding: 10 },
  replyLabel: { fontSize: 11, fontWeight: "800", color: ROSE, marginBottom: 3 },
  replyText: { fontSize: 12, color: "#334155" },
});
