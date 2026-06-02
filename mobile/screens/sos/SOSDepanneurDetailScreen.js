import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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

const DEPANNEUR = {
  id: '1',
  nom: 'Karim Bouaziz',
  initiales: 'KB',
  couleurAvatar: '#2E4A7A',
  note: 4.8,
  coursesTotales: 342,
  anneesExperience: 7,
  specialites: ['Crevaison', 'Batterie', 'Remorquage', 'Panne moteur'],
  latitude: 36.737,
  longitude: 3.086,
};

const AVIS = [
  { id: '1', nom: 'Mehdi R.', note: 5, commentaire: 'Très rapide et professionnel, réparé en moins de 20 minutes.', date: '12 mai 2025' },
  { id: '2', nom: 'Amira K.', note: 5, commentaire: 'Parfait ! Il est arrivé en 10 minutes seulement. Je recommande vivement.', date: '3 mai 2025' },
  { id: '3', nom: 'Yacine B.', note: 4, commentaire: 'Bon service, prix raisonnable. Juste un peu de retard au départ.', date: '28 avr. 2025' },
  { id: '4', nom: 'Soumia L.', note: 5, commentaire: 'Excellent travail. Ma batterie remplacée rapidement. Merci !', date: '15 avr. 2025' },
  { id: '5', nom: 'Omar T.', note: 4, commentaire: 'Compétent et sympa. Le remorquage s\'est bien passé sans aucun problème.', date: '2 avr. 2025' },
];

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

export default function SOSDepanneurDetailScreen({ navigation }) {
  const [suiviActif] = useState(true);

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
          <View style={[styles.avatar, { backgroundColor: DEPANNEUR.couleurAvatar }]}>
            <Text style={styles.avatarInitiales}>{DEPANNEUR.initiales}</Text>
          </View>
          <Text style={styles.emoji}>🛻</Text>
          <Text style={styles.nomDepanneur}>{DEPANNEUR.nom}</Text>
          <View style={styles.noteLigne}>
            <Etoiles note={DEPANNEUR.note} taille={18} />
            <Text style={styles.noteTexte}>{DEPANNEUR.note}/5</Text>
          </View>
          <View style={styles.badgeDisponible}>
            <View style={styles.pointVert} />
            <Text style={styles.texteDisponible}>Disponible maintenant</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.titreSec}>Statistiques</Text>
          <View style={styles.statsGrille}>
            <View style={styles.statItem}>
              <Text style={styles.statValeur}>{DEPANNEUR.coursesTotales}</Text>
              <Text style={styles.statLabel}>Courses{'\n'}totales</Text>
            </View>
            <View style={[styles.statItem, styles.statItemMilieu]}>
              <Text style={styles.statValeur}>{DEPANNEUR.note}</Text>
              <Text style={styles.statLabel}>Note{'\n'}moyenne</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValeur}>{DEPANNEUR.anneesExperience}</Text>
              <Text style={styles.statLabel}>Années{'\n'}d'expérience</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.titreSec}>Spécialités</Text>
          <View style={styles.chipsLigne}>
            {DEPANNEUR.specialites.map((s) => (
              <View key={s} style={styles.chip}>
                <Text style={styles.chipTexte}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.titreSec}>Localisation approximative</Text>
          <View style={styles.carteSim}>
            <View style={styles.grilleCarte}>
              {Array.from({ length: 20 }).map((_, i) => (
                <View key={i} style={styles.celuleCarte} />
              ))}
            </View>
            <View style={styles.pinCentre}>
              <View style={styles.pinCercle}>
                <Text style={styles.pinTexte}>🛻</Text>
              </View>
              <View style={styles.pinQueue} />
            </View>
            <Text style={styles.distanceLabel}>À ~2,3 km de vous</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.titreSec}>Avis clients ({AVIS.length})</Text>
          {AVIS.map((avis) => (
            <View key={avis.id} style={styles.carteAvis}>
              <View style={styles.avisEntete}>
                <View style={styles.avisAvatar}>
                  <Text style={styles.avisAvatarTexte}>{avis.nom[0]}</Text>
                </View>
                <View style={styles.avisInfo}>
                  <Text style={styles.avisNom}>{avis.nom}</Text>
                  <Etoiles note={avis.note} taille={13} />
                </View>
                <Text style={styles.avisDate}>{avis.date}</Text>
              </View>
              <Text style={styles.avisCommentaire}>{avis.commentaire}</Text>
            </View>
          ))}
        </View>

        <View style={styles.espaceFin} />
      </ScrollView>

      <View style={styles.barreActions}>
        <TouchableOpacity
          style={[styles.boutonAction, styles.boutonAppel]}
          onPress={() => Alert.alert('Appel', `Appel en cours vers ${DEPANNEUR.nom}…`)}
        >
          <Text style={styles.boutonActionTexte}>📞 Appeler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.boutonAction, styles.boutonContact]}
          onPress={() => navigation.navigate('Chat', { depanneurId: DEPANNEUR.id, nom: DEPANNEUR.nom })}
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
  statsGrille: {
    flexDirection: 'row',
    backgroundColor: COULEURS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    overflow: 'hidden',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statItemMilieu: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COULEURS.bordure,
  },
  statValeur: { color: COULEURS.primaire, fontSize: 24, fontWeight: '800' },
  statLabel: { color: COULEURS.muet, fontSize: 11, textAlign: 'center', marginTop: 4 },
  chipsLigne: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderWidth: 1,
    borderColor: COULEURS.primaire,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipTexte: { color: COULEURS.primaire, fontSize: 13, fontWeight: '600' },
  carteSim: {
    height: 160,
    backgroundColor: '#12172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grilleCarte: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  celuleCarte: {
    width: '20%',
    height: '25%',
    borderWidth: 0.5,
    borderColor: 'rgba(44,44,58,0.6)',
  },
  pinCentre: { alignItems: 'center' },
  pinCercle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COULEURS.primaire,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COULEURS.primaire,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  pinTexte: { fontSize: 20 },
  pinQueue: {
    width: 3,
    height: 14,
    backgroundColor: COULEURS.primaire,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  distanceLabel: {
    position: 'absolute',
    bottom: 10,
    color: COULEURS.muet,
    fontSize: 12,
  },
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
