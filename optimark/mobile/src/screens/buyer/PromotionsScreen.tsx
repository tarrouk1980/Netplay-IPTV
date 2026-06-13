import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../lib/api";

const ROSE = "#9f1239";

function Countdown({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Terminé"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  return <Text style={s.countdown}>{remaining}</Text>;
}

export default function PromotionsScreen({ navigation }: any) {
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [promoProducts, setPromoProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"flash" | "promo">("flash");

  useFocusEffect(useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get("/flash-sales/active").catch(() => null),
      api.get("/products?hasPromo=true&limit=20").catch(() => null),
    ]).then(([fs, pp]) => {
      setFlashSales(fs?.data?.data || []);
      setPromoProducts((pp?.data?.data || []).filter((p: any) => p.promoPrice));
    }).finally(() => setLoading(false));
  }, []));

  if (loading) return (
    <View style={s.center}><ActivityIndicator color={ROSE} size="large" /></View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Tabs */}
      <View style={s.tabs}>
        {[
          { key: "flash", label: `⚡ Flash (${flashSales.length})` },
          { key: "promo", label: `🏷️ Promos (${promoProducts.length})` },
        ].map(t => (
          <TouchableOpacity key={t.key} style={[s.tab, tab === t.key && s.tabActive]}
            onPress={() => setTab(t.key as any)}>
            <Text style={[s.tabText, tab === t.key && s.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "flash" ? (
        flashSales.length === 0 ? (
          <View style={s.center}>
            <Text style={{ fontSize: 44, marginBottom: 10 }}>⚡</Text>
            <Text style={s.emptyTitle}>Aucune vente flash active</Text>
            <Text style={s.emptySub}>Revenez bientôt pour découvrir les prochaines offres !</Text>
          </View>
        ) : (
          <FlatList
            data={flashSales}
            keyExtractor={f => f.id}
            contentContainerStyle={{ padding: 12, gap: 12 }}
            renderItem={({ item: sale }) => (
              <TouchableOpacity style={s.flashCard}
                onPress={() => sale.product?.id && navigation.navigate("ProductDetail", { id: sale.product.id })}>
                <View style={s.flashHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.flashTitle}>{sale.title || "Vente Flash"}</Text>
                    <Text style={s.flashProduct} numberOfLines={1}>{sale.product?.title || "Produit"}</Text>
                  </View>
                  <View style={s.discountBadge}>
                    <Text style={s.discountText}>-{sale.discountPercent}%</Text>
                  </View>
                </View>
                <View style={s.flashBody}>
                  <View>
                    <Text style={s.flashPrice}>{sale.flashPrice} TND</Text>
                    {sale.product?.price && (
                      <Text style={s.flashOriginal}>{sale.product.price} TND</Text>
                    )}
                  </View>
                  {sale.stock != null && (
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={s.stockText}>{sale.stock} restant(s)</Text>
                      <View style={s.stockBar}>
                        <View style={[s.stockFill, { width: `${Math.min((sale.stock / (sale.initialStock || sale.stock + 1)) * 100, 100)}%` as any }]} />
                      </View>
                    </View>
                  )}
                </View>
                <View style={s.flashFooter}>
                  <Text style={s.countdownLabel}>⏱ Se termine dans : </Text>
                  <Countdown endsAt={sale.endsAt} />
                </View>
              </TouchableOpacity>
            )}
          />
        )
      ) : (
        promoProducts.length === 0 ? (
          <View style={s.center}>
            <Text style={{ fontSize: 44, marginBottom: 10 }}>🏷️</Text>
            <Text style={s.emptyTitle}>Aucun produit en promotion</Text>
          </View>
        ) : (
          <FlatList
            data={promoProducts}
            keyExtractor={p => p.id}
            numColumns={2}
            contentContainerStyle={{ padding: 10, gap: 10 }}
            columnWrapperStyle={{ gap: 10 }}
            renderItem={({ item: p }) => {
              const pct = Math.round((1 - p.promoPrice / p.price) * 100);
              return (
                <TouchableOpacity style={s.promoCard}
                  onPress={() => navigation.navigate("ProductDetail", { id: p.id })}>
                  <View style={s.promoImageBox}>
                    {p.images?.[0] ? (
                      <Image source={{ uri: p.images[0] }} style={s.promoImage} />
                    ) : (
                      <View style={[s.promoImage, s.promoImagePlaceholder]}>
                        <Text style={{ fontSize: 26 }}>📦</Text>
                      </View>
                    )}
                    <View style={s.promoBadge}>
                      <Text style={s.promoBadgeText}>-{pct}%</Text>
                    </View>
                  </View>
                  <View style={s.promoInfo}>
                    <Text style={s.promoTitle} numberOfLines={2}>{p.title}</Text>
                    <Text style={s.promoNew}>{p.promoPrice} TND</Text>
                    <Text style={s.promoOld}>{p.price} TND</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )
      )}
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#334155", marginBottom: 6 },
  emptySub: { fontSize: 13, color: "#94a3b8", textAlign: "center" },
  tabs: { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: ROSE },
  tabText: { fontSize: 13, fontWeight: "700", color: "#94a3b8" },
  tabTextActive: { color: ROSE },
  flashCard: {
    backgroundColor: "#fff", borderRadius: 16, overflow: "hidden",
    borderWidth: 1, borderColor: "#fda4af",
    shadowColor: ROSE, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  flashHeader: {
    backgroundColor: ROSE, flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 12, gap: 10,
  },
  flashTitle: { color: "#fff", fontWeight: "900", fontSize: 15 },
  flashProduct: { color: "#fda4af", fontSize: 11, marginTop: 2 },
  discountBadge: { backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  discountText: { color: ROSE, fontWeight: "900", fontSize: 16 },
  flashBody: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14 },
  flashPrice: { fontSize: 22, fontWeight: "900", color: ROSE },
  flashOriginal: { fontSize: 13, color: "#94a3b8", textDecorationLine: "line-through" },
  stockText: { fontSize: 11, color: "#64748b", marginBottom: 4 },
  stockBar: { width: 80, height: 4, backgroundColor: "#f1f5f9", borderRadius: 2, overflow: "hidden" },
  stockFill: { height: "100%", backgroundColor: ROSE },
  flashFooter: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingBottom: 12 },
  countdownLabel: { fontSize: 11, color: "#64748b" },
  countdown: { fontSize: 12, fontWeight: "900", color: ROSE, fontVariant: ["tabular-nums"] as any },
  promoCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 14, overflow: "hidden",
    borderWidth: 1, borderColor: "#f1f5f9",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  promoImageBox: { position: "relative" },
  promoImage: { width: "100%", height: 110 },
  promoImagePlaceholder: { alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" },
  promoBadge: {
    position: "absolute", top: 6, left: 6,
    backgroundColor: ROSE, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2,
  },
  promoBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  promoInfo: { padding: 9 },
  promoTitle: { fontSize: 11, fontWeight: "700", color: "#1e293b", marginBottom: 4 },
  promoNew: { fontSize: 13, fontWeight: "900", color: ROSE },
  promoOld: { fontSize: 10, color: "#94a3b8", textDecorationLine: "line-through" },
});
