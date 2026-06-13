import React, { useCallback, useState } from "react";
import {
  View, Text, FlatList, Image, StyleSheet,
  ActivityIndicator, TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../lib/api";

const ROSE = "#9f1239";

export default function SellerStockAlertsScreen({ navigation }: any) {
  const [data, setData] = useState<{ lowStock: any[]; outOfStock: any[] }>({ lowStock: [], outOfStock: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"out" | "low">("out");

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.get("/vendors/stock/alerts")
      .then(r => setData(r.data?.data || { lowStock: [], outOfStock: [] }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  if (loading) return (
    <View style={s.center}><ActivityIndicator color={ROSE} size="large" /></View>
  );

  const items = tab === "out" ? data.outOfStock : data.lowStock;
  const total = data.outOfStock.length + data.lowStock.length;

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Summary banner */}
      <View style={[s.banner, total === 0 && s.bannerGreen]}>
        <Text style={s.bannerText}>
          {total === 0
            ? "✅ Tous vos stocks sont corrects !"
            : `⚠️ ${data.outOfStock.length} rupture(s) · ${data.lowStock.length} stock(s) faible(s)`}
        </Text>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {[
          { key: "out", label: `❌ Ruptures (${data.outOfStock.length})` },
          { key: "low", label: `⚠️ Stock faible (${data.lowStock.length})` },
        ].map(t => (
          <TouchableOpacity key={t.key} style={[s.tab, tab === t.key && s.tabActive]}
            onPress={() => setTab(t.key as any)}>
            <Text style={[s.tabText, tab === t.key && s.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {items.length === 0 ? (
        <View style={s.center}>
          <Text style={{ fontSize: 40, marginBottom: 10 }}>{tab === "out" ? "✅" : "📦"}</Text>
          <Text style={s.emptyTitle}>
            {tab === "out" ? "Aucune rupture de stock !" : "Aucun stock faible !"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={p => p.id}
          contentContainerStyle={{ padding: 14, gap: 10 }}
          renderItem={({ item: p }) => (
            <TouchableOpacity style={s.card}
              onPress={() => navigation.navigate("SellerInventory")}>
              <View style={s.imageBox}>
                {p.images?.[0] ? (
                  <Image source={{ uri: p.images[0] }} style={s.image} />
                ) : (
                  <View style={[s.image, s.imagePlaceholder]}>
                    <Text style={{ fontSize: 20 }}>📦</Text>
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.title} numberOfLines={1}>{p.title}</Text>
                <Text style={s.category}>{p.category}</Text>
                <View style={[s.stockBadge, tab === "out" ? s.outBadge : s.lowBadge]}>
                  <Text style={[s.stockText, tab === "out" ? s.outText : s.lowText]}>
                    {tab === "out" ? "Rupture" : `${p.stock} restant(s)`}
                  </Text>
                </View>
              </View>
              <Text style={s.arrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyTitle: { fontSize: 15, fontWeight: "800", color: "#334155" },
  banner: {
    backgroundColor: "#fef2f2", borderBottomWidth: 1, borderBottomColor: "#fecaca",
    paddingVertical: 10, paddingHorizontal: 16,
  },
  bannerGreen: { backgroundColor: "#f0fdf4", borderBottomColor: "#bbf7d0" },
  bannerText: { fontSize: 13, fontWeight: "700", color: "#374151", textAlign: "center" },
  tabs: { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  tab: { flex: 1, paddingVertical: 11, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: ROSE },
  tabText: { fontSize: 12, fontWeight: "700", color: "#94a3b8" },
  tabTextActive: { color: ROSE },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 12,
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1, borderColor: "#f1f5f9",
    shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  imageBox: { width: 48, height: 48, borderRadius: 8, overflow: "hidden" },
  image: { width: 48, height: 48 },
  imagePlaceholder: { alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" },
  title: { fontSize: 13, fontWeight: "700", color: "#1e293b" },
  category: { fontSize: 11, color: "#94a3b8", marginBottom: 4 },
  stockBadge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  outBadge: { backgroundColor: "#fef2f2" },
  lowBadge: { backgroundColor: "#fffbeb" },
  stockText: { fontSize: 10, fontWeight: "800" },
  outText: { color: "#ef4444" },
  lowText: { color: "#d97706" },
  arrow: { fontSize: 18, color: "#cbd5e1" },
});
