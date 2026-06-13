import React, { useCallback, useState } from "react";
import {
  View, Text, Switch, ScrollView, ActivityIndicator,
  TouchableOpacity, StyleSheet, Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../lib/api";

const ROSE = "#9f1239";

const PREFS = [
  { key: "orders", label: "Commandes", sub: "Confirmations, expéditions, livraisons", icon: "📦" },
  { key: "messages", label: "Messages", sub: "Nouveaux messages de vendeurs", icon: "💬" },
  { key: "promos", label: "Promotions", sub: "Ventes flash, codes promo, offres", icon: "🏷️" },
  { key: "priceAlerts", label: "Alertes de prix", sub: "Baisses de prix sur vos favoris", icon: "🔔" },
  { key: "system", label: "Système", sub: "Mises à jour de compte, sécurité", icon: "⚙️" },
];

export default function NotifPreferencesScreen() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    orders: true, messages: true, promos: true, priceAlerts: true, system: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => {
    api.get("/notifications/preferences")
      .then(r => { if (r.data?.data) setPrefs(p => ({ ...p, ...r.data.data })); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const toggle = (key: string, val: boolean) => {
    setPrefs(p => ({ ...p, [key]: val }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.patch("/notifications/preferences", prefs);
      Alert.alert("✓ Enregistré", "Vos préférences ont été mises à jour.");
    } catch {
      Alert.alert("Erreur", "Impossible de sauvegarder.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <View style={s.center}><ActivityIndicator color={ROSE} size="large" /></View>
  );

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>Choisissez les notifications que vous souhaitez recevoir.</Text>

      <View style={s.card}>
        {PREFS.map((p, i) => (
          <View key={p.key} style={[s.row, i < PREFS.length - 1 && s.rowBorder]}>
            <Text style={s.icon}>{p.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>{p.label}</Text>
              <Text style={s.sub}>{p.sub}</Text>
            </View>
            <Switch
              value={prefs[p.key] !== false}
              onValueChange={v => toggle(p.key, v)}
              trackColor={{ false: "#e2e8f0", true: "#fda4af" }}
              thumbColor={prefs[p.key] !== false ? ROSE : "#94a3b8"}
            />
          </View>
        ))}
      </View>

      <TouchableOpacity style={[s.saveBtn, saving && s.saveBtnDisabled]} onPress={save} disabled={saving}>
        <Text style={s.saveBtnText}>{saving ? "Sauvegarde..." : "Enregistrer les préférences"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { padding: 16, gap: 16 },
  title: { fontSize: 13, color: "#64748b", lineHeight: 18 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  icon: { fontSize: 22, width: 28, textAlign: "center" },
  label: { fontSize: 14, fontWeight: "700", color: "#1e293b", marginBottom: 2 },
  sub: { fontSize: 12, color: "#94a3b8" },
  saveBtn: {
    backgroundColor: ROSE,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
