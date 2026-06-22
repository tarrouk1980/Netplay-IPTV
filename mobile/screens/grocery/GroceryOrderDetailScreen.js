import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COULEURS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  texte: '#FFFFFF',
  muet: '#8E8E9A',
  bordure: '#2C2C3A',
  succes: '#22C55E',
  info: '#3B82F6',
};

const ETAPE_LABELS = ['Confirmé', 'Préparation', 'En livraison', 'Livré'];
const STATUS_TO_STEP = { PENDING: 0, ACCEPTED: 1, IN_PROGRESS: 2, COMPLETED: 3, CANCELLED: 3, DISPUTED: 3 };

function fmtDateFr(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function GroceryOrderDetailScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;
  const [commande, setCommande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId) { setError(true); setLoading(false); return; }
    api.get(`/api/grocery/${orderId}`)
      .then(r => {
        const o = r.data.order;
        setCommande({
          id: o.id,
          dateCommande: fmtDateFr(o.createdAt),
          stepIdx: STATUS_TO_STEP[o.status] ?? 0,
          adresse: o.destinationAddress || o.metadata?.deliveryAddress || '—',
          articles: (o.metadata?.items || []).map((it, i) => ({
            id: it.productId || String(i),
            nom: it.name || it.label || 'Article',
            quantite: it.quantity || 1,
            prixUnitaire: it.price || 0,
          })),
          sousTotal: o.metadata?.subtotal ?? 0,
          fraisLivraison: o.metadata?.deliveryFee ?? 0,
          total: o.metadata?.total ?? o.finalPrice ?? parseFloat(o.price) || 0,
        });
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  const ETAPES = ETAPE_LABELS.map((label, i) => ({
    label,
    icone: i === 2 ? '🔄' : (i === 3 ? '📦' : '✅'),
    fait: commande ? i < commande.stepIdx : false,
    actif: commande ? i === commande.stepIdx : false,
  }));

  const signalerProbleme = () => {
    Alert.alert(
      'Signaler un problème',
      'Choisissez la nature du problème :',
      [
        { text: 'Article manquant', onPress: () => Alert.alert('Signalement envoyé', 'Notre équipe vous contactera sous peu.') },
        { text: 'Produit endommagé', onPress: () => Alert.alert('Signalement envoyé', 'Notre équipe vous contactera sous peu.') },
        { text: 'Mauvaise commande', onPress: () => Alert.alert('Signalement envoyé', 'Notre équipe vous contactera sous peu.') },
        { text: 'Retard de livraison', onPress: () => Alert.alert('Signalement envoyé', 'Notre équipe vous contactera sous peu.') },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.conteneur}>
        <ActivityIndicator color={COULEURS.primary} size="large" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (error || !commande) {
    return (
      <SafeAreaView style={styles.conteneur}>
        <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 30 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ color: COULEURS.muet, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
            Impossible de charger cette commande.
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ backgroundColor: COULEURS.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
            <Text style={{ color: COULEURS.bg, fontWeight: '700' }}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.conteneur}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.entete}>
          <Text style={styles.titre}>Détail de commande</Text>
          <Text style={styles.idCommande}>{commande.id}</Text>
          <Text style={styles.dateCommande}>{commande.dateCommande}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Suivi de livraison</Text>
          <View style={styles.timeline}>
            {ETAPES.map((etape, index) => (
              <View key={index} style={styles.etapeConteneur}>
                <View style={styles.etapeColonne}>
                  <View
                    style={[
                      styles.etapePoint,
                      etape.fait && styles.etapePointFait,
                      etape.actif && styles.etapePointActif,
                    ]}
                  >
                    <Text style={styles.etapeIcone}>{etape.icone}</Text>
                  </View>
                  {index < ETAPES.length - 1 && (
                    <View
                      style={[
                        styles.etapeLigne,
                        etape.fait && styles.etapeLigneFaite,
                      ]}
                    />
                  )}
                </View>
                <View style={styles.etapeInfo}>
                  <Text
                    style={[
                      styles.etapeLabel,
                      etape.fait && styles.etapeLabelFait,
                      etape.actif && styles.etapeLabelActif,
                    ]}
                  >
                    {etape.label}
                  </Text>
                  {etape.actif && (
                    <Text style={styles.etapeEnCours}>En cours...</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Articles commandés</Text>
          <View style={styles.articlesList}>
            {commande.articles.map((article, index) => (
              <View key={article.id}>
                <View style={styles.articleRangee}>
                  <View style={styles.articleGauche}>
                    <Text style={styles.articleQte}>×{article.quantite}</Text>
                    <Text style={styles.articleNom}>{article.nom}</Text>
                  </View>
                  <Text style={styles.articlePrix}>
                    {(article.prixUnitaire * article.quantite).toFixed(3)} TND
                  </Text>
                </View>
                <Text style={styles.articlePrixUnit}>
                  {article.prixUnitaire.toFixed(3)} TND / unité
                </Text>
                {index < commande.articles.length - 1 && (
                  <View style={styles.separateur} />
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Récapitulatif</Text>
          <View style={styles.recapCard}>
            <View style={styles.recapLigne}>
              <Text style={styles.recapLabel}>Sous-total</Text>
              <Text style={styles.recapValeur}>{commande.sousTotal.toFixed(3)} TND</Text>
            </View>
            <View style={styles.recapLigne}>
              <Text style={styles.recapLabel}>Frais de livraison</Text>
              <Text style={styles.recapValeur}>
                {commande.fraisLivraison.toFixed(3)} TND
              </Text>
            </View>
            <View style={[styles.recapLigne, styles.recapLigneTotal]}>
              <Text style={styles.recapTotalLabel}>Total</Text>
              <Text style={styles.recapTotalValeur}>{commande.total.toFixed(3)} TND</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Adresse de livraison</Text>
          <View style={styles.adresseCard}>
            <Text style={styles.adresseEmoji}>📍</Text>
            <Text style={styles.adresseTexte}>{commande.adresse}</Text>
          </View>
        </View>

        <View style={styles.boutonSection}>
          <TouchableOpacity
            style={styles.boutonSuivi}
            onPress={() => navigation.navigate('GroceryTracking', { orderId: commande.id })}
            activeOpacity={0.85}
          >
            <Text style={styles.boutonSuiviTexte}>🗺️  Suivre la livraison</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.boutonProbleme}
            onPress={signalerProbleme}
            activeOpacity={0.85}
          >
            <Text style={styles.boutonProblemeTexte}>⚠️  Signaler un problème</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: COULEURS.bg,
  },
  entete: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COULEURS.bordure,
  },
  titre: {
    fontSize: 24,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  idCommande: {
    fontSize: 14,
    color: COULEURS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  dateCommande: {
    fontSize: 13,
    color: COULEURS.muet,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitre: {
    fontSize: 16,
    fontWeight: '700',
    color: COULEURS.texte,
    marginBottom: 14,
  },
  timeline: {
    gap: 0,
  },
  etapeConteneur: {
    flexDirection: 'row',
    gap: 14,
    minHeight: 60,
  },
  etapeColonne: {
    alignItems: 'center',
    width: 40,
  },
  etapePoint: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COULEURS.surface,
    borderWidth: 2,
    borderColor: COULEURS.bordure,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etapePointFait: {
    borderColor: COULEURS.succes,
    backgroundColor: COULEURS.succes + '22',
  },
  etapePointActif: {
    borderColor: COULEURS.primary,
    backgroundColor: COULEURS.primary + '22',
  },
  etapeIcone: {
    fontSize: 16,
  },
  etapeLigne: {
    flex: 1,
    width: 2,
    backgroundColor: COULEURS.bordure,
    marginVertical: 4,
  },
  etapeLigneFaite: {
    backgroundColor: COULEURS.succes,
  },
  etapeInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 16,
  },
  etapeLabel: {
    fontSize: 14,
    color: COULEURS.muet,
    fontWeight: '500',
  },
  etapeLabelFait: {
    color: COULEURS.succes,
    fontWeight: '600',
  },
  etapeLabelActif: {
    color: COULEURS.primary,
    fontWeight: '700',
  },
  etapeEnCours: {
    fontSize: 12,
    color: COULEURS.primary,
    marginTop: 2,
  },
  articlesList: {
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  articleRangee: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  articleGauche: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  articleQte: {
    fontSize: 13,
    fontWeight: '700',
    color: COULEURS.primary,
    minWidth: 28,
  },
  articleNom: {
    fontSize: 14,
    color: COULEURS.texte,
    flex: 1,
  },
  articlePrix: {
    fontSize: 14,
    fontWeight: '600',
    color: COULEURS.texte,
  },
  articlePrixUnit: {
    fontSize: 11,
    color: COULEURS.muet,
    marginLeft: 38,
    marginBottom: 4,
  },
  separateur: {
    height: 1,
    backgroundColor: COULEURS.bordure,
    marginVertical: 10,
  },
  recapCard: {
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    gap: 12,
  },
  recapLigne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recapLabel: {
    fontSize: 14,
    color: COULEURS.muet,
  },
  recapValeur: {
    fontSize: 14,
    color: COULEURS.texte,
    fontWeight: '500',
  },
  recapLigneTotal: {
    borderTopWidth: 1,
    borderTopColor: COULEURS.bordure,
    paddingTop: 12,
    marginTop: 2,
  },
  recapTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  recapTotalValeur: {
    fontSize: 18,
    fontWeight: '800',
    color: COULEURS.primary,
  },
  adresseCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COULEURS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    gap: 10,
  },
  adresseEmoji: {
    fontSize: 18,
    marginTop: 1,
  },
  adresseTexte: {
    flex: 1,
    fontSize: 14,
    color: COULEURS.texte,
    lineHeight: 20,
  },
  boutonSection: {
    padding: 20,
    gap: 12,
    marginTop: 8,
  },
  boutonSuivi: {
    backgroundColor: COULEURS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  boutonSuiviTexte: {
    fontSize: 16,
    fontWeight: '700',
    color: COULEURS.bg,
  },
  boutonProbleme: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  boutonProblemeTexte: {
    fontSize: 15,
    fontWeight: '600',
    color: COULEURS.muet,
  },
});
