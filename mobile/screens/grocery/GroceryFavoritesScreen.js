import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useCartStore from '../../store/cartStore';

const ONGLETS = ['Produits', 'Magasins'];

export default function GroceryFavoritesScreen({ navigation }) {
  const [ongletActif, setOngletActif] = useState('Produits');
  const [produits, setProduits] = useState([]);
  const [magasins, setMagasins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(false);
  const addToCart = useCartStore((s) => s.addItem);

  const charger = useCallback(() => {
    setLoading(true);
    setErreur(false);
    api.get('/api/grocery/favorites')
      .then((r) => {
        setProduits(r.data?.products || []);
        setMagasins(r.data?.merchants || []);
      })
      .catch(() => setErreur(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const supprimerProduit = (id) => {
    Alert.alert('Supprimer', 'Retirer ce produit de vos favoris ?', [
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          api.delete(`/api/grocery/favorites/products/${id}`).catch(() => {});
          setProduits((prev) => prev.filter((p) => p.id !== id));
        },
      },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const supprimerMagasin = (id) => {
    Alert.alert('Supprimer', 'Retirer ce magasin de vos favoris ?', [
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          api.delete(`/api/grocery/favorites/merchants/${id}`).catch(() => {});
          setMagasins((prev) => prev.filter((m) => m.id !== id));
        },
      },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const ajouterAuPanier = (produit) => {
    addToCart(
      { id: produit.id, name: produit.name, price: Number(produit.price) },
      produit.merchantId
    );
    Alert.alert('Panier', `"${produit.name}" ajouté au panier !`);
  };

  const rendreProduit = ({ item }) => (
    <View style={styles.carteProduit}>
      <TouchableOpacity style={styles.supprimerBouton} onPress={() => supprimerProduit(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.supprimerTexte}>×</Text>
      </TouchableOpacity>
      <Text style={styles.produitEmoji}>🛒</Text>
      <Text style={styles.produitNom} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.produitCategorie}>{item.merchant?.name || item.category}</Text>
      <Text style={styles.produitPrix}>{Number(item.price).toFixed(3)} TND</Text>
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
          <Text style={styles.magasinNom}>{item.name}</Text>
          <Text style={styles.magasinQuartier}>{item.address}</Text>
        </View>
      </View>
      <View style={styles.magasinDroite}>
        <TouchableOpacity style={styles.supprimerMagasinBouton} onPress={() => supprimerMagasin(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.supprimerTexte}>×</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.boutonCommander}
          onPress={() => navigation.navigate('GroceryShop', { shopId: item.id, shopName: item.name })}
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

      {loading && <ActivityIndicator color="#F5A623" style={{ marginTop: 40 }} />}

      {!loading && erreur && (
        <View style={styles.vide}>
          <Text style={styles.videEmoji}>⚠️</Text>
          <Text style={styles.videTexte}>Impossible de charger vos favoris</Text>
          <TouchableOpacity onPress={charger} style={styles.boutonCommander}>
            <Text style={styles.boutonCommanderTexte}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !erreur && ongletActif === 'Produits' && (
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
      )}

      {!loading && !erreur && ongletActif === 'Magasins' && (
        magasins.length === 0 ? (
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
        )
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
    gap: 12,
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
