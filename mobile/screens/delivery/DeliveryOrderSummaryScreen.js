import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  surfaceLight: '#2A2A3A',
  primary: '#FF6B35',
  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
  border: '#2E2E40',
  success: '#4CAF50',
  warning: '#FF9800',
};

const MOCK_ORDER = {
  merchant: {
    name: 'Burger Palace',
    rating: 4.5,
    reviewCount: 128,
  },
  address: '12 Avenue Habib Bourguiba, Tunis 1001',
  estimatedTime: '35-45 min',
  items: [
    { id: '1', name: 'Burger Classic', quantity: 2, unitPrice: 12.5 },
    { id: '2', name: 'Frites Maison', quantity: 2, unitPrice: 4.0 },
    { id: '3', name: 'Coca-Cola 33cl', quantity: 3, unitPrice: 2.5 },
    { id: '4', name: 'Sauce BBQ', quantity: 1, unitPrice: 1.0 },
  ],
  deliveryFee: 3.5,
  discount: 2.0,
  promoCode: 'EASY10',
};

function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {Array(full).fill(null).map((_, i) => (
        <Text key={`f${i}`} style={styles.starFull}>★</Text>
      ))}
      {half && <Text style={styles.starHalf}>½</Text>}
      {Array(empty).fill(null).map((_, i) => (
        <Text key={`e${i}`} style={styles.starEmpty}>☆</Text>
      ))}
    </View>
  );
}

export default function DeliveryOrderSummaryScreen({ navigation, route }) {
  const order = route.params?.order || MOCK_ORDER;

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const total = subtotal + order.deliveryFee - (order.discount || 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Récapitulatif de commande</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.merchantRow}>
            <Text style={styles.merchantName}>{order.merchant.name}</Text>
            <View style={styles.ratingRow}>
              <Stars rating={order.merchant.rating} />
              <Text style={styles.ratingCount}>({order.merchant.reviewCount})</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🏠</Text>
            <Text style={styles.sectionTitle}>Adresse de livraison</Text>
          </View>
          <Text style={styles.addressText}>{order.address}</Text>
          <View style={styles.timeRow}>
            <Text style={styles.timeIcon}>⏱</Text>
            <Text style={styles.timeText}>Temps estimé : {order.estimatedTime}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Articles commandés</Text>
          {order.items.map((item) => {
            const lineTotal = item.quantity * item.unitPrice;
            return (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQty}>x{item.quantity} × {item.unitPrice.toFixed(3)} TND</Text>
                </View>
                <Text style={styles.itemTotal}>{lineTotal.toFixed(3)} TND</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Détail des frais</Text>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Sous-total</Text>
            <Text style={styles.feeValue}>{subtotal.toFixed(3)} TND</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Frais de livraison</Text>
            <Text style={styles.feeValue}>{order.deliveryFee.toFixed(3)} TND</Text>
          </View>
          {order.discount > 0 && (
            <View style={styles.feeRow}>
              <Text style={styles.feeLabelDiscount}>
                Remise promo {order.promoCode ? `(${order.promoCode})` : ''}
              </Text>
              <Text style={styles.feeValueDiscount}>-{order.discount.toFixed(3)} TND</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.feeRow}>
            <Text style={styles.totalLabel}>Total à payer</Text>
            <Text style={styles.totalValue}>{total.toFixed(3)} TND</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.modifyButton} onPress={() => navigation.goBack()}>
          <Text style={styles.modifyButtonText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() => navigation.navigate('DeliveryTracking')}
        >
          <Text style={styles.confirmButtonText}>Confirmer la commande</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  merchantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  merchantName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starFull: {
    color: '#FFD700',
    fontSize: 16,
  },
  starHalf: {
    color: '#FFD700',
    fontSize: 16,
  },
  starEmpty: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  ratingCount: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  addressText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  timeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  timeText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  itemQty: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  itemTotal: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  feeLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  feeValue: {
    color: COLORS.text,
    fontSize: 14,
  },
  feeLabelDiscount: {
    color: COLORS.success,
    fontSize: 14,
  },
  feeValueDiscount: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  totalLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modifyButton: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modifyButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
