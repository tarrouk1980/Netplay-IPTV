import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";
import api from "../../api";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING:   { bg: "#fffbeb", text: "#92400e" },
  APPROVED:  { bg: "#f0fdf4", text: "#166534" },
  REJECTED:  { bg: "#fef2f2", text: "#991b1b" },
  REFUNDED:  { bg: "#eff6ff", text: "#1e40af" },
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  APPROVED: "Approuvé",
  REJECTED: "Refusé",
  REFUNDED: "Remboursé",
};

const NEXT_STATUSES: Record<string, string[]> = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: ["REFUNDED"],
  REJECTED: [],
  REFUNDED: [],
};

export default function SellerReturnsScreen({ navigation }: any) {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get("/returns/seller")
      .then(r => setReturns(r.data?.data || []))
      .catch(() => setReturns([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = (id: string, status: string) => {
    Alert.alert("Confirmer", `Marquer comme "${STATUS_LABELS[status]}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Confirmer",
        onPress: async () => {
          try {
            await api.patch(`/returns/${id}/status`, { status });
            setReturns(prev => prev.map(r => r.id === id ? { ...r, status } : r));
          } catch {
            Alert.alert("Erreur", "Impossible de mettre à jour.");
          }
        }
      }
    ]);
  };

  if (loading) return <ActivityIndicator color="#9f1239" size="large" style={{ flex: 1, marginTop: 80 }} />;

  if (returns.length === 0) return (
    <View style={s.empty}>
      <Text style={s.emptyIcon}>↩️</Text>
      <Text style={s.emptyTitle}>Aucun retour</Text>
      <Text style={s.emptySub}>Les demandes de retour de vos clients apparaîtront ici</Text>
    </View>
  );

  const renderItem = ({ item: ret }: any) => {
    const colors = STATUS_COLORS[ret.status] || STATUS_COLORS.PENDING;
    const nexts = NEXT_STATUSES[ret.status] || [];
    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View>
            <Text style={s.orderId}>#{ret.order?.id?.slice(0, 8).toUpperCase() || "—"}</Text>
            <Text style={s.buyer}>{ret.buyer?.name || "Client"}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: colors.bg }]}>
            <Text style={[s.badgeText, { color: colors.text }]}>{STATUS_LABELS[ret.status] || ret.status}</Text>
          </View>
        </View>
        <Text style={s.reason}>"{ret.reason}"</Text>
        <Text style={s.date}>{new Date(ret.createdAt).toLocaleDateString("fr-TN")}</Text>
        {nexts.length > 0 && (
          <View style={s.actions}>
            {nexts.map(next => (
              <TouchableOpacity key={next} style={[s.actionBtn, next === "REJECTED" && s.rejectBtn]} onPress={() => updateStatus(ret.id, next)}>
                <Text style={[s.actionBtnText, next === "REJECTED" && { color: "#dc2626" }]}>
                  {STATUS_LABELS[next]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={returns}
      keyExtractor={r => r.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      onRefresh={load}
      refreshing={loading}
      ListHeaderComponent={<Text style={s.count}>{returns.length} demande(s) de retour</Text>}
    />
  );
}

const s = StyleSheet.create({
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#1e293b", marginBottom: 6 },
  emptySub: { fontSize: 13, color: "#64748b", textAlign: "center" },
  count: { fontSize: 13, color: "#64748b", fontWeight: "600", marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f1f5f9" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  orderId: { fontSize: 15, fontWeight: "900", color: "#1e293b" },
  buyer: { fontSize: 12, color: "#64748b", marginTop: 2 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  reason: { fontSize: 13, color: "#475569", fontStyle: "italic", lineHeight: 20, marginBottom: 6 },
  date: { fontSize: 11, color: "#94a3b8", marginBottom: 12 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1, backgroundColor: "#f0fdf4", borderRadius: 10, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: "#bbf7d0" },
  rejectBtn: { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  actionBtnText: { fontSize: 13, fontWeight: "800", color: "#16a34a" },
});
