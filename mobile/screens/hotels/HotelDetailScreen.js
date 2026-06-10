import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
  Dimensions, FlatList, ActivityIndicator, Linking, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StarRating from '../../components/hotels/StarRating';
import RatingBadge from '../../components/hotels/RatingBadge';
import PriceComparisonBar from '../../components/hotels/PriceComparisonBar';
import PriceHistoryChart from '../../components/hotels/PriceHistoryChart';
import WeatherWidget from '../../components/hotels/WeatherWidget';
import NearbyAttractions from '../../components/hotels/NearbyAttractions';
import hotelAPI from '../../services/hotelService';

const { width } = Dimensions.get('window');

const AMENITY_ICONS = {
  'WiFi': 'wifi', 'WiFi Gratuit': 'wifi', 'Piscine': 'water', 'Spa': 'sparkles',
  'Salle de sport': 'barbell', 'Restaurant': 'restaurant', 'Bar': 'wine',
  'Parking': 'car', 'Navette aéroport': 'airplane', 'Plage privée': 'sunny',
  'All-inclusive': 'gift', 'Climatisation': 'thermometer', 'Room service': 'call',
  'Business center': 'briefcase', 'Animation': 'musical-notes', 'Club enfants': 'happy',
  'Tennis': 'tennisball', 'Aquapark': 'water', 'Conciergerie': 'person',
};

function getAmenityIcon(amenity) {
  for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
    if (amenity.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return 'checkmark-circle';
}

function getTravelTypeLabel(t) {
  return { SOLO: 'Voyageur solo', COUPLE: 'En couple', FAMILY: 'En famille', BUSINESS: 'Voyage d\'affaires' }[t] || t;
}

export default function HotelDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { hotelId, checkIn, checkOut, guests = 2 } = route.params || {};
  const [hotel, setHotel] = useState(null);
  const [priceOffers, setPriceOffers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [similarHotels, setSimilarHotels] = useState([]);

  const ci = checkIn || new Date().toISOString().split('T')[0];
  const co = checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nights = Math.max(1, Math.round((new Date(co) - new Date(ci)) / 86400000));

  useEffect(() => { loadHotel(); }, [hotelId]);

  async function loadHotel() {
    setLoading(true);
    try {
      const [detailRes, reviewsRes, similarRes] = await Promise.all([
        hotelAPI.getById(hotelId, { checkIn: ci, checkOut: co, guests }),
        hotelAPI.getReviews(hotelId),
        hotelAPI.getSimilar(hotelId, 4).catch(() => ({ data: { data: [] } })),
      ]);
      const data = detailRes.data?.data || {};
      setHotel(data);
      setPriceOffers(data.priceOffers || []);
      setReviews(reviewsRes.data?.data || []);
      setSimilarHotels(similarRes.data?.data || []);
    } catch (e) {
      console.warn('Hotel detail error:', e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' }}>
      <ActivityIndicator size="large" color="#FF6B35" />
    </View>
  );

  if (!hotel) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#718096' }}>Hôtel introuvable.</Text>
    </View>
  );

  const images = hotel.images?.length ? hotel.images : [hotel.mainImage];
  const bestOffer = priceOffers[0];
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            horizontal
            pagingEnabled
            data={images}
            keyExtractor={(_, i) => String(i)}
            showsHorizontalScrollIndicator={false}
            onScroll={e => setImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={[styles.carouselImage, { width }]} resizeMode="cover" />
            )}
          />
          {/* Gradient overlay */}
          <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent']} style={styles.carouselTopGrad} />
          {/* Actions */}
          <View style={[styles.carouselActions, { top: insets.top + 10 }]}>
            <TouchableOpacity style={styles.carouselBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.carouselBtn}>
                <Ionicons name="share-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.carouselBtn} onPress={() => setIsFavorite(f => !f)}>
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#FF6B35' : '#fff'} />
              </TouchableOpacity>
            </View>
          </View>
          {/* Dots */}
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, i === imageIndex && styles.dotActive]} />
            ))}
          </View>
          {/* Image count */}
          <View style={styles.imageCount}>
            <Ionicons name="camera" size={12} color="#fff" />
            <Text style={styles.imageCountText}>{imageIndex + 1}/{images.length}</Text>
          </View>
        </View>

        {/* Main Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.hotelName}>{hotel.name}</Text>
              <StarRating stars={hotel.stars} size={15} showCount={false} />
              <View style={styles.locationRow}>
                <Ionicons name="location" size={14} color="#FF6B35" />
                <Text style={styles.locationText}>{hotel.address}, {hotel.city}, {hotel.country}</Text>
              </View>
            </View>
            <RatingBadge score={hotel.rating} size="md" showLabel />
          </View>
          <Text style={styles.reviewCount}>{hotel.reviewCount} avis</Text>
        </View>

        {/* Price Comparison (most important section) */}
        <View style={styles.sectionCard}>
          <PriceComparisonBar offers={priceOffers} />
        </View>

        {/* Amenities */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Services & équipements</Text>
          <View style={styles.amenitiesGrid}>
            {hotel.amenities?.map((a, i) => (
              <View key={i} style={styles.amenityItem}>
                <View style={styles.amenityIcon}>
                  <Ionicons name={getAmenityIcon(a) + '-outline'} size={18} color="#FF6B35" />
                </View>
                <Text style={styles.amenityLabel} numberOfLines={2}>{a}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>À propos de l'hôtel</Text>
          <Text style={styles.description}>{hotel.description}</Text>
        </View>

        {/* Reviews */}
        {reviews.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Avis des voyageurs</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <RatingBadge score={hotel.rating} size="sm" showLabel={false} />
                <Text style={styles.ratingLabel}>{hotel.rating?.toFixed(1)} · {hotel.reviewCount} avis</Text>
              </View>
            </View>
            {displayedReviews.map((rev, i) => (
              <View key={rev.id || i} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>{rev.authorName?.[0] || '?'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewAuthor}>{rev.authorName}</Text>
                    <Text style={styles.reviewMeta}>{getTravelTypeLabel(rev.travelType)} · {rev.stayDate ? new Date(rev.stayDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''}</Text>
                  </View>
                  <View style={styles.reviewScore}>
                    <Text style={styles.reviewScoreText}>{rev.rating?.toFixed(1)}</Text>
                  </View>
                </View>
                {rev.title && <Text style={styles.reviewTitle}>{rev.title}</Text>}
                <Text style={styles.reviewComment}>{rev.comment}</Text>
                {rev.pros?.length > 0 && (
                  <View style={styles.reviewProsRow}>
                    <Ionicons name="thumbs-up" size={12} color="#38A169" />
                    <Text style={styles.reviewPros}>{rev.pros.join(' · ')}</Text>
                  </View>
                )}
              </View>
            ))}
            {reviews.length > 3 && (
              <TouchableOpacity style={styles.showMoreReviews} onPress={() => setShowAllReviews(v => !v)}>
                <Text style={styles.showMoreReviewsText}>{showAllReviews ? 'Voir moins' : `Voir tous les ${reviews.length} avis`}</Text>
                <Ionicons name={showAllReviews ? 'chevron-up' : 'chevron-down'} size={16} color="#004E89" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Price History Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Historique des prix</Text>
          <PriceHistoryChart basePrice={bestOffer?.pricePerNight || 300} currency="TND" />
        </View>

        {/* Weather Widget */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Météo à {hotel.city}</Text>
          <WeatherWidget city={hotel.city} />
        </View>

        {/* Nearby Attractions */}
        <View style={styles.card}>
          <NearbyAttractions city={hotel.city} />
        </View>

        {/* Action buttons: Compare, Alert, Calendar */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Outils de recherche</Text>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('HotelCompare', { hotelIds: [hotel.id], checkIn: ci, checkOut: co, guests })}
          >
            <Ionicons name="git-compare-outline" size={20} color="#004E89" />
            <Text style={styles.actionBtnText}>Comparer avec d'autres hôtels</Text>
            <Ionicons name="chevron-forward" size={16} color="#A0AEC0" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnBorder]}
            onPress={() => navigation.navigate('PriceAlert', { hotelId: hotel.id, hotelName: hotel.name, hotelImage: hotel.mainImage, stars: hotel.stars, currentPrice: bestOffer?.pricePerNight })}
          >
            <Ionicons name="notifications-outline" size={20} color="#FF6B35" />
            <Text style={styles.actionBtnText}>Définir une alerte prix</Text>
            <Ionicons name="chevron-forward" size={16} color="#A0AEC0" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnBorder]}
            onPress={() => navigation.navigate('PriceCalendar', { hotelId: hotel.id, guests, hotelName: hotel.name })}
          >
            <Ionicons name="calendar-outline" size={20} color="#38A169" />
            <Text style={styles.actionBtnText}>Voir le calendrier des prix</Text>
            <Ionicons name="chevron-forward" size={16} color="#A0AEC0" />
          </TouchableOpacity>
        </View>

        {/* Similar Hotels */}
        {similarHotels.length > 0 && (
          <View style={{ paddingTop: 16 }}>
            <View style={[styles.cardTitle, { paddingHorizontal: 16, fontSize: 18, fontWeight: '800', color: '#1A202C', marginBottom: 12 }]}>
            </View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#1A202C', paddingHorizontal: 16, marginBottom: 10 }}>Hôtels similaires</Text>
            <FlatList
              horizontal
              data={similarHotels}
              keyExtractor={h => h.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.similarCard}
                  onPress={() => navigation.navigate('HotelDetail', { hotelId: item.id, checkIn: ci, checkOut: co, guests })}
                >
                  <Image source={{ uri: item.mainImage }} style={styles.similarImage} resizeMode="cover" />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={StyleSheet.absoluteFill} />
                  <View style={styles.similarContent}>
                    <Text style={styles.similarName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.similarPrice}>{item.bestPrice} TND</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Location Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Localisation</Text>
          <TouchableOpacity
            style={styles.mapThumbnail}
            onPress={() => Linking.openURL(`https://maps.google.com/?q=${hotel.lat},${hotel.lng}`).catch(() => {})}
          >
            <Image
              source={{ uri: `https://staticmap.openstreetmap.de/staticmap.php?center=${hotel.lat},${hotel.lng}&zoom=14&size=600x200&markers=${hotel.lat},${hotel.lng},red` }}
              style={styles.mapImage}
              resizeMode="cover"
            />
            <View style={styles.mapOverlay}>
              <Ionicons name="navigate" size={20} color="#fff" />
              <Text style={styles.mapOverlayText}>Voir sur la carte</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.locationDetail}>
            <Ionicons name="location" size={16} color="#FF6B35" />
            <Text style={styles.locationDetailText}>{hotel.address}, {hotel.city}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Bottom Bar */}
      {bestOffer && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <View>
            <Text style={styles.bottomBarLabel}>Meilleur prix · {nights} nuit{nights > 1 ? 's' : ''}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              {bestOffer.originalPrice > bestOffer.discountedPrice && (
                <Text style={styles.bottomBarOriginal}>{bestOffer.originalPrice} TND</Text>
              )}
              <Text style={styles.bottomBarPrice}>{bestOffer.discountedPrice} TND</Text>
            </View>
            <Text style={styles.bottomBarProvider}>via {bestOffer.providerName}</Text>
          </View>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => Linking.openURL(bestOffer.deepLink || 'https://example.com').catch(() => {})}
          >
            <Text style={styles.bookBtnText}>Choisir cet hôtel</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: { position: 'relative', height: 280 },
  carouselImage: { height: 280 },
  carouselTopGrad: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  carouselActions: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  carouselBtn: { backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 8 },
  dots: { position: 'absolute', bottom: 14, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { width: 18, backgroundColor: '#fff' },
  imageCount: { position: 'absolute', bottom: 14, right: 14, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  imageCountText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  infoCard: { backgroundColor: '#fff', padding: 16, marginHorizontal: 16, marginTop: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  infoHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  hotelName: { fontSize: 22, fontWeight: '900', color: '#1A202C', marginBottom: 6, lineHeight: 28 },
  locationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginTop: 6 },
  locationText: { flex: 1, fontSize: 13, color: '#718096', lineHeight: 18 },
  reviewCount: { fontSize: 12, color: '#A0AEC0', marginTop: 6 },
  sectionCard: { marginTop: 16 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#1A202C', marginBottom: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  ratingLabel: { fontSize: 13, color: '#718096', fontWeight: '500' },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityItem: { width: '30%', alignItems: 'center', gap: 6 },
  amenityIcon: { backgroundColor: '#FFF5F0', borderRadius: 10, padding: 8 },
  amenityLabel: { fontSize: 11, color: '#4A5568', textAlign: 'center', lineHeight: 14 },
  description: { fontSize: 14, color: '#4A5568', lineHeight: 22 },
  reviewItem: { borderTopWidth: 1, borderTopColor: '#EDF2F7', paddingTop: 14, marginTop: 14 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  reviewAuthor: { fontSize: 14, fontWeight: '700', color: '#2D3748' },
  reviewMeta: { fontSize: 11, color: '#A0AEC0', marginTop: 1 },
  reviewScore: { backgroundColor: '#38A169', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  reviewScoreText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  reviewTitle: { fontSize: 14, fontWeight: '700', color: '#2D3748', marginBottom: 4 },
  reviewComment: { fontSize: 14, color: '#4A5568', lineHeight: 20 },
  reviewProsRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  reviewPros: { fontSize: 12, color: '#38A169', fontStyle: 'italic' },
  showMoreReviews: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, paddingVertical: 8 },
  showMoreReviewsText: { fontSize: 14, color: '#004E89', fontWeight: '600' },
  mapThumbnail: { borderRadius: 12, overflow: 'hidden', height: 140, backgroundColor: '#EDF2F7', marginBottom: 10 },
  mapImage: { width: '100%', height: '100%' },
  mapOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  mapOverlayText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  locationDetail: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  locationDetailText: { flex: 1, fontSize: 13, color: '#4A5568', lineHeight: 18 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  actionBtnBorder: { borderTopWidth: 1, borderTopColor: '#EDF2F7' },
  actionBtnText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#2D3748' },
  similarCard: { width: 160, height: 180, borderRadius: 14, overflow: 'hidden' },
  similarImage: { width: '100%', height: '100%' },
  similarContent: { position: 'absolute', bottom: 10, left: 10, right: 10 },
  similarName: { color: '#fff', fontWeight: '800', fontSize: 12, lineHeight: 16, marginBottom: 4 },
  similarPrice: { color: '#FFD700', fontWeight: '900', fontSize: 13 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#EDF2F7', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  bottomBarLabel: { fontSize: 11, color: '#A0AEC0', fontWeight: '500', marginBottom: 2 },
  bottomBarOriginal: { fontSize: 13, color: '#A0AEC0', textDecorationLine: 'line-through' },
  bottomBarPrice: { fontSize: 24, fontWeight: '900', color: '#FF6B35' },
  bottomBarProvider: { fontSize: 11, color: '#718096', marginTop: 1 },
  bookBtn: { backgroundColor: '#FF6B35', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 6 },
  bookBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
