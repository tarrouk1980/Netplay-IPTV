import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import api from "../../api";
import { useAuth } from "../../contexts/AuthContext";

export default function SellerDashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/seller/stats").catch(() => null),
      api.get("/seller/orders").catch(() => null),
    ]).then(([sRes, oRes]) => {
      setStats(sRes?.data?.data || null);
      setOrders((oRes?.data?.data || []).slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#9f1239" size="large" style={{ flex: 1, marginTop: 80 }} />;

  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <Text style={s.greeting}>Bonjour, {user?.name} 👋</Text>
        <Text style={s.sub}>Tableau de bord vendeur</Text>
      </View>

      {/* Stats */}
      <View style={s.statsGrid}>
        {[
          { label: "Produits", value: stats?.productCount ?? "—", icon: "📦" },
          { label: "Commandes", value: stats?.orderCount ?? "—", icon: "🛒" },
          { label: "Revenus", value: stats?.revenue ? `${Number(stats.revenue).toFixed(0)} TND` : "—", icon: "💰" },
          { label: "En attente", value: stats?.pendingOrders ?? "—", icon: "⏳" },
        ].map(stat => (
          <View key={stat.label} style={s.statCard}>
            <Text style={s.statIcon}>{stat.icon}</Text>
            <Text style={s.statVal}>{stat.value}</Text>
            <Text style={s.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick actions */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Actions rapides</Text>
        <View style={s.actionsRow}>
          <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate("SellerProducts")}>
            <Text style={s.actionIcon}>📋</Text>
            <Text style={s.actionLabel}>Mes produits</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate("SellerAddProduct")}>
            <Text style={s.actionIcon}>➕</Text>
            <Text style={s.actionLabel}>Ajouter produit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate("SellerOrders")}>
            <Text style={s.actionIcon}>📬</Text>
            <Text style={s.actionLabel}>Commandes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent orders */}
      {orders.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Commandes récentes</Text>
          {orders.map(o => (
            <View key={o.id} style={s.orderRow}>
              <Text style={s.orderRef}>#{o.id.slice(0, 8).toUpperCase()}</Text>
              <Text style={s.orderTotal}>{Number(o.total).toFixed(2)} TND</Text>
              <Text style={s.orderStatus}>{o.status}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#9f1239", padding: 24, paddingTop: 32 },
  greeting: { fontSize: 22, fontWeight: "900", color: "#fff" },
  sub: { fontSize: 13, color: "#fecdd3", marginTop: 4 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", padding: 16, gap: 10 },
  statCard: { width: "47%", backgroundColor: "#fff", borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#f1f5f9" },
  statIcon: { fontSize: 28, marginBottom: 6 },
  statVal: { fontSize: 22, fontWeight: "900", color: "#1e293b" },
  statLabel: { fontSize: 12, color: "#64748b", fontWeight: "600", marginTop: 2 },
  section: { margin: 16, marginTop: 0, backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f1f5f9", marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#1e293b", marginBottom: 14 },
  actionsRow: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, backgroundColor: "#f8fafc", borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  actionIcon: { fontSize: 24, marginBottom: 6 },
  actionLabel: { fontSize: 11, fontWeight: "700", color: "#475569", textAlign: "center" },
  orderRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  orderRef: { fontSize: 13, fontWeight: "700", color: "#1e293b" },
  orderTotal: { fontSize: 13, fontWeight: "700", color: "#9f1239" },
  orderStatus: { fontSize: 11, color: "#64748b", fontWeight: "600" },
});
