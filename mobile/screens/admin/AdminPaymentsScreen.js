import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTRES = ['Tous', 'Taxi', 'Livraison', 'SOS', 'Épicerie'];

const TRANSACTIONS = [
  { id: 'TXN-001', service: 'Taxi', montant: 24.50, statut: 'Complété', date: '2026-06-02 18:42' },
  { id: 'TXN-002', service: 'Livraison', montant: 38.00, statut: 'En attente', date: '2026-06-02 17:30' },
  { id: 'TXN-003', service: 'Épicerie', montant: 112.75, statut: 'Complété', date: '2026-06-02 16:15' },
  { id: 'TXN-004', service: 'SOS', montant: 85.00, statut: 'Remboursé', date: '2026-06-02 15:00' },
  { id: 'TXN-005', service: 'Taxi', montant: 18.00, statut: 'Complété', date: '2026-06-02 13:45' },
  { id: 'TXN-006', service: 'Livraison', montant: 45.20, statut: 'Complété', date: '2026-06-02 12:30' },
  { id: 'TXN-007', service: 'Épicerie', montant: 67.90, statut: 'En attente', date: '2026-06-02 11:10' },
  { id: 'TXN-008', service: 'Taxi', montant: 31.00, statut: 'Complété', date: '2026-06-02 10:00' },
  { id: 'TXN-009', service: 'SOS', montant: 120.00, statut: 'Remboursé', date: '2026-06-01 22:15' },
  { id: 'TXN-010', service: 'Livraison', montant: 29.50, statut: 'En attente', date: '2026-06-01 20:40' },
];

const COULEUR_STATUT = {
  'Complété': '#22C55E',
  'En attente': '#F5A623',
  'Remboursé': '#EF4444',
};

export default function AdminPaymentsScreen({ navigation }) {
  const [filtreActif, setFiltreActif] = useState('Tous');

  const transactionsFiltrees = filtreActif === 'Tous'
    ? TRANSACTIONS
    : TRANSACTIONS.filter((t) => t.service === filtreActif);

  const total = transactionsFiltrees.reduce((acc, t) => acc + t.montant, 0);

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
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={transactionsFiltrees}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            <View style={styles.transactionGauche}>
              <View style={styles.transactionEntete}>
                <Text style={styles.transactionId}>{item.id}</Text>
                <View style={[styles.serviceBadge, { backgroundColor: '#2C2C3A' }]}>
                  <Text style={styles.serviceTexte}>{item.service}</Text>
                </View>
              </View>
              <Text style={styles.transactionDate}>{item.date}</Text>
            </View>
            <View style={styles.transactionDroite}>
              <Text style={styles.transactionMontant}>{item.montant.toFixed(2)} $</Text>
              <View style={[styles.statutBadge, { backgroundColor: COULEUR_STATUT[item.statut] + '22' }]}>
                <Text style={[styles.statutTexte, { color: COULEUR_STATUT[item.statut] }]}>
                  {item.statut}
                </Text>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total affiché</Text>
            <Text style={styles.totalValeur}>{total.toFixed(2)} $</Text>
          </View>
        }
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
