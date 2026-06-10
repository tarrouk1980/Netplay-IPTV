import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image, StyleSheet,
  Dimensions, Animated, RefreshControl, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import hotelAPI from '../../services/hotelService';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { key: 'all', label: 'Tous' },
  { key: 'tunisie', label: 'Tunisie' },
  { key: 'international', label: 'International' },
  { key: '5stars', label: '5★' },
  { key: 'resort', label: 'Resort' },
];

const SORT_OPTIONS = [
  { key: 'discount', label: 'Remise %' },
  { key: 'price_asc', label: 'Prix ↑' },
  { key: 'expiry', label: 'Expiration' },
];

function formatCountdown(expiryTs) {
  const diff = Math.max(0, expiryTs - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s, expired: diff === 0 };
}

export default function FlashDealsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [deals, setDeals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('discount');
  const [tick, setTick] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const headerCountdown = useRef({ h: 23, m: 59, s: 59 });

  useEffect(() => { loadDeals(); }, []);

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]));
    loop.start();
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => { loop.stop(); clearInterval(interval); };
  }, []);

  useEffect(() => {
    applyFilters(deals, category, sortBy);
  }, [deals, category, sortBy]);

  async function loadDeals() {
    setLoading(true);
    try {
      const res = await hotelAPI.getFlashDeals();
      setDeals(res.data?.data || []);
    } catch {}
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadDeals();
    setRefreshing(false);
  }

  function applyFilters(data, cat, sort) {
    let result = [...data];
    if (cat !== 'all') {
      if (cat === 'tunisie') result = result.filter(d => d.country === 'Tunisie');
      else if (cat === 'international') result = result.filter(d => d.country !== 'Tunisie');
      else if (cat === '5stars') result = result.filter(d => d.stars === 5);
      else if (cat === 'resort') result = result.filter(d => d.category === 'RESORT');
    }
    switch (sort) {
      case 'discount': result.sort((a, b) => b.discountPct - a.discountPct); break;
      case 'price_asc': result.sort((a, b) => a.newPrice - b.newPrice); break;
      case 'expiry': result.sort((a, b) => a.expiryTs - b.expiryTs); break;
    }
    setFiltered(result);
  }

  function renderDeal({ item }) {
    const { h, m, s, expired } = formatCountdown(item.expiryTs);
    return (
      <TouchableOpacity
        style={styles.dealCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('HotelDetail', { hotelId: item.hotelId })}
      >
        <View style={styles.dealImageWrap}>
          <Image source={{ uri: item.image }} style={styles.dealImage} resizeMode="cover" />
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discountPct}%</Text>
          </View>
          <View style={styles.providerBadge}>
            <Text style={styles.providerText}>{item.providerName}</Text>
          </View>
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.dealImgGrad} />
        </View>

        <View style={styles.dealBody}>
          <View style={styles.dealTitleRow}>
            <Text style={styles.dealName} numberOfLines={1}>{item.hotelName}</Text>
            <View style={styles.starsRow}>
              {Array.from({ length: item.stars }).map((_, si) => (
                <Ionicons key={si} name="star" size={10} color="#F5A623" />
              ))}
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color="#A0AEC0" />
            <Text style={styles.locationText}>{item.city}, {item.country}</Text>
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.originalPrice}>{item.originalPrice} TND</Text>
              <Text style={styles.newPrice}>{item.newPrice} TND</Text>
              <Text style={styles.perNight}>par nuit</Text>
            </View>
            <View style={styles.rightCol}>
              {!expired ? (
                <View style={styles.countdownBox}>
                  <Ionicons name="time" size={12} color="#E53E3E" />
                  <Text style={styles.countdownText}>
                    Expire dans {String(h).padStart(2,'0')}h {String(m).padStart(2,'0')}m {String(s).padStart(2,'0')}s
                  </Text>
                </View>
              ) : (
                <Text style={styles.expiredText}>Expiré</Text>
              )}
              <TouchableOpacity
                style={[styles.ctaBtn, expired && styles.ctaBtnDisabled]}
                disabled={expired}
                onPress={() => navigation.navigate('HotelDetail', { hotelId: item.hotelId })}
              >
                <LinearGradient colors={expired ? ['#CBD5E0','#CBD5E0'] : ['#FF6B35','#e85520']} style={styles.ctaBtnGrad}>
                  <Text style={styles.ctaBtnText}>Saisir l'offre</Text>
                  <Ionicons name="flash" size={14} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Header countdown (24h from load time)
  const headerH = String(Math.max(0, 23 - Math.floor(tick / 3600))).padStart(2, '0');
  const headerM = String(Math.max(0, 59 - Math.floor((tick % 3600) / 60))).padStart(2, '0');
  const headerS = String(Math.max(0, 59 - (tick % 60))).padStart(2, '0');

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#1a0000', '#8B0000', '#CC2200']} style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <View style={styles.heroHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Text style={styles.heroTitle}>⚡ OFFRES FLASH</Text>
          </Animated.View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.countdownBanner}>
          <Ionicons name="timer-outline" size={18} color="#FFD700" />
          <Text style={styles.countdownBannerLabel}>Se termine dans:</Text>
          <Text style={styles.countdownBannerTime}>{headerH}:{headerM}:{headerS}</Text>
        </View>

        {/* Category Chips */}
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={c => c.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 4 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, category === item.key && styles.chipActive]}
              onPress={() => setCategory(item.key)}
            >
              <Text style={[styles.chipText, category === item.key && styles.chipTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </LinearGradient>

      {/* Sort row */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Trier par:</Text>
        {SORT_OPTIONS.map(s => (
          <TouchableOpacity key={s.key} style={[styles.sortChip, sortBy === s.key && styles.sortChipActive]} onPress={() => setSortBy(s.key)}>
            <Text style={[styles.sortChipText, sortBy === s.key && styles.sortChipTextActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.countBadge}>{filtered.length} offres</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderDeal}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35']} />}
        extraData={tick}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="flash-off-outline" size={48} color="#CBD5E0" />
              <Text style={styles.emptyText}>Aucune offre dans cette catégorie</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingBottom: 16 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 14 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 8 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#FFD700', letterSpacing: 1 },
  countdownBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, marginHorizontal: 16, marginBottom: 14, paddingHorizontal: 14, paddingVertical: 10 },
  countdownBannerLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', flex: 1 },
  countdownBannerTime: { color: '#FFD700', fontSize: 20, fontWeight: '900', fontVariant: ['tabular-nums'] },
  chip: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  chipActive: { backgroundColor: '#FFD700' },
  chipText: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 13 },
  chipTextActive: { color: '#1A0000' },
  sortRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', gap: 6, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  sortLabel: { fontSize: 12, color: '#718096', fontWeight: '600' },
  sortChip: { backgroundColor: '#F7FAFC', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  sortChipActive: { backgroundColor: '#FF6B35' },
  sortChipText: { fontSize: 11, fontWeight: '700', color: '#4A5568' },
  sortChipTextActive: { color: '#fff' },
  countBadge: { marginLeft: 'auto', fontSize: 12, color: '#A0AEC0', fontWeight: '600' },
  dealCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  dealImageWrap: { position: 'relative' },
  dealImage: { width: '100%', height: 180 },
  dealImgGrad: { ...StyleSheet.absoluteFillObject },
  discountBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#E53E3E', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  discountText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  providerBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  providerText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  dealBody: { padding: 14 },
  dealTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  dealName: { flex: 1, fontSize: 16, fontWeight: '800', color: '#1A202C', marginRight: 8 },
  starsRow: { flexDirection: 'row', gap: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  locationText: { fontSize: 12, color: '#718096' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  originalPrice: { fontSize: 13, color: '#A0AEC0', textDecorationLine: 'line-through' },
  newPrice: { fontSize: 26, fontWeight: '900', color: '#E53E3E' },
  perNight: { fontSize: 11, color: '#718096' },
  rightCol: { alignItems: 'flex-end', gap: 8 },
  countdownBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF5F5', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  countdownText: { fontSize: 11, fontWeight: '700', color: '#E53E3E' },
  expiredText: { fontSize: 12, color: '#A0AEC0', fontWeight: '600' },
  ctaBtn: { borderRadius: 12, overflow: 'hidden' },
  ctaBtnDisabled: { opacity: 0.5 },
  ctaBtnGrad: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10 },
  ctaBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: '#A0AEC0', fontSize: 15, fontWeight: '600' },
});
