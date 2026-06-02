import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COURSES = [
  {
    id: '1',
    depart: 'Aéroport Mohammed V',
    destination: 'Hôtel Kenzi Tower, Casablanca',
    date: '04 juin 2026',
    heure: '08:30',
    vehicule: 'Berline',
    prix: '120 MAD',
    statut: 'Confirmée',
  },
  {
    id: '2',
    depart: 'Résidence Al Mazar, Rabat',
    destination: 'Gare de Rabat-Ville',
    date: '05 juin 2026',
    heure: '07:00',
    vehicule: 'Économique',
    prix: '45 MAD',
    statut: 'En attente',
  },
  {
    id: '3',
    depart: 'Centre commercial Morocco Mall',
    destination: 'Quartier Gauthier, Casablanca',
    date: '06 juin 2026',
    heure: '14:15',
    vehicule: 'SUV',
    prix: '85 MAD',
    statut: 'Confirmée',
  },
  {
    id: '4',
    depart: 'Gare Casa-Port',
    destination: 'Aéroport Mohammed V',
    date: '07 juin 2026',
    heure: '10:00',
    vehicule: 'Berline',
    prix: '130 MAD',
    statut: 'Annulée',
  },
  {
    id: '5',
    depart: 'Hôpital Ibn Sina, Rabat',
    destination: 'Hay Riad, Rabat',
    date: '08 juin 2026',
    heure: '16:45',
    vehicule: 'Économique',
    prix: '35 MAD',
    statut: 'En attente',
  },
];

const COULEUR_STATUT = {
  Confirmée: '#4CAF50',
  'En attente': '#F5A623',
  Annulée: '#E53935',
};

export default function TaxiScheduledRidesScreen({ navigation }) {
  const [courses, setCourses] = useState(COURSES);

  const coursesAVenir = courses.filter((c) => c.statut !== 'Annulée').length;

  const ouvrirOptions = (course) => {
    Alert.alert(
      course.depart + ' → ' + course.destination,
      'Que souhaitez-vous faire ?',
      [
        {
          text: 'Voir détails',
          onPress: () =>
            Alert.alert(
              'Détails de la course',
              `Départ : ${course.depart}\nDestination : ${course.destination}\nDate : ${course.date} à ${course.heure}\nVéhicule : ${course.vehicule}\nPrix estimé : ${course.prix}\nStatut : ${course.statut}`
            ),
        },
        {
          text: 'Modifier',
          onPress: () => Alert.alert('Modification', 'Fonctionnalité bientôt disponible.'),
        },
        {
          text: 'Annuler la course',
          style: 'destructive',
          onPress: () =>
            setCourses((prev) =>
              prev.map((c) => (c.id === course.id ? { ...c, statut: 'Annulée' } : c))
            ),
        },
        { text: 'Fermer', style: 'cancel' },
      ]
    );
  };

  const rendreCourse = ({ item }) => (
    <TouchableOpacity style={styles.carte} onPress={() => ouvrirOptions(item)} activeOpacity={0.8}>
      <View style={styles.carteEntete}>
        <View style={styles.trajet}>
          <Text style={styles.lieuTexte} numberOfLines={1}>
            {item.depart}
          </Text>
          <Text style={styles.fleche}>→</Text>
          <Text style={styles.lieuTexte} numberOfLines={1}>
            {item.destination}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: COULEUR_STATUT[item.statut] + '22' }]}>
          <Text style={[styles.badgeTexte, { color: COULEUR_STATUT[item.statut] }]}>
            {item.statut}
          </Text>
        </View>
      </View>
      <View style={styles.carteBas}>
        <Text style={styles.infoTexte}>
          📅 {item.date} · {item.heure}
        </Text>
        <Text style={styles.infoTexte}>🚗 {item.vehicule}</Text>
        <Text style={styles.prix}>{item.prix}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.entete}>
        <Text style={styles.titre}>Courses planifiées</Text>
        <View style={styles.compteur}>
          <Text style={styles.compteurTexte}>{coursesAVenir} courses à venir cette semaine</Text>
        </View>
      </View>

      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={rendreCourse}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.basBouton}>
        <TouchableOpacity
          style={styles.boutonNouvelle}
          onPress={() => navigation.navigate('TaxiScheduleRide')}
          activeOpacity={0.85}
        >
          <Text style={styles.boutonNouvelleTexte}>+ Nouvelle course planifiée</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  entete: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  titre: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  compteur: {
    backgroundColor: '#F5A62322',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  compteurTexte: {
    color: '#F5A623',
    fontSize: 13,
    fontWeight: '600',
  },
  liste: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  carte: {
    backgroundColor: '#1C1C28',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  carteEntete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  trajet: {
    flex: 1,
    marginRight: 10,
  },
  lieuTexte: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  fleche: {
    color: '#F5A623',
    fontSize: 14,
    marginVertical: 2,
  },
  badge: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeTexte: {
    fontSize: 12,
    fontWeight: '600',
  },
  carteBas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoTexte: {
    color: '#8E8E9A',
    fontSize: 12,
    marginRight: 8,
  },
  prix: {
    color: '#F5A623',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  basBouton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#0A0A0F',
    borderTopWidth: 1,
    borderTopColor: '#2C2C3A',
  },
  boutonNouvelle: {
    backgroundColor: '#F5A623',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  boutonNouvelleTexte: {
    color: '#0A0A0F',
    fontSize: 16,
    fontWeight: '700',
  },
});
