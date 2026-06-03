import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COULEURS = {
  fond: '#0A0A0F',
  surface: '#1C1C28',
  primaire: '#F5A623',
  texte: '#FFFFFF',
  discret: '#8E8E9A',
  bordure: '#2C2C3A',
};

const CHAUFFEUR = {
  nom: 'Karim B.',
  nomComplet: 'Karim Bouazizi',
  voiture: 'Hyundai Accent',
  plaque: 'TN-4521-B',
  note: 4.8,
  avatar: 'KB',
  couleurVoiture: 'Blanc',
};

const POSITIONS_TAXI = [
  { x: 20, y: 70 },
  { x: 28, y: 62 },
  { x: 36, y: 55 },
  { x: 44, y: 48 },
  { x: 52, y: 42 },
  { x: 60, y: 36 },
  { x: 68, y: 30 },
];

const ETAPES = [
  { label: 'Confirmé', icone: '✅' },
  { label: 'En route', icone: '🚕' },
  { label: 'Arrivé', icone: '🏁' },
];

const DUREE_INITIALE = 5 * 60;

export default function TaxiLiveTrackingScreen({ navigation }) {
  const [secondesRestantes, setSecondesRestantes] = useState(DUREE_INITIALE);
  const [indexPosition, setIndexPosition] = useState(0);
  const [etapeActive, setEtapeActive] = useState(1);
  const posAnim = useRef(
    new Animated.ValueXY({ x: POSITIONS_TAXI[0].x, y: POSITIONS_TAXI[0].y })
  ).current;

  useEffect(() => {
    const timerCompte = setInterval(() => {
      setSecondesRestantes((prev) => {
        if (prev <= 0) {
          clearInterval(timerCompte);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerCompte);
  }, []);

  useEffect(() => {
    const timerPos = setInterval(() => {
      setIndexPosition((prev) => {
        const prochainIndex = Math.min(prev + 1, POSITIONS_TAXI.length - 1);
        const prochainePos = POSITIONS_TAXI[prochainIndex];
        Animated.timing(posAnim, {
          toValue: { x: prochainePos.x, y: prochainePos.y },
          duration: 1800,
          useNativeDriver: false,
        }).start();
        if (prochainIndex >= POSITIONS_TAXI.length - 1) {
          setEtapeActive(2);
          clearInterval(timerPos);
        }
        return prochainIndex;
      });
    }, 2000);
    return () => clearInterval(timerPos);
  }, []);

  const formatTemps = (secondes) => {
    const m = Math.floor(secondes / 60).toString().padStart(2, '0');
    const s = (secondes % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const appelerChauffeur = () => {
    Alert.alert(
      "Appel en cours",
      `Appel vers ${CHAUFFEUR.nomComplet} — Véhicule : ${CHAUFFEUR.voiture} (${CHAUFFEUR.plaque})`,
      [{ text: "Raccrocher", style: "destructive" }, { text: "OK" }]
    );
  };

  const envoyerMessage = () => {
    Alert.alert(
      "Message",
      "Fonctionnalité de messagerie bientôt disponible.",
      [{ text: "OK" }]
    );
  };

  const annulerCourse = () => {
    Alert.alert(
      "Annuler la course",
      "Des frais d'annulation peuvent s'appliquer. Confirmer l'annulation ?",
      [
        { text: "Retour", style: "cancel" },
        {
          text: "Annuler la course",
          style: "destructive",
          onPress: () => navigation && navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.entete}>
        <Text style={styles.titreEcran}>Votre chauffeur arrive</Text>
        <View style={styles.etaBloc}>
          <Text style={styles.etaLabel}>Arrivée dans</Text>
          <Text style={[styles.etaTimer, secondesRestantes < 60 && styles.etaUrgent]}>
            {formatTemps(secondesRestantes)}
          </Text>
        </View>
      </View>

      {/* Carte simulée */}
      <View style={styles.carteSimulee}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`h${i}`} style={[styles.grilleLigne, { top: `${(i + 1) * 14}%` }]} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`v${i}`} style={[styles.grilleColonne, { left: `${(i + 1) * 14}%` }]} />
        ))}

        <View style={[styles.pinClient, { left: '70%', top: '22%' }]}>
          <Text style={styles.pinEmoji}>🔴</Text>
          <Text style={styles.pinLabel}>Vous</Text>
        </View>

        <Animated.View
          style={[
            styles.pinTaxi,
            {
              left: posAnim.x.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              top: posAnim.y.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          <Text style={styles.pinEmoji}>🚕</Text>
          <Text style={styles.pinLabel}>Taxi</Text>
        </Animated.View>
      </View>

      {/* Stepper */}
      <View style={styles.progressionBloc}>
        {ETAPES.map((etape, index) => (
          <View key={etape.label} style={styles.etapeRangee}>
            <View style={styles.etapeGauche}>
              <View
                style={[
                  styles.etapeCercle,
                  index <= etapeActive && styles.etapeCercleActif,
                ]}
              >
                <Text style={styles.etapeIcone}>{etape.icone}</Text>
              </View>
              {index < ETAPES.length - 1 && (
                <View
                  style={[
                    styles.etapeTiret,
                    index < etapeActive && styles.etapeTiretActif,
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                styles.etapeLabel,
                index <= etapeActive && styles.etapeLabelActif,
              ]}
            >
              {etape.label}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.carteDefilement} showsVerticalScrollIndicator={false}>
        {/* Statut */}
        <View style={styles.statutBandeau}>
          <Text style={styles.statutTexte}>🚕  Votre chauffeur est en route</Text>
        </View>

        {/* Infos chauffeur */}
        <View style={styles.chauffeurCarte}>
          <View style={styles.chauffeurAvatar}>
            <Text style={styles.avatarTexte}>{CHAUFFEUR.avatar}</Text>
          </View>
          <View style={styles.chauffeurInfo}>
            <Text style={styles.chauffeurNom}>{CHAUFFEUR.nomComplet}</Text>
            <Text style={styles.chauffeurVoiture}>{CHAUFFEUR.voiture} · {CHAUFFEUR.couleurVoiture}</Text>
            <View style={styles.chauffeurMeta}>
              <Text style={styles.chauffeurNote}>⭐ {CHAUFFEUR.note}</Text>
            </View>
          </View>
        </View>

        {/* Plaque d'immatriculation */}
        <View style={styles.plaqueConteneur}>
          <Text style={styles.plaqueEtiquette}>Plaque d'immatriculation</Text>
          <View style={styles.plaqueAffichage}>
            <Text style={styles.plaqueTexte}>{CHAUFFEUR.plaque}</Text>
          </View>
          <Text style={styles.plaqueConseil}>Vérifiez la plaque avant de monter dans le véhicule</Text>
        </View>

        {/* Boutons actions */}
        <View style={styles.boutonsRangee}>
          <TouchableOpacity style={styles.boutonAction} onPress={appelerChauffeur} activeOpacity={0.85}>
            <Text style={styles.boutonActionEmoji}>📞</Text>
            <Text style={styles.boutonActionTexte}>Appeler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.boutonAction} onPress={envoyerMessage} activeOpacity={0.85}>
            <Text style={styles.boutonActionEmoji}>💬</Text>
            <Text style={styles.boutonActionTexte}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* Bouton annulation */}
        <TouchableOpacity style={styles.boutonAnnuler} onPress={annulerCourse} activeOpacity={0.85}>
          <Text style={styles.boutonAnnulerTexte}>✕  Annuler (frais applicables)</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: COULEURS.fond,
  },
  entete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  titreEcran: {
    fontSize: 20,
    fontWeight: '700',
    color: COULEURS.texte,
    flex: 1,
    marginRight: 12,
  },
  etaBloc: {
    alignItems: 'flex-end',
  },
  etaLabel: {
    fontSize: 11,
    color: COULEURS.discret,
    marginBottom: 2,
  },
  etaTimer: {
    fontSize: 22,
    fontWeight: '800',
    color: COULEURS.primaire,
    fontVariant: ['tabular-nums'],
  },
  etaUrgent: {
    color: '#F44336',
  },
  carteSimulee: {
    height: 190,
    marginHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#0F2027',
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    overflow: 'hidden',
    position: 'relative',
  },
  grilleLigne: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  grilleColonne: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  pinClient: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinTaxi: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinEmoji: {
    fontSize: 20,
  },
  pinLabel: {
    fontSize: 9,
    color: COULEURS.texte,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  progressionBloc: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  etapeRangee: {
    alignItems: 'center',
    flex: 1,
  },
  etapeGauche: {
    alignItems: 'center',
    width: '100%',
  },
  etapeCercle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COULEURS.surface,
    borderWidth: 2,
    borderColor: COULEURS.bordure,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etapeCercleActif: {
    borderColor: COULEURS.primaire,
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
  },
  etapeIcone: {
    fontSize: 14,
  },
  etapeTiret: {
    position: 'absolute',
    left: '50%',
    top: 17,
    right: '-50%',
    height: 2,
    backgroundColor: COULEURS.bordure,
  },
  etapeTiretActif: {
    backgroundColor: COULEURS.primaire,
  },
  etapeLabel: {
    fontSize: 11,
    color: COULEURS.discret,
    marginTop: 6,
    textAlign: 'center',
  },
  etapeLabelActif: {
    color: COULEURS.primaire,
    fontWeight: '600',
  },
  carteDefilement: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statutBandeau: {
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.3)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statutTexte: {
    fontSize: 14,
    fontWeight: '600',
    color: COULEURS.primaire,
  },
  chauffeurCarte: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COULEURS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    gap: 14,
    marginBottom: 12,
  },
  chauffeurAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COULEURS.primaire,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexte: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  chauffeurInfo: {
    flex: 1,
  },
  chauffeurNom: {
    fontSize: 16,
    fontWeight: '700',
    color: COULEURS.texte,
    marginBottom: 2,
  },
  chauffeurVoiture: {
    fontSize: 13,
    color: COULEURS.discret,
    marginBottom: 6,
  },
  chauffeurMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  chauffeurNote: {
    fontSize: 13,
    color: COULEURS.texte,
  },
  plaqueConteneur: {
    backgroundColor: COULEURS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    marginBottom: 12,
    alignItems: 'center',
  },
  plaqueEtiquette: {
    fontSize: 12,
    color: COULEURS.discret,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  plaqueAffichage: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 3,
    borderColor: '#003399',
    marginBottom: 10,
  },
  plaqueTexte: {
    fontSize: 26,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 3,
    fontVariant: ['tabular-nums'],
  },
  plaqueConseil: {
    fontSize: 11,
    color: COULEURS.discret,
    textAlign: 'center',
  },
  boutonsRangee: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  boutonAction: {
    flex: 1,
    backgroundColor: COULEURS.surface,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  boutonActionEmoji: {
    fontSize: 22,
  },
  boutonActionTexte: {
    fontSize: 13,
    fontWeight: '600',
    color: COULEURS.texte,
  },
  boutonAnnuler: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  boutonAnnulerTexte: {
    fontSize: 13,
    color: '#F44336',
    fontWeight: '500',
  },
});
