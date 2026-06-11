import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Image,
  StyleSheet, StatusBar, FlatList, Dimensions, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import hotelAPI from '../../services/hotelService';

const { width } = Dimensions.get('window');

const QUICK_FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'Marruecos', label: 'Marruecos 🇲🇦' },
  { key: 'Argelia', label: 'Argelia 🇩🇿' },
  { key: 'Tunez', label: 'Túnez 🇹🇳' },
  { key: 'Egipto', label: 'Egipto 🇪🇬' },
];

const DESTINATIONS = [
  { city: 'Marrakech', country: 'Marruecos', image: 'https://picsum.photos/400/300?random=70' },
  { city: 'Casablanca', country: 'Marruecos', image: 'https://picsum.photos/400/300?random=71' },
  { city: 'Argel', country: 'Argelia', image: 'https://picsum.photos/400/300?random=72' },
  { city: 'Orán', country: 'Argelia', image: 'https://picsum.photos/400/300?random=73' },
  { city: 'Túnez', country: 'Túnez', image: 'https://picsum.photos/400/300?random=74' },
  { city: 'El Cairo', country: 'Egipto', image: 'https://picsum.photos/400/300?random=75' },
];

export default function HotelSearchScreenES({ navigation }) {
  const insets = useSafeAreaInsets();
  const [destination, setDestination] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [featured, setFeatured] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [trending, setTrending] = useState([]);
  const [quickFilter, setQuickFilter] = useState('all');
  const [guestModalVisible, setGuestModalVisible] = useState(false);
  const suggestTimeout = useRef(null);
  const flashPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadFeatured();
    loadFlashDeals();
    loadTrending();
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(flashPulse, { toValue: 1.06, duration: 700, useNativeDriver: true }),
      Animated.timing(flashPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]));
    loop.start();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCheckIn(formatDate(today));
    setCheckOut(formatDate(tomorrow));
    return () => loop.stop();
  }, []);

  function formatDate(d) {
    return d.toISOString().split('T')[0];
  }

  function formatDisplayDate(str) {
    if (!str) return '';
    const d = new Date(str);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }

  async function loadFeatured() {
    try {
      const res = await hotelAPI.getFeatured();
      setFeatured(res.data?.data || []);
    } catch {}
  }

  async function loadFlashDeals() {
    try {
      const res = await hotelAPI.getFlashDeals();
      setFlashDeals((res.data?.data || []).slice(0, 4));
    } catch {}
  }

  async function loadTrending() {
    try {
      const res = await hotelAPI.getTrending();
      setTrending(res.data?.data || []);
    } catch {}
  }

  function handleQuickFilter(key) {
    setQuickFilter(key);
    const destMap = {
      Marruecos: 'Marrakech',
      Argelia: 'Argel',
      Tunez: 'Túnez',
      Egipto: 'El Cairo',
    };
    const dest = destMap[key];
    if (dest) navigation.navigate('HotelResults', { destination: dest, checkIn, checkOut, guests });
  }

  function onDestinationChange(text) {
    setDestination(text);
    clearTimeout(suggestTimeout.current);
    if (text.length >= 2) {
      suggestTimeout.current = setTimeout(async () => {
        try {
          const res = await hotelAPI.autocomplete(text);
          setSuggestions(res.data?.data || []);
        } catch {}
      }, 300);
    } else {
      setSuggestions([]);
    }
  }

  function handleSearch() {
    if (!destination.trim()) return;
    navigation.navigate('HotelResults', { destination, checkIn, checkOut, guests });
  }

  function handleDestinationTap(city) {
    setDestination(city);
    setSuggestions([]);
    navigation.navigate('HotelResults', { destination: city, checkIn, checkOut, guests });
  }

  function adjustCheckIn(dir) {
    const d = new Date(checkIn);
    d.setDate(d.getDate() + dir);
    if (d >= new Date()) {
      setCheckIn(formatDate(d));
      const dOut = new Date(checkOut);
      if (d >= dOut) {
        const next = new Date(d);
        next.setDate(next.getDate() + 1);
        setCheckOut(formatDate(next));
      }
    }
  }

  function adjustCheckOut(dir) {
    const d = new Date(checkOut);
    d.setDate(d.getDate() + dir);
    const dIn = new Date(checkIn);
    if (d > dIn) setCheckOut(formatDate(d));
  }

  const nights = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000));

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <LinearGradient
          colors={['#004E89', '#1a6eac', '#FF6B35']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroTagline}>Comparador de precios para la diáspora magrebí</Text>
              <Text style={styles.heroTitle}>¿A dónde vas?</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('HotelFavorites')} style={styles.favBtn}>
              <Ionicons name="heart" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Search Card */}
          <View style={styles.searchCard}>
            <View style={styles.inputGroup}>
              <Ionicons name="search" size={18} color="#FF6B35" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Destino, hotel..."
                placeholderTextColor="#A0AEC0"
                value={destination}
                onChangeText={onDestinationChange}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
              {destination.length > 0 && (
                <TouchableOpacity onPress={() => { setDestination(''); setSuggestions([]); }}>
                  <Ionicons name="close-circle" size={18} color="#A0AEC0" />
                </TouchableOpacity>
              )}
            </View>

            {suggestions.length > 0 && (
              <View style={styles.suggestions}>
                {suggestions.map((s, i) => (
                  <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => handleDestinationTap(s.label)}>
                    <Ionicons name={s.type === 'hotel' ? 'bed-outline' : 'location-outline'} size={16} color="#718096" />
                    <View style={{ marginLeft: 8 }}>
                      <Text style={styles.suggestionLabel}>{s.label}</Text>
                      <Text style={styles.suggestionSub}>{s.sublabel}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Dates */}
            <View style={styles.datesRow}>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>LLEGADA</Text>
                <View style={styles.dateControl}>
                  <TouchableOpacity onPress={() => adjustCheckIn(-1)} style={styles.dateArrow}>
                    <Ionicons name="chevron-back" size={16} color="#004E89" />
                  </TouchableOpacity>
                  <View style={styles.dateCenter}>
                    <Ionicons name="calendar-outline" size={14} color="#FF6B35" />
                    <Text style={styles.dateValue}>{formatDisplayDate(checkIn)}</Text>
                  </View>
                  <TouchableOpacity onPress={() => adjustCheckIn(1)} style={styles.dateArrow}>
                    <Ionicons name="chevron-forward" size={16} color="#004E89" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.nightsBadge}>
                <Text style={styles.nightsText}>{nights}</Text>
                <Text style={styles.nightsLabel}>noche{nights > 1 ? 's' : ''}</Text>
              </View>

              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>SALIDA</Text>
                <View style={styles.dateControl}>
                  <TouchableOpacity onPress={() => adjustCheckOut(-1)} style={styles.dateArrow}>
                    <Ionicons name="chevron-back" size={16} color="#004E89" />
                  </TouchableOpacity>
                  <View style={styles.dateCenter}>
                    <Ionicons name="calendar-outline" size={14} color="#FF6B35" />
                    <Text style={styles.dateValue}>{formatDisplayDate(checkOut)}</Text>
                  </View>
                  <TouchableOpacity onPress={() => adjustCheckOut(1)} style={styles.dateArrow}>
                    <Ionicons name="chevron-forward" size={16} color="#004E89" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Guests */}
            <TouchableOpacity style={styles.guestsRow} onPress={() => setGuestModalVisible(true)}>
              <Ionicons name="people-outline" size={18} color="#FF6B35" />
              <Text style={styles.guestsText}>{guests} viajero{guests > 1 ? 's' : ''}</Text>
              <Ionicons name="chevron-down" size={16} color="#A0AEC0" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#EBF8FF', borderRadius: 10, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: '#004E89' }}
                onPress={() => navigation.navigate('CountrySelect', { checkIn, checkOut, guests })}
              >
                <Ionicons name="globe-outline" size={16} color="#004E89" />
                <Text style={{ color: '#004E89', fontWeight: '700', fontSize: 13 }}>Elegir país</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#FFF5F0', borderRadius: 10, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: '#FF6B35' }}
                onPress={() => navigation.navigate('CulturalFilters', { checkIn, checkOut, guests })}
              >
                <Ionicons name="moon-outline" size={16} color="#FF6B35" />
                <Text style={{ color: '#FF6B35', fontWeight: '700', fontSize: 13 }}>Filtros halal</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
              <LinearGradient colors={['#FF6B35', '#e85520']} style={styles.searchBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="search" size={20} color="#fff" />
                <Text style={styles.searchBtnText}>Buscar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Guest Modal */}
        {guestModalVisible && (
          <View style={styles.guestModalOverlay}>
            <TouchableOpacity style={styles.guestModalBg} onPress={() => setGuestModalVisible(false)} />
            <View style={styles.guestModal}>
              <Text style={styles.guestModalTitle}>Viajeros</Text>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <TouchableOpacity key={n} style={[styles.guestOption, guests === n && styles.guestOptionActive]} onPress={() => { setGuests(n); setGuestModalVisible(false); }}>
                  <Ionicons name="person" size={16} color={guests === n ? '#FF6B35' : '#718096'} />
                  <Text style={[styles.guestOptionText, guests === n && { color: '#FF6B35' }]}>{n} viajero{n > 1 ? 's' : ''}</Text>
                  {guests === n && <Ionicons name="checkmark" size={16} color="#FF6B35" style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Quick Filters */}
        <View style={styles.section}>
          <FlatList
            horizontal
            data={QUICK_FILTERS}
            keyExtractor={f => f.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.qfChip, quickFilter === item.key && styles.qfChipActive]}
                onPress={() => handleQuickFilter(item.key)}
              >
                <Text style={[styles.qfChipText, quickFilter === item.key && styles.qfChipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Destinations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinos populares</Text>
          <View style={styles.destGrid}>
            {DESTINATIONS.map((dest, i) => (
              <TouchableOpacity key={i} style={styles.destCard} onPress={() => handleDestinationTap(dest.city)}>
                <Image source={{ uri: dest.image }} style={styles.destImage} resizeMode="cover" />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.destOverlay}>
                  <Text style={styles.destCity}>{dest.city}</Text>
                  <Text style={styles.destCountry}>{dest.country}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Halal banner */}
        <TouchableOpacity
          style={{ marginHorizontal: 16, marginBottom: 16, borderRadius: 16, overflow: 'hidden' }}
          onPress={() => navigation.navigate('CulturalFilters', { checkIn, checkOut, guests })}
          activeOpacity={0.88}
        >
          <LinearGradient colors={['#004E89', '#1a6eac', '#FF6B35']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="moon" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Filtros Halal & Familia</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 }}>Sin alcohol, burkini, sala de oración, Ramadán...</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Featured */}
        {featured.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Hoteles recomendados</Text>
              <TouchableOpacity onPress={() => navigation.navigate('HotelResults', { destination: '', checkIn, checkOut, guests })}>
                <Text style={styles.seeAll}>Ver todo</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={featured}
              keyExtractor={h => h.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.featuredCard} onPress={() => navigation.navigate('HotelDetail', { hotelId: item.id, checkIn, checkOut, guests })}>
                  <Image source={{ uri: item.mainImage }} style={styles.featuredImage} resizeMode="cover" />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.featuredOverlay}>
                    <Text style={styles.featuredName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.featuredCity}>{item.city}</Text>
                    <View style={styles.featuredPriceRow}>
                      <Text style={styles.featuredPrice}>Desde {item.bestOffer?.discountedPrice} €</Text>
                      <View style={styles.featuredStars}>
                        {Array.from({ length: item.stars }).map((_, si) => (
                          <Ionicons key={si} name="star" size={10} color="#F5A623" />
                        ))}
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Flash Deals */}
        {flashDeals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Animated.Text style={[styles.sectionTitle, { transform: [{ scale: flashPulse }] }]}>⚡ Ofertas Flash</Animated.Text>
              <TouchableOpacity onPress={() => navigation.navigate('FlashDeals')}>
                <Text style={styles.seeAll}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={flashDeals}
              keyExtractor={d => d.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.flashCard} onPress={() => navigation.navigate('HotelDetail', { hotelId: item.hotelId })}>
                  <Image source={{ uri: item.image }} style={styles.flashImage} resizeMode="cover" />
                  <View style={styles.flashDiscBadge}>
                    <Text style={styles.flashDiscText}>-{item.discountPct}%</Text>
                  </View>
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.flashGrad} />
                  <View style={styles.flashContent}>
                    <Text style={styles.flashName} numberOfLines={1}>{item.hotelName}</Text>
                    <View style={styles.flashPriceRow}>
                      <Text style={styles.flashOrig}>{item.originalPrice} €</Text>
                      <Text style={styles.flashNew}>{item.newPrice} €</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Trending */}
        {trending.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Destinos de moda 🔥</Text>
              <TouchableOpacity onPress={() => navigation.navigate('HotelResults', { destination: '', checkIn, checkOut, guests })}>
                <Text style={styles.seeAll}>Ver todo</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={trending.slice(0, 5)}
              keyExtractor={h => h.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.trendCard} onPress={() => navigation.navigate('HotelDetail', { hotelId: item.id, checkIn, checkOut, guests })}>
                  <Image source={{ uri: item.mainImage }} style={styles.trendImage} resizeMode="cover" />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={StyleSheet.absoluteFill} />
                  {item.trendBadge && (
                    <View style={styles.trendBadge}>
                      <Text style={styles.trendBadgeText}>{item.trendBadge}</Text>
                    </View>
                  )}
                  <View style={styles.trendContent}>
                    <Text style={styles.trendName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.trendCity}>{item.city}</Text>
                    <Text style={styles.trendPrice}>Desde {item.bestPrice} €</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Trip Planner */}
        <TouchableOpacity style={styles.tripPlannerBtn} onPress={() => navigation.navigate('TripPlanner')}>
          <LinearGradient colors={['#004E89', '#1a6eac']} style={styles.tripPlannerGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="map-outline" size={22} color="#fff" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.tripPlannerTitle}>Planificar un viaje</Text>
              <Text style={styles.tripPlannerSub}>Multi-destinos · Calcula tu presupuesto</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Hotelier banner */}
        <TouchableOpacity
          onPress={() => navigation.navigate('HotelManager')}
          style={{ margin: 16, backgroundColor: '#004E89', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>💼 Publica tu hotel</Text>
            <Text style={{ color: '#a0c4e8', fontSize: 12, marginTop: 2 }}>Gestiona tu visibilidad en EasyHotels</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FF6B35" />
        </TouchableOpacity>

        {/* PRO Banner */}
        <TouchableOpacity style={styles.proBanner} onPress={() => navigation.navigate('EasyHotelsPro')} activeOpacity={0.85}>
          <LinearGradient colors={['#1A1A3E', '#004E89']} style={styles.proBannerGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.proBannerText}>⚡ Hazte PRO — Ofertas exclusivas 24h antes que todos</Text>
            <Ionicons name="chevron-forward" size={16} color="#FF6B35" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Chatbot FAB */}
      <TouchableOpacity style={styles.chatbotFAB} onPress={() => navigation.navigate('HotelChatbot')} activeOpacity={0.85}>
        <LinearGradient colors={['#FF6B35', '#e85520']} style={styles.chatbotFABGrad}>
          <Text style={{ fontSize: 22 }}>🤖</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingBottom: 30, paddingHorizontal: 16 },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  heroTagline: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginBottom: 4 },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '900', lineHeight: 34 },
  favBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8 },
  searchCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8, borderWidth: 1.5, borderColor: '#E2E8F0' },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: '#2D3748', fontWeight: '500' },
  suggestions: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8, overflow: 'hidden' },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F7FAFC' },
  suggestionLabel: { fontSize: 14, fontWeight: '600', color: '#2D3748' },
  suggestionSub: { fontSize: 12, color: '#718096' },
  datesRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  dateBox: { flex: 1, backgroundColor: '#F7FAFC', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  dateLabel: { fontSize: 10, color: '#A0AEC0', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  dateControl: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateArrow: { padding: 2 },
  dateCenter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateValue: { fontSize: 13, fontWeight: '700', color: '#2D3748' },
  nightsBadge: { backgroundColor: '#FF6B35', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6, alignItems: 'center' },
  nightsText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  nightsLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '600' },
  guestsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F7FAFC', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 12, borderWidth: 1.5, borderColor: '#E2E8F0' },
  guestsText: { fontSize: 14, color: '#2D3748', fontWeight: '500' },
  searchBtn: { borderRadius: 14, overflow: 'hidden' },
  searchBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  searchBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  guestModalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  guestModalBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  guestModal: { position: 'absolute', top: '30%', left: 40, right: 40, backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 15 },
  guestModalTitle: { fontSize: 17, fontWeight: '800', color: '#1A202C', marginBottom: 14 },
  guestOption: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F7FAFC' },
  guestOptionActive: { backgroundColor: '#FFF5F0', borderRadius: 10, paddingHorizontal: 8, marginHorizontal: -8 },
  guestOptionText: { fontSize: 15, color: '#4A5568', fontWeight: '500' },
  section: { paddingTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1A202C', paddingHorizontal: 16, marginBottom: 14 },
  seeAll: { fontSize: 14, color: '#FF6B35', fontWeight: '700' },
  destGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, gap: 6 },
  destCard: { width: (width - 32) / 3, height: 100, borderRadius: 14, overflow: 'hidden' },
  destImage: { width: '100%', height: '100%' },
  destOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 8 },
  destCity: { color: '#fff', fontWeight: '800', fontSize: 13 },
  destCountry: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
  featuredCard: { width: 200, height: 240, borderRadius: 16, overflow: 'hidden' },
  featuredImage: { width: '100%', height: '100%' },
  featuredOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 12 },
  featuredName: { color: '#fff', fontWeight: '800', fontSize: 14, lineHeight: 18 },
  featuredCity: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginVertical: 3 },
  featuredPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featuredPrice: { color: '#FF6B35', fontWeight: '800', fontSize: 13, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  featuredStars: { flexDirection: 'row', gap: 1 },
  qfChip: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: '#E2E8F0' },
  qfChipActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  qfChipText: { fontSize: 13, fontWeight: '700', color: '#4A5568' },
  qfChipTextActive: { color: '#fff' },
  flashCard: { width: 160, height: 190, borderRadius: 14, overflow: 'hidden' },
  flashImage: { width: '100%', height: '100%' },
  flashDiscBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: '#E53E3E', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  flashDiscText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  flashGrad: { ...StyleSheet.absoluteFillObject },
  flashContent: { position: 'absolute', bottom: 10, left: 10, right: 10 },
  flashName: { color: '#fff', fontWeight: '800', fontSize: 12, marginBottom: 4 },
  flashPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flashOrig: { color: 'rgba(255,255,255,0.65)', fontSize: 10, textDecorationLine: 'line-through' },
  flashNew: { color: '#FFD700', fontWeight: '900', fontSize: 14 },
  trendCard: { width: 150, height: 190, borderRadius: 14, overflow: 'hidden' },
  trendImage: { width: '100%', height: '100%' },
  trendBadge: { position: 'absolute', top: 10, left: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  trendBadgeText: { color: '#FFD700', fontSize: 10, fontWeight: '700' },
  trendContent: { position: 'absolute', bottom: 10, left: 10, right: 10 },
  trendName: { color: '#fff', fontWeight: '800', fontSize: 13 },
  trendCity: { color: 'rgba(255,255,255,0.75)', fontSize: 10, marginVertical: 2 },
  trendPrice: { color: '#FF6B35', fontWeight: '800', fontSize: 12, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1, alignSelf: 'flex-start' },
  tripPlannerBtn: { margin: 16, marginBottom: 0, borderRadius: 16, overflow: 'hidden' },
  tripPlannerGrad: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  tripPlannerTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  tripPlannerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  proBanner: { margin: 16, marginTop: 0, borderRadius: 12, overflow: 'hidden' },
  proBannerGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12 },
  proBannerText: { color: '#fff', fontSize: 12, fontWeight: '700', flex: 1 },
  chatbotFAB: { position: 'absolute', bottom: 28, right: 20, width: 58, height: 58, borderRadius: 29, overflow: 'hidden', shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 },
  chatbotFABGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
