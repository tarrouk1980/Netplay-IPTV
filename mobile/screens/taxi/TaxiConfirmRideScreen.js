import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DETAILS_TRAJET = {
  depart: '14 Rue Didouche Mourad, Alger',
  arrivee: 'Aéroport Houari Boumediene',
  distance: '28 km',
  duree: '35–45 min',
};

const TYPES_VEHICULE = [
  { id: 'eco', nom: 'Éco', description: '1–4 passagers', prix: 1200, icone: '🚕' },
  { id: 'confort', nom: 'Confort', description: '1–4 passagers', prix: 1800, icone: '🚗' },
  { id: 'xl', nom: 'XL', description: '1–6 passagers', prix: 2400, icone: '🚙' },
];

const MODES_PAIEMENT = [
  { id: 'wallet', nom: 'Portefeuille', detail: 'Solde : 5 200 DA', icone: '👛' },
  { id: 'especes', nom: 'Espèces', detail: 'Payer au chauffeur', icone: '💵' },
  { id: 'carte', nom: 'Carte bancaire', detail: '•••• •••• •••• 4521', icone: '💳' },
];

export default function TaxiConfirmRideScreen({ navigation }) {
  const [vehiculeSelectionne, setVehiculeSelectionne] = useState('eco');
  const [paiementSelectionne, setPaiementSelectionne] = useState('wallet');
  const [codePromo, setCodePromo] = useState('');
  const [reductionAppliquee, setReductionAppliquee] = useState(false);

  const vehicule = TYPES_VEHICULE.find((v) => v.id === vehiculeSelectionne);
  const prixBase = vehicule ? vehicule.prix : 1200;
  const reduction = reductionAppliquee ? Math.round(prixBase * 0.1) : 0;
  const prixFinal = prixBase - reduction;

  const appliquerPromo = () => {
    if (!codePromo.trim()) {
      Alert.alert('Code promo', 'Veuillez saisir un code promo.');
      return;
    }
    if (reductionAppliquee) {
      Alert.alert('Code promo', 'Un code promo est déjà appliqué.');
      return;
    }
    setReductionAppliquee(true);
    Alert.alert('Code promo appliqué !', `Réduction de 10% appliquée. Vous économisez ${Math.round(prixBase * 0.1)} DA.`);
  };

  const confirmerCourse = () => {
    navigation.navigate('TaxiWaiting');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.boutonRetour}>
          <Text style={styles.boutonRetourTexte}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titrePage}>Confirmer la course</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.carteContainer}>
          <View style={styles.carteSimulee}>
            <View style={styles.carteGrille}>
              {Array.from({ length: 48 }).map((_, i) => (
                <View key={i} style={styles.carteGrilleCell} />
              ))}
            </View>

            <View style={styles.routeContainer}>
              <View style={styles.pointDepart}>
                <View style={styles.pointDepartInner} />
              </View>
              <View style={styles.lignePoinillee}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <View key={i} style={styles.tiret} />
                ))}
              </View>
              <View style={styles.pointArrivee}>
                <Text style={styles.pointArriveeTexte}>★</Text>
              </View>
            </View>

            <View style={styles.etiquetteDepart}>
              <Text style={styles.etiquetteTexte}>Départ</Text>
            </View>
            <View style={styles.etiquetteArrivee}>
              <Text style={styles.etiquetteTexte}>Arrivée</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Détails du trajet</Text>
          <View style={styles.trajetCard}>
            <View style={styles.trajetLigne}>
              <View style={styles.trajetPointVert} />
              <View style={styles.trajetTextContainer}>
                <Text style={styles.trajetLabel}>Départ</Text>
                <Text style={styles.trajetAdresse}>{DETAILS_TRAJET.depart}</Text>
              </View>
            </View>
            <View style={styles.trajetConnecteur} />
            <View style={styles.trajetLigne}>
              <View style={styles.trajetPointOrange} />
              <View style={styles.trajetTextContainer}>
                <Text style={styles.trajetLabel}>Arrivée</Text>
                <Text style={styles.trajetAdresse}>{DETAILS_TRAJET.arrivee}</Text>
              </View>
            </View>
            <View style={styles.trajetStats}>
              <View style={styles.trajetStat}>
                <Text style={styles.trajetStatValeur}>{DETAILS_TRAJET.distance}</Text>
                <Text style={styles.trajetStatLabel}>Distance</Text>
              </View>
              <View style={styles.trajetStatSeparateur} />
              <View style={styles.trajetStat}>
                <Text style={styles.trajetStatValeur}>{DETAILS_TRAJET.duree}</Text>
                <Text style={styles.trajetStatLabel}>Durée estimée</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Type de véhicule</Text>
          {TYPES_VEHICULE.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.vehiculeCard,
                vehiculeSelectionne === type.id && styles.vehiculeCardActif,
              ]}
              onPress={() => {
                setVehiculeSelectionne(type.id);
                setReductionAppliquee(false);
              }}
            >
              <Text style={styles.vehiculeIcone}>{type.icone}</Text>
              <View style={styles.vehiculeInfos}>
                <Text style={styles.vehiculeNom}>{type.nom}</Text>
                <Text style={styles.vehiculeDescription}>{type.description}</Text>
              </View>
              <View style={styles.vehiculeDroite}>
                <Text style={styles.vehiculePrix}>{type.prix} DA</Text>
                <View
                  style={[
                    styles.radioButton,
                    vehiculeSelectionne === type.id && styles.radioButtonActif,
                  ]}
                >
                  {vehiculeSelectionne === type.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Mode de paiement</Text>
          {MODES_PAIEMENT.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.paiementCard,
                paiementSelectionne === mode.id && styles.paiementCardActif,
              ]}
              onPress={() => setPaiementSelectionne(mode.id)}
            >
              <Text style={styles.paiementIcone}>{mode.icone}</Text>
              <View style={styles.paiementInfos}>
                <Text style={styles.paiementNom}>{mode.nom}</Text>
                <Text style={styles.paiementDetail}>{mode.detail}</Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  paiementSelectionne === mode.id && styles.radioButtonActif,
                ]}
              >
                {paiementSelectionne === mode.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Code promo</Text>
          <View style={styles.promoContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Entrez votre code..."
              placeholderTextColor="#8E8E9A"
              value={codePromo}
              onChangeText={setCodePromo}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.promoButton} onPress={appliquerPromo}>
              <Text style={styles.promoButtonTexte}>Appliquer</Text>
            </TouchableOpacity>
          </View>
          {reductionAppliquee && (
            <View style={styles.promoAppliquee}>
              <Text style={styles.promoAppliqueeTexte}>✓ Code promo appliqué — −10%</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.recapCard}>
            <Text style={styles.recapTitre}>Récapitulatif</Text>
            <View style={styles.recapLigne}>
              <Text style={styles.recapLabel}>Course ({vehicule?.nom})</Text>
              <Text style={styles.recapValeur}>{prixBase} DA</Text>
            </View>
            {reductionAppliquee && (
              <View style={styles.recapLigne}>
                <Text style={[styles.recapLabel, { color: '#22C55E' }]}>Réduction promo</Text>
                <Text style={[styles.recapValeur, { color: '#22C55E' }]}>−{reduction} DA</Text>
              </View>
            )}
            <View style={styles.recapSeparateur} />
            <View style={styles.recapLigne}>
              <Text style={styles.recapTotalLabel}>Total à payer</Text>
              <Text style={styles.recapTotalValeur}>{prixFinal} DA</Text>
            </View>
          </View>
        </View>

        <View style={styles.espaceFond} />
      </ScrollView>

      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.boutonConfirmer} onPress={confirmerCourse}>
          <Text style={styles.boutonConfirmerTexte}>Confirmer la course • {prixFinal} DA</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C3A',
  },
  boutonRetour: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boutonRetourTexte: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  titrePage: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 36,
  },
  carteContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  carteSimulee: {
    height: 160,
    backgroundColor: '#141420',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carteGrille: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  carteGrilleCell: {
    width: '12.5%',
    height: 40,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#2C2C3A',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  pointDepart: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  pointDepartInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  lignePoinillee: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  tiret: {
    width: 14,
    height: 3,
    backgroundColor: '#F5A623',
    borderRadius: 2,
    marginHorizontal: 3,
  },
  pointArrivee: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F5A623',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  pointArriveeTexte: {
    color: '#0A0A0F',
    fontSize: 12,
  },
  etiquetteDepart: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    backgroundColor: 'rgba(34,197,94,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  etiquetteArrivee: {
    position: 'absolute',
    bottom: 16,
    right: 24,
    backgroundColor: 'rgba(245,166,35,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F5A623',
  },
  etiquetteTexte: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionTitre: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  trajetCard: {
    backgroundColor: '#1C1C28',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  trajetLigne: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trajetPointVert: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    marginRight: 12,
  },
  trajetPointOrange: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F5A623',
    marginRight: 12,
  },
  trajetTextContainer: {
    flex: 1,
  },
  trajetLabel: {
    color: '#8E8E9A',
    fontSize: 11,
  },
  trajetAdresse: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  trajetConnecteur: {
    width: 2,
    height: 20,
    backgroundColor: '#2C2C3A',
    marginLeft: 5,
    marginVertical: 6,
  },
  trajetStats: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#2C2C3A',
  },
  trajetStat: {
    flex: 1,
    alignItems: 'center',
  },
  trajetStatValeur: {
    color: '#F5A623',
    fontSize: 15,
    fontWeight: '700',
  },
  trajetStatLabel: {
    color: '#8E8E9A',
    fontSize: 11,
    marginTop: 2,
  },
  trajetStatSeparateur: {
    width: 1,
    backgroundColor: '#2C2C3A',
  },
  vehiculeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  vehiculeCardActif: {
    borderColor: '#F5A623',
    backgroundColor: 'rgba(245,166,35,0.06)',
  },
  vehiculeIcone: {
    fontSize: 26,
    marginRight: 12,
  },
  vehiculeInfos: {
    flex: 1,
  },
  vehiculeNom: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  vehiculeDescription: {
    color: '#8E8E9A',
    fontSize: 12,
    marginTop: 2,
  },
  vehiculeDroite: {
    alignItems: 'flex-end',
    gap: 8,
  },
  vehiculePrix: {
    color: '#F5A623',
    fontSize: 15,
    fontWeight: '800',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2C2C3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonActif: {
    borderColor: '#F5A623',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F5A623',
  },
  paiementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  paiementCardActif: {
    borderColor: '#F5A623',
    backgroundColor: 'rgba(245,166,35,0.06)',
  },
  paiementIcone: {
    fontSize: 22,
    marginRight: 12,
  },
  paiementInfos: {
    flex: 1,
  },
  paiementNom: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  paiementDetail: {
    color: '#8E8E9A',
    fontSize: 12,
    marginTop: 2,
  },
  promoContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  promoButton: {
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoButtonTexte: {
    color: '#F5A623',
    fontSize: 14,
    fontWeight: '700',
  },
  promoAppliquee: {
    marginTop: 8,
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  promoAppliqueeTexte: {
    color: '#22C55E',
    fontSize: 13,
    fontWeight: '600',
  },
  recapCard: {
    backgroundColor: '#1C1C28',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  recapTitre: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  recapLigne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recapLabel: {
    color: '#8E8E9A',
    fontSize: 14,
  },
  recapValeur: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  recapSeparateur: {
    height: 1,
    backgroundColor: '#2C2C3A',
    marginVertical: 10,
  },
  recapTotalLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  recapTotalValeur: {
    color: '#F5A623',
    fontSize: 18,
    fontWeight: '800',
  },
  espaceFond: {
    height: 100,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0A0A0F',
    borderTopWidth: 1,
    borderTopColor: '#2C2C3A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
  },
  boutonConfirmer: {
    backgroundColor: '#F5A623',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  boutonConfirmerTexte: {
    color: '#0A0A0F',
    fontSize: 16,
    fontWeight: '800',
  },
});
