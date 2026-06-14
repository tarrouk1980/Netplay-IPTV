import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../api";

const ROSE = "#9f1239";

export default function SellerPromotionsScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "promo" | "none">("all");
  const [search, setSearch] = useState("");

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.get("/vendors/products?limit=100")
      .then(r => {
        const data = r.data?.data || [];
        setProducts(data);
        const init: Record<string, string> = {};
        data.forEach((p: any) => { init[p.id] = p.promoPrice?.toString() ?? ""; });
        setEdits(init);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const applyPromo = async (product: any) => {
    const val = parseFloat(edits[product.id]);
    if (isNaN(val) || val <= 0 || val >= product.price) {
      Alert.alert("Prix invalide", `Le prix promo doit être inférieur à ${product.price} TND.`);
      return;
    }
    setSaving(product.id);
    try {
      await api.patch(`/vendors/products/${product.id}`, { promoPrice: val });
      setProducts(ps => ps.map(p => p.id === product.id ? { ...p, promoPrice: val } : p));
      Alert.alert("✓ Promo appliquée", `${product.title} : ${val} TND au lieu de ${product.price} TND`);
    } catch (e: any) {
      Alert.alert("Erreur", e.response?.data?.message || "Impossible d'appliquer la promo.");
    } finally {
      setSaving(null);
    }
  };

  const removePromo = (product: any) => {
    Alert.alert("Supprimer la promo", `Supprimer la promotion sur "${product.title}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer", style: "destructive",
        onPress: async () => {
          setSaving(product.id);
          try {
            await api.patch(`/vendors/products/${product.id}`, { promoPrice: null });
            setProducts(ps => ps.map(p => p.id === product.id ? { ...p, promoPrice: null } : p));
            setEdits(e => ({ ...e, [product.id]: "" }));
          } catch {}
          setSaving(null);
        }
      }
    ]);
  };

  const filtered = products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "promo" ? !!p.promoPrice :
      filter === "none" ? !p.promoPrice :
      true;
    return matchSearch && matchFilter;
  });

  const promoCount = products.filter(p => !!p.promoPrice).length;

  const renderItem = ({ item }: any) => {
    const discount = item.promoPrice
      ? Math.round((1 - Number(item.promoPrice) / Number(item.price)) * 100)
      : null;
    const isSaving = saving === item.id;

    return (
      <View style={s.card}>
        <View style={s.cardTop}>
          <View style={s.imgBox}>
            {item.images?.[0] ? (
              <Image source={{ uri: item.images[0] }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: 22 }}>📦</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.productTitle} numberOfLines={2}>{item.title}</Text>
            <View style={s.priceRow}>
              <Text style={s.basePrice}>{item.price} TND</Text>
              {item.promoPrice && (
                <>
                  <Text style={s.promoPrice}>→ {item.promoPrice} TND</Text>
                  <View style={s.discountBadge}>
                    <Text style={s.discountText}>-{discount}%</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={edits[item.id] ?? ""}
            onChangeText={t => setEdits(e => ({ ...e, [item.id]: t }))}
            placeholder="Prix promo (TND)"
            placeholderTextColor="#94a3b8"
            keyboardType="decimal-pad"
          />
          <TouchableOpacity
            style={[s.applyBtn, isSaving && { opacity: 0.6 }]}
            onPress={() => applyPromo(item)}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={s.applyText}>Appliquer</Text>
            )}
          </TouchableOpacity>
          {item.promoPrice && (
            <TouchableOpacity style={s.removeBtn} onPress={() => removePromo(item)} disabled={isSaving}>
              <Text style={s.removeText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={s.container}>
      {/* Stats bar */}
      <View style={s.statsBar}>
        <View style={s.statItem}>
          <Text style={s.statValue}>{products.length}</Text>
          <Text style={s.statLabel}>Produits</Text>
        </View>
        <View style={[s.statItem, { borderLeftWidth: 1, borderLeftColor: "rgba(255,255,255,0.2)" }]}>
          <Text style={s.statValue}>{promoCount}</Text>
          <Text style={s.statLabel}>En promo</Text>
        </View>
        <View style={[s.statItem, { borderLeftWidth: 1, borderLeftColor: "rgba(255,255,255,0.2)" }]}>
          <Text style={s.statValue}>{products.length - promoCount}</Text>
          <Text style={s.statLabel}>Sans promo</Text>
        </View>
      </View>

      {/* Search + filter */}
      <View style={s.controls}>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher..."
          placeholderTextColor="#94a3b8"
        />
        <View style={s.filterRow}>
          {[
            { key: "all", label: "Tous" },
            { key: "promo", label: "🏷️ Promo" },
            { key: "none", label: "Sans promo" },
          ].map(f => (
            <TouchableOpacity key={f.key} style={[s.filterBtn, filter === f.key && s.filterBtnActive]}
              onPress={() => setFilter(f.key as any)}>
              <Text style={[s.filterText, filter === f.key && s.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={ROSE} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12, gap: 10 }}
          ListEmptyComponent={<Text style={s.empty}>Aucun produit trouvé.</Text>}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  statsBar: { backgroundColor: ROSE, flexDirection: "row", padding: 16 },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "900", color: "#fff" },
  statLabel: { fontSize: 11, color: "#fecdd3", marginTop: 2 },
  controls: { padding: 12, gap: 10 },
  searchInput: { backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#1e293b", borderWidth: 1, borderColor: "#e2e8f0" },
  filterRow: { flexDirection: "row", gap: 8 },
  filterBtn: { flex: 1, backgroundColor: "#fff", borderRadius: 10, paddingVertical: 8, alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  filterBtnActive: { backgroundColor: ROSE, borderColor: ROSE },
  filterText: { fontSize: 12, fontWeight: "700", color: "#64748b" },
  filterTextActive: { color: "#fff" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#f1f5f9" },
  cardTop: { flexDirection: "row", gap: 12, marginBottom: 12 },
  imgBox: { width: 52, height: 52, borderRadius: 12, backgroundColor: "#f1f5f9", overflow: "hidden", alignItems: "center", justifyContent: "center" },
  productTitle: { fontSize: 13, fontWeight: "700", color: "#1e293b", flex: 1 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" },
  basePrice: { fontSize: 13, fontWeight: "700", color: "#475569" },
  promoPrice: { fontSize: 13, fontWeight: "900", color: ROSE },
  discountBadge: { backgroundColor: "#fff1f2", borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  discountText: { fontSize: 11, fontWeight: "900", color: ROSE },
  inputRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  input: { flex: 1, backgroundColor: "#f8fafc", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, color: "#1e293b", borderWidth: 1, borderColor: "#e2e8f0" },
  applyBtn: { backgroundColor: ROSE, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  applyText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  removeBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#fee2e2", alignItems: "center", justifyContent: "center" },
  removeText: { color: "#ef4444", fontWeight: "900", fontSize: 14 },
  empty: { textAlign: "center", color: "#94a3b8", marginTop: 40, fontSize: 14 },
});
