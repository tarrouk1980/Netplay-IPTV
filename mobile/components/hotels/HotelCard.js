import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StarRating from './StarRating';
import RatingBadge from './RatingBadge';

const PROVIDER_COLORS = {
  BOOKING: '#003580', EXPEDIA: '#FFC107', HOTELS_COM: '#C0392B',
  AIRBNB: '#FF5A5F', DIRECT: '#27AE60',
};

export default function HotelCard({ hotel, onPress, onFavorite, isFavorite }) {
  const { name, city, country, stars, rating, reviewCount, mainImage, bestOffer, amenities } = hotel;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: mainImage }} style={styles.image} resizeMode="cover" />
        <TouchableOpacity style={styles.favoriteBtn} onPress={onFavorite}>
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#FF6B35' : '#fff'} />
        </TouchableOpacity>
        {bestOffer?.dealLabel && (
          <View style={styles.dealBadge}>
            <Text style={styles.dealText}>{bestOffer.dealLabel}</Text>
          </View>
        )}
        {hotel.isFeatured && (
          <View style={[styles.dealBadge, { left: 10, backgroundColor: '#004E89' }]}>
            <Text style={styles.dealText}>⭐ Recommandé</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color="#718096" />
              <Text style={styles.location}>{city}, {country}</Text>
            </View>
            <StarRating stars={stars} size={13} showCount={false} />
          </View>
          <RatingBadge score={rating} size="sm" showLabel={false} />
        </View>

        <View style={styles.amenitiesRow}>
          {amenities?.slice(0, 3).map((a, i) => (
            <View key={i} style={styles.amenityChip}>
              <Text style={styles.amenityText}>{a}</Text>
            </View>
          ))}
        </View>

        <View style={styles.priceSection}>
          <View>
            {bestOffer?.originalPrice > bestOffer?.discountedPrice && (
              <Text style={styles.originalPrice}>{bestOffer.originalPrice} TND</Text>
            )}
            <View style={styles.priceRow}>
              <Text style={styles.price}>{bestOffer?.discountedPrice || '—'}</Text>
              <Text style={styles.priceCurrency}> TND</Text>
              <Text style={styles.perNight}> / nuit</Text>
            </View>
            <View style={styles.providerRow}>
              <View style={[styles.providerBadge, { backgroundColor: PROVIDER_COLORS[bestOffer?.sourceProvider] || '#666' }]}>
                <Text style={styles.providerText}>{bestOffer?.providerLogo}</Text>
              </View>
              <Text style={styles.providerName}>{bestOffer?.providerName}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            {bestOffer?.isFreeCancellation && (
              <View style={styles.freeCancelBadge}>
                <Text style={styles.freeCancelText}>Annulation gratuite</Text>
              </View>
            )}
            {bestOffer?.includesBreakfast && (
              <View style={[styles.freeCancelBadge, { backgroundColor: '#EBF8FF', borderColor: '#3182CE' }]}>
                <Text style={[styles.freeCancelText, { color: '#3182CE' }]}>Petit-déj inclus</Text>
              </View>
            )}
            <TouchableOpacity style={styles.cta} onPress={onPress}>
              <Text style={styles.ctaText}>Voir les offres</Text>
              <Ionicons name="chevron-forward" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, overflow: 'hidden' },
  imageContainer: { position: 'relative', height: 180 },
  image: { width: '100%', height: '100%' },
  favoriteBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 6 },
  dealBadge: { position: 'absolute', bottom: 10, right: 10, backgroundColor: '#FF6B35', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  dealText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  body: { padding: 14 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '700', color: '#1A202C', marginBottom: 3 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 },
  location: { fontSize: 12, color: '#718096' },
  amenitiesRow: { flexDirection: 'row', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
  amenityChip: { backgroundColor: '#EDF2F7', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  amenityText: { fontSize: 11, color: '#4A5568' },
  priceSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#EDF2F7', paddingTop: 10 },
  originalPrice: { fontSize: 12, color: '#A0AEC0', textDecorationLine: 'line-through' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontSize: 22, fontWeight: '800', color: '#FF6B35' },
  priceCurrency: { fontSize: 14, fontWeight: '600', color: '#FF6B35' },
  perNight: { fontSize: 12, color: '#718096' },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  providerBadge: { width: 18, height: 18, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  providerText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  providerName: { fontSize: 11, color: '#718096' },
  freeCancelBadge: { backgroundColor: '#F0FFF4', borderWidth: 1, borderColor: '#68D391', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  freeCancelText: { fontSize: 10, color: '#276749', fontWeight: '600' },
  cta: { backgroundColor: '#FF6B35', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 3 },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
