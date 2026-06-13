import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../api";

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente", CONFIRMED: "Confirmée", SHIPPED: "Expédiée",
  DELIVERED: "Livrée", CANCELLED: "Annulée",
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b", CONFIRMED: "#3b82f6", SHIPPED: "#8b5cf6",
  DELIVERED: "#16a34a", CANCELLED: "#ef4444",
};

export default function SellerOrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/vendors/orders").then(r => setOrders(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const updateStatus = (id: string, currentStatus: string) => {
    const nextStatuses = STATUSES.filter(s => s !== currentStatus && s !== "CANCELLED");
    Alert.alert("Changer le statut", "Choisir le nouveau statut :", [
      ...nextStatuses.map(s => ({
        text: STATUS_LABELS[s],
        onPress: async () => {
          await api.patch(`/orders/${id}/status`, { status: s }).catch(() => {});
          load();
        }
      })),
      { text: "Annuler", style: "cancel" }
    ]);
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      data={orders}
      keyExtractor={o => o.id}
      refreshing={loading}
      onRefresh={load}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      ListEmptyComponent={
        !loading ? (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Text style={{ fontSize: 40 }}>📬</Text>
            <Text style={{ color: "#64748b", fontWeight: "600", marginTop: 12 }}>Aucune commande</Text>
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <View style={s.card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={s.ref}>#{item.id.slice(0, 8).toUpperCase()}</Text>
            <View style={[s.badge, { backgroundColor: STATUS_COLORS[item.status] + "20" }]}>
              <Text style={[s.badgeText, { color: STATUS_COLORS[item.status] }]}>{STATUS_LABELS[item.status]}</Text>
            </View>
          </View>
          <Text style={s.buyer}>Client : {item.buyer?.name || "—"}</Text>
          <Text style={s.date}>{new Date(item.createdAt).toLocaleDateString("fr-TN")}</Text>
          <Text style={s.total}>{Number(item.total).toFixed(2)} TND — {item.items?.length} article(s)</Text>

          {item.deliveryAddress && (
            <Text style={s.addr}>
              📍 {item.deliveryAddress.street}, {item.deliveryAddress.city}
            </Text>
          )}
          {item.note && (
            <View style={s.noteBanner}>
              <Text style={s.noteText}>📝 {item.note}</Text>
            </View>
          )}

          {item.status !== "DELIVERED" && item.status !== "CANCELLED" && (
            <TouchableOpacity style={s.updateBtn} onPress={() => updateStatus(item.id, item.status)}>
              <Text style={s.updateBtnText}>Changer le statut →</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f1f5f9" },
  ref: { fontSize: 15, fontWeight: "800", color: "#1e293b" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  buyer: { fontSize: 13, color: "#475569", marginBottom: 2 },
  date: { fontSize: 12, color: "#94a3b8" },
  total: { fontSize: 13, fontWeight: "700", color: "#9f1239", marginTop: 4 },
  addr: { fontSize: 12, color: "#64748b", marginTop: 4 },
  updateBtn: { marginTop: 12, backgroundColor: "#9f1239", borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  updateBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  noteBanner: { backgroundColor: "#fef9ec", borderWidth: 1, borderColor: "#fde68a", borderRadius: 8, padding: 8, marginTop: 6 },
  noteText: { fontSize: 12, color: "#92400e" },
});
