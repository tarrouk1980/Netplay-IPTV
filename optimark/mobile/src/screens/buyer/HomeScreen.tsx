import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import api from "../../api";

const CATS = ["Tous", "Électronique", "Mode", "Maison", "Alimentation", "Décoration", "Sport", "Beauté"];

export default function HomeScreen({ navigation }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Tous");

  useEffect(() => {
    api.get("/products").then(r => setProducts(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = products
    .filter(p => cat === "Tous" || p.category === cat)
    .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <ScrollView style={s.container} stickyHeaderIndices={[0]}>
      {/* Search */}
      <View style={s.searchBar}>
        <TextInput
          style={s.searchInput}
          placeholder="Rechercher un produit..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* Hero */}
      <View style={s.hero}>
        <Text style={s.heroTitle}>OPTIMARK</Text>
        <Text style={s.heroSub}>Le meilleur du commerce tunisien</Text>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {CATS.map(c => (
          <TouchableOpacity key={c} onPress={() => setCat(c)} style={[s.catChip, cat === c && s.catChipActive]}>
            <Text style={[s.catChipText, cat === c && s.catChipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products */}
      <Text style={s.sectionTitle}>{filtered.length} produits</Text>
      {loading ? (
        <ActivityIndicator color="#9f1239" size="large" style={{ marginTop: 40 }} />
      ) : (
        <View style={s.grid}>
          {filtered.map(p => (
            <TouchableOpacity key={p.id} style={s.card} onPress={() => navigation.navigate("ProductDetail", { id: p.id })}>
              <View style={s.cardImg}>
                {p.images?.[0]
                  ? <Image source={{ uri: p.images[0] }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                  : <Text style={{ fontSize: 36 }}>📦</Text>}
              </View>
              <View style={s.cardBody}>
                <Text style={s.cardTitle} numberOfLines={2}>{p.title}</Text>
                <Text style={s.cardSeller} numberOfLines={1}>{p.seller?.name || "Vendeur"}</Text>
                <Text style={s.cardPrice}>{Number(p.promoPrice || p.price).toFixed(2)} TND</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  searchBar: { backgroundColor: "#fff", padding: 12, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  searchInput: { backgroundColor: "#f1f5f9", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: "#1e293b" },
  hero: { backgroundColor: "#9f1239", padding: 24, alignItems: "center" },
  heroTitle: { color: "#fff", fontSize: 28, fontWeight: "900", letterSpacing: 2 },
  heroSub: { color: "#fecdd3", fontSize: 13, marginTop: 4 },
  catRow: { marginVertical: 12 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0" },
  catChipActive: { backgroundColor: "#9f1239", borderColor: "#9f1239" },
  catChipText: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  catChipTextActive: { color: "#fff" },
  sectionTitle: { fontSize: 13, color: "#64748b", fontWeight: "700", marginHorizontal: 16, marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 8, paddingBottom: 32 },
  card: { width: "47%", backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#e2e8f0" },
  cardImg: { height: 140, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  cardBody: { padding: 10 },
  cardTitle: { fontSize: 13, fontWeight: "700", color: "#1e293b", marginBottom: 2 },
  cardSeller: { fontSize: 11, color: "#94a3b8", marginBottom: 6 },
  cardPrice: { fontSize: 15, fontWeight: "900", color: "#9f1239" },
});
