import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MARCHAND = {
  nom: 'Pizza Rapido',
  categorie: 'Pizzeria • Italien',
  note: 4.6,
  nbAvis: 312,
  initiales: 'PR',
  description:
    'Pizzas artisanales cuites au feu de bois, ingrédients frais importés d\'Italie. Livraison rapide dans tout le quartier depuis 2018.',
  adresse: '14 Rue des Oliviers, Alger Centre',
  telephone: '+213 555 12 34 56',
  heures: 'Lun–Sam : 11h00–23h00 • Dim : 12h00–22h00',
  tempsLivraison: '25–40 min',
  fraisLivraison: '150 DA',
  couleurBanniere: '#2C1654',
  couleurAccent: '#F5A623',
};

const AVIS = [
  {
    id: 1,
    auteur: 'Karim B.',
    note: 5,
    commentaire: 'Excellente pizza, pâte croustillante et ingrédients frais. Livraison rapide !',
    date: '28 mai 2026',
  },
  {
    id: 2,
    auteur: 'Samira H.',
    note: 4,
    commentaire: 'Très bon rapport qualité/prix. La margherita est parfaite.',
    date: '22 mai 2026',
  },
  {
    id: 3,
    auteur: 'Yacine M.',
    note: 5,
    commentaire: 'Livré en 30 minutes, pizza encore chaude. Je recommande vivement.',
    date: '15 mai 2026',
  },
  {
    id: 4,
    auteur: 'Nadia O.',
    note: 4,
    commentaire: 'Bonne pizza mais la sauce pourrait être un peu plus généreuse.',
    date: '10 mai 2026',
  },
];

function Etoiles({ note }) {
  return (
    <View style={styles.etoilesContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={[styles.etoile, { color: i <= Math.round(note) ? '#F5A623' : '#2C2C3A' }]}>
          ★
        </Text>
      ))}
    </View>
  );
}

export default function MerchantProfileScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.banniere, { backgroundColor: MARCHAND.couleurBanniere }]}>
          <View style={styles.banniereDecor1} />
          <View style={styles.banniereDecor2} />
          <TouchableOpacity style={styles.boutonRetour} onPress={() => navigation.goBack()}>
            <Text style={styles.boutonRetourTexte}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profilHeaderContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoInitiales}>{MARCHAND.initiales}</Text>
          </View>
          <View style={styles.profilInfos}>
            <Text style={styles.nomMarchand}>{MARCHAND.nom}</Text>
            <Text style={styles.categorie}>{MARCHAND.categorie}</Text>
            <View style={styles.noteRow}>
              <Etoiles note={MARCHAND.note} />
              <Text style={styles.noteTexte}>{MARCHAND.note}</Text>
              <Text style={styles.nbAvis}>({MARCHAND.nbAvis} avis)</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCardsRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Livraison</Text>
            <Text style={styles.infoCardValeur}>{MARCHAND.tempsLivraison}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Frais</Text>
            <Text style={styles.infoCardValeur}>{MARCHAND.fraisLivraison}</Text>
          </View>
          <View style={[styles.infoCard, { borderRightWidth: 0 }]}>
            <Text style={styles.infoCardLabel}>Note</Text>
            <Text style={styles.infoCardValeur}>{MARCHAND.note} / 5</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Informations</Text>
          <View style={styles.infoLigne}>
            <Text style={styles.infoIcon}>🕐</Text>
            <Text style={styles.infoTexte}>{MARCHAND.heures}</Text>
          </View>
          <View style={styles.infoLigne}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoTexte}>{MARCHAND.adresse}</Text>
          </View>
          <View style={styles.infoLigne}>
            <Text style={styles.infoIcon}>📞</Text>
            <Text style={styles.infoTexte}>{MARCHAND.telephone}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>À propos</Text>
          <Text style={styles.description}>{MARCHAND.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Avis clients</Text>
          {AVIS.map((avis) => (
            <View key={avis.id} style={styles.avisCard}>
              <View style={styles.avisHeader}>
                <View style={styles.avisAvatar}>
                  <Text style={styles.avisAvatarTexte}>{avis.auteur[0]}</Text>
                </View>
                <View style={styles.avisInfos}>
                  <Text style={styles.avisAuteur}>{avis.auteur}</Text>
                  <View style={styles.avisNoteRow}>
                    <Etoiles note={avis.note} />
                    <Text style={styles.avisDate}>{avis.date}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.avisCommentaire}>{avis.commentaire}</Text>
            </View>
          ))}
        </View>

        <View style={styles.espaceFond} />
      </ScrollView>

      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.boutonCommander}
          onPress={() => navigation.navigate('Merchant')}
        >
          <Text style={styles.boutonCommanderTexte}>Commander</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  banniere: {
    height: 160,
    position: 'relative',
    overflow: 'hidden',
  },
  banniereDecor1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(245,166,35,0.15)',
    top: -60,
    right: -40,
  },
  banniereDecor2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(245,166,35,0.08)',
    bottom: -30,
    left: 40,
  },
  boutonRetour: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boutonRetourTexte: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  profilHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: -40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0A0A0F',
  },
  logoInitiales: {
    color: '#0A0A0F',
    fontSize: 24,
    fontWeight: '800',
  },
  profilInfos: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 4,
  },
  nomMarchand: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  categorie: {
    color: '#8E8E9A',
    fontSize: 13,
    marginTop: 2,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  etoilesContainer: {
    flexDirection: 'row',
  },
  etoile: {
    fontSize: 14,
    marginRight: 1,
  },
  noteTexte: {
    color: '#F5A623',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  nbAvis: {
    color: '#8E8E9A',
    fontSize: 12,
    marginLeft: 4,
  },
  infoCardsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  infoCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: '#2C2C3A',
  },
  infoCardLabel: {
    color: '#8E8E9A',
    fontSize: 11,
    marginBottom: 4,
  },
  infoCardValeur: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitre: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoLigne: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 1,
  },
  infoTexte: {
    color: '#8E8E9A',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  description: {
    color: '#8E8E9A',
    fontSize: 14,
    lineHeight: 22,
  },
  avisCard: {
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  avisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avisAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2C2C3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avisAvatarTexte: {
    color: '#F5A623',
    fontSize: 16,
    fontWeight: '700',
  },
  avisInfos: {
    marginLeft: 10,
    flex: 1,
  },
  avisAuteur: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  avisNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  avisDate: {
    color: '#8E8E9A',
    fontSize: 11,
    marginLeft: 8,
  },
  avisCommentaire: {
    color: '#8E8E9A',
    fontSize: 13,
    lineHeight: 19,
  },
  espaceFond: {
    height: 100,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0A0A0F',
    borderTopWidth: 1,
    borderTopColor: '#2C2C3A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
  },
  boutonCommander: {
    backgroundColor: '#F5A623',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  boutonCommanderTexte: {
    color: '#0A0A0F',
    fontSize: 16,
    fontWeight: '800',
  },
});
