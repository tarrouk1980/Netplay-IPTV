import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COULEURS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

const PERIODES = ['Aujourd\'hui', 'Semaine', 'Mois', 'Année'];

const DONNEES_PAR_PERIODE = {
  'Aujourd\'hui': {
    ca: '3 420 €',
    commission: '513 €',
    versements: '2 907 €',
    graphe: [
      { label: '08h', valeur: 280 },
      { label: '10h', valeur: 510 },
      { label: '12h', valeur: 620 },
      { label: '14h', valeur: 490 },
      { label: '16h', valeur: 720 },
      { label: '18h', valeur: 540 },
      { label: '20h', valeur: 260 },
    ],
  },
  'Semaine': {
    ca: '22 180 €',
    commission: '3 327 €',
    versements: '18 853 €',
    graphe: [
      { label: 'Lun', valeur: 2800 },
      { label: 'Mar', valeur: 3200 },
      { label: 'Mer', valeur: 2950 },
      { label: 'Jeu', valeur: 3600 },
      { label: 'Ven', valeur: 4100 },
      { label: 'Sam', valeur: 3800 },
      { label: 'Dim', valeur: 1730 },
    ],
  },
  'Mois': {
    ca: '89 640 €',
    commission: '13 446 €',
    versements: '76 194 €',
    graphe: [
      { label: 'S1', valeur: 19200 },
      { label: 'S2', valeur: 22400 },
      { label: 'S3', valeur: 24800 },
      { label: 'S4', valeur: 23240 },
      { label: 'S5', valeur: 0 },
      { label: '', valeur: 0 },
      { label: '', valeur: 0 },
    ],
  },
  'Année': {
    ca: '1 024 300 €',
    commission: '153 645 €',
    versements: '870 655 €',
    graphe: [
      { label: 'Jan', valeur: 72000 },
      { label: 'Fév', valeur: 68000 },
      { label: 'Mar', valeur: 85000 },
      { label: 'Avr', valeur: 91000 },
      { label: 'Mai', valeur: 98000 },
      { label: 'Juin', valeur: 112000 },
      { label: 'Juil', valeur: 125000 },
    ],
  },
};

const SERVICES = [
  { nom: 'Taxi', couleur: '#F5A623', pourcentage: 48 },
  { nom: 'Livraison', couleur: '#4CAF50', pourcentage: 27 },
  { nom: 'SOS', couleur: '#FF3B30', pourcentage: 13 },
  { nom: 'Épicerie', couleur: '#5AC8FA', pourcentage: 12 },
];

const TOP_PRESTATAIRES = [
  { rang: 1, nom: 'Ahmed Meziani', service: 'Taxi', gains: '4 280 €', courses: 312 },
  { rang: 2, nom: 'Sofia Larbi', service: 'Livraison', gains: '3 640 €', courses: 287 },
  { rang: 3, nom: 'Youcef Hamdi', service: 'Taxi', gains: '3 210 €', courses: 241 },
];

const HAUTEUR_GRAPHE = 120;

export default function AdminEarningsScreen({ navigation }) {
  const [periodeActive, setPeriodeActive] = useState('Semaine');

  const donneesActuelles = DONNEES_PAR_PERIODE[periodeActive];
  const valeurMax = Math.max(...donneesActuelles.graphe.map((d) => d.valeur));

  return (
    <SafeAreaView style={styles.conteneur}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.entete}>
          <Text style={styles.titreEcran}>Revenus EasyWay</Text>
        </View>

        <View style={styles.selecteurPeriode}>
          {PERIODES.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.boutonPeriode, periodeActive === p && styles.boutonPeriodeActif]}
              onPress={() => setPeriodeActive(p)}
            >
              <Text
                style={[
                  styles.textePeriode,
                  periodeActive === p && styles.textePeriodeActif,
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.grandsChiffres}>
          <View style={styles.chiffreConteneur}>
            <Text style={styles.chiffreLabel}>Chiffre d'affaires</Text>
            <Text style={styles.chiffreValeur}>{donneesActuelles.ca}</Text>
          </View>
          <View style={styles.chiffresDivise}>
            <View style={[styles.chiffreConteneur, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.chiffreLabel}>Commission</Text>
              <Text style={[styles.chiffreValeur, styles.chiffrePrimary]}>
                {donneesActuelles.commission}
              </Text>
            </View>
            <View style={[styles.chiffreConteneur, { flex: 1 }]}>
              <Text style={styles.chiffreLabel}>Versements</Text>
              <Text style={[styles.chiffreValeur, styles.chiffreVert]}>
                {donneesActuelles.versements}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.carteSection}>
          <Text style={styles.titreSectionGraphe}>Évolution</Text>
          <View style={styles.grapheConteneur}>
            {donneesActuelles.graphe.map((item, index) => {
              const hauteur =
                valeurMax > 0 ? (item.valeur / valeurMax) * HAUTEUR_GRAPHE : 0;
              return (
                <View key={index} style={styles.barreColonne}>
                  <View style={styles.barreWrapper}>
                    <View
                      style={[
                        styles.barre,
                        {
                          height: hauteur,
                          backgroundColor:
                            item.valeur === valeurMax ? COULEURS.primary : '#3C3C4E',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barreLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.carteSection}>
          <Text style={styles.titreSectionGraphe}>Répartition par service</Text>
          {SERVICES.map((service) => (
            <View key={service.nom} style={styles.serviceRangee}>
              <View style={styles.serviceGauche}>
                <View style={[styles.servicePoint, { backgroundColor: service.couleur }]} />
                <Text style={styles.serviceNom}>{service.nom}</Text>
              </View>
              <View style={styles.serviceBarreConteneur}>
                <View
                  style={[
                    styles.serviceBarreRemplie,
                    {
                      width: `${service.pourcentage}%`,
                      backgroundColor: service.couleur,
                    },
                  ]}
                />
              </View>
              <Text style={styles.servicePourcentage}>{service.pourcentage}%</Text>
            </View>
          ))}
        </View>

        <View style={styles.carteSection}>
          <Text style={styles.titreSectionGraphe}>Top 3 Prestataires</Text>
          {TOP_PRESTATAIRES.map((p) => (
            <View key={p.rang} style={styles.prestataireLigne}>
              <View
                style={[
                  styles.rangBadge,
                  p.rang === 1 && { backgroundColor: COULEURS.primary },
                  p.rang === 2 && { backgroundColor: '#C0C0C0' },
                  p.rang === 3 && { backgroundColor: '#CD7F32' },
                ]}
              >
                <Text style={styles.rangTexte}>{p.rang}</Text>
              </View>
              <View style={styles.prestataireInfo}>
                <Text style={styles.prestataireNom}>{p.nom}</Text>
                <Text style={styles.prestataireService}>
                  {p.service} · {p.courses} courses
                </Text>
              </View>
              <Text style={styles.prestataireGains}>{p.gains}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: COULEURS.bg,
  },
  entete: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  titreEcran: {
    color: COULEURS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  selecteurPeriode: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: COULEURS.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  boutonPeriode: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  boutonPeriodeActif: {
    backgroundColor: COULEURS.primary,
  },
  textePeriode: {
    color: COULEURS.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  textePeriodeActif: {
    color: COULEURS.bg,
  },
  grandsChiffres: {
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  chiffresDivise: {
    flexDirection: 'row',
  },
  chiffreConteneur: {
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  chiffreLabel: {
    color: COULEURS.muted,
    fontSize: 13,
    marginBottom: 6,
  },
  chiffreValeur: {
    color: COULEURS.text,
    fontSize: 22,
    fontWeight: '800',
  },
  chiffrePrimary: {
    color: COULEURS.primary,
  },
  chiffreVert: {
    color: '#4CAF50',
  },
  carteSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  titreSectionGraphe: {
    color: COULEURS.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
  },
  grapheConteneur: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: HAUTEUR_GRAPHE + 24,
    gap: 6,
  },
  barreColonne: {
    flex: 1,
    alignItems: 'center',
    height: HAUTEUR_GRAPHE + 24,
    justifyContent: 'flex-end',
  },
  barreWrapper: {
    width: '100%',
    height: HAUTEUR_GRAPHE,
    justifyContent: 'flex-end',
  },
  barre: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  barreLabel: {
    color: COULEURS.muted,
    fontSize: 10,
    marginTop: 6,
  },
  serviceRangee: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  serviceGauche: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    gap: 6,
  },
  servicePoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  serviceNom: {
    color: COULEURS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  serviceBarreConteneur: {
    flex: 1,
    height: 8,
    backgroundColor: COULEURS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  serviceBarreRemplie: {
    height: '100%',
    borderRadius: 4,
  },
  servicePourcentage: {
    color: COULEURS.muted,
    fontSize: 13,
    width: 36,
    textAlign: 'right',
  },
  prestataireLigne: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  rangBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COULEURS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rangTexte: {
    color: COULEURS.bg,
    fontSize: 13,
    fontWeight: '800',
  },
  prestataireInfo: {
    flex: 1,
  },
  prestataireNom: {
    color: COULEURS.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  prestataireService: {
    color: COULEURS.muted,
    fontSize: 12,
  },
  prestataireGains: {
    color: COULEURS.primary,
    fontSize: 15,
    fontWeight: '800',
  },
});
