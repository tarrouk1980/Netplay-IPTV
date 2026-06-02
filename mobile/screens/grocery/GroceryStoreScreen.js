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

const MAGASIN = {
  nom: 'Marché Frais Express',
  note: 4.7,
  avis: 312,
  horaires: 'Ouvert · Ferme à 22h00',
  couleurBanner: '#2C4A2E',
};

const CATEGORIES = ['Fruits', 'Légumes', 'Viandes', 'Boissons', 'Épices', 'Snacks'];

const PRODUITS = [
  { id: '1', nom: 'Pommes Gala', prix: 3.99, unite: 'kg', categorie: 'Fruits', couleur: '#C0392B' },
  { id: '2', nom: 'Bananes', prix: 1.49, unite: 'botte', categorie: 'Fruits', couleur: '#F1C40F' },
  { id: '3', nom: 'Carottes', prix: 2.29, unite: 'kg', categorie: 'Légumes', couleur: '#E67E22' },
  { id: '4', nom: 'Épinards', prix: 3.49, unite: '250g', categorie: 'Légumes', couleur: '#27AE60' },
  { id: '5', nom: 'Poulet entier', prix: 12.99, unite: 'kg', categorie: 'Viandes', couleur: '#D4A574' },
  { id: '6', nom: 'Bœuf haché', prix: 9.99, unite: 'kg', categorie: 'Viandes', couleur: '#8B2635' },
  { id: '7', nom: 'Eau minérale', prix: 1.29, unite: '1.5L', categorie: 'Boissons', couleur: '#3498DB' },
  { id: '8', nom: 'Jus d\'orange', prix: 4.49, unite: '1L', categorie: 'Boissons', couleur: '#E67E22' },
  { id: '9', nom: 'Cumin moulu', prix: 2.79, unite: '100g', categorie: 'Épices', couleur: '#8B6914' },
  { id: '10', nom: 'Paprika', prix: 2.49, unite: '80g', categorie: 'Épices', couleur: '#C0392B' },
  { id: '11', nom: 'Chips nature', prix: 3.29, unite: '200g', categorie: 'Snacks', couleur: '#D4AC0D' },
  { id: '12', nom: 'Cacahuètes', prix: 4.99, unite: '500g', categorie: 'Snacks', couleur: '#A04000' },
];

function EtoileRating({ note }) {
  const etoiles = [];
  for (let i = 1; i <= 5; i++) {
    etoiles.push(
      <Text key={i} style={{ color: i <= Math.round(note) ? '#F5A623' : '#2C2C3A', fontSize: 14 }}>
        ★
      </Text>
    );
  }
  return <View style={{ flexDirection: 'row' }}>{etoiles}</View>;
}

export default function GroceryStoreScreen({ navigation }) {
  const [categorieActive, setCategorieActive] = useState('Fruits');
  const [panier, setPanier] = useState({});

  const produitsFiltres = PRODUITS.filter((p) => p.categorie === categorieActive);

  const ajouterAuPanier = (id) => {
    setPanier((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const retirerDuPanier = (id) => {
    setPanier((prev) => {
      const qte = (prev[id] || 0) - 1;
      if (qte <= 0) {
        const nouveau = { ...prev };
        delete nouveau[id];
        return nouveau;
      }
      return { ...prev, [id]: qte };
    });
  };

  const totalArticles = Object.values(panier).reduce((acc, q) => acc + q, 0);
  const totalPrix = PRODUITS.reduce((acc, p) => acc + (panier[p.id] || 0) * p.prix, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.bannerImage, { backgroundColor: MAGASIN.couleurBanner }]}>
          <Text style={styles.bannerTexte}>🛒</Text>
        </View>

        <View style={styles.magasinInfo}>
          <Text style={styles.magasinNom}>{MAGASIN.nom}</Text>
          <View style={styles.noteRow}>
            <EtoileRating note={MAGASIN.note} />
            <Text style={styles.noteTexte}>{MAGASIN.note} ({MAGASIN.avis} avis)</Text>
          </View>
          <View style={styles.horairesRow}>
            <Text style={styles.horairesPoint}>●</Text>
            <Text style={styles.horairesTexte}>{MAGASIN.horaires}</Text>
          </View>
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
              style={[styles.categorieBtn, categorieActive === cat && styles.categorieActif]}
              onPress={() => setCategorieActive(cat)}
            >
              <Text style={[styles.categorieTexte, categorieActive === cat && styles.categorieTexteActif]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.grille}>
          {produitsFiltres.map((produit) => {
            const qte = panier[produit.id] || 0;
            return (
              <View key={produit.id} style={styles.produitCard}>
                <View style={[styles.produitImage, { backgroundColor: produit.couleur + '33' }]}>
                  <View style={[styles.produitImageCercle, { backgroundColor: produit.couleur }]} />
                </View>
                <Text style={styles.produitNom} numberOfLines={2}>{produit.nom}</Text>
                <Text style={styles.produitPrix}>{produit.prix.toFixed(2)} $ / {produit.unite}</Text>
                {qte === 0 ? (
                  <TouchableOpacity style={styles.ajouterBtn} onPress={() => ajouterAuPanier(produit.id)}>
                    <Text style={styles.ajouterTexte}>+ Ajouter</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.qteRow}>
                    <TouchableOpacity style={styles.qteBtn} onPress={() => retirerDuPanier(produit.id)}>
                      <Text style={styles.qteBtnTexte}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qteValeur}>{qte}</Text>
                    <TouchableOpacity style={styles.qteBtn} onPress={() => ajouterAuPanier(produit.id)}>
                      <Text style={styles.qteBtnTexte}>+</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {totalArticles > 0 && (
        <View style={styles.panierBar}>
          <View style={styles.panierInfo}>
            <View style={styles.panierBadge}>
              <Text style={styles.panierBadgeTexte}>{totalArticles}</Text>
            </View>
            <Text style={styles.panierLabel}>Voir mon panier</Text>
          </View>
          <Text style={styles.panierTotal}>{totalPrix.toFixed(2)} $</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scroll: {
    paddingBottom: 20,
  },
  bannerImage: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTexte: {
    fontSize: 64,
  },
  magasinInfo: {
    padding: 20,
    gap: 8,
  },
  magasinNom: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteTexte: {
    color: '#8E8E9A',
    fontSize: 13,
  },
  horairesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  horairesPoint: {
    color: '#22C55E',
    fontSize: 10,
  },
  horairesTexte: {
    color: '#8E8E9A',
    fontSize: 13,
  },
  categoriesScroll: {
    marginBottom: 20,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
  },
  categorieBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#1C1C28',
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  categorieActif: {
    backgroundColor: '#F5A623',
    borderColor: '#F5A623',
  },
  categorieTexte: {
    color: '#8E8E9A',
    fontSize: 14,
    fontWeight: '600',
  },
  categorieTexteActif: {
    color: '#0A0A0F',
  },
  grille: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  produitCard: {
    backgroundColor: '#1C1C28',
    borderRadius: 14,
    padding: 14,
    width: '46%',
    borderWidth: 1,
    borderColor: '#2C2C3A',
    gap: 8,
  },
  produitImage: {
    height: 80,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  produitImageCercle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.8,
  },
  produitNom: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  produitPrix: {
    color: '#F5A623',
    fontSize: 13,
    fontWeight: '700',
  },
  ajouterBtn: {
    backgroundColor: '#F5A623',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  ajouterTexte: {
    color: '#0A0A0F',
    fontSize: 13,
    fontWeight: '700',
  },
  qteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2C2C3A',
    borderRadius: 8,
    padding: 4,
  },
  qteBtn: {
    width: 30,
    height: 30,
    backgroundColor: '#F5A623',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qteBtnTexte: {
    color: '#0A0A0F',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  qteValeur: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  panierBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#F5A623',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  panierBadge: {
    backgroundColor: '#0A0A0F',
    borderRadius: 8,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panierBadgeTexte: {
    color: '#F5A623',
    fontSize: 14,
    fontWeight: '800',
  },
  panierLabel: {
    color: '#0A0A0F',
    fontSize: 16,
    fontWeight: '700',
  },
  panierTotal: {
    color: '#0A0A0F',
    fontSize: 18,
    fontWeight: '800',
  },
});
