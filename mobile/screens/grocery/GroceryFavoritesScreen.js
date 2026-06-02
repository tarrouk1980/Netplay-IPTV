import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRODUITS_INITIAUX = [
  { id: '1', nom: 'Lait entier 1L', categorie: 'Produits laitiers', prix: '8.50 MAD', emoji: '🥛' },
  { id: '2', nom: 'Pain complet', categorie: 'Boulangerie', prix: '5.00 MAD', emoji: '🍞' },
  { id: '3', nom: 'Œufs fermiers x12', categorie: 'Œufs', prix: '22.00 MAD', emoji: '🥚' },
  { id: '4', nom: 'Tomates 1kg', categorie: 'Légumes', prix: '12.00 MAD', emoji: '🍅' },
  { id: '5', nom: 'Bananes 1kg', categorie: 'Fruits', prix: '9.00 MAD', emoji: '🍌' },
  { id: '6', nom: 'Yaourt nature x4', categorie: 'Produits laitiers', prix: '14.50 MAD', emoji: '🫙' },
  { id: '7', nom: 'Pâtes spaghetti 500g', categorie: 'Épicerie', prix: '6.00 MAD', emoji: '🍝' },
  { id: '8', nom: "Huile d'olive 500ml", categorie: 'Épicerie', prix: '45.00 MAD', emoji: '🫒' },
];

const MAGASINS_INITIAUX = [
  { id: '1', nom: 'Carrefour Anfa Place', note: 4.7, delai: '25 min', quartier: 'Casablanca' },
  { id: '2', nom: 'Marjane Hay Riad', note: 4.5, delai: '35 min', quartier: 'Rabat' },
  { id: '3', nom: 'Label Vie Agdal', note: 4.8, delai: '20 min', quartier: 'Rabat' },
  { id: '4', nom: 'BIM Bourgogne', note: 4.2, delai: '15 min', quartier: 'Casablanca' },
];

const ONGLETS = ['Produits', 'Magasins'];

export default function GroceryFavoritesScreen({ navigation }) {
  const [ongletActif, setOngletActif] = useState('Produits');
  const [produits, setProduits] = useState(PRODUITS_INITIAUX);
  const [magasins, setMagasins] = useState(MAGASINS_INITIAUX);

  const supprimerProduit = (id) => {
    Alert.alert('Supprimer', 'Retirer ce produit de vos favoris ?', [
      { text: 'Supprimer', style: 'destructive', onPress: () => setProduits((prev) => prev.filter((p) => p.id !== id)) },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const supprimerMagasin = (id) => {
    Alert.alert('Supprimer', 'Retirer ce magasin de vos favoris ?', [
      { text: 'Supprimer', style: 'destructive', onPress: () => setMagasins((prev) => prev.filter((m) => m.id !== id)) },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const ajouterAuPanier = (produit) => {
    Alert.alert('Panier', `"${produit.nom}" ajouté au panier !`);
  };

  const rendreProduit = ({ item }) => (
    <View style={styles.carteProduit}>
      <TouchableOpacity style={styles.supprimerBouton} onPress={() => supprimerProduit(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.supprimerTexte}>×</Text>
      </TouchableOpacity>
      <Text style={styles.produitEmoji}>{item.emoji}</Text>
      <Text style={styles.produitNom} numberOfLines={2}>{item.nom}</Text>
      <Text style={styles.produitCategorie}>{item.categorie}</Text>
      <Text style={styles.produitPrix}>{item.prix}</Text>
      <TouchableOpacity style={styles.boutonPanier} onPress={() => ajouterAuPanier(item)} activeOpacity={0.8}>
        <Text style={styles.boutonPanierTexte}>+ Panier</Text>
      </TouchableOpacity>
    </View>
  );

  const rendreMagasin = ({ item }) => (
    <View style={styles.carteMagasin}>
      <View style={styles.magasinGauche}>
        <Text style={styles.magasinEmoji}>🏪</Text>
        <View style={styles.magasinInfos}>
          <Text style={styles.magasinNom}>{item.nom}</Text>
          <Text style={styles.magasinQuartier}>{item.quartier}</Text>
          <View style={styles.magasinStats}>
            <Text style={styles.magasinStat}>⭐ {item.note}</Text>
            <Text style={styles.magasinSeparateur}>·</Text>
            <Text style={styles.magasinStat}>🕐 {item.delai}</Text>
          </View>
        </View>
      </View>
      <View style={styles.magasinDroite}>
        <TouchableOpacity style={styles.supprimerMagasinBouton} onPress={() => supprimerMagasin(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.supprimerTexte}>×</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.boutonCommander}
          onPress={() => navigation.navigate('GroceryStore', { magasinId: item.id })}
          activeOpacity={0.8}
        >
          <Text style={styles.boutonCommanderTexte}>Commander</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.entete}>
        <Text style={styles.titre}>Mes favoris</Text>
      </View>

      <View style={styles.onglets}>
        {ONGLETS.map((o) => (
          <TouchableOpacity
            key={o}
            style={[styles.ongletBouton, ongletActif === o && styles.ongletBoutonActif]}
            onPress={() => setOngletActif(o)}
            activeOpacity={0.8}
          >
            <Text style={[styles.ongletTexte, ongletActif === o && styles.ongletTexteActif]}>{o}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {ongletActif === 'Produits' ? (
        produits.length === 0 ? (
          <View style={styles.vide}>
            <Text style={styles.videEmoji}>🛒</Text>
            <Text style={styles.videTexte}>Aucun produit favori</Text>
          </View>
        ) : (
          <FlatList
            data={produits}
            keyExtractor={(item) => item.id}
            renderItem={rendreProduit}
            numColumns={2}
            columnWrapperStyle={styles.grilleLigne}
            contentContainerStyle={styles.grille}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : magasins.length === 0 ? (
        <View style={styles.vide}>
          <Text style={styles.videEmoji}>🏪</Text>
          <Text style={styles.videTexte}>Aucun magasin favori</Text>
        </View>
      ) : (
        <FlatList
          data={magasins}
          keyExtractor={(item) => item.id}
          renderItem={rendreMagasin}
          contentContainerStyle={styles.listeMagasins}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  onglets: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    padding: 4,
  },
  ongletBouton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  ongletBoutonActif: {
    backgroundColor: '#F5A623',
  },
  ongletTexte: {
    color: '#8E8E9A',
    fontSize: 14,
    fontWeight: '600',
  },
  ongletTexteActif: {
    color: '#0A0A0F',
  },
  grille: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  grilleLigne: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  carteProduit: {
    backgroundColor: '#1C1C28',
    borderRadius: 14,
    padding: 12,
    width: '48%',
    borderWidth: 1,
    borderColor: '#2C2C3A',
    position: 'relative',
  },
  supprimerBouton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C3A',
    borderRadius: 12,
    zIndex: 1,
  },
  supprimerTexte: {
    color: '#8E8E9A',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  produitEmoji: {
    fontSize: 32,
    marginBottom: 8,
    marginTop: 4,
  },
  produitNom: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  produitCategorie: {
    color: '#8E8E9A',
    fontSize: 11,
    marginBottom: 6,
  },
  produitPrix: {
    color: '#F5A623',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  boutonPanier: {
    backgroundColor: '#F5A62322',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5A623',
  },
  boutonPanierTexte: {
    color: '#F5A623',
    fontSize: 12,
    fontWeight: '700',
  },
  listeMagasins: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  carteMagasin: {
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
  magasinGauche: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  magasinEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  magasinInfos: {
    flex: 1,
  },
  magasinNom: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  magasinQuartier: {
    color: '#8E8E9A',
    fontSize: 12,
    marginTop: 2,
  },
  magasinStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  magasinStat: {
    color: '#8E8E9A',
    fontSize: 12,
  },
  magasinSeparateur: {
    color: '#2C2C3A',
    marginHorizontal: 6,
  },
  magasinDroite: {
    alignItems: 'flex-end',
    gap: 8,
  },
  supprimerMagasinBouton: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C3A',
    borderRadius: 13,
  },
  boutonCommander: {
    backgroundColor: '#F5A623',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  boutonCommanderTexte: {
    color: '#0A0A0F',
    fontSize: 13,
    fontWeight: '700',
  },
  vide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  videTexte: {
    color: '#8E8E9A',
    fontSize: 16,
  },
});
