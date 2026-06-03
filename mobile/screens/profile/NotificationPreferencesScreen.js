import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const COLORS = {
  background: "#0A0A0F",
  surface: "#1C1C28",
  primary: "#F5A623",
  text: "#FFFFFF",
  muted: "#8E8E9A",
  border: "#2C2C3A",
};

const SECTIONS = [
  {
    title: "Courses & Livraisons",
    items: [
      {
        key: "nouvelles_courses",
        emoji: "🚗",
        label: "Nouvelles courses",
        description: "Soyez notifié des nouvelles demandes de course",
      },
      {
        key: "maj_statut",
        emoji: "📍",
        label: "Mises à jour statut",
        description: "Suivez en temps réel le statut de vos commandes",
      },
      {
        key: "chauffeur_assigne",
        emoji: "👤",
        label: "Chauffeur assigné",
        description: "Recevez une alerte quand un chauffeur est assigné",
      },
    ],
  },
  {
    title: "Paiements",
    items: [
      {
        key: "confirmation_paiement",
        emoji: "✅",
        label: "Confirmation paiement",
        description: "Confirmation immédiate de chaque transaction",
      },
      {
        key: "recus",
        emoji: "🧾",
        label: "Reçus",
        description: "Recevez vos reçus après chaque paiement",
      },
      {
        key: "remboursements",
        emoji: "💰",
        label: "Remboursements",
        description: "Soyez informé de vos remboursements en cours",
      },
    ],
  },
  {
    title: "Promotions",
    items: [
      {
        key: "offres_speciales",
        emoji: "🎁",
        label: "Offres spéciales",
        description: "Profitez des meilleures offres personnalisées",
      },
      {
        key: "codes_promo",
        emoji: "🏷️",
        label: "Codes promo",
        description: "Recevez des codes de réduction exclusifs",
      },
      {
        key: "nouveautes",
        emoji: "✨",
        label: "Nouveautés",
        description: "Découvrez les nouvelles fonctionnalités en avant-première",
      },
    ],
  },
  {
    title: "Système",
    items: [
      {
        key: "mises_a_jour_app",
        emoji: "🔄",
        label: "Mises à jour app",
        description: "Restez informé des dernières mises à jour",
      },
      {
        key: "alertes_securite",
        emoji: "🔒",
        label: "Alertes sécurité",
        description: "Recevez des alertes en cas d'activité suspecte",
      },
    ],
  },
];

const ALL_KEYS = SECTIONS.flatMap((s) => s.items.map((i) => i.key));

const buildDefault = () => {
  const obj = {};
  ALL_KEYS.forEach((k) => { obj[k] = true; });
  return obj;
};

export default function NotificationPreferencesScreen() {
  const navigation = useNavigation();
  const [prefs, setPrefs] = useState(buildDefault());

  const toggle = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const enableAll = () => {
    const obj = {};
    ALL_KEYS.forEach((k) => { obj[k] = true; });
    setPrefs(obj);
  };

  const disableAll = () => {
    const obj = {};
    ALL_KEYS.forEach((k) => { obj[k] = false; });
    setPrefs(obj);
  };

  const save = () => {
    Alert.alert(
      "Préférences sauvegardées",
      "Vos préférences de notifications ont été enregistrées avec succès.",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Préférences notifications</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Top action buttons */}
      <View style={styles.topActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={enableAll}>
          <Text style={styles.actionBtnText}>Tout activer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOutline]} onPress={disableAll}>
          <Text style={[styles.actionBtnText, styles.actionBtnTextOutline]}>Tout désactiver</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, index) => (
                <View
                  key={item.key}
                  style={[
                    styles.row,
                    index < section.items.length - 1 && styles.rowBorder,
                  ]}
                >
                  <Text style={styles.rowEmoji}>{item.emoji}</Text>
                  <View style={styles.rowContent}>
                    <Text style={styles.rowLabel}>{item.label}</Text>
                    <Text style={styles.rowDesc}>{item.description}</Text>
                  </View>
                  <Switch
                    value={prefs[item.key]}
                    onValueChange={() => toggle(item.key)}
                    trackColor={{ false: COLORS.border, true: COLORS.primary }}
                    thumbColor={prefs[item.key] ? "#fff" : COLORS.muted}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.saveContainer}>
          <TouchableOpacity style={styles.saveBtn} onPress={save}>
            <Text style={styles.saveBtnText}>Enregistrer les préférences</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    alignItems: "center",
  },
  backArrow: {
    fontSize: 22,
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
  },
  topActions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  actionBtnOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.background,
  },
  actionBtnTextOutline: {
    color: COLORS.muted,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
    marginRight: 10,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 16,
  },
  saveContainer: {
    marginTop: 8,
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.background,
  },
});
