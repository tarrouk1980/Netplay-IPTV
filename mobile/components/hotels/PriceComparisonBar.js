import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PriceComparisonBar({ offers = [] }) {
  if (!offers.length) return null;
  const minPrice = Math.min(...offers.map(o => o.discountedPrice));
  const maxPrice = Math.max(...offers.map(o => o.discountedPrice));

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Comparer les prix</Text>
      <Text style={styles.subtitle}>Prix pour {offers[0]?.nights || 1} nuit(s) · {offers[0]?.guestsCount || 2} voyageurs</Text>
      {offers.map((offer, idx) => {
        const isBest = offer.isBestPrice;
        const barWidth = maxPrice > minPrice ? ((maxPrice - offer.discountedPrice) / (maxPrice - minPrice)) * 70 + 30 : 100;
        return (
          <View key={offer.id || idx} style={[styles.offerRow, isBest && styles.offerRowBest]}>
            {isBest && (
              <View style={styles.bestBanner}>
                <Ionicons name="trophy" size={10} color="#fff" />
                <Text style={styles.bestBannerText}>MEILLEUR PRIX</Text>
              </View>
            )}
            <View style={styles.offerMain}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <View style={[styles.providerBadge, { backgroundColor: offer.providerColor }]}>
                  <Text style={styles.providerLogo}>{offer.providerLogo}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.providerName}>{offer.providerName}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
                    {offer.isFreeCancellation && (
                      <Text style={styles.badge}>✓ Annulation gratuite</Text>
                    )}
                    {offer.includesBreakfast && (
                      <Text style={[styles.badge, { color: '#3182CE', backgroundColor: '#EBF8FF' }]}>🍳 Petit-déj</Text>
                    )}
                    {offer.dealLabel && (
                      <Text style={[styles.badge, { color: '#FF6B35', backgroundColor: '#FFF5F0' }]}>{offer.dealLabel}</Text>
                    )}
                  </View>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                {offer.originalPrice > offer.discountedPrice && (
                  <Text style={styles.originalPrice}>{offer.originalPrice} TND</Text>
                )}
                <Text style={[styles.price, isBest && { color: '#FF6B35' }]}>{offer.discountedPrice} TND</Text>
                <TouchableOpacity
                  style={[styles.viewBtn, isBest && styles.viewBtnBest]}
                  onPress={() => Linking.openURL(offer.deepLink).catch(() => {})}
                >
                  <Text style={[styles.viewBtnText, isBest && { color: '#fff' }]}>Voir l'offre</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.barContainer}>
              <View style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: isBest ? '#FF6B35' : offer.providerColor + '40' }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A202C', marginBottom: 3 },
  subtitle: { fontSize: 12, color: '#718096', marginBottom: 14 },
  offerRow: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#EDF2F7', overflow: 'hidden' },
  offerRowBest: { borderColor: '#FF6B35', borderWidth: 2, backgroundColor: '#FFF9F6' },
  bestBanner: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FF6B35', alignSelf: 'flex-start', borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  bestBannerText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  offerMain: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  providerBadge: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  providerLogo: { color: '#fff', fontWeight: '800', fontSize: 16 },
  providerName: { fontSize: 13, fontWeight: '600', color: '#2D3748' },
  badge: { fontSize: 10, color: '#276749', backgroundColor: '#F0FFF4', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, overflow: 'hidden' },
  originalPrice: { fontSize: 11, color: '#A0AEC0', textDecorationLine: 'line-through' },
  price: { fontSize: 18, fontWeight: '800', color: '#2D3748' },
  viewBtn: { marginTop: 6, borderWidth: 1.5, borderColor: '#004E89', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  viewBtnBest: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  viewBtnText: { color: '#004E89', fontWeight: '700', fontSize: 12 },
  barContainer: { height: 3, backgroundColor: '#EDF2F7', borderRadius: 2, marginTop: 8 },
  barFill: { height: 3, borderRadius: 2 },
});
