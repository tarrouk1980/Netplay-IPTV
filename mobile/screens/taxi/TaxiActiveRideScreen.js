import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COULEURS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

const CHAUFFEUR = {
  prenom: 'Karim',
  nom: 'Benali',
  plaque: '75-ABC-123',
  modele: 'Renault Clio 5',
  note: 4.8,
  couleur: 'Gris Métal',
};

const COURSE = {
  depart: '12 Rue de la Paix, Paris',
  arrivee: '45 Avenue Montaigne, Paris',
  distance: 7.4,
  prixEstime: '14,50 €',
};

export default function TaxiActiveRideScreen({ navigation }) {
  const [etaMinutes, setEtaMinutes] = useState(8);
  const [progression, setProgression] = useState(0.22);
  const progressAnim = useRef(new Animated.Value(0.22)).current;
  const routeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(routeAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: false,
        }),
        Animated.timing(routeAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const intervalle = setInterval(() => {
      setEtaMinutes((prev) => {
        if (prev <= 1) {
          clearInterval(intervalle);
          return 0;
        }
        return prev - 1;
      });
      setProgression((prev) => {
        const nouveau = Math.min(prev + 0.12, 1);
        Animated.timing(progressAnim, {
          toValue: nouveau,
          duration: 800,
          useNativeDriver: false,
        }).start();
        return nouveau;
      });
    }, 60000);
    return () => clearInterval(intervalle);
  }, []);

  const largeurProgression = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const positionRoute = routeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '80%'],
  });

  const appelChauffeur = () => {
    Alert.alert(
      'Appeler le chauffeur',
      `Voulez-vous appeler ${CHAUFFEUR.prenom} ${CHAUFFEUR.nom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Appeler', onPress: () => {} },
      ]
    );
  };

  const alertSOS = () => {
    Alert.alert(
      '🚨 Urgence SOS',
      'Votre position sera partagée avec les services d\'urgence. Confirmer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer SOS',
          style: 'destructive',
          onPress: () => Alert.alert('SOS envoyé', 'Les secours ont été alertés.'),
        },
      ]
    );
  };

  const kmRestants = (COURSE.distance * (1 - progression)).toFixed(1);
  const pourcentage = Math.round(progression * 100);

  return (
    <SafeAreaView style={styles.conteneur}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.carteSimulee}>
          <View style={styles.carteInterieur}>
            <View style={styles.carteRoute}>
              <View style={styles.routeBase} />
              <Animated.View style={[styles.routeAnimee, { left: positionRoute }]} />
              <View style={styles.pointDepart}>
                <Text style={styles.pointTexte}>A</Text>
              </View>
              <View style={styles.pointArrivee}>
                <Text style={styles.pointTexte}>B</Text>
              </View>
            </View>
            <Text style={styles.carteEta}>
              {etaMinutes > 0 ? `Arrivée dans ${etaMinutes} min` : 'Arrivée imminente'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionProgression}>
          <View style={styles.progressionEntete}>
            <Text style={styles.progressionLabel}>Progression du trajet</Text>
            <Text style={styles.progressionPourcentage}>{pourcentage}%</Text>
          </View>
          <View style={styles.barreConteneur}>
            <Animated.View style={[styles.barreRemplie, { width: largeurProgression }]} />
          </View>
          <View style={styles.progressionDetails}>
            <Text style={styles.progressionInfo}>{kmRestants} km restants</Text>
            <Text style={styles.progressionInfo}>
              {(COURSE.distance * progression).toFixed(1)} / {COURSE.distance} km
            </Text>
          </View>
        </View>

        <View style={styles.carteInfo}>
          <View style={styles.chauffeurEntete}>
            <View style={styles.avatarConteneur}>
              <Text style={styles.avatarInitiales}>
                {CHAUFFEUR.prenom[0]}{CHAUFFEUR.nom[0]}
              </Text>
            </View>
            <View style={styles.chauffeurTexte}>
              <Text style={styles.chauffeurNom}>
                {CHAUFFEUR.prenom} {CHAUFFEUR.nom}
              </Text>
              <View style={styles.noteConteneur}>
                <Text style={styles.etoile}>★</Text>
                <Text style={styles.noteTexte}>{CHAUFFEUR.note}</Text>
              </View>
            </View>
            <View style={styles.prixBadge}>
              <Text style={styles.prixLabel}>Estimé</Text>
              <Text style={styles.prixValeur}>{COURSE.prixEstime}</Text>
            </View>
          </View>

          <View style={styles.separateur} />

          <View style={styles.vehiculeInfo}>
            <View style={styles.vehiculeLigne}>
              <Text style={styles.vehiculeLabel}>Véhicule</Text>
              <Text style={styles.vehiculeValeur}>{CHAUFFEUR.modele}</Text>
            </View>
            <View style={styles.vehiculeLigne}>
              <Text style={styles.vehiculeLabel}>Plaque</Text>
              <Text style={styles.vehiculeValeur}>{CHAUFFEUR.plaque}</Text>
            </View>
            <View style={styles.vehiculeLigne}>
              <Text style={styles.vehiculeLabel}>Couleur</Text>
              <Text style={styles.vehiculeValeur}>{CHAUFFEUR.couleur}</Text>
            </View>
          </View>

          <View style={styles.separateur} />

          <View style={styles.trajetInfo}>
            <View style={styles.trajetLigne}>
              <View style={styles.pointVert} />
              <Text style={styles.trajetTexte} numberOfLines={1}>{COURSE.depart}</Text>
            </View>
            <View style={styles.traitVertical} />
            <View style={styles.trajetLigne}>
              <View style={styles.pointPrimary} />
              <Text style={styles.trajetTexte} numberOfLines={1}>{COURSE.arrivee}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsConteneur}>
          <TouchableOpacity style={styles.boutonAction} onPress={appelChauffeur}>
            <Text style={styles.boutonActionIcone}>📞</Text>
            <Text style={styles.boutonActionTexte}>Appeler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boutonAction}
            onPress={() => navigation.navigate('Chat', { chauffeurNom: `${CHAUFFEUR.prenom} ${CHAUFFEUR.nom}` })}
          >
            <Text style={styles.boutonActionIcone}>💬</Text>
            <Text style={styles.boutonActionTexte}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.boutonAction, styles.boutonSOS]} onPress={alertSOS}>
            <Text style={styles.boutonActionIcone}>🚨</Text>
            <Text style={[styles.boutonActionTexte, styles.sosTexte]}>SOS</Text>
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
  carteSimulee: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#12121E',
    height: 200,
  },
  carteInterieur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carteRoute: {
    width: '80%',
    height: 4,
    position: 'relative',
    justifyContent: 'center',
  },
  routeBase: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COULEURS.border,
    borderRadius: 2,
  },
  routeAnimee: {
    position: 'absolute',
    width: 40,
    height: 4,
    backgroundColor: COULEURS.primary,
    borderRadius: 2,
  },
  pointDepart: {
    position: 'absolute',
    left: -16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointArrivee: {
    position: 'absolute',
    right: -16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COULEURS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointTexte: {
    color: COULEURS.text,
    fontSize: 10,
    fontWeight: '700',
  },
  carteEta: {
    marginTop: 32,
    color: COULEURS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionProgression: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  progressionEntete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressionLabel: {
    color: COULEURS.muted,
    fontSize: 14,
  },
  progressionPourcentage: {
    color: COULEURS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  barreConteneur: {
    height: 8,
    backgroundColor: COULEURS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barreRemplie: {
    height: '100%',
    backgroundColor: COULEURS.primary,
    borderRadius: 4,
  },
  progressionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressionInfo: {
    color: COULEURS.muted,
    fontSize: 12,
  },
  carteInfo: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  chauffeurEntete: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarConteneur: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COULEURS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitiales: {
    color: COULEURS.bg,
    fontSize: 18,
    fontWeight: '800',
  },
  chauffeurTexte: {
    flex: 1,
  },
  chauffeurNom: {
    color: COULEURS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  noteConteneur: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  etoile: {
    color: COULEURS.primary,
    fontSize: 14,
    marginRight: 4,
  },
  noteTexte: {
    color: COULEURS.muted,
    fontSize: 14,
  },
  prixBadge: {
    alignItems: 'flex-end',
  },
  prixLabel: {
    color: COULEURS.muted,
    fontSize: 11,
    marginBottom: 2,
  },
  prixValeur: {
    color: COULEURS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  separateur: {
    height: 1,
    backgroundColor: COULEURS.border,
    marginVertical: 12,
  },
  vehiculeInfo: {
    gap: 8,
  },
  vehiculeLigne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vehiculeLabel: {
    color: COULEURS.muted,
    fontSize: 14,
  },
  vehiculeValeur: {
    color: COULEURS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  trajetInfo: {
    gap: 4,
  },
  trajetLigne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pointVert: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  pointPrimary: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COULEURS.primary,
  },
  traitVertical: {
    width: 2,
    height: 16,
    backgroundColor: COULEURS.border,
    marginLeft: 4,
  },
  trajetTexte: {
    color: COULEURS.text,
    fontSize: 13,
    flex: 1,
  },
  actionsConteneur: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  boutonAction: {
    flex: 1,
    backgroundColor: COULEURS.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  boutonSOS: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255,59,48,0.1)',
  },
  boutonActionIcone: {
    fontSize: 22,
    marginBottom: 6,
  },
  boutonActionTexte: {
    color: COULEURS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  sosTexte: {
    color: '#FF3B30',
  },
});
