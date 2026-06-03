import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  background: "#0A0A0F",
  surface: "#1C1C28",
  primary: "#F5A623",
  text: "#FFFFFF",
  muted: "#8E8E9A",
  border: "#2C2C3A",
  success: "#4CAF50",
  error: "#F44336",
};

const MOCK_DELIVERIES = [
  {
    id: "1",
    date: "2024-01-15",
    heure: "14:32",
    marchand: "Pizza Palace",
    clientAdresse: "12 Rue de la République, Tunis",
    distance: "3.2 km",
    duree: "18 min",
    montant: "8.500",
    bonus: "1.000",
    status: "COMPLETEE",
  },
  {
    id: "2",
    date: "2024-01-15",
    heure: "12:10",
    marchand: "Burger House",
    clientAdresse: "45 Avenue Habib Bourguiba, Tunis",
    distance: "5.7 km",
    duree: "27 min",
    montant: "10.000",
    bonus: null,
    status: "COMPLETEE",
  },
  {
    id: "3",
    date: "2024-01-14",
    heure: "19:45",
    marchand: "Sushi Bar",
    clientAdresse: "8 Rue Ibn Khaldoun, Ariana",
    distance: "4.1 km",
    duree: "22 min",
    montant: "9.000",
    bonus: "2.000",
    status: "COMPLETEE",
  },
  {
    id: "4",
    date: "2024-01-14",
    heure: "17:20",
    marchand: "Fast Food Central",
    clientAdresse: "3 Boulevard du 7 Novembre, La Marsa",
    distance: "6.3 km",
    duree: "31 min",
    montant: "0.000",
    bonus: null,
    status: "ANNULEE",
  },
  {
    id: "5",
    date: "2024-01-13",
    heure: "20:15",
    marchand: "Le Gourmet",
    clientAdresse: "22 Rue Alain Savary, Tunis",
    distance: "2.8 km",
    duree: "15 min",
    montant: "7.500",
    bonus: null,
    status: "COMPLETEE",
  },
  {
    id: "6",
    date: "2024-01-13",
    heure: "13:05",
    marchand: "Snack Express",
    clientAdresse: "67 Rue de Marseille, Tunis",
    distance: "1.9 km",
    duree: "11 min",
    montant: "6.000",
    bonus: "0.500",
    status: "COMPLETEE",
  },
  {
    id: "7",
    date: "2024-01-12",
    heure: "21:30",
    marchand: "Pizza Palace",
    clientAdresse: "100 Avenue de Carthage, Tunis",
    distance: "4.5 km",
    duree: "24 min",
    montant: "0.000",
    bonus: null,
    status: "ANNULEE",
  },
  {
    id: "8",
    date: "2024-01-12",
    heure: "11:45",
    marchand: "Café du Coin",
    clientAdresse: "15 Rue des Orangers, Manouba",
    distance: "7.2 km",
    duree: "35 min",
    montant: "11.000",
    bonus: "1.500",
    status: "COMPLETEE",
  },
  {
    id: "9",
    date: "2024-01-11",
    heure: "18:00",
    marchand: "Tacos World",
    clientAdresse: "29 Avenue de la Liberté, Tunis",
    distance: "3.6 km",
    duree: "20 min",
    montant: "8.000",
    bonus: null,
    status: "COMPLETEE",
  },
  {
    id: "10",
    date: "2024-01-10",
    heure: "15:55",
    marchand: "Sushi Bar",
    clientAdresse: "54 Rue Farhat Hached, Tunis",
    distance: "5.0 km",
    duree: "26 min",
    montant: "9.500",
    bonus: "1.000",
    status: "COMPLETEE",
  },
];

const FILTERS = ["Toutes", "Complétées", "Annulées"];

export default function LivreurHistoryScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState("Toutes");

  const filteredDeliveries = MOCK_DELIVERIES.filter((d) => {
    if (activeFilter === "Toutes") return true;
    if (activeFilter === "Complétées") return d.status === "COMPLETEE";
    if (activeFilter === "Annulées") return d.status === "ANNULEE";
    return true;
  });

  const totalLivraisons = MOCK_DELIVERIES.filter(
    (d) => d.status === "COMPLETEE"
  ).length;
  const totalGagne = MOCK_DELIVERIES.filter(
    (d) => d.status === "COMPLETEE"
  ).reduce((sum, d) => {
    const montant = parseFloat(d.montant) || 0;
    const bonus = d.bonus ? parseFloat(d.bonus) : 0;
    return sum + montant + bonus;
  }, 0);
  const noteMoyenne = 4.7;

  const getStatusStyle = (status) => {
    if (status === "COMPLETEE") return styles.badgeSuccess;
    if (status === "ANNULEE") return styles.badgeError;
    return styles.badgeMuted;
  };

  const getStatusLabel = (status) => {
    if (status === "COMPLETEE") return "Complétée";
    if (status === "ANNULEE") return "Annulée";
    return status;
  };

  const renderDelivery = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>
          {item.date} à {item.heure}
        </Text>
        <View style={[styles.badge, getStatusStyle(item.status)]}>
          <Text style={styles.badgeText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      <View style={styles.routeRow}>
        <View style={styles.routeInfo}>
          <Text style={styles.marchandLabel}>Marchand</Text>
          <Text style={styles.marchandName} numberOfLines={1}>
            {item.marchand}
          </Text>
        </View>
        <Text style={styles.routeArrow}>→</Text>
        <View style={styles.routeInfo}>
          <Text style={styles.clientLabel}>Client</Text>
          <Text style={styles.clientAdresse} numberOfLines={1}>
            {item.clientAdresse}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>📍 {item.distance}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>⏱ {item.duree}</Text>
        </View>
        <View style={styles.amountRow}>
          {item.status === "COMPLETEE" && (
            <>
              <Text style={styles.montant}>{item.montant} TND</Text>
              {item.bonus && (
                <View style={styles.bonusBadge}>
                  <Text style={styles.bonusText}>+{item.bonus} bonus</Text>
                </View>
              )}
            </>
          )}
          {item.status === "ANNULEE" && (
            <Text style={styles.annuleeText}>—</Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historique livraisons</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalLivraisons}</Text>
          <Text style={styles.summaryLabel}>Livraisons</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalGagne.toFixed(3)}</Text>
          <Text style={styles.summaryLabel}>TND gagné</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>⭐ {noteMoyenne}</Text>
          <Text style={styles.summaryLabel}>Note moy.</Text>
        </View>
      </View>

      <View style={styles.filtersRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterTab,
              activeFilter === f && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === f && styles.filterTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredDeliveries}
        keyExtractor={(item) => item.id}
        renderItem={renderDelivery}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune livraison trouvée.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow: {
    color: COLORS.text,
    fontSize: 22,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  headerRight: {
    width: 36,
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  summaryLabel: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
  },
  filtersRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "500",
  },
  filterTextActive: {
    color: COLORS.background,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardDate: {
    color: COLORS.muted,
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeSuccess: {
    backgroundColor: "rgba(76,175,80,0.15)",
  },
  badgeError: {
    backgroundColor: "rgba(244,67,54,0.15)",
  },
  badgeMuted: {
    backgroundColor: COLORS.border,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.text,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  routeInfo: {
    flex: 1,
  },
  marchandLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginBottom: 2,
  },
  marchandName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
  clientLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginBottom: 2,
  },
  clientAdresse: {
    color: COLORS.text,
    fontSize: 13,
  },
  routeArrow: {
    color: COLORS.muted,
    fontSize: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  metaDot: {
    color: COLORS.muted,
    fontSize: 12,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  montant: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  bonusBadge: {
    backgroundColor: "rgba(245,166,35,0.15)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bonusText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "600",
  },
  annuleeText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
});
