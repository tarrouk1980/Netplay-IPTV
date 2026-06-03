import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COLORS = {
  background: "#0A0A0F",
  surface: "#1C1C28",
  primary: "#F5A623",
  text: "#FFFFFF",
  muted: "#8E8E9A",
  border: "#2C2C3A",
};

const CATEGORIES = ["Général", "Taxi", "Livraison", "SOS", "Paiement", "Compte"];

const ALL_FAQS = [
  {
    id: 1,
    category: "Général",
    question: "Comment créer un compte EasyWay ?",
    answer:
      "Téléchargez l'application EasyWay, appuyez sur \"S'inscrire\", entrez votre numéro de téléphone et suivez les étapes de vérification. Votre compte sera actif en moins de 2 minutes.",
  },
  {
    id: 2,
    category: "Général",
    question: "L'application est-elle disponible en dehors de Tunis ?",
    answer:
      "EasyWay est actuellement disponible à Tunis, Sfax et Sousse. Nous étendons notre couverture à d'autres villes progressivement. Restez connecté pour les annonces !",
  },
  {
    id: 3,
    category: "Taxi",
    question: "Comment annuler une course de taxi ?",
    answer:
      "Vous pouvez annuler gratuitement dans les 2 minutes suivant la confirmation. Passé ce délai, des frais d'annulation de 2 TND peuvent s'appliquer si le chauffeur est déjà en route.",
  },
  {
    id: 4,
    category: "Taxi",
    question: "Comment signaler un problème avec un chauffeur ?",
    answer:
      "Après votre course, appuyez sur \"Signaler un problème\" dans l'historique des courses. Notre équipe traitera votre signalement dans les 24 heures.",
  },
  {
    id: 5,
    category: "Livraison",
    question: "Quel est le délai moyen de livraison ?",
    answer:
      "Le délai moyen est de 30 à 45 minutes selon votre localisation et la disponibilité des livreurs. Vous pouvez suivre votre commande en temps réel sur la carte.",
  },
  {
    id: 6,
    category: "Paiement",
    question: "Quels modes de paiement sont acceptés ?",
    answer:
      "Nous acceptons le paiement en espèces, par carte bancaire (Visa, Mastercard) et via le portefeuille EasyWay. Vous pouvez recharger votre portefeuille depuis l'onglet Paiement.",
  },
  {
    id: 7,
    category: "SOS",
    question: "Comment utiliser la fonction SOS d'urgence ?",
    answer:
      "En cas d'urgence lors d'une course, appuyez longuement sur le bouton SOS rouge dans l'application. Un alerte sera envoyée à vos contacts d'urgence et à notre équipe de sécurité.",
  },
  {
    id: 8,
    category: "Compte",
    question: "Comment modifier mes informations personnelles ?",
    answer:
      "Rendez-vous dans Profil > Paramètres du compte > Modifier le profil. Vous pouvez mettre à jour votre nom, photo, numéro de téléphone et adresse email.",
  },
];

function FaqItem({ item }) {
  const [expanded, setExpanded] = useState(false);
  const [helpful, setHelpful] = useState(null);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <View style={styles.faqCard}>
      <TouchableOpacity onPress={toggle} style={styles.faqQuestion} activeOpacity={0.7}>
        <Text style={styles.faqQuestionText}>{item.question}</Text>
        <Text style={styles.faqChevron}>{expanded ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{item.answer}</Text>
          <View style={styles.helpfulRow}>
            <Text style={styles.helpfulLabel}>Utile ?</Text>
            <TouchableOpacity
              style={[styles.helpfulBtn, helpful === "yes" && styles.helpfulBtnActive]}
              onPress={() => setHelpful("yes")}
            >
              <Text style={[styles.helpfulBtnText, helpful === "yes" && styles.helpfulBtnTextActive]}>
                👍 Oui
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.helpfulBtn, helpful === "no" && styles.helpfulBtnActive]}
              onPress={() => setHelpful("no")}
            >
              <Text style={[styles.helpfulBtnText, helpful === "no" && styles.helpfulBtnTextActive]}>
                👎 Non
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

export default function HelpCenterScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Général");

  const filtered = ALL_FAQS.filter((faq) => {
    const matchesCategory = faq.category === selectedCategory;
    const matchesSearch =
      search.trim() === "" ||
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCall = () => {
    Alert.alert("Support téléphonique", "Numéro : +216 71 000 000", [
      { text: "Fermer" },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Centre d'aide</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une question..."
            placeholderTextColor={COLORS.muted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, selectedCategory === cat && styles.chipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions fréquentes</Text>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🤔</Text>
              <Text style={styles.emptyText}>Aucun résultat trouvé</Text>
            </View>
          ) : (
            filtered.map((faq) => <FaqItem key={faq.id} item={faq} />)
          )}
        </View>

        {/* Contact section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacter le support</Text>

          <TouchableOpacity style={styles.contactCard} activeOpacity={0.7}>
            <View style={styles.contactIconWrap}>
              <Text style={styles.contactIcon}>💬</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Chat en direct</Text>
              <Text style={styles.contactSub}>Réponse en moins de 5 minutes</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleCall} activeOpacity={0.7}>
            <View style={styles.contactIconWrap}>
              <Text style={styles.contactIcon}>📞</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Appeler le support</Text>
              <Text style={styles.contactSub}>Disponible 7j/7 de 8h à 22h</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} activeOpacity={0.7}>
            <View style={styles.contactIconWrap}>
              <Text style={styles.contactIcon}>📧</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Envoyer un email</Text>
              <Text style={styles.contactSub}>support@easyway.tn</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 22,
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  scroll: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: COLORS.text,
    fontSize: 15,
  },
  clearBtn: {
    color: COLORS.muted,
    fontSize: 16,
    paddingLeft: 8,
  },
  chipsScroll: {
    marginTop: 14,
  },
  chipsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#000",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  faqCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginRight: 12,
  },
  faqChevron: {
    color: COLORS.primary,
    fontSize: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  faqAnswerText: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 20,
  },
  helpfulRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  helpfulLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginRight: 4,
  },
  helpfulBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  helpfulBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(245,166,35,0.15)",
  },
  helpfulBtnText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  helpfulBtnTextActive: {
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.muted,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contactIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(245,166,35,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  contactIcon: {
    fontSize: 20,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  contactSub: {
    fontSize: 12,
    color: COLORS.muted,
  },
  contactArrow: {
    fontSize: 22,
    color: COLORS.muted,
  },
});
