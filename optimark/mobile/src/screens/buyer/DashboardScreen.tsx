import React, { useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useState } from "react";
import api from "../../api";
import { useAuth } from "../../contexts/AuthContext";

const ROSE = "#9f1239";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "En attente",  color: "#d97706" },
  CONFIRMED: { label: "Confirmée",   color: "#2563eb" },
  SHIPPED:   { label: "Expédiée",    color: "#7c3aed" },
  DELIVERED: { label: "Livrée",      color: "#16a34a" },
  CANCELLED: { label: "Annulée",     color: "#dc2626" },
};

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loyalty, setLoyalty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get("/orders/my"),
      api.get("/loyalty/balance").catch(() => null),
    ]).then(([o, l]) => {
      setOrders(o.data?.data || []);
      setLoyalty(l?.data?.data || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []));

  const totalSpent = orders
    .filter(o => o.status === "DELIVERED")
    .reduce((sum, o) => sum + Number(o.total), 0);

  const deliveredCount = orders.filter(o => o.status === "DELIVERED").length;
  const pendingCount = orders.filter(o => o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "SHIPPED").length;

  if (loading) return <ActivityIndicator size="large" color={ROSE} style={{ marginTop: 60 }} />;

  return (
    <ScrollView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.greeting}>Bonjour{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋</Text>
        <Text style={s.sub}>Voici votre activité sur OPTIMARK</Text>
      </View>

      {/* KPI cards */}
      <View style={s.kpiGrid}>
        <TouchableOpacity style={s.kpiCard} onPress={() => navigation.navigate("Orders")}>
          <Text style={s.kpiIcon}>📦</Text>
          <Text style={s.kpiValue}>{orders.length}</Text>
          <Text style={s.kpiLabel}>Commandes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.kpiCard} onPress={() => navigation.navigate("Orders")}>
          <Text style={s.kpiIcon}>✅</Text>
          <Text style={[s.kpiValue, { color: "#16a34a" }]}>{deliveredCount}</Text>
          <Text style={s.kpiLabel}>Livrées</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.kpiCard} onPress={() => navigation.navigate("Orders")}>
          <Text style={s.kpiIcon}>⏳</Text>
          <Text style={[s.kpiValue, { color: "#d97706" }]}>{pendingCount}</Text>
          <Text style={s.kpiLabel}>En cours</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.kpiCard} onPress={() => navigation.navigate("Loyalty")}>
          <Text style={s.kpiIcon}>⭐</Text>
          <Text style={[s.kpiValue, { color: ROSE }]}>{loyalty?.points ?? 0}</Text>
          <Text style={s.kpiLabel}>Points</Text>
        </TouchableOpacity>
      </View>

      {/* Total spent */}
      <View style={s.spentCard}>
        <Text style={s.spentLabel}>Total dépensé (livraisons)</Text>
        <Text style={s.spentValue}>{totalSpent.toFixed(2)} TND</Text>
      </View>

      {/* Loyalty card */}
      {loyalty && (
        <TouchableOpacity style={s.loyaltyCard} onPress={() => navigation.navigate("Loyalty")}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text style={{ fontSize: 28 }}>⭐</Text>
            <View>
              <Text style={s.loyaltyPoints}>{loyalty.points} points fidélité</Text>
              <Text style={s.loyaltyValue}>≈ {loyalty.equivalentTND} TND · {loyalty.earnRate}</Text>
            </View>
          </View>
          <Text style={{ color: "#92400e", fontSize: 12, fontWeight: "700", marginTop: 10 }}>Gérer mes points →</Text>
        </TouchableOpacity>
      )}

      {/* Recent orders */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Commandes récentes</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Orders")}>
            <Text style={s.sectionLink}>Voir tout →</Text>
          </TouchableOpacity>
        </View>
        {orders.length === 0 ? (
          <View style={s.emptyBox}>
            <Text style={{ fontSize: 32 }}>📦</Text>
            <Text style={s.emptyText}>Aucune commande</Text>
            <TouchableOpacity style={s.shopBtn} onPress={() => navigation.navigate("Home")}>
              <Text style={s.shopBtnText}>Commencer à acheter</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.slice(0, 5).map(o => {
            const st = STATUS_LABELS[o.status] || { label: o.status, color: "#64748b" };
            return (
              <TouchableOpacity key={o.id} style={s.orderRow}
                onPress={() => navigation.navigate("OrderDetail", { id: o.id })}>
                <View style={s.orderIcon}><Text>📦</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.orderId}>#{o.id.slice(-8).toUpperCase()}</Text>
                  <Text style={s.orderDate}>{new Date(o.createdAt).toLocaleDateString("fr-FR")}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={s.orderTotal}>{Number(o.total).toFixed(2)} TND</Text>
                  <Text style={[s.orderStatus, { color: st.color }]}>{st.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Quick links */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Accès rapide</Text>
        <View style={s.quickGrid}>
          {[
            { icon: "❤️", label: "Favoris", screen: "Favorites" },
            { icon: "🕐", label: "Récents", screen: "RecentlyViewed" },
            { icon: "🔔", label: "Alertes", screen: "PriceAlerts" },
            { icon: "🤝", label: "Parrainage", screen: "Referral" },
            { icon: "🎁", label: "Cadeaux", screen: "GiftCards" },
            { icon: "🏷️", label: "Promos", screen: "Promotions" },
          ].map(q => (
            <TouchableOpacity key={q.screen} style={s.quickItem} onPress={() => navigation.navigate(q.screen)}>
              <Text style={{ fontSize: 24 }}>{q.icon}</Text>
              <Text style={s.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: ROSE, padding: 20, paddingTop: 48, paddingBottom: 24 },
  greeting: { fontSize: 22, fontWeight: "900", color: "#fff" },
  sub: { fontSize: 13, color: "#fecdd3", marginTop: 4 },
  kpiGrid: { flexDirection: "row", padding: 12, gap: 10 },
  kpiCard: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#f1f5f9" },
  kpiIcon: { fontSize: 22, marginBottom: 6 },
  kpiValue: { fontSize: 20, fontWeight: "900", color: "#1e293b" },
  kpiLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "600", marginTop: 2, textAlign: "center" },
  spentCard: { marginHorizontal: 12, marginBottom: 12, backgroundColor: "#fff", borderRadius: 16, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#f1f5f9" },
  spentLabel: { fontSize: 13, color: "#64748b", fontWeight: "600" },
  spentValue: { fontSize: 18, fontWeight: "900", color: ROSE },
  loyaltyCard: { marginHorizontal: 12, marginBottom: 12, backgroundColor: "#fefce8", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#fde68a" },
  loyaltyPoints: { fontSize: 15, fontWeight: "800", color: "#92400e" },
  loyaltyValue: { fontSize: 11, color: "#b45309", marginTop: 2 },
  section: { padding: 12, paddingBottom: 0 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "900", color: "#1e293b" },
  sectionLink: { fontSize: 12, color: ROSE, fontWeight: "700" },
  emptyBox: { alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 24, gap: 8, borderWidth: 1, borderColor: "#f1f5f9" },
  emptyText: { fontSize: 14, color: "#64748b", fontWeight: "600" },
  shopBtn: { backgroundColor: ROSE, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  shopBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  orderRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#f1f5f9" },
  orderIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  orderId: { fontSize: 13, fontWeight: "800", color: "#1e293b" },
  orderDate: { fontSize: 11, color: "#94a3b8" },
  orderTotal: { fontSize: 13, fontWeight: "900", color: "#1e293b" },
  orderStatus: { fontSize: 11, fontWeight: "700", marginTop: 2 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  quickItem: { width: "30%", backgroundColor: "#fff", borderRadius: 14, padding: 14, alignItems: "center", gap: 6, borderWidth: 1, borderColor: "#f1f5f9" },
  quickLabel: { fontSize: 12, fontWeight: "700", color: "#1e293b" },
});
