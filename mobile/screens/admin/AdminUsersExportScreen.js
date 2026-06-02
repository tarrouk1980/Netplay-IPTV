import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const ROLES = ['Tous', 'Client', 'Chauffeur', 'Livreur', 'Dépanneur', 'Marchand'];
const PERIODES = ['7 jours', '30 jours', '3 mois', '1 an'];
const STATUTS = ['Tous', 'Actif', 'Inactif', 'Suspendu'];

const UTILISATEURS = [
  { nom: 'Amira Bensalem', role: 'Client', inscrit: '12/01/2024', statut: 'Actif', commandes: 24 },
  { nom: 'Youcef Hadjadj', role: 'Livreur', inscrit: '03/03/2024', statut: 'Actif', commandes: 87 },
  { nom: 'Nadia Cherif', role: 'Client', inscrit: '19/02/2024', statut: 'Inactif', commandes: 5 },
  { nom: 'Malik Ouali', role: 'Chauffeur', inscrit: '07/11/2023', statut: 'Actif', commandes: 312 },
  { nom: 'Soumia Dali', role: 'Marchand', inscrit: '25/06/2023', statut: 'Actif', commandes: 148 },
  { nom: 'Rachid Tizi', role: 'Dépanneur', inscrit: '14/09/2023', statut: 'Suspendu', commandes: 19 },
  { nom: 'Fatima Zerrouk', role: 'Client', inscrit: '01/04/2024', statut: 'Actif', commandes: 11 },
  { nom: 'Anis Bouzid', role: 'Livreur', inscrit: '22/12/2023', statut: 'Actif', commandes: 204 },
];

const STATS_ROLES = [
  { role: 'Client', total: 1240, couleur: '#F5A623' },
  { role: 'Chauffeur', total: 380, couleur: '#4A90E2' },
  { role: 'Livreur', total: 290, couleur: '#7ED321' },
  { role: 'Dépanneur', total: 95, couleur: '#E74C3C' },
  { role: 'Marchand', total: 140, couleur: '#9B59B6' },
];

const TOTAL_MAX = 1240;

const STATUT_COULEUR = {
  Actif: '#7ED321',
  Inactif: '#8E8E9A',
  Suspendu: '#E74C3C',
};

export default function AdminUsersExportScreen() {
  const [roleActif, setRoleActif] = useState('Tous');
  const [periodeActive, setPeriodeActive] = useState('30 jours');
  const [statutActif, setStatutActif] = useState('Tous');

  const utilisateursFiltres = UTILISATEURS.filter(u => {
    const matchRole = roleActif === 'Tous' || u.role === roleActif;
    const matchStatut = statutActif === 'Tous' || u.statut === statutActif;
    return matchRole && matchStatut;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.titre}>Export utilisateurs</Text>
          <Text style={styles.sousTitre}>Rapports et données</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Rôle</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtreRow}>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.filtrePill, roleActif === r && styles.filtrePillActif]}
                  onPress={() => setRoleActif(r)}
                >
                  <Text style={[styles.filtrePillText, roleActif === r && styles.filtrePillTextActif]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Période</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtreRow}>
              {PERIODES.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.filtrePill, periodeActive === p && styles.filtrePillActif]}
                  onPress={() => setPeriodeActive(p)}
                >
                  <Text style={[styles.filtrePillText, periodeActive === p && styles.filtrePillTextActif]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Statut</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtreRow}>
              {STATUTS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.filtrePill, statutActif === s && styles.filtrePillActif]}
                  onPress={() => setStatutActif(s)}
                >
                  <Text style={[styles.filtrePillText, statutActif === s && styles.filtrePillTextActif]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.sectionTitre}>Répartition par rôle</Text>
          {STATS_ROLES.map(item => (
            <View key={item.role} style={styles.statRow}>
              <Text style={styles.statRole}>{item.role}</Text>
              <View style={styles.barreContainer}>
                <View
                  style={[
                    styles.barre,
                    {
                      width: `${(item.total / TOTAL_MAX) * 100}%`,
                      backgroundColor: item.couleur,
                    },
                  ]}
                />
              </View>
              <Text style={styles.statTotal}>{item.total}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tableauCard}>
          <Text style={styles.sectionTitre}>
            Aperçu ({utilisateursFiltres.length} utilisateurs)
          </Text>
          <View style={styles.tableauHeader}>
            <Text style={[styles.colHeader, { flex: 2 }]}>Nom</Text>
            <Text style={[styles.colHeader, { flex: 1.2 }]}>Rôle</Text>
            <Text style={[styles.colHeader, { flex: 1.2 }]}>Inscrit</Text>
            <Text style={[styles.colHeader, { flex: 1 }]}>Statut</Text>
            <Text style={[styles.colHeader, { flex: 0.8, textAlign: 'right' }]}>Cmd</Text>
          </View>
          {utilisateursFiltres.map((u, index) => (
            <View
              key={index}
              style={[styles.tableauRow, index % 2 === 0 && styles.tableauRowAlt]}
            >
              <Text style={[styles.cellule, { flex: 2 }]} numberOfLines={1}>{u.nom}</Text>
              <Text style={[styles.cellule, { flex: 1.2 }, styles.celluleRole]}>{u.role}</Text>
              <Text style={[styles.cellule, { flex: 1.2 }, styles.celluleMuted]}>{u.inscrit}</Text>
              <Text
                style={[
                  styles.cellule,
                  { flex: 1, color: STATUT_COULEUR[u.statut] || '#FFFFFF', fontSize: 11 },
                ]}
              >
                {u.statut}
              </Text>
              <Text style={[styles.cellule, { flex: 0.8, textAlign: 'right' }]}>{u.commandes}</Text>
            </View>
          ))}
        </View>

        <View style={styles.exportCard}>
          <Text style={styles.sectionTitre}>Exporter les données</Text>
          <View style={styles.exportBoutonsRow}>
            <TouchableOpacity
              style={[styles.exportBtn, { borderColor: '#7ED321' }]}
              onPress={() => Alert.alert('Export CSV', 'Fichier CSV généré et téléchargé.')}
            >
              <Text style={[styles.exportIcon]}>📄</Text>
              <Text style={[styles.exportLabel, { color: '#7ED321' }]}>CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.exportBtn, { borderColor: '#4A90E2' }]}
              onPress={() => Alert.alert('Export Excel', 'Fichier Excel généré et téléchargé.')}
            >
              <Text style={styles.exportIcon}>📊</Text>
              <Text style={[styles.exportLabel, { color: '#4A90E2' }]}>Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.exportBtn, { borderColor: '#E74C3C' }]}
              onPress={() => Alert.alert('Export PDF', 'Fichier PDF généré et téléchargé.')}
            >
              <Text style={styles.exportIcon}>📋</Text>
              <Text style={[styles.exportLabel, { color: '#E74C3C' }]}>PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { padding: 16, paddingBottom: 8 },
  titre: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  sousTitre: { fontSize: 14, color: '#8E8E9A', marginTop: 4 },
  section: { paddingHorizontal: 16, marginBottom: 12 },
  sectionLabel: { fontSize: 13, color: '#8E8E9A', marginBottom: 8, fontWeight: '600' },
  filtreRow: { flexDirection: 'row', gap: 8 },
  filtrePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#1C1C28',
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  filtrePillActif: { backgroundColor: '#F5A623', borderColor: '#F5A623' },
  filtrePillText: { fontSize: 13, color: '#8E8E9A', fontWeight: '500' },
  filtrePillTextActif: { color: '#0A0A0F', fontWeight: '700' },
  statsCard: {
    backgroundColor: '#1C1C28',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  sectionTitre: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 14 },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statRole: { width: 80, fontSize: 12, color: '#8E8E9A' },
  barreContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#0A0A0F',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barre: { height: 8, borderRadius: 4 },
  statTotal: { width: 40, textAlign: 'right', fontSize: 13, color: '#FFFFFF', fontWeight: '600' },
  tableauCard: {
    backgroundColor: '#1C1C28',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  tableauHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C3A',
    marginBottom: 4,
  },
  colHeader: { fontSize: 11, color: '#8E8E9A', fontWeight: '700', textTransform: 'uppercase' },
  tableauRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    borderRadius: 6,
  },
  tableauRowAlt: { backgroundColor: '#0A0A0F' },
  cellule: { fontSize: 12, color: '#FFFFFF' },
  celluleRole: { color: '#F5A623' },
  celluleMuted: { color: '#8E8E9A' },
  exportCard: {
    backgroundColor: '#1C1C28',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  exportBoutonsRow: { flexDirection: 'row', gap: 12 },
  exportBtn: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
  },
  exportIcon: { fontSize: 24, marginBottom: 6 },
  exportLabel: { fontSize: 14, fontWeight: '700' },
});
