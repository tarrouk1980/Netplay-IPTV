import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import api from "../../api";
import { useAuth } from "../../contexts/AuthContext";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente", CONFIRMED: "Confirmée", SHIPPED: "Expédiée",
  DELIVERED: "Livrée", CANCELLED: "Annulée",
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b", CONFIRMED: "#3b82f6", SHIPPED: "#8b5cf6",
  DELIVERED: "#16a34a", CANCELLED: "#ef4444",
};
const RETURN_COLORS: Record<string, string> = {
  PENDING: "#f59e0b", APPROVED: "#16a34a", REFUNDED: "#8b5cf6",
  REJECTED: "#ef4444",
};

export default function OrdersScreen({ navigation }: any) {
  const { user } = useAuth();
  const [tab, setTab] = useState<"orders" | "returns">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([
      api.get("/orders/me").catch(() => ({ data: { data: [] } })),
      api.get("/returns/my").catch(() => ({ data: { data: [] } })),
    ]).then(([oRes, rRes]) => {
      setOrders(oRes.data?.data || []);
      setReturns(rRes.data?.data || []);
    }).finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <View style={s.empty}>
      <Text style={{ fontSize: 40 }}>🔒</Text>
      <Text style={s.emptyText}>Connectez-vous pour voir vos commandes</Text>
      <TouchableOpacity style={s.btn} onPress={() => navigation.navigate("Auth")}>
        <Text style={s.btnText}>Se connecter</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return <ActivityIndicator color="#9f1239" size="large" style={{ flex: 1, marginTop: 80 }} />;

  return (
    <View style={s.container}>
      {/* Tabs */}
      <View style={s.tabBar}>
        <TouchableOpacity style={[s.tabBtn, tab === "orders" && s.tabBtnActive]} onPress={() => setTab("orders")}>
          <Text style={[s.tabLabel, tab === "orders" && s.tabLabelActive]}>📦 Commandes ({orders.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tabBtn, tab === "returns" && s.tabBtnActive]} onPress={() => setTab("returns")}>
          <Text style={[s.tabLabel, tab === "returns" && s.tabLabelActive]}>↩️ Retours ({returns.length})</Text>
        </TouchableOpacity>
      </View>

      {tab === "orders" ? (
        <FlatList
          data={orders}
          keyExtractor={o => o.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          ListEmptyComponent={
            <View style={s.emptyInner}>
              <Text style={{ fontSize: 40 }}>📦</Text>
              <Text style={s.emptyText}>Aucune commande pour l'instant</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => navigation.navigate("OrderDetail", { id: item.id })}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={s.orderId}>#{item.id.slice(0, 8).toUpperCase()}</Text>
                <View style={[s.badge, { backgroundColor: (STATUS_COLORS[item.status] || "#94a3b8") + "20" }]}>
                  <Text style={[s.badgeText, { color: STATUS_COLORS[item.status] || "#64748b" }]}>{STATUS_LABELS[item.status] || item.status}</Text>
                </View>
              </View>
              <Text style={s.date}>{new Date(item.createdAt).toLocaleDateString("fr-TN")}</Text>
              <Text style={s.total}>{Number(item.total).toFixed(2)} TND — {item.items?.length || 0} article(s)</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={returns}
          keyExtractor={r => r.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          ListEmptyComponent={
            <View style={s.emptyInner}>
              <Text style={{ fontSize: 40 }}>↩️</Text>
              <Text style={s.emptyText}>Aucune demande de retour</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <Text style={s.orderId}>Retour #{item.id.slice(0, 8).toUpperCase()}</Text>
                <View style={[s.badge, { backgroundColor: (RETURN_COLORS[item.status] || "#94a3b8") + "20" }]}>
                  <Text style={[s.badgeText, { color: RETURN_COLORS[item.status] || "#64748b" }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={s.returnReason} numberOfLines={2}>{item.reason}</Text>
              <Text style={s.date}>{new Date(item.createdAt).toLocaleDateString("fr-TN")}</Text>
              {item.adminNote && (
                <Text style={s.adminNote}>Note : {item.adminNote}</Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  tabBar: { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  tabBtn: { flex: 1, paddingVertical: 14, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabBtnActive: { borderBottomColor: "#9f1239" },
  tabLabel: { fontSize: 13, fontWeight: "600", color: "#94a3b8" },
  tabLabelActive: { color: "#9f1239", fontWeight: "800" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyInner: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 14, color: "#64748b", fontWeight: "600", textAlign: "center" },
  btn: { backgroundColor: "#9f1239", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: "#fff", fontWeight: "700" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f1f5f9" },
  orderId: { fontSize: 14, fontWeight: "800", color: "#1e293b" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  date: { fontSize: 12, color: "#94a3b8", marginTop: 6 },
  total: { fontSize: 13, color: "#475569", marginTop: 4, fontWeight: "600" },
  returnReason: { fontSize: 13, color: "#475569" },
  adminNote: { fontSize: 12, color: "#3b82f6", marginTop: 6, fontStyle: "italic" },
});
