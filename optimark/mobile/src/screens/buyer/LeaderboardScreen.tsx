import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../api";

const ROSE = "#9f1239";
const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardScreen({ navigation }: any) {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.get("/vendors?limit=20&sortBy=rating")
      .then(r => setSellers(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const renderSeller = ({ item, index }: any) => (
    <TouchableOpacity
      style={s.card}
      onPress={() => navigation.navigate("SellerStore", { sellerId: item.id })}
    >
      <View style={[s.rank, index < 3 && { backgroundColor: ["#fef9c3", "#f1f5f9", "#fef3c7"][index] }]}>
        <Text style={s.rankText}>{index < 3 ? MEDALS[index] : `#${index + 1}`}</Text>
      </View>

      <View style={s.avatar}>
        <Text style={s.avatarText}>{item.name?.charAt(0)?.toUpperCase() || "?"}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={s.sellerName} numberOfLines={1}>{item.name}</Text>
          {item.isVerified && <Text style={s.verifiedBadge}>✓</Text>}
        </View>
        <Text style={s.sellerStats}>
          ⭐ {item.avgRating?.toFixed(1) || "–"} · {item.reviewCount || 0} avis · {item.productCount || 0} produits
        </Text>
        {item.subscriptionPlan === "PRO" && (
          <Text style={s.planBadge}>⭐ Pro</Text>
        )}
        {item.subscriptionPlan === "BUSINESS" && (
          <Text style={[s.planBadge, { color: "#7c3aed" }]}>💎 Business</Text>
        )}
      </View>

      <Text style={s.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>🏆 Classement</Text>
        <Text style={s.headerSub}>Les meilleurs vendeurs OPTIMARK</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={ROSE} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={sellers}
          keyExtractor={i => i.id}
          renderItem={renderSeller}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#94a3b8", marginTop: 40 }}>
              Aucun vendeur disponible.
            </Text>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: ROSE, padding: 20, paddingTop: 48 },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#fff" },
  headerSub: { fontSize: 13, color: "#fecdd3", marginTop: 4 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#f1f5f9" },
  rank: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  rankText: { fontSize: 16, fontWeight: "900", color: "#1e293b" },
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#fff1f2", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontWeight: "900", color: ROSE },
  sellerName: { fontSize: 14, fontWeight: "800", color: "#1e293b", flex: 1 },
  verifiedBadge: { fontSize: 12, color: "#2563eb", fontWeight: "900" },
  sellerStats: { fontSize: 11, color: "#64748b", marginTop: 2 },
  planBadge: { fontSize: 11, fontWeight: "700", color: ROSE, marginTop: 2 },
  arrow: { fontSize: 20, color: "#cbd5e1" },
});
