import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import api from "../../api";

type Period = "7d" | "30d" | "3m";

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string | number; sub?: string }) {
  return (
    <View style={s.statCard}>
      <Text style={s.statIcon}>{icon}</Text>
      <Text style={s.statVal}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
      {sub && <Text style={s.statSub}>{sub}</Text>}
    </View>
  );
}

function MiniChart({ data }: { data: { date: string; value: number }[] }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 280, H = 60;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (d.value / max) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <View style={{ marginTop: 12 }}>
      <View style={{ height: 60 }}>
        <svg style={{ width: "100%", height: 60 } as any}>
          <polyline points={pts} fill="none" stroke="#9f1239" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </View>
    </View>
  );
}

export default function SellerAnalyticsScreen() {
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async (p: Period) => {
    setLoading(true);
    const res = await api.get(`/analytics/vendor?period=${p}`).catch(() => null);
    setData(res?.data?.data || null);
    setLoading(false);
  };

  useEffect(() => { load(period); }, [period]);

  const periods: { key: Period; label: string }[] = [
    { key: "7d", label: "7 jours" },
    { key: "30d", label: "30 jours" },
    { key: "3m", label: "3 mois" },
  ];

  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>📊 Analytiques</Text>
      </View>

      {/* Period selector */}
      <View style={s.periodRow}>
        {periods.map(p => (
          <TouchableOpacity key={p.key} style={[s.periodBtn, period === p.key && s.periodBtnActive]}
            onPress={() => setPeriod(p.key)}>
            <Text style={[s.periodLabel, period === p.key && s.periodLabelActive]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#9f1239" style={{ marginTop: 40 }} />
      ) : !data ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>📊</Text>
          <Text style={{ color: "#64748b", fontWeight: "600" }}>Aucune donnée disponible</Text>
          <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>Créez des produits et ventes pour voir vos stats.</Text>
        </View>
      ) : (
        <>
          {/* KPIs */}
          <View style={s.statsGrid}>
            <StatCard icon="💰" label="Revenus" value={`${Number(data.totalRevenue || 0).toFixed(0)} TND`} />
            <StatCard icon="🛒" label="Commandes" value={data.totalOrders || 0} />
            <StatCard icon="📦" label="Produits vendus" value={data.totalItemsSold || 0} />
            <StatCard icon="⭐" label="Note moyenne" value={`${Number(data.avgRating || 0).toFixed(1)}/5`} />
            <StatCard icon="👁" label="Vues produits" value={data.totalViews || 0} />
            <StatCard icon="📈" label="Conversion" value={`${data.totalViews > 0 ? ((data.totalOrders / data.totalViews) * 100).toFixed(1) : 0}%`} />
          </View>

          {/* Top products */}
          {data.topProducts?.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>🏆 Top produits</Text>
              {data.topProducts.slice(0, 5).map((p: any, i: number) => (
                <View key={p.id || i} style={s.topRow}>
                  <View style={s.rankBadge}>
                    <Text style={s.rankText}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.topName} numberOfLines={1}>{p.title || p.name}</Text>
                    <Text style={s.topSub}>{p.sales || p.ordersCount || 0} ventes · {Number(p.revenue || 0).toFixed(0)} TND</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Revenue by status */}
          {data.ordersByStatus && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>📦 Commandes par statut</Text>
              {Object.entries(data.ordersByStatus).map(([status, count]: any) => (
                <View key={status} style={s.statusRow}>
                  <Text style={s.statusLabel}>{status}</Text>
                  <Text style={s.statusCount}>{count}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#9f1239", paddingHorizontal: 20, paddingVertical: 18, paddingTop: 22 },
  title: { color: "#fff", fontSize: 20, fontWeight: "900" },
  periodRow: { flexDirection: "row", gap: 8, padding: 16 },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5, borderColor: "#e2e8f0", alignItems: "center", backgroundColor: "#fff" },
  periodBtnActive: { backgroundColor: "#9f1239", borderColor: "#9f1239" },
  periodLabel: { fontSize: 13, fontWeight: "700", color: "#64748b" },
  periodLabelActive: { color: "#fff" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 10, marginBottom: 8 },
  statCard: { width: "30%", flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#f1f5f9", minWidth: "30%" },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statVal: { fontSize: 18, fontWeight: "900", color: "#1e293b" },
  statLabel: { fontSize: 10, color: "#64748b", fontWeight: "600", marginTop: 2, textAlign: "center" },
  statSub: { fontSize: 10, color: "#94a3b8", marginTop: 2 },
  empty: { alignItems: "center", paddingTop: 60 },
  section: { margin: 16, marginTop: 4, backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f1f5f9", marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#1e293b", marginBottom: 12 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  rankBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#9f1239", alignItems: "center", justifyContent: "center" },
  rankText: { color: "#fff", fontSize: 12, fontWeight: "900" },
  topName: { fontSize: 13, fontWeight: "700", color: "#1e293b" },
  topSub: { fontSize: 11, color: "#94a3b8", marginTop: 1 },
  statusRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  statusLabel: { fontSize: 13, color: "#475569", fontWeight: "600" },
  statusCount: { fontSize: 13, fontWeight: "800", color: "#1e293b" },
});
