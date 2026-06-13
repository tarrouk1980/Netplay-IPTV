import React, { useCallback, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../lib/api";

const ROSE = "#9f1239";

export default function SellerCustomersScreen() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.get("/vendors/customers/top")
      .then(r => setCustomers(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  if (loading) return (
    <View style={s.center}><ActivityIndicator color={ROSE} size="large" /></View>
  );

  const totalSpend = customers.reduce((s, c) => s + c.spend, 0);
  const maxSpend = customers[0]?.spend || 1;
  const repeatBuyers = customers.filter(c => c.orders > 1).length;

  return (
    <FlatList
      data={customers}
      keyExtractor={c => c.id}
      contentContainerStyle={s.list}
      ListHeaderComponent={
        <View>
          {/* Summary */}
          <View style={s.summaryRow}>
            {[
              { label: "Clients", value: String(customers.length), icon: "👥" },
              { label: "Revenu", value: `${totalSpend.toFixed(0)} TND`, icon: "💰" },
              { label: "Fidèles", value: String(repeatBuyers), icon: "⭐" },
            ].map((item, i) => (
              <View key={i} style={s.summaryCard}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                <Text style={s.summaryValue}>{item.value}</Text>
                <Text style={s.summaryLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
          {customers.length === 0 && (
            <View style={s.empty}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>👥</Text>
              <Text style={s.emptyTitle}>Aucun client pour le moment</Text>
              <Text style={s.emptySub}>Vos clients apparaîtront ici une fois que vous aurez des commandes.</Text>
            </View>
          )}
          {customers.length > 0 && (
            <Text style={s.sectionTitle}>Top {customers.length} clients par dépense</Text>
          )}
        </View>
      }
      renderItem={({ item: c, index: i }) => (
        <View style={s.card}>
          <View style={s.rankBadge}>
            <Text style={s.rankText}>#{i + 1}</Text>
          </View>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{c.name?.charAt(0)?.toUpperCase() || "?"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={s.cardHeader}>
              <Text style={s.clientName} numberOfLines={1}>{c.name}</Text>
              {c.orders > 1 && (
                <View style={s.repeatBadge}>
                  <Text style={s.repeatText}>Fidèle</Text>
                </View>
              )}
            </View>
            <Text style={s.clientEmail} numberOfLines={1}>{c.email}</Text>
            <View style={s.barRow}>
              <View style={s.barTrack}>
                <View style={[s.barFill, { width: `${(c.spend / maxSpend) * 100}%` as any }]} />
              </View>
              <Text style={s.spendText}>{c.spend} TND</Text>
            </View>
            <Text style={s.ordersText}>{c.orders} commande(s) · {((c.spend / totalSpend) * 100).toFixed(1)}% du CA</Text>
          </View>
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 14, gap: 10 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  summaryCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 12,
    alignItems: "center", borderWidth: 1, borderColor: "#f1f5f9",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  summaryValue: { fontSize: 18, fontWeight: "900", color: ROSE, marginTop: 4 },
  summaryLabel: { fontSize: 10, color: "#64748b", fontWeight: "600" },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#64748b", marginBottom: 8 },
  empty: { alignItems: "center", padding: 32 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#334155", marginBottom: 6 },
  emptySub: { fontSize: 13, color: "#94a3b8", textAlign: "center" },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 12,
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1, borderColor: "#f1f5f9",
    shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  rankBadge: { width: 24, alignItems: "center" },
  rankText: { fontSize: 11, fontWeight: "800", color: "#94a3b8" },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#fff1f2", alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "800", color: ROSE },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  clientName: { flex: 1, fontSize: 13, fontWeight: "700", color: "#1e293b" },
  repeatBadge: { backgroundColor: "#f0fdf4", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  repeatText: { fontSize: 9, fontWeight: "800", color: "#166534" },
  clientEmail: { fontSize: 11, color: "#94a3b8", marginBottom: 6 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  barTrack: { flex: 1, height: 4, backgroundColor: "#f1f5f9", borderRadius: 2, overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: ROSE, borderRadius: 2 },
  spendText: { fontSize: 12, fontWeight: "800", color: ROSE, minWidth: 70, textAlign: "right" },
  ordersText: { fontSize: 10, color: "#94a3b8", marginTop: 4 },
});
