import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";
import api from "../../api";
import { useAuth } from "../../contexts/AuthContext";

const PLANS = [
  {
    key: "FREE",
    name: "Gratuit",
    price: 0,
    color: "#64748b",
    bg: "#f8fafc",
    border: "#e2e8f0",
    features: ["10 produits max", "Commission 10%", "Support communautaire"],
  },
  {
    key: "PRO",
    name: "Pro",
    price: 29,
    color: "#9f1239",
    bg: "#fff7f7",
    border: "#fecdd3",
    badge: "⭐ Recommandé",
    features: ["100 produits", "Commission 7%", "Badge Pro", "Analytics avancés", "Support email"],
  },
  {
    key: "BUSINESS",
    name: "Business",
    price: 79,
    color: "#7c3aed",
    bg: "#faf5ff",
    border: "#e9d5ff",
    features: ["Produits illimités", "Commission 5%", "Badge Business", "Live commerce", "Support 24/7"],
  },
];

export default function SellerSubscriptionScreen({ navigation }: any) {
  const { user } = useAuth();
  const [current, setCurrent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    api.get("/subscriptions/me")
      .then(r => setCurrent(r.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upgrade = async (planKey: string) => {
    if (planKey === (current?.plan || "FREE")) return;
    Alert.alert(
      `Passer au plan ${planKey}`,
      planKey === "FREE" ? "Rétrograder au plan gratuit ?" : `Activer le plan ${planKey} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: async () => {
            setUpgrading(planKey);
            try {
              await api.post("/subscriptions/upgrade", { plan: planKey });
              const r = await api.get("/subscriptions/me");
              setCurrent(r.data?.data);
              Alert.alert("✓ Plan activé", `Vous êtes maintenant sur le plan ${planKey} !`);
            } catch (e: any) {
              Alert.alert("Erreur", e.response?.data?.message || "Erreur lors de l'upgrade.");
            } finally {
              setUpgrading(null);
            }
          }
        }
      ]
    );
  };

  if (loading) return <ActivityIndicator color="#9f1239" size="large" style={{ flex: 1, marginTop: 80 }} />;

  const currentPlan = current?.plan || "FREE";

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={s.heading}>Choisissez votre plan</Text>
      <Text style={s.sub}>Développez votre activité sur OPTIMARK</Text>

      {current && (
        <View style={s.currentBanner}>
          <Text style={s.currentBannerText}>Plan actuel : <Text style={{ fontWeight: "900" }}>{currentPlan}</Text></Text>
          {current.expiresAt && <Text style={s.currentBannerSub}>Expire le {new Date(current.expiresAt).toLocaleDateString("fr-TN")}</Text>}
        </View>
      )}

      {PLANS.map(plan => {
        const isActive = currentPlan === plan.key;
        const isUpgrading = upgrading === plan.key;
        return (
          <View key={plan.key} style={[s.card, { borderColor: isActive ? plan.color : plan.border, backgroundColor: plan.bg }]}>
            {plan.badge && (
              <View style={[s.badge, { backgroundColor: plan.color }]}>
                <Text style={s.badgeText}>{plan.badge}</Text>
              </View>
            )}
            {isActive && (
              <View style={[s.badge, { backgroundColor: "#16a34a" }]}>
                <Text style={s.badgeText}>✓ Plan actuel</Text>
              </View>
            )}
            <View style={s.planHeader}>
              <Text style={[s.planName, { color: plan.color }]}>{plan.name}</Text>
              <View style={s.priceRow}>
                <Text style={[s.price, { color: plan.color }]}>{plan.price === 0 ? "Gratuit" : `${plan.price} TND`}</Text>
                {plan.price > 0 && <Text style={s.period}>/mois</Text>}
              </View>
            </View>
            <View style={s.features}>
              {plan.features.map((f, i) => (
                <View key={i} style={s.featureRow}>
                  <Text style={[s.featureCheck, { color: plan.color }]}>✓</Text>
                  <Text style={s.featureText}>{f}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[s.btn, isActive ? s.btnActive : { backgroundColor: plan.color }]}
              onPress={() => upgrade(plan.key)}
              disabled={isActive || isUpgrading !== null}
            >
              <Text style={[s.btnText, isActive && { color: plan.color }]}>
                {isUpgrading ? "Traitement..." : isActive ? "Plan actuel" : plan.key === "FREE" ? "Rétrograder" : `Choisir ${plan.name}`}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  heading: { fontSize: 24, fontWeight: "900", color: "#1e293b", marginBottom: 4 },
  sub: { fontSize: 14, color: "#64748b", marginBottom: 20 },
  currentBanner: { backgroundColor: "#fffbeb", borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "#fde68a" },
  currentBannerText: { fontSize: 14, color: "#92400e", fontWeight: "600" },
  currentBannerSub: { fontSize: 12, color: "#b45309", marginTop: 4 },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 2, position: "relative", overflow: "hidden" },
  badge: { position: "absolute", top: 14, right: 14, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  planHeader: { marginBottom: 16 },
  planName: { fontSize: 22, fontWeight: "900", marginBottom: 4 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  price: { fontSize: 32, fontWeight: "900" },
  period: { fontSize: 14, color: "#94a3b8" },
  features: { gap: 8, marginBottom: 20 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureCheck: { fontSize: 16, fontWeight: "900", width: 20 },
  featureText: { fontSize: 14, color: "#475569", fontWeight: "500" },
  btn: { borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  btnActive: { backgroundColor: "transparent", borderWidth: 2, borderColor: "#e2e8f0" },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
