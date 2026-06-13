import React, { useCallback, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert, ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../lib/api";

const ROSE = "#9f1239";

type Row = {
  id: string;
  title: string;
  price: number;
  promoPrice: number | null;
  selected: boolean;
  newPrice: string;
  newPromo: string;
};

export default function SellerBulkPriceScreen({ navigation }: any) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.get("/vendors/products")
      .then(r => {
        const products = r.data?.data || [];
        setRows(products.map((p: any) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          promoPrice: p.promoPrice ?? null,
          selected: false,
          newPrice: String(p.price),
          newPromo: p.promoPrice != null ? String(p.promoPrice) : "",
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const toggleAll = (val: boolean) => {
    setSelectAll(val);
    setRows(prev => prev.map(r => ({ ...r, selected: val })));
  };

  const toggleRow = (id: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const update = (id: string, field: "newPrice" | "newPromo", val: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  const selectedCount = rows.filter(r => r.selected).length;

  const apply = async () => {
    const selected = rows.filter(r => r.selected);
    if (selected.length === 0) {
      Alert.alert("Aucun produit sélectionné", "Cochez au moins un produit.");
      return;
    }
    const updates = selected.map(r => ({
      id: r.id,
      price: parseFloat(r.newPrice) || r.price,
      promoPrice: r.newPromo ? parseFloat(r.newPromo) || null : null,
    }));
    setSaving(true);
    try {
      await api.post("/vendors/products/bulk-price", { updates });
      Alert.alert("✓ Succès", `${selected.length} produit(s) mis à jour.`);
      navigation.goBack();
    } catch {
      Alert.alert("Erreur", "Impossible de mettre à jour les prix.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <View style={s.center}><ActivityIndicator color={ROSE} size="large" /></View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header bar */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => toggleAll(!selectAll)} style={s.selectAllBtn}>
          <View style={[s.checkbox, selectAll && s.checkboxOn]}>
            {selectAll && <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>✓</Text>}
          </View>
          <Text style={s.selectAllText}>Tout sélectionner</Text>
        </TouchableOpacity>
        <Text style={s.countText}>{selectedCount} sélectionné(s)</Text>
      </View>

      <FlatList
        data={rows}
        keyExtractor={r => r.id}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        renderItem={({ item: r }) => (
          <View style={[s.card, r.selected && s.cardSelected]}>
            <TouchableOpacity onPress={() => toggleRow(r.id)} style={s.checkRow}>
              <View style={[s.checkbox, r.selected && s.checkboxOn]}>
                {r.selected && <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>✓</Text>}
              </View>
              <Text style={s.productTitle} numberOfLines={1}>{r.title}</Text>
            </TouchableOpacity>
            <View style={s.priceRow}>
              <View style={s.priceField}>
                <Text style={s.priceLabel}>Prix (TND)</Text>
                <TextInput
                  style={s.priceInput}
                  value={r.newPrice}
                  onChangeText={v => update(r.id, "newPrice", v)}
                  keyboardType="decimal-pad"
                  editable={r.selected}
                  selectTextOnFocus
                />
              </View>
              <View style={s.priceField}>
                <Text style={s.priceLabel}>Prix promo (vide = aucun)</Text>
                <TextInput
                  style={[s.priceInput, { borderColor: r.newPromo ? "#fda4af" : "#e2e8f0" }]}
                  value={r.newPromo}
                  onChangeText={v => update(r.id, "newPromo", v)}
                  keyboardType="decimal-pad"
                  editable={r.selected}
                  placeholder="—"
                  placeholderTextColor="#94a3b8"
                  selectTextOnFocus
                />
              </View>
            </View>
          </View>
        )}
      />

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.applyBtn, (saving || selectedCount === 0) && s.applyBtnDisabled]}
          onPress={apply}
          disabled={saving || selectedCount === 0}
        >
          <Text style={s.applyText}>
            {saving ? "Mise à jour..." : `Appliquer aux ${selectedCount} produit(s)`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },
  selectAllBtn: { flexDirection: "row", alignItems: "center", gap: 8 },
  selectAllText: { fontSize: 13, fontWeight: "600", color: "#475569" },
  countText: { fontSize: 13, fontWeight: "700", color: ROSE },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 12,
    borderWidth: 1.5, borderColor: "#f1f5f9",
    shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  cardSelected: { borderColor: "#fda4af", backgroundColor: "#fff9fa" },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  checkbox: {
    width: 20, height: 20, borderRadius: 5, borderWidth: 1.5,
    borderColor: "#cbd5e1", alignItems: "center", justifyContent: "center",
  },
  checkboxOn: { backgroundColor: ROSE, borderColor: ROSE },
  productTitle: { flex: 1, fontSize: 13, fontWeight: "700", color: "#1e293b" },
  priceRow: { flexDirection: "row", gap: 8 },
  priceField: { flex: 1 },
  priceLabel: { fontSize: 10, fontWeight: "600", color: "#94a3b8", marginBottom: 4 },
  priceInput: {
    borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 7, fontSize: 14, fontWeight: "700", color: "#1e293b",
  },
  footer: {
    padding: 16, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f1f5f9",
  },
  applyBtn: { backgroundColor: ROSE, borderRadius: 12, padding: 14, alignItems: "center" },
  applyBtnDisabled: { opacity: 0.4 },
  applyText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
