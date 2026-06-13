import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert, ScrollView, Modal
} from "react-native";
import api from "../../api";

const STATUS_COLOR: Record<string, string> = {
  LIVE: "#16a34a",
  UPCOMING: "#d97706",
  ENDED: "#94a3b8",
};

function statusLabel(sale: any): "LIVE" | "UPCOMING" | "ENDED" {
  const now = Date.now();
  const start = new Date(sale.startAt).getTime();
  const end = new Date(sale.endAt).getTime();
  if (!sale.isActive || now > end) return "ENDED";
  if (now < start) return "UPCOMING";
  return "LIVE";
}

function SaleCard({ sale, onToggle, onDelete }: { sale: any; onToggle: () => void; onDelete: () => void }) {
  const status = statusLabel(sale);
  const color = STATUS_COLOR[status];
  return (
    <View style={s.card}>
      <View style={s.cardRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.productName} numberOfLines={1}>{sale.product?.title || "Produit"}</Text>
          <Text style={s.meta}>
            {new Date(sale.startAt).toLocaleDateString("fr-TN")} → {new Date(sale.endAt).toLocaleDateString("fr-TN")}
          </Text>
        </View>
        <View style={[s.badge, { backgroundColor: color }]}>
          <Text style={s.badgeText}>{status}</Text>
        </View>
      </View>
      <View style={s.discountRow}>
        <Text style={s.discount}>⚡ -{sale.discount}%</Text>
        <Text style={s.discountSub}>Prix réduit : {(sale.product?.price * (1 - sale.discount / 100)).toFixed(2)} TND</Text>
      </View>
      <View style={s.actions}>
        <TouchableOpacity style={[s.btn, { backgroundColor: sale.isActive ? "#fef2f2" : "#f0fdf4" }]} onPress={onToggle}>
          <Text style={{ color: sale.isActive ? "#dc2626" : "#16a34a", fontWeight: "700", fontSize: 13 }}>
            {sale.isActive ? "Désactiver" : "Activer"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, { backgroundColor: "#fef2f2" }]} onPress={onDelete}>
          <Text style={{ color: "#dc2626", fontWeight: "700", fontSize: 13 }}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SellerFlashSalesScreen() {
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productId: "", discount: "", startAt: "", endAt: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [sRes, pRes] = await Promise.all([
      api.get("/flash-sales/my"),
      api.get("/vendors/products"),
    ]);
    setSales(sRes.data?.data || []);
    setProducts(pRes.data?.data || []);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const toggle = async (id: string) => {
    await api.patch(`/flash-sales/${id}/toggle`);
    load();
  };

  const deleteSale = (id: string) => {
    Alert.alert("Supprimer", "Supprimer cette vente flash ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer", style: "destructive", onPress: async () => {
          await api.delete(`/flash-sales/${id}`);
          load();
        }
      }
    ]);
  };

  const submit = async () => {
    if (!form.productId || !form.discount || !form.startAt || !form.endAt) {
      Alert.alert("Erreur", "Remplissez tous les champs.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/flash-sales", {
        productId: form.productId,
        discount: Number(form.discount),
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
      });
      setShowForm(false);
      setForm({ productId: "", discount: "", startAt: "", endAt: "" });
      load();
    } catch {
      Alert.alert("Erreur", "Impossible de créer la vente flash.");
    }
    setSaving(false);
  };

  if (loading) return <ActivityIndicator color="#9f1239" style={{ flex: 1 }} />;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>⚡ Ventes Flash</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(true)}>
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 20 }}>+</Text>
        </TouchableOpacity>
      </View>

      {sales.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>⚡</Text>
          <Text style={{ color: "#334155", fontWeight: "700", fontSize: 16 }}>Aucune vente flash</Text>
          <Text style={{ color: "#94a3b8", fontSize: 13, marginTop: 4, textAlign: "center" }}>
            Créez une vente flash pour booster vos ventes !
          </Text>
        </View>
      ) : (
        <FlatList
          data={sales}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <SaleCard sale={item} onToggle={() => toggle(item.id)} onDelete={() => deleteSale(item.id)} />
          )}
        />
      )}

      {/* Create modal */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Nouvelle vente flash</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={{ fontSize: 22, color: "#64748b" }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.label}>Produit</Text>
              <ScrollView style={s.productPicker} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                {products.map(p => (
                  <TouchableOpacity key={p.id} style={[s.productOption, form.productId === p.id && s.productOptionActive]}
                    onPress={() => setForm(f => ({ ...f, productId: p.id }))}>
                    <Text style={[s.productOptionText, form.productId === p.id && { color: "#fff" }]} numberOfLines={1}>
                      {p.title}
                    </Text>
                    <Text style={[{ fontSize: 12, color: "#94a3b8" }, form.productId === p.id && { color: "#fecdd3" }]}>
                      {Number(p.price).toFixed(2)} TND
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={s.label}>Réduction (%)</Text>
              <TextInput
                style={s.input}
                value={form.discount}
                onChangeText={v => setForm(f => ({ ...f, discount: v }))}
                keyboardType="numeric"
                placeholder="Ex: 20"
                placeholderTextColor="#94a3b8"
              />

              <Text style={s.label}>Début (YYYY-MM-DD HH:MM)</Text>
              <TextInput
                style={s.input}
                value={form.startAt}
                onChangeText={v => setForm(f => ({ ...f, startAt: v }))}
                placeholder="2026-06-15 10:00"
                placeholderTextColor="#94a3b8"
              />

              <Text style={s.label}>Fin (YYYY-MM-DD HH:MM)</Text>
              <TextInput
                style={s.input}
                value={form.endAt}
                onChangeText={v => setForm(f => ({ ...f, endAt: v }))}
                placeholder="2026-06-15 20:00"
                placeholderTextColor="#94a3b8"
              />

              <TouchableOpacity style={[s.submitBtn, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>Créer la vente flash ⚡</Text>}
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
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  cardRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10, gap: 10 },
  productName: { fontSize: 15, fontWeight: "800", color: "#1e293b", marginBottom: 3 },
  meta: { fontSize: 11, color: "#94a3b8" },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  discountRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 12 },
  discount: { fontSize: 22, fontWeight: "900", color: "#dc2626" },
  discountSub: { fontSize: 12, color: "#64748b" },
  actions: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#1e293b" },
  label: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: "#f1f5f9", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#1e293b" },
  productPicker: { maxHeight: 160, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  productOption: { paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  productOptionActive: { backgroundColor: "#9f1239" },
  productOptionText: { fontSize: 13, fontWeight: "600", color: "#1e293b", flex: 1, marginRight: 8 },
  submitBtn: { backgroundColor: "#9f1239", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 24, marginBottom: 8 },
});
