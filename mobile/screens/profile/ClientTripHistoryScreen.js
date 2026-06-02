import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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

const COURSES_MOCK = [
  {
    id: '1',
    depart: 'Aéroport Houari Boumediene',
    destination: 'Hôtel El Aurassi, Alger',
    chauffeur: 'Karim Messaoudi',
    prix: 850,
    date: '28 mai 2026',
    duree: '34 min',
    statut: 'Terminé',
    distance: 22.4,
  },
  {
    id: '2',
    depart: 'Place du 1er Mai, Alger',
    destination: 'Université USTHB, Bab Ezzouar',
    chauffeur: 'Youcef Benali',
    prix: 420,
    date: '25 mai 2026',
    duree: '21 min',
    statut: 'Terminé',
    distance: 11.8,
  },
  {
    id: '3',
    depart: 'Gare d\'Agha, Alger',
    destination: 'Centre Commercial Bab Ezzouar',
    chauffeur: 'Sofiane Aït Kaci',
    prix: 0,
    date: '22 mai 2026',
    duree: '—',
    statut: 'Annulé',
    distance: 0,
  },
  {
    id: '4',
    depart: 'Hydra, Alger',
    destination: 'Palais des Nations, Club des Pins',
    chauffeur: 'Redouane Hadjadj',
    prix: 1100,
    date: '18 mai 2026',
    duree: '42 min',
    statut: 'Terminé',
    distance: 28.1,
  },
  {
    id: '5',
    depart: 'Sidi Yahia, Alger',
    destination: 'Zeralda Plage',
    chauffeur: 'Mourad Chafai',
    prix: 1350,
    date: '15 mai 2026',
    duree: '51 min',
    statut: 'Terminé',
    distance: 35.6,
  },
  {
    id: '6',
    depart: 'Bab El Oued, Alger',
    destination: 'Ben Aknoun, Alger',
    chauffeur: 'Nassim Ziani',
    prix: 0,
    date: '10 mai 2026',
    duree: '—',
    statut: 'Annulé',
    distance: 0,
  },
  {
    id: '7',
    depart: 'El Harrach, Alger',
    destination: 'Kouba, Alger',
    chauffeur: 'Hicham Ouali',
    prix: 380,
    date: '5 mai 2026',
    duree: '18 min',
    statut: 'Terminé',
    distance: 9.3,
  },
  {
    id: '8',
    depart: 'Cheraga, Alger',
    destination: 'Alger Centre, Didouche Mourad',
    chauffeur: 'Billal Sahraoui',
    prix: 650,
    date: '2 juin 2026',
    duree: '28 min',
    statut: 'Terminé',
    distance: 17.2,
  },
  {
    id: '9',
    depart: 'Bir Mourad Raïs, Alger',
    destination: 'Hussein Dey, Alger',
    chauffeur: 'Antar Belhadj',
    prix: 510,
    date: '1 juin 2026',
    duree: '23 min',
    statut: 'Terminé',
    distance: 13.5,
  },
  {
    id: '10',
    depart: 'Draria, Alger',
    destination: 'Dar El Beida, Alger',
    chauffeur: 'Fares Boukhalfa',
    prix: 790,
    date: '30 mai 2026',
    duree: '31 min',
    statut: 'Terminé',
    distance: 20.7,
  },
];

const FILTRES = ['Tous', 'Ce mois', 'Cette semaine'];

const coursesMoisCourant = COURSES_MOCK.filter((c) =>
  ['28 mai 2026', '25 mai 2026', '22 mai 2026', '18 mai 2026', '15 mai 2026', '10 mai 2026', '5 mai 2026', '2 juin 2026', '1 juin 2026', '30 mai 2026'].includes(c.date)
);

const coursesSemaine = COURSES_MOCK.filter((c) =>
  ['2 juin 2026', '1 juin 2026', '30 mai 2026', '28 mai 2026'].includes(c.date)
);

export default function ClientTripHistoryScreen({ navigation }) {
  const [filtreActif, setFiltreActif] = useState('Tous');

  const coursesFiltrees = () => {
    if (filtreActif === 'Ce mois') return coursesMoisCourant;
    if (filtreActif === 'Cette semaine') return coursesSemaine;
    return COURSES_MOCK;
  };

  const coursesTerminees = coursesFiltrees().filter((c) => c.statut === 'Terminé');
  const totalDepense = coursesTerminees.reduce((s, c) => s + c.prix, 0);
  const distanceTotale = coursesTerminees.reduce((s, c) => s + c.distance, 0);

  const renderCourse = ({ item }) => (
    <TouchableOpacity
      style={styles.carteEourse}
      onPress={() => navigation.navigate('TaxiOrderDetail', { orderId: item.id })}
      activeOpacity={0.75}
    >
      <View style={styles.courseEntete}>
        <View style={styles.courseItineraire}>
          <View style={styles.ligneItineraire}>
            <View style={[styles.pointItineraire, styles.pointDepart]} />
            <Text style={styles.lieuTexte} numberOfLines={1}>
              {item.depart}
            </Text>
          </View>
          <View style={styles.tiretItineraire} />
          <View style={styles.ligneItineraire}>
            <View style={[styles.pointItineraire, styles.pointArrivee]} />
            <Text style={styles.lieuTexte} numberOfLines={1}>
              {item.destination}
            </Text>
          </View>
        </View>
        <View style={styles.coursePrixBloc}>
          <Text
            style={[
              styles.prixTexte,
              item.statut === 'Annulé' && styles.prixAnnule,
            ]}
          >
            {item.statut === 'Annulé' ? '—' : `${item.prix} DA`}
          </Text>
          <View
            style={[
              styles.statutBadge,
              item.statut === 'Annulé' ? styles.badgeAnnule : styles.badgeTermine,
            ]}
          >
            <Text style={styles.statutTexte}>{item.statut}</Text>
          </View>
        </View>
      </View>
      <View style={styles.courseMeta}>
        <Text style={styles.metaTexte}>🧑‍✈️ {item.chauffeur}</Text>
        <Text style={styles.metaTexte}>🗓 {item.date}</Text>
        {item.statut !== 'Annulé' && (
          <Text style={styles.metaTexte}>⏱ {item.duree}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.entete}>
        <Text style={styles.titreEcran}>Historique des courses</Text>
      </View>

      <View style={styles.resumeBloc}>
        <View style={styles.resumeItem}>
          <Text style={styles.resumeValeur}>{totalDepense.toLocaleString('fr-DZ')} DA</Text>
          <Text style={styles.resumeLabel}>Total dépensé</Text>
        </View>
        <View style={styles.separateurVertical} />
        <View style={styles.resumeItem}>
          <Text style={styles.resumeValeur}>{coursesTerminees.length}</Text>
          <Text style={styles.resumeLabel}>Courses</Text>
        </View>
        <View style={styles.separateurVertical} />
        <View style={styles.resumeItem}>
          <Text style={styles.resumeValeur}>{distanceTotale.toFixed(1)} km</Text>
          <Text style={styles.resumeLabel}>Distance totale</Text>
        </View>
      </View>

      <View style={styles.filtresRangee}>
        {FILTRES.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filtreBouton, filtreActif === f && styles.filtreActif]}
            onPress={() => setFiltreActif(f)}
          >
            <Text
              style={[styles.filtreTexte, filtreActif === f && styles.filtreTexteActif]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={coursesFiltrees()}
        keyExtractor={(item) => item.id}
        renderItem={renderCourse}
        contentContainerStyle={styles.listePadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.videTexte}>Aucune course pour cette période</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: COULEURS.fond,
  },
  entete: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  titreEcran: {
    fontSize: 24,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  resumeBloc: {
    flexDirection: 'row',
    backgroundColor: COULEURS.surface,
    marginHorizontal: 16,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  resumeItem: {
    flex: 1,
    alignItems: 'center',
  },
  resumeValeur: {
    fontSize: 16,
    fontWeight: '700',
    color: COULEURS.primaire,
    marginBottom: 4,
  },
  resumeLabel: {
    fontSize: 12,
    color: COULEURS.discret,
  },
  separateurVertical: {
    width: 1,
    backgroundColor: COULEURS.bordure,
  },
  filtresRangee: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filtreBouton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COULEURS.surface,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  filtreActif: {
    backgroundColor: COULEURS.primaire,
    borderColor: COULEURS.primaire,
  },
  filtreTexte: {
    fontSize: 13,
    color: COULEURS.discret,
    fontWeight: '500',
  },
  filtreTexteActif: {
    color: '#000000',
    fontWeight: '700',
  },
  listePadding: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  carteEourse: {
    backgroundColor: COULEURS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  courseEntete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseItineraire: {
    flex: 1,
    marginRight: 12,
  },
  ligneItineraire: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tiretItineraire: {
    width: 2,
    height: 12,
    backgroundColor: COULEURS.bordure,
    marginLeft: 5,
    marginVertical: 2,
  },
  pointItineraire: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pointDepart: {
    backgroundColor: COULEURS.primaire,
  },
  pointArrivee: {
    backgroundColor: '#4CAF50',
  },
  lieuTexte: {
    flex: 1,
    fontSize: 13,
    color: COULEURS.texte,
  },
  coursePrixBloc: {
    alignItems: 'flex-end',
    gap: 6,
  },
  prixTexte: {
    fontSize: 16,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  prixAnnule: {
    color: COULEURS.discret,
  },
  statutBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeTermine: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  badgeAnnule: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  statutTexte: {
    fontSize: 11,
    fontWeight: '600',
    color: COULEURS.texte,
  },
  courseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COULEURS.bordure,
  },
  metaTexte: {
    fontSize: 12,
    color: COULEURS.discret,
  },
  videTexte: {
    textAlign: 'center',
    color: COULEURS.discret,
    marginTop: 48,
    fontSize: 15,
  },
});
