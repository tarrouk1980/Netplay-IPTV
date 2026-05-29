import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  SectionList,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useDeliveryStore from '../../store/deliveryStore';
import useLocationStore from '../../store/locationStore';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  green: '#27AE60',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2A2A3A',
  danger: '#E74C3C',
};

export default function MerchantScreen({ route, navigation }) {
  const { merchantId } = route.params;
  const { fetchMerchant, currentMerchant, addToCart, getCartItems, getCartTotal, requestDelivery, isLoading } =
    useDeliveryStore();
  const { location } = useLocationStore();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [note, setNote] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    fetchMerchant(merchantId);
  }, [merchantId]);

  const cartItems = currentMerchant ? getCartItems(currentMerchant.id) : [];
  const cartTotal = currentMerchant ? getCartTotal(currentMerchant.id) : 0;
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const getQuantity = (productId) => {
    if (!currentMerchant) return 0;
    const key = `${currentMerchant.id}:${productId}`;
    return useDeliveryStore.getState().cart[key]?.quantity || 0;
  };

  const handleAddToCart = (product, delta) => {
    if (!currentMerchant) return;
    const current = getQuantity(product.id);
    addToCart(currentMerchant.id, product, current + delta);
  };

  const sections = useCallback(() => {
    if (!currentMerchant?.products) return [];
    const groups = {};
    currentMerchant.products.forEach((p) => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [currentMerchant])();

  const handleOrder = async () => {
    if (!deliveryAddress.trim()) {
      Alert.alert('Adresse requise', 'Veuillez saisir votre adresse de livraison.');
      return;
    }
    if (cartItems.length === 0) {
      Alert.alert('Panier vide', 'Ajoutez des articles avant de commander.');
      return;
    }
    if (!location?.lat) {
      Alert.alert('Localisation requise', 'Activez la localisation pour commander.');
      return;
    }

    setOrderLoading(true);
    try {
      const { order } = await requestDelivery({
        merchantId: currentMerchant.id,
        items: cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        deliveryAddress: deliveryAddress.trim(),
        deliveryLat: location.lat,
        deliveryLng: location.lng,
        note: note.trim() || undefined,
      });
      navigation.replace('DeliveryTracking', { orderId: order.id });
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de passer la commande.');
    } finally {
      setOrderLoading(false);
    }
  };

  if (isLoading || !currentMerchant) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.green} size="large" />
      </View>
    );
  }

  const renderProduct = ({ item }) => {
    const qty = getQuantity(item.id);
    return (
      <View style={styles.productRow}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          {item.description ? <Text style={styles.productDesc}>{item.description}</Text> : null}
          <Text style={styles.productPrice}>{parseFloat(item.price).toFixed(3)} TND</Text>
        </View>
        <View style={styles.qtyControl}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => handleAddToCart(item, -1)} disabled={qty === 0}>
            <Text style={[styles.qtyBtnText, qty === 0 && styles.disabled]}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{qty}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => handleAddToCart(item, 1)}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.merchantName}>{currentMerchant.name}</Text>
          <Text style={styles.merchantCategory}>{currentMerchant.category}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: currentMerchant.isOpen ? COLORS.green : COLORS.danger }]} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          <View style={styles.orderForm}>
            <Text style={styles.formLabel}>Adresse de livraison *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Entrez votre adresse..."
              placeholderTextColor={COLORS.textMuted}
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
            />
            <Text style={styles.formLabel}>Note (optionnel)</Text>
            <TextInput
              style={[styles.textInput, { height: 80 }]}
              placeholder="Instructions spéciales..."
              placeholderTextColor={COLORS.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>
        }
      />

      {cartCount > 0 && (
        <View style={styles.cartBar}>
          <View style={styles.cartInfo}>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
            <Text style={styles.cartLabel}>articles</Text>
          </View>
          <Text style={styles.cartTotal}>{cartTotal.toFixed(3)} TND</Text>
          <TouchableOpacity style={styles.orderBtn} onPress={handleOrder} disabled={orderLoading}>
            {orderLoading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.orderBtnText}>Commander →</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backArrow: { color: COLORS.text, fontSize: 28, fontWeight: '300', marginRight: 12 },
  headerInfo: { flex: 1 },
  merchantName: { color: COLORS.text, fontSize: 18, fontWeight: '600' },
  merchantCategory: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  listContent: { paddingBottom: 120 },
  sectionHeader: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: { color: COLORS.green, fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  productInfo: { flex: 1, marginRight: 12 },
  productName: { color: COLORS.text, fontSize: 15, fontWeight: '500' },
  productDesc: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  productPrice: { color: COLORS.green, fontSize: 14, fontWeight: '600', marginTop: 4 },
  qtyControl: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { color: COLORS.green, fontSize: 18, fontWeight: '600' },
  disabled: { opacity: 0.3 },
  qtyText: { color: COLORS.text, fontSize: 15, fontWeight: '600', marginHorizontal: 12, minWidth: 20, textAlign: 'center' },
  orderForm: { padding: 20 },
  formLabel: { color: COLORS.textMuted, fontSize: 13, marginBottom: 6, marginTop: 12 },
  textInput: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cartBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: COLORS.green,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: COLORS.green,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  cartInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  cartBadge: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  cartBadgeText: { color: COLORS.green, fontWeight: '700', fontSize: 13 },
  cartLabel: { color: '#FFF', fontSize: 14 },
  cartTotal: { color: '#FFF', fontWeight: '700', fontSize: 16, marginRight: 16 },
  orderBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  orderBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
