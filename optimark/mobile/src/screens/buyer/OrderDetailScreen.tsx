import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, TextInput, Modal } from "react-native";
import api from "../../api";

const STEPS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];
const STEP_LABELS: Record<string, string> = { PENDING: "Reçue", CONFIRMED: "Confirmée", SHIPPED: "Expédiée", DELIVERED: "Livrée" };

export default function OrderDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReturn, setShowReturn] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [sendingReturn, setSendingReturn] = useState(false);
  const [returnSent, setReturnSent] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data?.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const cancelOrder = async () => {
    Alert.alert("Annuler la commande", "Êtes-vous sûr ?", [
      { text: "Non" },
      { text: "Oui, annuler", style: "destructive", onPress: async () => {
        try {
          await api.patch(`/orders/${id}/cancel`);
          setOrder((prev: any) => ({ ...prev, status: "CANCELLED" }));
          Alert.alert("✅", "Commande annulée.");
        } catch (e: any) {
          Alert.alert("Erreur", e.response?.data?.message || "Impossible d'annuler.");
        }
      }},
    ]);
  };

  const sendReturn = async () => {
    if (!returnReason.trim()) { Alert.alert("Raison requise"); return; }
    setSendingReturn(true);
    try {
      await api.post("/returns", { orderId: id, reason: returnReason });
      setReturnSent(true);
      setShowReturn(false);
      Alert.alert("✓ Retour demandé", "Votre demande de retour a été envoyée.");
    } catch (e: any) {
      Alert.alert("Erreur", e.response?.data?.message || "Impossible d'envoyer la demande.");
    } finally {
      setSendingReturn(false);
    }
  };

  if (loading) return <ActivityIndicator color="#9f1239" size="large" style={{ flex: 1, marginTop: 80 }} />;
  if (!order) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><Text>Commande introuvable</Text></View>;

  const currentStep = STEPS.indexOf(order.status);
  const canReturn = order.status === "DELIVERED" && !returnSent && !order.hasReturn;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={s.header}>
        <Text style={s.orderId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
        <Text style={s.date}>{new Date(order.createdAt).toLocaleDateString("fr-TN")}</Text>
      </View>

      {/* Progress tracker */}
      {order.status !== "CANCELLED" ? (
        <View style={s.trackerCard}>
          <Text style={s.sectionTitle}>Suivi de commande</Text>
          {STEPS.map((step, i) => {
            const histEntry = order.statusHistory?.find((h: any) => h.status === step);
            return (
              <View key={step} style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <View style={{ alignItems: "center", width: 36 }}>
                  <View style={[s.dot, i <= currentStep ? s.dotActive : s.dotInactive]}>
                    {i <= currentStep && <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>✓</Text>}
                  </View>
                  {i < STEPS.length - 1 && <View style={[s.line, i < currentStep ? s.lineActive : s.lineInactive]} />}
                </View>
                <View style={{ paddingBottom: 32, paddingTop: 4, marginLeft: 12 }}>
                  <Text style={[{ fontSize: 14, color: "#94a3b8" }, i <= currentStep ? s.stepLabelActive : {}]}>{STEP_LABELS[step]}</Text>
                  {histEntry && (
                    <Text style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                      {new Date(histEntry.createdAt).toLocaleDateString("fr-TN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={[s.trackerCard, { backgroundColor: "#fef2f2" }]}>
          <Text style={{ color: "#dc2626", fontWeight: "800", textAlign: "center", fontSize: 15 }}>❌ Commande annulée</Text>
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
              <Text style={s.itemQty}>×{item.quantity}</Text>
              <Text style={s.itemPrice}>{Number(item.price * item.quantity).toFixed(2)} TND</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Review prompt for delivered orders */}
      {order.status === "DELIVERED" && order.items?.length > 0 && (
        <View style={s.reviewBanner}>
          <Text style={{ fontSize: 22 }}>⭐</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#92400e" }}>Partagez votre avis !</Text>
            <Text style={{ fontSize: 12, color: "#b45309", marginTop: 2 }}>Votre commande est livrée — laissez un avis sur vos produits.</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("ProductDetail", { id: order.items[0].product?.id })}>
            <Text style={{ color: "#9f1239", fontWeight: "800", fontSize: 12 }}>Évaluer →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Delivery address */}
      {order.deliveryAddress && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Adresse de livraison</Text>
          <Text style={s.addrLine}>{order.deliveryAddress.street}</Text>
          <Text style={s.addrLine}>{order.deliveryAddress.city} {order.deliveryAddress.zip}</Text>
          {order.deliveryAddress.phone && <Text style={s.addrLine}>📞 {order.deliveryAddress.phone}</Text>}
        </View>
      )}

      {/* Total */}
      <View style={s.totalRow}>
        <Text style={s.totalLabel}>Total</Text>
        <Text style={s.totalVal}>{Number(order.total).toFixed(2)} TND</Text>
      </View>

      {/* Actions */}
      <View style={{ marginHorizontal: 16, gap: 10 }}>
        {order.status === "PENDING" && (
          <TouchableOpacity style={{ backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", borderRadius: 14, paddingVertical: 14, alignItems: "center" }} onPress={cancelOrder}>
            <Text style={{ color: "#dc2626", fontWeight: "800", fontSize: 15 }}>❌ Annuler la commande</Text>
          </TouchableOpacity>
        )}
        {canReturn && (
          <TouchableOpacity style={s.returnBtn} onPress={() => setShowReturn(true)}>
            <Text style={s.returnBtnText}>↩️ Demander un retour</Text>
          </TouchableOpacity>
        )}
        {returnSent && (
          <View style={s.returnSent}>
            <Text style={s.returnSentText}>✓ Demande de retour envoyée</Text>
          </View>
        )}
      </View>

      {/* Return modal */}
      <Modal visible={showReturn} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Demande de retour</Text>
            <Text style={s.modalSub}>Expliquez la raison du retour</Text>
            <TextInput
              value={returnReason}
              onChangeText={setReturnReason}
              placeholder="Ex: Produit défectueux, taille incorrecte..."
              multiline
              numberOfLines={4}
              style={s.textarea}
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity style={[s.modalBtn, { backgroundColor: "#f1f5f9" }]} onPress={() => setShowReturn(false)}>
                <Text style={{ color: "#64748b", fontWeight: "700" }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn, { flex: 2, backgroundColor: "#9f1239" }]} onPress={sendReturn} disabled={sendingReturn}>
                <Text style={{ color: "#fff", fontWeight: "800" }}>{sendingReturn ? "Envoi..." : "Envoyer"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  stepLabel: { marginLeft: 12, fontSize: 14, color: "#94a3b8", paddingBottom: 32, paddingTop: 4 },
  stepLabelActive: { color: "#1e293b", fontWeight: "700" },
  section: { marginHorizontal: 16, marginBottom: 12, backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f1f5f9" },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#1e293b", marginBottom: 12 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  itemTitle: { fontSize: 13, fontWeight: "600", color: "#1e293b" },
  itemSeller: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  itemQty: { fontSize: 12, color: "#64748b" },
  itemPrice: { fontSize: 13, fontWeight: "800", color: "#9f1239" },
  addrLine: { fontSize: 14, color: "#475569", marginBottom: 4 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, borderTopColor: "#e2e8f0", marginBottom: 16 },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
  totalVal: { fontSize: 20, fontWeight: "900", color: "#9f1239" },
  reviewBanner: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fffbeb", borderWidth: 1, borderColor: "#fde68a", borderRadius: 14, padding: 14, marginHorizontal: 16, marginBottom: 10 },
  returnBtn: { backgroundColor: "#fff7ed", borderWidth: 1, borderColor: "#fed7aa", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  returnBtnText: { color: "#ea580c", fontWeight: "800", fontSize: 15 },
  returnSent: { backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0", borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  returnSentText: { color: "#16a34a", fontWeight: "700", fontSize: 14 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#1e293b", marginBottom: 4 },
  modalSub: { fontSize: 13, color: "#64748b", marginBottom: 16 },
  textarea: { backgroundColor: "#f8fafc", borderRadius: 14, padding: 14, fontSize: 14, color: "#1e293b", minHeight: 100, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 16, textAlignVertical: "top" },
  modalBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
});
