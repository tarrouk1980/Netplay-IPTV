import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useCartStore from '../../store/cartStore';
import { getCurrentLocationWithAddress } from '../../utils/locationUtils';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

const DELIVERY_FEE = 1.5;

export default function GroceryCheckoutReviewScreen({ navigation }) {
  const cartItems = useCartStore((s) => s.items);
  const merchantId = useCartStore((s) => s.merchantId);
  const clearCart = useCartStore((s) => s.clearCart);
  const [codePromo, setCodePromo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoAppliquee, setPromoAppliquee] = useState(false);
  const [erreurPromo, setErreurPromo] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const articles = cartItems.map((i) => ({ id: i.id, nom: i.name, quantite: i.qty, prix: Number(i.price) }));
  const sousTotal = articles.reduce((acc, a) => acc + a.prix * a.quantite, 0);
  const total = sousTotal + DELIVERY_FEE - discount;

  async function appliquerPromo() {
    if (!codePromo.trim()) return;
    setPromoLoading(true);
    try {
      const res = await api.post('/api/promo/apply', { code: codePromo.trim(), serviceType: 'GROCERY', amount: sousTotal + DELIVERY_FEE });
      setDiscount(res.data.discount || 0);
      setPromoAppliquee(true);
      setErreurPromo('');
    } catch {
      setDiscount(0);
      setPromoAppliquee(false);
      setErreurPromo('Code promo invalide ou expiré');
    } finally {
      setPromoLoading(false);
    }
  }

  async function passerCommande() {
    if (articles.length === 0) { Alert.alert('Panier vide', 'Ajoutez des articles avant de commander.'); return; }
    setSubmitting(true);
    try {
      const loc = await getCurrentLocationWithAddress();
      if (!loc) {
        Alert.alert('Localisation requise', 'Activez la localisation pour passer la commande.');
        setSubmitting(false);
        return;
      }
      const res = await api.post('/api/grocery/request', {
        items: articles.map((a) => ({ productId: a.id, price: a.prix, quantity: a.quantite })),
        merchantIds: merchantId ? [merchantId] : undefined,
        deliveryLat: loc.coords.lat,
        deliveryLng: loc.coords.lng,
        deliveryAddress: loc.address,
        promoCode: promoAppliquee ? codePromo.trim() : undefined,
      });
      clearCart();
      navigation.replace('GroceryOrderTracking', { orderId: res.data?.order?.id });
    } catch {
      Alert.alert('Erreur', 'Impossible de passer la commande. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Révision de la commande</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Articles ({articles.length})</Text>
          {articles.length === 0 ? (
            <Text style={{ color: COLORS.muted, fontSize: 13 }}>Votre panier est vide</Text>
          ) : articles.map(a => (
            <View key={a.id} style={styles.articleRow}>
              <View style={styles.articleInfo}>
                <Text style={styles.articleNom}>{a.nom}</Text>
                <Text style={styles.articleQte}>Qté : {a.quantite}</Text>
              </View>
              <Text style={styles.articlePrix}>
                {(a.prix * a.quantite).toFixed(2)} TND
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Code promo</Text>
          <View style={styles.promoRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="Entrer le code"
              placeholderTextColor={COLORS.muted}
              value={codePromo}
              onChangeText={v => { setCodePromo(v); setErreurPromo(''); }}
              autoCapitalize="characters"
              editable={!promoAppliquee}
            />
            <TouchableOpacity style={styles.promoBtn} onPress={appliquerPromo} disabled={promoLoading || promoAppliquee}>
              {promoLoading
                ? <ActivityIndicator color="#000" size="small" />
                : <Text style={styles.promoBtnText}>Appliquer</Text>}
            </TouchableOpacity>
          </View>
          {erreurPromo !== '' && <Text style={styles.promoErreur}>{erreurPromo}</Text>}
          {promoAppliquee && (
            <Text style={styles.promoSucces}>Code appliqué — –{discount.toFixed(2)} TND</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Récapitulatif</Text>
          <View style={styles.ligneFinanciere}>
            <Text style={styles.ligneLabel}>Sous-total</Text>
            <Text style={styles.ligneValeur}>{sousTotal.toFixed(2)} TND</Text>
          </View>
          <View style={styles.ligneFinanciere}>
            <Text style={styles.ligneLabel}>Frais de livraison</Text>
            <Text style={styles.ligneValeur}>{DELIVERY_FEE.toFixed(2)} TND</Text>
          </View>
          {promoAppliquee && (
            <View style={styles.ligneFinanciere}>
              <Text style={styles.ligneLabel}>Réduction promo</Text>
              <Text style={[styles.ligneValeur, { color: '#4CAF50' }]}>
                -{discount.toFixed(2)} TND
              </Text>
            </View>
          )}
          <View style={[styles.ligneFinanciere, styles.ligneTotalSep]}>
            <Text style={styles.ligneTotalLabel}>Total</Text>
            <Text style={styles.ligneTotalValeur}>{total.toFixed(2)} TND</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payerBtn, submitting && { opacity: 0.6 }]}
          onPress={passerCommande}
          disabled={submitting || articles.length === 0}
        >
          {submitting
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.payerBtnText}>Commander — {total.toFixed(2)} TND</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    paddingRight: 12,
  },
  backArrow: {
    color: COLORS.text,
    fontSize: 28,
    lineHeight: 28,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    padding: 16,
    paddingBottom: 24,
    gap: 14,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  articleInfo: {
    flex: 1,
  },
  articleNom: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  articleQte: {
    color: COLORS.muted,
    fontSize: 12,
  },
  articlePrix: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  promoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
  },
  promoBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  promoBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  promoErreur: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 6,
  },
  promoSucces: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  ligneFinanciere: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ligneLabel: {
    color: COLORS.muted,
    fontSize: 14,
  },
  ligneValeur: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  ligneTotalSep: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 0,
  },
  ligneTotalLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  ligneTotalValeur: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  payerBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payerBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});
