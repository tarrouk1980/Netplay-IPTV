import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', pink: '#E91E8C',
};

const MOCK_ITEMS = [
  { id: 1, name: 'Fromage Gouda', store: 'Carrefour Market', price: 8.50, oldPrice: 10.20, emoji: '🧀', inStock: true, promo: true },
  { id: 2, name: 'Café Espresso 500g', store: 'Monoprix', price: 14.90, emoji: '☕', inStock: true, promo: false },
  { id: 3, name: 'Huile d\'olive extra', store: 'Carrefour Market', price: 18.00, emoji: '🫒', inStock: false, promo: false },
  { id: 4, name: 'Jus de grenade 1L', store: 'Géant Casino', price: 6.50, oldPrice: 7.50, emoji: '🍹', inStock: true, promo: true },
  { id: 5, name: 'Pâtes Barilla 500g', store: 'Monoprix', price: 3.20, emoji: '🍝', inStock: true, promo: false },
  { id: 6, name: 'Savon Dove x6', store: 'Géant Casino', price: 9.80, emoji: '🧼', inStock: false, promo: false },
];

export default function GroceryWishlistScreen({ navigation }) {
  const [items, setItems] = useState(MOCK_ITEMS);
  const [selected, setSelected] = useState([]);

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setSelected(prev => prev.filter(i => i !== id));
  };

  const addToCart = (ids) => {
    const inStock = items.filter(i => ids.includes(i.id) && i.inStock);
    const outOfStock = items.filter(i => ids.includes(i.id) && !i.inStock);
    if (outOfStock.length > 0) {
      Alert.alert(
        'Produits indisponibles',
        `${outOfStock.length} article(s) en rupture de stock ne peuvent pas être ajoutés.`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: `Ajouter ${inStock.length} disponibles`, onPress: () => navigation.navigate('GroceryCart') },
        ]
      );
    } else {
      navigation.navigate('GroceryCart');
    }
  };

  const selectAll = () => {
    if (selected.length === items.length) setSelected([]);
    else setSelected(items.map(i => i.id));
  };

  const availableSelected = items.filter(i => selected.includes(i.id) && i.inStock).length;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>❤️ Ma liste de souhaits</Text>
          <Text style={styles.headerSub}>{items.length} article{items.length > 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity onPress={selectAll}>
          <Text style={styles.selectAllText}>
            {selected.length === items.length ? 'Décocher' : 'Tout'}
          </Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>❤️</Text>
          <Text style={styles.emptyTitle}>Votre liste est vide</Text>
          <Text style={styles.emptySub}>Ajoutez des produits depuis les fiches articles</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('GroceryHome')}>
            <Text style={styles.browseBtnText}>Parcourir les produits</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
            {/* Promo Alert */}
            {items.some(i => i.promo) && (
              <View style={styles.promoAlert}>
                <Text style={styles.promoAlertText}>
                  🏷 {items.filter(i => i.promo).length} article(s) en promotion dans votre liste !
                </Text>
              </View>
            )}

            <View style={styles.list}>
              {items.map((item) => {
                const isSelected = selected.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemCard, isSelected && styles.itemCardSelected, !item.inStock && styles.itemCardOOS]}
                    onPress={() => toggleSelect(item.id)}
                    activeOpacity={0.85}
                  >
                    {/* Checkbox */}
                    <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                      {isSelected && <Text style={{ color: '#000', fontSize: 12, fontWeight: '900' }}>✓</Text>}
                    </View>

                    {/* Emoji hero */}
                    <View style={[styles.emojiWrap, !item.inStock && { opacity: 0.5 }]}>
                      <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
                    </View>

                    {/* Info */}
                    <View style={{ flex: 1 }}>
                      <View style={styles.itemNameRow}>
                        <Text style={[styles.itemName, !item.inStock && { color: COLORS.muted }]} numberOfLines={1}>
                          {item.name}
                        </Text>
                        {item.promo && (
                          <View style={styles.promoBadge}>
                            <Text style={styles.promoText}>PROMO</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.itemStore}>{item.store}</Text>
                      <View style={styles.itemPriceRow}>
                        <Text style={[styles.itemPrice, !item.inStock && { color: COLORS.muted }]}>
                          {item.price.toFixed(2)} TND
                        </Text>
                        {item.oldPrice && (
                          <Text style={styles.oldPrice}>{item.oldPrice.toFixed(2)}</Text>
                        )}
                        {!item.inStock && (
                          <View style={styles.oosBadge}>
                            <Text style={styles.oosText}>Indisponible</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        style={styles.cartBtn}
                        onPress={() => item.inStock ? addToCart([item.id]) : null}
                        disabled={!item.inStock}
                      >
                        <Text style={{ fontSize: 16 }}>🛒</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeItem(item.id)}>
                        <Text style={{ fontSize: 16, color: COLORS.border }}>🗑</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer */}
          {selected.length > 0 && (
            <View style={styles.footer}>
              <Text style={styles.footerInfo}>
                {selected.length} sélectionné{selected.length > 1 ? 's' : ''}
                {availableSelected < selected.length ? ` · ${selected.length - availableSelected} indisponible(s)` : ''}
              </Text>
              <TouchableOpacity
                style={[styles.addAllBtn, availableSelected === 0 && styles.addAllBtnDisabled]}
                onPress={() => addToCart(selected)}
                disabled={availableSelected === 0}
              >
                <Text style={styles.addAllBtnText}>
                  🛒 Ajouter au panier ({availableSelected})
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  headerSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  selectAllText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { color: COLORS.white, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', marginBottom: 24 },
  browseBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14,
  },
  browseBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
  promoAlert: {
    margin: 16, backgroundColor: '#1A0E00', borderRadius: 10,
    padding: 12, borderWidth: 1, borderColor: COLORS.accent,
  },
  promoAlertText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingTop: 8, gap: 8 },
  itemCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  itemCardSelected: { borderColor: COLORS.accent, backgroundColor: '#1A1408' },
  itemCardOOS: { opacity: 0.7 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6,
    borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.surfaceAlt,
  },
  checkboxActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  emojiWrap: {
    width: 52, height: 52, borderRadius: 12,
    backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  itemNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  itemName: { color: COLORS.white, fontSize: 14, fontWeight: '600', flex: 1 },
  promoBadge: {
    backgroundColor: '#1A0E00', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1,
    borderWidth: 1, borderColor: COLORS.accent,
  },
  promoText: { color: COLORS.accent, fontSize: 9, fontWeight: '800' },
  itemStore: { color: COLORS.muted, fontSize: 11, marginBottom: 4 },
  itemPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemPrice: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  oldPrice: { color: COLORS.muted, fontSize: 11, textDecorationLine: 'line-through' },
  oosBadge: {
    backgroundColor: '#1A0808', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: COLORS.red,
  },
  oosText: { color: COLORS.red, fontSize: 9, fontWeight: '700' },
  itemActions: { flexDirection: 'column', gap: 8, alignItems: 'center' },
  cartBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#0D2E0D', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.green,
  },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  footerInfo: { color: COLORS.muted, fontSize: 12, marginBottom: 8 },
  addAllBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 15, alignItems: 'center',
  },
  addAllBtnDisabled: { backgroundColor: COLORS.surface },
  addAllBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
});
