import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert, TextInput, Modal,
  Dimensions, Share
} from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
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
  const [similar, setSimilar] = useState<any[]>([]);
  const [alsoBought, setAlsoBought] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionText, setQuestionText] = useState("");
  const [submittingQ, setSubmittingQ] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [galleryOpen, setGalleryOpen] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      api.get(`/products/${id}`),
      api.get(`/reviews/product/${id}`).catch(() => null),
      user ? api.get(`/favorites/${id}/status`).catch(() => null) : null,
      api.get(`/recommendations/similar/${id}?limit=6`).catch(() => null),
      api.get(`/questions/product/${id}`).catch(() => null),
      api.get(`/products/${id}/also-bought`).catch(() => null),
    ]).then(([pRes, rRes, fRes, simRes, qRes, abRes]) => {
      setProduct(pRes?.data?.data);
      setReviews(rRes?.data?.data || []);
      setFavorited(fRes?.data?.favorited || false);
      setSimilar(simRes?.data?.data || []);
      setQuestions(qRes?.data?.data || []);
      setAlsoBought(abRes?.data?.data || []);
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

  const submitQuestion = async () => {
    if (!user) { Alert.alert("Connexion requise"); return; }
    if (!questionText.trim()) return;
    setSubmittingQ(true);
    try {
      const res = await api.post("/questions", { productId: id, question: questionText });
      setQuestions(prev => [res.data?.data, ...prev]);
      setQuestionText("");
      Alert.alert("✓ Question envoyée", "Le vendeur vous répondra bientôt.");
    } catch (e: any) {
      Alert.alert("Erreur", e.response?.data?.message || "Impossible d'envoyer la question.");
    } finally {
      setSubmittingQ(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Fullscreen gallery modal */}
      <Modal visible={galleryOpen} transparent animationType="fade" onRequestClose={() => setGalleryOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
          <TouchableOpacity style={{ position: "absolute", top: 48, right: 20, zIndex: 10, padding: 10 }} onPress={() => setGalleryOpen(false)}>
            <Text style={{ color: "#fff", fontSize: 28, fontWeight: "900" }}>✕</Text>
          </TouchableOpacity>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ width: SCREEN_W * images.length }}>
            {images.map((img, i) => (
              <View key={i} style={{ width: SCREEN_W, height: SCREEN_H, justifyContent: "center", alignItems: "center" }}>
                <Image source={{ uri: img }} style={{ width: SCREEN_W, height: SCREEN_H * 0.75 }} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>
          <View style={{ flexDirection: "row", position: "absolute", bottom: 40, gap: 6 }}>
            {images.map((_, i) => (
              <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: i === activeImg ? "#fff" : "rgba(255,255,255,0.4)" }} />
            ))}
          </View>
        </View>
      </Modal>

      {/* Image gallery */}
      <TouchableOpacity activeOpacity={0.95} onPress={() => images.length > 0 && setGalleryOpen(true)}>
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
        <TouchableOpacity style={[s.favBtn, { right: 62 }]} onPress={() => Share.share({ title: product.title, message: `${product.title} — ${Number(product.promoPrice || product.price).toFixed(2)} TND\nhttps://optimark.tn/produits/${product.id}` })}>
          <Text style={{ fontSize: 18 }}>↗</Text>
        </TouchableOpacity>
      </View>
      </TouchableOpacity>
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
        <TouchableOpacity style={s.sellerRow} onPress={() => product.seller?.id && navigation.navigate("SellerStore", { sellerId: product.seller.id })}>
          <Text style={s.sellerLabel}>Vendu par </Text>
          <Text style={[s.sellerName, { textDecorationLine: "underline" }]}>{product.seller?.name || "Vendeur"}</Text>
          {product.seller?.isVerified && <Text style={s.verified}> ✓</Text>}
          <Text style={{ color: "#94a3b8", fontSize: 13 }}> →</Text>
        </TouchableOpacity>

        {/* Stock */}
        {product.brand ? <Text style={s.meta}>Marque : <Text style={{ fontWeight: "700" }}>{product.brand}</Text></Text> : null}
        {product.stock !== undefined && (
          <Text style={[s.meta, { color: product.stock > 0 ? "#16a34a" : "#dc2626", fontWeight: "700" }]}>
            {product.stock > 0 ? `✓ ${product.stock} en stock` : "✗ Épuisé"}
            {product.stock > 0 && product.stock <= (product.stockAlert || 5) && " (stock limité !)"}
          </Text>
        )}

        {/* Variants */}
        {Array.isArray(product.variants) && product.variants.length > 0 && (
          <View style={s.variantsSection}>
            {product.variants.map((v: any) => (
              <View key={v.name} style={s.variantGroup}>
                <Text style={s.variantGroupLabel}>{v.name} :</Text>
                <View style={s.variantOptions}>
                  {(v.options || []).map((opt: string) => {
                    const selected = selectedVariants[v.name] === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        style={[s.variantPill, selected && s.variantPillSelected]}
                        onPress={() => setSelectedVariants(prev => ({ ...prev, [v.name]: opt }))}
                      >
                        <Text style={[s.variantPillText, selected && s.variantPillTextSelected]}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
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

        {/* Contact seller + Price alert */}
        <View style={s.secondaryBtnsRow}>
          {product.sellerId && (
            <TouchableOpacity style={[s.contactBtn, { flex: 1 }]} onPress={() => navigation.navigate("Messages")}>
              <Text style={s.contactBtnText}>💬 Contacter</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[s.contactBtn, { flex: 1 }]} onPress={() => navigation.navigate("PriceAlerts", { productId: product.id, productTitle: product.title, currentPrice: price })}>
            <Text style={s.contactBtnText}>🔔 Alerte prix</Text>
          </TouchableOpacity>
        </View>

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
              {r.sellerReply ? (
                <View style={s.sellerReplyBox}>
                  <Text style={s.sellerReplyLabel}>Réponse du vendeur :</Text>
                  <Text style={s.sellerReplyText}>{r.sellerReply}</Text>
                </View>
              ) : null}
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

        {/* Q&A */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>❓ Questions & Réponses ({questions.length})</Text>
          {questions.map(q => (
            <View key={q.id} style={s.qCard}>
              <View style={s.qRow}>
                <View style={s.qAvatar}>
                  <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>{q.user?.name?.[0] || "?"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.qText}>{q.question}</Text>
                  <Text style={s.qMeta}>{q.user?.name} · {new Date(q.createdAt).toLocaleDateString("fr-FR")}</Text>
                </View>
              </View>
              {q.answer ? (
                <View style={s.answerBox}>
                  <Text style={s.answerLabel}>Réponse du vendeur :</Text>
                  <Text style={s.answerText}>{q.answer}</Text>
                </View>
              ) : (
                <View style={s.pendingBox}>
                  <Text style={s.pendingText}>En attente de réponse...</Text>
                </View>
              )}
            </View>
          ))}
          {user && (
            <View style={s.askBox}>
              <TextInput
                style={s.askInput}
                value={questionText}
                onChangeText={setQuestionText}
                placeholder="Posez une question au vendeur..."
                placeholderTextColor="#94a3b8"
                multiline
              />
              <TouchableOpacity style={[s.askBtn, (!questionText.trim() || submittingQ) && { opacity: 0.5 }]} onPress={submitQuestion} disabled={!questionText.trim() || submittingQ}>
                <Text style={s.askBtnText}>{submittingQ ? "Envoi..." : "Envoyer la question"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Also bought */}
        {alsoBought.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>🛒 Achetés ensemble</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingTop: 12 }}>
              {alsoBought.map((p: any) => {
                const abPrice = p.promoPrice || p.price;
                const abImg = p.images?.[0];
                return (
                  <TouchableOpacity key={p.id} style={s.simCard} onPress={() => navigation.push("ProductDetail", { id: p.id })}>
                    <View style={s.simImgBox}>
                      {abImg ? <Image source={{ uri: abImg }} style={{ width: "100%", height: "100%" }} resizeMode="cover" /> : <Text style={{ fontSize: 28 }}>📦</Text>}
                    </View>
                    <Text style={s.simTitle} numberOfLines={2}>{p.title}</Text>
                    <Text style={s.simPrice}>{Number(abPrice).toFixed(2)} TND</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Similar products */}
        {similar.length > 0 && (
          <View style={s.section}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Text style={s.sectionTitle}>Vous aimerez aussi</Text>
              <TouchableOpacity style={s.compareBtn} onPress={() => navigation.navigate("Compare", { ids: [id, ...similar.slice(0, 2).map((p: any) => p.id)] })}>
                <Text style={s.compareBtnText}>⚖️ Comparer</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {similar.map(p => {
                const simPrice = p.promoPrice || p.price;
                const simImg = p.images?.[0];
                return (
                  <TouchableOpacity key={p.id} style={s.simCard} onPress={() => navigation.push("ProductDetail", { id: p.id })}>
                    <View style={s.simImgBox}>
                      {simImg ? <Image source={{ uri: simImg }} style={{ width: "100%", height: "100%" }} resizeMode="cover" /> : <Text style={{ fontSize: 28 }}>📦</Text>}
                    </View>
                    <Text style={s.simTitle} numberOfLines={2}>{p.title}</Text>
                    <Text style={s.simPrice}>{Number(simPrice).toFixed(2)} TND</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
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
  variantsSection: { marginVertical: 12, gap: 12 },
  variantGroup: { gap: 6 },
  variantGroupLabel: { fontSize: 13, fontWeight: "700", color: "#475569" },
  variantOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  variantPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, borderWidth: 1.5, borderColor: "#e2e8f0", backgroundColor: "#f8fafc" },
  variantPillSelected: { borderColor: "#9f1239", backgroundColor: "#9f1239" },
  variantPillText: { fontSize: 13, fontWeight: "600", color: "#475569" },
  variantPillTextSelected: { color: "#fff" },
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
  secondaryBtnsRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  contactBtn: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  contactBtnText: { color: "#64748b", fontWeight: "700", fontSize: 13 },
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
  sellerReplyBox: { marginTop: 8, marginLeft: 4, borderLeftWidth: 3, borderLeftColor: "#9f1239", backgroundColor: "#fef2f2", borderRadius: 8, padding: 10 },
  sellerReplyLabel: { fontSize: 10, fontWeight: "800", color: "#9f1239", marginBottom: 2 },
  sellerReplyText: { fontSize: 12, color: "#475569" },
  writeReview: { marginTop: 20, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 16 },
  stars: { flexDirection: "row", gap: 4, marginBottom: 12 },
  reviewInput: { backgroundColor: "#f1f5f9", borderRadius: 14, padding: 14, fontSize: 14, color: "#1e293b", minHeight: 80, marginBottom: 12 },
  reviewSubmit: { backgroundColor: "#9f1239", borderRadius: 14, paddingVertical: 13, alignItems: "center" },
  reviewSubmitText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  simCard: { width: 130, backgroundColor: "#f8fafc", borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: "#f1f5f9" },
  simImgBox: { width: "100%", height: 100, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  simTitle: { fontSize: 11, fontWeight: "700", color: "#1e293b", padding: 8, paddingBottom: 4 },
  simPrice: { fontSize: 12, fontWeight: "900", color: "#9f1239", paddingHorizontal: 8, paddingBottom: 8 },
  qCard: { backgroundColor: "#f8fafc", borderRadius: 14, padding: 14, marginBottom: 10 },
  qRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  qAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#475569", alignItems: "center", justifyContent: "center", marginTop: 2 },
  qText: { fontSize: 13, fontWeight: "700", color: "#1e293b", lineHeight: 20 },
  qMeta: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  answerBox: { marginLeft: 40, backgroundColor: "#fef2f2", borderLeftWidth: 3, borderLeftColor: "#9f1239", borderRadius: 8, padding: 10 },
  answerLabel: { fontSize: 10, fontWeight: "800", color: "#9f1239", marginBottom: 4 },
  answerText: { fontSize: 12, color: "#475569", lineHeight: 18 },
  pendingBox: { marginLeft: 40, backgroundColor: "#f1f5f9", borderRadius: 8, padding: 8 },
  pendingText: { fontSize: 11, color: "#94a3b8", fontStyle: "italic" },
  askBox: { marginTop: 12, borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 14 },
  askInput: { backgroundColor: "#f1f5f9", borderRadius: 12, padding: 12, fontSize: 14, color: "#1e293b", minHeight: 70, marginBottom: 10 },
  askBtn: { backgroundColor: "#9f1239", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  askBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  compareBtn: { backgroundColor: "#f1f5f9", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  compareBtnText: { fontSize: 12, fontWeight: "700", color: "#475569" },
});
