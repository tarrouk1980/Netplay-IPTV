import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image
} from "react-native";
import api from "../../api";

const CATS = ["Tous", "Électronique", "Mode", "Maison", "Alimentation", "Décoration", "Sport", "Beauté"];

export default function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Tous");
  const [results, setResults] = useState<{ products: any[]; services: any[] }>({ products: [], services: [] });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"products" | "services">("products");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = (q: string, category: string) => {
    if (debounce.current) clearTimeout(debounce.current);
    if (!q.trim()) { setResults({ products: [], services: [] }); return; }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get("/search", { params: { q, type: "all", category: category !== "Tous" ? category : undefined } });
        const data = res.data?.data || {};
        setResults({ products: data.products || [], services: data.services || [] });
      } catch {}
      setLoading(false);
    }, 300);
  };

  const handleInput = (v: string) => {
    setQuery(v);
    search(v, cat);
  };

  const handleCat = (c: string) => {
    setCat(c);
    search(query, c);
  };

  const allResults = tab === "products" ? results.products : results.services;

  return (
    <View style={s.container}>
      {/* Search bar */}
      <View style={s.searchBar}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.input}
          placeholder="Rechercher produits, services..."
          value={query}
          onChangeText={handleInput}
          autoFocus
          returnKeyType="search"
          placeholderTextColor="#94a3b8"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(""); setResults({ products: [], services: [] }); }}>
            <Text style={{ color: "#94a3b8", fontSize: 18, paddingHorizontal: 8 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        data={CATS}
        keyExtractor={c => c}
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 50, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" }}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleCat(item)}
            style={[s.catChip, cat === item && s.catChipActive]}>
            <Text style={[s.catText, cat === item && { color: "#fff" }]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Tabs */}
      {(results.products.length > 0 || results.services.length > 0) && (
        <View style={s.tabBar}>
          <TouchableOpacity style={[s.tabBtn, tab === "products" && s.tabActive]} onPress={() => setTab("products")}>
            <Text style={[s.tabLabel, tab === "products" && s.tabLabelActive]}>Produits ({results.products.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tabBtn, tab === "services" && s.tabActive]} onPress={() => setTab("services")}>
            <Text style={[s.tabLabel, tab === "services" && s.tabLabelActive]}>Services ({results.services.length})</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color="#9f1239" style={{ marginTop: 40 }} />
      ) : query.trim().length === 0 ? (
        <View style={s.placeholder}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>🔍</Text>
          <Text style={{ color: "#64748b", fontWeight: "600", fontSize: 16 }}>Rechercher sur OPTIMARK</Text>
          <Text style={{ color: "#94a3b8", fontSize: 13, marginTop: 4, textAlign: "center" }}>Produits, services, artisans tunisiens...</Text>
        </View>
      ) : allResults.length === 0 ? (
        <View style={s.placeholder}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>😕</Text>
          <Text style={{ color: "#64748b", fontWeight: "600", fontSize: 15 }}>Aucun résultat pour &quot;{query}&quot;</Text>
        </View>
      ) : (
        <FlatList
          data={allResults}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.resultCard}
              onPress={() => navigation.navigate(tab === "products" ? "ProductDetail" : "ServiceDetail", { id: item.id })}>
              <View style={s.resultImg}>
                {item.images?.[0]
                  ? <Image source={{ uri: item.images[0] }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                  : <Text style={{ fontSize: 28 }}>{tab === "products" ? "📦" : "💼"}</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.resultTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={s.resultSeller}>{item.seller?.name || "Vendeur"}</Text>
                <Text style={s.resultPrice}>{Number(item.price).toFixed(2)} TND</Text>
              </View>
              {item.seller?.isVerified && (
                <Text style={{ fontSize: 16 }}>✓</Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  searchIcon: { fontSize: 18 },
  input: { flex: 1, fontSize: 15, color: "#1e293b" },
  catChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: "#f1f5f9" },
  catChipActive: { backgroundColor: "#9f1239" },
  catText: { fontSize: 12, fontWeight: "600", color: "#64748b" },
  tabBar: { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: "#9f1239" },
  tabLabel: { fontSize: 13, fontWeight: "600", color: "#94a3b8" },
  tabLabelActive: { color: "#9f1239", fontWeight: "800" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  resultCard: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 14, padding: 12, gap: 12, borderWidth: 1, borderColor: "#f1f5f9", alignItems: "center" },
  resultImg: { width: 70, height: 70, borderRadius: 10, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 },
  resultTitle: { fontSize: 13, fontWeight: "700", color: "#1e293b", marginBottom: 2 },
  resultSeller: { fontSize: 11, color: "#94a3b8", marginBottom: 4 },
  resultPrice: { fontSize: 14, fontWeight: "900", color: "#9f1239" },
});
