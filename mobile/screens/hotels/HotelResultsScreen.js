import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Modal, ScrollView, ActivityIndicator, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HotelCard from '../../components/hotels/HotelCard';
import hotelAPI from '../../services/hotelService';

const SORT_OPTIONS = [
  { key: 'RECOMMENDED', label: 'Recommandé' },
  { key: 'price_asc', label: 'Prix ↑' },
  { key: 'price_desc', label: 'Prix ↓' },
  { key: 'stars', label: 'Étoiles' },
  { key: 'rating', label: 'Note' },
];

const STAR_OPTIONS = [2, 3, 4, 5];
const CATEGORY_OPTIONS = ['HOTEL', 'RESORT', 'APARTMENT', 'HOSTEL', 'VILLA'];
const CATEGORY_LABELS = { HOTEL: 'Hôtel', RESORT: 'Resort', APARTMENT: 'Appartement', HOSTEL: 'Auberge', VILLA: 'Villa' };

const CULTURAL_CHIPS = [
  { key: 'isHalalCertified', label: 'Halal', icon: 'moon-outline' },
  { key: 'isAlcoholFree', label: 'Sans Alcool', icon: 'ban-outline' },
  { key: 'isBurkiniAccepted', label: 'Burkini', icon: 'shirt-outline' },
  { key: 'isFamilyConservative', label: 'Famille', icon: 'people-outline' },
  { key: 'isBeachfront', label: 'Plage', icon: 'umbrella-outline' },
  { key: 'isHoneymoonPackage', label: 'Lune de miel', icon: 'heart-outline' },
];

export default function HotelResultsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { destination = '', checkIn = '', checkOut = '', guests = 2 } = route.params || {};

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('RECOMMENDED');
  const [filterModal, setFilterModal] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  const [filters, setFilters] = useState({ stars: null, category: null, minPrice: '', maxPrice: '' });
  const [pendingFilters, setPendingFilters] = useState({ stars: null, category: null, minPrice: '', maxPrice: '' });
  const [culturalFilters, setCulturalFilters] = useState({});

  useEffect(() => { loadHotels(1, true); }, [destination, checkIn, checkOut, guests, sortBy, filters, culturalFilters]);

  async function loadHotels(pageNum = 1, reset = false) {
    if (pageNum === 1) setLoading(true);
    try {
      const params = {
        destination, checkIn, checkOut, guests,
        sortBy,
        page: pageNum, limit: 8,
        ...(filters.stars && { stars: filters.stars }),
        ...(filters.category && { category: filters.category }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...culturalFilters,
      };
      const res = await hotelAPI.search(params);
      const data = res.data?.data || [];
      const meta = res.data?.meta || {};
      setTotal(meta.total || data.length);
      setPage(pageNum);
      setHasMore(pageNum < (meta.totalPages || 1));
      setHotels(reset ? data : prev => [...prev, ...data]);
    } catch (e) {
      console.warn('Hotel search error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onLoadMore() {
    if (!loading && hasMore) loadHotels(page + 1, false);
  }

  function onRefresh() {
    setRefreshing(true);
    loadHotels(1, true);
  }

  function applyFilters() {
    setFilters({ ...pendingFilters });
    setFilterModal(false);
  }

  function clearFilters() {
    const empty = { stars: null, category: null, minPrice: '', maxPrice: '' };
    setPendingFilters(empty);
    setFilters(empty);
    setCulturalFilters({});
    setFilterModal(false);
  }

  function toggleCulturalChip(key) {
    setCulturalFilters(prev => {
      const next = { ...prev };
      if (next[key]) { delete next[key]; } else { next[key] = 'true'; }
      return next;
    });
  }

  function toggleFavorite(hotelId) {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(hotelId) ? next.delete(hotelId) : next.add(hotelId);
      return next;
    });
  }

  const activeFilterCount = [filters.stars, filters.category, filters.minPrice || filters.maxPrice ? 'price' : null].filter(Boolean).length;

  function formatDate(str) {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  const nights = checkIn && checkOut ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000)) : 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1A202C" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchSummary} onPress={() => navigation.goBack()}>
          <View>
            <Text style={styles.searchDest} numberOfLines={1}>{destination || 'Toutes destinations'}</Text>
            <Text style={styles.searchMeta}>{formatDate(checkIn)} – {formatDate(checkOut)} · {guests} voyageur{guests > 1 ? 's' : ''} · {nights} nuit{nights > 1 ? 's' : ''}</Text>
          </View>
          <Ionicons name="pencil" size={16} color="#FF6B35" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>

      {/* Sort Bar */}
      <View style={styles.sortBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
          <TouchableOpacity
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
            onPress={() => { setPendingFilters({ ...filters }); setFilterModal(true); }}
          >
            <Ionicons name="options" size={15} color={activeFilterCount > 0 ? '#fff' : '#4A5568'} />
            <Text style={[styles.filterBtnText, activeFilterCount > 0 && { color: '#fff' }]}>Filtres{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</Text>
          </TouchableOpacity>
          {SORT_OPTIONS.map(s => (
            <TouchableOpacity
              key={s.key}
              style={[styles.sortChip, sortBy === s.key && styles.sortChipActive]}
              onPress={() => setSortBy(s.key)}
            >
              <Text style={[styles.sortChipText, sortBy === s.key && styles.sortChipTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Cultural Chips Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.culturalScroll}>
          <TouchableOpacity
            style={styles.culturalFiltersBtn}
            onPress={() => navigation.navigate('CulturalFilters', { destination, checkIn, checkOut, guests })}
          >
            <Ionicons name="moon" size={13} color="#004E89" />
            <Text style={styles.culturalFiltersBtnText}>Filtres halal &amp; famille </Text>
            <Ionicons name="chevron-forward" size={12} color="#004E89" />
          </TouchableOpacity>
          {CULTURAL_CHIPS.map(chip => {
            const active = !!culturalFilters[chip.key];
            return (
              <TouchableOpacity
                key={chip.key}
                style={[styles.culturalChip, active && styles.culturalChipActive]}
                onPress={() => toggleCulturalChip(chip.key)}
              >
                <Ionicons name={chip.icon} size={13} color={active ? '#fff' : '#4A5568'} />
                <Text style={[styles.culturalChipText, active && { color: '#fff' }]}>{chip.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>{total} hôtel{total !== 1 ? 's' : ''} trouvé{total !== 1 ? 's' : ''}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('HotelMap', { hotels, destination })}>
          <View style={styles.mapToggle}>
            <Ionicons name="map-outline" size={15} color="#004E89" />
            <Text style={styles.mapToggleText}>Carte</Text>
          </View>
        </TouchableOpacity>
      </View>

      {loading && hotels.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Recherche des meilleures offres...</Text>
        </View>
      ) : (
        <FlatList
          data={hotels}
          keyExtractor={h => h.id}
          renderItem={({ item }) => (
            <HotelCard
              hotel={item}
              isFavorite={favorites.has(item.id)}
              onFavorite={() => toggleFavorite(item.id)}
              onPress={() => navigation.navigate('HotelDetail', { hotelId: item.id, checkIn, checkOut, guests })}
            />
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={hasMore ? <ActivityIndicator color="#FF6B35" style={{ marginVertical: 16 }} /> : null}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color="#CBD5E0" />
              <Text style={styles.emptyTitle}>Aucun hôtel trouvé</Text>
              <Text style={styles.emptyText}>Modifiez votre recherche ou effacez les filtres.</Text>
              <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearFilters}>
                <Text style={styles.clearFiltersBtnText}>Effacer les filtres</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        />
      )}

      {/* Filter Modal */}
      <Modal visible={filterModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setFilterModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtres</Text>
            <TouchableOpacity onPress={() => setFilterModal(false)}>
              <Ionicons name="close" size={24} color="#1A202C" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
            <Text style={styles.filterSection}>Étoiles minimum</Text>
            <View style={styles.chipRow}>
              {STAR_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, pendingFilters.stars === s && styles.chipActive]}
                  onPress={() => setPendingFilters(f => ({ ...f, stars: f.stars === s ? null : s }))}
                >
                  <Text style={[styles.chipText, pendingFilters.stars === s && styles.chipTextActive]}>
                    {'★'.repeat(s)} {s}+
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSection}>Type d'hébergement</Text>
            <View style={styles.chipRow}>
              {CATEGORY_OPTIONS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, pendingFilters.category === c && styles.chipActive]}
                  onPress={() => setPendingFilters(f => ({ ...f, category: f.category === c ? null : c }))}
                >
                  <Text style={[styles.chipText, pendingFilters.category === c && styles.chipTextActive]}>{CATEGORY_LABELS[c]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSection}>Fourchette de prix (TND/nuit)</Text>
            <View style={styles.priceInputRow}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                value={pendingFilters.minPrice}
                onChangeText={v => setPendingFilters(f => ({ ...f, minPrice: v }))}
              />
              <Text style={{ color: '#718096', marginHorizontal: 10 }}>—</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                value={pendingFilters.maxPrice}
                onChangeText={v => setPendingFilters(f => ({ ...f, maxPrice: v }))}
              />
              <Text style={{ color: '#718096', marginLeft: 8, fontSize: 13 }}>TND</Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
              <Text style={styles.clearBtnText}>Effacer tout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
              <Text style={styles.applyBtnText}>Appliquer les filtres</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  backBtn: { padding: 6, marginRight: 8 },
  searchSummary: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  searchDest: { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  searchMeta: { fontSize: 11, color: '#718096', marginTop: 1 },
  sortBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  sortScroll: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EDF2F7', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  filterBtnActive: { backgroundColor: '#004E89' },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: '#4A5568' },
  sortChip: { backgroundColor: '#EDF2F7', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  sortChipActive: { backgroundColor: '#FF6B35' },
  sortChipText: { fontSize: 13, fontWeight: '600', color: '#4A5568' },
  sortChipTextActive: { color: '#fff' },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  resultsCount: { fontSize: 14, color: '#718096', fontWeight: '500' },
  mapToggle: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EBF8FF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  mapToggleText: { fontSize: 13, color: '#004E89', fontWeight: '600' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#718096', fontSize: 14 },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#718096', textAlign: 'center', lineHeight: 20 },
  clearFiltersBtn: { marginTop: 20, backgroundColor: '#FF6B35', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  clearFiltersBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1A202C' },
  filterSection: { fontSize: 15, fontWeight: '700', color: '#2D3748', marginBottom: 12, marginTop: 20 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#EDF2F7', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: 'transparent' },
  chipActive: { backgroundColor: '#FFF5F0', borderColor: '#FF6B35' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#4A5568' },
  chipTextActive: { color: '#FF6B35' },
  priceInputRow: { flexDirection: 'row', alignItems: 'center' },
  priceInput: { flex: 1, borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, padding: 10, fontSize: 15, color: '#2D3748' },
  modalFooter: { flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: '#EDF2F7' },
  clearBtn: { flex: 1, backgroundColor: '#EDF2F7', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  clearBtnText: { fontWeight: '700', color: '#4A5568', fontSize: 15 },
  applyBtn: { flex: 2, backgroundColor: '#FF6B35', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  applyBtnText: { fontWeight: '800', color: '#fff', fontSize: 15 },
});
