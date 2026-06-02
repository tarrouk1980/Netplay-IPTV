import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTRES = ['Tous', 'Chauffeurs', 'Livreurs', 'Dépanneurs'];

const PRESTATAIRES = [
  { id: '1', nom: 'Karim Benmoussa', role: 'Chauffeurs', gains: 3420, courses: 87, note: 4.8, paiement: 'Payé' },
  { id: '2', nom: 'Fatima Ouali', role: 'Livreurs', gains: 1850, courses: 143, note: 4.9, paiement: 'En attente' },
  { id: '3', nom: 'Ahmed Ziani', role: 'Dépanneurs', gains: 5100, courses: 34, note: 4.6, paiement: 'En attente' },
  { id: '4', nom: 'Youssef Tahiri', role: 'Chauffeurs', gains: 2780, courses: 71, note: 4.7, paiement: 'Payé' },
  { id: '5', nom: 'Nadia Cherkaoui', role: 'Livreurs', gains: 2100, courses: 162, note: 5.0, paiement: 'Payé' },
  { id: '6', nom: 'Omar Lahlou', role: 'Dépanneurs', gains: 4200, courses: 28, note: 4.4, paiement: 'En attente' },
  { id: '7', nom: 'Samira Ennaji', role: 'Chauffeurs', gains: 1950, courses: 49, note: 4.5, paiement: 'Payé' },
  { id: '8', nom: 'Rachid Moussaoui', role: 'Livreurs', gains: 1600, courses: 120, note: 4.3, paiement: 'En attente' },
  { id: '9', nom: 'Hassan Berrada', role: 'Dépanneurs', gains: 3800, courses: 25, note: 4.7, paiement: 'Payé' },
  { id: '10', nom: 'Leila Fassi', role: 'Chauffeurs', gains: 2300, courses: 58, note: 4.6, paiement: 'En attente' },
];

const EMOJI_ROLE = {
  Chauffeurs: '🚕',
  Livreurs: '📦',
  Dépanneurs: '🛻',
};

export default function AdminDriverEarningsScreen() {
  const [filtreActif, setFiltreActif] = useState('Tous');

  const prestatairesFiltrés =
    filtreActif === 'Tous'
      ? PRESTATAIRES
      : PRESTATAIRES.filter((p) => p.role === filtreActif);

  const totalAPayer = prestatairesFiltrés
    .filter((p) => p.paiement === 'En attente')
    .reduce((acc, p) => acc + p.gains, 0);

  const confirmerVirement = (prestataire) => {
    Alert.alert(
      'Confirmer le virement',
      `Virer ${prestataire.gains.toLocaleString()} MAD à ${prestataire.nom} ?`,
      [
        {
          text: 'Confirmer',
          onPress: () =>
            Alert.alert('Succès', `Virement de ${prestataire.gains.toLocaleString()} MAD initié.`),
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const rendrePrestataire = ({ item }) => (
    <View style={styles.carte}>
      <View style={styles.carteGauche}>
        <Text style={styles.emoji}>{EMOJI_ROLE[item.role]}</Text>
        <View style={styles.infos}>
          <Text style={styles.nom}>{item.nom}</Text>
          <Text style={styles.role}>{item.role}</Text>
          <View style={styles.statsRangee}>
            <Text style={styles.stat}>⭐ {item.note.toFixed(1)}</Text>
            <Text style={styles.separateur}>·</Text>
            <Text style={styles.stat}>{item.courses} courses</Text>
          </View>
        </View>
      </View>
      <View style={styles.carteDroite}>
        <Text style={styles.gains}>{item.gains.toLocaleString()} MAD</Text>
        <View
          style={[
            styles.badgePaiement,
            { backgroundColor: item.paiement === 'Payé' ? '#4CAF5022' : '#F5A62322' },
          ]}
        >
          <Text
            style={[
              styles.badgePaiementTexte,
              { color: item.paiement === 'Payé' ? '#4CAF50' : '#F5A623' },
            ]}
          >
            {item.paiement}
          </Text>
        </View>
        {item.paiement === 'En attente' && (
          <TouchableOpacity
            style={styles.boutonVirer}
            onPress={() => confirmerVirement(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.boutonVirerTexte}>Virer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.entete}>
        <Text style={styles.titre}>Gains des prestataires</Text>
      </View>

      <View style={styles.filtres}>
        {FILTRES.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filtreBouton, filtreActif === f && styles.filtreBoutonActif]}
            onPress={() => setFiltreActif(f)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filtreTexte, filtreActif === f && styles.filtreTexteActif]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={prestatairesFiltrés}
        keyExtractor={(item) => item.id}
        renderItem={rendrePrestataire}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.pied}>
        <View style={styles.totalRangee}>
          <Text style={styles.totalLibelle}>Total à payer</Text>
          <Text style={styles.totalMontant}>{totalAPayer.toLocaleString()} MAD</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  entete: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titre: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filtres: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filtreBouton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
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
    fontWeight: '500',
  },
  filtreTexteActif: {
    color: '#0A0A0F',
    fontWeight: '700',
  },
  liste: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  carte: {
    backgroundColor: '#1C1C28',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carteGauche: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 28,
    marginRight: 12,
  },
  infos: {
    flex: 1,
  },
  nom: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  role: {
    color: '#8E8E9A',
    fontSize: 12,
    marginTop: 2,
  },
  statsRangee: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  stat: {
    color: '#8E8E9A',
    fontSize: 12,
  },
  separateur: {
    color: '#2C2C3A',
    marginHorizontal: 6,
  },
  carteDroite: {
    alignItems: 'flex-end',
    gap: 6,
  },
  gains: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  badgePaiement: {
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  badgePaiementTexte: {
    fontSize: 11,
    fontWeight: '600',
  },
  boutonVirer: {
    backgroundColor: '#F5A623',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 14,
  },
  boutonVirerTexte: {
    color: '#0A0A0F',
    fontSize: 13,
    fontWeight: '700',
  },
  pied: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2C2C3A',
    backgroundColor: '#0A0A0F',
  },
  totalRangee: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLibelle: {
    color: '#8E8E9A',
    fontSize: 15,
  },
  totalMontant: {
    color: '#F5A623',
    fontSize: 22,
    fontWeight: '700',
  },
});
