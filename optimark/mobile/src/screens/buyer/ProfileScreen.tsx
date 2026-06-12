import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api";

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, upgradeToSeller } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loyalty, setLoyalty] = useState<{ points: number; equivalentTND: string } | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  const loadLoyalty = () => {
    api.get("/loyalty/balance").then(r => setLoyalty(r.data?.data)).catch(() => {});
  };

  useEffect(() => {
    if (user) loadLoyalty();
  }, [user]);

  const redeemPoints = async () => {
    if (!loyalty || loyalty.points < 100) return;
    setRedeeming(true);
    try {
      const res = await api.post("/loyalty/redeem", { points: 100 });
      Alert.alert("✓ Points échangés", `100 points = ${res.data?.data?.discountTND} TND de réduction.`);
      loadLoyalty();
    } catch (e: any) {
      Alert.alert("Erreur", e.response?.data?.message || "Erreur lors de l'échange.");
    } finally {
      setRedeeming(false);
    }
  };

  const handleUpgrade = async () => {
    Alert.alert(
      "Devenir vendeur",
      "Voulez-vous upgrader votre compte pour vendre sur OPTIMARK ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Oui, je veux vendre",
          onPress: async () => {
            setLoading(true);
            try {
              await upgradeToSeller();
              Alert.alert("Félicitations !", "Votre compte vendeur est activé. Vous pouvez maintenant gérer vos produits.");
            } catch {
              Alert.alert("Erreur", "Impossible de mettre à niveau le compte.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <View style={s.empty}>
        <Text style={{ fontSize: 48 }}>👤</Text>
        <Text style={s.emptyText}>Connectez-vous pour accéder à votre profil</Text>
        <TouchableOpacity style={s.btn} onPress={() => navigation.navigate("Auth")}>
          <Text style={s.btnText}>Se connecter / S'inscrire</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isSeller = user.role === "SELLER" || user.role === "ADMIN";

  return (
    <ScrollView style={s.container}>
      {/* Avatar */}
      <View style={s.avatarSection}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{user.name?.charAt(0).toUpperCase() || "?"}</Text>
        </View>
        <Text style={s.name}>{user.name}</Text>
        <Text style={s.email}>{user.email}</Text>
        <View style={s.roleBadge}>
          <Text style={s.roleText}>{isSeller ? "Vendeur" : "Acheteur"}</Text>
        </View>
      </View>

      {/* Loyalty */}
      {loyalty && (
        <View style={s.loyaltyCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Text style={{ fontSize: 24 }}>⭐</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.loyaltyPoints}>{loyalty.points} points fidélité</Text>
              <Text style={s.loyaltyValue}>≈ {loyalty.equivalentTND} TND</Text>
            </View>
          </View>
          {loyalty.points >= 100 ? (
            <TouchableOpacity style={s.redeemBtn} onPress={redeemPoints} disabled={redeeming}>
              <Text style={s.redeemText}>{redeeming ? "Échange..." : "Échanger 100 pts → 1 TND"}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={s.loyaltyHint}>{100 - loyalty.points} pts manquants pour échanger</Text>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={s.menu}>
        <TouchableOpacity style={s.menuItem} onPress={() => navigation.navigate("Notifications")}>
          <Text style={s.menuIcon}>🔔</Text>
          <Text style={s.menuLabel}>Notifications</Text>
          <Text style={s.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.menuItem} onPress={() => navigation.navigate("Favorites")}>
          <Text style={s.menuIcon}>❤️</Text>
          <Text style={s.menuLabel}>Mes favoris</Text>
          <Text style={s.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.menuItem} onPress={() => navigation.navigate("FlashSales")}>
          <Text style={s.menuIcon}>⚡</Text>
          <Text style={s.menuLabel}>Ventes Flash</Text>
          <Text style={s.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.menuItem} onPress={() => navigation.navigate("Orders")}>
          <Text style={s.menuIcon}>📦</Text>
          <Text style={s.menuLabel}>Mes commandes</Text>
          <Text style={s.menuArrow}>›</Text>
        </TouchableOpacity>

        {isSeller && (
          <TouchableOpacity style={s.menuItem} onPress={() => navigation.navigate("SellerTab")}>
            <Text style={s.menuIcon}>🏪</Text>
            <Text style={s.menuLabel}>Espace vendeur</Text>
            <Text style={s.menuArrow}>›</Text>
          </TouchableOpacity>
        )}

        {user.role === "ADMIN" && (
          <TouchableOpacity style={[s.menuItem, { backgroundColor: "#1e293b05" }]} onPress={() => navigation.navigate("Admin")}>
            <Text style={s.menuIcon}>🛡️</Text>
            <Text style={[s.menuLabel, { color: "#1e293b" }]}>Admin Panel</Text>
            <Text style={s.menuArrow}>›</Text>
          </TouchableOpacity>
        )}

        {!isSeller && (
          <TouchableOpacity style={[s.menuItem, s.sellerCta]} onPress={handleUpgrade} disabled={loading}>
            <Text style={s.menuIcon}>🚀</Text>
            <Text style={[s.menuLabel, { color: "#9f1239" }]}>{loading ? "Traitement..." : "Devenir vendeur"}</Text>
            <Text style={[s.menuArrow, { color: "#9f1239" }]}>›</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[s.menuItem, { borderBottomWidth: 0 }]} onPress={logout}>
          <Text style={s.menuIcon}>🚪</Text>
          <Text style={[s.menuLabel, { color: "#ef4444" }]}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 },
  emptyText: { fontSize: 15, color: "#64748b", fontWeight: "600", textAlign: "center" },
  btn: { backgroundColor: "#9f1239", paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  avatarSection: { backgroundColor: "#9f1239", alignItems: "center", paddingVertical: 36, paddingTop: 50 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { fontSize: 36, color: "#fff", fontWeight: "900" },
  name: { fontSize: 20, fontWeight: "800", color: "#fff" },
  email: { fontSize: 13, color: "#fecdd3", marginTop: 4 },
  roleBadge: { marginTop: 10, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14, paddingVertical: 4, borderRadius: 999 },
  roleText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  loyaltyCard: { margin: 16, backgroundColor: "#fffbeb", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#fde68a" },
  loyaltyPoints: { fontWeight: "800", fontSize: 16, color: "#92400e" },
  loyaltyValue: { fontSize: 12, color: "#b45309", marginTop: 2 },
  loyaltyHint: { fontSize: 12, color: "#b45309", marginTop: 4 },
  redeemBtn: { backgroundColor: "#f59e0b", borderRadius: 12, padding: 10, alignItems: "center", marginTop: 4 },
  redeemText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  menu: { margin: 16, backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "#f1f5f9" },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: "#1e293b" },
  menuArrow: { fontSize: 20, color: "#94a3b8" },
  sellerCta: { backgroundColor: "#fff7f7" },
});
