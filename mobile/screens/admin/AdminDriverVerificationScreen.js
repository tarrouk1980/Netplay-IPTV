import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COULEURS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  texte: '#FFFFFF',
  muet: '#8E8E9A',
  bordure: '#2C2C3A',
  succes: '#22C55E',
  danger: '#EF4444',
  info: '#3B82F6',
  avertissement: '#F59E0B',
};

const CHAUFFEURS_MOCK = [
  {
    id: 'DRV001',
    nom: 'Amadou Diarra',
    initiales: 'AD',
    couleurAvatar: '#7C3AED',
    datesoumission: '1 juin 2026',
    telephone: '+223 76 12 34 56',
    documents: {
      carteGrise: true,
      permis: true,
      cni: false,
    },
  },
  {
    id: 'DRV002',
    nom: 'Fatoumata Coulibaly',
    initiales: 'FC',
    couleurAvatar: '#0891B2',
    datesoumission: '31 mai 2026',
    telephone: '+223 65 98 76 54',
    documents: {
      carteGrise: true,
      permis: false,
      cni: true,
    },
  },
  {
    id: 'DRV003',
    nom: 'Ibrahim Touré',
    initiales: 'IT',
    couleurAvatar: '#059669',
    datesoumission: '30 mai 2026',
    telephone: '+223 79 44 55 66',
    documents: {
      carteGrise: true,
      permis: true,
      cni: true,
    },
  },
  {
    id: 'DRV004',
    nom: 'Mariam Keïta',
    initiales: 'MK',
    couleurAvatar: '#DC2626',
    datesoumission: '29 mai 2026',
    telephone: '+223 66 22 33 44',
    documents: {
      carteGrise: false,
      permis: true,
      cni: true,
    },
  },
  {
    id: 'DRV005',
    nom: 'Ousmane Sanogo',
    initiales: 'OS',
    couleurAvatar: '#D97706',
    datesoumission: '28 mai 2026',
    telephone: '+223 75 88 99 00',
    documents: {
      carteGrise: true,
      permis: true,
      cni: false,
    },
  },
  {
    id: 'DRV006',
    nom: 'Aminata Traoré',
    initiales: 'AT',
    couleurAvatar: '#BE185D',
    datesoumission: '27 mai 2026',
    telephone: '+223 70 55 66 77',
    documents: {
      carteGrise: true,
      permis: true,
      cni: true,
    },
  },
];

const RAISONS_REJET = [
  'Documents illisibles',
  'Documents expirés',
  'Informations incorrectes',
  'Permis non valide',
  'Dossier incomplet',
];

export default function AdminDriverVerificationScreen() {
  const [chauffeurs, setChauffeurs] = useState(CHAUFFEURS_MOCK);
  const [approuvesCount] = useState(14);

  const enAttente = chauffeurs.filter((c) => !c.traite).length;

  const approuverChauffeur = (chauffeur) => {
    Alert.alert(
      'Approuver le chauffeur',
      `Voulez-vous approuver ${chauffeur.nom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Approuver',
          style: 'default',
          onPress: () => {
            setChauffeurs((prev) =>
              prev.map((c) =>
                c.id === chauffeur.id ? { ...c, traite: true, decision: 'approuve' } : c
              )
            );
            Alert.alert('Succès', `${chauffeur.nom} a été approuvé avec succès.`);
          },
        },
      ]
    );
  };

  const rejeterChauffeur = (chauffeur) => {
    Alert.alert(
      'Rejeter le chauffeur',
      `Sélectionnez une raison pour rejeter ${chauffeur.nom} :`,
      [
        ...RAISONS_REJET.map((raison) => ({
          text: raison,
          onPress: () => {
            setChauffeurs((prev) =>
              prev.map((c) =>
                c.id === chauffeur.id ? { ...c, traite: true, decision: 'rejete' } : c
              )
            );
            Alert.alert('Rejet confirmé', `${chauffeur.nom} a été rejeté : ${raison}`);
          },
        })),
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const iconDoc = (valide) => (valide ? '✅' : '⏳');

  const rendreChauffeur = ({ item }) => (
    <View style={[styles.carte, item.traite && styles.carteTraitee]}>
      <View style={styles.carteEntete}>
        <View style={[styles.avatar, { backgroundColor: item.couleurAvatar }]}>
          <Text style={styles.avatarInitiales}>{item.initiales}</Text>
        </View>
        <View style={styles.infosChauffeur}>
          <Text style={styles.nomTexte}>{item.nom}</Text>
          <Text style={styles.telTexte}>{item.telephone}</Text>
          <Text style={styles.dateTexte}>Soumis le {item.datesoumission}</Text>
        </View>
        {item.traite && (
          <View
            style={[
              styles.badgeDecision,
              {
                backgroundColor:
                  item.decision === 'approuve'
                    ? COULEURS.succes + '22'
                    : COULEURS.danger + '22',
              },
            ]}
          >
            <Text
              style={[
                styles.badgeDecisionTexte,
                {
                  color:
                    item.decision === 'approuve' ? COULEURS.succes : COULEURS.danger,
                },
              ]}
            >
              {item.decision === 'approuve' ? 'Approuvé' : 'Rejeté'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.documentsRangee}>
        <View style={styles.docItem}>
          <Text style={styles.docEmoji}>{iconDoc(item.documents.carteGrise)}</Text>
          <Text style={styles.docTexte}>Carte grise</Text>
        </View>
        <View style={styles.docItem}>
          <Text style={styles.docEmoji}>{iconDoc(item.documents.permis)}</Text>
          <Text style={styles.docTexte}>Permis</Text>
        </View>
        <View style={styles.docItem}>
          <Text style={styles.docEmoji}>{iconDoc(item.documents.cni)}</Text>
          <Text style={styles.docTexte}>CNI</Text>
        </View>
      </View>

      {!item.traite && (
        <View style={styles.boutonRangee}>
          <TouchableOpacity
            style={styles.boutonApprouver}
            onPress={() => approuverChauffeur(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.boutonApprouverTexte}>Approuver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.boutonRejeter}
            onPress={() => rejeterChauffeur(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.boutonRejeterTexte}>Rejeter</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.entete}>
        <Text style={styles.titre}>Vérification chauffeurs</Text>
        <View style={styles.compteurRangee}>
          <View style={styles.compteurItem}>
            <Text style={styles.compteurNombre}>{enAttente}</Text>
            <Text style={styles.compteurLabel}>En attente</Text>
          </View>
          <View style={styles.separateurVertical} />
          <View style={styles.compteurItem}>
            <Text style={[styles.compteurNombre, { color: COULEURS.succes }]}>
              {approuvesCount}
            </Text>
            <Text style={styles.compteurLabel}>Approuvés ce mois</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={chauffeurs}
        keyExtractor={(item) => item.id}
        renderItem={rendreChauffeur}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
      />
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COULEURS.bordure,
  },
  titre: {
    fontSize: 24,
    fontWeight: '700',
    color: COULEURS.texte,
    marginBottom: 16,
  },
  compteurRangee: {
    flexDirection: 'row',
    backgroundColor: COULEURS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    gap: 20,
    alignItems: 'center',
  },
  compteurItem: {
    flex: 1,
    alignItems: 'center',
  },
  compteurNombre: {
    fontSize: 28,
    fontWeight: '800',
    color: COULEURS.primary,
  },
  compteurLabel: {
    fontSize: 12,
    color: COULEURS.muet,
    marginTop: 2,
  },
  separateurVertical: {
    width: 1,
    height: 40,
    backgroundColor: COULEURS.bordure,
  },
  liste: {
    padding: 20,
    gap: 14,
  },
  carte: {
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    gap: 14,
  },
  carteTraitee: {
    opacity: 0.6,
  },
  carteEntete: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitiales: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infosChauffeur: {
    flex: 1,
    gap: 2,
  },
  nomTexte: {
    fontSize: 16,
    fontWeight: '600',
    color: COULEURS.texte,
  },
  telTexte: {
    fontSize: 13,
    color: COULEURS.muet,
  },
  dateTexte: {
    fontSize: 12,
    color: COULEURS.muet,
  },
  badgeDecision: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  badgeDecisionTexte: {
    fontSize: 12,
    fontWeight: '600',
  },
  documentsRangee: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: COULEURS.bg,
    borderRadius: 10,
    padding: 12,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docEmoji: {
    fontSize: 16,
  },
  docTexte: {
    fontSize: 12,
    color: COULEURS.muet,
  },
  boutonRangee: {
    flexDirection: 'row',
    gap: 10,
  },
  boutonApprouver: {
    flex: 1,
    backgroundColor: COULEURS.succes,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  boutonApprouverTexte: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  boutonRejeter: {
    flex: 1,
    backgroundColor: COULEURS.danger + '22',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COULEURS.danger,
  },
  boutonRejeterTexte: {
    fontSize: 14,
    fontWeight: '700',
    color: COULEURS.danger,
  },
});
