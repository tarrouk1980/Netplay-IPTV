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

const COULEURS = {
  fond: '#0A0A0F',
  surface: '#1C1C28',
  primaire: '#F5A623',
  texte: '#FFFFFF',
  muet: '#8E8E9A',
  bordure: '#2C2C3A',
};

const LIVREUR = {
  nom: 'Bilal Mansouri',
  initiales: 'BM',
  couleurAvatar: '#3A2E6E',
  commande: '#CMD-20481',
};

const CHIPS_FEEDBACK = ['Rapide', 'Soigneux', 'Ponctuel', 'Agréable', 'Professionnel'];

export default function DeliveryRateScreen({ navigation }) {
  const [noteSelectionnee, setNoteSelectionnee] = useState(0);
  const [noteHover, setNoteHover] = useState(0);
  const [chipsActives, setChipsActives] = useState([]);
  const [commentaire, setCommentaire] = useState('');

  function toggleChip(chip) {
    setChipsActives((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  }

  function libelle(note) {
    switch (note) {
      case 1: return 'Très mauvais';
      case 2: return 'Mauvais';
      case 3: return 'Correct';
      case 4: return 'Bien';
      case 5: return 'Excellent !';
      default: return 'Appuyez pour noter';
    }
  }

  function soumettre() {
    if (noteSelectionnee === 0) {
      Alert.alert('Notation requise', 'Veuillez sélectionner une note avant de soumettre.');
      return;
    }
    Alert.alert(
      'Merci pour votre avis !',
      `Votre note de ${noteSelectionnee}/5 a été enregistrée pour ${LIVREUR.nom}.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  }

  const noteAffichee = noteHover > 0 ? noteHover : noteSelectionnee;

  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.entete}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.boutonRetour}>
          <Text style={styles.texteRetour}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.titreEntete}>Noter le livreur</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.carteCommande}>
          <Text style={styles.commandeLabel}>Commande</Text>
          <Text style={styles.commandeId}>{LIVREUR.commande}</Text>
        </View>

        <View style={styles.carteHero}>
          <View style={[styles.avatar, { backgroundColor: LIVREUR.couleurAvatar }]}>
            <Text style={styles.avatarInitiales}>{LIVREUR.initiales}</Text>
          </View>
          <Text style={styles.nomLivreur}>{LIVREUR.nom}</Text>
          <Text style={styles.roleLivreur}>Livreur EasyWay</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.titreSec}>Votre note</Text>
          <View style={styles.etoilesGrande}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                onPress={() => setNoteSelectionnee(i)}
                onPressIn={() => setNoteHover(i)}
                onPressOut={() => setNoteHover(0)}
              >
                <Text style={[styles.etoileGrande, { color: i <= noteAffichee ? COULEURS.primaire : COULEURS.bordure }]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.libelleNote, noteSelectionnee > 0 && { color: COULEURS.primaire }]}>
            {libelle(noteSelectionnee)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.titreSec}>Feedback rapide</Text>
          <View style={styles.chipsGrille}>
            {CHIPS_FEEDBACK.map((chip) => {
              const actif = chipsActives.includes(chip);
              return (
                <TouchableOpacity
                  key={chip}
                  style={[styles.chip, actif && styles.chipActif]}
                  onPress={() => toggleChip(chip)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipTexte, actif && styles.chipTexteActif]}>{chip}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.titreSec}>Commentaire (optionnel)</Text>
          <TextInput
            style={styles.champTexte}
            multiline
            numberOfLines={4}
            placeholder="Partagez votre expérience avec ce livreur…"
            placeholderTextColor={COULEURS.muet}
            value={commentaire}
            onChangeText={setCommentaire}
            textAlignVertical="top"
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.barreAction}>
        <TouchableOpacity
          style={[styles.boutonSoumettre, noteSelectionnee === 0 && styles.boutonSoumettreInactif]}
          onPress={soumettre}
          activeOpacity={0.8}
        >
          <Text style={[styles.boutonSoumettreTexte, noteSelectionnee === 0 && { color: COULEURS.muet }]}>
            Soumettre ma note
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: COULEURS.fond },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COULEURS.bordure,
  },
  boutonRetour: { paddingVertical: 4, paddingRight: 12, width: 70 },
  texteRetour: { color: COULEURS.primaire, fontSize: 17 },
  titreEntete: { color: COULEURS.texte, fontSize: 17, fontWeight: '700' },
  carteCommande: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COULEURS.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  commandeLabel: { color: COULEURS.muet, fontSize: 13 },
  commandeId: { color: COULEURS.primaire, fontSize: 13, fontWeight: '700' },
  carteHero: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitiales: { color: COULEURS.texte, fontSize: 28, fontWeight: '700' },
  nomLivreur: { color: COULEURS.texte, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  roleLivreur: { color: COULEURS.muet, fontSize: 13 },
  section: { marginHorizontal: 16, marginTop: 20 },
  titreSec: { color: COULEURS.texte, fontSize: 16, fontWeight: '700', marginBottom: 14 },
  etoilesGrande: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  etoileGrande: { fontSize: 48 },
  libelleNote: {
    color: COULEURS.muet,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  chipsGrille: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: COULEURS.surface,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  chipActif: {
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderColor: COULEURS.primaire,
  },
  chipTexte: { color: COULEURS.muet, fontSize: 13, fontWeight: '600' },
  chipTexteActif: { color: COULEURS.primaire },
  champTexte: {
    backgroundColor: COULEURS.surface,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    borderRadius: 12,
    padding: 14,
    color: COULEURS.texte,
    fontSize: 14,
    minHeight: 100,
    lineHeight: 20,
  },
  barreAction: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COULEURS.bordure,
    backgroundColor: COULEURS.fond,
  },
  boutonSoumettre: {
    backgroundColor: COULEURS.primaire,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  boutonSoumettreInactif: {
    backgroundColor: COULEURS.surface,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  boutonSoumettreTexte: { color: COULEURS.fond, fontSize: 16, fontWeight: '800' },
});
