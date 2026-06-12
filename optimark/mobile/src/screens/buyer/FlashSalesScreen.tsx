import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, RefreshControl
} from "react-native";
import api from "../../api";

function useCountdown(endAt: string) {
  const [text, setText] = useState("");
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) { setText("Terminé"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setText(`${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
    };
    calc();
    ref.current = setInterval(calc, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [endAt]);

  return text;
}

function FlashCard({ sale, onPress }: { sale: any; onPress: () => void }) {
  const countdown = useCountdown(sale.endAt);
  const discountedPrice = sale.product
    ? (sale.product.price * (1 - sale.discount / 100)).toFixed(2)
    : null;

  return (
    <TouchableOpacity style={s.card} onPress={onPress}>
      <View style={s.imageBox}>
        {sale.product?.images?.[0] ? (
          <Image source={{ uri: sale.product.images[0] }} style={s.image} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: 40 }}>📦</Text>
        )}
        <View style={s.discountBadge}>
          <Text style={s.discountText}>-{sale.discount}%</Text>
        </View>
      </View>
      <View style={s.cardBody}>
        <Text style={s.productName} numberOfLines={2}>{sale.product?.name}</Text>
        <View style={s.priceRow}>
          {discountedPrice && (
            <Text style={s.discountedPrice}>{discountedPrice} TND</Text>
          )}
          <Text style={s.originalPrice}>{sale.product?.price} TND</Text>
        </View>
        <View style={s.countdownBox}>
          <Text style={s.countdownText}>⏱ {countdown}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function FlashSalesScreen({ navigation }: any) {
  const [active, setActive] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [aRes, uRes] = await Promise.all([
        api.get("/flash-sales/active"),
        api.get("/flash-sales/upcoming"),
      ]);
      setActive(aRes.data?.data || aRes.data || []);
      setUpcoming(uRes.data?.data || uRes.data || []);
    } catch {}
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator color="#9f1239" size="large" />
    </View>
  );

  return (
    <FlatList
      style={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9f1239" />}
      ListHeaderComponent={
        <View>
          <View style={s.hero}>
            <Text style={s.heroIcon}>⚡</Text>
            <Text style={s.heroTitle}>Ventes Flash</Text>
            <Text style={s.heroSub}>Offres limitées — profitez-en vite !</Text>
          </View>

          {active.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>🔥 En cours</Text>
                <View style={s.liveBadge}>
                  <Text style={s.liveBadgeText}>{active.length} offre{active.length > 1 ? "s" : ""}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      }
      data={active}
      keyExtractor={item => item.id}
      numColumns={2}
      columnWrapperStyle={{ gap: 12, paddingHorizontal: 16, marginBottom: 12 }}
      renderItem={({ item }) => (
        <View style={{ flex: 1 }}>
          <FlashCard sale={item} onPress={() => navigation.navigate("ProductDetail", { id: item.product?.id })} />
        </View>
      )}
      ListFooterComponent={
        upcoming.length > 0 ? (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>🗓️ Bientôt</Text>
            </View>
            {upcoming.map(sale => (
              <View key={sale.id} style={s.upcomingCard}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                  {sale.product?.images?.[0] ? (
                    <Image source={{ uri: sale.product.images[0] }} style={s.upcomingImage} />
                  ) : (
                    <View style={[s.upcomingImage, { backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" }]}>
                      <Text style={{ fontSize: 24 }}>📦</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={s.upcomingName} numberOfLines={2}>{sale.product?.name}</Text>
                    <Text style={s.upcomingDate}>
                      Début : {new Date(sale.startAt).toLocaleString("fr-TN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                  <View style={s.upcomingDiscount}>
                    <Text style={s.upcomingDiscountText}>-{sale.discount}%</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : null
      }
      ListEmptyComponent={active.length === 0 ? (
        <View style={s.center}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>😴</Text>
          <Text style={s.emptyTitle}>Aucune vente flash en cours</Text>
          <Text style={s.emptySub}>Revenez plus tard !</Text>
        </View>
      ) : null}
    />
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 8 },
  hero: { backgroundColor: "#9f1239", padding: 28, alignItems: "center" },
  heroIcon: { fontSize: 48, marginBottom: 6 },
  heroTitle: { fontSize: 26, fontWeight: "900", color: "#fff", marginBottom: 4 },
  heroSub: { fontSize: 13, color: "#fecdd3" },
  section: { paddingHorizontal: 16, marginTop: 20, marginBottom: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: "#1e293b" },
  liveBadge: { backgroundColor: "#fee2e2", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  liveBadgeText: { color: "#dc2626", fontSize: 11, fontWeight: "700" },
  card: { flex: 1, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", borderWidth: 1.5, borderColor: "#fca5a5" },
  imageBox: { height: 120, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center", position: "relative" },
  image: { width: "100%", height: "100%" },
  discountBadge: { position: "absolute", top: 8, left: 8, backgroundColor: "#dc2626", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  discountText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  cardBody: { padding: 10 },
  productName: { fontSize: 12, fontWeight: "700", color: "#1e293b", marginBottom: 6 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: 6 },
  discountedPrice: { fontSize: 16, fontWeight: "900", color: "#9f1239" },
  originalPrice: { fontSize: 11, color: "#94a3b8", textDecorationLine: "line-through" },
  countdownBox: { backgroundColor: "#1e293b", borderRadius: 8, paddingVertical: 5, alignItems: "center" },
  countdownText: { color: "#fff", fontSize: 11, fontWeight: "700", fontVariant: ["tabular-nums"] },
  upcomingCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#fde68a", marginBottom: 10 },
  upcomingImage: { width: 56, height: 56, borderRadius: 10 },
  upcomingName: { fontSize: 13, fontWeight: "700", color: "#1e293b", marginBottom: 4 },
  upcomingDate: { fontSize: 11, color: "#b45309", fontWeight: "600" },
  upcomingDiscount: { backgroundColor: "#fef3c7", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  upcomingDiscountText: { color: "#92400e", fontWeight: "900", fontSize: 13 },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: "#334155" },
  emptySub: { fontSize: 13, color: "#94a3b8" },
});
