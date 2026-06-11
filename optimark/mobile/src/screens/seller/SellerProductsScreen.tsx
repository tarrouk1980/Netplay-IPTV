import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../api";

export default function SellerProductsScreen({ navigation }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/seller/products").then(r => setProducts(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const deleteProduct = (id: string, title: string) => {
    Alert.alert("Supprimer", `Supprimer "${title}" ?`, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: async () => {
        await api.delete(`/products/${id}`).catch(() => {});
        load();
      }},
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <FlatList
        data={products}
        keyExtractor={p => p.id}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 100 }}
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Text style={{ fontSize: 40 }}>📦</Text>
              <Text style={{ color: "#64748b", fontWeight: "600", marginTop: 12 }}>Aucun produit</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={{ flex: 1 }}>
              <Text style={s.title} numberOfLines={2}>{item.title}</Text>
              <Text style={s.price}>{Number(item.promoPrice || item.price).toFixed(2)} TND</Text>
              <Text style={s.stock}>Stock : {item.stock ?? "—"}</Text>
            </View>
            <View style={s.actions}>
              <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate("SellerEditProduct", { id: item.id })}>
                <Text style={s.editBtnText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.delBtn} onPress={() => deleteProduct(item.id, item.title)}>
                <Text style={s.delBtnText}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate("SellerAddProduct")}>
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#f1f5f9" },
  title: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  price: { fontSize: 15, fontWeight: "900", color: "#9f1239", marginTop: 4 },
  stock: { fontSize: 12, color: "#64748b", marginTop: 2 },
  actions: { flexDirection: "row", gap: 8, marginLeft: 12 },
  editBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  editBtnText: { fontSize: 18 },
  delBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fef2f2", alignItems: "center", justifyContent: "center" },
  delBtnText: { fontSize: 18 },
  fab: { position: "absolute", bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: "#9f1239", alignItems: "center", justifyContent: "center", elevation: 6 },
  fabText: { color: "#fff", fontSize: 32, fontWeight: "300", lineHeight: 38 },
});
