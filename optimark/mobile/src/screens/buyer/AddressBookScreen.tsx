import React, { useCallback, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator, Modal, ScrollView, Switch,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../lib/api";

const ROSE = "#9f1239";

type Address = {
  id: string; label: string; street: string; city: string;
  zip?: string; phone?: string; isDefault: boolean;
};

const empty = () => ({ label: "", street: "", city: "", zip: "", phone: "", isDefault: false });

export default function AddressBookScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => {
    api.get("/addresses")
      .then(r => setAddresses(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const openCreate = () => { setEditing(null); setForm(empty()); setShowModal(true); };
  const openEdit = (addr: Address) => {
    setEditing(addr);
    setForm({ label: addr.label, street: addr.street, city: addr.city, zip: addr.zip || "", phone: addr.phone || "", isDefault: addr.isDefault });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.label.trim() || !form.street.trim() || !form.city.trim()) {
      Alert.alert("Champs requis", "Libellé, rue et ville sont obligatoires.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const res = await api.patch(`/addresses/${editing.id}`, form);
        setAddresses(prev => prev.map(a => a.id === editing.id ? res.data.data : a));
      } else {
        const res = await api.post("/addresses", form);
        if (form.isDefault) {
          setAddresses(prev => [res.data.data, ...prev.map(a => ({ ...a, isDefault: false }))]);
        } else {
          setAddresses(prev => [res.data.data, ...prev]);
        }
      }
      setShowModal(false);
    } catch {
      Alert.alert("Erreur", "Impossible de sauvegarder l'adresse.");
    } finally {
      setSaving(false);
    }
  };

  const remove = (id: string) => {
    Alert.alert("Supprimer", "Supprimer cette adresse ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer", style: "destructive", onPress: async () => {
          await api.delete(`/addresses/${id}`).catch(() => {});
          setAddresses(prev => prev.filter(a => a.id !== id));
        },
      },
    ]);
  };

  const setDefault = async (id: string) => {
    await api.patch(`/addresses/${id}`, { isDefault: true }).catch(() => {});
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  if (loading) return (
    <View style={s.center}><ActivityIndicator color={ROSE} size="large" /></View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <FlatList
        data={addresses}
        keyExtractor={a => a.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>📍</Text>
            <Text style={s.emptyTitle}>Aucune adresse enregistrée</Text>
            <Text style={s.emptySub}>Ajoutez une adresse de livraison pour passer vos commandes plus rapidement.</Text>
          </View>
        }
        renderItem={({ item: addr }) => (
          <View style={[s.card, addr.isDefault && s.cardDefault]}>
            <View style={s.cardHeader}>
              <View style={s.labelRow}>
                <Text style={s.label}>{addr.label}</Text>
                {addr.isDefault && (
                  <View style={s.defaultBadge}>
                    <Text style={s.defaultText}>Par défaut</Text>
                  </View>
                )}
              </View>
              <View style={s.actions}>
                {!addr.isDefault && (
                  <TouchableOpacity onPress={() => setDefault(addr.id)} style={s.actionBtn}>
                    <Text style={s.actionBtnText}>Défaut</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => openEdit(addr)} style={s.actionBtn}>
                  <Text style={s.actionBtnText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => remove(addr.id)} style={s.actionBtn}>
                  <Text style={[s.actionBtnText, { color: "#ef4444" }]}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={s.street}>{addr.street}</Text>
            <Text style={s.city}>{addr.city}{addr.zip ? ` ${addr.zip}` : ""}</Text>
            {addr.phone && <Text style={s.phone}>📞 {addr.phone}</Text>}
          </View>
        )}
      />

      {/* Add button */}
      <View style={s.footer}>
        <TouchableOpacity style={s.addBtn} onPress={openCreate}>
          <Text style={s.addBtnText}>+ Ajouter une adresse</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.modalTitle}>{editing ? "Modifier l'adresse" : "Nouvelle adresse"}</Text>
              {[
                { label: "Libellé *", key: "label", placeholder: "Ex: Maison" },
                { label: "Rue *", key: "street", placeholder: "123 rue de la Paix" },
                { label: "Ville *", key: "city", placeholder: "Tunis" },
                { label: "Code postal", key: "zip", placeholder: "1000" },
                { label: "Téléphone", key: "phone", placeholder: "+216 XX XXX XXX" },
              ].map(f => (
                <View key={f.key} style={s.field}>
                  <Text style={s.fieldLabel}>{f.label}</Text>
                  <TextInput
                    style={s.input}
                    value={(form as any)[f.key]}
                    onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                    placeholder={f.placeholder}
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              ))}
              <View style={s.switchRow}>
                <Text style={s.fieldLabel}>Adresse par défaut</Text>
                <Switch
                  value={form.isDefault}
                  onValueChange={v => setForm(p => ({ ...p, isDefault: v }))}
                  trackColor={{ false: "#e2e8f0", true: "#fda4af" }}
                  thumbColor={form.isDefault ? ROSE : "#94a3b8"}
                />
              </View>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                <TouchableOpacity style={[s.modalBtn, { backgroundColor: "#f1f5f9", flex: 1 }]} onPress={() => setShowModal(false)}>
                  <Text style={{ color: "#64748b", fontWeight: "700" }}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.modalBtn, { backgroundColor: ROSE, flex: 2 }]} onPress={save} disabled={saving}>
                  <Text style={{ color: "#fff", fontWeight: "800" }}>{saving ? "Sauvegarde..." : "Sauvegarder"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 14, gap: 10, paddingBottom: 90 },
  empty: { alignItems: "center", padding: 40 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#334155", marginBottom: 6 },
  emptySub: { fontSize: 13, color: "#94a3b8", textAlign: "center" },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: "#f1f5f9",
    shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  cardDefault: { borderColor: "#fda4af", backgroundColor: "#fff9fa" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 14, fontWeight: "800", color: "#1e293b" },
  defaultBadge: { backgroundColor: "#fff1f2", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  defaultText: { fontSize: 9, fontWeight: "800", color: ROSE },
  actions: { flexDirection: "row", gap: 4 },
  actionBtn: { padding: 6 },
  actionBtnText: { fontSize: 12, fontWeight: "700", color: "#64748b" },
  street: { fontSize: 13, color: "#475569" },
  city: { fontSize: 13, color: "#64748b" },
  phone: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  addBtn: { backgroundColor: ROSE, borderRadius: 14, padding: 14, alignItems: "center" },
  addBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "90%" },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#1e293b", marginBottom: 16 },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: "#64748b", marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#1e293b",
  },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  modalBtn: { borderRadius: 12, padding: 13, alignItems: "center" },
});
