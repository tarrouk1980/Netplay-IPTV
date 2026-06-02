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

const STATS = {
  abonnesActifs: 1284,
  revenusMensuels: '486 200',
  tauxRenouvellement: 87,
};

const ABONNES = [
  { id: '1', nom: 'Amira Khedim', type: 'Annuel', debut: '01/01/2025', fin: '31/12/2025', statut: 'Actif' },
  { id: '2', nom: 'Yacine Boukhari', type: 'Mensuel', debut: '01/05/2025', fin: '31/05/2025', statut: 'Expiré' },
  { id: '3', nom: 'Rania Ferhat', type: 'Mensuel', debut: '01/06/2025', fin: '30/06/2025', statut: 'Actif' },
  { id: '4', nom: 'Mohamed Saïd', type: 'Annuel', debut: '15/03/2025', fin: '14/03/2026', statut: 'Actif' },
  { id: '5', nom: 'Lynda Hamdi', type: 'Mensuel', debut: '10/06/2025', fin: '09/07/2025', statut: 'En attente' },
  { id: '6', nom: 'Karim Zidane', type: 'Annuel', debut: '01/04/2024', fin: '31/03/2025', statut: 'Expiré' },
  { id: '7', nom: 'Sara Benamara', type: 'Mensuel', debut: '01/06/2025', fin: '30/06/2025', statut: 'Actif' },
  { id: '8', nom: 'Hicham Djamel', type: 'Annuel', debut: '01/01/2025', fin: '31/12/2025', statut: 'Actif' },
  { id: '9', nom: 'Nadia Loucif', type: 'Mensuel', debut: '20/05/2025', fin: '19/06/2025', statut: 'En attente' },
  { id: '10', nom: 'Farid Messaoud', type: 'Annuel', debut: '01/02/2025', fin: '31/01/2026', statut: 'Actif' },
];

const FILTRES = ['Tous', 'Actifs', 'Expirés', 'En attente'];

function couleurStatut(statut) {
  switch (statut) {
    case 'Actif': return '#27AE60';
    case 'Expiré': return '#E74C3C';
    case 'En attente': return '#F5A623';
    default: return COULEURS.muet;
  }
}

function bgStatut(statut) {
  switch (statut) {
    case 'Actif': return 'rgba(39,174,96,0.12)';
    case 'Expiré': return 'rgba(231,76,60,0.12)';
    case 'En attente': return 'rgba(245,166,35,0.12)';
    default: return 'rgba(142,142,154,0.12)';
  }
}

export default function AdminSubscriptionsScreen({ navigation }) {
  const [filtreActif, setFiltreActif] = useState('Tous');

  const abonnesFiltres = ABONNES.filter((a) => {
    if (filtreActif === 'Tous') return true;
    if (filtreActif === 'Actifs') return a.statut === 'Actif';
    if (filtreActif === 'Expirés') return a.statut === 'Expiré';
    if (filtreActif === 'En attente') return a.statut === 'En attente';
    return true;
  });

  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.entete}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.boutonRetour}>
          <Text style={styles.texteRetour}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.titreEntete}>Abonnements EasyPass</Text>
        <TouchableOpacity
          style={styles.boutonExport}
          onPress={() => Alert.alert('Export', 'La liste des abonnements a été exportée avec succès.')}
        >
          <Text style={styles.boutonExportTexte}>Exporter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrille}>
          <View style={styles.statCarte}>
            <Text style={styles.statValeur}>{STATS.abonnesActifs.toLocaleString('fr-FR')}</Text>
            <Text style={styles.statLabel}>Abonnés actifs</Text>
          </View>
          <View style={styles.statCarte}>
            <Text style={styles.statValeur}>{STATS.revenusMensuels} DA</Text>
            <Text style={styles.statLabel}>Revenus mensuels</Text>
          </View>
          <View style={[styles.statCarte, styles.statCartePleine]}>
            <Text style={styles.statValeur}>{STATS.tauxRenouvellement}%</Text>
            <Text style={styles.statLabel}>Taux de renouvellement</Text>
            <View style={styles.barreProgres}>
              <View style={[styles.barreProgresRemplie, { width: `${STATS.tauxRenouvellement}%` }]} />
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtresScroll}
          contentContainerStyle={styles.filtresContenu}
        >
          {FILTRES.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filtre, filtreActif === f && styles.filtreActif]}
              onPress={() => setFiltreActif(f)}
            >
              <Text style={[styles.filtreTexte, filtreActif === f && styles.filtreTexteActif]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.section}>
          <Text style={styles.compteResultats}>
            {abonnesFiltres.length} abonné{abonnesFiltres.length > 1 ? 's' : ''}
          </Text>
          {abonnesFiltres.map((abonne) => (
            <View key={abonne.id} style={styles.carteAbonne}>
              <View style={styles.abonneEntete}>
                <View style={styles.abonneAvatar}>
                  <Text style={styles.abonneAvatarTexte}>{abonne.nom[0]}</Text>
                </View>
                <View style={styles.abonneInfo}>
                  <Text style={styles.abonneNom}>{abonne.nom}</Text>
                  <Text style={styles.abonneType}>
                    <Text style={styles.badgeType}>{abonne.type}</Text>
                    {'  '}du {abonne.debut} au {abonne.fin}
                  </Text>
                </View>
                <View style={[styles.badgeStatut, { backgroundColor: bgStatut(abonne.statut) }]}>
                  <Text style={[styles.badgeStatutTexte, { color: couleurStatut(abonne.statut) }]}>
                    {abonne.statut}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  boutonExport: {
    backgroundColor: 'rgba(245,166,35,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COULEURS.primaire,
  },
  boutonExportTexte: { color: COULEURS.primaire, fontSize: 13, fontWeight: '600' },
  statsGrille: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  statCarte: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COULEURS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  statCartePleine: { minWidth: '100%', flex: 0 },
  statValeur: { color: COULEURS.primaire, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: COULEURS.muet, fontSize: 12 },
  barreProgres: {
    height: 5,
    backgroundColor: COULEURS.bordure,
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  barreProgresRemplie: {
    height: '100%',
    backgroundColor: COULEURS.primaire,
    borderRadius: 3,
  },
  filtresScroll: { marginTop: 16 },
  filtresContenu: { paddingHorizontal: 16, gap: 8 },
  filtre: {
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
  filtreTexte: { color: COULEURS.muet, fontSize: 13, fontWeight: '600' },
  filtreTexteActif: { color: COULEURS.fond },
  section: { paddingHorizontal: 16, marginTop: 16 },
  compteResultats: { color: COULEURS.muet, fontSize: 13, marginBottom: 10 },
  carteAbonne: {
    backgroundColor: COULEURS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  abonneEntete: { flexDirection: 'row', alignItems: 'center' },
  abonneAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E3A5C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  abonneAvatarTexte: { color: COULEURS.texte, fontSize: 16, fontWeight: '700' },
  abonneInfo: { flex: 1 },
  abonneNom: { color: COULEURS.texte, fontSize: 14, fontWeight: '600', marginBottom: 3 },
  abonneType: { color: COULEURS.muet, fontSize: 12 },
  badgeType: { color: COULEURS.primaire, fontWeight: '700' },
  badgeStatut: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeStatutTexte: { fontSize: 12, fontWeight: '700' },
});
