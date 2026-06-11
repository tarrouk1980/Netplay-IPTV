import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, upgradeToSeller } = useAuth();
  const [loading, setLoading] = useState(false);

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

      {/* Actions */}
      <View style={s.menu}>
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
  menu: { margin: 16, backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "#f1f5f9" },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: "#1e293b" },
  menuArrow: { fontSize: 20, color: "#94a3b8" },
  sellerCta: { backgroundColor: "#fff7f7" },
});
