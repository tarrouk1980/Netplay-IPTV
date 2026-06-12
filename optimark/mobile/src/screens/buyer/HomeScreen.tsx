import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Image, ActivityIndicator, StyleSheet, RefreshControl
} from "react-native";
import api from "../../api";

const CATS = ["Tous", "Électronique", "Mode", "Maison", "Alimentation", "Décoration", "Sport", "Beauté"];

export default function HomeScreen({ navigation }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [lives, setLives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cat, setCat] = useState("Tous");

  const load = async () => {
    try {
      const [pRes, fRes, lRes] = await Promise.all([
        api.get("/products"),
        api.get("/flash-sales/active").catch(() => ({ data: { data: [] } })),
        api.get("/live").catch(() => ({ data: { data: [] } })),
      ]);
      setProducts(pRes.data?.data || []);
      setFlashSales((fRes.data?.data || fRes.data || []).slice(0, 4));
      setLives((lRes.data?.data || []).filter((l: any) => l.isActive).slice(0, 5));
    } catch {}
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = products.filter(p => cat === "Tous" || p.category === cat);

  return (
    <ScrollView
      style={s.container}
      stickyHeaderIndices={[0]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9f1239" />}
    >
      {/* Sticky search — tappable, navigates to full search */}
      <TouchableOpacity style={s.searchBar} activeOpacity={0.7} onPress={() => navigation.navigate("Search")}>
        <View pointerEvents="none" style={s.searchInput}>
          <Text style={{ color: "#94a3b8", fontSize: 14 }}>🔍  Rechercher un produit...</Text>
        </View>
      </TouchableOpacity>

      {/* Hero */}
      <View style={s.hero}>
        <Text style={s.heroTitle}>OPTIMARK</Text>
        <Text style={s.heroSub}>Le meilleur du commerce tunisien 🇹🇳</Text>
        <TouchableOpacity style={s.heroBtn} onPress={() => navigation.navigate("FlashSales")}>
          <Text style={s.heroBtnText}>⚡ Voir les ventes flash</Text>
        </TouchableOpacity>
      </View>

      {/* Stats strip */}
      <View style={s.statsRow}>
        {[
          { val: "12M+", label: "Internautes TN" },
          { val: "100%", label: "Sécurisé" },
          { val: "7j/7", label: "Support" },
        ].map(({ val, label }) => (
          <View key={label} style={s.statItem}>
            <Text style={s.statVal}>{val}</Text>
            <Text style={s.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Flash sales strip */}
      {flashSales.length > 0 && (
        <View style={s.flashSection}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>⚡ Ventes Flash</Text>
            <TouchableOpacity onPress={() => navigation.navigate("FlashSales")}>
              <Text style={s.sectionLink}>Tout voir →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
            {flashSales.map((sale: any) => {
              const dp = sale.product ? (sale.product.price * (1 - sale.discount / 100)).toFixed(2) : null;
              return (
                <TouchableOpacity key={sale.id} style={s.flashCard}
                  onPress={() => navigation.navigate("ProductDetail", { id: sale.product?.id })}>
                  <View style={s.flashImg}>
                    {sale.product?.images?.[0]
                      ? <Image source={{ uri: sale.product.images[0] }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                      : <Text style={{ fontSize: 28 }}>📦</Text>}
                    <View style={s.flashBadge}>
                      <Text style={s.flashBadgeText}>-{sale.discount}%</Text>
                    </View>
                  </View>
                  <View style={{ padding: 8 }}>
                    <Text style={s.flashName} numberOfLines={1}>{sale.product?.name}</Text>
                    {dp && <Text style={s.flashPrice}>{dp} TND</Text>}
                    <Text style={s.flashOrig}>{sale.product?.price} TND</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Lives en direct */}
      {lives.length > 0 && (
        <View style={{ paddingTop: 16 }}>
          <View style={s.sectionHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444" }} />
              <Text style={s.sectionTitle}>Lives en direct</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
            {lives.map((live: any) => (
              <TouchableOpacity key={live.id} style={s.liveCard}
                onPress={() => navigation.navigate("LiveView", { id: live.id })}>
                <View style={s.liveImgBox}>
                  <Text style={{ fontSize: 32 }}>📺</Text>
                  <View style={s.liveBadge}>
                    <Text style={s.liveBadgeText}>🔴 LIVE</Text>
                  </View>
                </View>
                <View style={{ padding: 8 }}>
                  <Text style={s.liveName} numberOfLines={2}>{live.title}</Text>
                  <Text style={{ fontSize: 10, color: "#94a3b8" }}>{live.vendor?.name || "Vendeur"}</Text>
                  <Text style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>👁 {live.viewerCount || 0}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={s.catRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {CATS.map(c => (
          <TouchableOpacity key={c} onPress={() => setCat(c)}
            style={[s.catChip, cat === c && s.catChipActive]}>
            <Text style={[s.catChipText, cat === c && s.catChipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>
          {cat === "Tous" ? "Tous les produits" : cat}
          {filtered.length > 0 && <Text style={{ color: "#94a3b8" }}> ({filtered.length})</Text>}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#9f1239" size="large" style={{ marginTop: 40, marginBottom: 60 }} />
      ) : filtered.length === 0 ? (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>😕</Text>
          <Text style={{ color: "#64748b", fontWeight: "600" }}>Aucun produit trouvé</Text>
        </View>
      ) : (
        <View style={s.grid}>
          {filtered.map(p => (
            <TouchableOpacity key={p.id} style={s.card}
              onPress={() => navigation.navigate("ProductDetail", { id: p.id })}>
              <View style={s.cardImg}>
                {p.images?.[0]
                  ? <Image source={{ uri: p.images[0] }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                  : <Text style={{ fontSize: 36 }}>📦</Text>}
                {p.isBestSeller && (
                  <View style={s.cardBadge}>
                    <Text style={s.cardBadgeText}>🏆</Text>
                  </View>
                )}
                {p.stock === 0 && (
                  <View style={[s.cardBadge, { backgroundColor: "#1e293b" }]}>
                    <Text style={s.cardBadgeText}>Épuisé</Text>
                  </View>
                )}
              </View>
              <View style={s.cardBody}>
                <Text style={s.cardTitle} numberOfLines={2}>{p.title}</Text>
                <Text style={s.cardSeller} numberOfLines={1}>{p.seller?.name || "Vendeur"}</Text>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
                  <Text style={s.cardPrice}>{Number(p.promoPrice || p.price).toFixed(2)} TND</Text>
                  {p.promoPrice && (
                    <Text style={s.cardOrigPrice}>{Number(p.price).toFixed(2)}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  searchBar: { backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  searchInput: { flex: 1, backgroundColor: "#f1f5f9", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 11 },
  hero: { backgroundColor: "#9f1239", padding: 28, alignItems: "center", paddingTop: 32, paddingBottom: 28 },
  heroTitle: { color: "#fff", fontSize: 30, fontWeight: "900", letterSpacing: 3, marginBottom: 6 },
  heroSub: { color: "#fecdd3", fontSize: 13, marginBottom: 16 },
  heroBtn: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 14, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  heroBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  statsRow: { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 14 },
  statVal: { fontSize: 18, fontWeight: "900", color: "#9f1239" },
  statLabel: { fontSize: 10, color: "#64748b", marginTop: 2 },
  flashSection: { paddingTop: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
  sectionLink: { fontSize: 13, fontWeight: "700", color: "#9f1239" },
  flashCard: { width: 140, backgroundColor: "#fff", borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: "#fca5a5" },
  flashImg: { height: 100, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center", position: "relative" },
  flashBadge: { position: "absolute", top: 6, left: 6, backgroundColor: "#dc2626", borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 },
  flashBadgeText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  flashName: { fontSize: 11, fontWeight: "700", color: "#1e293b", marginBottom: 2 },
  flashPrice: { fontSize: 14, fontWeight: "900", color: "#9f1239" },
  flashOrig: { fontSize: 10, color: "#94a3b8", textDecorationLine: "line-through" },
  liveCard: { width: 130, backgroundColor: "#0f172a", borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: "#334155" },
  liveImgBox: { height: 80, backgroundColor: "#1e293b", alignItems: "center", justifyContent: "center", position: "relative" },
  liveBadge: { position: "absolute", top: 6, left: 6, backgroundColor: "#dc2626", borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  liveBadgeText: { color: "#fff", fontSize: 9, fontWeight: "900" },
  liveName: { fontSize: 11, fontWeight: "700", color: "#e2e8f0", marginBottom: 2 },
  catRow: { marginVertical: 16 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0" },
  catChipActive: { backgroundColor: "#9f1239", borderColor: "#9f1239" },
  catChipText: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  catChipTextActive: { color: "#fff" },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 8, paddingBottom: 16 },
  card: { width: "47%", backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#e2e8f0" },
  cardImg: { height: 140, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center", position: "relative" },
  cardBadge: { position: "absolute", top: 6, right: 6, backgroundColor: "#f59e0b", borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  cardBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  cardBody: { padding: 10 },
  cardTitle: { fontSize: 12, fontWeight: "700", color: "#1e293b", marginBottom: 2 },
  cardSeller: { fontSize: 10, color: "#94a3b8", marginBottom: 5 },
  cardPrice: { fontSize: 14, fontWeight: "900", color: "#9f1239" },
  cardOrigPrice: { fontSize: 10, color: "#94a3b8", textDecorationLine: "line-through" },
});
