import React, { useCallback, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../lib/api";

const ROSE = "#9f1239";

export default function RecentlyViewedScreen({ navigation }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.get("/products/recently-viewed")
      .then(r => setProducts(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  if (loading) return (
    <View style={s.center}><ActivityIndicator color={ROSE} size="large" /></View>
  );

  if (products.length === 0) return (
    <View style={s.center}>
      <Text style={{ fontSize: 44, marginBottom: 12 }}>👀</Text>
      <Text style={s.emptyTitle}>Aucun produit consulté</Text>
      <Text style={s.emptySub}>Parcourez notre catalogue pour découvrir des produits.</Text>
    </View>
  );

  const renderItem = ({ item: p }: any) => {
    const discount = p.promoPrice ? Math.round((1 - p.promoPrice / p.price) * 100) : null;
    return (
      <TouchableOpacity style={s.card} onPress={() => navigation.navigate("ProductDetail", { id: p.id })}>
        <View style={s.imageBox}>
          {p.images?.[0] ? (
            <Image source={{ uri: p.images[0] }} style={s.image} />
          ) : (
            <View style={[s.image, s.imagePlaceholder]}>
              <Text style={{ fontSize: 28 }}>📦</Text>
            </View>
          )}
          {discount && (
            <View style={s.badge}>
              <Text style={s.badgeText}>-{discount}%</Text>
            </View>
          )}
        </View>
        <View style={s.info}>
          <Text style={s.title} numberOfLines={2}>{p.title}</Text>
          <Text style={s.seller} numberOfLines={1}>{p.seller?.name}</Text>
          <View style={s.priceRow}>
            <Text style={s.price}>{p.promoPrice ?? p.price} TND</Text>
            {p.promoPrice && <Text style={s.originalPrice}>{p.price} TND</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={products}
      keyExtractor={p => p.id}
      numColumns={2}
      contentContainerStyle={s.list}
      columnWrapperStyle={{ gap: 10 }}
      ListHeaderComponent={
        <Text style={s.header}>{products.length} produit(s) consultés récemment</Text>
      }
      renderItem={renderItem}
    />
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#334155", marginBottom: 6 },
  emptySub: { fontSize: 13, color: "#94a3b8", textAlign: "center" },
  list: { padding: 12, gap: 10 },
  header: { fontSize: 13, color: "#64748b", fontWeight: "600", marginBottom: 4 },
  card: {
    flex: 1, backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 1, borderColor: "#f1f5f9", overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  imageBox: { position: "relative" },
  image: { width: "100%", height: 120 },
  imagePlaceholder: { alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" },
  badge: {
    position: "absolute", top: 6, left: 6,
    backgroundColor: ROSE, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  info: { padding: 10 },
  title: { fontSize: 12, fontWeight: "700", color: "#1e293b", marginBottom: 2 },
  seller: { fontSize: 10, color: "#94a3b8", marginBottom: 6 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 5 },
  price: { fontSize: 13, fontWeight: "800", color: ROSE },
  originalPrice: { fontSize: 11, color: "#94a3b8", textDecorationLine: "line-through" },
});
