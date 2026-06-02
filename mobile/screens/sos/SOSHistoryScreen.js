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
  texte: '#FFFFFF',
  muet: '#8E8E9A',
  bordure: '#2C2C3A',
  succes: '#22C55E',
  danger: '#EF4444',
  info: '#3B82F6',
};

const DEMANDES_MOCK = [
  {
    id: 'SOS001',
    type: 'Crevaison',
    depanneur: 'Karim Benali',
    date: '28 mai 2026',
    heure: '14:32',
    duree: '45 min',
    prix: 1500,
    statut: 'Terminé',
  },
  {
    id: 'SOS002',
    type: 'Panne de batterie',
    depanneur: 'Moussa Traoré',
    date: '20 mai 2026',
    heure: '09:15',
    duree: '30 min',
    prix: 2000,
    statut: 'Terminé',
  },
  {
    id: 'SOS003',
    type: 'Panne moteur',
    depanneur: 'Idriss Koné',
    date: '2 juin 2026',
    heure: '11:00',
    duree: null,
    prix: 3500,
    statut: 'En cours',
  },
  {
    id: 'SOS004',
    type: 'Manque de carburant',
    depanneur: 'Seydou Diallo',
    date: '15 mai 2026',
    heure: '17:45',
    duree: '20 min',
    prix: 800,
    statut: 'Terminé',
  },
  {
    id: 'SOS005',
    type: 'Accident léger',
    depanneur: null,
    date: '10 mai 2026',
    heure: '08:22',
    duree: null,
    prix: 0,
    statut: 'Annulé',
  },
  {
    id: 'SOS006',
    type: 'Remorquage',
    depanneur: 'Oumar Sy',
    date: '5 mai 2026',
    heure: '21:10',
    duree: '60 min',
    prix: 5000,
    statut: 'Terminé',
  },
  {
    id: 'SOS007',
    type: 'Crevaison',
    depanneur: null,
    date: '2 juin 2026',
    heure: '16:30',
    duree: null,
    prix: 1500,
    statut: 'En cours',
  },
  {
    id: 'SOS008',
    type: 'Panne de batterie',
    depanneur: null,
    date: '1 juin 2026',
    heure: '13:05',
    duree: null,
    prix: 0,
    statut: 'Annulé',
  },
];

const FILTRES = ['Tous', 'En cours', 'Terminé', 'Annulé'];

const couleurStatut = (statut) => {
  if (statut === 'En cours') return COULEURS.info;
  if (statut === 'Terminé') return COULEURS.succes;
  if (statut === 'Annulé') return COULEURS.danger;
  return COULEURS.muet;
};

export default function SOSHistoryScreen({ navigation }) {
  const [filtreActif, setFiltreActif] = useState('Tous');

  const demandesFiltrees =
    filtreActif === 'Tous'
      ? DEMANDES_MOCK
      : DEMANDES_MOCK.filter((d) => d.statut === filtreActif);

  const rendreCarte = ({ item }) => (
    <TouchableOpacity
      style={styles.carte}
      onPress={() => navigation.navigate('SOSOrderDetail', { orderId: item.id })}
      activeOpacity={0.75}
    >
      <View style={styles.carteEntete}>
        <View style={styles.carteGauche}>
          <Text style={styles.emoji}>🛻</Text>
          <View>
            <Text style={styles.typeTexte}>{item.type}</Text>
            <Text style={styles.dateTexte}>
              {item.date} à {item.heure}
            </Text>
          </View>
        </View>
        <View style={[styles.badgeStatut, { backgroundColor: couleurStatut(item.statut) + '22' }]}>
          <Text style={[styles.badgeTexte, { color: couleurStatut(item.statut) }]}>
            {item.statut}
          </Text>
        </View>
      </View>

      <View style={styles.separateur} />

      <View style={styles.carteBas}>
        <View style={styles.infoGroupe}>
          <Text style={styles.infoLabel}>Dépanneur</Text>
          <Text style={styles.infoValeur}>
            {item.depanneur || '—'}
          </Text>
        </View>
        {item.duree && (
          <View style={styles.infoGroupe}>
            <Text style={styles.infoLabel}>Durée</Text>
            <Text style={styles.infoValeur}>{item.duree}</Text>
          </View>
        )}
        {item.prix > 0 && (
          <View style={styles.infoGroupe}>
            <Text style={styles.infoLabel}>Prix</Text>
            <Text style={[styles.infoValeur, { color: COULEURS.primary }]}>
              {item.prix.toLocaleString()} FCFA
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.entete}>
        <Text style={styles.titre}>Historique SOS</Text>
        <Text style={styles.sousTitre}>{demandesFiltrees.length} demande{demandesFiltrees.length > 1 ? 's' : ''}</Text>
      </View>

      <View style={styles.filtreBarre}>
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
        renderItem={rendreCarte}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.vide}>
            <Text style={styles.videEmoji}>📭</Text>
            <Text style={styles.videTexte}>Aucune demande trouvée</Text>
          </View>
        }
      />

      <View style={styles.piedPage}>
        <TouchableOpacity
          style={styles.boutonNouvelle}
          onPress={() => navigation.navigate('SOSHome')}
          activeOpacity={0.85}
        >
          <Text style={styles.boutonNouvelleTexte}>🛻  Nouvelle demande</Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 16,
    paddingBottom: 8,
  },
  titre: {
    fontSize: 24,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  sousTitre: {
    fontSize: 14,
    color: COULEURS.muet,
    marginTop: 2,
  },
  filtreBarre: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 12,
    gap: 8,
  },
  filtreBouton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COULEURS.surface,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  filtreBoutonActif: {
    backgroundColor: COULEURS.primary,
    borderColor: COULEURS.primary,
  },
  filtreTexte: {
    fontSize: 13,
    color: COULEURS.muet,
    fontWeight: '500',
  },
  filtreTexteActif: {
    color: COULEURS.bg,
    fontWeight: '700',
  },
  liste: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  carte: {
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  carteEntete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carteGauche: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 28,
  },
  typeTexte: {
    fontSize: 16,
    fontWeight: '600',
    color: COULEURS.texte,
  },
  dateTexte: {
    fontSize: 12,
    color: COULEURS.muet,
    marginTop: 2,
  },
  badgeStatut: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTexte: {
    fontSize: 12,
    fontWeight: '600',
  },
  separateur: {
    height: 1,
    backgroundColor: COULEURS.bordure,
    marginVertical: 12,
  },
  carteBas: {
    flexDirection: 'row',
    gap: 24,
  },
  infoGroupe: {
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: COULEURS.muet,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValeur: {
    fontSize: 13,
    color: COULEURS.texte,
    fontWeight: '500',
  },
  vide: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  videEmoji: {
    fontSize: 48,
  },
  videTexte: {
    fontSize: 16,
    color: COULEURS.muet,
  },
  piedPage: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COULEURS.bordure,
  },
  boutonNouvelle: {
    backgroundColor: COULEURS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  boutonNouvelleTexte: {
    fontSize: 16,
    fontWeight: '700',
    color: COULEURS.bg,
  },
});
