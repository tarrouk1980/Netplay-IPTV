import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";
import api from "../../api";
import { useCart } from "../../contexts/CartContext";

export default function ProductDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`).then(r => setProduct(r.data?.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator color="#9f1239" size="large" style={{ flex: 1, marginTop: 80 }} />;
  if (!product) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><Text>Produit introuvable</Text></View>;

  const price = product.promoPrice || product.price;
  const image = product.images?.[0];

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem({ id: product.id, title: product.title, price, seller: product.seller?.name || "Vendeur", image });
    Alert.alert("Panier", `${product.title} ajouté au panier ✓`);
  };

  return (
    <ScrollView style={s.container}>
      <View style={s.imgBox}>
        {image
          ? <Image source={{ uri: image }} style={s.img} resizeMode="cover" />
          : <Text style={{ fontSize: 64 }}>📦</Text>}
      </View>

      <View style={s.body}>
        {product.category && <Text style={s.cat}>{product.category}</Text>}
        <Text style={s.title}>{product.title}</Text>

        <View style={s.priceRow}>
          <Text style={s.price}>{Number(price).toFixed(2)} TND</Text>
          {product.promoPrice && <Text style={s.original}>{Number(product.price).toFixed(2)} TND</Text>}
        </View>

        <View style={s.sellerRow}>
          <Text style={s.sellerLabel}>Vendu par </Text>
          <Text style={s.sellerName}>{product.seller?.name || "Vendeur"}</Text>
          {product.seller?.isVerified && <Text style={s.verified}> ✓ Vérifié</Text>}
        </View>

        {product.brand ? <Text style={s.meta}>Marque : <Text style={{ fontWeight: "700" }}>{product.brand}</Text></Text> : null}

        {product.stock !== undefined && (
          <Text style={[s.meta, { color: product.stock > 0 ? "#16a34a" : "#dc2626" }]}>
            {product.stock > 0 ? `${product.stock} en stock` : "Épuisé"}
          </Text>
        )}

        {/* Quantity */}
        <View style={s.qtyRow}>
          <TouchableOpacity style={s.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))}>
            <Text style={s.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={s.qtyVal}>{qty}</Text>
          <TouchableOpacity style={s.qtyBtn} onPress={() => setQty(q => q + 1)}>
            <Text style={s.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.addBtn} onPress={handleAddToCart} disabled={product.stock === 0}>
          <Text style={s.addBtnText}>{product.stock === 0 ? "Épuisé" : "Ajouter au panier"}</Text>
        </TouchableOpacity>

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
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  imgBox: { height: 280, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  img: { width: "100%", height: "100%" },
  body: { padding: 20 },
  cat: { fontSize: 11, color: "#9f1239", fontWeight: "700", textTransform: "uppercase", marginBottom: 6, letterSpacing: 1 },
  title: { fontSize: 20, fontWeight: "800", color: "#0f172a", lineHeight: 28, marginBottom: 12 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 10, marginBottom: 10 },
  price: { fontSize: 24, fontWeight: "900", color: "#9f1239" },
  original: { fontSize: 14, color: "#94a3b8", textDecorationLine: "line-through" },
  sellerRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  sellerLabel: { fontSize: 13, color: "#64748b" },
  sellerName: { fontSize: 13, fontWeight: "700", color: "#1e293b" },
  verified: { fontSize: 12, color: "#16a34a", fontWeight: "700" },
  meta: { fontSize: 13, color: "#64748b", marginBottom: 6 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 16, marginVertical: 16 },
  qtyBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: "#9f1239", alignItems: "center", justifyContent: "center" },
  qtyBtnText: { fontSize: 20, color: "#9f1239", fontWeight: "700" },
  qtyVal: { fontSize: 18, fontWeight: "800", color: "#1e293b", minWidth: 30, textAlign: "center" },
  addBtn: { backgroundColor: "#9f1239", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginBottom: 24 },
  addBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  section: { marginTop: 16, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: "#1e293b", marginBottom: 10 },
  desc: { fontSize: 14, color: "#475569", lineHeight: 22 },
  specRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  specKey: { fontSize: 13, fontWeight: "600", color: "#64748b", flex: 1 },
  specVal: { fontSize: 13, color: "#1e293b", flex: 1, textAlign: "right" },
});
