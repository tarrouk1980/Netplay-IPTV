import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from "react-native";
import api from "../../api";

const ROSE = "#9f1239";
const MAX = 280;

const TEMPLATES = [
  { emoji: "🎉", label: "Nouvelle collection", text: "🎉 Notre nouvelle collection est arrivée ! Découvrez nos dernières nouveautés et profitez de 10% de réduction sur votre première commande." },
  { emoji: "⚡", label: "Vente flash", text: "⚡ VENTE FLASH — 48h seulement ! Jusqu'à -30% sur une sélection de produits. Ne manquez pas cette opportunité !" },
  { emoji: "🎁", label: "Code promo", text: "🎁 Cadeau exclusif pour nos abonnés ! Utilisez le code MERCI10 pour bénéficier de 10% de réduction sur votre prochaine commande." },
  { emoji: "📦", label: "Nouveau produit", text: "📦 Nouveau produit disponible ! Venez découvrir notre dernière nouveauté, déjà plébiscitée par nos clients." },
  { emoji: "🙏", label: "Remerciement", text: "🙏 Merci pour votre fidélité ! Pour vous remercier, nous vous offrons la livraison gratuite sur votre prochain achat." },
];

export default function SellerBroadcastScreen({ navigation }: any) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [audienceCount, setAudienceCount] = useState<number | null>(null);

  useEffect(() => {
    api.get("/vendors/store-visits").then(r => {
      const data = r.data?.data;
      setAudienceCount(data?.followerCount ?? data?.visitorCount ?? null);
    }).catch(() => {});
  }, []);

  const send = async () => {
    if (!message.trim()) return;
    Alert.alert(
      "Envoyer le message",
      `Votre message sera envoyé à ${audienceCount ?? "vos"} abonnés. Continuer ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Envoyer",
          onPress: async () => {
            setSending(true);
            try {
              await api.post("/vendors/broadcast", { message });
              Alert.alert("✓ Envoyé !", "Votre message a été diffusé à vos abonnés.", [
                { text: "OK", onPress: () => { setMessage(""); navigation.goBack(); } }
              ]);
            } catch (e: any) {
              Alert.alert("Erreur", e.response?.data?.message || "Impossible d'envoyer le message.");
            } finally {
              setSending(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      {/* Audience banner */}
      <View style={s.audienceBanner}>
        <Text style={s.audienceIcon}>📣</Text>
        <View>
          <Text style={s.audienceTitle}>Diffuser un message</Text>
          <Text style={s.audienceSub}>
            {audienceCount !== null ? `${audienceCount} abonnés recevront votre message` : "Chargement de l'audience..."}
          </Text>
        </View>
      </View>

      {/* Templates */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>Modèles rapides</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
          {TEMPLATES.map((t, i) => (
            <TouchableOpacity key={i} style={s.templateBtn} onPress={() => setMessage(t.text)}>
              <Text style={{ fontSize: 18 }}>{t.emoji}</Text>
              <Text style={s.templateLabel}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Composer */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>Votre message</Text>
        <View style={s.composeBox}>
          <TextInput
            style={s.input}
            value={message}
            onChangeText={t => setMessage(t.slice(0, MAX))}
            placeholder="Rédigez votre message..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <View style={s.charRow}>
            <Text style={[s.charCount, message.length > MAX * 0.9 && { color: "#ef4444" }]}>
              {message.length}/{MAX}
            </Text>
          </View>
        </View>
      </View>

      {/* Preview */}
      {message.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionLabel}>Aperçu</Text>
          <View style={s.preview}>
            <View style={s.previewBubble}>
              <Text style={s.previewSender}>📦 Votre boutique</Text>
              <Text style={s.previewText}>{message}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Send */}
      <View style={{ padding: 16 }}>
        <TouchableOpacity
          style={[s.sendBtn, (!message.trim() || sending) && { opacity: 0.5 }]}
          onPress={send}
          disabled={!message.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.sendText}>📣 Diffuser maintenant</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  audienceBanner: {
    backgroundColor: ROSE, flexDirection: "row", alignItems: "center",
    gap: 14, padding: 20, paddingTop: 24,
  },
  audienceIcon: { fontSize: 32 },
  audienceTitle: { fontSize: 17, fontWeight: "900", color: "#fff" },
  audienceSub: { fontSize: 12, color: "#fecdd3", marginTop: 2 },
  section: { padding: 16, paddingBottom: 0 },
  sectionLabel: { fontSize: 13, fontWeight: "800", color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  templateBtn: { backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, alignItems: "center", gap: 4, borderWidth: 1, borderColor: "#f1f5f9", minWidth: 80 },
  templateLabel: { fontSize: 11, fontWeight: "700", color: "#1e293b", textAlign: "center" },
  composeBox: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", overflow: "hidden" },
  input: { padding: 16, fontSize: 15, color: "#1e293b", minHeight: 140 },
  charRow: { paddingHorizontal: 16, paddingBottom: 12, alignItems: "flex-end" },
  charCount: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },
  preview: { backgroundColor: "#f1f5f9", borderRadius: 16, padding: 16 },
  previewBubble: { backgroundColor: "#fff", borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: ROSE },
  previewSender: { fontSize: 11, fontWeight: "800", color: ROSE, marginBottom: 6 },
  previewText: { fontSize: 14, color: "#1e293b", lineHeight: 20 },
  sendBtn: { backgroundColor: ROSE, borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  sendText: { color: "#fff", fontSize: 16, fontWeight: "900" },
});
