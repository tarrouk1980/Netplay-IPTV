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

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

const TYPES = ['Tous', 'Modification', 'Bannissement', 'Remboursement', 'Approbation KYC'];

const COULEUR_TYPE = {
  'Modification': '#F5A623',
  'Bannissement': '#FF4444',
  'Remboursement': '#4A9EFF',
  'Approbation KYC': '#4CAF50',
};

const ENTREES = [
  { id: '1', admin: 'superadmin', action: 'Bannissement', cible: 'user_48291', date: '02/06/2026', heure: '09:14', ip: '196.235.10.44' },
  { id: '2', admin: 'moderateur_1', action: 'Modification', cible: 'user_10923', date: '02/06/2026', heure: '09:02', ip: '41.111.0.8' },
  { id: '3', admin: 'superadmin', action: 'Approbation KYC', cible: 'livreur_3302', date: '02/06/2026', heure: '08:47', ip: '196.235.10.44' },
  { id: '4', admin: 'finance_admin', action: 'Remboursement', cible: 'commande_88751', date: '02/06/2026', heure: '08:30', ip: '10.0.1.15' },
  { id: '5', admin: 'moderateur_2', action: 'Modification', cible: 'marchand_501', date: '01/06/2026', heure: '23:55', ip: '41.111.8.22' },
  { id: '6', admin: 'superadmin', action: 'Bannissement', cible: 'user_77120', date: '01/06/2026', heure: '22:38', ip: '196.235.10.44' },
  { id: '7', admin: 'finance_admin', action: 'Remboursement', cible: 'commande_77342', date: '01/06/2026', heure: '21:10', ip: '10.0.1.15' },
  { id: '8', admin: 'moderateur_1', action: 'Approbation KYC', cible: 'livreur_4410', date: '01/06/2026', heure: '20:02', ip: '41.111.0.8' },
  { id: '9', admin: 'superadmin', action: 'Modification', cible: 'user_29944', date: '01/06/2026', heure: '18:45', ip: '196.235.10.44' },
  { id: '10', admin: 'moderateur_2', action: 'Bannissement', cible: 'user_65300', date: '01/06/2026', heure: '17:22', ip: '41.111.8.22' },
  { id: '11', admin: 'finance_admin', action: 'Remboursement', cible: 'commande_55100', date: '01/06/2026', heure: '15:09', ip: '10.0.1.15' },
  { id: '12', admin: 'superadmin', action: 'Approbation KYC', cible: 'marchand_810', date: '01/06/2026', heure: '13:30', ip: '196.235.10.44' },
];

export default function AdminAuditLogScreen() {
  const [filtreActif, setFiltreActif] = useState('Tous');

  const entreesFiltrees = filtreActif === 'Tous'
    ? ENTREES
    : ENTREES.filter(e => e.action === filtreActif);

  const handleExport = () => {
    Alert.alert(
      'Exporter le journal',
      'Le fichier CSV sera envoyé à votre adresse e-mail administrateur.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.titre}>Journal d'audit</Text>
          <Text style={styles.sousTitre}>{ENTREES.length} entrées au total</Text>
        </View>
        <TouchableOpacity style={styles.btnExport} onPress={handleExport} activeOpacity={0.8}>
          <Text style={styles.btnExportTexte}>Exporter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtresContainer}
        style={styles.filtresScroll}
      >
        {TYPES.map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filtreBouton,
              filtreActif === type && styles.filtreBoutonActif,
            ]}
            onPress={() => setFiltreActif(type)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filtreTexte,
                filtreActif === type && styles.filtreTexteActif,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.liste} showsVerticalScrollIndicator={false}>
        {entreesFiltrees.map(entree => (
          <View key={entree.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.badge, { backgroundColor: `${COULEUR_TYPE[entree.action]}22` }]}>
                <View style={[styles.badgeDot, { backgroundColor: COULEUR_TYPE[entree.action] }]} />
                <Text style={[styles.badgeTexte, { color: COULEUR_TYPE[entree.action] }]}>
                  {entree.action}
                </Text>
              </View>
              <Text style={styles.dateHeure}>{entree.date} · {entree.heure}</Text>
            </View>

            <View style={styles.cardCorps}>
              <View style={styles.ligneDetail}>
                <Text style={styles.detailLabel}>Admin</Text>
                <Text style={styles.detailValeur}>{entree.admin}</Text>
              </View>
              <View style={styles.ligneDetail}>
                <Text style={styles.detailLabel}>Cible</Text>
                <Text style={styles.detailValeur}>{entree.cible}</Text>
              </View>
              <View style={styles.ligneDetail}>
                <Text style={styles.detailLabel}>Adresse IP</Text>
                <Text style={[styles.detailValeur, styles.ipTexte]}>{entree.ip}</Text>
              </View>
            </View>
          </View>
        ))}
        <View style={styles.finListe} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  titre: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  sousTitre: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  btnExport: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  btnExportTexte: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.bg,
  },
  filtresScroll: {
    maxHeight: 56,
    marginBottom: 8,
  },
  filtresContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  filtreBouton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  filtreBoutonActif: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filtreTexte: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '600',
  },
  filtreTexteActif: {
    color: COLORS.bg,
  },
  liste: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeTexte: {
    fontSize: 12,
    fontWeight: '700',
  },
  dateHeure: {
    fontSize: 12,
    color: COLORS.muted,
  },
  cardCorps: {
    gap: 6,
  },
  ligneDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.muted,
  },
  detailValeur: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  ipTexte: {
    color: COLORS.muted,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  finListe: {
    height: 30,
  },
});
