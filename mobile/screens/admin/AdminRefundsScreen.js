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

const REMBOURSEMENTS_INIT = [
  {
    id: 'RMB-001',
    client: 'Karim Benali',
    service: 'Taxi',
    montant: 850,
    raison: 'Chauffeur annulé sans prévenir',
    date: '02 juin 2026',
    statut: 'En attente',
  },
  {
    id: 'RMB-002',
    client: 'Samira Hadj',
    service: 'Livraison',
    montant: 1200,
    raison: 'Colis endommagé à la réception',
    date: '01 juin 2026',
    statut: 'En attente',
  },
  {
    id: 'RMB-003',
    client: 'Yacine Meziane',
    service: 'SOS',
    montant: 3500,
    raison: 'Technicien non qualifié',
    date: '31 mai 2026',
    statut: 'Approuvé',
  },
  {
    id: 'RMB-004',
    client: 'Nadia Ouali',
    service: 'Livraison',
    montant: 650,
    raison: 'Commande incorrecte livrée',
    date: '30 mai 2026',
    statut: 'Rejeté',
  },
  {
    id: 'RMB-005',
    client: 'Omar Cherif',
    service: 'Taxi',
    montant: 1100,
    raison: 'Mauvais itinéraire pris',
    date: '29 mai 2026',
    statut: 'En attente',
  },
  {
    id: 'RMB-006',
    client: 'Fatima Bouzid',
    service: 'SOS',
    montant: 2800,
    raison: 'Panne non résolue',
    date: '28 mai 2026',
    statut: 'Approuvé',
  },
  {
    id: 'RMB-007',
    client: 'Amine Kaci',
    service: 'Livraison',
    montant: 400,
    raison: 'Retard de plus de 2 heures',
    date: '27 mai 2026',
    statut: 'Rejeté',
  },
  {
    id: 'RMB-008',
    client: 'Leila Mansouri',
    service: 'Taxi',
    montant: 750,
    raison: 'Véhicule non conforme',
    date: '26 mai 2026',
    statut: 'En attente',
  },
];

const FILTRES = ['Tous', 'En attente', 'Approuvé', 'Rejeté'];

const COULEUR_STATUT = {
  'En attente': '#F5A623',
  'Approuvé': '#22C55E',
  'Rejeté': '#EF4444',
};

const BG_STATUT = {
  'En attente': 'rgba(245,166,35,0.12)',
  'Approuvé': 'rgba(34,197,94,0.12)',
  'Rejeté': 'rgba(239,68,68,0.12)',
};

const ICONE_SERVICE = {
  Taxi: '🚕',
  Livraison: '📦',
  SOS: '🆘',
};

export default function AdminRefundsScreen({ navigation }) {
  const [remboursements, setRemboursements] = useState(REMBOURSEMENTS_INIT);
  const [filtreActif, setFiltreActif] = useState('Tous');

  const total = remboursements.length;
  const montantTotal = remboursements.reduce((acc, r) => acc + r.montant, 0);
  const approuvésMois = remboursements.filter((r) => r.statut === 'Approuvé').length;

  const remboursementsFiltres =
    filtreActif === 'Tous'
      ? remboursements
      : remboursements.filter((r) => r.statut === filtreActif);

  const changerStatut = (id, nouveauStatut) => {
    setRemboursements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, statut: nouveauStatut } : r))
    );
  };

  const approuver = (remboursement) => {
    Alert.alert(
      'Approuver le remboursement',
      `Confirmer le remboursement de ${remboursement.montant} DA à ${remboursement.client} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Approuver',
          onPress: () => changerStatut(remboursement.id, 'Approuvé'),
        },
      ]
    );
  };

  const rejeter = (remboursement) => {
    Alert.alert(
      'Rejeter le remboursement',
      `Rejeter la demande de ${remboursement.client} pour ${remboursement.montant} DA ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Rejeter',
          style: 'destructive',
          onPress: () => changerStatut(remboursement.id, 'Rejeté'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.boutonRetour}>
          <Text style={styles.boutonRetourTexte}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titrePage}>Remboursements</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValeur}>{total}</Text>
            <Text style={styles.statLabel}>Total{'\n'}demandes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValeur}>{montantTotal.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Montant{'\n'}total (DA)</Text>
          </View>
          <View style={[styles.statCard, { borderRightWidth: 0 }]}>
            <Text style={[styles.statValeur, { color: '#22C55E' }]}>{approuvésMois}</Text>
            <Text style={styles.statLabel}>Approuvés{'\n'}ce mois</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtresScroll}
          contentContainerStyle={styles.filtresContainer}
        >
          {FILTRES.map((filtre) => (
            <TouchableOpacity
              key={filtre}
              style={[
                styles.filtreBouton,
                filtreActif === filtre && styles.filtreBoutonActif,
              ]}
              onPress={() => setFiltreActif(filtre)}
            >
              <Text
                style={[
                  styles.filtreTexte,
                  filtreActif === filtre && styles.filtreTexteActif,
                ]}
              >
                {filtre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.liste}>
          {remboursementsFiltres.map((remboursement) => (
            <View key={remboursement.id} style={styles.remboursementCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderGauche}>
                  <Text style={styles.serviceIcone}>{ICONE_SERVICE[remboursement.service]}</Text>
                  <View>
                    <Text style={styles.clientNom}>{remboursement.client}</Text>
                    <Text style={styles.serviceTexte}>{remboursement.service} • {remboursement.date}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statutBadge,
                    { backgroundColor: BG_STATUT[remboursement.statut] },
                  ]}
                >
                  <Text style={[styles.statutTexte, { color: COULEUR_STATUT[remboursement.statut] }]}>
                    {remboursement.statut}
                  </Text>
                </View>
              </View>

              <Text style={styles.raisonTexte}>{remboursement.raison}</Text>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.montantLabel}>Montant demandé</Text>
                  <Text style={styles.montantValeur}>{remboursement.montant} DA</Text>
                </View>

                {remboursement.statut === 'En attente' && (
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity
                      style={styles.boutonRejeter}
                      onPress={() => rejeter(remboursement)}
                    >
                      <Text style={styles.boutonRejeterTexte}>Rejeter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.boutonApprouver}
                      onPress={() => approuver(remboursement)}
                    >
                      <Text style={styles.boutonApprouverTexte}>Approuver</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.espaceFond} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C3A',
  },
  boutonRetour: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boutonRetourTexte: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  titrePage: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 36,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: '#2C2C3A',
  },
  statValeur: {
    color: '#F5A623',
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: '#8E8E9A',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  filtresScroll: {
    marginTop: 16,
  },
  filtresContainer: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  filtreBouton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1C1C28',
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  filtreBoutonActif: {
    backgroundColor: '#F5A623',
    borderColor: '#F5A623',
  },
  filtreTexte: {
    color: '#8E8E9A',
    fontSize: 13,
    fontWeight: '600',
  },
  filtreTexteActif: {
    color: '#0A0A0F',
  },
  liste: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  remboursementCard: {
    backgroundColor: '#1C1C28',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardHeaderGauche: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceIcone: {
    fontSize: 22,
    marginRight: 10,
  },
  clientNom: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  serviceTexte: {
    color: '#8E8E9A',
    fontSize: 12,
    marginTop: 2,
  },
  statutBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statutTexte: {
    fontSize: 12,
    fontWeight: '700',
  },
  raisonTexte: {
    color: '#8E8E9A',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C3A',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  montantLabel: {
    color: '#8E8E9A',
    fontSize: 11,
  },
  montantValeur: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  boutonRejeter: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  boutonRejeterTexte: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  boutonApprouver: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#22C55E',
  },
  boutonApprouverTexte: {
    color: '#0A0A0F',
    fontSize: 13,
    fontWeight: '700',
  },
  espaceFond: {
    height: 40,
  },
});
