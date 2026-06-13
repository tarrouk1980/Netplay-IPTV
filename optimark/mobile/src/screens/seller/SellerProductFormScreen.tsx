import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet } from "react-native";
import api from "../../api";

const CATEGORIES = ["Électronique", "Mode", "Maison", "Alimentation", "Décoration", "Sport", "Beauté", "Artisanat"];

export default function SellerProductFormScreen({ route, navigation }: any) {
  const editId = route.params?.id;
  const isEdit = !!editId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [brand, setBrand] = useState("");
  const [specs, setSpecs] = useState<{ key: string; val: string }[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/${editId}`).then(r => {
      const p = r.data?.data;
      if (!p) return;
      setTitle(p.title || "");
      setDescription(p.description || "");
      setPrice(String(p.price || ""));
      setPromoPrice(String(p.promoPrice || ""));
      setStock(String(p.stock || ""));
      setCategory(p.category || CATEGORIES[0]);
      setBrand(p.brand || "");
      setSpecs(p.specs ? Object.entries(p.specs).map(([key, val]) => ({ key, val: String(val) })) : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [editId]);

  const addSpec = () => setSpecs(prev => [...prev, { key: "", val: "" }]);
  const updateSpec = (i: number, field: "key" | "val", value: string) =>
    setSpecs(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  const removeSpec = (i: number) => setSpecs(prev => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!title || !price || !stock) { Alert.alert("Requis", "Titre, prix et stock sont obligatoires."); return; }
    setSaving(true);
    const specsObj = specs.reduce((acc: any, s) => { if (s.key) acc[s.key] = s.val; return acc; }, {});
    const payload = {
      title, description, price: parseFloat(price),
      promoPrice: promoPrice ? parseFloat(promoPrice) : undefined,
      stock: parseInt(stock), category, brand: brand || undefined,
      specs: Object.keys(specsObj).length ? specsObj : undefined,
    };
    try {
      if (isEdit) await api.patch(`/products/${editId}`, payload);
      else await api.post("/products", payload);
      Alert.alert("Succès", isEdit ? "Produit mis à jour." : "Produit créé.", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert("Erreur", e.response?.data?.message || "Impossible de sauvegarder.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator color="#9f1239" size="large" style={{ flex: 1, marginTop: 80 }} />;

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <Text style={s.label}>Titre *</Text>
      <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="Nom du produit" />

      <Text style={s.label}>Description</Text>
      <TextInput style={[s.input, { height: 100, textAlignVertical: "top" }]} value={description} onChangeText={setDescription} placeholder="Description détaillée" multiline />

      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Prix (TND) *</Text>
          <TextInput style={s.input} value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="0.00" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Prix promo</Text>
          <TextInput style={s.input} value={promoPrice} onChangeText={setPromoPrice} keyboardType="decimal-pad" placeholder="Optionnel" />
        </View>
      </View>

      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Stock *</Text>
          <TextInput style={s.input} value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="0" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Marque</Text>
          <TextInput style={s.input} value={brand} onChangeText={setBrand} placeholder="Ex: Samsung" />
        </View>
      </View>

      <Text style={s.label}>Catégorie</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8 }}>
        {CATEGORIES.map(c => (
          <TouchableOpacity key={c} onPress={() => setCategory(c)}
            style={[s.catChip, category === c && s.catChipActive]}>
            <Text style={[s.catChipText, category === c && { color: "#fff" }]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Specs */}
      <Text style={s.label}>Fiche technique</Text>
      {specs.map((spec, i) => (
        <View key={i} style={[s.row, { marginBottom: 8 }]}>
          <TextInput style={[s.input, { flex: 1, marginBottom: 0 }]} value={spec.key} onChangeText={v => updateSpec(i, "key", v)} placeholder="Caractéristique" />
          <TextInput style={[s.input, { flex: 1, marginBottom: 0 }]} value={spec.val} onChangeText={v => updateSpec(i, "val", v)} placeholder="Valeur" />
          <TouchableOpacity onPress={() => removeSpec(i)} style={{ padding: 8 }}>
            <Text style={{ color: "#ef4444", fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={s.addSpecBtn} onPress={addSpec}>
        <Text style={s.addSpecText}>+ Ajouter une caractéristique</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
        <Text style={s.saveBtnText}>{saving ? "Sauvegarde..." : isEdit ? "Mettre à jour" : "Créer le produit"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  label: { fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#1e293b", backgroundColor: "#fff", marginBottom: 4 },
  row: { flexDirection: "row", gap: 10 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0" },
  catChipActive: { backgroundColor: "#9f1239", borderColor: "#9f1239" },
  catChipText: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  addSpecBtn: { borderWidth: 1, borderColor: "#9f1239", borderRadius: 12, padding: 12, alignItems: "center", marginBottom: 8, borderStyle: "dashed" },
  addSpecText: { color: "#9f1239", fontWeight: "700", fontSize: 13 },
  saveBtn: { backgroundColor: "#9f1239", borderRadius: 16, paddingVertical: 18, alignItems: "center", marginTop: 16, marginBottom: 60 },
  saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
