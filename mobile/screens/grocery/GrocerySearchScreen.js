import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity,
  ScrollView, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  accent: '#00838F',
  accentLight: '#4DD0E1',
};

const MOCK_PRODUCTS = [
  { id: '1', emoji: '🥛', nom: 'Lait entier', categorie: 'Produits laitiers', prix: '1,500 TND' },
  { id: '2', emoji: '🧀', nom: 'Fromage Kiri', categorie: 'Produits laitiers', prix: '3,200 TND' },
  { id: '3', emoji: '🍞', nom: 'Pain de mie', categorie: 'Boulangerie', prix: '0,950 TND' },
  { id: '4', emoji: '🍳', nom: 'Oeufs (x12)', categorie: 'Oeufs', prix: '5,800 TND' },
  { id: '5', emoji: '🍅', nom: 'Tomates fraîches (1kg)', categorie: 'Légumes', prix: '2,100 TND' },
  { id: '6', emoji: '🍌', nom: 'Bananes (1kg)', categorie: 'Fruits', prix: '2,400 TND' },
  { id: '7', emoji: '🫒', nom: 'Huile d\'olive (1L)', categorie: 'Épicerie', prix: '12,000 TND' },
  { id: '8', emoji: '🍗', nom: 'Poulet entier', categorie: 'Viandes', prix: '14,500 TND' },
  { id: '9', emoji: '🧹', nom: 'Éponge vaisselle (x3)', categorie: 'Entretien', prix: '1,800 TND' },
  { id: '10', emoji: '🧃', nom: 'Jus d\'orange (1L)', categorie: 'Boissons', prix: '3,500 TND' },
];

const CATEGORIES = ['Produits laitiers', 'Boulangerie', 'Légumes', 'Fruits', 'Viandes', 'Boissons', 'Épicerie', 'Entretien'];

const HISTORIQUE_INITIAL = ['Lait', 'Tomates', 'Pain', 'Poulet', 'Jus'];

export default function GrocerySearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [historique, setHistorique] = useState(HISTORIQUE_INITIAL);
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const resultats = query.trim().length > 0
    ? MOCK_PRODUCTS.filter((p) =>
        p.nom.toLowerCase().includes(query.toLowerCase()) ||
        p.categorie.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  function validerRecherche(terme) {
    const t = terme.trim();
    if (!t) return;
    setHistorique((prev) => {
      const filtered = prev.filter((h) => h.toLowerCase() !== t.toLowerCase());
      return [t, ...filtered].slice(0, 5);
    });
    setQuery(t);
  }

  function selectionnerCategorie(cat) {
    setQuery(cat);
    validerRecherche(cat);
  }

  function ajouterAuPanier(produit) {
    // Intégration panier à implémenter
  }

  function renderProduit({ item }) {
    return (
      <View style={s.produitCard}>
        <Text style={s.produitEmoji}>{item.emoji}</Text>
        <View style={s.produitInfo}>
          <Text style={s.produitNom}>{item.nom}</Text>
          <Text style={s.produitCategorie}>{item.categorie}</Text>
        </View>
        <View style={s.produitDroit}>
          <Text style={s.produitPrix}>{item.prix}</Text>
          <TouchableOpacity style={s.btnAjouter} onPress={() => ajouterAuPanier(item)} activeOpacity={0.8}>
            <Text style={s.btnAjouterText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const showHistory = query.trim().length === 0;
  const showResults = query.trim().length > 0;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.searchBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backIcon}>←</Text>
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
            style={s.input}
            placeholder="Rechercher un produit..."
            placeholderTextColor={COLORS.muted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => validerRecherche(query)}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={s.clearBtn}>
              <Text style={s.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {showHistory && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={s.sectionTitle}>Catégories populaires</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.categoriesScroll}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={s.chip}
                  onPress={() => selectionnerCategorie(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={s.chipText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {historique.length > 0 && (
              <>
                <Text style={s.sectionTitle}>Recherches récentes</Text>
                {historique.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={s.historiqueItem}
                    onPress={() => { setQuery(h); validerRecherche(h); }}
                    activeOpacity={0.75}
                  >
                    <Text style={s.historiqueIcon}>🕐</Text>
                    <Text style={s.historiqueText}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>
        )}

        {showResults && (
          <>
            <Text style={s.sectionTitle}>
              {resultats.length} résultat{resultats.length !== 1 ? 's' : ''}
            </Text>
            {resultats.length === 0 ? (
              <View style={s.emptyBox}>
                <Text style={s.emptyEmoji}>🔍</Text>
                <Text style={s.emptyTitle}>Aucun résultat</Text>
                <Text style={s.emptySubtitle}>Essayez un autre terme de recherche</Text>
              </View>
            ) : (
              <FlatList
                data={resultats}
                keyExtractor={(item) => item.id}
                renderItem={renderProduit}
                contentContainerStyle={s.resultsList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 8 },
  backIcon: { fontSize: 22, color: COLORS.text },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearBtn: { padding: 8, marginLeft: 4 },
  clearIcon: { fontSize: 16, color: COLORS.muted },
  sectionTitle: {
    fontSize: 15, fontWeight: '700', color: COLORS.text,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  categoriesScroll: { paddingHorizontal: 16, gap: 10 },
  chip: {
    backgroundColor: COLORS.surface,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: COLORS.accent,
  },
  chipText: { fontSize: 13, color: COLORS.accentLight, fontWeight: '500' },
  historiqueItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  historiqueIcon: { fontSize: 16, marginRight: 12 },
  historiqueText: { fontSize: 14, color: COLORS.text },
  resultsList: { padding: 16, paddingBottom: 40 },
  produitCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  produitEmoji: { fontSize: 32, marginRight: 12 },
  produitInfo: { flex: 1 },
  produitNom: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  produitCategorie: { fontSize: 12, color: COLORS.muted },
  produitDroit: { alignItems: 'flex-end', gap: 6 },
  produitPrix: { fontSize: 14, fontWeight: '700', color: COLORS.accent },
  btnAjouter: {
    backgroundColor: COLORS.accent, borderRadius: 20,
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
  },
  btnAjouterText: { fontSize: 22, color: '#fff', fontWeight: '700', lineHeight: 28 },
  emptyBox: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: COLORS.muted },
});
