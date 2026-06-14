import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet,
  Alert, ActivityIndicator, Modal, ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../api";

const ROSE = "#9f1239";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "En attente",  color: "#d97706", bg: "#fef3c7" },
  APPROVED:  { label: "Approuvée",   color: "#16a34a", bg: "#dcfce7" },
  REJECTED:  { label: "Refusée",     color: "#dc2626", bg: "#fee2e2" },
  COMPLETED: { label: "Traitée",     color: "#2563eb", bg: "#dbeafe" },
};

export default function MyReturnsScreen({ navigation }: any) {
  const [returns, setReturns] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get("/returns/my"),
      api.get("/orders/my").catch(() => null),
    ]).then(([r, o]) => {
      setReturns(r.data?.data || []);
      const delivered = (o?.data?.data || []).filter((x: any) => x.status === "DELIVERED");
      setOrders(delivered);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []));

  const submit = async () => {
    if (!selectedOrderId || !reason.trim()) {
      Alert.alert("Champs requis", "Sélectionnez une commande et décrivez la raison.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/returns", { orderId: selectedOrderId, reason });
      setReturns(prev => [res.data?.data, ...prev]);
      setShowModal(false);
      setSelectedOrderId("");
      setReason("");
      Alert.alert("✓ Demande envoyée", "Votre demande de retour a été soumise au vendeur.");
    } catch (e: any) {
      Alert.alert("Erreur", e.response?.data?.message || "Impossible de soumettre la demande.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderReturn = ({ item }: any) => {
    const st = STATUS[item.status] || { label: item.status, color: "#64748b", bg: "#f8fafc" };
    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View>
            <Text style={s.returnId}>Demande #{item.id.slice(-8).toUpperCase()}</Text>
            <Text style={s.returnDate}>{new Date(item.createdAt).toLocaleDateString("fr-FR")}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: st.bg }]}>
            <Text style={[s.statusText, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>

        {item.orderId && (
          <TouchableOpacity onPress={() => navigation.navigate("OrderDetail", { id: item.orderId })}>
            <Text style={s.orderLink}>→ Commande #{item.orderId.slice(-8).toUpperCase()}</Text>
          </TouchableOpacity>
        )}

        <View style={s.reasonBox}>
          <Text style={s.reasonLabel}>Raison</Text>
          <Text style={s.reasonText}>{item.reason}</Text>
        </View>

        {item.sellerNote && (
          <View style={s.sellerNoteBox}>
            <Text style={s.sellerNoteLabel}>Réponse du vendeur</Text>
            <Text style={s.sellerNoteText}>{item.sellerNote}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={s.container}>
      {/* New request button */}
      <TouchableOpacity style={s.newBtn} onPress={() => setShowModal(true)}>
        <Text style={s.newBtnText}>+ Nouvelle demande de retour</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color={ROSE} style={{ marginTop: 40 }} />
      ) : returns.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 48 }}>↩️</Text>
          <Text style={s.emptyTitle}>Aucune demande de retour</Text>
          <Text style={s.emptySub}>Vos demandes de retour apparaîtront ici.</Text>
        </View>
      ) : (
        <FlatList
          data={returns}
          keyExtractor={i => i.id}
          renderItem={renderReturn}
          contentContainerStyle={{ padding: 12, gap: 12 }}
        />
      )}

      {/* New return modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={s.modal} keyboardShouldPersistTaps="handled">
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Demande de retour</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={{ fontSize: 24, color: "#94a3b8" }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={s.modalBody}>
            <Text style={s.fieldLabel}>Commande concernée</Text>
            {orders.length === 0 ? (
              <Text style={s.noOrderText}>Aucune commande livrée éligible au retour.</Text>
            ) : (
              <View style={s.orderPicker}>
                {orders.map(o => (
                  <TouchableOpacity
                    key={o.id}
                    style={[s.orderOption, selectedOrderId === o.id && s.orderOptionActive]}
                    onPress={() => setSelectedOrderId(o.id)}
                  >
                    <Text style={[s.orderOptionText, selectedOrderId === o.id && { color: ROSE }]}>
                      #{o.id.slice(-8).toUpperCase()} — {Number(o.total).toFixed(2)} TND
                    </Text>
                    <Text style={s.orderOptionDate}>{new Date(o.createdAt).toLocaleDateString("fr-FR")}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={[s.fieldLabel, { marginTop: 16 }]}>Raison du retour</Text>
            <TextInput
              style={s.textarea}
              value={reason}
              onChangeText={setReason}
              placeholder="Décrivez le problème (article défectueux, erreur, etc.)..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[s.submitBtn, (submitting || !selectedOrderId || !reason.trim()) && { opacity: 0.5 }]}
              onPress={submit}
              disabled={submitting || !selectedOrderId || !reason.trim()}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.submitText}>Soumettre la demande</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  newBtn: { margin: 12, backgroundColor: ROSE, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  newBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 32 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
  emptySub: { fontSize: 13, color: "#64748b", textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f1f5f9" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  returnId: { fontSize: 14, fontWeight: "800", color: "#1e293b" },
  returnDate: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "800" },
  orderLink: { fontSize: 12, color: ROSE, fontWeight: "700", marginBottom: 10 },
  reasonBox: { backgroundColor: "#f8fafc", borderRadius: 10, padding: 12, marginBottom: 8 },
  reasonLabel: { fontSize: 11, fontWeight: "800", color: "#64748b", marginBottom: 4 },
  reasonText: { fontSize: 13, color: "#1e293b" },
  sellerNoteBox: { backgroundColor: "#eff6ff", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#bfdbfe" },
  sellerNoteLabel: { fontSize: 11, fontWeight: "800", color: "#2563eb", marginBottom: 4 },
  sellerNoteText: { fontSize: 13, color: "#1e40af" },
  modal: { flex: 1, backgroundColor: "#fff" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: 32, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#1e293b" },
  modalBody: { padding: 20 },
  fieldLabel: { fontSize: 13, fontWeight: "800", color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  noOrderText: { fontSize: 13, color: "#94a3b8" },
  orderPicker: { gap: 8 },
  orderOption: { backgroundColor: "#f8fafc", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  orderOptionActive: { borderColor: ROSE, backgroundColor: "#fff1f2" },
  orderOptionText: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  orderOptionDate: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  textarea: { backgroundColor: "#f8fafc", borderRadius: 12, padding: 14, fontSize: 14, color: "#1e293b", minHeight: 120, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 16 },
  submitBtn: { backgroundColor: ROSE, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  submitText: { color: "#fff", fontWeight: "900", fontSize: 15 },
});
