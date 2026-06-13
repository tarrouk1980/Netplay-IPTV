import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert, Modal, ScrollView, Switch
} from "react-native";
import api from "../../api";

export default function SellerCouponsScreen() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", discount: "", type: "PERCENT", minAmount: "", maxUses: "", expiresAt: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await api.get("/coupons/my");
    setCoupons(res.data?.data || []);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const create = async () => {
    if (!form.code || !form.discount) { Alert.alert("Erreur", "Code et réduction requis."); return; }
    setSaving(true);
    try {
      await api.post("/coupons", {
        code: form.code.toUpperCase(),
        discount: parseFloat(form.discount),
        type: form.type,
        minAmount: form.minAmount ? parseFloat(form.minAmount) : undefined,
        maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
        expiresAt: form.expiresAt || undefined,
      });
      setShowForm(false);
      setForm({ code: "", discount: "", type: "PERCENT", minAmount: "", maxUses: "", expiresAt: "" });
      load();
    } catch (e: any) {
      Alert.alert("Erreur", e.response?.data?.message || "Impossible de créer le code.");
    }
    setSaving(false);
  };

  const toggle = async (id: string) => {
    await api.patch(`/coupons/${id}/toggle`);
    load();
  };

  const deleteCoupon = (id: string) => {
    Alert.alert("Supprimer", "Supprimer ce code promo ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer", style: "destructive", onPress: async () => {
          await api.delete(`/coupons/${id}`);
          load();
        }
      }
    ]);
  };

  if (loading) return <ActivityIndicator color="#9f1239" style={{ flex: 1 }} />;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>🏷️ Codes promo</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(true)}>
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 20 }}>+</Text>
        </TouchableOpacity>
      </View>

      {coupons.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>🏷️</Text>
          <Text style={{ color: "#334155", fontWeight: "700", fontSize: 16 }}>Aucun code promo</Text>
          <Text style={{ color: "#94a3b8", fontSize: 13, marginTop: 4, textAlign: "center" }}>Créez un code pour fidéliser vos clients !</Text>
        </View>
      ) : (
        <FlatList
          data={coupons}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardRow}>
                <View style={s.codeBox}>
                  <Text style={s.codeText}>{item.code}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.discountText}>
                    {item.type === "PERCENT" ? `${item.discount}%` : `${item.discount} TND`} de réduction
                  </Text>
                  <Text style={s.metaText}>
                    {item.usedCount} utilisations{item.maxUses ? `/${item.maxUses}` : ""}
                    {item.expiresAt ? ` · exp. ${new Date(item.expiresAt).toLocaleDateString("fr-TN")}` : ""}
                  </Text>
                </View>
                <Switch
                  value={item.isActive}
                  onValueChange={() => toggle(item.id)}
                  trackColor={{ false: "#e2e8f0", true: "#9f1239" }}
                  thumbColor="#fff"
                />
              </View>
              <TouchableOpacity style={s.deleteBtn} onPress={() => deleteCoupon(item.id)}>
                <Text style={{ color: "#dc2626", fontSize: 12, fontWeight: "700" }}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Nouveau code promo</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={{ fontSize: 22, color: "#64748b" }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.label}>Code *</Text>
              <TextInput style={[s.input, { fontFamily: "monospace", letterSpacing: 2 }]}
                value={form.code} onChangeText={v => setForm(f => ({ ...f, code: v.toUpperCase() }))}
                placeholder="EX: PROMO20" placeholderTextColor="#94a3b8" autoCapitalize="characters" />

              <Text style={s.label}>Type de réduction</Text>
              <View style={s.typeRow}>
                {["PERCENT", "FIXED"].map(t => (
                  <TouchableOpacity key={t} style={[s.typeBtn, form.type === t && s.typeBtnActive]}
                    onPress={() => setForm(f => ({ ...f, type: t }))}>
                    <Text style={[s.typeBtnText, form.type === t && { color: "#fff" }]}>
                      {t === "PERCENT" ? "Pourcentage (%)" : "Fixe (TND)"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.label}>Réduction * {form.type === "PERCENT" ? "(%)" : "(TND)"}</Text>
              <TextInput style={s.input} value={form.discount} onChangeText={v => setForm(f => ({ ...f, discount: v }))}
                keyboardType="numeric" placeholder="20" placeholderTextColor="#94a3b8" />

              <Text style={s.label}>Montant minimum (TND)</Text>
              <TextInput style={s.input} value={form.minAmount} onChangeText={v => setForm(f => ({ ...f, minAmount: v }))}
                keyboardType="numeric" placeholder="Optionnel" placeholderTextColor="#94a3b8" />

              <Text style={s.label}>Utilisations max.</Text>
              <TextInput style={s.input} value={form.maxUses} onChangeText={v => setForm(f => ({ ...f, maxUses: v }))}
                keyboardType="numeric" placeholder="Illimité" placeholderTextColor="#94a3b8" />

              <Text style={s.label}>Expiration (YYYY-MM-DD)</Text>
              <TextInput style={s.input} value={form.expiresAt} onChangeText={v => setForm(f => ({ ...f, expiresAt: v }))}
                placeholder="2026-12-31" placeholderTextColor="#94a3b8" />

              <TouchableOpacity style={[s.submitBtn, saving && { opacity: 0.6 }]} onPress={create} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>Créer le code 🏷️</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#9f1239", paddingHorizontal: 20, paddingVertical: 18, paddingTop: 22 },
  title: { color: "#fff", fontSize: 20, fontWeight: "900" },
  addBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  cardRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  codeBox: { backgroundColor: "#fef2f2", borderWidth: 1.5, borderStyle: "dashed", borderColor: "#fca5a5", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  codeText: { color: "#9f1239", fontWeight: "900", fontSize: 16, letterSpacing: 2 },
  discountText: { fontWeight: "800", color: "#1e293b", fontSize: 14 },
  metaText: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  deleteBtn: { alignSelf: "flex-start", paddingVertical: 4 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#1e293b" },
  label: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: "#f1f5f9", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#1e293b" },
  typeRow: { flexDirection: "row", gap: 10 },
  typeBtn: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: "center", borderWidth: 1.5, borderColor: "#e2e8f0", backgroundColor: "#f8fafc" },
  typeBtnActive: { backgroundColor: "#9f1239", borderColor: "#9f1239" },
  typeBtnText: { fontSize: 13, fontWeight: "700", color: "#64748b" },
  submitBtn: { backgroundColor: "#9f1239", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 24, marginBottom: 8 },
});
