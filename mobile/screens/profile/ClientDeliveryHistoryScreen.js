import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
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

const FILTRES = ['Tous', 'Ce mois', 'Cette semaine', 'En cours'];

const COMMANDES_MOCK = [
  {
    id: '1',
    restaurant: 'Burger Palace',
    articles: 'Burger BBQ x1, Frites x2, Coca x2',
    prixTotal: 28.50,
    date: '2026-05-28',
    statut: 'Livré',
    livreur: 'Karim B.',
  },
  {
    id: '2',
    restaurant: 'Sushi Zen',
    articles: 'Plateau Sushi 24 pcs, Soupe Miso x2',
    prixTotal: 52.00,
    date: '2026-05-25',
    statut: 'Livré',
    livreur: 'Fatima L.',
  },
  {
    id: '3',
    restaurant: 'Pizza Roma',
    articles: 'Margherita x1, Calzone x1, Tiramisu x1',
    prixTotal: 35.80,
    date: '2026-05-20',
    statut: 'Livré',
    livreur: 'Yassine M.',
  },
  {
    id: '4',
    restaurant: 'Burger Palace',
    articles: 'Double Smash x2, Onion Rings x1',
    prixTotal: 31.00,
    date: '2026-05-15',
    statut: 'Livré',
    livreur: 'Karim B.',
  },
  {
    id: '5',
    restaurant: 'Tacos House',
    articles: 'Tacos XL x3, Limonade x3',
    prixTotal: 40.50,
    date: '2026-05-10',
    statut: 'Annulé',
    livreur: 'Non assigné',
  },
  {
    id: '6',
    restaurant: 'Chez Mamie',
    articles: 'Menu du jour x2, Dessert du jour x2',
    prixTotal: 26.00,
    date: '2026-05-05',
    statut: 'Livré',
    livreur: 'Amina S.',
  },
  {
    id: '7',
    restaurant: 'Sushi Zen',
    articles: 'Ramen x1, Gyoza x2, Sashimi x1',
    prixTotal: 44.20,
    date: '2026-04-28',
    statut: 'Livré',
    livreur: 'Fatima L.',
  },
  {
    id: '8',
    restaurant: 'Pizza Roma',
    articles: 'Regina x2, Salade César x1',
    prixTotal: 33.60,
    date: '2026-04-22',
    statut: 'Livré',
    livreur: 'Omar D.',
  },
  {
    id: '9',
    restaurant: 'Burger Palace',
    articles: 'Chicken Crispy x1, Milkshake x1',
    prixTotal: 18.90,
    date: '2026-06-01',
    statut: 'En cours',
    livreur: 'Karim B.',
  },
  {
    id: '10',
    restaurant: 'Tacos House',
    articles: 'Tacos L x2, Churros x2, Jus x2',
    prixTotal: 38.00,
    date: '2026-04-15',
    statut: 'Livré',
    livreur: 'Yassine M.',
  },
];

const couleurStatut = (statut) => {
  if (statut === 'Livré') return '#4CAF50';
  if (statut === 'En cours') return '#F5A623';
  if (statut === 'Annulé') return '#F44336';
  return COULEURS.muted;
};

const filtrerCommandes = (commandes, filtre) => {
  if (filtre === 'Tous') return commandes;
  if (filtre === 'En cours') return commandes.filter((c) => c.statut === 'En cours');
  if (filtre === 'Cette semaine') {
    return commandes.filter((c) => ['2026-05-28', '2026-06-01'].includes(c.date));
  }
  if (filtre === 'Ce mois') {
    return commandes.filter((c) => c.date.startsWith('2026-05') || c.date.startsWith('2026-06'));
  }
  return commandes;
};

const restaurantFavori = (commandes) => {
  const comptes = {};
  commandes.forEach((c) => {
    comptes[c.restaurant] = (comptes[c.restaurant] || 0) + 1;
  });
  return Object.entries(comptes).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
};

export default function ClientDeliveryHistoryScreen({ navigation }) {
  const [filtreActif, setFiltreActif] = useState('Tous');

  const commandesFiltrees = filtrerCommandes(COMMANDES_MOCK, filtreActif);
  const totalDepense = COMMANDES_MOCK.filter((c) => c.statut === 'Livré').reduce(
    (acc, c) => acc + c.prixTotal,
    0
  );
  const nombreCommandes = COMMANDES_MOCK.length;
  const favori = restaurantFavori(COMMANDES_MOCK.filter((c) => c.statut === 'Livré'));

  const renderCommande = ({ item }) => (
    <TouchableOpacity
      style={styles.carte}
      onPress={() => navigation.navigate('DeliveryOrderDetail', { orderId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.carteEntete}>
        <Text style={styles.restaurant}>{item.restaurant}</Text>
        <View style={[styles.badgeStatut, { backgroundColor: couleurStatut(item.statut) + '22' }]}>
          <Text style={[styles.textStatut, { color: couleurStatut(item.statut) }]}>
            {item.statut}
          </Text>
        </View>
      </View>
      <Text style={styles.articles} numberOfLines={1}>{item.articles}</Text>
      <View style={styles.carteInfos}>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.livreur}>🛻 {item.livreur}</Text>
        <Text style={styles.prix}>{item.prixTotal.toFixed(2)} €</Text>
      </View>
      <TouchableOpacity
        style={styles.boutonCommander}
        onPress={() => navigation.navigate('Merchant')}
        activeOpacity={0.8}
      >
        <Text style={styles.textBoutonCommander}>Commander à nouveau</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.entete}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.boutonRetour}>
          <Text style={styles.textRetour}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titre}>Historique des livraisons</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.resume}>
        <View style={styles.resumeItem}>
          <Text style={styles.resumeValeur}>{totalDepense.toFixed(0)} €</Text>
          <Text style={styles.resumeLabel}>Total dépensé</Text>
        </View>
        <View style={styles.separateurResume} />
        <View style={styles.resumeItem}>
          <Text style={styles.resumeValeur}>{nombreCommandes}</Text>
          <Text style={styles.resumeLabel}>Commandes</Text>
        </View>
        <View style={styles.separateurResume} />
        <View style={styles.resumeItem}>
          <Text style={styles.resumeValeur} numberOfLines={1}>{favori}</Text>
          <Text style={styles.resumeLabel}>Favori</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtresContainer}
      >
        {FILTRES.map((filtre) => (
          <TouchableOpacity
            key={filtre}
            style={[styles.filtre, filtreActif === filtre && styles.filtreActif]}
            onPress={() => setFiltreActif(filtre)}
          >
            <Text style={[styles.textFiltre, filtreActif === filtre && styles.textFiltreActif]}>
              {filtre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={commandesFiltrees}
        keyExtractor={(item) => item.id}
        renderItem={renderCommande}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.vide}>
            <Text style={styles.texteVide}>Aucune commande trouvée</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COULEURS.bg,
  },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  boutonRetour: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textRetour: {
    color: COULEURS.text,
    fontSize: 24,
  },
  titre: {
    color: COULEURS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  resume: {
    flexDirection: 'row',
    backgroundColor: COULEURS.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  resumeItem: {
    flex: 1,
    alignItems: 'center',
  },
  resumeValeur: {
    color: COULEURS.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  resumeLabel: {
    color: COULEURS.muted,
    fontSize: 11,
  },
  separateurResume: {
    width: 1,
    backgroundColor: COULEURS.border,
    marginVertical: 4,
  },
  filtresContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filtre: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COULEURS.surface,
    borderWidth: 1,
    borderColor: COULEURS.border,
    marginRight: 8,
  },
  filtreActif: {
    backgroundColor: COULEURS.primary,
    borderColor: COULEURS.primary,
  },
  textFiltre: {
    color: COULEURS.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  textFiltreActif: {
    color: COULEURS.bg,
  },
  liste: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  carte: {
    backgroundColor: COULEURS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.border,
    marginBottom: 12,
  },
  carteEntete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  restaurant: {
    color: COULEURS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  badgeStatut: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  textStatut: {
    fontSize: 12,
    fontWeight: '600',
  },
  articles: {
    color: COULEURS.muted,
    fontSize: 13,
    marginBottom: 10,
  },
  carteInfos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    color: COULEURS.muted,
    fontSize: 12,
  },
  livreur: {
    color: COULEURS.muted,
    fontSize: 12,
  },
  prix: {
    color: COULEURS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  boutonCommander: {
    backgroundColor: COULEURS.primary + '22',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COULEURS.primary + '55',
  },
  textBoutonCommander: {
    color: COULEURS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  vide: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  texteVide: {
    color: COULEURS.muted,
    fontSize: 15,
  },
});
