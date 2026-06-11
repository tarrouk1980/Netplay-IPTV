import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import api from "../../api";

const STEPS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];
const STEP_LABELS: Record<string, string> = { PENDING: "Reçue", CONFIRMED: "Confirmée", SHIPPED: "Expédiée", DELIVERED: "Livrée" };

export default function OrderDetailScreen({ route }: any) {
  const { id } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data?.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator color="#9f1239" size="large" style={{ flex: 1, marginTop: 80 }} />;
  if (!order) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><Text>Commande introuvable</Text></View>;

  const currentStep = STEPS.indexOf(order.status);

  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <Text style={s.orderId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
        <Text style={s.date}>{new Date(order.createdAt).toLocaleDateString("fr-TN")}</Text>
      </View>

      {/* Progress tracker */}
      {order.status !== "CANCELLED" && (
        <View style={s.trackerCard}>
          {STEPS.map((step, i) => (
            <View key={step} style={{ flexDirection: "row", alignItems: "center", marginBottom: i < STEPS.length - 1 ? 0 : 0 }}>
              <View style={{ alignItems: "center", width: 32 }}>
                <View style={[s.dot, i <= currentStep ? s.dotActive : s.dotInactive]}>
                  {i <= currentStep && <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>✓</Text>}
                </View>
                {i < STEPS.length - 1 && <View style={[s.line, i < currentStep ? s.lineActive : s.lineInactive]} />}
              </View>
              <Text style={[s.stepLabel, i <= currentStep ? s.stepLabelActive : {}]}>{STEP_LABELS[step]}</Text>
            </View>
          ))}
        </View>
      )}
      {order.status === "CANCELLED" && (
        <View style={[s.trackerCard, { backgroundColor: "#fef2f2" }]}>
          <Text style={{ color: "#dc2626", fontWeight: "700", textAlign: "center" }}>❌ Commande annulée</Text>
        </View>
      )}

      {/* Items */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Articles ({order.items?.length})</Text>
        {(order.items || []).map((item: any, i: number) => (
          <View key={i} style={s.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.itemTitle} numberOfLines={2}>{item.product?.title || "Produit"}</Text>
              <Text style={s.itemSeller}>{item.product?.seller?.name || ""}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.itemQty}>x{item.quantity}</Text>
              <Text style={s.itemPrice}>{Number(item.price * item.quantity).toFixed(2)} TND</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Delivery address */}
      {order.deliveryAddress && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Adresse de livraison</Text>
          <Text style={s.addrLine}>{order.deliveryAddress.street}</Text>
          <Text style={s.addrLine}>{order.deliveryAddress.city} {order.deliveryAddress.zip}</Text>
          <Text style={s.addrLine}>{order.deliveryAddress.phone}</Text>
        </View>
      )}

      {/* Total */}
      <View style={s.totalRow}>
        <Text style={s.totalLabel}>Total</Text>
        <Text style={s.totalVal}>{Number(order.total).toFixed(2)} TND</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { padding: 20, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  orderId: { fontSize: 20, fontWeight: "900", color: "#0f172a" },
  date: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
  trackerCard: { margin: 16, backgroundColor: "#fff", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#f1f5f9" },
  dot: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  dotActive: { backgroundColor: "#9f1239" },
  dotInactive: { backgroundColor: "#e2e8f0" },
  line: { width: 2, height: 32, marginVertical: 2 },
  lineActive: { backgroundColor: "#9f1239" },
  lineInactive: { backgroundColor: "#e2e8f0" },
  stepLabel: { marginLeft: 12, fontSize: 14, color: "#94a3b8", paddingBottom: 32 },
  stepLabelActive: { color: "#1e293b", fontWeight: "700" },
  section: { margin: 16, marginTop: 0, backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f1f5f9", marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#1e293b", marginBottom: 12 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  itemTitle: { fontSize: 13, fontWeight: "600", color: "#1e293b" },
  itemSeller: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  itemQty: { fontSize: 12, color: "#64748b" },
  itemPrice: { fontSize: 13, fontWeight: "800", color: "#9f1239" },
  addrLine: { fontSize: 14, color: "#475569", marginBottom: 4 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", margin: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#e2e8f0", marginBottom: 40 },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
  totalVal: { fontSize: 20, fontWeight: "900", color: "#9f1239" },
});
