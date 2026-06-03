import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  background: "#0A0A0F",
  surface: "#1C1C28",
  primary: "#F5A623",
  text: "#FFFFFF",
  muted: "#8E8E9A",
  border: "#2C2C3A",
  success: "#4CAF50",
  error: "#F44336",
};

const mockContract = {
  numero: "CNT-2024-00847",
  date: "03/06/2026",
  heure: "14h35",
  client: {
    nom: "A*** B***",
    telephone: "+216 9* *** **74",
    email: "a***@gmail.com",
  },
  depanneur: {
    nom: "Khalil Mansouri",
    telephone: "+216 98 456 789",
    societe: "Mansouri Dépannage 🛻",
    matricule: "DEP-2891",
  },
  service: {
    typePanne: "Panne moteur / Démarrage impossible",
    adresse: "Av. Habib Bourguiba, Tunis 1000",
    vehicule: "Peugeot 308 - 156 TUN 8834",
    dateIntervention: "03/06/2026",
    heureIntervention: "15h00",
  },
  prix: {
    mainOeuvre: 80.0,
    deplacement: 25.0,
    pieces: 35.0,
    tva: 14.4,
    total: 154.4,
  },
  conditions: [
    "Le dépanneur s'engage à intervenir dans un délai maximum de 45 minutes à compter de la signature du présent contrat.",
    "Les pièces fournies bénéficient d'une garantie de 30 jours. La main-d'œuvre est garantie pour la durée de la prestation définie.",
    "En cas de litige, EasyWay SOS agit en tant que médiateur. Le client peut déposer une réclamation dans les 48h suivant la prestation.",
  ],
};

export default function SOSContractScreen({ navigation }) {
  const [clientSigne, setClientSigne] = useState(false);
  const [depanneurSigne, setDepanneurSigne] = useState(false);

  const canConfirm = clientSigne && depanneurSigne;

  const handleSign = (role) => {
    Alert.alert(
      "Confirmer la signature",
      role === "client"
        ? "Vous allez signer ce contrat en tant que client."
        : "Vous allez signer ce contrat en tant que dépanneur.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Signer",
          onPress: () => {
            if (role === "client") setClientSigne(true);
            else setDepanneurSigne(true);
          },
        },
      ]
    );
  };

  const handleConfirm = () => {
    Alert.alert(
      "Contrat confirmé",
      "Le contrat d'intervention a été confirmé avec succès. Une copie a été envoyée par email."
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contrat d'intervention</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Contract Header */}
        <View style={styles.contractHeader}>
          <View style={styles.logoArea}>
            <Text style={styles.logoText}>🛻 EasyWay SOS</Text>
          </View>
          <Text style={styles.contractTitle}>Contrat de dépannage</Text>
          <View style={styles.contractMeta}>
            <Text style={styles.contractMetaText}>N° {mockContract.numero}</Text>
            <Text style={styles.contractMetaText}>
              Le {mockContract.date} à {mockContract.heure}
            </Text>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parties contractantes</Text>
          <View style={styles.partiesRow}>
            <View style={[styles.partyCard, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.partyRole}>👤 Client</Text>
              <Text style={styles.partyName}>{mockContract.client.nom}</Text>
              <Text style={styles.partyDetail}>{mockContract.client.telephone}</Text>
              <Text style={styles.partyDetail}>{mockContract.client.email}</Text>
            </View>
            <View style={[styles.partyCard, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.partyRole}>🛻 Dépanneur</Text>
              <Text style={styles.partyName}>{mockContract.depanneur.nom}</Text>
              <Text style={styles.partyDetail}>{mockContract.depanneur.societe}</Text>
              <Text style={styles.partyDetail}>{mockContract.depanneur.telephone}</Text>
            </View>
          </View>
        </View>

        {/* Service Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de l'intervention</Text>
          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type de panne</Text>
              <Text style={styles.detailValue}>{mockContract.service.typePanne}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Adresse</Text>
              <Text style={styles.detailValue}>{mockContract.service.adresse}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Véhicule</Text>
              <Text style={styles.detailValue}>{mockContract.service.vehicule}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date / Heure</Text>
              <Text style={styles.detailValue}>
                {mockContract.service.dateIntervention} à{" "}
                {mockContract.service.heureIntervention}
              </Text>
            </View>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Devis financier</Text>
          <View style={styles.priceBox}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Main d'œuvre</Text>
              <Text style={styles.priceValue}>{mockContract.prix.mainOeuvre.toFixed(2)} TND</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Déplacement</Text>
              <Text style={styles.priceValue}>{mockContract.prix.deplacement.toFixed(2)} TND</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Pièces détachées</Text>
              <Text style={styles.priceValue}>{mockContract.prix.pieces.toFixed(2)} TND</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>TVA (10%)</Text>
              <Text style={styles.priceValue}>{mockContract.prix.tva.toFixed(2)} TND</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>{mockContract.prix.total.toFixed(2)} TND</Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conditions générales</Text>
          <View style={styles.termsBox}>
            {mockContract.conditions.map((cond, index) => (
              <View key={index} style={styles.termItem}>
                <Text style={styles.termBullet}>{index + 1}.</Text>
                <Text style={styles.termText}>{cond}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Signature Area */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Signatures</Text>
          <View style={styles.signaturesRow}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureRole}>Client</Text>
              {clientSigne ? (
                <View style={styles.signedArea}>
                  <Text style={styles.signedText}>✅ Signé</Text>
                  <Text style={styles.signedDate}>{mockContract.date}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.signButton}
                  onPress={() => handleSign("client")}
                >
                  <Text style={styles.signButtonText}>Signer</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureRole}>🛻 Dépanneur</Text>
              {depanneurSigne ? (
                <View style={styles.signedArea}>
                  <Text style={styles.signedText}>✅ Signé</Text>
                  <Text style={styles.signedDate}>{mockContract.date}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.signButton}
                  onPress={() => handleSign("depanneur")}
                >
                  <Text style={styles.signButtonText}>Signer</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!canConfirm}
        >
          <Text style={[styles.confirmButtonText, !canConfirm && styles.confirmButtonTextDisabled]}>
            Confirmer le contrat
          </Text>
        </TouchableOpacity>
        {!canConfirm && (
          <Text style={styles.signHint}>
            Les deux parties doivent signer pour confirmer
          </Text>
        )}
      </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow: {
    color: COLORS.text,
    fontSize: 22,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  contractHeader: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoArea: {
    backgroundColor: COLORS.primary + "22",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + "44",
  },
  logoText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "800",
  },
  contractTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  contractMeta: {
    alignItems: "center",
    gap: 4,
  },
  contractMetaText: {
    color: COLORS.muted,
    fontSize: 13,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  partiesRow: {
    flexDirection: "row",
  },
  partyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  partyRole: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  partyName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  partyDetail: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 2,
  },
  detailsBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailRow: {
    paddingVertical: 8,
  },
  detailLabel: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  priceBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  priceLabel: {
    color: COLORS.muted,
    fontSize: 14,
  },
  priceValue: {
    color: COLORS.text,
    fontSize: 14,
  },
  totalLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  totalValue: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "800",
  },
  termsBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  termItem: {
    flexDirection: "row",
    gap: 8,
  },
  termBullet: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
    minWidth: 18,
  },
  termText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  signaturesRow: {
    flexDirection: "row",
    gap: 12,
  },
  signatureBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    minHeight: 110,
    justifyContent: "space-between",
  },
  signatureRole: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  signButton: {
    backgroundColor: COLORS.primary + "22",
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  signButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  signedArea: {
    alignItems: "center",
  },
  signedText: {
    color: COLORS.success,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  signedDate: {
    color: COLORS.muted,
    fontSize: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  confirmButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "700",
  },
  confirmButtonTextDisabled: {
    color: COLORS.muted,
  },
  signHint: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
});
