import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert, Modal, ScrollView, Switch
} from "react-native";
import api from "../../api";

const CATEGORIES = ["Développement", "Design", "Marketing", "Rédaction", "Traduction", "Comptabilité", "Conseil", "Artisanat", "Autre"];

export default function SellerServicesScreen() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", description: "", price: "", category: CATEGORIES[0], deliveryTime: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await api.get("/services/my");
    setServices(res.data?.data || []);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", price: "", category: CATEGORIES[0], deliveryTime: "" });
    setShowForm(true);
  };

  const openEdit = (svc: any) => {
    setEditing(svc);
    setForm({
      title: svc.title || "",
      description: svc.description || "",
      price: String(svc.price || ""),
      category: svc.category || CATEGORIES[0],
      deliveryTime: String(svc.deliveryTime || ""),
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title || !form.price) { Alert.alert("Requis", "Titre et prix requis."); return; }
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      deliveryTime: form.deliveryTime ? parseInt(form.deliveryTime) : undefined,
    };
    try {
      if (editing) await api.put(`/services/${editing.id}`, payload);
      else await api.post("/services", payload);
      setShowForm(false);
      load();
    } catch (e: any) {
      Alert.alert("Erreur", e.response?.data?.message || "Impossible de sauvegarder.");
    }
    setSaving(false);
  };

  const deleteService = (id: string) => {
    Alert.alert("Supprimer", "Supprimer ce service ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: async () => { await api.delete(`/services/${id}`); load(); } }
    ]);
  };

  if (loading) return <ActivityIndicator color="#9f1239" style={{ flex: 1 }} />;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>💼 Mes services</Text>
        <TouchableOpacity style={s.addBtn} onPress={openCreate}>
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 20 }}>+</Text>
        </TouchableOpacity>
      </View>

      {services.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>💼</Text>
          <Text style={{ color: "#334155", fontWeight: "700", fontSize: 16 }}>Aucun service</Text>
          <Text style={{ color: "#94a3b8", fontSize: 13, marginTop: 4, textAlign: "center" }}>Créez votre premier service freelance !</Text>
          <TouchableOpacity style={s.startBtn} onPress={openCreate}>
            <Text style={{ color: "#fff", fontWeight: "800" }}>+ Créer un service</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.svcTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={s.tagRow}>
                    <Text style={s.catTag}>{item.category}</Text>
                    {item.deliveryTime && <Text style={s.deliveryTag}>⏱ {item.deliveryTime}j</Text>}
                  </View>
                </View>
                <Text style={s.price}>{Number(item.price).toFixed(0)} TND</Text>
              </View>
              {item.description && (
                <Text style={s.desc} numberOfLines={2}>{item.description}</Text>
              )}
              <View style={s.actions}>
                <TouchableOpacity style={[s.btn, { backgroundColor: "#f0f9ff" }]} onPress={() => openEdit(item)}>
                  <Text style={{ color: "#0369a1", fontWeight: "700", fontSize: 13 }}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.btn, { backgroundColor: "#fef2f2" }]} onPress={() => deleteService(item.id)}>
                  <Text style={{ color: "#dc2626", fontWeight: "700", fontSize: 13 }}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{editing ? "Modifier le service" : "Nouveau service"}</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={{ fontSize: 22, color: "#64748b" }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.label}>Titre *</Text>
              <TextInput style={s.input} value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))}
                placeholder="Ex: Création de site web vitrine" placeholderTextColor="#94a3b8" />

              <Text style={s.label}>Description</Text>
              <TextInput style={[s.input, { minHeight: 80, textAlignVertical: "top" }]} value={form.description}
                onChangeText={v => setForm(f => ({ ...f, description: v }))} multiline
                placeholder="Décrivez votre service en détail..." placeholderTextColor="#94a3b8" />

              <Text style={s.label}>Catégorie</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                <View style={{ flexDirection: "row", gap: 8, paddingVertical: 4 }}>
                  {CATEGORIES.map(c => (
                    <TouchableOpacity key={c} style={[s.catChip, form.category === c && s.catChipActive]}
                      onPress={() => setForm(f => ({ ...f, category: c }))}>
                      <Text style={[s.catChipText, form.category === c && { color: "#fff" }]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={s.label}>Prix (TND) *</Text>
              <TextInput style={s.input} value={form.price} onChangeText={v => setForm(f => ({ ...f, price: v }))}
                keyboardType="numeric" placeholder="150" placeholderTextColor="#94a3b8" />

              <Text style={s.label}>Délai de livraison (jours)</Text>
              <TextInput style={s.input} value={form.deliveryTime} onChangeText={v => setForm(f => ({ ...f, deliveryTime: v }))}
                keyboardType="numeric" placeholder="7" placeholderTextColor="#94a3b8" />

              <TouchableOpacity style={[s.submitBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>
                  {editing ? "Mettre à jour" : "Créer le service"}
                </Text>}
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
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
  startBtn: { backgroundColor: "#9f1239", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, marginTop: 8 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  cardRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 8 },
  svcTitle: { fontSize: 15, fontWeight: "800", color: "#1e293b", marginBottom: 6 },
  tagRow: { flexDirection: "row", gap: 6 },
  catTag: { backgroundColor: "#f1f5f9", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, fontSize: 10, color: "#64748b", fontWeight: "700" },
  deliveryTag: { backgroundColor: "#ecfdf5", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, fontSize: 10, color: "#16a34a", fontWeight: "700" },
  price: { fontSize: 18, fontWeight: "900", color: "#9f1239" },
  desc: { fontSize: 12, color: "#94a3b8", marginBottom: 10, lineHeight: 17 },
  actions: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#1e293b" },
  label: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: "#f1f5f9", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#1e293b" },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0" },
  catChipActive: { backgroundColor: "#9f1239", borderColor: "#9f1239" },
  catChipText: { fontSize: 12, fontWeight: "600", color: "#64748b" },
  submitBtn: { backgroundColor: "#9f1239", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 24, marginBottom: 8 },
});
