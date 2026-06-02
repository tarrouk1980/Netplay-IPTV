import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
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

const CATEGORIES = ['Populaires', 'Entrées', 'Plats', 'Desserts', 'Boissons'];

const PRODUITS = [
  {
    id: '1',
    nom: 'Burger Classic',
    description: 'Pain brioché, steak haché, cheddar',
    prix: 850,
    categorie: 'Populaires',
    vegetarien: false,
    emoji: '🍔',
  },
  {
    id: '2',
    nom: 'Salade César',
    description: "Laitue, parmesan, croûtons, sauce César",
    prix: 650,
    categorie: 'Entrées',
    vegetarien: true,
    emoji: '🥗',
  },
  {
    id: '3',
    nom: 'Pizza Margherita',
    description: 'Tomate, mozzarella, basilic frais',
    prix: 1100,
    categorie: 'Populaires',
    vegetarien: true,
    emoji: '🍕',
  },
  {
    id: '4',
    nom: 'Soupe de légumes',
    description: 'Carottes, courgettes, poireaux maison',
    prix: 400,
    categorie: 'Entrées',
    vegetarien: true,
    emoji: '🍲',
  },
  {
    id: '5',
    nom: 'Poulet rôti',
    description: "Poulet entier, herbes de Provence, citron",
    prix: 1400,
    categorie: 'Plats',
    vegetarien: false,
    emoji: '🍗',
  },
  {
    id: '6',
    nom: 'Pâtes carbonara',
    description: 'Spaghetti, lardons, crème, parmesan',
    prix: 900,
    categorie: 'Plats',
    vegetarien: false,
    emoji: '🍝',
  },
  {
    id: '7',
    nom: 'Couscous royal',
    description: 'Semoule, légumes, merguez, agneau',
    prix: 1600,
    categorie: 'Populaires',
    vegetarien: false,
    emoji: '🫕',
  },
  {
    id: '8',
    nom: 'Tiramisu',
    description: 'Mascarpone, café, biscuits amaretti',
    prix: 450,
    categorie: 'Desserts',
    vegetarien: true,
    emoji: '🍮',
  },
  {
    id: '9',
    nom: 'Fondant chocolat',
    description: 'Cœur coulant, glace vanille maison',
    prix: 500,
    categorie: 'Desserts',
    vegetarien: true,
    emoji: '🍫',
  },
  {
    id: '10',
    nom: 'Jus orange frais',
    description: "Oranges pressées à la commande",
    prix: 300,
    categorie: 'Boissons',
    vegetarien: true,
    emoji: '🍊',
  },
  {
    id: '11',
    nom: 'Smoothie fruits',
    description: 'Mangue, fraise, banane, lait',
    prix: 380,
    categorie: 'Boissons',
    vegetarien: true,
    emoji: '🥤',
  },
  {
    id: '12',
    nom: 'Tajine agneau',
    description: "Agneau, pruneaux, amandes, épices",
    prix: 1800,
    categorie: 'Plats',
    vegetarien: false,
    emoji: '🫕',
  },
];

export default function MerchantMenuScreen({ navigation }) {
  const [categorieActive, setCategorieActive] = useState('Populaires');
  const [vegetarienActif, setVegetarienActif] = useState(false);
  const [panier, setPanier] = useState({});

  const ajouterAuPanier = (produitId) => {
    setPanier((prev) => ({
      ...prev,
      [produitId]: (prev[produitId] || 0) + 1,
    }));
  };

  const produitsFiltres = PRODUITS.filter((p) => {
    const matchCategorie = p.categorie === categorieActive;
    const matchVegetarien = vegetarienActif ? p.vegetarien : true;
    return matchCategorie && matchVegetarien;
  });

  const totalPanier = Object.entries(panier).reduce((acc, [id, qte]) => {
    const produit = PRODUITS.find((p) => p.id === id);
    return acc + (produit ? produit.prix * qte : 0);
  }, 0);

  const nbArticles = Object.values(panier).reduce((a, b) => a + b, 0);

  const renderProduit = ({ item }) => {
    const qte = panier[item.id] || 0;
    return (
      <View style={styles.produitCarte}>
        <Text style={styles.produitEmoji}>{item.emoji}</Text>
        <View style={styles.produitInfo}>
          <View style={styles.produitEntete}>
            <Text style={styles.produitNom}>{item.nom}</Text>
            {item.vegetarien && (
              <View style={styles.vegBadge}>
                <Text style={styles.vegTexte}>🌿</Text>
              </View>
            )}
          </View>
          <Text style={styles.produitDesc} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.produitPied}>
            <Text style={styles.produitPrix}>{item.prix} DA</Text>
            <TouchableOpacity
              style={[styles.btnAjouter, qte > 0 && styles.btnAjouterActif]}
              onPress={() => ajouterAuPanier(item.id)}
            >
              <Text
                style={[
                  styles.btnAjouterTexte,
                  qte > 0 && styles.btnAjouterTexteActif,
                ]}
              >
                {qte > 0 ? `+ (${qte})` : '+'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.restaurantNom}>Le Gourmet Algérois</Text>
          <View style={styles.headerMeta}>
            <Text style={styles.headerMetaTexte}>⭐ 4.7</Text>
            <Text style={styles.headerSep}>·</Text>
            <Text style={styles.headerMetaTexte}>🕐 25-35 min</Text>
            <Text style={styles.headerSep}>·</Text>
            <Text style={styles.headerMetaTexte}>Livraison 120 DA</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.toggleVeg,
            vegetarienActif && styles.toggleVegActif,
          ]}
          onPress={() => setVegetarienActif((v) => !v)}
        >
          <Text style={styles.toggleVegTexte}>
            {vegetarienActif ? '🌿 Vég' : '🌿'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categorieBouton,
              categorieActive === cat && styles.categorieBoutonActif,
            ]}
            onPress={() => setCategorieActive(cat)}
          >
            <Text
              style={[
                styles.categorieTexte,
                categorieActive === cat && styles.categorieTexteActif,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={produitsFiltres}
        keyExtractor={(item) => item.id}
        renderItem={renderProduit}
        contentContainerStyle={[
          styles.listeProduits,
          nbArticles > 0 && { paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.vide}>
            <Text style={styles.videTexte}>Aucun produit disponible</Text>
          </View>
        }
      />

      {nbArticles > 0 && (
        <View style={styles.panierFlottant}>
          <View style={styles.panierInfo}>
            <View style={styles.panierBadge}>
              <Text style={styles.panierBadgeTexte}>{nbArticles}</Text>
            </View>
            <Text style={styles.panierTexte}>Voir le panier</Text>
          </View>
          <TouchableOpacity
            style={styles.panierBtn}
            onPress={() => navigation.navigate('GroceryCart')}
          >
            <Text style={styles.panierBtnTexte}>{totalPanier} DA →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: COULEURS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COULEURS.border,
  },
  headerInfo: {
    flex: 1,
  },
  restaurantNom: {
    fontSize: 22,
    fontWeight: '700',
    color: COULEURS.text,
    marginBottom: 6,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  headerMetaTexte: {
    fontSize: 13,
    color: COULEURS.muted,
  },
  headerSep: {
    fontSize: 13,
    color: COULEURS.border,
  },
  toggleVeg: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COULEURS.surface,
    borderWidth: 1,
    borderColor: COULEURS.border,
    marginLeft: 12,
  },
  toggleVegActif: {
    backgroundColor: '#4CAF5022',
    borderColor: '#4CAF50',
  },
  toggleVegTexte: {
    fontSize: 13,
    color: COULEURS.text,
    fontWeight: '600',
  },
  categoriesScroll: {
    marginVertical: 14,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categorieBouton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COULEURS.surface,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  categorieBoutonActif: {
    backgroundColor: COULEURS.primary,
    borderColor: COULEURS.primary,
  },
  categorieTexte: {
    fontSize: 13,
    color: COULEURS.muted,
    fontWeight: '500',
  },
  categorieTexteActif: {
    color: '#000',
    fontWeight: '700',
  },
  listeProduits: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  produitCarte: {
    flexDirection: 'row',
    backgroundColor: COULEURS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COULEURS.border,
    gap: 12,
  },
  produitEmoji: {
    fontSize: 38,
    alignSelf: 'center',
  },
  produitInfo: {
    flex: 1,
  },
  produitEntete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  produitNom: {
    fontSize: 15,
    fontWeight: '700',
    color: COULEURS.text,
    flex: 1,
  },
  vegBadge: {
    backgroundColor: '#4CAF5022',
    borderRadius: 6,
    padding: 2,
  },
  vegTexte: {
    fontSize: 12,
  },
  produitDesc: {
    fontSize: 12,
    color: COULEURS.muted,
    marginBottom: 10,
    lineHeight: 17,
  },
  produitPied: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  produitPrix: {
    fontSize: 15,
    fontWeight: '700',
    color: COULEURS.primary,
  },
  btnAjouter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COULEURS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAjouterActif: {
    backgroundColor: COULEURS.primary,
  },
  btnAjouterTexte: {
    fontSize: 16,
    color: COULEURS.muted,
    fontWeight: '700',
  },
  btnAjouterTexteActif: {
    color: '#000',
  },
  vide: {
    alignItems: 'center',
    marginTop: 60,
  },
  videTexte: {
    fontSize: 15,
    color: COULEURS.muted,
  },
  panierFlottant: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COULEURS.primary,
    shadowColor: COULEURS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  panierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  panierBadge: {
    backgroundColor: COULEURS.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panierBadgeTexte: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  panierTexte: {
    fontSize: 15,
    fontWeight: '600',
    color: COULEURS.text,
  },
  panierBtn: {
    backgroundColor: COULEURS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  panierBtnTexte: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
});
