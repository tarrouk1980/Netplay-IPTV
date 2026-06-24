import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useDeliveryStore from '../../store/deliveryStore';

const COULEURS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

export default function MerchantMenuScreen({ route, navigation }) {
  const { merchantId } = route.params || {};
  const { fetchMerchant, currentMerchant, addToCart, getCartItems, getCartTotal, isLoading } =
    useDeliveryStore();

  const [categorieActive, setCategorieActive] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!merchantId) return;
    setError(false);
    fetchMerchant(merchantId).catch(() => setError(true));
  }, [merchantId]);

  const categories = useMemo(() => {
    if (!currentMerchant?.products) return [];
    return [...new Set(currentMerchant.products.map((p) => p.category))];
  }, [currentMerchant]);

  useEffect(() => {
    if (categories.length > 0 && !categorieActive) {
      setCategorieActive(categories[0]);
    }
  }, [categories, categorieActive]);

  const cartItems = currentMerchant ? getCartItems(currentMerchant.id) : [];
  const cartTotal = currentMerchant ? getCartTotal(currentMerchant.id) : 0;
  const nbArticles = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const getQuantity = (productId) => {
    if (!currentMerchant) return 0;
    const item = cartItems.find((i) => i.productId === productId);
    return item?.quantity || 0;
  };

  const ajouterAuPanier = (produit) => {
    if (!currentMerchant) return;
    const current = getQuantity(produit.id);
    addToCart(currentMerchant.id, produit, current + 1);
  };

  const produitsFiltres = (currentMerchant?.products || []).filter(
    (p) => !categorieActive || p.category === categorieActive
  );

  const renderProduit = ({ item }) => {
    const qte = getQuantity(item.id);
    return (
      <View style={styles.produitCarte}>
        <View style={styles.produitInfo}>
          <View style={styles.produitEntete}>
            <Text style={styles.produitNom}>{item.name}</Text>
          </View>
          {item.description ? (
            <Text style={styles.produitDesc} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          <View style={styles.produitPied}>
            <Text style={styles.produitPrix}>{parseFloat(item.price).toFixed(3)} TND</Text>
            <TouchableOpacity
              style={[styles.btnAjouter, qte > 0 && styles.btnAjouterActif]}
              onPress={() => ajouterAuPanier(item)}
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

  if (isLoading || (!currentMerchant && !error)) {
    return (
      <SafeAreaView style={[styles.conteneur, { justifyContent: 'center' }]}>
        <ActivityIndicator color={COULEURS.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (error || !currentMerchant) {
    return (
      <SafeAreaView style={[styles.conteneur, { justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
        <Text style={{ color: COULEURS.muted, marginBottom: 16 }}>Impossible de charger ce commerce.</Text>
        <TouchableOpacity
          style={{ backgroundColor: COULEURS.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}
          onPress={() => { setError(false); fetchMerchant(merchantId).catch(() => setError(true)); }}
        >
          <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.restaurantNom}>{currentMerchant.name}</Text>
          <View style={styles.headerMeta}>
            <Text style={styles.headerMetaTexte}>{currentMerchant.category}</Text>
            <Text style={styles.headerSep}>·</Text>
            <Text style={styles.headerMetaTexte}>{currentMerchant.isOpen ? 'Ouvert' : 'Fermé'}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((cat) => (
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
            onPress={() => navigation.navigate('Merchant', { merchantId: currentMerchant.id })}
          >
            <Text style={styles.panierBtnTexte}>{cartTotal.toFixed(3)} TND →</Text>
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
