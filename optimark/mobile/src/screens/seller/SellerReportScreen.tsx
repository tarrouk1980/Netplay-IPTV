import React, { useCallback, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../lib/api";

const ROSE = "#9f1239";

export default function SellerReportScreen() {
  const [earnings, setEarnings] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [stock, setStock] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(0); // index into monthly array

  useFocusEffect(useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get("/vendors/earnings"),
      api.get("/vendors/analytics"),
      api.get("/vendors/stock/alerts"),
    ]).then(([e, a, s]) => {
      setEarnings(e.data?.data);
      setAnalytics(a.data?.data);
      setStock(s.data?.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []));

  if (loading) return (
    <View style={s.center}><ActivityIndicator color={ROSE} size="large" /></View>
  );

  const months = earnings?.monthly || [];
  const monthData = months[selectedMonth] || null;

  return (
    <ScrollView contentContainerStyle={s.container}>
      {/* Plan info */}
      <View style={s.planCard}>
        <Text style={s.planLabel}>Plan {earnings?.subscriptionPlan || "FREE"}</Text>
        <Text style={s.planSub}>Commission : {earnings?.commissionRate}% par vente</Text>
      </View>

      {/* Month selector */}
      {months.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Sélectionner le mois</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {months.map((m: any, i: number) => (
              <TouchableOpacity key={m.month} onPress={() => setSelectedMonth(i)}
                style={[s.monthBtn, selectedMonth === i && s.monthBtnActive]}>
                <Text style={[s.monthBtnText, selectedMonth === i && s.monthBtnTextActive]}>{m.month}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Month KPIs */}
      {monthData && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>📅 {monthData.month}</Text>
          <View style={s.kpiRow}>
            <View style={s.kpi}>
              <Text style={s.kpiValue}>{monthData.gross} TND</Text>
              <Text style={s.kpiLabel}>CA brut</Text>
            </View>
            <View style={s.kpi}>
              <Text style={[s.kpiValue, { color: "#ef4444" }]}>-{monthData.commission} TND</Text>
              <Text style={s.kpiLabel}>Commission</Text>
            </View>
            <View style={s.kpi}>
              <Text style={[s.kpiValue, { color: "#22c55e" }]}>{monthData.net} TND</Text>
              <Text style={s.kpiLabel}>Net</Text>
            </View>
          </View>
        </View>
      )}

      {/* Totals */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>📊 Totaux cumulés</Text>
        <View style={s.kpiRow}>
          <View style={s.kpi}>
            <Text style={s.kpiValue}>{earnings?.totalGross ?? "—"}</Text>
            <Text style={s.kpiLabel}>CA total (TND)</Text>
          </View>
          <View style={s.kpi}>
            <Text style={s.kpiValue}>{earnings?.totalNet ?? "—"}</Text>
            <Text style={s.kpiLabel}>Net total (TND)</Text>
          </View>
        </View>
      </View>

      {/* Analytics */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>📈 Performance produits</Text>
        <View style={s.statsList}>
          {[
            { label: "Note moyenne", value: `${analytics?.avgRating ?? "—"}★` },
            { label: "Total avis", value: String(analytics?.totalReviews ?? "—") },
            { label: "Vues (30j)", value: String(analytics?.viewsLast30 ?? "—") },
            { label: "Vues totales", value: String(analytics?.totalViews ?? "—") },
          ].map((st, i) => (
            <View key={i} style={s.statRow}>
              <Text style={s.statLabel}>{st.label}</Text>
              <Text style={s.statValue}>{st.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stock alerts */}
      <View style={[s.section, s.alertSection]}>
        <Text style={s.sectionTitle}>⚠️ Alertes de stock</Text>
        <View style={s.statsList}>
          <View style={s.statRow}>
            <Text style={s.statLabel}>Ruptures de stock</Text>
            <Text style={[s.statValue, { color: stock?.outOfStock?.length > 0 ? "#ef4444" : "#22c55e" }]}>
              {stock?.outOfStock?.length ?? 0}
            </Text>
          </View>
          <View style={s.statRow}>
            <Text style={s.statLabel}>Stock faible</Text>
            <Text style={[s.statValue, { color: stock?.lowStock?.length > 0 ? "#f59e0b" : "#22c55e" }]}>
              {stock?.lowStock?.length ?? 0}
            </Text>
          </View>
        </View>
      </View>

      {/* Top products */}
      {analytics?.topProducts?.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>🏆 Top produits</Text>
          {analytics.topProducts.map((p: any, i: number) => (
            <View key={p.id} style={s.topRow}>
              <Text style={s.topRank}>#{i + 1}</Text>
              <Text style={s.topTitle} numberOfLines={1}>{p.title}</Text>
              <Text style={s.topRevenue}>{p.revenue} TND</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { padding: 14, gap: 12 },
  planCard: {
    backgroundColor: ROSE, borderRadius: 14, padding: 14,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  planLabel: { color: "#fff", fontWeight: "900", fontSize: 15 },
  planSub: { color: "#fda4af", fontSize: 12 },
  section: {
    backgroundColor: "#fff", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "#f1f5f9",
    shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  alertSection: { borderColor: "#fde68a" },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: "#64748b", marginBottom: 10 },
  monthBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: "#f1f5f9", borderWidth: 1.5, borderColor: "#e2e8f0",
  },
  monthBtnActive: { backgroundColor: ROSE, borderColor: ROSE },
  monthBtnText: { fontSize: 12, fontWeight: "700", color: "#64748b" },
  monthBtnTextActive: { color: "#fff" },
  kpiRow: { flexDirection: "row", gap: 8 },
  kpi: {
    flex: 1, backgroundColor: "#f8fafc", borderRadius: 10, padding: 10, alignItems: "center",
  },
  kpiValue: { fontSize: 15, fontWeight: "900", color: ROSE },
  kpiLabel: { fontSize: 10, color: "#64748b", fontWeight: "600", marginTop: 2 },
  statsList: { gap: 8 },
  statRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  statLabel: { fontSize: 13, color: "#64748b" },
  statValue: { fontSize: 13, fontWeight: "800", color: "#1e293b" },
  topRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 5 },
  topRank: { fontSize: 11, fontWeight: "800", color: "#94a3b8", width: 22 },
  topTitle: { flex: 1, fontSize: 13, fontWeight: "600", color: "#1e293b" },
  topRevenue: { fontSize: 13, fontWeight: "900", color: ROSE },
});
