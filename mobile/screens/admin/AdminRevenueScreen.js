import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  bg: "#0A0A0F",
  surface: "#1C1C28",
  primary: "#F5A623",
  text: "#FFFFFF",
  muted: "#8E8E9A",
  border: "#2C2C3A",
};

const PERIODS = ["Aujourd'hui", "Semaine", "Mois", "Année"];

const MOCK_DATA = {
  "Aujourd'hui": {
    total: 3847.5,
    growth: 12.4,
    services: [
      { icon: "🚕", name: "Taxi", amount: 1620.0, percent: 42 },
      { icon: "🛵", name: "Livraison", amount: 980.5, percent: 25 },
      { icon: "🛻", name: "SOS", amount: 847.0, percent: 22 },
      { icon: "🛒", name: "Épicerie", amount: 400.0, percent: 11 },
    ],
    transactions: { count: 214, average: 17.98, max: 320.0 },
    payouts: [
      { name: "Ahmed K.", service: "🚕 Taxi", amount: 540.0 },
      { name: "Sofiane M.", service: "🛵 Livraison", amount: 210.5 },
      { name: "Bilel R.", service: "🛻 SOS", amount: 380.0 },
      { name: "Marché Centrale", service: "🛒 Épicerie", amount: 155.0 },
    ],
    commissions: [
      { service: "🚕 Taxi", rate: 15 },
      { service: "🛵 Livraison", rate: 20 },
      { service: "🛻 SOS", rate: 10 },
      { service: "🛒 Épicerie", rate: 12 },
    ],
  },
  Semaine: {
    total: 24310.0,
    growth: 8.7,
    services: [
      { icon: "🚕", name: "Taxi", amount: 9800.0, percent: 40 },
      { icon: "🛵", name: "Livraison", amount: 6500.0, percent: 27 },
      { icon: "🛻", name: "SOS", amount: 5200.0, percent: 21 },
      { icon: "🛒", name: "Épicerie", amount: 2810.0, percent: 12 },
    ],
    transactions: { count: 1342, average: 18.11, max: 850.0 },
    payouts: [
      { name: "Ahmed K.", service: "🚕 Taxi", amount: 3200.0 },
      { name: "Sofiane M.", service: "🛵 Livraison", amount: 1450.0 },
      { name: "Bilel R.", service: "🛻 SOS", amount: 2100.0 },
      { name: "Marché Centrale", service: "🛒 Épicerie", amount: 980.0 },
    ],
    commissions: [
      { service: "🚕 Taxi", rate: 15 },
      { service: "🛵 Livraison", rate: 20 },
      { service: "🛻 SOS", rate: 10 },
      { service: "🛒 Épicerie", rate: 12 },
    ],
  },
  Mois: {
    total: 98750.0,
    growth: 15.2,
    services: [
      { icon: "🚕", name: "Taxi", amount: 39500.0, percent: 40 },
      { icon: "🛵", name: "Livraison", amount: 27000.0, percent: 27 },
      { icon: "🛻", name: "SOS", amount: 21250.0, percent: 22 },
      { icon: "🛒", name: "Épicerie", amount: 11000.0, percent: 11 },
    ],
    transactions: { count: 5480, average: 18.02, max: 1200.0 },
    payouts: [
      { name: "Ahmed K.", service: "🚕 Taxi", amount: 12500.0 },
      { name: "Sofiane M.", service: "🛵 Livraison", amount: 6800.0 },
      { name: "Bilel R.", service: "🛻 SOS", amount: 8400.0 },
      { name: "Marché Centrale", service: "🛒 Épicerie", amount: 3900.0 },
    ],
    commissions: [
      { service: "🚕 Taxi", rate: 15 },
      { service: "🛵 Livraison", rate: 20 },
      { service: "🛻 SOS", rate: 10 },
      { service: "🛒 Épicerie", rate: 12 },
    ],
  },
  Année: {
    total: 1124600.0,
    growth: 22.8,
    services: [
      { icon: "🚕", name: "Taxi", amount: 449840.0, percent: 40 },
      { icon: "🛵", name: "Livraison", amount: 303642.0, percent: 27 },
      { icon: "🛻", name: "SOS", amount: 247412.0, percent: 22 },
      { icon: "🛒", name: "Épicerie", amount: 123706.0, percent: 11 },
    ],
    transactions: { count: 62400, average: 18.03, max: 4500.0 },
    payouts: [
      { name: "Ahmed K.", service: "🚕 Taxi", amount: 45200.0 },
      { name: "Sofiane M.", service: "🛵 Livraison", amount: 28700.0 },
      { name: "Bilel R.", service: "🛻 SOS", amount: 37100.0 },
      { name: "Marché Centrale", service: "🛒 Épicerie", amount: 14900.0 },
    ],
    commissions: [
      { service: "🚕 Taxi", rate: 15 },
      { service: "🛵 Livraison", rate: 20 },
      { service: "🛻 SOS", rate: 10 },
      { service: "🛒 Épicerie", rate: 12 },
    ],
  },
};

const SERVICE_BAR_COLORS = ["#F5A623", "#4CAF50", "#2196F3", "#E91E63"];

export default function AdminRevenueScreen({ navigation }) {
  const [activePeriod, setActivePeriod] = useState("Aujourd'hui");
  const data = MOCK_DATA[activePeriod];

  const formatAmount = (amount) =>
    amount >= 1000
      ? `${(amount / 1000).toFixed(1)}k TND`
      : `${amount.toFixed(2)} TND`;

  const handlePay = (name) => {
    Alert.alert(
      "Confirmer le paiement",
      `Payer ${name} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Confirmer", onPress: () => Alert.alert("Succès", "Paiement effectué !") },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Revenus & Finances</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Period Tabs */}
      <View style={styles.tabsRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.tab, activePeriod === p && styles.tabActive]}
            onPress={() => setActivePeriod(p)}
          >
            <Text style={[styles.tabText, activePeriod === p && styles.tabTextActive]}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Total Revenue Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Revenus totaux</Text>
          <Text style={styles.totalAmount}>{formatAmount(data.total)}</Text>
          <View style={styles.growthRow}>
            <Text style={[styles.growthText, { color: data.growth >= 0 ? "#4CAF50" : "#F44336" }]}>
              {data.growth >= 0 ? "↑" : "↓"} {Math.abs(data.growth)}%
            </Text>
            <Text style={styles.growthLabel}> vs période précédente</Text>
          </View>
        </View>

        {/* Revenue Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Répartition par service</Text>
          {data.services.map((s, i) => (
            <View key={s.name} style={styles.serviceRow}>
              <View style={styles.serviceLeft}>
                <Text style={styles.serviceIcon}>{s.icon}</Text>
                <Text style={styles.serviceName}>{s.name}</Text>
              </View>
              <View style={styles.serviceBarContainer}>
                <View
                  style={[
                    styles.serviceBar,
                    { width: `${s.percent}%`, backgroundColor: SERVICE_BAR_COLORS[i] },
                  ]}
                />
              </View>
              <View style={styles.serviceRight}>
                <Text style={styles.serviceAmount}>{formatAmount(s.amount)}</Text>
                <Text style={styles.servicePercent}>{s.percent}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Transaction Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques transactions</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{data.transactions.count.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{data.transactions.average.toFixed(2)} TND</Text>
              <Text style={styles.statLabel}>Montant moyen</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatAmount(data.transactions.max)}</Text>
              <Text style={styles.statLabel}>Valeur max</Text>
            </View>
          </View>
        </View>

        {/* Pending Payouts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paiements en attente</Text>
          {data.payouts.map((p, i) => (
            <View key={i} style={styles.payoutRow}>
              <View style={styles.payoutAvatar}>
                <Text style={styles.payoutInitial}>{p.name.charAt(0)}</Text>
              </View>
              <View style={styles.payoutInfo}>
                <Text style={styles.payoutName}>{p.name}</Text>
                <Text style={styles.payoutService}>{p.service}</Text>
              </View>
              <View style={styles.payoutRight}>
                <Text style={styles.payoutAmount}>{formatAmount(p.amount)}</Text>
                <TouchableOpacity style={styles.payBtn} onPress={() => handlePay(p.name)}>
                  <Text style={styles.payBtnText}>Payer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Commission Rates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Taux de commission</Text>
          <View style={styles.commissionGrid}>
            {data.commissions.map((c, i) => (
              <View key={i} style={styles.commissionCard}>
                <Text style={styles.commissionIcon}>{c.service.split(" ")[0]}</Text>
                <Text style={styles.commissionName}>{c.service.split(" ").slice(1).join(" ")}</Text>
                <Text style={styles.commissionRate}>{c.rate}%</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, alignItems: "center" },
  backArrow: { color: COLORS.primary, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: "700" },
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.muted, fontSize: 12, fontWeight: "600" },
  tabTextActive: { color: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  totalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.primary + "40",
  },
  totalLabel: { color: COLORS.muted, fontSize: 14, marginBottom: 8 },
  totalAmount: { color: COLORS.primary, fontSize: 36, fontWeight: "800", marginBottom: 8 },
  growthRow: { flexDirection: "row", alignItems: "center" },
  growthText: { fontSize: 14, fontWeight: "700" },
  growthLabel: { color: COLORS.muted, fontSize: 13 },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceLeft: { flexDirection: "row", alignItems: "center", width: 90 },
  serviceIcon: { fontSize: 18, marginRight: 6 },
  serviceName: { color: COLORS.text, fontSize: 13 },
  serviceBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginHorizontal: 10,
  },
  serviceBar: { height: 8, borderRadius: 4 },
  serviceRight: { alignItems: "flex-end", width: 80 },
  serviceAmount: { color: COLORS.text, fontSize: 12, fontWeight: "600" },
  servicePercent: { color: COLORS.muted, fontSize: 11 },
  statsGrid: { flexDirection: "row", justifyContent: "space-between" },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: { color: COLORS.primary, fontSize: 15, fontWeight: "700", marginBottom: 4 },
  statLabel: { color: COLORS.muted, fontSize: 11, textAlign: "center" },
  payoutRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  payoutAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary + "30",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  payoutInitial: { color: COLORS.primary, fontSize: 16, fontWeight: "700" },
  payoutInfo: { flex: 1 },
  payoutName: { color: COLORS.text, fontSize: 14, fontWeight: "600" },
  payoutService: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  payoutRight: { alignItems: "flex-end" },
  payoutAmount: { color: COLORS.text, fontSize: 13, fontWeight: "700", marginBottom: 4 },
  payBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  payBtnText: { color: COLORS.bg, fontSize: 12, fontWeight: "700" },
  commissionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  commissionCard: {
    width: "47%",
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  commissionIcon: { fontSize: 22, marginBottom: 4 },
  commissionName: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  commissionRate: { color: COLORS.primary, fontSize: 20, fontWeight: "800" },
});
