import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, TextInput, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Linking,
} from "react-native";

const ROSE = "#9f1239";

const FAQ = [
  { q: "Comment passer une commande ?", a: "Parcourez le catalogue, ajoutez au panier et finalisez votre commande depuis l'écran Panier." },
  { q: "Quels sont les délais de livraison ?", a: "Généralement 2-5 jours ouvrables en Tunisie. Vérifiez la fiche produit pour plus de détails." },
  { q: "Comment retourner un produit ?", a: "Depuis votre commande livrée, tapez \"Demander un retour\" dans les 14 jours suivant la livraison." },
  { q: "Comment contacter un vendeur ?", a: "Depuis l'écran Messages, vous pouvez envoyer un message directement à n'importe quel vendeur." },
  { q: "Comment devenir vendeur ?", a: "Dans votre profil, appuyez sur \"Devenir vendeur\" pour activer les fonctionnalités vendeur." },
];

const SUBJECTS = ["Commande", "Produit", "Retour", "Compte", "Signalement", "Autre"];

export default function SupportScreen() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [tab, setTab] = useState<"faq" | "contact">("faq");
  const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS[0], message: "" });
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!form.name.trim() || !form.message.trim()) {
      Alert.alert("Champs requis", "Nom et message sont obligatoires.");
      return;
    }
    setSending(true);
    // Simulate send
    await new Promise(r => setTimeout(r, 800));
    setSending(false);
    Alert.alert("✓ Envoyé !", "Notre équipe vous répondra dans les 24h.", [{ text: "OK" }]);
    setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Contact cards */}
      <View style={s.contactRow}>
        <TouchableOpacity style={s.contactCard} onPress={() => Linking.openURL("mailto:support@optimark.tn")}>
          <Text style={s.contactIcon}>📧</Text>
          <Text style={s.contactLabel}>Email</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.contactCard} onPress={() => Linking.openURL("tel:+21671000000")}>
          <Text style={s.contactIcon}>📞</Text>
          <Text style={s.contactLabel}>Appeler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.contactCard}>
          <Text style={s.contactIcon}>💬</Text>
          <Text style={s.contactLabel}>Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {[
          { key: "faq", label: "FAQ" },
          { key: "contact", label: "Nous contacter" },
        ].map(t => (
          <TouchableOpacity key={t.key} style={[s.tab, tab === t.key && s.tabActive]}
            onPress={() => setTab(t.key as any)}>
            <Text style={[s.tabText, tab === t.key && s.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, gap: 8 }}>
        {tab === "faq" ? (
          FAQ.map((faq, i) => (
            <View key={i} style={s.faqCard}>
              <TouchableOpacity style={s.faqHeader} onPress={() => setOpenFaq(openFaq === i ? null : i)}>
                <Text style={s.faqQ} numberOfLines={openFaq === i ? undefined : 1}>{faq.q}</Text>
                <Text style={s.faqChevron}>{openFaq === i ? "▲" : "▼"}</Text>
              </TouchableOpacity>
              {openFaq === i && (
                <Text style={s.faqA}>{faq.a}</Text>
              )}
            </View>
          ))
        ) : (
          <View style={s.formCard}>
            {[
              { label: "Nom *", key: "name", placeholder: "Votre nom" },
              { label: "Email", key: "email", placeholder: "email@exemple.com", keyboardType: "email-address" },
            ].map(f => (
              <View key={f.key} style={s.field}>
                <Text style={s.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={s.input}
                  value={(form as any)[f.key]}
                  onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                  placeholder={f.placeholder}
                  placeholderTextColor="#94a3b8"
                  keyboardType={(f as any).keyboardType}
                />
              </View>
            ))}
            <View style={s.field}>
              <Text style={s.fieldLabel}>Sujet</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {SUBJECTS.map(s => (
                  <TouchableOpacity key={s} onPress={() => setForm(p => ({ ...p, subject: s }))}
                    style={[styles.subjectBtn, form.subject === s && styles.subjectBtnActive]}>
                    <Text style={[styles.subjectText, form.subject === s && styles.subjectTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Message *</Text>
              <TextInput
                style={[s.input, { height: 100, textAlignVertical: "top" }]}
                value={form.message}
                onChangeText={v => setForm(p => ({ ...p, message: v }))}
                placeholder="Décrivez votre problème..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
              />
            </View>
            <TouchableOpacity
              style={[s.submitBtn, (sending || !form.name.trim() || !form.message.trim()) && s.submitBtnDisabled]}
              onPress={submit}
              disabled={sending || !form.name.trim() || !form.message.trim()}
            >
              {sending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.submitText}>Envoyer</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  contactRow: { flexDirection: "row", gap: 10, padding: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  contactCard: { flex: 1, alignItems: "center", paddingVertical: 10, backgroundColor: "#f8fafc", borderRadius: 12, borderWidth: 1, borderColor: "#f1f5f9" },
  contactIcon: { fontSize: 22, marginBottom: 4 },
  contactLabel: { fontSize: 11, fontWeight: "700", color: "#64748b" },
  tabs: { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  tab: { flex: 1, paddingVertical: 11, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: ROSE },
  tabText: { fontSize: 13, fontWeight: "700", color: "#94a3b8" },
  tabTextActive: { color: ROSE },
  faqCard: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#f1f5f9", overflow: "hidden" },
  faqHeader: { flexDirection: "row", alignItems: "center", padding: 13, gap: 8 },
  faqQ: { flex: 1, fontSize: 13, fontWeight: "700", color: "#1e293b" },
  faqChevron: { fontSize: 10, color: "#94a3b8" },
  faqA: { fontSize: 13, color: "#64748b", paddingHorizontal: 13, paddingBottom: 13, lineHeight: 19 },
  formCard: { backgroundColor: "#fff", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#f1f5f9", gap: 12 },
  field: { gap: 5 },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: "#64748b" },
  input: { borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 10, padding: 11, fontSize: 14, color: "#1e293b" },
  submitBtn: { backgroundColor: ROSE, borderRadius: 12, padding: 14, alignItems: "center" },
  submitBtnDisabled: { opacity: 0.4 },
  submitText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});

const styles = StyleSheet.create({
  subjectBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: "#f1f5f9", borderWidth: 1.5, borderColor: "#e2e8f0" },
  subjectBtnActive: { backgroundColor: ROSE, borderColor: ROSE },
  subjectText: { fontSize: 12, fontWeight: "700", color: "#64748b" },
  subjectTextActive: { color: "#fff" },
});
