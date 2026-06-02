import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
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

const CHIPS = ['Conduite douce', 'Propre', 'Ponctuel', 'Sympa', 'Professionnel'];

const COURSE = {
  chauffeur: { prenom: 'Karim', nom: 'Benali', initiales: 'KB', couleurAvatar: '#3B5BDB' },
  vehicule: 'Peugeot 308 · Blanc · AB-245-CD',
  depart: 'Aéroport Houari Boumediene',
  arrivee: 'Place Audin, Alger Centre',
  prix: '850 DA',
};

export default function TaxiRatingScreen({ navigation }) {
  const [etoiles, setEtoiles] = useState(0);
  const [chipsSelectionnees, setChipsSelectionnees] = useState([]);
  const [commentaire, setCommentaire] = useState('');

  function toggleChip(chip) {
    setChipsSelectionnees(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  }

  function soumettre() {
    Alert.alert(
      'Merci !',
      'Votre évaluation a bien été envoyée.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.titre}>Évaluer la course</Text>

        <View style={styles.cardChauffeur}>
          <View style={[styles.avatar, { backgroundColor: COURSE.chauffeur.couleurAvatar }]}>
            <Text style={styles.avatarTexte}>{COURSE.chauffeur.initiales}</Text>
          </View>
          <View style={styles.infoChauffeur}>
            <Text style={styles.nomChauffeur}>
              {COURSE.chauffeur.prenom} {COURSE.chauffeur.nom}
            </Text>
            <Text style={styles.vehiculeTexte}>{COURSE.vehicule}</Text>
          </View>
        </View>

        <View style={styles.cardTrajet}>
          <View style={styles.ligneTrajet}>
            <View style={styles.pointVert} />
            <Text style={styles.texteTrajet}>{COURSE.depart}</Text>
          </View>
          <View style={styles.ligneConnecteur} />
          <View style={styles.ligneTrajet}>
            <View style={styles.pointRouge} />
            <Text style={styles.texteTrajet}>{COURSE.arrivee}</Text>
          </View>
          <View style={styles.separateur} />
          <Text style={styles.prixTexte}>Prix payé : <Text style={styles.prixValeur}>{COURSE.prix}</Text></Text>
        </View>

        <Text style={styles.sectionTitre}>Votre note</Text>
        <View style={styles.etoilesConteneur}>
          {[1, 2, 3, 4, 5].map(i => (
            <TouchableOpacity key={i} onPress={() => setEtoiles(i)} activeOpacity={0.7}>
              <Text style={[styles.etoile, i <= etoiles && styles.etoileActive]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitre}>Points positifs</Text>
        <View style={styles.chipsConteneur}>
          {CHIPS.map(chip => {
            const selectionne = chipsSelectionnees.includes(chip);
            return (
              <TouchableOpacity
                key={chip}
                style={[styles.chip, selectionne && styles.chipActive]}
                onPress={() => toggleChip(chip)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipTexte, selectionne && styles.chipTexteActive]}>
                  {chip}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitre}>Commentaire (optionnel)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Partagez votre expérience..."
          placeholderTextColor={COULEURS.muted}
          multiline
          numberOfLines={4}
          value={commentaire}
          onChangeText={setCommentaire}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.boutonSoumettre, etoiles === 0 && styles.boutonGrise]}
          onPress={soumettre}
          disabled={etoiles === 0}
          activeOpacity={0.8}
        >
          <Text style={styles.boutonTexte}>Soumettre l'évaluation</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COULEURS.bg,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  titre: {
    fontSize: 24,
    fontWeight: '700',
    color: COULEURS.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  cardChauffeur: {
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarTexte: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoChauffeur: {
    flex: 1,
  },
  nomChauffeur: {
    fontSize: 18,
    fontWeight: '700',
    color: COULEURS.text,
    marginBottom: 4,
  },
  vehiculeTexte: {
    fontSize: 13,
    color: COULEURS.muted,
  },
  cardTrajet: {
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  ligneTrajet: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointVert: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  pointRouge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F44336',
    marginRight: 12,
  },
  ligneConnecteur: {
    width: 2,
    height: 16,
    backgroundColor: COULEURS.border,
    marginLeft: 4,
    marginVertical: 2,
  },
  texteTrajet: {
    fontSize: 14,
    color: COULEURS.text,
    flex: 1,
  },
  separateur: {
    height: 1,
    backgroundColor: COULEURS.border,
    marginVertical: 12,
  },
  prixTexte: {
    fontSize: 14,
    color: COULEURS.muted,
  },
  prixValeur: {
    color: COULEURS.primary,
    fontWeight: '700',
  },
  sectionTitre: {
    fontSize: 16,
    fontWeight: '600',
    color: COULEURS.text,
    marginBottom: 12,
  },
  etoilesConteneur: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 28,
    gap: 8,
  },
  etoile: {
    fontSize: 48,
    color: COULEURS.border,
  },
  etoileActive: {
    color: COULEURS.primary,
  },
  chipsConteneur: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COULEURS.border,
    backgroundColor: COULEURS.surface,
  },
  chipActive: {
    borderColor: COULEURS.primary,
    backgroundColor: 'rgba(245,166,35,0.15)',
  },
  chipTexte: {
    fontSize: 13,
    color: COULEURS.muted,
  },
  chipTexteActive: {
    color: COULEURS.primary,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: COULEURS.surface,
    borderWidth: 1,
    borderColor: COULEURS.border,
    borderRadius: 12,
    padding: 14,
    color: COULEURS.text,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 28,
  },
  boutonSoumettre: {
    backgroundColor: COULEURS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  boutonGrise: {
    backgroundColor: COULEURS.border,
  },
  boutonTexte: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
