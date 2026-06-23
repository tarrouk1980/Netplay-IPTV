import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../services/api";
import useAuthStore from "../../store/authStore";

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

export default function SOSContractScreen({ navigation, route }) {
  const orderId = route.params?.orderId;
  const currentUser = useAuthStore((s) => s.user);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [signing, setSigning] = useState(false);

  const load = useCallback(() => {
    if (!orderId) { setLoading(false); return; }
    setLoading(true);
    api.get(`/api/sos/${orderId}`)
      .then((r) => { setOrder(r.data.order); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  if (!orderId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contrat d'intervention</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <Text style={{ color: COLORS.muted }}>Aucune commande sélectionnée.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, textAlign: "center", marginBottom: 16 }}>
            Impossible de charger le contrat.
          </Text>
          <TouchableOpacity onPress={load} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const meta = order.metadata || {};
  const confirmations = meta.confirmations || {};
  const vehicleInfo = meta.vehicleInfo || {};
  const sosType = meta.sosType;
  const total = Number(order.finalPrice ?? order.price ?? 0);
  const createdDate = new Date(order.createdAt);

  const isClient = currentUser?.id === order.client?.id;
  const isProvider = currentUser?.id === order.provider?.id;
  const clientSigne = !!confirmations.client;
  const depanneurSigne = !!confirmations.provider;
  const canConfirm = clientSigne && depanneurSigne;
  const myRoleSigned = isClient ? clientSigne : isProvider ? depanneurSigne : false;

  const handleSign = () => {
    if (!isClient && !isProvider) return;
    Alert.alert(
      "Confirmer la signature",
      isClient
        ? "Vous allez confirmer cette intervention en tant que client."
        : "Vous allez confirmer cette intervention en tant que dépanneur.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Signer",
          onPress: async () => {
            setSigning(true);
            try {
              const res = await api.post(`/api/sos/${orderId}/complete`);
              setOrder(res.data.order);
              if (res.data.bothConfirmed) {
                Alert.alert("Contrat confirmé", "Les deux parties ont confirmé l'intervention.");
              }
            } catch {
              Alert.alert("Erreur", "Impossible d'enregistrer la signature. Réessayez.");
            } finally {
              setSigning(false);
            }
          },
        },
      ]
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
        <View style={styles.contractHeader}>
          <View style={styles.logoArea}>
            <Text style={styles.logoText}>🛻 EasyWay SOS</Text>
          </View>
          <Text style={styles.contractTitle}>Contrat de dépannage</Text>
          <View style={styles.contractMeta}>
            <Text style={styles.contractMetaText}>N° {order.id}</Text>
            <Text style={styles.contractMetaText}>
              Le {createdDate.toLocaleDateString("fr-FR")} à {createdDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parties contractantes</Text>
          <View style={styles.partiesRow}>
            <View style={[styles.partyCard, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.partyRole}>👤 Client</Text>
              <Text style={styles.partyName}>{order.client?.name || '—'}</Text>
              <Text style={styles.partyDetail}>{order.client?.phone || '—'}</Text>
            </View>
            <View style={[styles.partyCard, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.partyRole}>🛻 Dépanneur</Text>
              <Text style={styles.partyName}>{order.provider?.name || 'Non assigné'}</Text>
              <Text style={styles.partyDetail}>{order.provider?.phone || '—'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de l'intervention</Text>
          <View style={styles.detailsBox}>
            {!!sosType && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type de panne</Text>
                  <Text style={styles.detailValue}>{sosType}</Text>
                </View>
                <View style={styles.divider} />
              </>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Adresse</Text>
              <Text style={styles.detailValue}>{order.originAddress || '—'}</Text>
            </View>
            {!!(vehicleInfo.brand || vehicleInfo.model || vehicleInfo.plate) && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Véhicule</Text>
                  <Text style={styles.detailValue}>
                    {[vehicleInfo.brand, vehicleInfo.model, vehicleInfo.plate].filter(Boolean).join(' - ')}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Devis financier</Text>
          <View style={styles.priceBox}>
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>{total.toFixed(2)} TND</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Signatures</Text>
          <View style={styles.signaturesRow}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureRole}>Client</Text>
              {clientSigne ? (
                <View style={styles.signedArea}>
                  <Text style={styles.signedText}>✅ Signé</Text>
                  <Text style={styles.signedDate}>{new Date(confirmations.client).toLocaleDateString("fr-FR")}</Text>
                </View>
              ) : isClient ? (
                <TouchableOpacity style={styles.signButton} onPress={handleSign} disabled={signing}>
                  {signing ? <ActivityIndicator color={COLORS.primary} size="small" /> : <Text style={styles.signButtonText}>Signer</Text>}
                </TouchableOpacity>
              ) : (
                <Text style={styles.signedDate}>En attente</Text>
              )}
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureRole}>🛻 Dépanneur</Text>
              {depanneurSigne ? (
                <View style={styles.signedArea}>
                  <Text style={styles.signedText}>✅ Signé</Text>
                  <Text style={styles.signedDate}>{new Date(confirmations.provider).toLocaleDateString("fr-FR")}</Text>
                </View>
              ) : isProvider ? (
                <TouchableOpacity style={styles.signButton} onPress={handleSign} disabled={signing}>
                  {signing ? <ActivityIndicator color={COLORS.primary} size="small" /> : <Text style={styles.signButtonText}>Signer</Text>}
                </TouchableOpacity>
              ) : (
                <Text style={styles.signedDate}>En attente</Text>
              )}
            </View>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={styles.footer}>
        {canConfirm ? (
          <Text style={[styles.signHint, { color: COLORS.success }]}>
            Contrat confirmé par les deux parties
          </Text>
        ) : myRoleSigned ? (
          <Text style={styles.signHint}>En attente de la signature de l'autre partie</Text>
        ) : (
          <Text style={styles.signHint}>Les deux parties doivent signer pour confirmer</Text>
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
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
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "700",
  },
  signHint: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: "center",
  },
});
