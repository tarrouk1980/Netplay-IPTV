import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
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

const COURSE_MOCK = {
  depart: '12 Rue de la Paix, Paris 2e',
  arrivee: '45 Avenue des Champs-Élysées, Paris 8e',
  duree: '18 min',
  distance: '7,4 km',
  prixFinal: 14.80,
  chauffeur: 'Mohammed A.',
  vehicule: 'Peugeot 308 — AB-123-CD',
  easyPoints: 74,
};

export default function TaxiOrderSuccessScreen({ navigation }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [noteChoisie, setNoteChoisie] = useState(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scale]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contenu} showsVerticalScrollIndicator={false}>

        <View style={styles.enteteSucces}>
          <Animated.Text style={[styles.etoile, { transform: [{ scale }] }]}>⭐</Animated.Text>
          <Text style={styles.titreSucces}>Course terminée !</Text>
          <Text style={styles.sousTitre}>Merci d'avoir voyagé avec EasyWay</Text>
        </View>

        <View style={styles.carte}>
          <Text style={styles.titreCarte}>Résumé de la course</Text>

          <View style={styles.trajet}>
            <View style={styles.pointTrajet}>
              <View style={styles.pointDepart} />
              <Text style={styles.adresse} numberOfLines={2}>{COURSE_MOCK.depart}</Text>
            </View>
            <View style={styles.ligneTrajet} />
            <View style={styles.pointTrajet}>
              <View style={styles.pointArrivee} />
              <Text style={styles.adresse} numberOfLines={2}>{COURSE_MOCK.arrivee}</Text>
            </View>
          </View>

          <View style={styles.separateur} />

          <View style={styles.grillInfos}>
            <View style={styles.infoItem}>
              <Text style={styles.infoValeur}>{COURSE_MOCK.duree}</Text>
              <Text style={styles.infoLabel}>Durée</Text>
            </View>
            <View style={styles.separateurVertical} />
            <View style={styles.infoItem}>
              <Text style={styles.infoValeur}>{COURSE_MOCK.distance}</Text>
              <Text style={styles.infoLabel}>Distance</Text>
            </View>
            <View style={styles.separateurVertical} />
            <View style={styles.infoItem}>
              <Text style={[styles.infoValeur, { color: COULEURS.primary }]}>
                {COURSE_MOCK.prixFinal.toFixed(2)} €
              </Text>
              <Text style={styles.infoLabel}>Prix final</Text>
            </View>
          </View>

          <View style={styles.separateur} />

          <View style={styles.ligneInfo}>
            <Text style={styles.infoLabel}>Chauffeur</Text>
            <Text style={styles.infoTexte}>🛻 {COURSE_MOCK.chauffeur}</Text>
          </View>
          <View style={styles.ligneInfo}>
            <Text style={styles.infoLabel}>Véhicule</Text>
            <Text style={styles.infoTexte}>{COURSE_MOCK.vehicule}</Text>
          </View>
        </View>

        <View style={styles.carte}>
          <Text style={styles.titreCarte}>Note rapide du chauffeur</Text>
          <View style={styles.etoilesContainer}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setNoteChoisie(n)} activeOpacity={0.7}>
                <Text style={[styles.etoileNote, noteChoisie >= n && styles.etoileNoteActive]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {noteChoisie > 0 && (
            <Text style={styles.texteNote}>
              {noteChoisie === 5
                ? 'Excellent chauffeur !'
                : noteChoisie >= 4
                ? 'Très bonne course'
                : noteChoisie >= 3
                ? 'Course correcte'
                : noteChoisie >= 2
                ? 'Quelques problèmes'
                : 'Expérience décevante'}
            </Text>
          )}
        </View>

        <View style={styles.badgePoints}>
          <Text style={styles.iconePoints}>🏆</Text>
          <View>
            <Text style={styles.textePoints}>
              <Text style={styles.nombrePoints}>{COURSE_MOCK.easyPoints} EasyPoints </Text>
              gagnés
            </Text>
            <Text style={styles.sousTitrePoints}>Continuez à voyager pour débloquer des récompenses</Text>
          </View>
        </View>

        <View style={styles.boutonsContainer}>
          <TouchableOpacity
            style={styles.boutonSecondaire}
            onPress={() => navigation.navigate('TaxiRating')}
            activeOpacity={0.8}
          >
            <Text style={styles.textBoutonSecondaire}>Évaluer en détail</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boutonPrimaire}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Text style={styles.textBoutonPrimaire}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COULEURS.bg,
  },
  contenu: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
  enteteSucces: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  etoile: {
    fontSize: 64,
    marginBottom: 16,
  },
  titreSucces: {
    color: COULEURS.text,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  sousTitre: {
    color: COULEURS.muted,
    fontSize: 14,
  },
  carte: {
    backgroundColor: COULEURS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  titreCarte: {
    color: COULEURS.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  trajet: {
    marginBottom: 14,
  },
  pointTrajet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  pointDepart: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginTop: 3,
  },
  pointArrivee: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: COULEURS.primary,
    marginTop: 3,
  },
  ligneTrajet: {
    width: 2,
    height: 20,
    backgroundColor: COULEURS.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  adresse: {
    color: COULEURS.text,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  separateur: {
    height: 1,
    backgroundColor: COULEURS.border,
    marginVertical: 12,
  },
  grillInfos: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoValeur: {
    color: COULEURS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoLabel: {
    color: COULEURS.muted,
    fontSize: 11,
  },
  separateurVertical: {
    width: 1,
    height: 32,
    backgroundColor: COULEURS.border,
  },
  ligneInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoTexte: {
    color: COULEURS.text,
    fontSize: 13,
    fontWeight: '500',
  },
  etoilesContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  etoileNote: {
    fontSize: 36,
    color: COULEURS.border,
  },
  etoileNoteActive: {
    color: COULEURS.primary,
  },
  texteNote: {
    color: COULEURS.muted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  badgePoints: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COULEURS.primary + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COULEURS.primary + '40',
    gap: 14,
  },
  iconePoints: {
    fontSize: 32,
  },
  textePoints: {
    color: COULEURS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  nombrePoints: {
    color: COULEURS.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  sousTitrePoints: {
    color: COULEURS.muted,
    fontSize: 11,
  },
  boutonsContainer: {
    gap: 10,
  },
  boutonPrimaire: {
    backgroundColor: COULEURS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  textBoutonPrimaire: {
    color: COULEURS.bg,
    fontSize: 15,
    fontWeight: '700',
  },
  boutonSecondaire: {
    backgroundColor: COULEURS.surface,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  textBoutonSecondaire: {
    color: COULEURS.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
