import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../api";

const ROSE = "#9f1239";

export default function TendancesScreen({ navigation }: any) {
  const [tab, setTab] = useState<"products" | "services">("products");
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get("/recommendations/trending?limit=20"),
      api.get("/recommendations/services?limit=12").catch(() => null),
    ]).then(([p, s]) => {
      setProducts(p.data?.data || []);
      setServices(s?.data?.data || []);
    }).finally(() => setLoading(false));
  }, []));

  const MEDALS = ["🥇", "🥈", "🥉"];

  const renderProduct = ({ item, index }: any) => {
    const discount = item.promoPrice
      ? Math.round((1 - item.promoPrice / item.price) * 100)
      : null;
    return (
      <TouchableOpacity
        style={s.productCard}
        onPress={() => navigation.navigate("ProductDetail", { id: item.id })}
      >
        <View style={s.imgBox}>
          {item.images?.[0] ? (
            <Image source={{ uri: item.images[0] }} style={s.img} />
          ) : (
            <Text style={{ fontSize: 36 }}>📦</Text>
          )}
          {index < 3 && (
            <View style={s.medalBadge}>
              <Text style={{ fontSize: 14 }}>{MEDALS[index]}</Text>
            </View>
          )}
          {discount && (
            <View style={s.discountBadge}>
              <Text style={s.discountText}>-{discount}%</Text>
            </View>
          )}
        </View>
        <View style={s.productInfo}>
          <Text style={s.productTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={s.sellerName} numberOfLines={1}>{item.seller?.name}</Text>
          <View style={s.priceRow}>
            <Text style={s.price}>{item.promoPrice ?? item.price} TND</Text>
            {item.promoPrice && (
              <Text style={s.oldPrice}>{item.price}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderService = ({ item, index }: any) => (
    <TouchableOpacity
      style={s.serviceCard}
      onPress={() => navigation.navigate("ServiceDetail", { id: item.id })}
    >
      <View style={s.serviceIconBox}>
        <Text style={{ fontSize: 22 }}>{index < 3 ? MEDALS[index] : "💼"}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.serviceTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={s.serviceSeller} numberOfLines={1}>{item.seller?.name}</Text>
        <Text style={s.serviceDesc} numberOfLines={2}>{item.description}</Text>
        <View style={s.serviceFooter}>
          <Text style={s.servicePrice}>{item.price} TND</Text>
          <Text style={s.serviceCat}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>🔥 Tendances</Text>
        <Text style={s.headerSub}>Les plus populaires du moment</Text>
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {[
          { key: "products", label: `🛍️ Produits (${products.length})` },
          { key: "services", label: `💼 Services (${services.length})` },
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            style={[s.tab, tab === t.key && s.tabActive]}
            onPress={() => setTab(t.key as any)}
          >
            <Text style={[s.tabText, tab === t.key && s.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={ROSE} style={{ marginTop: 40 }} />
      ) : tab === "products" ? (
        products.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 40 }}>🔥</Text>
            <Text style={s.emptyText}>Aucune tendance pour le moment</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={i => i.id}
            numColumns={2}
            renderItem={renderProduct}
            contentContainerStyle={{ padding: 12, gap: 12 }}
            columnWrapperStyle={{ gap: 12 }}
          />
        )
      ) : (
        services.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 40 }}>💼</Text>
            <Text style={s.emptyText}>Aucun service tendance pour le moment</Text>
          </View>
        ) : (
          <FlatList
            data={services}
            keyExtractor={i => i.id}
            renderItem={renderService}
            contentContainerStyle={{ padding: 12, gap: 12 }}
          />
        )
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: ROSE, padding: 20, paddingTop: 48 },
  headerTitle: { fontSize: 24, fontWeight: "900", color: "#fff" },
  headerSub: { fontSize: 13, color: "#fecdd3", marginTop: 4 },
  tabRow: { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: ROSE },
  tabText: { fontSize: 13, fontWeight: "700", color: "#64748b" },
  tabTextActive: { color: ROSE },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 15, color: "#64748b", fontWeight: "600" },
  // Products
  productCard: { flex: 1, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#f1f5f9" },
  imgBox: { height: 140, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center", position: "relative" },
  img: { width: "100%", height: "100%", resizeMode: "cover" },
  medalBadge: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.1)", borderRadius: 20, padding: 4 },
  discountBadge: { position: "absolute", top: 8, left: 8, backgroundColor: "#16a34a", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  discountText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  productInfo: { padding: 10 },
  productTitle: { fontSize: 13, fontWeight: "700", color: "#1e293b", marginBottom: 2 },
  sellerName: { fontSize: 11, color: "#94a3b8", marginBottom: 6 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  price: { fontSize: 14, fontWeight: "900", color: ROSE },
  oldPrice: { fontSize: 11, color: "#94a3b8", textDecorationLine: "line-through" },
  // Services
  serviceCard: { backgroundColor: "#fff", borderRadius: 16, padding: 14, flexDirection: "row", gap: 12, borderWidth: 1, borderColor: "#f1f5f9" },
  serviceIconBox: { width: 44, height: 44, backgroundColor: "#fff1f2", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  serviceTitle: { fontSize: 14, fontWeight: "800", color: "#1e293b" },
  serviceSeller: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  serviceDesc: { fontSize: 12, color: "#64748b", marginTop: 4 },
  serviceFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  servicePrice: { fontSize: 14, fontWeight: "900", color: ROSE },
  serviceCat: { fontSize: 11, color: "#64748b", backgroundColor: "#f1f5f9", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
});
