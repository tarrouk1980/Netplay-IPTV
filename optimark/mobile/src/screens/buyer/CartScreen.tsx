import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from "react-native";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api";

export default function CartScreen({ navigation }: any) {
  const { items, updateQty, removeItem, clear, total } = useCart();
  const { user } = useAuth();
  const [address, setAddress] = useState({ street: "", city: "", zip: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [applying, setApplying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"KONNECT" | "PAYMEE" | "CASH_ON_DELIVERY">("CASH_ON_DELIVERY");

  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setApplying(true);
    try {
      const res = await api.get("/coupons/validate", { params: { code: coupon.trim(), amount: total } });
      const amt = res.data?.data?.discountAmount || 0;
      setDiscountAmount(amt);
      setCouponApplied(true);
      Alert.alert("✓ Code appliqué", `Réduction de ${amt.toFixed(2)} TND appliquée !`);
    } catch (e: any) {
      Alert.alert("Code invalide", e.response?.data?.message || "Ce code promo n'est pas valide.");
      setDiscountAmount(0);
      setCouponApplied(false);
    }
    setApplying(false);
  };

  const finalTotal = Math.max(0, total - discountAmount);

  const placeOrder = async () => {
    if (!user) { navigation.navigate("Auth"); return; }
    if (!address.street || !address.city || !address.phone) {
      Alert.alert("Adresse incomplète", "Veuillez remplir rue, ville et téléphone.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/orders", {
        items: items.map(i => ({ productId: i.id, quantity: i.qty })),
        deliveryAddress: address,
        paymentMethod,
        couponCode: coupon.trim() || undefined,
      });
      clear();
      Alert.alert("Commande confirmée ✓", "Votre commande a été passée avec succès !", [
        { text: "Voir mes commandes", onPress: () => navigation.navigate("Orders") },
      ]);
    } catch (e: any) {
      Alert.alert("Erreur", e.response?.data?.message || "Impossible de passer la commande.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={{ fontSize: 48 }}>🛒</Text>
        <Text style={s.emptyText}>Votre panier est vide</Text>
        <TouchableOpacity style={s.shopBtn} onPress={() => navigation.navigate("Home")}>
          <Text style={s.shopBtnText}>Parcourir les produits</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.container}>
      <Text style={s.heading}>Mon panier ({items.length})</Text>

      {items.map(item => (
        <View key={item.id} style={s.itemRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.itemTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={s.itemSeller}>{item.seller}</Text>
            <Text style={s.itemPrice}>{(item.price * item.qty).toFixed(2)} TND</Text>
          </View>
          <View style={s.qtyRow}>
            <TouchableOpacity style={s.qBtn} onPress={() => updateQty(item.id, item.qty - 1)}><Text style={s.qBtnText}>−</Text></TouchableOpacity>
            <Text style={s.qVal}>{item.qty}</Text>
            <TouchableOpacity style={s.qBtn} onPress={() => updateQty(item.id, item.qty + 1)}><Text style={s.qBtnText}>+</Text></TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => removeItem(item.id)} style={{ padding: 8 }}>
            <Text style={{ color: "#ef4444", fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Delivery address */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Adresse de livraison</Text>
        <TextInput style={s.input} placeholder="Rue / Adresse" value={address.street} onChangeText={t => setAddress(a => ({ ...a, street: t }))} />
        <TextInput style={s.input} placeholder="Ville" value={address.city} onChangeText={t => setAddress(a => ({ ...a, city: t }))} />
        <TextInput style={s.input} placeholder="Code postal" value={address.zip} onChangeText={t => setAddress(a => ({ ...a, zip: t }))} keyboardType="numeric" />
        <TextInput style={s.input} placeholder="Téléphone" value={address.phone} onChangeText={t => setAddress(a => ({ ...a, phone: t }))} keyboardType="phone-pad" />
      </View>

      {/* Total */}
      {/* Coupon */}
      <View style={[s.section, { flexDirection: "row", gap: 8, alignItems: "center" }]}>
        <TextInput
          style={[s.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Code promo"
          value={coupon}
          onChangeText={setCoupon}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={s.couponBtn} onPress={applyCoupon} disabled={applying}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>{applying ? "..." : "Appliquer"}</Text>
        </TouchableOpacity>
      </View>

      {/* Payment method */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Mode de paiement</Text>
        {(["CASH_ON_DELIVERY", "KONNECT", "PAYMEE"] as const).map(m => (
          <TouchableOpacity key={m} style={[s.payOption, paymentMethod === m && s.payOptionActive]} onPress={() => setPaymentMethod(m)}>
            <Text style={s.payOptionIcon}>{m === "CASH_ON_DELIVERY" ? "💵" : "💳"}</Text>
            <Text style={[s.payOptionLabel, paymentMethod === m && { color: "#9f1239" }]}>
              {m === "CASH_ON_DELIVERY" ? "Cash à la livraison" : m === "KONNECT" ? "Konnect" : "Paymee"}
            </Text>
            {paymentMethod === m && <Text style={{ color: "#9f1239", fontWeight: "900", marginLeft: "auto" }}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.totalRow}>
        <Text style={s.totalLabel}>Total</Text>
        <View style={{ alignItems: "flex-end" }}>
          {discountAmount > 0 && <Text style={{ color: "#94a3b8", fontSize: 13, textDecorationLine: "line-through" }}>{total.toFixed(2)} TND</Text>}
          <Text style={s.totalVal}>{finalTotal.toFixed(2)} TND</Text>
          {discountAmount > 0 && <Text style={{ color: "#16a34a", fontSize: 12, fontWeight: "700" }}>-{discountAmount.toFixed(2)} TND ({coupon})</Text>}
        </View>
      </View>

      <TouchableOpacity style={[s.orderBtn, loading && { opacity: 0.6 }]} onPress={placeOrder} disabled={loading}>
        <Text style={s.orderBtnText}>{loading ? "En cours..." : "Passer la commande"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 16, color: "#64748b", fontWeight: "600" },
  shopBtn: { backgroundColor: "#9f1239", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  shopBtnText: { color: "#fff", fontWeight: "700" },
  heading: { fontSize: 20, fontWeight: "800", color: "#0f172a", padding: 20, paddingBottom: 8 },
  itemRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginHorizontal: 16, marginBottom: 8, borderRadius: 16, padding: 14, gap: 10, borderWidth: 1, borderColor: "#f1f5f9" },
  itemTitle: { fontSize: 13, fontWeight: "700", color: "#1e293b" },
  itemSeller: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: "800", color: "#9f1239", marginTop: 4 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: "#9f1239", alignItems: "center", justifyContent: "center" },
  qBtnText: { color: "#9f1239", fontSize: 16, fontWeight: "700" },
  qVal: { fontSize: 14, fontWeight: "800", color: "#1e293b", minWidth: 20, textAlign: "center" },
  section: { margin: 16, backgroundColor: "#fff", borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: "#f1f5f9" },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: "#1e293b", marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#1e293b" },
  couponBtn: { backgroundColor: "#9f1239", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginHorizontal: 16, marginTop: 8, paddingVertical: 16, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
  totalVal: { fontSize: 20, fontWeight: "900", color: "#9f1239" },
  orderBtn: { backgroundColor: "#9f1239", margin: 16, borderRadius: 16, paddingVertical: 18, alignItems: "center", marginBottom: 40 },
  orderBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  payOption: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 12 },
  payOptionActive: { borderColor: "#9f1239", backgroundColor: "#fff5f7" },
  payOptionIcon: { fontSize: 20 },
  payOptionLabel: { fontSize: 14, fontWeight: "600", color: "#475569" },
});
