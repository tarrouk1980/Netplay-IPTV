import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COULEURS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

const genererNumeroCommande = () => {
  const lettres = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const prefix =
    lettres[Math.floor(Math.random() * lettres.length)] +
    lettres[Math.floor(Math.random() * lettres.length)];
  const chiffres = Math.floor(10000 + Math.random() * 89999);
  return `EW-${prefix}${chiffres}`;
};

const COMMANDE = {
  restaurant: 'Le Bouchon Parisien',
  adresse: '23 Rue Oberkampf, 75011 Paris',
  etaMinutes: 32,
  articles: [
    { nom: 'Burger Classic', quantite: 2, prix: '12,90 €' },
    { nom: 'Frites maison (grande)', quantite: 1, prix: '4,50 €' },
    { nom: 'Coca-Cola 33cl', quantite: 2, prix: '3,20 €' },
  ],
  sousTotal: '36,70 €',
  fraisLivraison: '2,50 €',
  total: '39,20 €',
};

export default function DeliveryOrderConfirmScreen({ navigation }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opaciteAnim = useRef(new Animated.Value(0)).current;
  const [numeroCommande] = useState(genererNumeroCommande);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opaciteAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.conteneur}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.animationConteneur}>
          <Animated.View style={[styles.cercleSucces, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.checkmark}>✓</Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.texteSuccesConteneur, { opacity: opaciteAnim }]}>
          <Text style={styles.titreSucces}>Commande confirmée !</Text>
          <Text style={styles.sousTitreSucces}>
            Votre commande a été transmise au restaurant
          </Text>
          <View style={styles.numeroBadge}>
            <Text style={styles.numeroLabel}>N° de commande</Text>
            <Text style={styles.numeroValeur}>{numeroCommande}</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.carteRecap, { opacity: opaciteAnim }]}>
          <View style={styles.restaurantEntete}>
            <Text style={styles.restaurantIcone}>🍔</Text>
            <View>
              <Text style={styles.restaurantNom}>{COMMANDE.restaurant}</Text>
              <Text style={styles.etaBadge}>
                Livraison estimée : {COMMANDE.etaMinutes} min
              </Text>
            </View>
          </View>

          <View style={styles.separateur} />

          <Text style={styles.sectionTitre}>Articles commandés</Text>
          {COMMANDE.articles.map((article, index) => (
            <View key={index} style={styles.articleLigne}>
              <View style={styles.articleGauche}>
                <View style={styles.qteBadge}>
                  <Text style={styles.qteTexte}>{article.quantite}x</Text>
                </View>
                <Text style={styles.articleNom}>{article.nom}</Text>
              </View>
              <Text style={styles.articlePrix}>{article.prix}</Text>
            </View>
          ))}

          <View style={styles.separateur} />

          <View style={styles.totauxLigne}>
            <Text style={styles.totauxLabel}>Sous-total</Text>
            <Text style={styles.totauxValeur}>{COMMANDE.sousTotal}</Text>
          </View>
          <View style={styles.totauxLigne}>
            <Text style={styles.totauxLabel}>Frais de livraison</Text>
            <Text style={styles.totauxValeur}>{COMMANDE.fraisLivraison}</Text>
          </View>
          <View style={[styles.totauxLigne, styles.totalFinal]}>
            <Text style={styles.totalFinalLabel}>Total payé</Text>
            <Text style={styles.totalFinalValeur}>{COMMANDE.total}</Text>
          </View>

          <View style={styles.separateur} />

          <View style={styles.adresseLigne}>
            <Text style={styles.adresseIcone}>📍</Text>
            <View style={styles.adresseTexte}>
              <Text style={styles.adresseLabel}>Adresse de livraison</Text>
              <Text style={styles.adresseValeur}>{COMMANDE.adresse}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.boutonsConteneur, { opacity: opaciteAnim }]}>
          <TouchableOpacity
            style={styles.boutonPrimaire}
            onPress={() => navigation.navigate('DeliveryLivreurTracking', { numeroCommande })}
          >
            <Text style={styles.boutonPrimaireTexte}>Suivre ma commande</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boutonSecondaire}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.boutonSecondaireTexte}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: COULEURS.bg,
  },
  scroll: {
    paddingBottom: 32,
  },
  animationConteneur: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
  },
  cercleSucces: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  checkmark: {
    color: COULEURS.text,
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 58,
  },
  texteSuccesConteneur: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  titreSucces: {
    color: COULEURS.text,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  sousTitreSucces: {
    color: COULEURS.muted,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  numeroBadge: {
    backgroundColor: COULEURS.surface,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  numeroLabel: {
    color: COULEURS.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  numeroValeur: {
    color: COULEURS.primary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  carteRecap: {
    marginHorizontal: 16,
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.border,
    marginBottom: 20,
  },
  restaurantEntete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  restaurantIcone: {
    fontSize: 32,
  },
  restaurantNom: {
    color: COULEURS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  etaBadge: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: '600',
  },
  separateur: {
    height: 1,
    backgroundColor: COULEURS.border,
    marginVertical: 12,
  },
  sectionTitre: {
    color: COULEURS.muted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  articleLigne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  articleGauche: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  qteBadge: {
    backgroundColor: COULEURS.border,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  qteTexte: {
    color: COULEURS.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  articleNom: {
    color: COULEURS.text,
    fontSize: 14,
    flex: 1,
  },
  articlePrix: {
    color: COULEURS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  totauxLigne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totauxLabel: {
    color: COULEURS.muted,
    fontSize: 14,
  },
  totauxValeur: {
    color: COULEURS.text,
    fontSize: 14,
  },
  totalFinal: {
    marginTop: 4,
  },
  totalFinalLabel: {
    color: COULEURS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  totalFinalValeur: {
    color: COULEURS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  adresseLigne: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  adresseIcone: {
    fontSize: 18,
    marginTop: 2,
  },
  adresseTexte: {
    flex: 1,
  },
  adresseLabel: {
    color: COULEURS.muted,
    fontSize: 12,
    marginBottom: 3,
  },
  adresseValeur: {
    color: COULEURS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  boutonsConteneur: {
    marginHorizontal: 16,
    gap: 12,
  },
  boutonPrimaire: {
    backgroundColor: COULEURS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  boutonPrimaireTexte: {
    color: COULEURS.bg,
    fontSize: 16,
    fontWeight: '800',
  },
  boutonSecondaire: {
    backgroundColor: COULEURS.surface,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  boutonSecondaireTexte: {
    color: COULEURS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
