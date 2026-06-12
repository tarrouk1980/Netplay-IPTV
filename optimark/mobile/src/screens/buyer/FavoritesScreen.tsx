import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet, Alert } from "react-native";
import api from "../../api";
import { useAuth } from "../../contexts/AuthContext";

export default function FavoritesScreen({ navigation }: any) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get("/favorites")
      .then(r => setFavorites(r.data?.data || r.data || []))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (productId: string) => {
    try {
      await api.delete(`/favorites/${productId}`);
      setFavorites(prev => prev.filter(f => (f.productId || f.product?.id || f.id) !== productId));
    } catch {
      Alert.alert("Erreur", "Impossible de supprimer le favori.");
    }
  };

  if (loading) return <ActivityIndicator color="#9f1239" size="large" style={{ flex: 1, marginTop: 80 }} />;

  if (!user) return (
    <View style={s.empty}>
      <Text style={s.emptyIcon}>🔒</Text>
      <Text style={s.emptyTitle}>Connexion requise</Text>
      <Text style={s.emptySub}>Connectez-vous pour voir vos favoris</Text>
      <TouchableOpacity style={s.btn} onPress={() => navigation.navigate("Auth")}>
        <Text style={s.btnText}>Se connecter</Text>
      </TouchableOpacity>
    </View>
  );

  if (favorites.length === 0) return (
    <View style={s.empty}>
      <Text style={s.emptyIcon}>❤️</Text>
      <Text style={s.emptyTitle}>Aucun favori</Text>
      <Text style={s.emptySub}>Ajoutez des produits à vos favoris depuis la page produit</Text>
      <TouchableOpacity style={s.btn} onPress={() => navigation.navigate("Home")}>
        <Text style={s.btnText}>Parcourir les produits</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: any) => {
    const p = item.product || item;
    const productId = item.productId || p.id;
    const price = p.promoPrice || p.price;
    const img = p.images?.[0];

    return (
      <TouchableOpacity style={s.card} onPress={() => navigation.navigate("ProductDetail", { productId })}>
        <View style={s.imgBox}>
          {img
            ? <Image source={{ uri: img }} style={s.img} resizeMode="cover" />
            : <Text style={{ fontSize: 36 }}>📦</Text>}
        </View>
        <View style={s.info}>
          <Text style={s.title} numberOfLines={2}>{p.title}</Text>
          <Text style={s.seller}>{p.seller?.name || "—"}</Text>
          <View style={s.priceRow}>
            <Text style={s.price}>{Number(price).toFixed(2)} TND</Text>
            {p.promoPrice && <Text style={s.oldPrice}>{Number(p.price).toFixed(2)} TND</Text>}
          </View>
          {p.stock === 0 && <Text style={s.outStock}>Épuisé</Text>}
        </View>
        <TouchableOpacity style={s.removeBtn} onPress={() => remove(productId)}>
          <Text style={{ fontSize: 18 }}>🗑️</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item, i) => item.id || String(i)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListHeaderComponent={
          <Text style={s.count}>{favorites.length} favori(s)</Text>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  count: { fontSize: 13, color: "#64748b", fontWeight: "600", marginBottom: 12 },
  card: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#f1f5f9", alignItems: "center" },
  imgBox: { width: 90, height: 90, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  img: { width: 90, height: 90 },
  info: { flex: 1, padding: 12 },
  title: { fontSize: 13, fontWeight: "700", color: "#1e293b", marginBottom: 2 },
  seller: { fontSize: 11, color: "#64748b", marginBottom: 6 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  price: { fontSize: 15, fontWeight: "900", color: "#9f1239" },
  oldPrice: { fontSize: 11, color: "#94a3b8", textDecorationLine: "line-through" },
  outStock: { marginTop: 4, fontSize: 11, color: "#ef4444", fontWeight: "700" },
  removeBtn: { padding: 14 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#1e293b", marginBottom: 6 },
  emptySub: { fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 24 },
  btn: { backgroundColor: "#9f1239", borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
});
