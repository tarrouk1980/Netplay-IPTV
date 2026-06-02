import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PERIODES = ['Aujourd\'hui', 'Semaine', 'Mois'];

const SOLDES = {
  'Aujourd\'hui': 187.50,
  'Semaine': 1243.80,
  'Mois': 4892.30,
};

const COURSES = [
  { id: '1', heure: '18:42', duree: '12 min', distance: '4.2 km', montant: 18.50 },
  { id: '2', heure: '17:15', duree: '8 min', distance: '2.8 km', montant: 12.00 },
  { id: '3', heure: '15:50', duree: '22 min', distance: '9.1 km', montant: 31.50 },
  { id: '4', heure: '14:30', duree: '6 min', distance: '1.9 km', montant: 9.00 },
  { id: '5', heure: '13:05', duree: '18 min', distance: '7.3 km', montant: 25.00 },
  { id: '6', heure: '11:40', duree: '10 min', distance: '3.5 km', montant: 14.50 },
  { id: '7', heure: '10:20', duree: '25 min', distance: '10.6 km', montant: 38.00 },
  { id: '8', heure: '09:00', duree: '15 min', distance: '5.8 km', montant: 21.00 },
];

const BARRES_7JOURS = [
  { jour: 'Lun', montant: 142 },
  { jour: 'Mar', montant: 205 },
  { jour: 'Mer', montant: 178 },
  { jour: 'Jeu', montant: 260 },
  { jour: 'Ven', montant: 310 },
  { jour: 'Sam', montant: 390 },
  { jour: 'Dim', montant: 188 },
];

const MAX_BARRE = 390;
const HAUTEUR_MAX = 100;

export default function TaxiDriverEarningsScreen({ navigation }) {
  const [periodeActive, setPeriodeActive] = useState('Aujourd\'hui');

  const handleRetirer = () => {
    Alert.alert(
      'Retrait de fonds',
      `Confirmer le retrait de ${SOLDES[periodeActive].toFixed(2)} $ vers votre compte bancaire ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', style: 'default' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.titre}>Mes gains</Text>

        <View style={styles.toggleRow}>
          {PERIODES.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.toggleBtn, periodeActive === p && styles.toggleActif]}
              onPress={() => setPeriodeActive(p)}
            >
              <Text style={[styles.toggleTexte, periodeActive === p && styles.toggleTexteActif]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.soldeCard}>
          <Text style={styles.soldeLabel}>Gains — {periodeActive}</Text>
          <Text style={styles.soldeValeur}>{SOLDES[periodeActive].toFixed(2)} $</Text>
          <TouchableOpacity style={styles.retirerBtn} onPress={handleRetirer}>
            <Text style={styles.retirerTexte}>Retirer</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitre}>7 derniers jours</Text>
        <View style={styles.grapheContainer}>
          {BARRES_7JOURS.map((item) => {
            const hauteur = Math.round((item.montant / MAX_BARRE) * HAUTEUR_MAX);
            return (
              <View key={item.jour} style={styles.barreColonne}>
                <Text style={styles.barreValeur}>{item.montant}$</Text>
                <View style={styles.barreWrapper}>
                  <View style={[styles.barre, { height: hauteur }]} />
                </View>
                <Text style={styles.barreJour}>{item.jour}</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitre}>Dernières courses</Text>
        {COURSES.map((course) => (
          <View key={course.id} style={styles.courseCard}>
            <View style={styles.courseGauche}>
              <Text style={styles.courseHeure}>{course.heure}</Text>
              <View style={styles.courseInfoRow}>
                <Text style={styles.courseMeta}>{course.duree}</Text>
                <Text style={styles.courseSep}>·</Text>
                <Text style={styles.courseMeta}>{course.distance}</Text>
              </View>
            </View>
            <Text style={styles.courseMontant}>+{course.montant.toFixed(2)} $</Text>
          </View>
        ))}
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
    padding: 20,
    paddingBottom: 40,
  },
  titre: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleActif: {
    backgroundColor: '#F5A623',
  },
  toggleTexte: {
    color: '#8E8E9A',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTexteActif: {
    color: '#0A0A0F',
  },
  soldeCard: {
    backgroundColor: '#1C1C28',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  soldeLabel: {
    color: '#8E8E9A',
    fontSize: 14,
    marginBottom: 8,
  },
  soldeValeur: {
    color: '#F5A623',
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 20,
  },
  retirerBtn: {
    backgroundColor: '#F5A623',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  retirerTexte: {
    color: '#0A0A0F',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitre: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  grapheContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: '#1C1C28',
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  barreColonne: {
    alignItems: 'center',
    flex: 1,
  },
  barreValeur: {
    color: '#8E8E9A',
    fontSize: 9,
    marginBottom: 4,
  },
  barreWrapper: {
    height: 100,
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  barre: {
    width: 22,
    backgroundColor: '#F5A623',
    borderRadius: 4,
  },
  barreJour: {
    color: '#8E8E9A',
    fontSize: 11,
    fontWeight: '600',
  },
  courseCard: {
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  courseGauche: {
    gap: 4,
  },
  courseHeure: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  courseInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courseMeta: {
    color: '#8E8E9A',
    fontSize: 13,
  },
  courseSep: {
    color: '#2C2C3A',
    fontSize: 13,
  },
  courseMontant: {
    color: '#F5A623',
    fontSize: 18,
    fontWeight: '700',
  },
});
