import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COULEURS = {
  fond: '#0A0A0F',
  surface: '#1C1C28',
  primaire: '#F5A623',
  texte: '#FFFFFF',
  discret: '#8E8E9A',
  bordure: '#2C2C3A',
};

const STATUT_LABELS = {
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
  IN_PROGRESS: 'En cours',
  PENDING: 'En attente',
};

const FILTRES = ['Tous', 'Ce mois', 'Cette semaine'];

function estDansLeMois(date) {
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function estDansLaSemaine(date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
}

export default function ClientTripHistoryScreen({ navigation }) {
  const [filtreActif, setFiltreActif] = useState('Tous');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/users/me/orders');
      const orders = (res.data.orders || []).filter((o) => o.serviceType === 'TAXI');
      const mapped = orders.map((o) => {
        const createdAt = new Date(o.createdAt);
        return {
          id: o.id,
          depart: o.originAddress || '—',
          destination: o.destinationAddress || '—',
          chauffeur: o.provider?.name || '—',
          prix: o.finalPrice ?? o.price ?? 0,
          date: createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
          dateObj: createdAt,
          duree: '—',
          statut: STATUT_LABELS[o.status] || o.status,
          distance: 0,
        };
      });
      setCourses(mapped);
    } catch (err) {
      console.error('[ClientTripHistoryScreen] load failed', err);
      setCourses([]);
      setError('Impossible de charger l\'historique des courses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const coursesFiltrees = () => {
    if (filtreActif === 'Ce mois') return courses.filter((c) => estDansLeMois(c.dateObj));
    if (filtreActif === 'Cette semaine') return courses.filter((c) => estDansLaSemaine(c.dateObj));
    return courses;
  };

  const coursesTerminees = coursesFiltrees().filter((c) => c.statut === 'Terminé');
  const totalDepense = coursesTerminees.reduce((s, c) => s + c.prix, 0);

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

      {loading && <ActivityIndicator color={COULEURS.primaire} style={{ marginTop: 24 }} />}
      {!loading && error && (
        <Text style={[styles.videTexte, { color: '#E74C3C' }]}>{error}</Text>
      )}
      {!loading && !error && (
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
      )}
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
