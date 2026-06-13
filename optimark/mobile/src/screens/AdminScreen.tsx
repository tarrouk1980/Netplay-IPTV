import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, RefreshControl } from "react-native";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";

type Tab = "stats" | "users" | "orders";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b", CONFIRMED: "#3b82f6", SHIPPED: "#7c3aed", DELIVERED: "#16a34a", CANCELLED: "#dc2626"
};
const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  BUYER: { bg: "#f1f5f9", text: "#475569" },
  SELLER: { bg: "#fff7ed", text: "#ea580c" },
  ADMIN: { bg: "#fef2f2", text: "#9f1239" },
};

export default function AdminScreen({ navigation }: any) {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    const res = await api.get("/admin/stats").catch(() => null);
    setStats(res?.data?.data || null);
  };
  const loadUsers = async () => {
    const res = await api.get("/admin/users?limit=30").catch(() => null);
    setUsers(res?.data?.data || []);
  };
  const loadOrders = async () => {
    const res = await api.get("/admin/orders?limit=30").catch(() => null);
    setOrders(res?.data?.data || []);
  };

  const load = async () => {
    setLoading(true);
    await loadStats();
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (tab === "users") loadUsers();
    else if (tab === "orders") loadOrders();
  }, [tab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    if (tab === "users") await loadUsers();
    else if (tab === "orders") await loadOrders();
    setRefreshing(false);
  };

  const updateRole = (userId: string, currentRole: string) => {
    const roles = ["BUYER", "SELLER", "ADMIN"];
    const next = roles.filter(r => r !== currentRole);
    Alert.alert("Changer le rôle", `Rôle actuel: ${currentRole}`, [
      { text: "Annuler", style: "cancel" },
      ...next.map(role => ({
        text: `→ ${role}`,
        onPress: async () => {
          await api.patch(`/admin/users/${userId}/role`, { role }).catch(() => {});
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
        }
      }))
    ]);
  };

  if (loading) return <ActivityIndicator color="#9f1239" size="large" style={{ flex: 1, marginTop: 80 }} />;

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9f1239" />}>
      <View style={s.header}>
        <Text style={s.heading}>🛡️ Admin Panel</Text>
        <Text style={s.sub}>Bonjour, {user?.name}</Text>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {(["stats", "users", "orders"] as Tab[]).map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === "stats" ? "📊 Stats" : t === "users" ? "👥 Utilisateurs" : "📦 Commandes"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats tab */}
      {tab === "stats" && stats && (
        <View style={s.content}>
          <View style={s.statsGrid}>
            {[
              { label: "Utilisateurs", value: stats.totalUsers, icon: "👥" },
              { label: "Vendeurs", value: stats.totalSellers, icon: "🏪" },
              { label: "Produits", value: stats.totalProducts, icon: "📦" },
              { label: "Commandes", value: stats.totalOrders, icon: "🛒" },
              { label: "Revenus", value: `${Number(stats.totalRevenue || 0).toFixed(0)} TND`, icon: "💰" },
              { label: "Non livrées", value: stats.pendingOrders, icon: "⏳" },
            ].map(stat => (
              <View key={stat.label} style={s.statCard}>
                <Text style={s.statIcon}>{stat.icon}</Text>
                <Text style={s.statVal}>{stat.value ?? "—"}</Text>
                <Text style={s.statLbl}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Users tab */}
      {tab === "users" && (
        <View style={s.content}>
          {users.length === 0
            ? <ActivityIndicator color="#9f1239" style={{ marginTop: 40 }} />
            : users.map(u => {
              const roleColors = ROLE_COLORS[u.role] || ROLE_COLORS.BUYER;
              return (
                <View key={u.id} style={s.userRow}>
                  <View style={s.userAvatar}>
                    <Text style={s.userAvatarText}>{u.name?.charAt(0)?.toUpperCase() || "?"}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.userName}>{u.name}</Text>
                    <Text style={s.userEmail}>{u.email}</Text>
                  </View>
                  <TouchableOpacity style={[s.roleBadge, { backgroundColor: roleColors.bg }]} onPress={() => updateRole(u.id, u.role)}>
                    <Text style={[s.roleText, { color: roleColors.text }]}>{u.role}</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          }
        </View>
      )}

      {/* Orders tab */}
      {tab === "orders" && (
        <View style={s.content}>
          {orders.length === 0
            ? <ActivityIndicator color="#9f1239" style={{ marginTop: 40 }} />
            : orders.map(o => (
              <View key={o.id} style={s.orderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.orderId}>#{o.id.slice(0, 8).toUpperCase()}</Text>
                  <Text style={s.orderBuyer}>{o.buyer?.name || "—"}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={s.orderTotal}>{Number(o.total).toFixed(2)} TND</Text>
                  <View style={[s.orderStatus, { backgroundColor: STATUS_COLORS[o.status] + "22" }]}>
                    <Text style={[s.orderStatusText, { color: STATUS_COLORS[o.status] }]}>{o.status}</Text>
                  </View>
                </View>
              </View>
            ))
          }
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#1e293b", padding: 24, paddingTop: 36 },
  heading: { fontSize: 22, fontWeight: "900", color: "#fff" },
  sub: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
  tabs: { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#9f1239" },
  tabText: { fontSize: 12, fontWeight: "600", color: "#94a3b8" },
  tabTextActive: { color: "#9f1239", fontWeight: "800" },
  content: { padding: 16 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: { width: "47%", backgroundColor: "#fff", borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#f1f5f9" },
  statIcon: { fontSize: 28, marginBottom: 6 },
  statVal: { fontSize: 22, fontWeight: "900", color: "#1e293b" },
  statLbl: { fontSize: 11, color: "#64748b", fontWeight: "600", marginTop: 2, textAlign: "center" },
  userRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: "#f1f5f9" },
  userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#9f1239", alignItems: "center", justifyContent: "center" },
  userAvatarText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  userName: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  userEmail: { fontSize: 11, color: "#64748b", marginTop: 2 },
  roleBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  roleText: { fontSize: 12, fontWeight: "800" },
  orderRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#f1f5f9" },
  orderId: { fontSize: 14, fontWeight: "900", color: "#1e293b" },
  orderBuyer: { fontSize: 12, color: "#64748b", marginTop: 2 },
  orderTotal: { fontSize: 14, fontWeight: "900", color: "#9f1239", marginBottom: 4 },
  orderStatus: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  orderStatusText: { fontSize: 11, fontWeight: "700" },
});
