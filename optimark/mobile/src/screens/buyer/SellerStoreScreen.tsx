import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet, ScrollView, Alert } from "react-native";
import api from "../../api";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";

export default function SellerStoreScreen({ route, navigation }: any) {
  const { sellerId } = route.params;
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const { addItem } = useCart();
  const { user } = useAuth();

  const load = useCallback(() => {
    Promise.all([
      api.get(`/vendors/store/public/${sellerId}`).catch(() => null),
      api.get(`/products?sellerId=${sellerId}`).catch(() => null),
      api.get(`/vendors/${sellerId}/follow/status`).catch(() => null),
    ]).then(([storeRes, prodRes, followRes]) => {
      setSeller(storeRes?.data?.data || storeRes?.data || null);
      setProducts(prodRes?.data?.data || []);
      setFollowing(followRes?.data?.data?.following || false);
      setFollowerCount(followRes?.data?.data?.followerCount || 0);
    }).finally(() => setLoading(false));
  }, [sellerId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator color="#9f1239" size="large" style={{ flex: 1, marginTop: 80 }} />;

  const renderProduct = ({ item: p }: any) => {
    const price = p.promoPrice || p.price;
    const img = p.images?.[0];
    return (
      <TouchableOpacity style={s.card} onPress={() => navigation.navigate("ProductDetail", { id: p.id })}>
        <View style={s.imgBox}>
          {img ? <Image source={{ uri: img }} style={s.img} resizeMode="cover" /> : <Text style={{ fontSize: 32 }}>📦</Text>}
        </View>
        {p.promoPrice && <View style={s.badge}><Text style={s.badgeText}>Promo</Text></View>}
        <View style={s.cardInfo}>
          <Text style={s.cardTitle} numberOfLines={2}>{p.title}</Text>
          <Text style={s.cardPrice}>{Number(price).toFixed(2)} TND</Text>
          {p.promoPrice && <Text style={s.cardOld}>{Number(p.price).toFixed(2)} TND</Text>}
          <TouchableOpacity style={s.addBtn} onPress={() => addItem({ id: p.id, title: p.title, price, seller: seller?.name || "", image: img })}>
            <Text style={s.addBtnText}>+ Panier</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={products}
      keyExtractor={p => p.id}
      numColumns={2}
      columnWrapperStyle={{ gap: 12 }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={renderProduct}
      ListHeaderComponent={
        <View style={s.header}>
          <View style={s.sellerAvatar}>
            <Text style={s.sellerAvatarText}>{seller?.name?.charAt(0)?.toUpperCase() || "V"}</Text>
          </View>
          <Text style={s.sellerName}>{seller?.name || "Boutique"}</Text>
          {seller?.isVerified && (
            <View style={s.verifiedBadge}>
              <Text style={s.verifiedText}>✓ Vendeur vérifié</Text>
            </View>
          )}
          {seller?.description && <Text style={s.sellerDesc}>{seller.description}</Text>}
          {user && user.id !== sellerId && (
            <TouchableOpacity style={[s.followBtn, following && s.followingBtn]} onPress={async () => {
              try {
                const res = await api.post(`/vendors/${sellerId}/follow`);
                setFollowing(res.data?.data?.following);
                setFollowerCount(prev => res.data?.data?.following ? prev + 1 : Math.max(0, prev - 1));
              } catch { Alert.alert("Erreur", "Impossible de suivre ce vendeur."); }
            }}>
              <Text style={[s.followBtnText, following && { color: "#64748b" }]}>
                {following ? "✓ Abonné" : "🔔 Suivre"}
              </Text>
            </TouchableOpacity>
          )}
          <View style={s.statsRow}>
            {seller?.avgRating > 0 && (
              <View style={s.stat}>
                <Text style={s.statVal}>★ {Number(seller.avgRating).toFixed(1)}</Text>
                <Text style={s.statLbl}>Note</Text>
              </View>
            )}
            <View style={s.stat}>
              <Text style={s.statVal}>{products.length}</Text>
              <Text style={s.statLbl}>Produits</Text>
            </View>
            {followerCount > 0 && (
              <View style={s.stat}>
                <Text style={s.statVal}>{followerCount}</Text>
                <Text style={s.statLbl}>Abonnés</Text>
              </View>
            )}
            {seller?.totalSales > 0 && (
              <View style={s.stat}>
                <Text style={s.statVal}>{seller.totalSales}</Text>
                <Text style={s.statLbl}>Ventes</Text>
              </View>
            )}
          </View>
          <Text style={s.sectionTitle}>Produits ({products.length})</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={s.empty}>
          <Text style={{ fontSize: 40 }}>📦</Text>
          <Text style={s.emptyText}>Aucun produit pour l'instant</Text>
        </View>
      }
    />
  );
}

const s = StyleSheet.create({
  header: { marginBottom: 8 },
  sellerAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#9f1239", alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 12 },
  sellerAvatarText: { fontSize: 36, color: "#fff", fontWeight: "900" },
  sellerName: { fontSize: 22, fontWeight: "900", color: "#1e293b", textAlign: "center" },
  verifiedBadge: { alignSelf: "center", backgroundColor: "#dcfce7", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6 },
  verifiedText: { fontSize: 12, fontWeight: "700", color: "#15803d" },
  sellerDesc: { fontSize: 13, color: "#64748b", textAlign: "center", marginTop: 8, lineHeight: 18 },
  statsRow: { flexDirection: "row", justifyContent: "center", gap: 24, marginTop: 16, marginBottom: 20 },
  stat: { alignItems: "center" },
  statVal: { fontSize: 18, fontWeight: "900", color: "#1e293b" },
  statLbl: { fontSize: 11, color: "#64748b", fontWeight: "600", marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1e293b", marginBottom: 8 },
  card: { flex: 1, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#f1f5f9" },
  imgBox: { width: "100%", aspectRatio: 1, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center" },
  img: { width: "100%", height: "100%" },
  badge: { position: "absolute", top: 8, left: 8, backgroundColor: "#9f1239", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  cardInfo: { padding: 10 },
  cardTitle: { fontSize: 12, fontWeight: "700", color: "#1e293b", marginBottom: 4 },
  cardPrice: { fontSize: 14, fontWeight: "900", color: "#9f1239" },
  cardOld: { fontSize: 11, color: "#94a3b8", textDecorationLine: "line-through" },
  addBtn: { marginTop: 8, backgroundColor: "#f1f5f9", borderRadius: 8, paddingVertical: 6, alignItems: "center" },
  addBtnText: { fontSize: 11, fontWeight: "800", color: "#9f1239" },
  empty: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 14, color: "#64748b", fontWeight: "600" },
  followBtn: { alignSelf: "center", backgroundColor: "#fff1f2", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10, marginVertical: 12, borderWidth: 1, borderColor: "#fecdd3" },
  followingBtn: { backgroundColor: "#f8fafc", borderColor: "#e2e8f0" },
  followBtnText: { fontSize: 14, fontWeight: "800", color: "#9f1239" },
});
