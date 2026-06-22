import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const FILTRES = ['Tous', 'RECHARGE', 'DEBIT', 'REFUND'];
const FILTRE_LABEL = { Tous: 'Tous', RECHARGE: 'Recharges', DEBIT: 'Débits', REFUND: 'Remboursements' };

const COULEUR_STATUT = {
  RECHARGE: '#22C55E',
  DEBIT: '#F5A623',
  REFUND: '#EF4444',
};

export default function AdminPaymentsScreen({ navigation }) {
  const [filtreActif, setFiltreActif] = useState('Tous');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/admin/transactions')
      .then(r => { setTransactions(r.data.transactions || []); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const transactionsFiltrees = filtreActif === 'Tous'
    ? transactions
    : transactions.filter((t) => t.type === filtreActif);

  const total = transactionsFiltrees.reduce((acc, t) => acc + Math.abs(Number(t.amount) || 0), 0);

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
          Impossible de charger les transactions.
        </Text>
        <TouchableOpacity onPress={load} style={{ backgroundColor: '#F5A623', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 }}>
          <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titre}>Paiements</Text>
        <Text style={styles.sousTitre}>Transactions de la plateforme</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtresScroll}
        contentContainerStyle={styles.filtresContainer}
      >
        {FILTRES.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filtreBtn, filtreActif === f && styles.filtreActif]}
            onPress={() => setFiltreActif(f)}
          >
            <Text style={[styles.filtreTexte, filtreActif === f && styles.filtreTexteActif]}>
              {FILTRE_LABEL[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={transactionsFiltrees}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ color: '#8E8E9A' }}>Aucune transaction</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            <View style={styles.transactionGauche}>
              <View style={styles.transactionEntete}>
                <Text style={styles.transactionId}>{item.user?.name || 'Utilisateur'}</Text>
                <View style={[styles.serviceBadge, { backgroundColor: '#2C2C3A' }]}>
                  <Text style={styles.serviceTexte}>{item.type}</Text>
                </View>
              </View>
              <Text style={styles.transactionDate}>
                {new Date(item.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
              {item.description && <Text style={styles.transactionDate}>{item.description}</Text>}
            </View>
            <View style={styles.transactionDroite}>
              <Text style={styles.transactionMontant}>{Number(item.amount).toFixed(2)} TND</Text>
              <View style={[styles.statutBadge, { backgroundColor: (COULEUR_STATUT[item.type] || '#8E8E9A') + '22' }]}>
                <Text style={[styles.statutTexte, { color: COULEUR_STATUT[item.type] || '#8E8E9A' }]}>
                  {FILTRE_LABEL[item.type] || item.type}
                </Text>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={transactionsFiltrees.length > 0 ? (
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total affiché</Text>
            <Text style={styles.totalValeur}>{total.toFixed(2)} TND</Text>
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  titre: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sousTitre: {
    fontSize: 14,
    color: '#8E8E9A',
    marginTop: 2,
  },
  filtresScroll: {
    marginBottom: 12,
  },
  filtresContainer: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
  },
  filtreBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1C1C28',
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  filtreActif: {
    backgroundColor: '#F5A623',
    borderColor: '#F5A623',
  },
  filtreTexte: {
    color: '#8E8E9A',
    fontSize: 14,
    fontWeight: '600',
  },
  filtreTexteActif: {
    color: '#0A0A0F',
  },
  liste: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  transactionCard: {
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
  transactionGauche: {
    flex: 1,
    gap: 6,
  },
  transactionEntete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionId: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  serviceBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  serviceTexte: {
    color: '#8E8E9A',
    fontSize: 12,
    fontWeight: '500',
  },
  transactionDate: {
    color: '#8E8E9A',
    fontSize: 12,
  },
  transactionDroite: {
    alignItems: 'flex-end',
    gap: 6,
  },
  transactionMontant: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  statutBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statutTexte: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalContainer: {
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F5A623',
  },
  totalLabel: {
    color: '#8E8E9A',
    fontSize: 16,
    fontWeight: '600',
  },
  totalValeur: {
    color: '#F5A623',
    fontSize: 22,
    fontWeight: '800',
  },
});
