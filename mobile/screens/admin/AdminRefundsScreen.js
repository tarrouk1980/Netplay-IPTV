import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

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
  TAXI: '🚕',
  DELIVERY: '📦',
  SOS: '🆘',
  GROCERY: '🛒',
};

const SERVICE_LABEL = {
  TAXI: 'Taxi',
  DELIVERY: 'Livraison',
  SOS: 'SOS',
  GROCERY: 'Épicerie',
};

const STATUT_LABEL = {
  OPEN: 'En attente',
  IN_REVIEW: 'En attente',
  RESOLVED: 'Approuvé',
  DISMISSED: 'Rejeté',
};

export default function AdminRefundsScreen({ navigation }) {
  const [remboursements, setRemboursements] = useState([]);
  const [filtreActif, setFiltreActif] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/admin/disputes')
      .then((r) => {
        const disputes = r.data.disputes || [];
        setRemboursements(disputes.map((d) => ({
          id: d.id,
          orderId: d.orderId,
          client: d.order?.client?.name || d.reporter?.name || 'Client',
          service: d.order?.serviceType || 'SOS',
          montant: Number(d.order?.price || 0),
          raison: d.reason,
          date: d.createdAt ? new Date(d.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '',
          statut: STATUT_LABEL[d.status] || d.status,
        })));
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const total = remboursements.length;
  const montantTotal = remboursements.reduce((acc, r) => acc + r.montant, 0);
  const approuvésMois = remboursements.filter((r) => r.statut === 'Approuvé').length;

  const remboursementsFiltres =
    filtreActif === 'Tous'
      ? remboursements
      : remboursements.filter((r) => r.statut === filtreActif);

  const approuver = (remboursement) => {
    Alert.alert(
      'Approuver le remboursement',
      `Confirmer le remboursement de ${remboursement.montant} DA à ${remboursement.client} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Approuver',
          onPress: async () => {
            try {
              if (remboursement.montant > 0) {
                await api.post(`/api/admin/disputes/${remboursement.id}/refund`, { amount: remboursement.montant });
              }
              await api.patch(`/api/admin/disputes/${remboursement.id}/status`, { status: 'RESOLVED' });
              load();
            } catch {
              Alert.alert('Erreur', "Impossible d'approuver le remboursement.");
            }
          },
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
          onPress: async () => {
            try {
              await api.patch(`/api/admin/disputes/${remboursement.id}/status`, { status: 'DISMISSED' });
              load();
            } catch {
              Alert.alert('Erreur', "Impossible de rejeter la demande.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color="#F5A623" size="large" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ color: '#8E8E9A', textAlign: 'center', marginBottom: 16 }}>
          Impossible de charger les remboursements.
        </Text>
        <TouchableOpacity onPress={load} style={{ backgroundColor: '#F5A623', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 }}>
          <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
          {remboursementsFiltres.length === 0 && (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ color: '#8E8E9A' }}>Aucune demande</Text>
            </View>
          )}
          {remboursementsFiltres.map((remboursement) => (
            <View key={remboursement.id} style={styles.remboursementCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderGauche}>
                  <Text style={styles.serviceIcone}>{ICONE_SERVICE[remboursement.service] || '🆘'}</Text>
                  <View>
                    <Text style={styles.clientNom}>{remboursement.client}</Text>
                    <Text style={styles.serviceTexte}>{SERVICE_LABEL[remboursement.service] || remboursement.service} • {remboursement.date}</Text>
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
