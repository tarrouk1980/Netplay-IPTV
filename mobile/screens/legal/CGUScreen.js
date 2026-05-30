import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  accent: '#D32F2F',
  green: '#27AE60',
};

const SECTIONS = [
  {
    title: '1. Nature de la plateforme EASYWAY',
    content: `EASYWAY est une plateforme numérique de mise en relation entre des utilisateurs (clients) et des prestataires de services indépendants (chauffeurs, dépanneurs, livreurs, marchands).

EASYWAY n'est PAS un employeur, ni une agence de travail. Les prestataires exercent en tant qu'indépendants et sont seuls responsables de la qualité de leurs prestations, de leurs obligations fiscales, sociales et légales en vertu de la législation tunisienne.

EASYWAY agit uniquement comme intermédiaire technologique et ne saurait être tenu responsable des accidents, litiges ou dommages survenus lors de la prestation de service.`,
  },
  {
    title: '2. Homologation et conformité légale (Tunisie)',
    content: `Conformément à la loi tunisienne n° 2000-83 du 9 août 2000 relative aux échanges et au commerce électroniques, et au décret-loi n° 2022-54 relatif à la lutte contre la cybercriminalité, l'utilisation de la plateforme EASYWAY implique l'acceptation de l'ensemble des présentes conditions.

Les données personnelles collectées sont traitées conformément à la loi organique n° 2004-63 du 27 juillet 2004 portant sur la protection des données à caractère personnel et sous le contrôle de l'INPDP (Instance Nationale de Protection des Données Personnelles).

L'application EASYWAY est un outil de mise en relation électronique et ne constitue pas un service de transport ou de livraison au sens de la réglementation tunisienne des transports.`,
  },
  {
    title: '3. Conditions d\'utilisation pour les prestataires',
    content: `Tout prestataire (chauffeur, dépanneur, livreur, marchand) s'engage à :

• Fournir des documents d'identité valides lors de l'inscription (KYC)
• Disposer de toutes les autorisations légales requises pour exercer son activité
• Ne pas contacter ni solliciter les clients en dehors de la plateforme
• Ne pas annuler des commandes de manière abusive pour éviter les commissions
• Respecter les tarifs et conditions convenus via la plateforme
• S'acquitter du Pass-Jour de 1 TND/jour pour accéder à la plateforme

Toute violation de ces conditions peut entraîner la suspension ou le bannissement définitif du compte.`,
  },
  {
    title: '4. Lutte contre la fraude',
    content: `EASYWAY dispose de systèmes automatiques de détection des comportements frauduleux, notamment :

• Annulations répétées après acceptation d'une commande
• Contact hors-plateforme pour contourner le système
• Fausses informations d'identité ou de véhicule
• Avis ou évaluations frauduleux

Tout compte détecté comme frauduleux peut être suspendu immédiatement et définitivement sans préavis, et faire l'objet d'un signalement aux autorités compétentes.`,
  },
  {
    title: '5. Responsabilité et assurances',
    content: `Les clients sont informés que :

• EASYWAY ne garantit pas la disponibilité permanente des prestataires
• En cas d'accident lors d'une course SOS ou Taxi, la responsabilité incombe au prestataire et/ou à son assurance
• EASYWAY ne contracte aucune assurance au nom des prestataires
• Tout litige entre client et prestataire doit être résolu en premier lieu via le système de signalement de l'application

Pour les urgences : composez le 197 (dépannage national Tunisie) ou le 190 (Police).`,
  },
  {
    title: '6. Propriété des données',
    content: `Vos données personnelles (nom, numéro de téléphone, position GPS) sont collectées uniquement pour le bon fonctionnement de la mise en relation.

• Elles ne sont jamais revendues à des tiers
• La position GPS n'est collectée qu'en cours de commande active
• Vous pouvez demander la suppression de votre compte et de vos données à tout moment en contactant le support EASYWAY

La durée de conservation des données est de 3 ans après la dernière activité, conformément à la législation tunisienne.`,
  },
  {
    title: '7. Modification des conditions',
    content: `EASYWAY se réserve le droit de modifier les présentes conditions à tout moment. Les utilisateurs seront notifiés via l'application. La poursuite de l'utilisation de l'application après notification vaut acceptation des nouvelles conditions.

Version : 1.0 — Date d'entrée en vigueur : Juin 2025`,
  },
];

export default function CGUScreen({ navigation, route }) {
  const { onAccept, onDecline } = route?.params || {};
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const scrollRef = useRef(null);

  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isAtEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 60;
    if (isAtEnd) setHasScrolledToEnd(true);
  };

  const handleAccept = async () => {
    await AsyncStorage.setItem('cguAccepted', 'true');
    if (onAccept) onAccept();
    else navigation.goBack();
  };

  const handleDecline = () => {
    Alert.alert(
      'Refus des conditions',
      'Vous devez accepter les conditions d\'utilisation pour utiliser EASYWAY.',
      [
        { text: 'Relire', style: 'cancel' },
        {
          text: 'Refuser et quitter',
          style: 'destructive',
          onPress: () => {
            if (onDecline) onDecline();
            else navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conditions d'utilisation</Text>
        <Text style={styles.headerSub}>EASYWAY — Version 1.0 — Juin 2025</Text>
      </View>

      <View style={styles.legalBadge}>
        <Text style={styles.legalBadgeText}>
          ⚖️ Document contractuel — Valeur légale en Tunisie
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.intro}>
          En utilisant l'application EASYWAY, vous reconnaissez avoir lu, compris et accepté l'intégralité des présentes conditions générales d'utilisation. Ce document constitue un accord contractuel électronique conformément à la loi tunisienne n° 2000-83.
        </Text>

        {SECTIONS.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.signature}>
          <Text style={styles.signatureText}>
            En appuyant sur "J'accepte", vous signez électroniquement ce contrat et confirmez avoir lu l'intégralité des conditions ci-dessus.
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {!hasScrolledToEnd && (
        <View style={styles.scrollHint}>
          <Text style={styles.scrollHintText}>↓ Faites défiler pour lire toutes les conditions</Text>
        </View>
      )}

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.declineBtn} onPress={handleDecline}>
          <Text style={styles.declineBtnText}>Refuser</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.acceptBtn, !hasScrolledToEnd && styles.acceptBtnDisabled]}
          onPress={hasScrolledToEnd ? handleAccept : () => {
            Alert.alert('Lisez d\'abord', 'Veuillez lire l\'intégralité des conditions avant d\'accepter.');
          }}
        >
          <Text style={styles.acceptBtnText}>✅ J'accepte</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingBottom: 8 },
  headerTitle: { color: COLORS.text, fontSize: 22, fontWeight: '900' },
  headerSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
  legalBadge: {
    backgroundColor: '#1A0E0E',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  legalBadgeText: { color: COLORS.accent, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  intro: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 20,
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  sectionContent: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  signature: {
    backgroundColor: '#0D2A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.green,
    marginBottom: 12,
  },
  signatureText: {
    color: COLORS.green,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollHint: {
    backgroundColor: '#1C1C28',
    padding: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  scrollHintText: { color: COLORS.textMuted, fontSize: 12 },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  declineBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  declineBtnText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 15 },
  acceptBtn: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: COLORS.green,
  },
  acceptBtnDisabled: { backgroundColor: '#1A3A1A', opacity: 0.6 },
  acceptBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});
