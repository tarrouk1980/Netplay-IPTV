import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from "react-native";
import api from "../../api";
import { useCart } from "../../contexts/CartContext";

interface Props {
  route: { params: { ids: string[] } };
  navigation: any;
}

export default function CompareScreen({ route, navigation }: Props) {
  const { ids } = route.params;
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    Promise.all(ids.map(id => api.get(`/products/${id}`).then(r => r.data?.data).catch(() => null)))
      .then(results => setProducts(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#9f1239" size="large" style={{ flex: 1, marginTop: 80 }} />;

  const allSpecs = Array.from(new Set(products.flatMap(p => p.specs ? Object.keys(p.specs) : [])));

  const Row = ({ label, values }: { label: string; values: (string | null)[] }) => (
    <View style={s.row}>
      <View style={s.rowLabel}><Text style={s.rowLabelText}>{label}</Text></View>
      {values.map((v, i) => (
        <View key={i} style={s.rowCell}>
          <Text style={s.rowCellText} numberOfLines={2}>{v ?? "—"}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Text style={{ fontSize: 22, color: "#9f1239" }}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Comparaison</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Product headers */}
          <View style={[s.row, { alignItems: "flex-start" }]}>
            <View style={s.rowLabel} />
            {products.map(p => (
              <View key={p.id} style={[s.rowCell, { alignItems: "center" }]}>
                <View style={s.prodImgBox}>
                  {p.images?.[0]
                    ? <Image source={{ uri: p.images[0] }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                    : <Text style={{ fontSize: 32 }}>📦</Text>}
                </View>
                <Text style={s.prodTitle} numberOfLines={2}>{p.title}</Text>
                <Text style={s.prodPrice}>{Number(p.promoPrice || p.price).toFixed(2)} TND</Text>
                <TouchableOpacity style={s.addBtn} onPress={() => {
                  addItem({ id: p.id, title: p.title, price: p.promoPrice || p.price, seller: p.seller?.name || "Vendeur", image: p.images?.[0] });
                }}>
                  <Text style={s.addBtnText}>🛒 Ajouter</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Static attributes */}
          <View style={s.sectionLabel}><Text style={s.sectionLabelText}>Informations générales</Text></View>
          <Row label="Prix" values={products.map(p => `${Number(p.promoPrice || p.price).toFixed(2)} TND`)} />
          {products.some(p => p.promoPrice) && (
            <Row label="Promo" values={products.map(p => p.promoPrice ? `-${Math.round((1 - p.promoPrice / p.price) * 100)}%` : null)} />
          )}
          <Row label="Marque" values={products.map(p => p.brand || null)} />
          <Row label="Catégorie" values={products.map(p => p.category)} />
          <Row label="Stock" values={products.map(p => p.stock > 0 ? `${p.stock} dispo.` : "Épuisé")} />
          <Row label="Vendeur" values={products.map(p => p.seller?.name || "—")} />
          <Row label="Vérifié" values={products.map(p => p.seller?.isVerified ? "✓ Oui" : "Non")} />

          {/* Specs */}
          {allSpecs.length > 0 && (
            <>
              <View style={s.sectionLabel}><Text style={s.sectionLabelText}>Fiche technique</Text></View>
              {allSpecs.map(spec => (
                <Row key={spec} label={spec} values={products.map(p => p.specs?.[spec] ? String(p.specs[spec]) : null)} />
              ))}
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const COL_W = 140;
const LABEL_W = 100;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  title: { fontSize: 18, fontWeight: "800", color: "#1e293b", marginLeft: 8 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  rowLabel: { width: LABEL_W, padding: 10, justifyContent: "center", backgroundColor: "#f8fafc" },
  rowLabelText: { fontSize: 11, fontWeight: "700", color: "#64748b" },
  rowCell: { width: COL_W, padding: 10, borderLeftWidth: 1, borderLeftColor: "#f1f5f9", justifyContent: "center" },
  rowCellText: { fontSize: 12, color: "#1e293b", fontWeight: "600" },
  sectionLabel: { backgroundColor: "#1e293b", paddingHorizontal: 14, paddingVertical: 8 },
  sectionLabelText: { color: "#fff", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
  prodImgBox: { width: 90, height: 90, borderRadius: 12, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: 8 },
  prodTitle: { fontSize: 11, fontWeight: "700", color: "#1e293b", textAlign: "center", marginBottom: 4 },
  prodPrice: { fontSize: 14, fontWeight: "900", color: "#9f1239", marginBottom: 8 },
  addBtn: { backgroundColor: "#9f1239", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  addBtnText: { color: "#fff", fontWeight: "800", fontSize: 11 },
});
