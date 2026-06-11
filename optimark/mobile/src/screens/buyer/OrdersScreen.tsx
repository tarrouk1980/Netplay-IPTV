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

export default function OrdersScreen({ navigation }: any) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get("/orders/me").then(r => setOrders(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false));
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
    <FlatList
      style={s.container}
      data={orders}
      keyExtractor={o => o.id}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      ListEmptyComponent={
        <View style={s.empty}>
          <Text style={{ fontSize: 40 }}>📦</Text>
          <Text style={s.emptyText}>Aucune commande pour l'instant</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity style={s.card} onPress={() => navigation.navigate("OrderDetail", { id: item.id })}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={s.orderId}>#{item.id.slice(0, 8).toUpperCase()}</Text>
            <View style={[s.badge, { backgroundColor: STATUS_COLORS[item.status] + "20" }]}>
              <Text style={[s.badgeText, { color: STATUS_COLORS[item.status] }]}>{STATUS_LABELS[item.status] || item.status}</Text>
            </View>
          </View>
          <Text style={s.date}>{new Date(item.createdAt).toLocaleDateString("fr-TN")}</Text>
          <Text style={s.total}>{Number(item.total).toFixed(2)} TND — {item.items?.length || 0} article(s)</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 14, color: "#64748b", fontWeight: "600", textAlign: "center" },
  btn: { backgroundColor: "#9f1239", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: "#fff", fontWeight: "700" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f1f5f9" },
  orderId: { fontSize: 14, fontWeight: "800", color: "#1e293b" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  date: { fontSize: 12, color: "#94a3b8", marginTop: 6 },
  total: { fontSize: 13, color: "#475569", marginTop: 4, fontWeight: "600" },
});
