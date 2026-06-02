import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const AVIS = [
  { id: 1, initiales: 'SL', couleur: '#E74C3C', nom: 'S***i', note: 5, commentaire: 'Très professionnel, ponctuel et sympa. Je recommande vivement !', date: '28 mai 2026' },
  { id: 2, initiales: 'MK', couleur: '#3498DB', nom: 'M***k', note: 4, commentaire: 'Bonne prestation, le trajet était confortable. Petit bémol sur le GPS.', date: '25 mai 2026' },
  { id: 3, initiales: 'AB', couleur: '#2ECC71', nom: 'A***b', note: 5, commentaire: 'Parfait du début à la fin. Voiture propre et chauffeur agréable.', date: '22 mai 2026' },
  { id: 4, initiales: 'FD', couleur: '#9B59B6', nom: 'F***d', note: 3, commentaire: 'Correct mais pas exceptionnel. Le trajet a pris un peu plus de temps que prévu.', date: '20 mai 2026' },
  { id: 5, initiales: 'NR', couleur: '#F39C12', nom: 'N***r', note: 5, commentaire: 'Excellent service ! Très à l\'écoute et conduite parfaite.', date: '18 mai 2026' },
  { id: 6, initiales: 'TC', couleur: '#1ABC9C', nom: 'T***c', note: 4, commentaire: 'Rapide et efficace. Bonne communication avant le départ.', date: '15 mai 2026' },
  { id: 7, initiales: 'PV', couleur: '#E67E22', nom: 'P***v', note: 2, commentaire: 'Attente trop longue et pas de message d\'excuse. Décevant.', date: '12 mai 2026' },
  { id: 8, initiales: 'LM', couleur: '#E91E63', nom: 'L***m', note: 5, commentaire: 'Super expérience, je reprendrai ce chauffeur avec plaisir !', date: '10 mai 2026' },
];

const FILTRES = ['Tous', '5★', '4★', '≤3★'];

const NOTE_GLOBALE = 4.3;
const TOTAL_AVIS = AVIS.length;

function compterParNote(note) {
  return AVIS.filter((a) => a.note === note).length;
}

function Etoiles({ note, taille = 14 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={{ fontSize: taille, color: i <= note ? '#F5A623' : '#2C2C3A' }}>
          ★
        </Text>
      ))}
    </View>
  );
}

function BarreNote({ note, count, total }) {
  const pourcentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={styles.barreRangee}>
      <Text style={styles.barreLabel}>{note}★</Text>
      <View style={styles.barreTrack}>
        <View style={[styles.barreFill, { width: `${pourcentage}%` }]} />
      </View>
      <Text style={styles.barreCount}>{count}</Text>
    </View>
  );
}

export default function ProviderFeedbackScreen() {
  const [filtre, setFiltre] = useState('Tous');

  const avisFiltres = AVIS.filter((a) => {
    if (filtre === 'Tous') return true;
    if (filtre === '5★') return a.note === 5;
    if (filtre === '4★') return a.note === 4;
    if (filtre === '≤3★') return a.note <= 3;
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titre}>Mes avis reçus</Text>

        <View style={styles.noteGlobaleContainer}>
          <Text style={styles.noteGlobaleChiffre}>{NOTE_GLOBALE.toFixed(1)}</Text>
          <Etoiles note={Math.round(NOTE_GLOBALE)} taille={28} />
          <Text style={styles.noteGlobaleSub}>{TOTAL_AVIS} avis au total</Text>
        </View>

        <View style={styles.distributionContainer}>
          <Text style={styles.distributionTitre}>Distribution des notes</Text>
          {[5, 4, 3, 2, 1].map((n) => (
            <BarreNote key={n} note={n} count={compterParNote(n)} total={TOTAL_AVIS} />
          ))}
        </View>

        <View style={styles.filtreContainer}>
          {FILTRES.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filtreBtn, filtre === f && styles.filtreBtnActif]}
              onPress={() => setFiltre(f)}
            >
              <Text style={[styles.filtreTexte, filtre === f && styles.filtreTexteActif]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.listeContainer}>
          {avisFiltres.map((avis, index) => (
            <View
              key={avis.id}
              style={[styles.avisItem, index < avisFiltres.length - 1 && styles.avisItemBorder]}
            >
              <View style={[styles.avatar, { backgroundColor: avis.couleur }]}>
                <Text style={styles.avatarTexte}>{avis.initiales}</Text>
              </View>
              <View style={styles.avisContenu}>
                <View style={styles.avisEnTete}>
                  <Text style={styles.avisNom}>{avis.nom}</Text>
                  <Text style={styles.avisDate}>{avis.date}</Text>
                </View>
                <Etoiles note={avis.note} taille={13} />
                <Text style={styles.avisCommentaire}>{avis.commentaire}</Text>
              </View>
            </View>
          ))}
          {avisFiltres.length === 0 && (
            <View style={styles.vide}>
              <Text style={styles.videTexte}>Aucun avis pour ce filtre</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scroll: {
    paddingBottom: 40,
  },
  titre: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  noteGlobaleContainer: {
    backgroundColor: '#1C1C28',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  noteGlobaleChiffre: {
    fontSize: 56,
    fontWeight: '800',
    color: '#F5A623',
    lineHeight: 64,
  },
  noteGlobaleSub: {
    fontSize: 13,
    color: '#8E8E9A',
    marginTop: 8,
  },
  distributionContainer: {
    backgroundColor: '#1C1C28',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  distributionTitre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E9A',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  barreRangee: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  barreLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    width: 24,
    textAlign: 'right',
  },
  barreTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#2C2C3A',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barreFill: {
    height: '100%',
    backgroundColor: '#F5A623',
    borderRadius: 5,
  },
  barreCount: {
    fontSize: 13,
    color: '#8E8E9A',
    width: 20,
    textAlign: 'right',
  },
  filtreContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filtreBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#1C1C28',
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  filtreBtnActif: {
    backgroundColor: '#F5A623',
    borderColor: '#F5A623',
  },
  filtreTexte: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E9A',
  },
  filtreTexteActif: {
    color: '#0A0A0F',
  },
  listeContainer: {
    backgroundColor: '#1C1C28',
    borderRadius: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    overflow: 'hidden',
  },
  avisItem: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  avisItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C3A',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarTexte: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avisContenu: {
    flex: 1,
    gap: 6,
  },
  avisEnTete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avisNom: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  avisDate: {
    fontSize: 12,
    color: '#8E8E9A',
  },
  avisCommentaire: {
    fontSize: 13,
    color: '#8E8E9A',
    lineHeight: 19,
  },
  vide: {
    padding: 32,
    alignItems: 'center',
  },
  videTexte: {
    fontSize: 14,
    color: '#8E8E9A',
  },
});
