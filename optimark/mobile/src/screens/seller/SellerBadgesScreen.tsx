import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../api";

const ROSE = "#9f1239";

interface Badge {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  achieved: boolean;
  progress?: number;
  goal?: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

const TIER_META = {
  bronze:   { label: "🥉 Bronze",   color: "#92400e", bg: "#fef3c7", border: "#f59e0b" },
  silver:   { label: "🥈 Argent",   color: "#475569", bg: "#f1f5f9", border: "#94a3b8" },
  gold:     { label: "🥇 Or",       color: "#713f12", bg: "#fefce8", border: "#eab308" },
  platinum: { label: "💎 Platine",  color: "#4c1d95", bg: "#f5f3ff", border: "#8b5cf6" },
};

function computeBadges(seller: any, analytics: any): Badge[] {
  const orderCount = analytics?.totalOrders ?? 0;
  const revenue = analytics?.totalRevenue ?? 0;
  const reviewCount = seller?.reviews?.length ?? 0;
  const avgRating = seller?.avgRating ?? 0;
  const followerCount = seller?.followerCount ?? 0;
  const productCount = seller?.products?.length ?? 0;

  return [
    { id: "first_sale", emoji: "🎉", title: "Première vente", tier: "bronze", desc: "Réalisez votre première vente.", achieved: orderCount >= 1, progress: Math.min(orderCount, 1), goal: 1 },
    { id: "ten_sales", emoji: "🏅", title: "10 ventes", tier: "silver", desc: "Atteignez 10 commandes livrées.", achieved: orderCount >= 10, progress: Math.min(orderCount, 10), goal: 10 },
    { id: "hundred_sales", emoji: "🥇", title: "100 ventes", tier: "gold", desc: "Un vrai pro !", achieved: orderCount >= 100, progress: Math.min(orderCount, 100), goal: 100 },
    { id: "thousander", emoji: "🚀", title: "1000 ventes", tier: "platinum", desc: "Vous êtes une référence.", achieved: orderCount >= 1000, progress: Math.min(orderCount, 1000), goal: 1000 },
    { id: "first_review", emoji: "⭐", title: "Premier avis", tier: "bronze", desc: "Recevez votre premier avis.", achieved: reviewCount >= 1, progress: Math.min(reviewCount, 1), goal: 1 },
    { id: "top_rated", emoji: "🌟", title: "Top vendeur", tier: "gold", desc: "Note ≥ 4.5 avec 10+ avis.", achieved: avgRating >= 4.5 && reviewCount >= 10, progress: Math.min(reviewCount, 10), goal: 10 },
    { id: "popular", emoji: "❤️", title: "Boutique populaire", tier: "silver", desc: "50 abonnés à votre boutique.", achieved: followerCount >= 50, progress: Math.min(followerCount, 50), goal: 50 },
    { id: "influencer", emoji: "📣", title: "Influenceur", tier: "gold", desc: "500+ abonnés.", achieved: followerCount >= 500, progress: Math.min(followerCount, 500), goal: 500 },
    { id: "catalog", emoji: "📦", title: "Grand catalogue", tier: "silver", desc: "20 produits actifs.", achieved: productCount >= 20, progress: Math.min(productCount, 20), goal: 20 },
    { id: "revenue_1k", emoji: "💰", title: "1 000 TND", tier: "bronze", desc: "Générez 1 000 TND.", achieved: revenue >= 1000, progress: Math.min(revenue, 1000), goal: 1000 },
    { id: "revenue_10k", emoji: "💎", title: "10 000 TND", tier: "gold", desc: "10 000 TND de revenus.", achieved: revenue >= 10000, progress: Math.min(revenue, 10000), goal: 10000 },
    { id: "revenue_100k", emoji: "👑", title: "100 000 TND", tier: "platinum", desc: "L'élite OPTIMARK.", achieved: revenue >= 100000, progress: Math.min(revenue, 100000), goal: 100000 },
  ];
}

export default function SellerBadgesScreen() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get("/vendors/store/public/me").catch(() => null),
      api.get("/vendors/analytics").catch(() => null),
    ]).then(([s, a]) => {
      setBadges(computeBadges(s?.data?.data, a?.data?.data));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []));

  const achievedCount = badges.filter(b => b.achieved).length;

  if (loading) return <ActivityIndicator size="large" color={ROSE} style={{ marginTop: 60 }} />;

  return (
    <ScrollView style={s.container}>
      {/* Summary */}
      <View style={s.summary}>
        <View style={s.summaryLeft}>
          <Text style={s.summaryValue}>{achievedCount}</Text>
          <Text style={s.summaryLabel}>Obtenus</Text>
        </View>
        <Text style={{ fontSize: 20, color: "rgba(255,255,255,0.4)" }}>/</Text>
        <View style={s.summaryLeft}>
          <Text style={s.summaryValue}>{badges.length}</Text>
          <Text style={s.summaryLabel}>Total</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 20 }}>
          <View style={s.progressTrack}>
            <View style={[s.progressBar, { width: `${(achievedCount / badges.length) * 100}%` as any }]} />
          </View>
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 4 }}>
            {Math.round((achievedCount / badges.length) * 100)}% complété
          </Text>
        </View>
      </View>

      {/* Badges by tier */}
      {(["bronze", "silver", "gold", "platinum"] as const).map(tier => {
        const tm = TIER_META[tier];
        const tierBadges = badges.filter(b => b.tier === tier);
        return (
          <View key={tier} style={s.tierSection}>
            <Text style={[s.tierLabel, { color: tm.color }]}>{tm.label}</Text>
            <View style={s.badgeGrid}>
              {tierBadges.map(b => (
                <View key={b.id} style={[s.badgeCard, { backgroundColor: b.achieved ? tm.bg : "#f8fafc", borderColor: b.achieved ? tm.border : "#e2e8f0", opacity: b.achieved ? 1 : 0.6 }]}>
                  <Text style={{ fontSize: 28, marginBottom: 6 }}>{b.emoji}</Text>
                  <Text style={s.badgeTitle}>{b.title}</Text>
                  <Text style={s.badgeDesc}>{b.desc}</Text>
                  {b.achieved ? (
                    <View style={[s.achievedBadge, { backgroundColor: tm.border + "30" }]}>
                      <Text style={[s.achievedText, { color: tm.color }]}>✓ Obtenu</Text>
                    </View>
                  ) : b.progress !== undefined && b.goal ? (
                    <View style={{ width: "100%", marginTop: 8 }}>
                      <View style={s.miniProgress}>
                        <View style={[s.miniBar, { width: `${(b.progress / b.goal) * 100}%` as any, backgroundColor: tm.border }]} />
                      </View>
                      <Text style={s.miniLabel}>{b.progress}/{b.goal}</Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  summary: { backgroundColor: ROSE, flexDirection: "row", alignItems: "center", padding: 20, paddingTop: 24, gap: 12 },
  summaryLeft: { alignItems: "center" },
  summaryValue: { fontSize: 28, fontWeight: "900", color: "#fff" },
  summaryLabel: { fontSize: 11, color: "#fecdd3", marginTop: 2 },
  progressTrack: { height: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 99, overflow: "hidden" },
  progressBar: { height: "100%", backgroundColor: "#fff", borderRadius: 99 },
  tierSection: { padding: 14, paddingBottom: 0 },
  tierLabel: { fontSize: 13, fontWeight: "900", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 6 },
  badgeCard: { width: "47%", borderRadius: 16, padding: 14, borderWidth: 1 },
  badgeTitle: { fontSize: 13, fontWeight: "800", color: "#1e293b", marginBottom: 4 },
  badgeDesc: { fontSize: 11, color: "#64748b", lineHeight: 16 },
  achievedBadge: { marginTop: 8, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  achievedText: { fontSize: 11, fontWeight: "900" },
  miniProgress: { height: 4, backgroundColor: "#e2e8f0", borderRadius: 99, overflow: "hidden", marginBottom: 3 },
  miniBar: { height: "100%", borderRadius: 99 },
  miniLabel: { fontSize: 10, color: "#94a3b8" },
});
