import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Alert } from "react-native";
import api from "../../api";

export default function SellerStoreEditorScreen({ navigation }: any) {
  const [form, setForm] = useState({ name: "", description: "", logo: "", cover: "", phone: "", address: "", bannerText: "", bannerColor: "#9f1239" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/vendors/store")
      .then(r => {
        const s = r.data?.data;
        if (s) setForm({
          name: s.name || "",
          description: s.description || "",
          logo: s.logo || "",
          cover: s.cover || "",
          phone: s.phone || "",
          address: s.address || "",
          bannerText: s.bannerText || "",
          bannerColor: s.bannerColor || "#9f1239",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!form.name.trim()) { Alert.alert("Nom requis", "Veuillez saisir le nom de votre boutique."); return; }
    setSaving(true);
    try {
      await api.put("/vendors/store", form);
      Alert.alert("✓ Boutique mise à jour", "Vos informations ont été sauvegardées.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (e: any) {
      Alert.alert("Erreur", e.response?.data?.message || "Impossible de sauvegarder.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator color="#9f1239" size="large" style={{ flex: 1, marginTop: 80 }} />;

  const Field = ({ label, field, placeholder, multiline = false }: { label: string; field: keyof typeof form; placeholder: string; multiline?: boolean }) => (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        value={form[field]}
        onChangeText={v => setForm(f => ({ ...f, [field]: v }))}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        style={[s.input, multiline && s.textarea]}
      />
    </View>
  );

  const preview = form.name.charAt(0).toUpperCase() || "B";

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Preview */}
      <View style={s.preview}>
        <View style={s.previewCover}>
          {/* cover placeholder */}
        </View>
        <View style={s.previewAvatarRow}>
          <View style={s.previewAvatar}>
            <Text style={s.previewAvatarText}>{preview}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.previewName}>{form.name || "Nom de la boutique"}</Text>
            {form.address ? <Text style={s.previewAddr}>📍 {form.address}</Text> : null}
          </View>
        </View>
      </View>

      {/* Form */}
      <View style={s.form}>
        <Field label="Nom de la boutique *" field="name" placeholder="Ex: TechStore Tunis" />
        <Field label="Description" field="description" placeholder="Décrivez votre boutique..." multiline />
        <Field label="Téléphone" field="phone" placeholder="+216 XX XXX XXX" />
        <Field label="Adresse" field="address" placeholder="Ex: 23 Avenue Habib Bourguiba, Tunis" />
        <Field label="URL du logo" field="logo" placeholder="https://..." />
        <Field label="URL de la photo de couverture" field="cover" placeholder="https://..." />
        <View style={s.field}>
          <Text style={s.label}>📢 Bannière promotionnelle</Text>
          <TextInput
            value={form.bannerText}
            onChangeText={v => setForm(f => ({ ...f, bannerText: v.slice(0, 120) }))}
            placeholder="Ex: 🎉 Soldes d'été — -30% sur tout !"
            placeholderTextColor="#94a3b8"
            style={s.input}
            maxLength={120}
          />
          <View style={{ flexDirection: "row", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
            {["#9f1239", "#1e3a5f", "#065f46", "#92400e", "#1e293b"].map(c => (
              <TouchableOpacity key={c} onPress={() => setForm(f => ({ ...f, bannerColor: c }))}
                style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: c, borderWidth: form.bannerColor === c ? 3 : 0, borderColor: "#fff" }} />
            ))}
          </View>
          {!!form.bannerText && (
            <View style={{ marginTop: 8, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: form.bannerColor }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13, textAlign: "center" }}>{form.bannerText}</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
        <Text style={s.saveBtnText}>{saving ? "Sauvegarde..." : "✓ Sauvegarder la boutique"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  preview: { backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", marginBottom: 16, borderWidth: 1, borderColor: "#f1f5f9" },
  previewCover: { height: 80, backgroundColor: "#fef2f2" },
  previewAvatarRow: { flexDirection: "row", alignItems: "center", padding: 16, marginTop: -24 },
  previewAvatar: { width: 56, height: 56, borderRadius: 14, backgroundColor: "#9f1239", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#fff" },
  previewAvatarText: { fontSize: 24, color: "#fff", fontWeight: "900" },
  previewName: { fontSize: 18, fontWeight: "900", color: "#1e293b", marginTop: 8 },
  previewAddr: { fontSize: 12, color: "#64748b", marginTop: 2 },
  form: { backgroundColor: "#fff", borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#f1f5f9", gap: 16 },
  field: {},
  label: { fontSize: 11, fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  input: { backgroundColor: "#f8fafc", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#1e293b", borderWidth: 1, borderColor: "#e2e8f0" },
  textarea: { minHeight: 80, textAlignVertical: "top" },
  saveBtn: { backgroundColor: "#9f1239", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});
