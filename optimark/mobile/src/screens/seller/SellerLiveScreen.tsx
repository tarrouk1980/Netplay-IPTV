import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert, Modal, ScrollView
} from "react-native";
import api from "../../api";

export default function SellerLiveScreen() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const [sRes, pRes] = await Promise.all([
      api.get("/live/my"),
      api.get("/vendors/products"),
    ]);
    setSessions(sRes.data?.data || []);
    setProducts(pRes.data?.data || []);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const createSession = async () => {
    if (!title.trim()) { Alert.alert("Erreur", "Donnez un titre à votre live."); return; }
    setCreating(true);
    try {
      await api.post("/live", { title: title.trim(), products: selectedProducts });
      setShowForm(false);
      setTitle("");
      setSelectedProducts([]);
      load();
      Alert.alert("Live créé !", "Votre session live a été créée. Partagez le lien avec votre audience !");
    } catch {
      Alert.alert("Erreur", "Impossible de créer le live.");
    }
    setCreating(false);
  };

  const endSession = (id: string) => {
    Alert.alert("Terminer le live", "Voulez-vous terminer cette session ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Terminer", style: "destructive", onPress: async () => {
          await api.patch(`/live/${id}/end`).catch(() => {});
          load();
        }
      }
    ]);
  };

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  if (loading) return <ActivityIndicator color="#9f1239" style={{ flex: 1 }} />;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>🔴 Live Commerce</Text>
          <Text style={{ color: "#fecdd3", fontSize: 12 }}>Vendez en direct à vos clients</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(true)}>
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 20 }}>+</Text>
        </TouchableOpacity>
      </View>

      {sessions.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🎥</Text>
          <Text style={{ color: "#334155", fontWeight: "700", fontSize: 16 }}>Aucune session live</Text>
          <Text style={{ color: "#94a3b8", fontSize: 13, marginTop: 4, textAlign: "center" }}>Créez votre premier live pour vendre en direct !</Text>
          <TouchableOpacity style={s.startBtn} onPress={() => setShowForm(true)}>
            <Text style={{ color: "#fff", fontWeight: "800" }}>🔴 Démarrer un live</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardRow}>
                <View style={[s.liveDot, { backgroundColor: item.isActive ? "#ef4444" : "#94a3b8" }]} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.sessionTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={s.sessionMeta}>
                    {new Date(item.createdAt).toLocaleDateString("fr-TN")} · {item.viewerCount || 0} spectateurs
                  </Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: item.isActive ? "#fef2f2" : "#f1f5f9" }]}>
                  <Text style={{ color: item.isActive ? "#ef4444" : "#94a3b8", fontSize: 11, fontWeight: "800" }}>
                    {item.isActive ? "EN DIRECT" : "TERMINÉ"}
                  </Text>
                </View>
              </View>

              {item.products?.length > 0 && (
                <Text style={s.productsLine} numberOfLines={1}>
                  Produits : {item.products.map((p: any) => p.title || p.id).join(", ")}
                </Text>
              )}

              {item.isActive && (
                <TouchableOpacity style={s.endBtn} onPress={() => endSession(item.id)}>
                  <Text style={{ color: "#dc2626", fontWeight: "700", fontSize: 13 }}>⏹ Terminer le live</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}

      {/* Create modal */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>🔴 Nouveau live</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={{ fontSize: 22, color: "#64748b" }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.label}>Titre du live *</Text>
              <TextInput
                style={s.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Soldes de fin de saison !"
                placeholderTextColor="#94a3b8"
              />

              <Text style={s.label}>Produits à mettre en avant ({selectedProducts.length} sélectionnés)</Text>
              <View style={s.productList}>
                {products.slice(0, 20).map(p => (
                  <TouchableOpacity key={p.id}
                    style={[s.productItem, selectedProducts.includes(p.id) && s.productItemActive]}
                    onPress={() => toggleProduct(p.id)}>
                    <Text style={[s.productItemText, selectedProducts.includes(p.id) && { color: "#fff" }]} numberOfLines={1}>
                      {selectedProducts.includes(p.id) ? "✓ " : ""}{p.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={[s.submitBtn, creating && { opacity: 0.6 }]} onPress={createSession} disabled={creating}>
                {creating
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>🔴 Démarrer le live</Text>}
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
  cardRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  liveDot: { width: 12, height: 12, borderRadius: 6 },
  sessionTitle: { fontSize: 15, fontWeight: "800", color: "#1e293b" },
  sessionMeta: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  productsLine: { fontSize: 11, color: "#64748b", marginBottom: 8 },
  endBtn: { borderRadius: 10, paddingVertical: 10, alignItems: "center", backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fca5a5" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#1e293b" },
  label: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 8, marginTop: 14 },
  input: { backgroundColor: "#f1f5f9", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#1e293b" },
  productList: { borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", overflow: "hidden" },
  productItem: { paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  productItemActive: { backgroundColor: "#9f1239" },
  productItemText: { fontSize: 13, fontWeight: "600", color: "#1e293b" },
  submitBtn: { backgroundColor: "#9f1239", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 24, marginBottom: 8 },
});
