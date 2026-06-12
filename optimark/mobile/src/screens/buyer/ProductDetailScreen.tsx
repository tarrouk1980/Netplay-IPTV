import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert, TextInput
} from "react-native";
import api from "../../api";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";

export default function ProductDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [favorited, setFavorited] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      api.get(`/products/${id}`),
      api.get(`/reviews/product/${id}`).catch(() => null),
      user ? api.get(`/favorites/${id}/status`).catch(() => null) : null,
    ]).then(([pRes, rRes, fRes]) => {
      setProduct(pRes?.data?.data);
      setReviews(rRes?.data?.data || []);
      setFavorited(fRes?.data?.favorited || false);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator color="#9f1239" size="large" style={{ flex: 1, marginTop: 80 }} />;
  if (!product) return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 48 }}>📦</Text>
      <Text style={{ color: "#64748b", fontWeight: "600" }}>Produit introuvable</Text>
    </View>
  );

  const price = product.promoPrice || product.price;
  const images: string[] = product.images?.length ? product.images : [];

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem({ id: product.id, title: product.title, price, seller: product.seller?.name || "Vendeur", image: images[0] });
    Alert.alert("✓ Ajouté", `${product.title} ajouté au panier.`);
  };

  const handleBuyNow = () => {
    addItem({ id: product.id, title: product.title, price, seller: product.seller?.name || "Vendeur", image: images[0] });
    navigation.navigate("Cart");
  };

  const toggleFav = async () => {
    if (!user) { Alert.alert("Connexion", "Connectez-vous pour ajouter aux favoris."); return; }
    try {
      const res = await api.post(`/favorites/${product.id}/toggle`);
      setFavorited(res.data?.favorited ?? !favorited);
    } catch {}
  };

  const submitReview = async () => {
    if (!user) { Alert.alert("Connexion requise"); return; }
    if (!reviewText.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await api.post("/reviews", { productId: id, rating: reviewRating, comment: reviewText });
      setReviews(prev => [res.data?.data, ...prev]);
      setReviewText("");
      setReviewRating(5);
      Alert.alert("✓ Avis publié !");
    } catch (e: any) {
      Alert.alert("Erreur", e.response?.data?.message || "Impossible de publier l'avis.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Image gallery */}
      <View style={s.imgBox}>
        {images[activeImg]
          ? <Image source={{ uri: images[activeImg] }} style={s.img} resizeMode="cover" />
          : <Text style={{ fontSize: 72 }}>📦</Text>}
        {product.isBestSeller && (
          <View style={s.imgBadge}>
            <Text style={s.imgBadgeText}>🏆 Best Seller</Text>
          </View>
        )}
        <TouchableOpacity style={s.favBtn} onPress={toggleFav}>
          <Text style={{ fontSize: 24 }}>{favorited ? "♥" : "♡"}</Text>
        </TouchableOpacity>
      </View>
      {images.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}>
          {images.map((img, i) => (
            <TouchableOpacity key={i} onPress={() => setActiveImg(i)}>
              <Image source={{ uri: img }} style={[s.thumb, activeImg === i && s.thumbActive]} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={s.body}>
        {product.category && <Text style={s.cat}>{product.category}</Text>}
        <Text style={s.title}>{product.title}</Text>

        {/* Rating */}
        {avgRating && (
          <View style={s.ratingRow}>
            <Text style={{ color: "#f59e0b", fontSize: 15 }}>{"★".repeat(Math.round(Number(avgRating)))}</Text>
            <Text style={s.ratingText}>{avgRating} ({reviews.length} avis)</Text>
          </View>
        )}

        {/* Price */}
        <View style={s.priceRow}>
          <Text style={s.price}>{Number(price).toFixed(2)} TND</Text>
          {product.promoPrice && (
            <>
              <Text style={s.original}>{Number(product.price).toFixed(2)} TND</Text>
              <View style={s.discBadge}>
                <Text style={s.discText}>-{Math.round((1 - product.promoPrice / product.price) * 100)}%</Text>
              </View>
            </>
          )}
        </View>

        {/* Seller */}
        <View style={s.sellerRow}>
          <Text style={s.sellerLabel}>Vendu par </Text>
          <Text style={s.sellerName}>{product.seller?.name || "Vendeur"}</Text>
          {product.seller?.isVerified && <Text style={s.verified}> ✓</Text>}
        </View>

        {/* Stock */}
        {product.brand ? <Text style={s.meta}>Marque : <Text style={{ fontWeight: "700" }}>{product.brand}</Text></Text> : null}
        {product.stock !== undefined && (
          <Text style={[s.meta, { color: product.stock > 0 ? "#16a34a" : "#dc2626", fontWeight: "700" }]}>
            {product.stock > 0 ? `✓ ${product.stock} en stock` : "✗ Épuisé"}
            {product.stock > 0 && product.stock <= (product.stockAlert || 5) && " (stock limité !)"}
          </Text>
        )}

        {/* Qty */}
        <View style={s.qtyRow}>
          <Text style={s.qtyLabel}>Quantité :</Text>
          <TouchableOpacity style={s.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))}>
            <Text style={s.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={s.qtyVal}>{qty}</Text>
          <TouchableOpacity style={s.qtyBtn} onPress={() => setQty(q => q + 1)}>
            <Text style={s.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* CTAs */}
        <View style={s.ctaRow}>
          <TouchableOpacity style={s.buyBtn} onPress={handleBuyNow} disabled={product.stock === 0}>
            <Text style={s.buyBtnText}>{product.stock === 0 ? "Épuisé" : "Acheter"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cartBtn} onPress={handleAddToCart} disabled={product.stock === 0}>
            <Text style={s.cartBtnText}>🛒 Panier</Text>
          </TouchableOpacity>
        </View>

        {/* Contact seller */}
        {product.sellerId && (
          <TouchableOpacity style={s.contactBtn} onPress={() => navigation.navigate("Messages")}>
            <Text style={s.contactBtnText}>💬 Contacter le vendeur</Text>
          </TouchableOpacity>
        )}

        {/* Description */}
        {product.description ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Description</Text>
            <Text style={s.desc}>{product.description}</Text>
          </View>
        ) : null}

        {/* Specs */}
        {product.specs && Object.keys(product.specs).length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Fiche technique</Text>
            {Object.entries(product.specs).map(([k, v]) => (
              <View key={k} style={s.specRow}>
                <Text style={s.specKey}>{k}</Text>
                <Text style={s.specVal}>{String(v)}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Reviews */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Avis clients ({reviews.length})</Text>
          {reviews.slice(0, 5).map(r => (
            <View key={r.id} style={s.reviewCard}>
              <View style={s.reviewHeader}>
                <View style={s.reviewAvatar}>
                  <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>{r.user?.name?.[0]?.toUpperCase() || "?"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.reviewName}>{r.user?.name || "Anonyme"}</Text>
                  <Text style={{ color: "#f59e0b", fontSize: 12 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</Text>
                </View>
                <Text style={s.reviewDate}>{new Date(r.createdAt).toLocaleDateString("fr-FR")}</Text>
              </View>
              {r.comment ? <Text style={s.reviewText}>{r.comment}</Text> : null}
            </View>
          ))}

          {/* Write review */}
          {user && (
            <View style={s.writeReview}>
              <Text style={s.sectionTitle}>Laisser un avis</Text>
              <View style={s.stars}>
                {[1,2,3,4,5].map(n => (
                  <TouchableOpacity key={n} onPress={() => setReviewRating(n)}>
                    <Text style={{ fontSize: 28, color: n <= reviewRating ? "#f59e0b" : "#e2e8f0" }}>★</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={s.reviewInput}
                value={reviewText}
                onChangeText={setReviewText}
                placeholder="Votre commentaire..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity style={s.reviewSubmit} onPress={submitReview} disabled={submittingReview || !reviewText.trim()}>
                <Text style={s.reviewSubmitText}>{submittingReview ? "Envoi..." : "Publier l'avis"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  imgBox: { height: 300, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center", position: "relative" },
  img: { width: "100%", height: "100%" },
  imgBadge: { position: "absolute", top: 14, left: 14, backgroundColor: "#f59e0b", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  imgBadgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  favBtn: { position: "absolute", top: 14, right: 14, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  thumb: { width: 60, height: 60, borderRadius: 10, borderWidth: 2, borderColor: "#e2e8f0" },
  thumbActive: { borderColor: "#9f1239" },
  body: { padding: 20 },
  cat: { fontSize: 11, color: "#9f1239", fontWeight: "700", textTransform: "uppercase", marginBottom: 6, letterSpacing: 1 },
  title: { fontSize: 20, fontWeight: "800", color: "#0f172a", lineHeight: 28, marginBottom: 8 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  ratingText: { fontSize: 12, color: "#64748b" },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 10, marginBottom: 10, flexWrap: "wrap" },
  price: { fontSize: 26, fontWeight: "900", color: "#9f1239" },
  original: { fontSize: 14, color: "#94a3b8", textDecorationLine: "line-through" },
  discBadge: { backgroundColor: "#dcfce7", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  discText: { color: "#16a34a", fontWeight: "800", fontSize: 12 },
  sellerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  sellerLabel: { fontSize: 13, color: "#64748b" },
  sellerName: { fontSize: 13, fontWeight: "700", color: "#1e293b" },
  verified: { fontSize: 13, color: "#16a34a", fontWeight: "800" },
  meta: { fontSize: 13, color: "#64748b", marginBottom: 6 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 14, marginVertical: 16 },
  qtyLabel: { fontSize: 14, color: "#64748b", fontWeight: "600", marginRight: 4 },
  qtyBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: "#9f1239", alignItems: "center", justifyContent: "center" },
  qtyBtnText: { fontSize: 20, color: "#9f1239", fontWeight: "700", lineHeight: 22 },
  qtyVal: { fontSize: 18, fontWeight: "800", color: "#1e293b", minWidth: 28, textAlign: "center" },
  ctaRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  buyBtn: { flex: 1, backgroundColor: "#9f1239", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  buyBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  cartBtn: { flex: 1, borderWidth: 2, borderColor: "#9f1239", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  cartBtnText: { color: "#9f1239", fontWeight: "800", fontSize: 15 },
  contactBtn: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 14, paddingVertical: 12, alignItems: "center", marginBottom: 8 },
  contactBtnText: { color: "#64748b", fontWeight: "700", fontSize: 14 },
  section: { marginTop: 20, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: "#1e293b", marginBottom: 12 },
  desc: { fontSize: 14, color: "#475569", lineHeight: 22 },
  specRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  specKey: { fontSize: 13, fontWeight: "600", color: "#64748b", flex: 1 },
  specVal: { fontSize: 13, color: "#1e293b", flex: 1, textAlign: "right" },
  reviewCard: { backgroundColor: "#f8fafc", borderRadius: 14, padding: 14, marginBottom: 10 },
  reviewHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#9f1239", alignItems: "center", justifyContent: "center" },
  reviewName: { fontWeight: "700", color: "#1e293b", fontSize: 13 },
  reviewDate: { color: "#94a3b8", fontSize: 11 },
  reviewText: { fontSize: 13, color: "#475569", lineHeight: 20 },
  writeReview: { marginTop: 20, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 16 },
  stars: { flexDirection: "row", gap: 4, marginBottom: 12 },
  reviewInput: { backgroundColor: "#f1f5f9", borderRadius: 14, padding: 14, fontSize: 14, color: "#1e293b", minHeight: 80, marginBottom: 12 },
  reviewSubmit: { backgroundColor: "#9f1239", borderRadius: 14, paddingVertical: 13, alignItems: "center" },
  reviewSubmitText: { color: "#fff", fontWeight: "800", fontSize: 14 },
});
