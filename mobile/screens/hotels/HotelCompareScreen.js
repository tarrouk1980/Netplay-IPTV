import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
  Dimensions, ActivityIndicator, StatusBar, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import hotelAPI from '../../services/hotelService';

const { width } = Dimensions.get('window');
const COL_WIDTH = Math.max(120, (width - 120) / 3);

const COMPARE_ROWS = [
  { key: 'price', label: 'Prix /nuit', type: 'price' },
  { key: 'stars', label: 'Étoiles', type: 'stars' },
  { key: 'rating', label: 'Note voyageurs', type: 'rating' },
  { key: 'category', label: 'Catégorie', type: 'text' },
  { key: 'freeCancellation', label: 'Annulation gratuite', type: 'bool' },
  { key: 'breakfast', label: 'Petit-déjeuner inclus', type: 'bool' },
  { key: 'pool', label: 'Piscine', type: 'bool' },
  { key: 'wifi', label: 'WiFi', type: 'bool' },
  { key: 'spa', label: 'Spa', type: 'bool' },
  { key: 'parking', label: 'Parking', type: 'bool' },
  { key: 'restaurant', label: 'Restaurant', type: 'bool' },
];

function hasAmenity(hotel, keyword) {
  return hotel.amenities?.some(a => a.toLowerCase().includes(keyword.toLowerCase())) || false;
}

function buildCompareData(hotel, offer) {
  return {
    price: offer?.pricePerNight || 0,
    stars: hotel.stars || 0,
    rating: hotel.rating || 0,
    category: hotel.category || '—',
    freeCancellation: offer?.isFreeCancellation || false,
    breakfast: offer?.includesBreakfast || false,
    pool: hasAmenity(hotel, 'piscine') || hasAmenity(hotel, 'pool'),
    wifi: hasAmenity(hotel, 'wifi'),
    spa: hasAmenity(hotel, 'spa'),
    parking: hasAmenity(hotel, 'parking'),
    restaurant: hasAmenity(hotel, 'restaurant'),
  };
}

export default function HotelCompareScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { hotelIds = [], checkIn, checkOut, guests = 2 } = route.params || {};
  const [hotels, setHotels] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({ inputRange: [0, 60], outputRange: [0, 1], extrapolate: 'clamp' });

  const ci = checkIn || new Date().toISOString().split('T')[0];
  const co = checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0];

  useEffect(() => { loadHotels(); }, []);

  async function loadHotels() {
    setLoading(true);
    try {
      const results = await Promise.all(
        hotelIds.map(id => hotelAPI.getById(id, { checkIn: ci, checkOut: co, guests }))
      );
      const loadedHotels = results.map(r => r.data?.data || {});
      setHotels(loadedHotels);
      setOffers(loadedHotels.map(h => (h.priceOffers || [])[0] || null));
    } catch (e) {
      console.warn('Compare load error:', e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#FF6B35" />
      <Text style={{ color: '#718096', marginTop: 12, fontWeight: '600' }}>Chargement de la comparaison...</Text>
    </View>
  );

  const compareData = hotels.map((h, i) => buildCompareData(h, offers[i]));
  const prices = compareData.map(d => d.price).filter(p => p > 0);
  const minPrice = Math.min(...prices);
  const maxRating = Math.max(...compareData.map(d => d.rating));

  function renderCellValue(row, hotelIdx) {
    const data = compareData[hotelIdx];
    const val = data[row.key];

    if (row.type === 'price') {
      const isMin = val === minPrice && val > 0;
      return (
        <View style={[styles.priceCell, isMin && styles.priceCellBest]}>
          <Text style={[styles.priceText, isMin && styles.priceTextBest]}>{val} TND</Text>
          {isMin && <Text style={styles.priceBestLabel}>Meilleur prix</Text>}
        </View>
      );
    }
    if (row.type === 'stars') {
      return (
        <View style={styles.starsRow}>
          {Array.from({ length: 5 }).map((_, si) => (
            <Ionicons key={si} name={si < val ? 'star' : 'star-outline'} size={13} color={si < val ? '#F5A623' : '#CBD5E0'} />
          ))}
        </View>
      );
    }
    if (row.type === 'rating') {
      const isMax = val === maxRating;
      return (
        <View style={[styles.ratingBadge, isMax && styles.ratingBadgeBest]}>
          <Text style={[styles.ratingText, isMax && styles.ratingTextBest]}>{val?.toFixed(1)}</Text>
        </View>
      );
    }
    if (row.type === 'bool') {
      return val
        ? <View style={styles.boolTrue}><Ionicons name="checkmark" size={16} color="#38A169" /></View>
        : <View style={styles.boolFalse}><Ionicons name="close" size={16} color="#E53E3E" /></View>;
    }
    return <Text style={styles.cellText}>{val || '—'}</Text>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="light-content" />

      {/* Sticky floating header (appears on scroll) */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity, paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.stickyBack}>
          <Ionicons name="arrow-back" size={22} color="#1A202C" />
        </TouchableOpacity>
        <View style={styles.stickyHotels}>
          {hotels.map((h, i) => (
            <Image key={i} source={{ uri: h.mainImage }} style={styles.stickyThumb} />
          ))}
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <LinearGradient colors={['#004E89', '#1a6eac']} style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comparer les hôtels</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        {/* Hotel Thumbnails */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbsScroll}>
          <View style={{ flexDirection: 'row', paddingLeft: 100 }}>
            {hotels.map((h, i) => (
              <View key={i} style={[styles.thumbCard, { width: COL_WIDTH }]}>
                <Image source={{ uri: h.mainImage }} style={styles.thumbImage} />
                <Text style={styles.thumbName} numberOfLines={2}>{h.name}</Text>
                <View style={styles.thumbStarsRow}>
                  {Array.from({ length: h.stars || 0 }).map((_, si) => (
                    <Ionicons key={si} name="star" size={10} color="#F5A623" />
                  ))}
                </View>
                <View style={[styles.thumbRatingBadge, { backgroundColor: (h.rating || 0) >= 9 ? '#276749' : (h.rating || 0) >= 8 ? '#2B6CB0' : '#C05621' }]}>
                  <Text style={styles.thumbRatingText}>{(h.rating || 0).toFixed(1)}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Compare Table */}
        {COMPARE_ROWS.map((row, rowIdx) => (
          <View key={row.key} style={[styles.tableRow, rowIdx % 2 === 0 && styles.tableRowEven]}>
            <View style={styles.rowLabel}>
              <Text style={styles.rowLabelText}>{row.label}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row' }}>
                {hotels.map((_, colIdx) => (
                  <View key={colIdx} style={[styles.tableCell, { width: COL_WIDTH }]}>
                    {renderCellValue(row, colIdx)}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        ))}

        {/* Choose Buttons */}
        <View style={styles.chooseRow}>
          <View style={styles.chooseRowLabel} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row' }}>
              {hotels.map((h, i) => (
                <View key={i} style={{ width: COL_WIDTH, padding: 8 }}>
                  <TouchableOpacity
                    style={styles.chooseBtn}
                    onPress={() => navigation.navigate('HotelDetail', { hotelId: h.id, checkIn: ci, checkOut: co, guests })}
                  >
                    <LinearGradient colors={['#FF6B35', '#e85520']} style={styles.chooseBtnGrad}>
                      <Text style={styles.chooseBtnText}>Choisir</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={{ height: 30 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  stickyHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    backgroundColor: '#fff',
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
  },
  stickyBack: { padding: 4, marginRight: 12 },
  stickyHotels: { flexDirection: 'row', gap: 8 },
  stickyThumb: { width: 36, height: 36, borderRadius: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 20 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  thumbsScroll: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  thumbCard: { padding: 12, alignItems: 'center' },
  thumbImage: { width: COL_WIDTH - 24, height: 90, borderRadius: 12, marginBottom: 8 },
  thumbName: { fontSize: 12, fontWeight: '700', color: '#1A202C', textAlign: 'center', lineHeight: 16, marginBottom: 4 },
  thumbStarsRow: { flexDirection: 'row', gap: 2, marginBottom: 6 },
  thumbRatingBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  thumbRatingText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  tableRow: { flexDirection: 'row', minHeight: 52, alignItems: 'center', backgroundColor: '#fff' },
  tableRowEven: { backgroundColor: '#F7FAFC' },
  rowLabel: { width: 100, paddingLeft: 12, paddingRight: 4 },
  rowLabelText: { fontSize: 12, fontWeight: '600', color: '#4A5568', lineHeight: 16 },
  tableCell: { alignItems: 'center', justifyContent: 'center', padding: 8, minHeight: 52 },
  priceCell: { backgroundColor: '#F7FAFC', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  priceCellBest: { backgroundColor: '#F0FFF4', borderWidth: 1.5, borderColor: '#38A169' },
  priceText: { fontSize: 14, fontWeight: '800', color: '#2D3748' },
  priceTextBest: { color: '#276749' },
  priceBestLabel: { fontSize: 9, color: '#38A169', fontWeight: '700', marginTop: 2 },
  starsRow: { flexDirection: 'row', gap: 2 },
  ratingBadge: { backgroundColor: '#EDF2F7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  ratingBadgeBest: { backgroundColor: '#276749' },
  ratingText: { fontSize: 14, fontWeight: '800', color: '#2D3748' },
  ratingTextBest: { color: '#fff' },
  boolTrue: { backgroundColor: '#F0FFF4', borderRadius: 20, padding: 4 },
  boolFalse: { backgroundColor: '#FFF5F5', borderRadius: 20, padding: 4 },
  cellText: { fontSize: 12, fontWeight: '600', color: '#4A5568', textAlign: 'center' },
  chooseRow: { flexDirection: 'row', paddingVertical: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EDF2F7' },
  chooseRowLabel: { width: 100 },
  chooseBtn: { borderRadius: 12, overflow: 'hidden' },
  chooseBtnGrad: { paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  chooseBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
