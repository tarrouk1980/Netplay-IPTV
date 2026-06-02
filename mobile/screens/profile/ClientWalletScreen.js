import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COULEURS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
  credit: '#4CAF50',
  debit: '#F44336',
};

const TRANSACTIONS = [
  { id: '1', type: 'Crédit', montant: 2000, description: 'Rechargement portefeuille', date: '01 Juin 2026' },
  { id: '2', type: 'Débit', montant: 850, description: 'Course taxi — Aéroport → Alger', date: '31 Mai 2026' },
  { id: '3', type: 'Débit', montant: 1200, description: 'Livraison courses — Supermarché BIO', date: '30 Mai 2026' },
  { id: '4', type: 'Crédit', montant: 500, description: 'Bonus parrainage — Omar M.', date: '29 Mai 2026' },
  { id: '5', type: 'Débit', montant: 650, description: 'Course taxi — Centre → Bab Ezzouar', date: '28 Mai 2026' },
  { id: '6', type: 'Débit', montant: 300, description: 'Livraison repas — Restaurant Dar Djida', date: '27 Mai 2026' },
  { id: '7', type: 'Crédit', montant: 3000, description: 'Rechargement portefeuille', date: '25 Mai 2026' },
  { id: '8', type: 'Débit', montant: 950, description: 'Course taxi — Hussein Dey → Draria', date: '24 Mai 2026' },
];

const SOLDE_PRINCIPAL = 1550;

export default function ClientWalletScreen({ navigation }) {
  const [soldeVisible, setSoldeVisible] = useState(true);

  function renderTransaction({ item }) {
    const estCredit = item.type === 'Crédit';
    return (
      <View style={styles.transactionCard}>
        <View style={[styles.transactionIcone, { backgroundColor: estCredit ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.15)' }]}>
          <Text style={[styles.transactionFleche, { color: estCredit ? COULEURS.credit : COULEURS.debit }]}>
            {estCredit ? '↑' : '↓'}
          </Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription} numberOfLines={1}>{item.description}</Text>
          <Text style={styles.transactionDate}>{item.date}</Text>
        </View>
        <Text style={[styles.transactionMontant, { color: estCredit ? COULEURS.credit : COULEURS.debit }]}>
          {estCredit ? '+' : '-'}{item.montant} DA
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={TRANSACTIONS}
        keyExtractor={item => item.id}
        renderItem={renderTransaction}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Text style={styles.titre}>Mon Portefeuille</Text>

            <View style={styles.cardSolde}>
              <Text style={styles.labelSolde}>Solde disponible</Text>
              <TouchableOpacity onPress={() => setSoldeVisible(v => !v)} activeOpacity={0.8}>
                <Text style={styles.solde}>
                  {soldeVisible ? `${SOLDE_PRINCIPAL.toLocaleString('fr-FR')} DA` : '•••••••'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.sousLabelSolde}>
                {soldeVisible ? 'Appuyer pour masquer' : 'Appuyer pour afficher'}
              </Text>
            </View>

            <View style={styles.boutonsActions}>
              <TouchableOpacity
                style={styles.boutonAction}
                onPress={() => navigation.navigate('WalletRecharge')}
                activeOpacity={0.8}
              >
                <Text style={styles.boutonActionIcone}>+</Text>
                <Text style={styles.boutonActionTexte}>Recharger</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.boutonAction, styles.boutonActionSecondaire]}
                onPress={() => Alert.alert('Retrait', 'Fonctionnalité de retrait bientôt disponible.')}
                activeOpacity={0.8}
              >
                <Text style={[styles.boutonActionIcone, styles.boutonActionTexteSecondaire]}>↓</Text>
                <Text style={[styles.boutonActionTexte, styles.boutonActionTexteSecondaire]}>Retirer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.boutonAction, styles.boutonActionSecondaire]}
                onPress={() => navigation.navigate('WalletTransactions')}
                activeOpacity={0.8}
              >
                <Text style={[styles.boutonActionIcone, styles.boutonActionTexteSecondaire]}>≡</Text>
                <Text style={[styles.boutonActionTexte, styles.boutonActionTexteSecondaire]}>Historique</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitre}>Dernières transactions</Text>
          </View>
        }
        contentContainerStyle={styles.liste}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COULEURS.bg,
  },
  liste: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  titre: {
    fontSize: 22,
    fontWeight: '700',
    color: COULEURS.text,
    marginTop: 8,
    marginBottom: 20,
  },
  cardSolde: {
    backgroundColor: COULEURS.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  labelSolde: {
    fontSize: 14,
    color: COULEURS.muted,
    marginBottom: 10,
  },
  solde: {
    fontSize: 42,
    fontWeight: '800',
    color: COULEURS.primary,
    letterSpacing: 1,
  },
  sousLabelSolde: {
    fontSize: 12,
    color: COULEURS.muted,
    marginTop: 8,
  },
  boutonsActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  boutonAction: {
    flex: 1,
    backgroundColor: COULEURS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  boutonActionSecondaire: {
    backgroundColor: COULEURS.surface,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  boutonActionIcone: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  boutonActionTexte: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  boutonActionTexteSecondaire: {
    color: COULEURS.text,
  },
  sectionTitre: {
    fontSize: 16,
    fontWeight: '600',
    color: COULEURS.text,
    marginBottom: 12,
  },
  transactionCard: {
    backgroundColor: COULEURS.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  transactionIcone: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionFleche: {
    fontSize: 20,
    fontWeight: '700',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    color: COULEURS.text,
    fontWeight: '500',
    marginBottom: 3,
  },
  transactionDate: {
    fontSize: 12,
    color: COULEURS.muted,
  },
  transactionMontant: {
    fontSize: 15,
    fontWeight: '700',
  },
});
