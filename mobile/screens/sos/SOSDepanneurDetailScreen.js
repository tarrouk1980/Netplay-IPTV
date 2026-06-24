import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COULEURS = {
  fond: '#0A0A0F',
  surface: '#1C1C28',
  primaire: '#F5A623',
  texte: '#FFFFFF',
  muet: '#8E8E9A',
  bordure: '#2C2C3A',
};

function Etoiles({ note, taille = 16 }) {
  return (
    <View style={styles.etoilesLigne}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={[styles.etoile, { fontSize: taille, color: i <= Math.round(note) ? COULEURS.primaire : COULEURS.bordure }]}>
          ★
        </Text>
      ))}
    </View>
  );
}

export default function SOSDepanneurDetailScreen({ navigation, route }) {
  // The backend has no dedicated "depanneur profile by id" endpoint — the only
  // real source for depanneur info is the object returned from /api/sos/nearby
  // (id, name, phone, avgRating, lat, lng, distanceKm), passed in via navigation params.
  const depanneur = route?.params?.depanneur || {};
  const depanneurId = depanneur.id || route?.params?.depanneurId;

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState(false);

  const loadReviews = useCallback(() => {
    if (!depanneurId) { setLoadingReviews(false); return; }
    setLoadingReviews(true);
    api.get(`/api/reviews/${depanneurId}`)
      .then((r) => {
        setReviews(r.data.reviews || []);
        setReviewsError(false);
      })
      .catch(() => setReviewsError(true))
      .finally(() => setLoadingReviews(false));
  }, [depanneurId]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const nom = depanneur.name || 'Dépanneur';
  const initiales = nom
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';
  const note = Number(depanneur.avgRating || 0);
  const distanceKm = depanneur.distanceKm != null ? Number(depanneur.distanceKm) : null;

  const handleCall = () => {
    if (!depanneur.phone) {
      Alert.alert('Indisponible', 'Numéro du dépanneur non disponible.');
      return;
    }
    Linking.openURL(`tel:${depanneur.phone}`);
  };

  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.entete}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.boutonRetour}>
          <Text style={styles.texteRetour}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.titreEntete}>Fiche dépanneur</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.carteHero}>
          <View style={[styles.avatar, { backgroundColor: '#2E4A7A' }]}>
            <Text style={styles.avatarInitiales}>{initiales}</Text>
          </View>
          <Text style={styles.emoji}>🛻</Text>
          <Text style={styles.nomDepanneur}>{nom}</Text>
          <View style={styles.noteLigne}>
            <Etoiles note={note} taille={18} />
            <Text style={styles.noteTexte}>{note.toFixed(1)}/5</Text>
          </View>
          {distanceKm != null && (
            <View style={styles.badgeDisponible}>
              <View style={styles.pointVert} />
              <Text style={styles.texteDisponible}>À ~{distanceKm.toFixed(1)} km de vous</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.titreSec}>Avis clients ({reviews.length})</Text>
          {loadingReviews ? (
            <ActivityIndicator color={COULEURS.primaire} style={{ marginTop: 12 }} />
          ) : reviewsError ? (
            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <Text style={{ color: COULEURS.muet, marginBottom: 10 }}>Impossible de charger les avis.</Text>
              <TouchableOpacity onPress={loadReviews} style={styles.btnRetry}>
                <Text style={styles.btnRetryText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          ) : reviews.length === 0 ? (
            <Text style={{ color: COULEURS.muet }}>Aucun avis pour le moment.</Text>
          ) : (
            reviews.map((avis) => (
              <View key={avis.id} style={styles.carteAvis}>
                <View style={styles.avisEntete}>
                  <View style={styles.avisAvatar}>
                    <Text style={styles.avisAvatarTexte}>{avis.author?.[0] || '?'}</Text>
                  </View>
                  <View style={styles.avisInfo}>
                    <Text style={styles.avisNom}>{avis.author}</Text>
                    <Etoiles note={avis.rating} taille={13} />
                  </View>
                  <Text style={styles.avisDate}>{avis.date}</Text>
                </View>
                {!!avis.comment && <Text style={styles.avisCommentaire}>{avis.comment}</Text>}
              </View>
            ))
          )}
        </View>

        <View style={styles.espaceFin} />
      </ScrollView>

      <View style={styles.barreActions}>
        <TouchableOpacity
          style={[styles.boutonAction, styles.boutonAppel]}
          onPress={handleCall}
        >
          <Text style={styles.boutonActionTexte}>📞 Appeler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.boutonAction, styles.boutonContact]}
          onPress={() => navigation.navigate('Chat', { depanneurId, nom })}
        >
          <Text style={[styles.boutonActionTexte, { color: COULEURS.fond }]}>💬 Contacter</Text>
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
  carteHero: {
    alignItems: 'center',
    backgroundColor: COULEURS.surface,
    marginHorizontal: 16,
    marginTop: 16,
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
    marginBottom: 4,
  },
  avatarInitiales: { color: COULEURS.texte, fontSize: 28, fontWeight: '700' },
  emoji: { fontSize: 24, marginBottom: 8 },
  nomDepanneur: { color: COULEURS.texte, fontSize: 22, fontWeight: '700', marginBottom: 6 },
  noteLigne: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  etoilesLigne: { flexDirection: 'row' },
  etoile: { marginHorizontal: 1 },
  noteTexte: { color: COULEURS.muet, fontSize: 14, marginLeft: 6 },
  badgeDisponible: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39,174,96,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pointVert: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#27AE60', marginRight: 6 },
  texteDisponible: { color: '#27AE60', fontSize: 13, fontWeight: '600' },
  section: { marginHorizontal: 16, marginTop: 20 },
  titreSec: { color: COULEURS.texte, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  btnRetry: { backgroundColor: COULEURS.primaire, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  btnRetryText: { color: COULEURS.fond, fontWeight: '700' },
  carteAvis: {
    backgroundColor: COULEURS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  avisEntete: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avisAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2E3A5C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avisAvatarTexte: { color: COULEURS.texte, fontSize: 15, fontWeight: '700' },
  avisInfo: { flex: 1 },
  avisNom: { color: COULEURS.texte, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  avisDate: { color: COULEURS.muet, fontSize: 11 },
  avisCommentaire: { color: COULEURS.muet, fontSize: 13, lineHeight: 19 },
  espaceFin: { height: 100 },
  barreActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COULEURS.bordure,
    backgroundColor: COULEURS.fond,
  },
  boutonAction: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  boutonAppel: {
    backgroundColor: COULEURS.surface,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  boutonContact: { backgroundColor: COULEURS.primaire },
  boutonActionTexte: { color: COULEURS.texte, fontSize: 15, fontWeight: '700' },
});
