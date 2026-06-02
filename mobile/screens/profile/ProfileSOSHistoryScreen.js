import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COULEURS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

const DEMANDES = [
  {
    id: '1',
    type: 'Crevaison',
    depanneur: 'Mohamed A.',
    date: '28 mai 2026',
    duree: '35 min',
    prix: 350,
    statut: 'Terminé',
  },
  {
    id: '2',
    type: 'Batterie déchargée',
    depanneur: 'Karim B.',
    date: '20 mai 2026',
    duree: '20 min',
    prix: 200,
    statut: 'Terminé',
  },
  {
    id: '3',
    type: 'Panne moteur',
    depanneur: 'Youssef D.',
    date: '15 mai 2026',
    duree: '90 min',
    prix: 800,
    statut: 'Terminé',
  },
  {
    id: '4',
    type: 'Carburant vide',
    depanneur: 'Ali S.',
    date: '10 mai 2026',
    duree: '25 min',
    prix: 250,
    statut: 'Annulé',
  },
  {
    id: '5',
    type: 'Accident léger',
    depanneur: 'Hamza T.',
    date: '3 mai 2026',
    duree: '60 min',
    prix: 600,
    statut: 'Terminé',
  },
  {
    id: '6',
    type: 'Remorquage',
    depanneur: 'Nassim R.',
    date: '25 avr 2026',
    duree: '45 min',
    prix: 500,
    statut: 'Terminé',
  },
  {
    id: '7',
    type: 'Crevaison',
    depanneur: 'En recherche...',
    date: "2 juin 2026",
    duree: '-',
    prix: 0,
    statut: 'En cours',
  },
  {
    id: '8',
    type: 'Batterie déchargée',
    depanneur: 'Omar Z.',
    date: '18 avr 2026',
    duree: '30 min',
    prix: 220,
    statut: 'Annulé',
  },
];

const FILTRES = ['Tous', 'Terminé', 'En cours', 'Annulé'];

const couleurStatut = (statut) => {
  if (statut === 'Terminé') return '#4CAF50';
  if (statut === 'En cours') return '#F5A623';
  if (statut === 'Annulé') return '#F44336';
  return '#8E8E9A';
};

export default function ClientSOSHistoryScreen({ navigation }) {
  const [filtreActif, setFiltreActif] = useState('Tous');

  const demandesFiltrees =
    filtreActif === 'Tous'
      ? DEMANDES
      : DEMANDES.filter((d) => d.statut === filtreActif);

  const totalDepense = DEMANDES.filter((d) => d.statut === 'Terminé').reduce(
    (acc, d) => acc + d.prix,
    0
  );

  const nombreInterventions = DEMANDES.filter(
    (d) => d.statut === 'Terminé'
  ).length;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.carte}
      onPress={() => navigation.navigate('SOSOrderDetail', { orderId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.carteEntete}>
        <View style={styles.carteGauche}>
          <Text style={styles.emoji}>🛻</Text>
          <View>
            <Text style={styles.typeText}>{item.type}</Text>
            <Text style={styles.depanneurText}>{item.depanneur}</Text>
          </View>
        </View>
        <View
          style={[
            styles.badgeStatut,
            { backgroundColor: couleurStatut(item.statut) + '22' },
          ]}
        >
          <Text
            style={[styles.textStatut, { color: couleurStatut(item.statut) }]}
          >
            {item.statut}
          </Text>
        </View>
      </View>
      <View style={styles.cartePied}>
        <Text style={styles.metaText}>{item.date}</Text>
        <Text style={styles.metaText}>⏱ {item.duree}</Text>
        <Text style={styles.prixText}>
          {item.prix > 0 ? `${item.prix} DA` : '-'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.entete}>
        <Text style={styles.titre}>Historique SOS</Text>
      </View>

      <View style={styles.resume}>
        <View style={styles.resumeItem}>
          <Text style={styles.resumeValeur}>{nombreInterventions}</Text>
          <Text style={styles.resumeLabel}>Interventions</Text>
        </View>
        <View style={styles.separateur} />
        <View style={styles.resumeItem}>
          <Text style={styles.resumeValeur}>{totalDepense} DA</Text>
          <Text style={styles.resumeLabel}>Total dépensé</Text>
        </View>
      </View>

      <View style={styles.filtres}>
        {FILTRES.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filtreBouton,
              filtreActif === f && styles.filtreBoutonActif,
            ]}
            onPress={() => setFiltreActif(f)}
          >
            <Text
              style={[
                styles.filtreTexte,
                filtreActif === f && styles.filtreTexteActif,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={demandesFiltrees}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.vide}>
            <Text style={styles.videTexte}>Aucune demande trouvée</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: COULEURS.bg,
  },
  entete: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titre: {
    fontSize: 24,
    fontWeight: '700',
    color: COULEURS.text,
  },
  resume: {
    flexDirection: 'row',
    backgroundColor: COULEURS.surface,
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  resumeItem: {
    alignItems: 'center',
  },
  resumeValeur: {
    fontSize: 22,
    fontWeight: '700',
    color: COULEURS.primary,
  },
  resumeLabel: {
    fontSize: 13,
    color: COULEURS.muted,
    marginTop: 4,
  },
  separateur: {
    width: 1,
    height: 40,
    backgroundColor: COULEURS.border,
  },
  filtres: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filtreBouton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COULEURS.surface,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  filtreBoutonActif: {
    backgroundColor: COULEURS.primary,
    borderColor: COULEURS.primary,
  },
  filtreTexte: {
    fontSize: 13,
    color: COULEURS.muted,
    fontWeight: '500',
  },
  filtreTexteActif: {
    color: '#000',
    fontWeight: '700',
  },
  liste: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  carte: {
    backgroundColor: COULEURS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  carteEntete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carteGauche: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 26,
  },
  typeText: {
    fontSize: 15,
    fontWeight: '700',
    color: COULEURS.text,
  },
  depanneurText: {
    fontSize: 13,
    color: COULEURS.muted,
    marginTop: 2,
  },
  badgeStatut: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  textStatut: {
    fontSize: 12,
    fontWeight: '600',
  },
  cartePied: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COULEURS.border,
    paddingTop: 10,
  },
  metaText: {
    fontSize: 12,
    color: COULEURS.muted,
  },
  prixText: {
    fontSize: 14,
    fontWeight: '700',
    color: COULEURS.primary,
  },
  vide: {
    alignItems: 'center',
    marginTop: 60,
  },
  videTexte: {
    fontSize: 15,
    color: COULEURS.muted,
  },
});
