import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert, Image
} from "react-native";
import api from "../../api";
import { useAuth } from "../../contexts/AuthContext";

function Stars({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Text key={i} style={{ fontSize: 12, color: i <= rating ? "#f59e0b" : "#e2e8f0" }}>★</Text>
      ))}
    </View>
  );
}

export default function ServiceDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { user } = useAuth();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/services/${id}`)
      .then(r => setService(r.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleOrder = async () => {
    if (!user) { navigation.navigate("Auth"); return; }
    setOrdering(true);
    try {
      await api.post("/orders", { items: [{ serviceId: id, quantity: 1 }] });
      Alert.alert("✓ Commande passée", "Vous recevrez une confirmation bientôt !", [
        { text: "Voir mes commandes", onPress: () => navigation.navigate("Orders") },
        { text: "OK" }
      ]);
    } catch (e: any) {
      Alert.alert("Erreur", e.response?.data?.message || "Impossible de passer la commande.");
    }
    setOrdering(false);
  };

  const submitReview = async () => {
    if (!user) { navigation.navigate("Auth"); return; }
    if (!reviewText.trim()) { Alert.alert("Requis", "Écrivez un avis."); return; }
    setSubmitting(true);
    try {
      await api.post("/reviews", { serviceId: id, rating: reviewRating, comment: reviewText.trim() });
      setReviewText("");
      setReviewRating(5);
      Alert.alert("✓ Avis publié", "Merci pour votre avis !");
      const r = await api.get(`/services/${id}`);
      setService(r.data?.data);
    } catch (e: any) {
      Alert.alert("Erreur", e.response?.data?.message || "Impossible de publier l'avis.");
    }
    setSubmitting(false);
  };

  if (loading) return <ActivityIndicator color="#9f1239" size="large" style={{ flex: 1, marginTop: 80 }} />;
  if (!service) return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#64748b" }}>Service introuvable.</Text>
    </View>
  );

  const reviews = service.reviews || [];
  const avgRating = reviews.length ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <ScrollView style={s.container}>
      {/* Cover */}
      <View style={s.cover}>
        <Text style={{ fontSize: 56 }}>💼</Text>
        <View style={s.categoryBadge}>
          <Text style={s.categoryText}>{service.category || "Service"}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={s.infoCard}>
        <Text style={s.title}>{service.title}</Text>
        {service.seller && (
          <TouchableOpacity style={s.sellerRow}>
            <View style={s.sellerAvatar}>
              <Text style={{ color: "#fff", fontWeight: "800" }}>{service.seller.name?.[0]}</Text>
            </View>
            <View>
              <Text style={s.sellerName}>{service.seller.name}</Text>
              {service.seller.isVerified && <Text style={s.verifiedText}>✓ Vendeur vérifié</Text>}
            </View>
          </TouchableOpacity>
        )}

        {avgRating && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <Stars rating={Math.round(Number(avgRating))} />
            <Text style={{ color: "#64748b", fontSize: 12 }}>{avgRating}/5 ({reviews.length} avis)</Text>
          </View>
        )}

        <Text style={s.desc}>{service.description}</Text>

        {/* Price + CTA */}
        <View style={s.priceRow}>
          <View>
            <Text style={s.priceLabel}>À partir de</Text>
            <Text style={s.price}>{Number(service.price).toFixed(2)} TND</Text>
          </View>
          <TouchableOpacity style={[s.orderBtn, ordering && { opacity: 0.6 }]} onPress={handleOrder} disabled={ordering}>
            <Text style={s.orderBtnText}>{ordering ? "En cours..." : "Commander"}</Text>
          </TouchableOpacity>
        </View>

        {/* Contact */}
        {user && user.id !== service.sellerId && (
          <TouchableOpacity style={s.contactBtn}
            onPress={() => navigation.navigate("Messages")}>
            <Text style={{ color: "#9f1239", fontWeight: "700", fontSize: 14 }}>💬 Contacter le prestataire</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Reviews */}
      {reviews.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Avis clients</Text>
          {reviews.slice(0, 5).map((r: any) => (
            <View key={r.id} style={s.review}>
              <View style={s.reviewTop}>
                <View style={s.reviewAvatar}>
                  <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>{r.user?.name?.[0] || "?"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.reviewName}>{r.user?.name || "Anonyme"}</Text>
                  <Stars rating={r.rating} />
                </View>
              </View>
              {r.comment && <Text style={s.reviewText}>{r.comment}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Write review */}
      {user && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Laisser un avis</Text>
          <View style={s.starRow}>
            {[1,2,3,4,5].map(i => (
              <TouchableOpacity key={i} onPress={() => setReviewRating(i)}>
                <Text style={{ fontSize: 28, color: i <= reviewRating ? "#f59e0b" : "#e2e8f0" }}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={s.reviewInput}
            value={reviewText}
            onChangeText={setReviewText}
            placeholder="Partagez votre expérience..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity style={[s.submitReviewBtn, submitting && { opacity: 0.6 }]} onPress={submitReview} disabled={submitting}>
            <Text style={{ color: "#fff", fontWeight: "800" }}>{submitting ? "Publication..." : "Publier l'avis"}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  cover: { height: 180, backgroundColor: "#1e293b", alignItems: "center", justifyContent: "center", position: "relative" },
  categoryBadge: { position: "absolute", bottom: 12, left: 16, backgroundColor: "#9f1239", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  categoryText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  infoCard: { backgroundColor: "#fff", margin: 16, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#f1f5f9" },
  title: { fontSize: 20, fontWeight: "900", color: "#0f172a", marginBottom: 14 },
  sellerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  sellerAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#9f1239", alignItems: "center", justifyContent: "center" },
  sellerName: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  verifiedText: { fontSize: 11, color: "#16a34a", fontWeight: "700" },
  desc: { fontSize: 14, color: "#475569", lineHeight: 22, marginBottom: 16 },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTopWidth: 1, borderTopColor: "#f1f5f9", marginBottom: 12 },
  priceLabel: { fontSize: 11, color: "#94a3b8", marginBottom: 2 },
  price: { fontSize: 24, fontWeight: "900", color: "#9f1239" },
  orderBtn: { backgroundColor: "#9f1239", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, alignItems: "center" },
  orderBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  contactBtn: { borderWidth: 1.5, borderColor: "#fca5a5", borderRadius: 14, paddingVertical: 12, alignItems: "center", backgroundColor: "#fff7f7" },
  section: { backgroundColor: "#fff", marginHorizontal: 16, marginBottom: 12, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "#f1f5f9" },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1e293b", marginBottom: 14 },
  review: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  reviewTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#9f1239", alignItems: "center", justifyContent: "center" },
  reviewName: { fontWeight: "700", color: "#1e293b", fontSize: 13, marginBottom: 2 },
  reviewText: { fontSize: 13, color: "#64748b", lineHeight: 18 },
  starRow: { flexDirection: "row", gap: 4, marginBottom: 12 },
  reviewInput: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#1e293b", minHeight: 80, textAlignVertical: "top", marginBottom: 12 },
  submitReviewBtn: { backgroundColor: "#9f1239", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
});
